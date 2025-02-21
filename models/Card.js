const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, minlength: 2, maxlength: 100 },
    subtitle: {
      type: String,
      required: false,
      minlength: 2,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 1000,
    },
    phone: { type: String, required: true, match: /^[0-9]{9,10}$/ },
    email: { type: String, required: true, match: /^\S+@\S+\.\S+$/ },
    web: { type: String, required: false },
    address: {
      type: Object,
      required: true,
      state: { type: String, required: true },
      country: { type: String, required: true },
      city: { type: String, required: true },
      street: { type: String, required: true },
      houseNumber: { type: Number, required: true },
      zip: { type: Number, required: true },
    }, 
    image: {
      url: { type: String, required: true },
      alt: { type: String, default: "Business Image" },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },
    createdAt: { type: Date, default: Date.now },
    isBusiness: { type: Boolean, required: true },
    bizNumber: { type: String, required: false },
  },
  { timestamps: true }
);

const Card = mongoose.model("Card", cardSchema);

module.exports = Card;
