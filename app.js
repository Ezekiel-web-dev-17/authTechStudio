import express from "express"
import postRoute from "./routes/post.routes.js"
import cors from "cors"
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.route.js";
import { PORT } from "./config/config.js";
import { connectToDatabase } from "./database/connect.js";
import errorMiddleware from "./middleware/error.middleware.js";
import authRouter from "./routes/auth.route.js";
import arcjetMiddleware from "./middleware/arcjet.middleware.js";

import helmet from 'helmet';
import morgan from "morgan";

const app = express()

app.use(cors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', "PUT", "PATCH", 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(morgan("dev"));
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());

app.use(arcjetMiddleware)

app.use("/api/v1/auth", authRouter)
app.use("/api/v1/posts", postRoute)
app.use("/api/v1/users", userRoutes)
app.use(errorMiddleware)

app.listen(PORT, async () => {
    console.log("Connecting to server...")
    await connectToDatabase()
    console.log(`Server is running on http://localhost:${PORT}`)
})
