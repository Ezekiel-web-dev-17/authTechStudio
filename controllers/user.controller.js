import bcrypt from "bcryptjs";
import User from "../model/user.model.js"

export const getUsers = async(req, res, next) => {
    try {
    const users = await User.find().select("-password");
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
}

export const getUserById = async (req, res, next) => {
  try {
    const {id} = req.params
    const identity = id.slice(1)
    
    if (!identity) {
      const error = new Error("User id is required!")
      error.statusCode = 400;
      throw error
    } 

    const user = await User.findById(identity).select("-password")

    if (!user) {
      const error = new Error("User not found!")
      error.statuscode = 404;
      throw error
    } 

    res.status(200).json({
      success: true,
      user
    })
  } catch (error) {
    next(error)
  }
}

export const updateUser = async(req, res, next) => {
  try {
    const {name, email, password} = req.body

    if (!name && !email && !password) {
      return res.status(400).json({success: false, message: "At least one of the fields must be provided."})
    }

    if (req.params.id.slice(1) !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own profile."
      })
    }

   const updateData = {
      ...(name && {name}), 
      ...(email && {email})
    }

    if (password) {
      const salt = await bcrypt.genSalt(10)
      updateData.password = await bcrypt.hash(password, salt)
    }

    const editedUser = await User.findByIdAndUpdate(
      req.params.id.slice(1), 
      updateData,
      {new: true, runValidators: true}
    ).select("-password")
    if (!editedUser) {
      return res.status(404).json({success: false, message: "User not found!"})
    }

    res.status(200).json({success: true, user: editedUser})
  } catch (error) {
    next(error)
  }
}

export const deleteUser = async (req, res, next) => {
  try {
    const {id} = req.params.slice(1)

    const user = await User.findById(id)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!"
      })
    }

    await User.findByIdAndDelete(id)

    res.status(204).json({
      success: true,
      message: "User deleted successfully."
    })
  } catch (error) {
    next(error)
  }
}