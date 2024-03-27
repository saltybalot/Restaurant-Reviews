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
const profileRouter = require("./routes/profileRoute.js");

var bodyParser = require("body-parser");

app.use(express.json()); // use json
app.use(express.urlencoded({ extended: true })); // files consist of more than strings
app.use(express.static("public"));

/* We'll use handlebars for this one */
var hbs = require("hbs");
app.set("view engine", "hbs");

app.use("/", viewRouter);
app.use("/", authRouter);
app.use("/", profileRouter);

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
 * This is For About Page
 */

app.get("/about", async (req, res) => {
  res.render("about");
});

var server = app.listen(port, "0.0.0.0", function () {
  console.log("Node server running at port " + port);
});
