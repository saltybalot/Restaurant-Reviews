const mongoose = require("mongoose");

try {
  mongoose.connect("mongodb://127.0.0.1:27017/RestaurantDB");
  console.log("Connected to MongoDB successfully");
} catch (err) {
  console.error(err);
}

var express = require("express");
var app = new express();

/* For file uplods */
const fileUpload = require("express-fileupload");

/* Initialize our post */
const Restaurant = require("./database/models/Restaurant");
const Review = require("./database/models/Review");
const Rating = require("./database/models/Rating");
const User = require("./database/models/User");
const path = require("path"); // our path directory

var bodyParser = require("body-parser");

app.use(express.json()); // use json
app.use(express.urlencoded({ extended: true })); // files consist of more than strings
app.use(express.static("public"));

/* We'll use handlebars for this one */
var hbs = require("hbs");
app.set("view engine", "hbs");

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

app.get("/", async (req, res) => {
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

app.get("/view", async (req, res) => {
  const content = req.query.restaurant;
  const reviewID = req.query.reviewID;

  console.log("Query: " + reviewID);
  const restaurant = await Restaurant.findOne({ name: content });
  const rating = await Rating.findOne({ restaurant: content });
  //const review = await Review.find({ restaurant: content });
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
      $match: {
        restaurant: content,
      },
    },
    {
      $sort: { dateObject: -1 }, // Sort based on the new Date object field
    },
  ]);
  const user = await User.findOne({ username: "PatriciaTom" });

  let userReview;
  let reviewId;

  /*
  console.log(restaurant);
  console.log(rating.food);
  console.log(review);
  console.log(user);*/

  //get the average review rating
  let reviewArray = [];
  let ratingMatrix = [0, 0, 0, 0, 0];
  //                  1  2  3  4  5 stars

  review.forEach((reviewNum, i) => {
    reviewArray.push(reviewNum.rating);
    ratingMatrix[reviewArray[i] - 1]++;
  });

  //Testing the rating tally portion
  console.log("num of 1*s: " + ratingMatrix[0]);
  console.log("num of 2*s: " + ratingMatrix[1]);
  console.log("num of 3*s: " + ratingMatrix[2]);
  console.log("num of 4*s: " + ratingMatrix[3]);
  console.log("num of 5*s: " + ratingMatrix[4]);

  let reviewSum = reviewArray.reduce((acc, val) => acc + val, 0);

  console.log(reviewSum);
  let reviewAverage = reviewSum / reviewArray.length;
  let reviewValue = Math.round(reviewAverage);
  res.render("view", {
    restaurant,
    rating,
    review,
    user,
    reviewValue,
    reviewLength: reviewArray.length,
    reviewID,
    excellent: ratingMatrix[4],
    veryGood: ratingMatrix[3],
    average: ratingMatrix[2],
    poor: ratingMatrix[1],
    terrible: ratingMatrix[0],
  });

  if (reviewID != null) {
    userReview = await Review.find({ _id: reviewID });
    console.log(userReview);
    const convertedReview = userReview.map((doc) => {
      const convertedDoc = { ...doc.toObject() };
      convertedDoc._id = convertedDoc._id.toString();
      reviewId = convertedDoc._id;
    });

    console.log(reviewId);
  }
});

app.get("/search", async (req, res) => {
  res.render("search");
});

/*
app.get("/submit", function (req, res) {
  var name = req.query.firstname + " " + req.query.secondname;
  res.send(name);
});

app.post("/submit", function (req, res) {
  var name = req.body.firstname + " " + req.body.secondname;
  res.send(name);
});
*/

var server = app.listen(3000, function () {
  console.log("Node server running at port 3000");
});
