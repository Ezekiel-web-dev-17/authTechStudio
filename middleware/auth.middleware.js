import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/config.js";
import { User } from "../model/user.model.js";

const accessTokenReq = (res) => {
    return res.status(401).json({
        success: false,
        message: "Access token required.",
    })
}

export const authorize = async(req, res, next) => {
   try {
     let token;
 
     if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
         token = req.headers.authorization.split(" ")[1]
     }
 
     if (!token) {
        return accessTokenReq(res)
     }
     
     try {
         const decodeToken = jwt.verify(token, JWT_SECRET)

        if (!decodeToken) { 
            return accessTokenReq(res)
        }

        const user = await User.findById(decodeToken.userId);        
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid token - user not found."
            })
        }
        
        if (decodeToken.tokenVersion !== user.tokenVersion) {
          return res.status(401).json({ success: false, message: "Logged out already." });
        }

        req.user = user;
        next();
         
     } catch (jwtError) {
         if (jwtError.name === 'TokenExpiredError') {
             return res.status(401).json({
                 success: false,
                 message: "Token has expired. Please login again.",
                 expiredAt: jwtError.expiredAt
             })
         }
         
         if (jwtError.name === 'JsonWebTokenError') {
             return res.status(401).json({
                 success: false,
                 message: "Invalid token format or signature.",
             })
         }
         
         if (jwtError.name === 'NotBeforeError') {
             return res.status(401).json({
                 success: false,
                 message: "Token not active yet.",
             })
         }
         
         throw jwtError;
     }     
   } catch (error) {
    return res.status(401).json({
        success: false,
        message: "Authentication failed.",
        error: error.message
    })
   }
}

export const conditionalAuth = (req, res, next) => {
    // Skip auth for sign-up and sign-in routes
    if (req.path === '/api/v1/auth/sign-up' || req.path === '/api/v1/auth/sign-in') {
        return next();
    }

    if (req.method === 'GET' && req.path === '/api/v1/posts/') {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next(); 
        }
    }

    // Apply auth to all other routes
    return authorize(req, res, next);
}