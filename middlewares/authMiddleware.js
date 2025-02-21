const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token =
    req.header("x-auth-token") ||
    req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    if (req.user.role === "Admin" || req.user.isAdmin) {
      return next();
    }

    if (req.user.isLocked) {
      return res.status(403).json({ message: "Account is locked." });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = authMiddleware;
