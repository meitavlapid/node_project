const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password"); 
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user" });
  }
};

const toggleLockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isLocked = req.body.isLocked;
    await user.save();
    res.json({
      message: `User ${user.isLocked ? "locked" : "unlocked"} successfully`,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update lock status" });
  }
};


module.exports = { getAllUsers, deleteUser, toggleLockUser };
