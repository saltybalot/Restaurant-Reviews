const router = require("express").Router();
const userController = require("../controllers/userController");
const { registerValidation } = require("../validators.js");
const User = require("../database/models/User");

/* This part is unnecesary
// GET login to display login page
router.get("/login", (req, res) => {
  res.render("login", {
    pageTitle: "Login",
  });
});

// GET register to display registration page
router.get("/register", async (req, res) => {
  console.log("Linked to auth.js");
});*/

// POST methods for form submissions
router.post("/register", registerValidation, userController.registerUser);
router.post("/login", userController.loginUser);

// Forgot password routes
router.get("/forgot-password", userController.showForgotPassword);
router.post("/forgot-password", userController.forgotPassword);
router.get("/reset-password", userController.showResetPassword);
router.post("/verify-security-answer", userController.verifySecurityAnswer);
router.post("/reset-password", userController.resetPassword);

// logout
router.get("/logout", userController.logoutUser);

module.exports = router;
