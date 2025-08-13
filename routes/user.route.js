import { Router } from "express";
import { deleteUser, getUserById, getUsers, updateUser } from "../controllers/user.controller.js";
import { admin } from "../middleware/admin.middleware.js";
import { authorize } from "../middleware/auth.middleware.js";

const userRoutes = Router()

userRoutes.get("/", admin, authorize, getUsers)
userRoutes.get("/:id", authorize, getUserById)
userRoutes.patch("/edit/:id", authorize, updateUser)
userRoutes.delete("/delete/:id", admin, authorize, deleteUser)

export default userRoutes