import mongoose, { Schema } from "mongoose";
import { JWT_EXPIRES_IN } from "../config/config.js";

const refreshTokenSchema = new Schema({
    tokenHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: JWT_EXPIRES_IN }
});

const userSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: [true, "User Name is required"],
        minLength: [2, "Name must be at least 2 characters"],
        maxLength: [30, "Name must not exceed 30 characters"],
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        unique: true,
        required: [true, "User email is required."],
        match: [/\S+@\S+\.\S+/, "Please fill a valid email address"],
        maxLength: [100, "Email must not exceed 100 characters"],
    },
    password: {
        type: String,
        required: [true, "User password is required."],
        minLength: [8, "Password must be at least 8 characters"],
        maxLength: [128, "Password must not exceed 128 characters"],
        select: false,
    },
    isAdmin: { type: Boolean, default: false },
    tokenVersion: { type: Number, default: 0 }, 
    refreshTokens: [refreshTokenSchema]
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            delete ret.password;
            delete ret.refreshTokens;
            return ret;
        }
    }
});

export const User = mongoose.model("User", userSchema);
