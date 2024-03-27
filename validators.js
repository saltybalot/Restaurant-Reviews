const { body } = require('express-validator');

const registerValidation = [
  // Name should not be empty
  body('username').not().isEmpty().withMessage("Name is required."),

  body('description').not().isEmpty().withMessage("Please put a description."),
  // Password needs to be min 6 chars
  body('password').isLength({ min: 6 }).withMessage("Password must be at least 6 characters long."),

  // Confirm Password needs to be min 6 chars AND must match the req.body.password field
  body('confirmpassword').isLength({ min: 6 }).withMessage("Password must be at least 6 characters long.")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords must match.");
      }
      return true;
    })
    
    
];

module.exports = { registerValidation };