import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import User from "../model/user.model.js"
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/config.js"

// Generate tokens
const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '5h' }) // Short-lived
    const refreshToken = jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
    
    return { accessToken, refreshToken }
}

export const signUp = async (req, res, next) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const {name, email, password, isAdmin} = req.body

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false, 
                message: "Name, email, and password are required."
            })
        }

        const existingUser = await User.findOne({email})

        if (existingUser){
            return res.status(409).json({
                success: false,
                message: "User already exists."
            })
        }

        const salt = await bcrypt.genSalt(10)
        const encryptedPassword = await bcrypt.hash(password, salt)

        const newUser = await User.create([{
            name, 
            email, 
            password: encryptedPassword, 
            isAdmin: isAdmin ? true : false,
            refreshTokens: []
        }], {session})

        const { accessToken, refreshToken } = generateTokens(newUser[0]._id)

        // Store refresh token
        newUser[0].refreshTokens.push({ token: refreshToken })
        await newUser[0].save({ session })

        await session.commitTransaction()
        session.endSession()

        const userResponse = {
            _id: newUser[0]._id,
            name: newUser[0].name,
            email: newUser[0].email,
            isAdmin: newUser[0].isAdmin
        }

        res.status(201).json({
            success: true,
            accessToken,
            refreshToken,
            user: userResponse
        })
       
        
     } catch (error) {
        await session.abortTransaction()
        session.endSession()
        next(error)
    }
}

export const signIn = async (req, res, next) => {
    try {
        const {email, password} = req.body

        if (!email || !password) {
         return res.status(400).json({
                success: false,
                message: `${!email ? "Email" : "Password"} field is required.`
            })
        }

        const user = await User.findOne({email}).select("+password")

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials."
            })
        }

        const decryptPassword = await bcrypt.compare(password, user.password)

        if (!decryptPassword) {
             return res.status(401).json({
                success: false,
                message: "Invalid password!"
            })
        }

        const { accessToken, refreshToken } = generateTokens(user._id)

        // Store refresh token
         user.refreshTokens = user.refreshTokens || []
        user.refreshTokens.push({ token: refreshToken })
        
        // Limit to 5 refresh tokens per user
        if (user.refreshTokens.length > 5) {
            user.refreshTokens = user.refreshTokens.slice(-5)
        }
        
        await user.save()

        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin
        }

        res.status(200).json({
            success: true, 
            accessToken,
            refreshToken, 
            user: userResponse
        })
    } catch (error) {
        next(error)
    }
}

export const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token required."
            })
        }

        // Verify refresh token
        let decoded
        try {
            decoded = jwt.verify(refreshToken, JWT_SECRET)

             if (decoded.type !== 'refresh') {
                return res.status(401).json({
                    success: false,
                    message: "Invalid token type."
                })
            }
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: "Refresh token expired. Please login again.",
                })
            }

            return res.status(401).json({
                success: false,
                message: "Invalid refresh token."
            })
            throw error
        }

        // Check if user exists and token is valid
        const user = await User.findById(decoded.userId)
        if (!user || !user.refreshTokens.find(t => t.token === refreshToken)) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token."
            })
        }

        // Generate new tokens
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id)

        // Replace old refresh token
        user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken)
        user.refreshTokens.push({ token: newRefreshToken })
        await user.save()

        res.status(200).json({
            success: true,
            accessToken,
            refreshToken: newRefreshToken
        })

    } catch (error) {
        next(error)
    }
}

// Logout - invalidate refresh token
export const logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body

        if (refreshToken) {
            const user = await User.findById(req.user._id)
            if (user) {
                user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken)
                await user.save()
            }
        }

        res.status(200).json({
            success: true,
            message: "Logged out successfully."
        })
    } catch (error) {
        next(error)
    }
}
