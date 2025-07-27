const bcrypt = require("bcryptjs");
const userModel = require("../database/models/User");
const LoginAudit = require("../database/models/Loginaudit");
const { validationResult } = require("express-validator");

// Password complexity check function
function isPasswordComplex(password) {
  return (
    typeof password === "string" &&
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

// Check if password exists in user's password history
async function isPasswordInHistory(user, newPassword) {
  if (!user.passwordHistory || user.passwordHistory.length === 0) {
    return false;
  }

  for (const historyEntry of user.passwordHistory) {
    const isMatch = await bcrypt.compare(newPassword, historyEntry.password);
    if (isMatch) {
      return true;
    }
  }
  return false;
}

// Update user's password and maintain password history
async function updatePasswordWithHistory(user, newPassword) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

  // Add current password to history before updating
  if (user.password) {
    const historyEntry = {
      password: user.password,
      changedAt: new Date(),
    };

    // Add to history array
    if (!user.passwordHistory) {
      user.passwordHistory = [];
    }

    user.passwordHistory.push(historyEntry);

    // Keep only the last N passwords (default 5)
    const limit = user.passwordHistoryLimit || 5;
    if (user.passwordHistory.length > limit) {
      user.passwordHistory = user.passwordHistory.slice(-limit);
    }
  }

  // Update current password
  user.password = hashedPassword;

  return user;
}

exports.registerUser = async (req, res) => {
  // Check if this is an admin registration request
  const isAdminRegistration = req.body.type === "admin";

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
    const {
      username,
      password,
      description,
      securityQuestion,
      securityAnswer,
    } = req.body;

    console.log("Registration data received:", {
      username,
      password: password ? "***" : "undefined",
      description,
      securityQuestion,
      securityAnswer: securityAnswer ? "***" : "undefined",
    });

    // Check if required fields are present
    if (!username || !password || !securityQuestion || !securityAnswer) {
      if (isAdminRegistration) {
        return res.status(400).json({
          success: false,
          message:
            "All fields including security question and answer are required.",
        });
      }
      req.flash(
        "error_msg",
        "All fields including security question and answer are required."
      );
      return res.redirect("/");
    }

    var avatar;

    // Password complexity check
    if (!isPasswordComplex(password)) {
      if (isAdminRegistration) {
        return res.status(400).json({
          success: false,
          message:
            "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
        });
      }
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
        if (isAdminRegistration) {
          return res.status(400).json({
            success: false,
            message: "User already exists. Please choose a different username.",
          });
        }
        req.flash("error_msg", "User already exists. Please login.");
        req.flash("showRegister", "true");
        return res.redirect("/");
      } else {
        const saltRounds = 10;
        // Hash password
        const hashed = await bcrypt.hash(password, saltRounds);
        // Hash security answer
        const hashedAnswer = await bcrypt.hash(
          (securityAnswer || "").toLowerCase().trim(),
          saltRounds
        );

        const newUser = {
          username: username,
          password: hashed,
          profilePic: avatar.name,
          description: description,
          securityQuestion: securityQuestion,
          securityAnswer: hashedAnswer,
          type: req.body.type || "reviewer",
          passwordHistory: [], // Initialize empty password history
          passwordHistoryLimit: 5, // Set default history limit
        };

        const user = await userModel.create(newUser);
        console.log(user);
        if (isAdminRegistration) {
          return res.status(200).json({
            success: true,
            message: "Admin registered successfully!",
          });
        }
        req.flash("success_msg", "You are now registered! Login below.");
        return res.redirect("/");
      }
    } catch (err) {
      console.error("Error:", err);
      if (isAdminRegistration) {
        return res.status(500).json({
          success: false,
          message: "An error occurred. Please try again.",
        });
      }
      req.flash("error_msg", "An error occurred. Please try again.");
      req.flash("showRegister", "true");
      return res.redirect("/");
    }
  } else {
    const messages = errors.array().map((item) => item.msg);
    console.log(messages);

    if (isAdminRegistration) {
      return res.status(400).json({
        success: false,
        message: messages.join(" "),
      });
    }
    req.flash("error_msg", messages.join(" "));
    req.flash("showRegister", "true");
    return res.redirect("/");
  }
};

