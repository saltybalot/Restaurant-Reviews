const mongoose = require("mongoose");

const RatingSchema = new mongoose.Schema({
  restaurant: String,
  food: Number,
  service: Number,
  value: Number,
  atmosphere: Number,
});

const Rating = mongoose.model("Rating", RatingSchema);

module.exports = Rating;
