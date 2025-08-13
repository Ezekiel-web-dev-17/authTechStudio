import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: [true, "User Name is required"],
        minLength: 2,
        maxLength: 30
    },

    email: {
        type: String,
        lowercase: true,
        trim: true,
        unique: true,
        required: [true, "User email is required."],
        match: [/\S+@\S+\.\S+/, "Please fill a valid email address"],
    },

    password: {
        type: String,
        required: [true, "User password is required."],
        minLength: 4
    },

    isAdmin: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

const User = mongoose.model("User", userSchema)
export default User