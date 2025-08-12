const { Router } = require("express");
const Restaurant = require("../database/models/Restaurant");
const User = require("../database/models/User");
const router = Router();
const { isLoggedIn } = require("../index");
const AccessControlLog = require("../database/models/AccessControlLog");
const DataValidationLog = require("../database/models/DataValidationLog");
const bcrypt = require("bcryptjs");
const { establishmentValidation } = require("../validators");
const { validationResult } = require("express-validator");

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

// Admin establishment management page
router.get("/establishments", isLoggedIn, isAdmin, async (req, res) => {
  const add_est_error_msg_arr = req.flash("add_est_error_msg");
  const add_est_error_msg = add_est_error_msg_arr.length ? add_est_error_msg_arr[0] : null;

  console.log(add_est_error_msg)

  try {
    const establishments = await Restaurant.find({}).sort({ name: 1 });
    res.render("admin-establishments", {
      establishments,
      user: req.session.user,
      pageTitle: "Admin - Establishments",
      add_est_error_msg
    });
  } catch (err) {
    console.error("Error loading establishments:", err);
    res.status(500).send("Error loading establishments");
  }
});

// Add new establishment
router.post("/establishments/add", isLoggedIn, isAdmin, establishmentValidation, async (req, res) => {
  const {
    addName: name,
    addCuisine: cuisine,
    addMeals: meals,
    addFeatures: features,
    addLocations: locations,
    addWebsite: website,
    addPhone: phone,
    addPassword: password
  } = req.body;

  const logBase = {
    username: req.session.user.username || "unknown",
    action: "ADD_ESTABLISHMENT",
    data: JSON.stringify(req.body),
  };

  const errors = validationResult(req);
  console.log('Is errors empty? ' + errors.isEmpty())

  if (!errors.isEmpty()) {
    const messages = errors.array().map(item => item.msg);
    await DataValidationLog.create({
      ...logBase,
      result: messages.join(" "),
    });

    // Check if request is AJAX (fetch)
    if (req.headers['content-type'] === 'application/json') {
      return res.status(400).json({
        success: false,
        message: messages.join(" "),
      });
    }

    req.flash("add_est_error_msg", messages.join(" "));
    return res.redirect("/establishments");
    
  } else {
    try {
      // Validate required fields
      if (!name || !cuisine || !locations) {
        await DataValidationLog.create({
          username: req.session.user.username,
          action: "ADD_ESTABLISHMENT",
          data: JSON.stringify(req.body),
          result: "Missing required fields: name, cuisine, or locations",
        });
        return res.status(400).json({
          success: false,
          message: "Name, cuisine, and locations are required fields.",
        });
      }

      // Check if establishment already exists
      const existingEstablishment = await Restaurant.findOne({ name: name });
      if (existingEstablishment) {
        await DataValidationLog.create({
          username: req.session.user.username,
          action: "ADD_ESTABLISHMENT",
          data: JSON.stringify(req.body),
          result: "Establishment with this name already exists",
        });

        req.flash("add_est_error_msg", "An establishment with this name already exists.");
        return res.redirect("/establishments");
      }

      // Create new establishment
      const newEstablishment = new Restaurant({
        name: name.trim(),
        cuisine: cuisine.trim(),
        meals: meals ? meals.trim() : "",
        features: features ? features.trim() : "",
        locations: locations.trim(),
        website: website ? website.trim() : "",
        phone: phone ? phone.trim() : "",
        images: [],
      });

      await newEstablishment.save();

      await DataValidationLog.create({
        username: req.session.user.username,
        action: "ADD_ESTABLISHMENT",
        data: JSON.stringify(req.body),
        result: "Success",
      });

      const saltRounds = 10;
      const hashed = await bcrypt.hash(password.trim(), saltRounds);

      const newUser = new User({
        username: name.trim(),
        password: hashed,
        type: "establishment",
      });
      await newUser.save();

      res.json({
        success: true,
        message: "Establishment added successfully!",
        establishment: newEstablishment,
      });
    } catch (err) {
      console.error("Error adding establishment:", err);

      await DataValidationLog.create({
        username: req.session.user.username,
        action: "ADD_ESTABLISHMENT",
        data: JSON.stringify(req.body),
        result: "Database error",
      });

      // res.status(500).json({
      //   success: false,
      //   message: "Error adding establishment. Please try again.",
      // });

      req.flash("add_est_error_msg", "Error adding establishment. Please try again.");
      return res.redirect("/establishments");
    }
  }
});

// Delete establishment
router.delete("/establishments/:id", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const establishment = await Restaurant.findByIdAndDelete(req.params.id);

    if (!establishment) {
      return res.status(404).json({
        success: false,
        message: "Establishment not found.",
      });
    }

    await DataValidationLog.create({
      username: req.session.user.username,
      action: "DELETE_ESTABLISHMENT",
      data: JSON.stringify({
        establishmentId: req.params.id,
        establishmentName: establishment.name,
      }),
      result: "Success",
    });

    res.json({
      success: true,
      message: "Establishment deleted successfully!",
    });
  } catch (err) {
    console.error("Error deleting establishment:", err);
    res.status(500).json({
      success: false,
      message: "Error deleting establishment. Please try again.",
    });
  }
});

// Update establishment
router.put("/establishments/:id", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { name, cuisine, meals, features, locations, website, phone } =
      req.body;

    // Validate required fields
    if (!name || !cuisine || !locations) {
      await DataValidationLog.create({
        username: req.session.user.username,
        action: "UPDATE_ESTABLISHMENT",
        data: JSON.stringify(req.body),
        result: "Missing required fields: name, cuisine, or locations",
      });
      return res.status(400).json({
        success: false,
        message: "Name, cuisine, and locations are required fields.",
      });
    }

    // Check if name already exists for different establishment
    const existingEstablishment = await Restaurant.findOne({
      name: name.trim(),
      _id: { $ne: req.params.id },
    });

    if (existingEstablishment) {
      await DataValidationLog.create({
        username: req.session.user.username,
        action: "UPDATE_ESTABLISHMENT",
        data: JSON.stringify(req.body),
        result: "Establishment with this name already exists",
      });
      return res.status(400).json({
        success: false,
        message: "An establishment with this name already exists.",
      });
    }

    const updatedEstablishment = await Restaurant.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        cuisine: cuisine.trim(),
        meals: meals ? meals.trim() : "",
        features: features ? features.trim() : "",
        locations: locations.trim(),
        website: website ? website.trim() : "",
        phone: phone ? phone.trim() : "",
      },
      { new: true }
    );

    if (!updatedEstablishment) {
      return res.status(404).json({
        success: false,
        message: "Establishment not found.",
      });
    }

    await DataValidationLog.create({
      username: req.session.user.username,
      action: "UPDATE_ESTABLISHMENT",
      data: JSON.stringify(req.body),
      result: "Success",
    });

    res.json({
      success: true,
      message: "Establishment updated successfully!",
      establishment: updatedEstablishment,
    });
  } catch (err) {
    console.error("Error updating establishment:", err);
    await DataValidationLog.create({
      username: req.session.user.username,
      action: "UPDATE_ESTABLISHMENT",
      data: JSON.stringify(req.body),
      result: "Database error",
    });
    res.status(500).json({
      success: false,
      message: "Error updating establishment. Please try again.",
    });
  }
});

module.exports = router;
