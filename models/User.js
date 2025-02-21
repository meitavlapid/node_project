const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      first: { type: String, required: true },
      middle: { type: String },
      last: { type: String, required: true },
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    address: {
      state: { type: String },
      country: { type: String, required: true },
      city: { type: String, required: true },
      street: { type: String, required: true },
      houseNumber: { type: Number, required: true },
    },
    image: {
      url: {
        type: String,
        required: false,
      },
      alt: {
        type: String,
        default: "User profile image",
      },
    },
    isAdmin: { type: Boolean, required: true, default: false },
    isBusiness: { type: Boolean, required: true, default: false },
    bizNumber: { type: Number, unique: true, sparse: true, default: null },
    role: {
      type: String,
      enum: ["Regular", "Business", "Admin"],
      default: "Regular",
      required: true,
    },
    isLocked: { type: Boolean, default: false },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
