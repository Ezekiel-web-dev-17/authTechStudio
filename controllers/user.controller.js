import User from "../model/user.model.js"
export const getUsers = async(req, res, next) => {
    try {
    const users = await User.find();
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
}

export const getUserById = async (req, res, next) => {
  try {
    const {id} = req.params
    
    if (!id) {
      const error = new Error("User id is required!")
      error.statusCode(400)
      throw error
    } 

    const user = await User.findById(id).select("-password")

    if (!user) {
      const error = new Error("User not found!")
      error.statusCode(404)
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
      return res.status(400).json({success: false, message: "At least of the field must be provided."})
    }

    const salt = await bcrypt.genSalt(10)

    const encryptPassword = await bcrypt.hash(password, salt)

    const editedUser = await User.findByIdAndUpdate(req.params.id, {...(name && {name}), ...(email && {email}),...(password && {password: encryptPassword})}, {new: true, runValidators: ture})

    if (!editedUser) {
      return res.status(404).json({success: false, message: "User not found!"})
    }

    res.status(201).json({success: true, user: editedUser})
  } catch (error) {
    next(error)
  }
}

export const deleteUser = async (req, res, next) => {
  try {
    const {id} = req.params

    await User.findByIdAndDelete(id)

    res.status(204).json({
      success: true,
      message: "User deleted successfully."
    })
  } catch (error) {
    next(error)
  }
}