exports.loginUser = async (req, res) => {
  const errors = validationResult(req);

  // Get IP address
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const MAX_ATTEMPTS = 5;
  const LOCK_TIME = 2 * 60 * 1000; // 2 minutes

  if (errors.isEmpty()) {
    const { username, password } = req.body;

    try {
      const user = await userModel.findOne({ username: username });

      if (!user) {
        console.log("Attempting to log failed login: user not found");
        await LoginAudit.create({
          username,
          success: false,
          ip,
          errorMessage: "User not found",
        });
        console.log("Logged failed login: user not found");
        req.flash("error_msg", "Invalid Username/Password.");
        req.flash("username", username);
        return res.redirect("/");
      }

      // Check if account is locked
      if (user.lockUntil && user.lockUntil > Date.now()) {
        const minutes = Math.ceil((user.lockUntil - Date.now()) / 60000);
        req.flash(
          "error_msg",
          `Account locked due to too many failed attempts. Try again in ${minutes} minute${
            minutes > 1 ? "s" : ""
          }.`
        );
        req.flash("username", username);
        return res.redirect("/");
      }

      // Reset login attempts if lockout period has expired
      if (user.lockUntil && user.lockUntil <= Date.now()) {
        user.loginAttempts = 0;
        user.lockUntil = null;
        await user.save();
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        // Reset login attempts and lockUntil on successful login
        user.loginAttempts = 0;
        user.lockUntil = null;
        await user.save();
        req.session.user = user;

        // Get last login information (successful or unsuccessful)
        const lastLoginAudit = await LoginAudit.findOne(
          { username: username },
          {},
          { sort: { timestamp: -1 }, skip: 1 }
        );

        // Store last login info in session for modal display
        req.session.lastLoginInfo = {
          timestamp: lastLoginAudit ? lastLoginAudit.timestamp : null,
          ip: lastLoginAudit ? lastLoginAudit.ip : null,
          success: lastLoginAudit ? lastLoginAudit.success : null,
          errorMessage: lastLoginAudit ? lastLoginAudit.errorMessage : null,
          isFirstLogin: !lastLoginAudit,
        };

        console.log("Attempting to log successful login");
        await LoginAudit.create({
          username,
          success: true,
          ip,
        });
        console.log("Logged successful login");
        req.flash("success_msg", "Login successful!");
        return res.redirect("/"); // Redirect to home or dashboard page
      } else {
        console.log("Attempting to log failed login: incorrect password");
        await LoginAudit.create({
          username,
          success: false,
          ip,
          errorMessage: "Incorrect password",
        });
        console.log("Logged failed login: incorrect password");
        // Increment login attempts
        user.loginAttempts = (user.loginAttempts || 0) + 1;
        // Lock account if max attempts reached
        if (user.loginAttempts >= MAX_ATTEMPTS) {
          user.lockUntil = new Date(Date.now() + LOCK_TIME);
          await user.save();
          req.flash(
            "error_msg",
            "Account locked due to too many failed attempts. Try again later."
          );
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
      console.log("Attempting to log failed login: error occurred");
      await LoginAudit.create({
        username: req.body.username,
        success: false,
        ip,
        errorMessage: err.message,
      });
      console.log("Logged failed login: error occurred");
      req.flash("error_msg", "An error occurred. Please try again.");
      req.flash("username", username);
      return res.redirect("/");
    }
  } else {
    const messages = errors.array().map((item) => item.msg);
    console.log("Attempting to log failed login: validation error");
    await LoginAudit.create({
      username: req.body.username,
      success: false,
      ip,
      errorMessage: messages.join(" "),
    });
    console.log("Logged failed login: validation error");
    req.flash("error_msg", messages.join(" "));
    return res.redirect("/");
  }
};

exports.logoutUser = (req, res) => {
  // Destroy the session and redirect to login page
  req.session.destroy();
  res.redirect("/");
};

exports.showForgotPassword = (req, res) => {
  // Consume flash messages
  const success_msg = req.flash("success_msg")[0] || null;
  const error_msg = req.flash("error_msg")[0] || null;

  console.log("open showForgotPassword");
  console.log(success_msg);
  console.log(error_msg);
  console.log("close showForgotPassword");

  res.render("forgotPassword", {
    pageTitle: "Forgot Password",
    error_msg: error_msg,
    success_msg: success_msg,
  });
};

exports.showResetPassword = (req, res) => {
  const username = req.session.resetUsername;
  const securityQuestion = req.session.resetQuestion;
  const securityAnswerVerified = req.session.securityAnswerVerified;
  const errorParam = req.query.error;

  if (!username || !securityQuestion) {
    req.flash("error_msg", "Session expired. Please try again.");
    return res.redirect("/forgot-password");
  }

  res.render("resetPassword", {
    username: username,
    securityQuestion: securityQuestion,
    showPreviousPasswordAlert: errorParam === "previous_password",
    securityAnswerVerified: securityAnswerVerified,
  });
};

exports.verifySecurityAnswer = async (req, res) => {
  const { securityAnswer } = req.body;
  const username = req.session.resetUsername;

  if (!username) {
    return res.json({ success: false, message: "Session expired" });
  }

  if (!securityAnswer) {
    return res.json({ success: false, message: "Security answer is required" });
  }

  try {
    const user = await userModel.findOne({ username: username });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Verify security answer
    const isAnswerCorrect = await bcrypt.compare(
      (securityAnswer || "").toLowerCase().trim(),
      user.securityAnswer
    );

    if (isAnswerCorrect) {
      // Mark that the security answer has been verified
      req.session.securityAnswerVerified = true;
      return res.json({ success: true, message: "Security answer is correct" });
    } else {
      return res.json({ success: false, message: "Incorrect security answer" });
    }
  } catch (err) {
    console.error("Error:", err);
    return res.json({ success: false, message: "An error occurred" });
  }
};

exports.forgotPassword = async (req, res) => {
  const { username } = req.body;

  try {
    const user = await userModel.findOne({ username: username });

    if (!user) {
      req.flash(
        "error_msg",
        "Username not found. Please check your username and try again."
      );
      return res.redirect("/forgot-password");
    } else if (user.securityQuestion === undefined) {
      req.flash(
        "error_msg",
        "Security question is not set. Please contact an administrator."
      );
      return res.redirect("/forgot-password");
    }

    // Store username in session for the next step
    req.session.resetUsername = username;
    req.session.resetQuestion = user.securityQuestion;

    // Redirect to reset password page instead of rendering
    return res.redirect("/reset-password");
  } catch (err) {
    console.error("Error:", err);
    req.flash("error_msg", "An error occurred. Please try again.");
    return res.redirect("/forgot-password");
  }
};

exports.resetPassword = async (req, res) => {
  const { newPassword, confirmPassword } = req.body;
  const username = req.session.resetUsername;
  const securityAnswerVerified = req.session.securityAnswerVerified;

  if (!username) {
    req.flash("error_msg", "Session expired. Please try again.");
    return res.redirect("/forgot-password");
  }

  if (!securityAnswerVerified) {
    req.flash("error_msg", "Please verify your security answer first.");
    return res.redirect("/reset-password");
  }

  if (!newPassword || !confirmPassword) {
    req.flash(
      "error_msg",
      "All password fields are required. Please try again."
    );
    return res.redirect("/reset-password");
  }

  if (newPassword !== confirmPassword) {
    req.flash("error_msg", "Passwords do not match. Please try again.");
    return res.redirect("/reset-password");
  }

  // Password complexity check
  if (!isPasswordComplex(newPassword)) {
    req.flash(
      "error_msg",
      "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
    );
    return res.redirect("/reset-password");
  }

  try {
    const user = await userModel.findOne({ username: username });

    if (!user) {
      req.flash("error_msg", "User not found. Please try again.");
      return res.redirect("/reset-password");
    }

    // Check if new password is the same as current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      req.flash(
        "error_msg",
        "New password cannot be the same as your current password. Please choose a different password."
      );
      return res.redirect("/reset-password");
    }

    // Check if new password exists in password history
    const isInHistory = await isPasswordInHistory(user, newPassword);
    if (isInHistory) {
      // Redirect with error parameter for alert
      return res.redirect("/reset-password?error=previous_password");
    }

    // Update user's password with history tracking
    const updatedUser = await updatePasswordWithHistory(user, newPassword);
    await updatedUser.save();

    // Clear session
    delete req.session.resetUsername;
    delete req.session.resetQuestion;
    delete req.session.securityAnswerVerified;

    // Redirect to home page with success parameter
    res.redirect("/?success=password_reset");
  } catch (err) {
    console.error("Error:", err);
    req.flash("error_msg", "An error occurred. Please try again.");
    return res.redirect("/reset-password");
  }
};
