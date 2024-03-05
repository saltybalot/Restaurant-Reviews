const mongoose = require("mongoose");

const RestaurantSchema = new mongoose.Schema({
  name: String,
  cuisine: String,
  meals: String,
  features: String,
  locations: String,
  website: String,
  phone: String,
  images: [String],
});

const Restaurant = mongoose.model("Restaurant", RestaurantSchema);

module.exports = Restaurant;
