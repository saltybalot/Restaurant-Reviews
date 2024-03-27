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
      $match: tempQuery,
    },
    {
      $sort: { dateObject: -1 }, // Sort based on the new Date object field
    },
  ]);

  /*
  const reply = await Reply.aggregate([
    {
      $addFields: {
        dateObject: {
          $toDate: "$date", // Convert the date string to a Date object
        },
      },
    },

    {
      $lookup: {
        from: "reviews",
        localField: "reviewId",
        foreignField: "_id",
        as: "reviewDetails",
      },
    },
    {
      $unwind: "$reviewDetails",
    },
    {
      $match: { restaurant: content },
    },
    {
      $sort: { dateObject: -1 }, // Sort based on the new Date object field
    },
  ]);*/

  console.log("review:");
  console.log(review);
  const user = await User.findOne({ username: "PatriciaTom" });

  let userReview;

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

var reviewArray = [];
var currentRestaurant;

/**
 * This is for filtering reviews in VIEW page
 */

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

/**
 * This is for writing new reviews in the VIEW page
 */
app.post("/reviewSubmit", async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  const restaurant = req.body.restaurant;
  const username = "PatriciaTom"; //placeholder, please replace if you have session
  const image = req.files.media;
  const rating = parseInt(req.body.rating);
  const body = req.body.reviewBody;
  const id = "65e70e1fb8ad88c9f4512d2d"; //placeholder, please replace if you have session

  console.log(
    "If you see this text when you submit the reply, you have a problem"
  );

  image.mv("public/images/" + image.name);

  const newReview = new Review({
    restaurant: restaurant,
    username: username,
    date: getCurrentDate(),
    rating: rating,
    image: image.name,
    body: body,
    helpful: 0,
    userId: id,
  });

  let savedReview = await newReview.save();

  res.redirect(
    "/view?restaurant=" + restaurant + "&reviewID=" + savedReview._id
  );

  console.log(savedReview);
});

/**
 * This is for the helpful function in VIEW page
 */

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

/**
 * This is for writing new reply/response to reviews as a
 * establishment owner in the VIEW page
 */
app.get("/writeReply", async (req, res) => {
  const id = req.query.id;
  const replyBody = req.query.body;

  const review = await Review.findById(id);
  let newReply = new Reply({
    restaurant: review.restaurant,
    username: review.restaurant, //Placeholder
    date: getCurrentDate(),
    body: replyBody,
    reviewId: id,
  });

  let savedReply = newReply.save();

  console.log("Saved Reply:");
  console.log(savedReply);

  res.redirect("/view?restaurant=" + review.restaurant + "&reviewID=" + id);
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
