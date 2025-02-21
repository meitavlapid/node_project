const User = require("../models/User");

const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ message: "Access denied" });
    } else if (req.user.isAdmin && !req.user.isBusiness) {
      if (allowedRoles.includes("Admin")) {
        return next();
      }
    } else if (req.user.isBusiness && !req.user.isAdmin) {
      if (allowedRoles.includes("Business")) {
        return next();
      }
    } else if (allowedRoles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ message: "Access denied" });
  };
};

module.exports = roleMiddleware;
