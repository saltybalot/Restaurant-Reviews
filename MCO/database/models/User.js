const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  profilePic: String,
  description: String,
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
