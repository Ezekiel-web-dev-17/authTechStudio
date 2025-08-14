import { Router } from "express";
import { logout, refreshToken, signIn, signUp } from "../controllers/auth.controller.js";
import { authorize } from "../middleware/auth.middleware.js";
import { validateSignIn, validateSignUp } from "../middleware/error.middleware.js";

const authRouter = Router()

authRouter.post("/sign-up", validateSignUp, signUp)
authRouter.post("/sign-in", validateSignIn, signIn)
authRouter.post("/refresh-token", refreshToken)
authRouter.post("/logout", authorize, logout)

export default authRouter