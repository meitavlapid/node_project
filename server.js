const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const errorLogger = require("./middlewares/logger");

dotenv.config();

const app = express();
app.use((req, res, next) => {
  console.log(`🌍 Incoming Request: ${req.method} ${req.url}`);
  next();
});

//  Middlewares
app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
  res.send("🚀 Server is running! Welcome to the API.");
});
//  Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/cards", require("./routes/cardRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use((req, res, next) => {
  if (req.headers["x-forwarded-proto"] !== "https") {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

app.use((err, req, res, next) => {
  console.error("🔥 Global Error Handler Triggered:", err.message);
  errorLogger(err, req, res, next); // קרא ל-logger.js
});
// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

//  הפעלת השרת
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
