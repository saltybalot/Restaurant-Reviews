const bcrypt = require("bcryptjs");
const userModel = require("../database/models/User");
const LoginAudit = require("../database/models/Loginaudit");
const DataValidationLog = require("../database/models/DataValidationLog");
const { validationResult } = require("express-validator");

const path = require('path');
const crypto = require('crypto');

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

// Check if password is old enough to be changed (2 minutes for demo)
function isPasswordOldEnough(passwordChangedAt) {
  const now = new Date();
  const twoMinutesAgo = new Date(now.getTime() - (2 * 60 * 1000)); // 2 minutes ago
  return passwordChangedAt < twoMinutesAgo;
}

exports.registerUser = async (req, res) => {
  const isAdminRegistration = req.body.type === "admin";
  const errors = validationResult(req);
  // Mask sensitive fields
  const maskedBody = { ...req.body };
  if (maskedBody.password) maskedBody.password = "***";
  if (maskedBody.confirmpassword) maskedBody.confirmpassword = "***";
  if (maskedBody.securityAnswer) maskedBody.securityAnswer = "***";
  const logBase = {
    username: req.body.username || "unknown",
    action: "register",
    data: JSON.stringify(maskedBody),
  };

  if (errors.isEmpty()) {
    const {
      username,
      password,
      description,
      securityQuestion,
      securityAnswer,
    } = req.body;

    // Check if required fields are present
    if (!username || !password || !securityQuestion || !securityAnswer) {
      await DataValidationLog.create({
        ...logBase,
        result: "Missing required fields",
      });
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

    // Password complexity check
    if (!isPasswordComplex(password)) {
      await DataValidationLog.create({
        ...logBase,
        result: "Password complexity requirement not met",
      });
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

    // var avatar;
    // if (!req.files || Object.keys(req.files).length === 0) {
    //   avatar = {
    //     name: "default.jpg",
    //   };
    // } else {
    //   avatar = req.files.avatar;
    //   avatar.mv("public/images/" + avatar.name);
    // }

    var avatar;
    if (!req.files || Object.keys(req.files).length === 0) {
        avatar = { name: "default.jpg" };
    } else {
        avatar = req.files.avatar;

        // JPG and PNG are only allowed
        const allowedTypes = ['image/jpeg', 'image/png'];

        if (!allowedTypes.includes(avatar.mimetype)) {
            return res.status(400).json({
                success: false,
                message: "Only JPG and PNG files are allowed."
            });
        }

        // Generate a safe unique filename
        const extension = path.extname(avatar.name).toLowerCase();
        const uniqueName = crypto.randomUUID() + extension;

        // Save to public/images
        await avatar.mv("public/images/" + uniqueName);

        avatar.name = uniqueName; // store new filename in DB
    }

    try {
      const existingUser = await userModel.findOne({ username: username });

      if (existingUser) {
        await DataValidationLog.create({
          ...logBase,
          result: "User already exists",
        });
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
        const hashed = await bcrypt.hash(password, saltRounds);
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
          passwordChangedAt: new Date(), // Set initial password change timestamp
          passwordHistory: [], // Initialize empty password history
          passwordHistoryLimit: 5 // Set default history limit
        };

        const user = await userModel.create(newUser);
        await DataValidationLog.create({
          ...logBase,
          result: "success",
        });
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
      await DataValidationLog.create({
        ...logBase,
        result: `Error: ${err.message}`,
      });
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
    await DataValidationLog.create({
      ...logBase,
      result: messages.join(" "),
    });
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
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  // Mask sensitive fields
  const maskedBody = { ...req.body };
  if (maskedBody.password) maskedBody.password = "***";
  if (maskedBody.confirmpassword) maskedBody.confirmpassword = "***";
  const logBase = {
    username: req.body.username || "unknown",
    action: "login",
    data: JSON.stringify(maskedBody),
  };
  const MAX_ATTEMPTS = 5;
  const LOCK_TIME = 2 * 60 * 1000; // 2 minutes

  if (errors.isEmpty()) {
    const { username, password } = req.body;

    try {
      const user = await userModel.findOne({ username: username });

      if (!user) {
        await DataValidationLog.create({
          ...logBase,
          result: "User not found",
        });
        await LoginAudit.create({
          username,
          success: false,
          ip,
          errorMessage: "User not found",
        });
        req.flash("error_msg", "Invalid Username/Password.");
        req.flash("username", username);
        return res.redirect("/");
      }

      if (user.lockUntil && user.lockUntil > Date.now()) {
        await DataValidationLog.create({
          ...logBase,
          result: "Account locked",
        });
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

      if (user.lockUntil && user.lockUntil <= Date.now()) {
        user.loginAttempts = 0;
        user.lockUntil = null;
        await user.save();
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        user.loginAttempts = 0;
        user.lockUntil = null;
        await user.save();
        req.session.user = user;

        const lastLoginAudit = await LoginAudit.findOne(
          { username: username },
          {},
          { sort: { timestamp: -1 }, skip: 1 }
        );

        req.session.lastLoginInfo = {
          timestamp: lastLoginAudit ? lastLoginAudit.timestamp : null,
          ip: lastLoginAudit ? lastLoginAudit.ip : null,
          success: lastLoginAudit ? lastLoginAudit.success : null,
          errorMessage: lastLoginAudit ? lastLoginAudit.errorMessage : null,
          isFirstLogin: !lastLoginAudit,
        };

        await DataValidationLog.create({
          ...logBase,
          result: "success",
        });
        await LoginAudit.create({
          username,
          success: true,
          ip,
        });
        req.flash("success_msg", "Login successful!");
        return res.redirect("/");
      } else {
        await DataValidationLog.create({
          ...logBase,
          result: "Incorrect password",
        });
        await LoginAudit.create({
          username,
          success: false,
          ip,
          errorMessage: "Incorrect password",
        });
        user.loginAttempts = (user.loginAttempts || 0) + 1;
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
      await DataValidationLog.create({
        ...logBase,
        result: `Error: ${err.message}`,
      });
      await LoginAudit.create({
        username: req.body.username,
        success: false,
        ip,
        errorMessage: err.message,
      });
      req.flash("error_msg", "An error occurred. Please try again.");
      req.flash("username", req.body.username);
      return res.redirect("/");
    }
  } else {
    const messages = errors.array().map((item) => item.msg);
    await DataValidationLog.create({
      ...logBase,
      result: messages.join(" "),
    });
    await LoginAudit.create({
      username: req.body.username,
      success: false,
      ip,
      errorMessage: messages.join(" "),
    });
    req.flash("error_msg", messages.join(" "));
    return res.redirect("/");
  }
};

exports.logoutUser = async (req, res) => {
  try {
    // Get user info before destroying session
    const username = req.session.user ? req.session.user.username : 'Unknown';
    const ip = req.ip || req.connection.remoteAddress;
    
    // Log the logout event
    console.log("Attempting to log logout event");
    await LoginAudit.create({
      username,
      success: true,
      ip,
      action: 'logout',
      timestamp: new Date()
    });
    console.log("Logged logout event");
    
    // Flash a success message BEFORE destroying session
    req.flash("success_msg", "Logout successful!");
    
    // Store flash message in a way that survives session destruction
    const flashMessage = "Logout successful!";
    
    // Destroy the session and redirect with flash message
    req.session.destroy();
    res.redirect("/?logout=success");
  } catch (err) {
    console.error("Error logging logout:", err);
    // Still logout even if logging fails
    req.session.destroy();
    res.redirect("/?logout=success");
  }
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

    // Check if password is old enough to be changed (2 minutes for demo)
    if (!isPasswordOldEnough(user.passwordChangedAt)) {
      const timeRemaining = Math.ceil((user.passwordChangedAt.getTime() + (2 * 60 * 1000) - new Date().getTime()) / 1000 / 60);
      req.flash("error_msg", `Password cannot be changed yet. Please wait ${timeRemaining} more minute(s) before changing your password again.`);
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
    // Update the passwordChangedAt timestamp
    updatedUser.passwordChangedAt = new Date();
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
