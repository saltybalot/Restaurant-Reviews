const { Router } = require("express");
const Restaurant = require("../database/models/Restaurant");
const Review = require("../database/models/Review");
const Rating = require("../database/models/Rating");
const User = require("../database/models/User");
const Reply = require("../database/models/Reply");
const router = Router();
const { isLoggedIn } = require("../index");
const LoginAudit = require("../database/models/Loginaudit");
const AccessControlLog = require("../database/models/AccessControlLog");
const bcrypt = require("bcryptjs");

/**
 * This is for rendering the PROFILE page
 */

router.get("/profile", isLoggedIn, async (req, res) => {
  const username = req.query.user;
  console.log("user query: " + username);
  const loggedUser = req.session?.user?.username;

  try {
    const user = await User.findOne({ username: username });
    const restaurant = await Restaurant.findOne({
      name: new RegExp(username, "i"),
    });
    if (restaurant != null) {
      res.redirect("/view?restaurant=" + username);
      return;
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const reviews = await Review.aggregate([
      {
        $addFields: {
          dateObject: {
            $toDate: "$date", // Convert the date string to a Date object
          },
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $lookup: {
          from: "replies",
          localField: "_id",
          foreignField: "reviewId",
          as: "replyDetails",
        },
      },
      {
        $unwind: { path: "$replyDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $match: {
          username: username,
        },
      },
      {
        $sort: { dateObject: -1 }, // Sort based on the new Date object field
      },
    ]);

    console.log(reviews);
    res.render("profile", { user, reviews, loggedUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * This for editing and deleting reviews in ABOUT page
 */

router.get("/reviewEdit", async (req, res) => {
  const id = req.query.id;
  const img = req.query.img;
  const star = req.query.star;
  var body = req.query.body;
  const isEdited = body.includes("(edited)");

  if (!isEdited) {
    body += " (edited)";
  }
  var review = await Review.findById(id);

  review.image = img;
  review.rating = star;
  review.body = body;

  var editedReview = review.save();

  console.log(editedReview);

  res.redirect("/profile?user=" + req.session.user.username);
});

router.get("/reviewDelete", async (req, res) => {
  const id = req.query.id;

  console.log(id);

  editedReview = await Review.findByIdAndDelete(id);
  res.redirect("/profile?user=" + req.session.user.username);
});

/**
 * This is for editing profile in the PROFILE page
 */

router.post("/editProfile", async (req, res) => {
  var user = await User.findById(req.session.user._id);
  var profilePic;
  if (!req.files || Object.keys(req.files).length === 0) {
    console.log("no file uploaded, no changes are made");
  } else {
    profilePic = req.files.profilePicture;
    profilePic.mv("public/images/" + profilePic.name);
    user.profilePic = profilePic.name;
  }
  const description = req.body.description;
  user.description = description;

  var updatedUser = await user.save();

  console.log(updatedUser);
  res.redirect("/profile?user=" + user.username);
});

// Middleware to check admin
async function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.type === "admin") {
    return next();
  }
  // Log access control failure
  await AccessControlLog.create({
    username: req.session.user ? req.session.user.username : "Guest",
    attemptedPath: req.originalUrl,
    method: req.method,
    ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
    reason: "Not an admin",
  });
  res.status(403).send("Forbidden: Admins only");
}

// Audit log page for admins
router.get("/audit", isAdmin, async (req, res) => {
  try {
    const audits = await LoginAudit.find({}).sort({ timestamp: -1 }).limit(100);
    const accessLogs = await AccessControlLog.find({})
      .sort({ timestamp: -1 })
      .limit(100);
    res.render("audit", { audits, accessLogs });
  } catch (err) {
    res.status(500).send("Error loading audit logs");
  }
});

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
      changedAt: new Date()
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

// Profile password reset routes
router.get("/password-reset", isLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    
    if (!user) {
      req.flash("error_msg", "User not found.");
      return res.redirect("/profile?user=" + req.session.user.username);
    }

    res.render("profilePasswordReset", {
      username: user.username,
      securityQuestion: user.securityQuestion,
      securityAnswerVerified: false
    });
  } catch (err) {
    console.error("Error:", err);
    req.flash("error_msg", "An error occurred. Please try again.");
    return res.redirect("/profile?user=" + req.session.user.username);
  }
});

router.post("/verify-current-password", isLoggedIn, async (req, res) => {
  console.log("Current password verification route hit");
  console.log("Request body:", req.body);
  console.log("Session user:", req.session.user);
  
  const { currentPassword } = req.body;

  if (!currentPassword) {
    console.log("No current password provided");
    return res.json({ success: false, message: "Current password is required" });
  }

  try {
    const user = await User.findById(req.session.user._id);
    console.log("Found user:", user ? user.username : "Not found");

    if (!user) {
      console.log("User not found in database");
      return res.json({ success: false, message: "User not found" });
    }

    // Verify current password
    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    console.log("Password verification result:", isPasswordCorrect);

    if (isPasswordCorrect) {
      console.log("Current password verified successfully");
      return res.json({ success: true, message: "Current password is correct" });
    } else {
      console.log("Current password verification failed");
      return res.json({ success: false, message: "Incorrect current password" });
    }
  } catch (err) {
    console.error("Error in current password verification:", err);
    return res.json({ success: false, message: "An error occurred" });
  }
});

router.post("/profile/verify-security-answer", isLoggedIn, async (req, res) => {
  console.log("Security answer verification route hit");
  console.log("Request body:", req.body);
  
  const { securityAnswer } = req.body;

  if (!securityAnswer) {
    console.log("No security answer provided");
    return res.json({ success: false, message: "Security answer is required" });
  }

  try {
    const user = await User.findById(req.session.user._id);
    console.log("Found user:", user ? user.username : "Not found");

    if (!user) {
      console.log("User not found in database");
      return res.json({ success: false, message: "User not found" });
    }

    console.log("User's security answer hash:", user.securityAnswer);
    console.log("Input security answer:", securityAnswer);
    console.log("Processed security answer:", (securityAnswer || "").toLowerCase().trim());

    // Verify security answer
    const isAnswerCorrect = await bcrypt.compare(
      (securityAnswer || "").toLowerCase().trim(),
      user.securityAnswer
    );

    console.log("Security answer verification result:", isAnswerCorrect);

    if (isAnswerCorrect) {
      console.log("Security answer verified successfully");
      return res.json({ success: true, message: "Security answer is correct" });
    } else {
      console.log("Security answer verification failed");
      return res.json({ success: false, message: "Incorrect security answer" });
    }
  } catch (err) {
    console.error("Error in security answer verification:", err);
    return res.json({ success: false, message: "An error occurred" });
  }
});

router.post("/profile/reset-password", isLoggedIn, async (req, res) => {
  const { newPassword, confirmPassword, currentPassword } = req.body;

      if (!newPassword || !confirmPassword) {
      return res.json({ success: false, message: "All password fields are required. Please try again." });
    }

    if (newPassword !== confirmPassword) {
      return res.json({ success: false, message: "Passwords do not match. Please try again." });
    }

    // Password complexity check
    if (!isPasswordComplex(newPassword)) {
      return res.json({ success: false, message: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character." });
    }

  try {
    const user = await User.findById(req.session.user._id);

    if (!user) {
      return res.json({ success: false, message: "User not found. Please try again." });
    }

    // Check if password is old enough to be changed (2 minutes for demo)
    if (!isPasswordOldEnough(user.passwordChangedAt)) {
      const timeRemaining = Math.ceil((user.passwordChangedAt.getTime() + (2 * 60 * 1000) - new Date().getTime()) / 1000 / 60);
      return res.json({ 
        success: false, 
        message: `Password cannot be changed yet. Please wait ${timeRemaining} more minute(s) before changing your password again.` 
      });
    }

    // Re-verify current password for additional security
    if (currentPassword) {
      const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordCorrect) {
        return res.json({ success: false, message: "Current password verification failed. Please try again." });
      }
    }

    // Check if new password is the same as current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.json({ success: false, message: "New password cannot be the same as your current password. Please choose a different password." });
    }

    // Check if new password exists in password history
    const isInHistory = await isPasswordInHistory(user, newPassword);
    if (isInHistory) {
      // Return JSON error response for JavaScript alert
      return res.json({ success: false, message: "Cannot use previous passwords as new password" });
    }

    // Update user's password with history tracking
    const updatedUser = await updatePasswordWithHistory(user, newPassword);
    // Update the passwordChangedAt timestamp
    updatedUser.passwordChangedAt = new Date();
    await updatedUser.save();

    // Return success response
    return res.json({ success: true, message: "Password has been successfully reset!" });
  } catch (err) {
    console.error("Error:", err);
    return res.json({ success: false, message: "An error occurred. Please try again." });
  }
});

module.exports = router;
