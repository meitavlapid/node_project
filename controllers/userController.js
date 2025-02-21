const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register a new user

const registerUser = async (req, res) => {
  try {
    const { name, isBusiness, phone, email, password, address, image } =
      req.body;
    let bizNumber = null;
    if (isBusiness) {
      bizNumber = await generateBizNumber(); 
    }

    console.log("Raw Password before encryption:", password); 
  
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // **הצפנת הסיסמה**
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Hashed Password before saving:", hashedPassword); 

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      phone: req.body.phone,
      address: req.body.address,
      image: req.body.image,
      isBusiness: req.body.isBusiness,
      bizNumber,
      role: req.body.role || "Regular",
    });

    console.log("User object before saving:", user); 

    const savedUser = await user.save();

    console.log("User saved successfully:", await User.findOne({ email }));

    return res.status(201).json({
      message: "User created successfully",
      user: savedUser,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", { email });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (user.isLocked && user.lockUntil && user.lockUntil > Date.now()) {
      console.log(
        `🚨 User ${user.email} is locked until ${new Date(
          user.lockUntil
        ).toLocaleString()}`
      );
      return res.status(403).json({
        message: `Account is locked. Try again after ${new Date(
          user.lockUntil
        ).toLocaleString()}`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.failedLoginAttempts += 1;

      if (user.failedLoginAttempts >= 3) {
        user.isLocked = true;
        user.lockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); 
        await user.save();
        console.log(`🚫 User ${user.email} is now locked for 24 hours!`);
        return res.status(403).json({
          message: "Too many failed attempts. User locked for 24 hours.",
        });
      }

      await user.save();
      return res.status(400).json({ message: "Invalid email or password" });
    }

    user.failedLoginAttempts = 0;
    user.isLocked = false;
    user.lockUntil = null;
    await user.save();

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin, 
        isBusiness: user.isBusiness, 
      },
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );

    console.log("✅ Login successful:", user.email);
    res.status(200).json({ token, message: "Login successful", user });
  } catch (error) {
    console.error("🚨 Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user.id !== userId && req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const updates = req.body;

    if (updates.password) {
      return res
        .status(400)
        .json({ message: "Password cannot be updated directly" });
    }

    const user = await User.findByIdAndUpdate(userId, updates, { new: true });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


//lock user
const lockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id; 

    console.log(`🔹 Admin ${adminId} is locking/unlocking user ${id}`);

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isLocked = !user.isLocked;
    await user.save();

    console.log(
      `✅ User ${id} is now ${user.isLocked ? "locked" : "unlocked"}`
    );
    res.status(200).json({
      message: `User ${user.isLocked ? "locked" : "unlocked"} successfully`,
      user,
    });
  } catch (error) {
    console.error("🚨 Error locking user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const generateBizNumber = async () => {
  const lastUser = await User.findOne({ isBusiness: true })
    .sort({ bizNumber: -1 })
    .lean();
  return lastUser && lastUser.bizNumber ? lastUser.bizNumber + 1 : 100000;
};

const updateBizNumber = async (req, res) => {
  try {
    const { id } = req.params;
    const { bizNumber } = req.body;

    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Unauthorized - Admins only" });
    }

    const existingUser = await User.findOne({ bizNumber });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Business number already in use" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { bizNumber },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Business number updated successfully", user });
  } catch (error) {
    console.error("Error updating business number:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  lockUser,
  generateBizNumber,
  updateBizNumber,
};
