const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  restaurant: String,
  username: String,
  date: Date,
  rating: Number,
  image: String,
  body: String,
  helpful: Number,
});

const Review = mongoose.model("Review", ReviewSchema);

module.exports = Review;
