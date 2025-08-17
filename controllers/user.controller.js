import bcrypt from "bcryptjs";
import { User } from "../model/user.model.js";

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const identity = id.slice(1);

    if (!identity) {
      const error = new Error("User id is required!");
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findById(identity).select("-password");

    if (!user) {
      const error = new Error("User not found!");
      error.statusCode = 404;
      throw error;
    }

    if (user._id !== identity) {
      return res.status(400).json({
        success: false,
        message: "You can only view your own profile.",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name && !email && !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "At least one of the fields must be provided.",
        });
    }

    if (req.params.id.slice(1) !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own profile.",
      });
    }

    if (password.length < 8) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Password must be at least 8 characters.",
        });
    }

    const updateData = {
      ...(name && { name }),
      ...(email && { email }),
    };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const editedUser = await User.findByIdAndUpdate(
      req.params.id.slice(1),
      updateData,
      { new: true, runValidators: true }
    ).select("-password");
    if (!editedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    res.status(200).json({ success: true, user: editedUser });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id.slice(1));

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    await User.findByIdAndDelete(id.slice(1));

    res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
