const { Router } = require("express");
const Restaurant = require("../database/models/Restaurant");
const Review = require("../database/models/Review");
const Rating = require("../database/models/Rating");
const User = require("../database/models/User");
const Reply = require("../database/models/Reply");
const router = Router();

router.get("/view", async (req, res) => {
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

var reviewArray = [];
var currentRestaurant;

/**
 * This is for filtering reviews in VIEW page
 */

router.get("/filter", async (req, res) => {
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
router.post("/reviewSubmit", async (req, res) => {
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

router.get("/getHelp", async (req, res) => {
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
router.get("/writeReply", async (req, res) => {
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

module.exports = router;
