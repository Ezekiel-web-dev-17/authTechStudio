import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/config.js";
import User from "../model/user.model.js"

export const authorize = async(req, res, next) => {
   try {
     let token;
 
     if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
         token = req.headers.authorization.split(" ")[1]
     }
 
     if (!token) {
         return res.status(401).json({
             success: false,
             message: "Access token required."
         })
     }
     
     const decodeToken = jwt.verify(token, JWT_SECRET)
     
     const user = await User.findById(decodeToken.userId)
     
     if (!user) {
         return res.status(401).json({
             success: false,
             message: "Invalid token - user not found."
         })
     }
 
     req.user = user;
     
     next();
   } catch (error) {
    return res.status(401).json({
        success: false,
        message: "Invalid or expired token.",
        error: error.message
    })
   }
}

export const conditionalAuth = (req, res, next) => {
    // Skip auth for sign-up and sign-in routes
    if (req.path === '/api/v1/auth/sign-up' || req.path === '/api/v1/auth/sign-in') {
        return next();
    }
    // Apply auth to all other routes
    return authorize(req, res, next);
}