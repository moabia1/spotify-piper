import { body, validationResult } from "express-validator";

async function validate(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  }
  next();
}

export const registerValidationRules = [
  body("email")
    .isEmail()
    .withMessage("Invalid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be atleast 6 character"),
  body("fullName.firstName")
    .notEmpty()
    .withMessage("First Name is required"),
  body("fullName.lastName")
    .notEmpty()
    .withMessage("lastName is required"),
  validate
]

export const loginValidationRules = [
  body("email")
    .isEmail()
    .withMessage("Invalid email address"),
  body("password")
  .notEmpty()
    .withMessage("Password is required"),
  validate
]