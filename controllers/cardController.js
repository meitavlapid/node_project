const Card = require("../models/Card");
const User = require("../models/User");
// Get all cards
const getAllCards = async (req, res) => {
  try {
    const cards = await Card.find();
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get cards created by the logged-in user
const getUserCards = async (req, res) => {
  try {
    const userId = req.user?.id || req.params.userId;

    console.log("🔍 Fetching cards for user:", userId);

    if (!userId) {
      console.error("🚨 No user ID found in request.");
      return res.status(400).json({ message: "User ID is missing" });
    }

    const cards = await Card.find({ userId });

    if (!cards.length) {
      console.warn("⚠️ No cards found for this user.");
      return res.status(404).json({ message: "No cards found" });
    }

    console.log("✅ Found cards:", cards);
    res.json(cards);
  } catch (error) {
    console.error("🚨 Error fetching user cards:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

function formatPhone(phone) {
  if (phone.includes("-")) return phone;
  return phone.replace(/^(\d{3})(\d{7})$/, "$1-$2");
}
// Get card by ID
const getCardById = async (req, res) => {
  try {
    const { id } = req.params; 
    console.log("🔍 Fetching card with ID:", id);

    if (!id) {
      return res.status(400).json({ message: "Card ID is required" });
    }
    const card = await Card.findById(id);
    if (!card) return res.status(404).json({ message: "Card not found" });
    res.json(card);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create a new card

const createCard = async (req, res) => {
  try {
    const { title, subtitle, description, phone, email, web, address, image } =
      req.body;
    const userId = req.user?.id;

    console.log("🔹 Creating card for user:", userId);
    console.log("📦 Received data:", req.body);

    if (!title || !description || !phone || !address || !image?.url) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newCard = new Card({
      title,
      subtitle,
      description,
      phone: phone.toString(), 
      email,
      web,
      address,
      image,
      userId,
      isBusiness: true, 
    });

    await newCard.save();
    console.log("✅ Card created successfully:", newCard);
    res
      .status(201)
      .json({ message: "Card created successfully", card: newCard });
  } catch (error) {
    console.error("🚨 Error creating card:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Update a card
const updateCard = async (req, res) => {
  try {
    const cardId = req.params.id;
    const userId = req.user.id; 
    const userRole = req.user.role; 

    console.log("🔹 User attempting to update card:", { userId, userRole });

    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    console.log("🔹 Card owner:", card.userId.toString());

    
    if (userRole === "Admin") {
      console.log("✅ Admin authorized to edit any card");
    }
  
    else if (userRole === "Business" && card.userId.toString() === userId) {
      console.log("✅ Business user authorized to edit their own card");
    }
    else {
      console.log("🚨 Unauthorized attempt to edit someone else's card!");
      return res
        .status(403)
        .json({ message: "Access denied. You can only edit your own cards." });
    }

    const updates = req.body;
    const updatedCard = await Card.findByIdAndUpdate(cardId, updates, {
      new: true,
    });

    res
      .status(200)
      .json({ message: "Card updated successfully", card: updatedCard });
  } catch (error) {
    console.error("Error updating card:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Delete a card
const deleteCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ message: "Card not found" });
    if (card.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    await card.remove();
    res.json({ message: "Card deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Like a card
const likeCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    const userId = req.user.id;
    const likedIndex = card.likes.indexOf(userId);

    if (likedIndex === -1) {
      card.likes.push(userId);
    } else {
      card.likes.splice(likedIndex, 1);
    }

    await card.save();
    res.status(200).json({ message: "Like status updated", likes: card.likes });
  } catch (error) {
    console.error("🔴 Server error in likeCard:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllCards,
  getUserCards,
  getCardById,
  createCard,
  updateCard,
  deleteCard,
  likeCard,
};
