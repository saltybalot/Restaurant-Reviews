const { body } = require("express-validator");

const registerValidation = [
  // Username should not be empty
  body("username").not().isEmpty().withMessage("Username is required."),

  // Username must only contain alphanumeric characters / letters and numbers
  body("username")
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters.")
    .matches(/^[A-Za-z0-9_]+$/)
    .withMessage("Username must only contain letters, numbers, and underscores."),

  // Password needs to be min 8 chars with complexity
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long.")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must include uppercase, lowercase, number, and special character."
    ),

  // Security question and answer are required
  body("securityQuestion").not().isEmpty().withMessage("Security question is required."),
  body("securityAnswer").not().isEmpty().withMessage("Security answer is required."),

  // Description can only contain characters used in text (to avoid code insertion)
  // Min length is 0 because it's optional
  body("description")
    .trim()
    .isLength({ min: 0, max: 200 })
    .withMessage("Description must be between 1 and 200 characters.")
    .matches(/^[A-Za-z0-9\s.,!?'"()-]*$/)
    .withMessage("Description contains invalid characters."),
];

const editProfileValidation = [
  // Description can only contain characters used in text (to avoid code insertion)
  // Min length is 0 because it's optional
  body("description")
    .trim()
    .isLength({ min: 0, max: 200 })
    .withMessage("Description must be between 1 and 200 characters.")
    .matches(/^[A-Za-z0-9\s.,!?'"()-]*$/)
    .withMessage("Description contains invalid characters."),
];

module.exports = { registerValidation, editProfileValidation };
