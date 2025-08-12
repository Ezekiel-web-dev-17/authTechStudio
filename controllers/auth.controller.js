import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import User from "../model/user.model.js"
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/config.js"

export const signUp = async (req, res, next) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const {name, email, password} = req.body

        if (!name || !email || !password) {return res.status(400).json({success: false, message: "Ensure that no field is empty."})}

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

        const token = jwt.sign({userId: newUser[0].id}, JWT_SECRET, JWT_EXPIRES_IN)

        session.commitTransaction()
        session.endSession()

        res.status(201).json({
            success: true,
            token,
            user: newUser
        })
        
     } catch (error) {
        session.abortTransaction()
        session.endSession()
        next(error)
    }
}

export const signIn = async (req, res, next) => {
    try {
        const {email, password} = req.body

        if (!email || !password) {
         const error = new Error(`${!email ? "email" : "password"} field is empty.`);
         error.statusCode = 409;
          throw error;
        }

        const user = await User.findOne({email})

        if (!user) {
         const error = new Error("User not found. Sign up.");
         error.statusCode = 404;
         throw error;
        }

        const validPassword = await bcrypt.compare(password, user.password)

        if (!validPassword) {
         const error = new Error("Invalid Password!.");
         error.statusCode = 401;
         throw error;
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });

        res.status(200).json({success: true, data: {token, user}})
    } catch (error) {
        next(error)
    }
}