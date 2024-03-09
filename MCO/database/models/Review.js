const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  restaurant: String,
  username: String,
  date: Date,
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
