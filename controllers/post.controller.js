import mongoose from "mongoose"
import Post from "../model/post.model.js"
import User from "../model/user.model.js"

export const getPost = async (req, res, next) => {
    try {
        const posts = await Post.find()
        res.status(200).json({sucess:true, posts})
    } catch (error) {
        next(error)
    }
}

export const createPost = async (req, res, next) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const { title, content, views} = req.body

        if (!title || !content) {
            const error = new Error("Title, and Content fields are required!")
            error.statusCode(400)
            throw error
        }

        const posted = await Post.find(content)

        if (posted) {
            const error = new Error("Post already exists!")
            error.statusCode(409)
            throw error
        }

        const post  = await Post.create({title, content, views}, {session})

        session.commitTransaction()
        session.endSession()

        res.status(201).json({success:true, post})
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        next(error)
    }
}

export const updateViews = async (req, res, next) => {
    try {
        const {id} = req.body

        const post  = await Post.findByIdAndUpdate(id, {views: views + 1})

        if (!post) {
            const error = new Error("Post not found!")
            error.statusCode(404)
            throw error
        }

        res.status(200).json({success: true, message: "Post updated successfully", post})
    } catch (error) {
        next(error)
    }
}

export const updatePost = async(req, res, next) => {
  try {
    const {title, content} = req.body

    if (!title && !content) {
      return res.status(400).json({success: false, message: "At least one of the fields must be provided."})
    }

    const editedPost = await Post.findByIdAndUpdate(req.params.id, {...(title && {title}), ...(content && {content})}, {new: true, runValidators: ture})

    if (!editedPost) {
      return res.status(404).json({success: false, message: "Post not found!"})
    }

    res.status(201).json({success: true, message: "Post edited successfully", post: editedPost})
  } catch (error) {
    next(error)
  }
}

export const postPut = async (req, res, next) => {
    try {
        const {title, content} = req.body
        const {id} = req.prarams

        if (!title || !content) {
            const error = new Error("Title and Content are required!")
            error.statusCode(401)
            throw error
        }

        const post = await Post.findByIdAndUpdate(id, {title, content}, { new: true, runValidators: true })

        if (!post) {
            const error = new Error("Post not found!")
            error.statusCode(201)
            throw error
        }

        res.status(201).json({success: true, message: "Edited post successfully.", post})
    } catch (error) {
        next(error)
    }
}


export const deletePost = async (req, res, next) => {
    try {
        const {id} = req.params

        const post = await Post.findById(id)

        const author = await User.findById(post.by)

        if (!author) {
            const error = new Error("Only the author or an admin can delete this post.")
            error.statusCode(401)
            throw error
        }

        await Post.findByIdAndDelete(id)

        res.status(204).json({success: true, message: "Post deleted successfully."})
    } catch (error) {
        next(error)
    }
}

export const deletePostByAdmin = async (req, res, next) => {
    try {
        const {id} = req.params
        await Post.findByIdAndDelete(id)

        res.status(204).json({success: true, message: "Post deleted successfully by Admin."})
    } catch (error) {
        next(error)
    }
}