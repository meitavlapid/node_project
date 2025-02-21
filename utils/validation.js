const Joi = require("joi");

// ✅ ולידציה ליצירת משתמש
const validateUser = (data) => {
  const schema = Joi.object({
    name: Joi.object({
      first: Joi.string().min(2).max(100).required(),
      middle: Joi.string().allow(""), // יכול להיות ריק
      last: Joi.string().min(2).max(100).required(),
    }).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required().messages({
      "string.min": "Password must be at least 6 characters long",
    }),
    phone: Joi.string()
      .pattern(/^(\d{10}|\d{2,3}-\d{7})$/)
      .required()
      .messages({
        "string.pattern.base":
          "Phone must be in format 0501234567 or 050-1234567",
      }),
    address: Joi.object({
      state: Joi.string().allow(""),
      country: Joi.string().required(),
      city: Joi.string().required(),
      street: Joi.string().required(),
      houseNumber: Joi.number().required(),
      zip: Joi.number().optional(), // 🔹 הפכנו אותו לאופציונלי
    }).required(),
    image: Joi.object({
      url: Joi.string().allow(""),
      alt: Joi.string().allow(""),
    }).optional(),
    isAdmin: Joi.boolean().default(false),
    bizNumber: Joi.number().optional(),
    isBusiness: Joi.boolean().default(false), // 🔹 ברירת מחדל - false
    role: Joi.string()
      .valid("Regular", "Business", "Admin", "AdminBiz")
      .default("Regular"), // 🔹 הוספת role
  });

  return schema.validate(data);
};

// ✅ ולידציה ליצירת כרטיס
const validateCard = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(2).max(100).required(),
    description: Joi.string().min(2).max(1000).required(),
    phone: Joi.string()
      .pattern(/^(\d{10}|\d{2,3}-\d{7})$/)
      .required()
      .messages({
        "string.pattern.base":
          "Phone must be in format 0501234567 or 050-1234567",
      }),
    address: Joi.object({
      state: Joi.string().min(2).max(100).required(),
      country: Joi.string().min(2).max(100).required(),
      city: Joi.string().min(2).max(100).required(),
      street: Joi.string().min(2).max(100).required(),
      houseNumber: Joi.number().integer().required(),
      zip: Joi.number().integer().optional(), 
    }).required(),
    image: Joi.string().uri().optional(),
    userId: Joi.string().required(), 
    likes: Joi.array().items(Joi.string()).default([]), בלייקים
  });

  return schema.validate(data);
};

module.exports = { validateUser, validateCard };
