const mongoose = require("mongoose");

const ReplySchema = new mongoose.Schema({
  restaurant: String,
  username: String,
  date: String,
  body: String,
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Review",
  },
});

const Review = mongoose.model("Reply", ReplySchema);

module.exports = Review;
