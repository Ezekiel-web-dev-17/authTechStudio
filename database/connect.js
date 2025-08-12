import mongoose from "mongoose";
import { DB_URI } from "../config/config.js";

if (!DB_URI) {
      throw new Error(
    "Please define the MONGODB_URI environment variable inside .env file."
  );
}

export const connectToDatabase = async () => {
    try {
        await mongoose.connect(DB_URI)
        console.log("Successfully connected to database.")
    } catch (error) {
        console.error("Error connecting to Mongo Database.", error);
        process.exit(1)
    }
}