const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getAllUsers,
  deleteUser,
  toggleLockUser,
} = require("../controllers/adminController");
router.use((req, res, next) => {
  console.log(`📢 Admin Route Hit: ${req.method} ${req.url}`);
  next();
});
router.get("/users", authMiddleware, getAllUsers);
router.delete("/users/:id", authMiddleware, deleteUser);
router.put("/users/:id/lock", authMiddleware, toggleLockUser);

module.exports = router;
