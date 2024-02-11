$(document).ready(function () {
  var str;
  var found;
  var establishment = [
    {
      name: "Zark's Burgers",
      cuisine: "American",
      meals: "Breakfast, Brunch, Lunch, Dinner",
      features: "Takeout, Seating",
      location: "Manila",
      rating: 4.0,
      reviews: [
        {
          username: "Peter",
          date: "2024-02-9",
          rating: 4.0,
          review: "Delicious dishes, bursting with flavor and freshness!",
        },
        {
          username: "Donna",
          date: "2024-02-9",
          rating: 4.0,
          review:
            "Wide range of options catering to all tastes, including vegetarian and gluten-free",
        },
        {
          username: "Futaba",
          date: "2024-02-9",
          rating: 4.0,
          review:
            "Attentive, friendly staff provided excellent recommendations.",
        },
        {
          username: "Macie",
          date: "2024-02-9",
          rating: 4.0,
          review: "Cozy atmosphere with tasteful decor and relaxing music.",
        },
        {
          username: "Patricia",
          date: "2024-02-9",
          rating: 4.0,
          review:
            "Slightly pricey but generous portions and high quality justify the cost",
        },
      ],
    },

    {
      name: "Angrydobo",
      cuisine: "Filipino, Asian",
      meals: "Dinner, Lunch",
      features: "Seating, Table Service",
      location: "Manila",
      rating: "3.0",
      reviews: [
        {
          username: "Peter",
          date: "2024-02-9",
          rating: 3.0,
          review: "Delicious dishes, bursting with flavor and freshness!",
        },
      ],
    },

    {
      name: "Chomp Chomp",
      cuisine: "Asian, Singaporean",
      meals: "Dinner, Lunch",
      features: "Seating, Table Service",
      location: "Manila",
      rating: "2.0",
      reviews: [
        {
          username: "Peter",
          date: "2024-02-9",
          rating: 2.0,
          review: "The dish is pretty mid, 2/5.",
        },
      ],
    },

    {
      name: "Bon Chon",
      cuisine: "Fast Food, Asian, Korean",
      meals: "Dinner",
      features: "Wheelchair Accessible",
      location: "Manila",
      rating: "5.0",
      reviews: [
        {
          username: "Peter",
          date: "2024-02-9",
          rating: 4.0,
          review: "Delicious dishes, bursting with flavor and freshness!",
        },
      ],
    },

    {
      name: "McDonalds",
      cuisine: "Fast Food",
      meals: "Breakfast, Brunch, Lunch, Dinner",
      features: "Seating, Table Service",
      location: "Manila",
      rating: "3.0",
      reviews: [
        {
          username: "Peter",
          date: "2024-02-9",
          rating: 3.0,
          review: "Delicious dishes, bursting with flavor and freshness!",
        },
      ],
    },
  ];

  $("#searchButton").click(function () {
    let inputValue = $("#search").val();
    let tempEstablishment = [];

    found = -1;

    for (i = 0; i < establishment.length; i++) {
      str = establishment[i].name.toUpperCase();
      inputValue = inputValue.toUpperCase();
      if (str.search(inputValue) != -1) {
        console.log("Name Found");
        /* insert code here */
        found = 1;
      } else {
        tempEstablishment.push(establishment[i]);
      }
    }

    let temp = [];

    for (i = 0; i < tempEstablishment.length; i++) {
      str = tempEstablishment[i].cuisine.toUpperCase();
      inputValue = inputValue.toUpperCase();
      if (str.search(inputValue) != -1) {
        console.log("Cuisine Found");
        /* insert code here */

        found = 1;
      } else {
        temp.push(tempEstablishment[i]);
      }
    }
    tempEstablishment = temp;
    temp = [];

    for (i = 0; i < tempEstablishment.length; i++) {
      str = tempEstablishment[i].features.toUpperCase();
      inputValue = inputValue.toUpperCase();
      if (str.search(inputValue) != -1) {
        console.log("feature Found");
        /* insert code here */

        found = 1;
      } else {
        temp.push(tempEstablishment[i]);
      }
    }

    for (i = 0; i < tempEstablishment.length; i++) {
      str = tempEstablishment[i].location.toUpperCase();
      inputValue = inputValue.toUpperCase();
      if (str.search(inputValue) != -1) {
        console.log("location Found");
        /* insert code here */

        found = 1;
      } else {
        temp.push(tempEstablishment[i]);
      }
    }

    if (found == -1) {
      console.log("No Found");
      /* insert code here */
    }
  });
});
