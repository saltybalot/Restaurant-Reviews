const { Router } = require("express");
const Restaurant = require("../database/models/Restaurant");
const Review = require("../database/models/Review");
const Rating = require("../database/models/Rating");
const User = require("../database/models/User");
const Reply = require("../database/models/Reply");
const router = Router();
const { isLoggedIn } = require("../index");

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

module.exports = router;
