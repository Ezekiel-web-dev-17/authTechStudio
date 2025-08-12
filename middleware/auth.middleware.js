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
             message: "Unauthorized."
         })
     }
     
     const decodeToken = jwt.verify(token, JWT_SECRET)
     
     const user = await User.findById(decodeToken)
     
     if (!user) {
         return res.status(401).json({
             success: false,
             message: "Unauthorized."
         })
     }
 
     req.user = user;
     
     next();
   } catch (error) {
    res.status(401).json({
        success: false,
        message: "Unauthorized.",
        error: error.message
    })
   }
}