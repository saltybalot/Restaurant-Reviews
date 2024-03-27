const router = require("express").Router();
const userController = require("../controllers/userController");
const { registerValidation } = require("../validators.js");
const User = require("../database/models/User");

// GET login to display login page
router.get("/login", (req, res) => {
  res.render('login', {
    pageTitle: 'Login',
  });
});

// GET register to display registration page
router.get("/register", async (req, res) => {
  console.log("Linked to auth.js");
 

  const username = "PatriciaTom"; //placeholder, please replace if you have session
  const avatar = req.files.avatar;

  avatar.mv("public/images/" + avatar.name);

  const newUser = new User({ 
    username: username,
    password: password,
    avatar: avatar.name,
    description: description, 
  });
  await newUser.save()
    .catch(err => res.status(400).send('Error registering user: ' + err.message));
    res.redirect("/loggedIn");
});

// POST methods for form submissions
router.post("/register", registerValidation, userController.registerUser);
router.post("/login", userController.loginUser);

// logout
router.get("/logout", userController.logoutUser);

module.exports = router;
