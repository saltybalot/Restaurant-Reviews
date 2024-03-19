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

  res.render("loggedOutIndex", { review });
});

app.get("/view", async (req, res) => {
  const content = req.query.restaurant;
  let reviewID = req.query.reviewID;
  const searchQuery = req.query.searchQuery;

  console.log("Query: " + reviewID);
  const restaurant = await Restaurant.findOne({ name: content });
  const rating = await Rating.findOne({ restaurant: content });
  //const review = await Review.find({ restaurant: content });

  let tempQuery = {};
  tempQuery["restaurant"] = content;

  if (searchQuery != null) {
    tempQuery["body"] = new RegExp(searchQuery, "i");
  }

  console.log(tempQuery);

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
      $match: tempQuery,
    },
    {
      $sort: { dateObject: -1 }, // Sort based on the new Date object field
    },
  ]);
  const user = await User.findOne({ username: "PatriciaTom" });

  let userReview;
  let firstReviewId;

  /*
  console.log(restaurant);
  console.log(rating.food);
  console.log(review);
  console.log(user);*/

  if (searchQuery != null) {
    reviewID = review[0]._id.toString();
    console.log("wahoooo");
    console.log(review[0]._id.toString());
  }

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

var reviewArray = [];
var currentRestaurant;
app.get("/filter", async (req, res) => {
  const restaurant = req.query.restaurant;
  const rating = parseInt(req.query.rating);
  const isChecked = req.query.isChecked === "true";
  let temp = [];

  if (restaurant != undefined) {
    console.log(rating + "is " + isChecked + restaurant);

    if (currentRestaurant != restaurant) {
      reviewArray = [];
      currentRestaurant = restaurant;
    }
    if (isChecked) {
      reviewArray.push(rating);
      temp = reviewArray;
    } else {
      console.log("array data deleted");
      temp = reviewArray.filter((item) => item !== rating);
      reviewArray = temp;
    }

    if (reviewArray.length == 0) {
      temp = [1, 2, 3, 4, 5];
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
        $match: {
          restaurant: currentRestaurant,
          rating: { $in: temp },
        },
      },
      {
        $sort: { dateObject: -1 }, // Sort based on the new Date object field
      },
    ]);
    console.log(reviews);
    console.log(reviewArray.length);
    console.log(reviewArray);

    //console.log(content);
    res.send(reviews);
  }
});

app.get("/reviewSubmit", async (req, res) => {
  const restaurant = req.query.restaurant;
  const username = req.query.username;
  const image = req.query.image;
  const rating = parseInt(req.query.rating);
  const body = req.query.body;
  const id = req.query.id;

  const newReview = new Review({
    restaurant: restaurant,
    username: username,
    date: getCurrentDate(),
    rating: rating,
    image: image,
    body: body,
    helpful: 0,
    userId: id,
  });

  let savedReview = await newReview.save();

  console.log(savedReview);
});

app.get("/getHelp", async (req, res) => {
  const reviewID = req.query.id;
  const isHelpful = req.query.isHelpful === "true";

  const selectedReview = await Review.findById(reviewID);
  if (isHelpful) {
    selectedReview.helpful++;
  } else {
    selectedReview.helpful--;
  }
  let temp = await selectedReview.save();
  console.log("r/woooooooooooooooooooooooooooosh");
  console.log(temp);
});

app.get("/about", async (req, res) => {
  res.render("about");
});

app.post("/reviewSearch", async (req, res) => {
  console.log(req.body.body);

  const query = req.body.body;
  const restoName = req.body.restoName;
  res.redirect("/view?restaurant=" + restoName + "&searchQuery=" + query);
});

var server = app.listen(3000, function () {
  console.log("Node server running at port 3000");
});

// Other Functions
function getCurrentDate() {
  const currentDate = new Date();

  // Get the year, month, and day
  const year = currentDate.getFullYear();
  let month = currentDate.getMonth() + 1; // Month starts from 0
  let day = currentDate.getDate();

  // Add leading zeros if month/day is single digit
  month = month < 10 ? "0" + month : month;
  day = day < 10 ? "0" + day : day;

  // Return the date in "YYYY-MM-DD" format
  return `${year}-${month}-${day}`;
}
