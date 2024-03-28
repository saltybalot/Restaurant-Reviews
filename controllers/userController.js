const bcrypt = require("bcryptjs");
const userModel = require("../database/models/User");
const { validationResult } = require("express-validator");

exports.registerUser = async (req, res) => {
  // 1. Validate request

  // 2. If VALID, find if email exists in users
  //      NEW USER (no results retrieved)
  //        a. Hash password
  //        b. Create user
  //        c. Redirect to login page
  //      EXISTING USER (match retrieved)
  //        a. Redirect user to login page with error message.

  // 3. If INVALID, redirect to register page with errors
  console.log(req.body.password);
  console.log(req.body.confirmpassword);
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    const { username, password, description } = req.body;
    const avatar = req.files.avatar;

    try {
      const existingUser = await userModel.findOne({ username: username });

      if (existingUser) {
        console.log(existingUser);
        // Found a match, return to login with error
        req.flash("error_msg", "User already exists. Please login.");
        return res.redirect("/");
      } else {
        const saltRounds = 10;
        // Hash password
        const hashed = await bcrypt.hash(password, saltRounds);

        const newUser = {
          username: username,
          password: hashed,
          profilePic: avatar.name,
          description: description,
        };
        avatar.mv("public/images/" + avatar.name);

        const user = await userModel.create(newUser);
        console.log(user);
        req.flash("success_msg", "You are now registered! Login below.");
        return res.redirect("/");
      }
    } catch (err) {
      console.error("Error:", err);
      req.flash("error_msg", "An error occurred. Please try again.");
      return res.redirect("/");
    }
  } else {
    const messages = errors.array().map((item) => item.msg);
    console.log(messages);

    req.flash("error_msg", messages.join(" "));
    return res.redirect("/");
  }
};

exports.loginUser = (req, res) => {
  // 1. Validate request

  // 2. If VALID, find if email exists in users
  //      EXISTING USER (match retrieved)
  //        a. Check if password matches hashed password in database
  //        b. If MATCH, save info to session and redirect to home
  //        c. If NOT equal, redirect to login page with error
  //      UNREGISTERED USER (no results retrieved)
  //        a. Redirect to login page with error message

  // 3. If INVALID, redirect to login page with errors
  res.redirect("/");
};

exports.logoutUser = (req, res) => {
  // Destroy the session and redirect to login page
  res.redirect("/loggedout");
};
