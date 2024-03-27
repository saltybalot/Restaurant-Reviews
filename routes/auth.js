const router = require('express').Router();
const userController = require('../controllers/userController');
const { registerValidation } = require('../validators.js');

// GET login to display login page
router.get('/login', (req, res) => {
  console.log("Linked to auth.js"),
  res.send({ showModal: true, pageTitle: 'Login' });
});

// GET register to display registration page
router.get('/register', (req, res) => {
  console.log("Linked to auth.js"),
  res.send({ showModal: true, pageTitle: 'Registration' });
});

// POST methods for form submissions
router.post('/register', registerValidation, userController.registerUser);
router.post('/login', userController.loginUser);

// logout
router.get('/logout', userController.logoutUser);

module.exports = router;
