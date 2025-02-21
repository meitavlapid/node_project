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

//  Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/cards", require("./routes/cardRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use((req, res, next) => {
  res.status(404);
  next(new Error(`🔍 Not Found - ${req.originalUrl}`));
});

app.use((err, req, res, next) => {
  console.error("🔥 Global Error Handler Triggered:", err.message);
  errorLogger(err, req, res, next); // קרא ל-logger.js
});
// MongoDB
mongoose
  .connect(
    (process.env.MONGO_URI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

//  הפעלת השרת
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
