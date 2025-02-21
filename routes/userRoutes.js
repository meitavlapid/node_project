const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserById,
  updateUser,
  updateBizNumber,
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/cause-error", (req, res, next) => {
  throw new Error("🔥 Simulated Server Error");
});
// הרשמה
router.post("/register", registerUser);

// התחברות
router.post("/login", loginUser);

// קבלת מידע על משתמש לפי ID
router.get("/:id", authMiddleware, getUserById);

// עדכון פרטי משתמש
router.put("/:id", authMiddleware, updateUser);

// עדכון מספר זהות עסק
router.put("/:id/bizNumber", authMiddleware, updateBizNumber,);

module.exports = router;
