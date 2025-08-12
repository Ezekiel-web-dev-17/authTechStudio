import express from "express"
import postRoute from "./routes/post.routes.js"
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.route.js";
import { PORT } from "./config/config.js";
import { connectToDatabase } from "./database/connect.js";
import { authorize } from "./middleware/auth.middleware.js";
import errorMiddleware from "./middleware/error.middleware.js";
import authRouter from "./routes/auth.route.js";
import arcjetMiddleware from "./middleware/arcjet.middleware.js";

const app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(arcjetMiddleware)

app.use(authorize)
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/posts", postRoute)
app.use("/api/v1/users", userRoutes)
app.use(errorMiddleware)

app.listen(PORT, async () => {
    console.log("Connecting to server...")
    await connectToDatabase()
    console.log(`Server is running on http://localhost:${PORT}`)
})