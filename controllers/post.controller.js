import mongoose from "mongoose"
import Post from "../model/post.model.js"
import User from "../model/user.model.js"

export const getPost = async (req, res, next) => {
    try {
        const posts = await Post.find().populate('by', 'name email')
        res.status(200).json({sucess:true, posts})
    } catch (error) {
        next(error)
    }
}

export const createPost = async (req, res, next) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const { title, content} = req.body

        if (!title || !content) {
            const error = new Error("Title and Content fields are required!")
            error.statusCode = 400;
            throw error
        }

         const existingPost = await Post.findOne({content})

        if (existingPost) {
            const error = new Error("Post already exists!")
            error.statusCode = 409
            throw error
        }

        const post = await Post.create([{
            title, 
            content, 
            by: req.user._id,
            views: 0
        }], {session})

        await session.commitTransaction()
        session.endSession()

        res.status(201).json({success:true, post: post[0]})
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        next(error)
    }
}

export const updateViews = async (req, res, next) => {
    try {
        const {id} = req.params

        const post = await Post.findByIdAndUpdate(
            id, 
            { $inc: { views: 1 } },
            { new: true }
        )

        if (!post) {
            const error = new Error("Post not found!")
            error.statusCode = 404;
            throw error
        }

        res.status(200).json({success: true, message: "Views updated successfully", post})
    } catch (error) {
        next(error)
    }
}

export const updatePost = async(req, res, next) => {
  try {
    const {title, content} = req.body

    if (!title && !content) {
      return res.status(400).json({success: false, message: "At least one field (title or content) must be provided."})
    }

    const existingPost = await Post.findById(req.params.id)
    
    if (!existingPost) {
      return res.status(404).json({
        success: false, 
        message: "Post not found!"
      })
    }

    // ✅ FIXED: Authorization check
    if (existingPost.by.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false, 
        message: "You can only edit your own posts."
      })
    }

    const editedPost = await Post.findByIdAndUpdate(req.params.id, {...(title && {title}), ...(content && {content})}, {new: true, runValidators: true})

    res.status(200).json({success: true, message: "Post edited successfully", post: editedPost})
  } catch (error) {
    next(error)
  }
}

export const postPut = async (req, res, next) => {
    try {
        const {title, content} = req.body
        const {id} = req.params

        if (!title || !content) {
            const error = new Error("Title and Content are required!")
            error.statusCode = 401;
            throw error
        }

        const post = await Post.findByIdAndUpdate(id, {title, content}, { new: true, runValidators: true })

        if (!post) {
            const error = new Error("Post not found!")
            error.statusCode = 400;
            throw error
        }

        res.status(200).json({success: true, message: "Edited post successfully.", post})
    } catch (error) {
        next(error)
    }
}


export const deletePost = async (req, res, next) => {
    try {
        const {id} = req.params

        const post = await Post.findById(id)

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found!"
            })
        }

        if (post.by.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own posts."
            })
        }

        await Post.findByIdAndDelete(id)

        res.status(200).json({success: true, message: "Post deleted successfully."})
    } catch (error) {
        next(error)
    }
}

export const deletePostByAdmin = async (req, res, next) => {
    try {
        const {id} = req.params

        const post = await Post.findById(id)

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found!"
            })
        }
        
        await Post.findByIdAndDelete(id)

        res.status(200).json({success: true, message: "Post deleted successfully by Admin."})
    } catch (error) {
        next(error)
    }
}