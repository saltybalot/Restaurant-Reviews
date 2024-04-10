const { Router } = require("express");
const Restaurant = require("../database/models/Restaurant");
const Review = require("../database/models/Review");
const Rating = require("../database/models/Rating");
const User = require("../database/models/User");
const Reply = require("../database/models/Reply");
const router = Router();

// Search route
const express = require('express');
const app = express();
const establishmentData = require('./establishmentData'); //  data in a separate file

// GET route to handle search
/*
app.get('/search', async (req, res) => {
  const { query } = req.query;
  try {
      const restaurants = await Restaurant.find({
          name: { $regex: new RegExp(query, 'i') } // Case-insensitive search
      });
      res.render('search', { restaurants, query });
  } catch (error) {
      console.error('Error searching for restaurants:', error);
      res.status(500).send('Internal Server Error');
  }
}); */

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
