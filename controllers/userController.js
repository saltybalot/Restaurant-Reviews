const bcrypt = require("bcryptjs");
const userModel = require("../database/models/User");
const { validationResult } = require("express-validator");

// Password complexity check function
function isPasswordComplex(password) {
  return (
    typeof password === 'string' &&
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

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
    var avatar;

    // Password complexity check
    if (!isPasswordComplex(password)) {
      req.flash(
        "error_msg",
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
      );
      req.flash("username", username);
      req.flash("showRegister", "true");
      return res.redirect("/");
    }

    if (!req.files || Object.keys(req.files).length === 0) {
      avatar = {
        name: "default.jpg",
      };
    } else {
      avatar = req.files.avatar;
      avatar.mv("public/images/" + avatar.name);
    }

    try {
      const existingUser = await userModel.findOne({ username: username });

      if (existingUser) {
        console.log(existingUser);
        // Found a match, return to login with error
        req.flash("error_msg", "User already exists. Please login.");
        req.flash("showRegister", "true");
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
          type: "reviewer",
        };

        const user = await userModel.create(newUser);
        console.log(user);
        req.flash("success_msg", "You are now registered! Login below.");
        return res.redirect("/");
      }
    } catch (err) {
      console.error("Error:", err);
      req.flash("error_msg", "An error occurred. Please try again.");
      req.flash("showRegister", "true");
      return res.redirect("/");
    }
  } else {
    const messages = errors.array().map((item) => item.msg);
    console.log(messages);

    req.flash("error_msg", messages.join(" "));
    req.flash("showRegister", "true");
    return res.redirect("/");
  }
};

exports.loginUser = async (req, res) => {
  const errors = validationResult(req);

  const MAX_ATTEMPTS = 5;
  const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

  if (errors.isEmpty()) {
    const { username, password } = req.body;

    try {
      const user = await userModel.findOne({ username: username });

      if (!user) {
        req.flash("error_msg", "Invalid Username/Password.");
        req.flash("username", username);
        return res.redirect("/");
      }

      // Check if account is locked
      if (user.lockUntil && user.lockUntil > Date.now()) {
        const minutes = Math.ceil((user.lockUntil - Date.now()) / 60000);
        req.flash(
          "error_msg",
          `Account locked due to too many failed attempts. Try again in ${minutes} minute${minutes > 1 ? "s" : ""}.`
        );
        req.flash("username", username);
        return res.redirect("/");
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        // Reset login attempts and lockUntil on successful login
        user.loginAttempts = 0;
        user.lockUntil = null;
        await user.save();
        req.session.user = user;
        req.flash("success_msg", "Login successful!");
        return res.redirect("/"); // Redirect to home or dashboard page
      } else {
        // Increment login attempts
        user.loginAttempts = (user.loginAttempts || 0) + 1;
        // Lock account if max attempts reached
        if (user.loginAttempts >= MAX_ATTEMPTS) {
          user.lockUntil = new Date(Date.now() + LOCK_TIME);
          await user.save();
          req.flash("error_msg", "Account locked due to too many failed attempts. Try again later.");
          req.flash("username", username);
        } else {
          await user.save();
          req.flash("error_msg", "Invalid Username/Password.");
          req.flash("username", username);
        }
        return res.redirect("/");
      }
    } catch (err) {
      console.error("Error:", err);
      req.flash("error_msg", "An error occurred. Please try again.");
      req.flash("username", username);
      return res.redirect("/");
    }
  } else {
    const messages = errors.array().map((item) => item.msg);
    req.flash("error_msg", messages.join(" "));
    return res.redirect("/");
  }
};

exports.logoutUser = (req, res) => {
  // Destroy the session and redirect to login page
  req.session.destroy();
  res.redirect("/");
};
