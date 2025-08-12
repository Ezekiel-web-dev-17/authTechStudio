import { Router } from "express";
import { getPost } from "../controllers/post.controller.js";
import { admin } from "../middleware/admin.middleware.js";

const postRoute = Router()

postRoute.get("/", admin, getPost)
postRoute.post("/create", (req, res) => {
    res.send("Create posts here.")
})
postRoute.patch("/edit", (req, res) => {res.send("Posts edited successfully.")})
postRoute.put("/update", (req, res) => {
  res.send("Post altered successfully.")  
})
postRoute.delete("/", (req, res) => {
    res.send("Post deleted successfully.")
})

export default postRoute