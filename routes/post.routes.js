import { Router } from "express";
import {
  createPost,
  deletePost,
  getPost,
  updatePost,
  updateViews,
  deletePostByAdmin,
} from "../controllers/post.controller.js";
import { admin } from "../middleware/admin.middleware.js";
import { authorize } from "../middleware/auth.middleware.js";

const postRoute = Router();

postRoute.get("/", getPost);
postRoute.post("/create", authorize, createPost);
postRoute.patch("/edit/:id", authorize, updatePost);
// postRoute.put("/update/:id", authorize, postPut)
postRoute.put("/views/:id", updateViews);
postRoute.delete("/delete/:id", authorize, deletePost);
postRoute.delete("/admin/delete/:id", admin, deletePostByAdmin);

export default postRoute;
