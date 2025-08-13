import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import User from "../model/user.model.js"
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/config.js"

export const signUp = async (req, res, next) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const {name, email, password} = req.body

        if (!name || !email || !password) {return res.status(400).json({success: false, message: "Name, email, and password are required."})}

        const existingUser = await User.findOne({email})

        if (existingUser){
            return res.status(409).json({
                sucess: false,
                message: "User already exists."
            })
        }

        const salt = await bcrypt.genSalt(10)
        const encryptedPassword = await bcrypt.hash(password, salt)

        const newUser = await User.create([{name, email, password: encryptedPassword}], {session})

        const token = jwt.sign({userId: newUser[0]._id}, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN})

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
            token,
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
                message: "Invalid credentials."
            })
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });

        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin
        }

        res.status(200).json({
            success: true, 
            token, 
            user: userResponse
        })
    } catch (error) {
        next(error)
    }
}