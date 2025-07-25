const { body } = require("express-validator");

const registerValidation = [
  // Username should not be empty
  body("username").not().isEmpty().withMessage("Username is required."),

  // Description is optional, so we'll remove the validation for it

  // Password needs to be min 6 chars
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),

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
