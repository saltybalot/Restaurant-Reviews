const mongoose = require("mongoose");

try {
  mongoose.connect("mongodb://127.0.0.1:27017/RestaurantReview");
  console.log("Connected to MongoDB successfully");
} catch (err) {
  console.error(err);
}

var express = require("express");
var app = new express();

/* For file uplods */
const fileUpload = require("express-fileupload");

/* Initialize our post */
const Restaurant = require("./database/models/Restaurant");
const Review = require("./database/models/Review");
const Rating = require("./database/models/Rating");
const User = require("./database/models/User");
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

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});

/*
app.get("/submit", function (req, res) {
  var name = req.query.firstname + " " + req.query.secondname;
  res.send(name);
});

app.post("/submit", function (req, res) {
  var name = req.body.firstname + " " + req.body.secondname;
  res.send(name);
});
*/

var server = app.listen(3000, function () {
  console.log("Node server running at port 3000");
});
