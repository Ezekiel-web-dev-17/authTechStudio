import User from "../model/user.model.js"
//get Users by Id, createUser, UpdateUser, deleteUser
export const getUsers = async(req, res) => {
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
