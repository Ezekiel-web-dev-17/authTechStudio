import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { JWT_EXPIRES_IN, JWT_REFRESH_SECRET, JWT_SECRET } from "../config/config.js";
import { User } from "../model/user.model.js";

// Generate tokens
const generateTokens = async (user) => {
    const payload = { userId: user._id, tokenVersion: user.tokenVersion };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ ...payload, type: "refresh" }, JWT_REFRESH_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    return { accessToken, refreshToken, refreshTokenHash };
};

export const signUp = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { name, email, password, isAdmin } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);

    const [newUser] = await User.create(
      [{
        name,
        email,
        password: encryptedPassword,
        isAdmin: !!isAdmin,
        refreshTokens: []
      }],
      { session }
    );

    const { accessToken, refreshToken, refreshTokenHash } = await generateTokens(newUser);

    // Store hashed refresh token (with createdAt for good measure)
    newUser.refreshTokens.push({ tokenHash: refreshTokenHash, createdAt: new Date() });
    await newUser.save({ session });

    await session.commitTransaction();
    session.endSession();

    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      isAdmin: newUser.isAdmin
    };

    res.status(201).json({ success: true, accessToken, refreshToken, user: userResponse });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: `${!email ? "Email" : "Password"} field is required.`
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const decryptPassword = await bcrypt.compare(password, user.password);
    if (!decryptPassword) {
      return res.status(401).json({ success: false, message: "Invalid password!" });
    }

    const { accessToken, refreshToken, refreshTokenHash } = await generateTokens(user);

    // Ensure array exists, push hashed token, trim to last 5
    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push({ tokenHash: refreshTokenHash, createdAt: new Date() });
    
    let matchIndex = -1;
    for (let i = 0; i < user.refreshTokens.length; i++) {
      const match = await bcrypt.compare(refreshToken, user.refreshTokens[i].tokenHash);
      if (match) { matchIndex = i; break; }
    }
    if (matchIndex === -1) {
      return res.status(401).json({ success: false, message: "Refresh token not recognized" });
    }

    // Rotate token: remove old, add new
    user.refreshTokens.splice(matchIndex, 1);
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }

    await user.save();

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    };

    res.status(200).json({ success: true, accessToken, refreshToken, user: userResponse });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "Refresh token required." });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
      if (decoded.type !== "refresh") {
        return res.status(401).json({ success: false, message: "Invalid token type." });
      }
    } catch (error) {
     return next(error)
    }

    // Check if user exists
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    // Find matching stored hash
    let matchIndex = -1;
    for (let i = 0; i < user.refreshTokens.length; i++) {
      const match = await bcrypt.compare(refreshToken, user.refreshTokens[i].tokenHash);
      if (match) { matchIndex = i; break; }
    }
    if (matchIndex === -1) {
      return res.status(401).json({ success: false, message: "Refresh token not recognized" });
    }

    // Rotate token: remove old, add new
    user.refreshTokens.splice(matchIndex, 1);
    const { accessToken, refreshToken: newRefreshToken, refreshTokenHash: newHash } = await generateTokens(user);
    user.refreshTokens.push({ tokenHash: newHash, createdAt: new Date() });
     if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }
    await user.save();

    res.status(200).json({ success: true, accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    next(error);
  }
};

// Logout - invalidate refresh token
export const logout = async (req, res, next) => {
  try {
   const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Remove the refresh token from list
    const keptTokens = [];
    for (const rt of user.refreshTokens) {
      const isMatch = await bcrypt.compare(req.body.refreshToken, rt.tokenHash);
      if (!isMatch) keptTokens.push(rt);
    }
    user.refreshTokens = keptTokens;


    // Increment tokenVersion to invalidate all old access tokens
    user.tokenVersion += 1;
    await user.save();

    res.status(200).json({ success: true, message: "Logged out successfully. Access revoked." });
  } catch (error) {
    next(error);
  }
};
