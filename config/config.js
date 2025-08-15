import { config } from "dotenv";
config({path: ".env"})

export const {PORT, DB_URI, JWT_SECRET, JWT_REFRESH_SECRET, JWT_EXPIRES_IN, ARCJET_KEY} = process.env