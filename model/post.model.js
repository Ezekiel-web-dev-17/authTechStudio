import mongoose, { Schema } from "mongoose";

const postSchema = new Schema({
    by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "by field is required."],
        trim: true,
    },

    title: {
        type: String,
        required: [true, "Post title is Required"],
        uppercase: true,
        minLength: 3,
        maxLength: 30
    },

    content: {
        type: String,
        required: true,
        minLength: 2
    },

    views: {
        type: Number,
        default: 0
    }
}, {timestamps: true})

const Post = mongoose.model("Post", postSchema)
export default Post