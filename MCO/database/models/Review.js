const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  restaurant: String,
  username: String,
  date: String,
  rating: Number,
  image: String,
  body: String,
  helpful: Number,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Review = mongoose.model("Review", ReviewSchema);

module.exports = Review;
