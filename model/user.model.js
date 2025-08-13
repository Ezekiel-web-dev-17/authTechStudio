import mongoose, { Schema } from "mongoose";

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
        required: [true, "User email is required."], match: [/\S+@\S+\.\S+/, "Please fill a valid email address"],
        maxLength: [100, "Email must not exceed 100 characters"],
    },

    password: {
        type: String,
        required: [true, "User password is required."],
        minLength: [8, "Password must be at least 8 characters"],
        maxLength: [128, "Password must not exceed 128 characters"],
        select: false, // Don't include in queries by default
    },

    isAdmin: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    // Add schema-level validation
    toJSON: {
        transform: function(doc, ret) {
            delete ret.password; // Never return password in JSON
            return ret;
        }
    }
})

const User = mongoose.model("User", userSchema)
export default User