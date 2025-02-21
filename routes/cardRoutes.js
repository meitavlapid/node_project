const express = require("express");
const router = express.Router();
const {
  getAllCards,
  getCardById,
  createCard,
  updateCard,
  deleteCard,
  likeCard,
  getUserCards,
} = require("../controllers/cardController");
const authMiddleware = require("../middlewares/authMiddleware");

// קבלת כל הכרטיסים
router.get("/", getAllCards);

// קבלת כרטיסים של משתמש מחובר
router.get("/my-cards", authMiddleware, getUserCards);

// קבלת כרטיס לפי מזהה ID
router.get("/:id", authMiddleware, getCardById);

// יצירת כרטיס חדש (רק למשתמשים עסקיים)
router.post("/", authMiddleware, createCard); // ✅ וודא שהשורה קיימת

// עדכון כרטיס (רק למשתמשים עסקיים שהם הבעלים)
router.put("/:id", authMiddleware, updateCard);

// מחיקת כרטיס (רק לבעל הכרטיס)
router.delete("/:id", authMiddleware, deleteCard);

// לייק על כרטיס
router.patch("/:id/like", authMiddleware, likeCard);

module.exports = router;
