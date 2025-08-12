import Post from "../model/post.model.js"

export const getPost = async (req, res, next) => {
    try {
        const posts = await Post.find()
        res.status(200).json({sucess:true, posts})
    } catch (error) {
        next(error)
    }
}