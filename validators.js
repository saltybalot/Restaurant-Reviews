const { body } = require("express-validator");

const registerValidation = [
  // Username should not be empty
  body("username").not().isEmpty().withMessage("Username is required."),

  // Description is optional, so we'll remove the validation for it

  // Password needs to be min 8 chars with complexity
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long.")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must include uppercase, lowercase, number, and special character."
    ),

  // Security question and answer are required
  body("securityQuestion")
    .not()
    .isEmpty()
    .withMessage("Security question is required."),
  body("securityAnswer")
    .not()
    .isEmpty()
    .withMessage("Security answer is required."),
];

module.exports = { registerValidation };
