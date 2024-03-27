const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  profilePic: String,
  description: String,
});

const User = mongoose.model("User", UserSchema);

module.exports = User;

exports.create = function(obj, next) {
  const user = new User(obj);

  user.save(function(err, user) {
    next(err, user);
  });
};

// Retrieving a user based on ID
exports.getById = function(id, next) {
  User.findById(id, function(err, user) {
    next(err, user);
  });
};

// Retrieving just ONE user based on a query (first one)
exports.getOne = function(query, next) {
  User.findOne(query, function(err, user) {
    next(err, user);
  });
};
