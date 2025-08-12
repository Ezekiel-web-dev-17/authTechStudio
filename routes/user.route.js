import { Router } from "express";
import { getUsers } from "../controllers/user.controller.js";
import { authorize } from "../middleware/auth.middleware.js";

const userRoutes = Router()

userRoutes.get("/", authorize, getUsers)

export default userRoutes