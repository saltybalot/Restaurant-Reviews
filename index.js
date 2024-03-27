const port = process.env.PORT || 3000;
const mongoose = require("mongoose");
const connectionString =
  process.env.DATABASE_URL || "mongodb://127.0.0.1:27017/RestaurantDB";
console.log(connectionString);
const session = require("express-session");
const flash = require("connect-flash");
const MongoStore = require("connect-mongo")(session);
const exphbs = require("express-handlebars");

try {
  mongoose.connect(connectionString);
  console.log("Connected to MongoDB successfully");
} catch (err) {
  console.error(err);
}

var express = require("express");
var app = new express();

/* For file uplods */
const fileUpload = require("express-fileupload");
app.use(fileUpload()); //initialize file upload middleware

/* Initialize our post */
const Restaurant = require("./database/models/Restaurant");
const Review = require("./database/models/Review");
const Rating = require("./database/models/Rating");
const User = require("./database/models/User");
const Reply = require("./database/models/Reply");
const path = require("path"); // our path directory

const viewRouter = require("./routes/viewRoute.js");
const authRouter = require("./routes/auth.js");

var bodyParser = require("body-parser");

app.use(express.json()); // use json
app.use(express.urlencoded({ extended: true })); // files consist of more than strings
app.use(express.static("public"));

/* We'll use handlebars for this one */
var hbs = require("hbs");
app.set("view engine", "hbs");

app.use("/", viewRouter);
app.use("/", authRouter);

/*
const restaurant = Restaurant.find({});
console.log(restaurant);
*/
/*
async function findRatings() {
  try {
    const ratings = await Rating.find({});

    if (ratings.length > 0) {
      console.log(ratings);
    } else {
      console.log("empty");
    }
  } catch (err) {
    console.error("Error finding ratings", err);
  }
}

findRatings();
*/
app.use(
  session({
    secret: "somegibberishsecret",
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 * 7 },
  })
);

// Flash
app.use(flash());

// Global messages vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

/**
 * This is for Index page
 */

app.get("/", async (req, res) => {
  //temporarily adding toDate field to sort
  req.session.isAuth = true;
  console.log(req.session);
  const review = await Review.aggregate([
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
      $sort: { dateObject: -1 }, // Sort based on the new Date object field
    },
  ]);
  const user = await Review.find({}).populate("userId");
  console.log(review);

  res.render("loggedoutIndex", { review });
});

/**
 * Logged our version of Index page (I'm not sure if this is relevant)
 */

app.get("/loggedOut", async (req, res) => {
  //temporarily adding toDate field to sort
  const review = await Review.aggregate([
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
      $sort: { dateObject: -1 }, // Sort based on the new Date object field
    },
  ]);
  const user = await Review.find({}).populate("userId");
  console.log(review);

  res.render("index", { review });
});

/**
 * This is for rendering the VIEW page
 */

/**
 * This is for rendering the PROFILE page
 */

app.get("/profile", async (req, res) => {
  const username = req.query.user;
  console.log("user query: " + username);

  try {
    const user = await User.findOne({ username: username });
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
    res.render("profile", { user, reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * This is For About Page
 */

app.get("/about", async (req, res) => {
  res.render("about");
});

/**
 * This is for review search query in VIEW page
 */

app.post("/reviewSearch", async (req, res) => {
  console.log("This is the search module");
  console.log(req.body.body);

  const query = req.body.body;
  const restoName = req.body.restoName;
  res.redirect("/view?restaurant=" + restoName + "&searchQuery=" + query);
});

/**
 * This for editing and deleting reviews in ABOUT page
 */

app.get("/reviewEdit", async (req, res) => {
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

  res.redirect("/profile?user=PatriciaTom"); //edit this after session is implemented
});

app.get("/reviewDelete", async (req, res) => {
  const id = req.query.id;

  console.log(id);

  editedReview = await Review.findByIdAndDelete(id);
  res.redirect("/profile?user=PatriciaTom"); //edit this after session is implemented
});

/**
 * This is for editing profile in the PROFILE page
 */

app.post("/editProfile", async (req, res) => {
  var user = await User.findById("65e70e1fb8ad88c9f4512d2d"); //edit this after session is implemented
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
  res.redirect("/profile?user=PatriciaTom");
});

var server = app.listen(port, "0.0.0.0", function () {
  console.log("Node server running at port " + port);
});
