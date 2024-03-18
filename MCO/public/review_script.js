var modal = document.getElementById("myModal");

var btn = document.getElementById("reviewButton");

var span = document.getElementsByClassName("close")[0];

btn.onclick = function () {
  modal.style.display = "block";
};

span.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

document.getElementById("reviewForm").onsubmit = function (event) {
  event.preventDefault();
  modal.style.display = "none";
};

btn.onclick = function () {
  modal.style.display = "block";
};

span.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

var stars = document.querySelectorAll(".star2");
var starValue = 1;

stars.forEach(function (star) {
  star.addEventListener("click", function () {
    var value = parseInt(star.dataset.value);

    starValue = value;
    document.getElementById("rating").value = value;
    stars.forEach(function (s) {
      if (parseInt(s.dataset.value) <= value) {
        s.classList.add("active");
      } else {
        s.classList.remove("active");
      }
    });
  });
});

var helpfulbtns = document.querySelectorAll(".helpfulButton");

helpfulbtns.forEach((button) => {
  button.addEventListener("click", () => {
    var parentItem = button.closest(".helpful");

    parentItem.textContent = "👍(1) Thanks for your vote";
  });
});

var reviewImg;
var reviewText;

var fileForm = document.getElementById("media");
var textForm = document.getElementById("reviewBody");
var reviewTable = document.getElementById("reviewtable");

fileForm.addEventListener("change", function (event) {
  var fileList = event.target.files;
  reviewImg = fileList[0].name;
  console.log(reviewImg);
});

document.getElementById("reviewForm").onsubmit = function (event) {
  var restoName = document.querySelector(".username").textContent;
  var userID = document.getElementById("userID").value;
  reviewText = textForm.value;
  console.log(reviewText);

  var xhr = new XMLHttpRequest();

  // Make a GET request

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
      // Handle the response
      //console.log(xhr.responseText);
    }
  };
  xhr.open(
    "GET",
    "/reviewSubmit?restaurant=" +
      restoName +
      "&username=PatriciaTom" +
      "&image=" +
      reviewImg +
      "&rating=" +
      starValue +
      "&body=" +
      reviewText +
      "&id=" +
      userID,
    true
  );
  xhr.send();

  reviewTable.insertAdjacentHTML(
    "beforeend",
    `<tr>
  <td class="reviewBody">
      <div class="review">
          <div class="review-info">
              <img src="images/profilephoto.jpg" alt="User Profile Picture" class="profile-pic">
              <p class="review-label">Inda Karane reviewed <span
                      class="restaurant-name">McDonalds</span> <br><span class="date">
                      02/12/2024</span></p>
          </div>

          <img src="images/${reviewImg}" alt="Restaurant Review" class="review-photo">
          <img src="images/${starValue}star.png" class="star">
          <p class="review-content">${reviewText}</p>
          <span class="helpful">Helpful?<button class="helpfulButton">👍</button> </span>
      </div>
  </td>
</tr>`
  );
  event.preventDefault();
  modal.style.display = "none";
};

var check1 = document.getElementById("excellent");
var check2 = document.getElementById("veryGood");
var check3 = document.getElementById("average");
var check4 = document.getElementById("poor");
var check5 = document.getElementById("terrible");

check1.addEventListener("change", function () {
  var isChecked = this.checked;
  var xhr = new XMLHttpRequest();
  var restoName = document.querySelector(".username").textContent;
  reviewTable = document.getElementById("reviewtable");

  var uniqueParam = "timestamp=" + new Date().getTime();

  console.log(document.querySelector(".username").textContent);

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        //console.log(xhr.responseText);
        let sections = JSON.parse(xhr.responseText);

        let reviewRows = document.querySelectorAll(".reviewRow");
        reviewRows.forEach(function (row) {
          row.parentNode.removeChild(row);
        });

        sections.forEach(function (row) {
          let tr = document.createElement("tr");
          tr.className = "reviewRow";

          let td = document.createElement("td");
          td.className = "reviewBody";
          td.id = row._id;

          let reviewDiv = document.createElement("div");
          reviewDiv.className = "review";

          let reviewInfo = document.createElement("div");
          reviewInfo.className = "review-info";
          reviewInfo.innerHTML = `<img src="images/${row.userDetails.profilePic}" alt="User Profile Picture"
          class="profile-pic">
          <p class="review-label">${row.username} reviewed <span
              class="restaurant-name">${row.restaurant}</span> <br><span class="date">
              ${row.date}</span></p>`;

          let helpfulSpan = document.createElement("span");
          helpfulSpan.className = "helpful";

          let helpButton = document.createElement("button");
          helpButton.className = "helpfulButton";

          helpfulSpan.innerHTML = `Helpful?(${row.helpful})`;
          helpButton.innerHTML = `👍`;

          reviewTable.appendChild(tr);
          tr.appendChild(td);
          td.appendChild(reviewDiv);
          reviewDiv.appendChild(reviewInfo);
          reviewDiv.innerHTML += `<img src="images/${row.image}" alt="Restaurant Review" class="review-photo">
          <img src="images/${row.rating}star.png" class="star">
          <p class="review-content">${row.body}</p>`;
          //reviewDiv.appendChild(reviewBottom);
          reviewDiv.appendChild(helpfulSpan);
          helpfulSpan.appendChild(helpButton);
        });

        console.log(sections[0]);
        helpfulbtns = document.querySelectorAll(".helpfulButton");

        helpfulbtns.forEach((button) => {
          button.addEventListener("click", () => {
            var parentItem = button.closest(".helpful");

            parentItem.textContent = "👍 Thanks for your vote";
          });
        });
      } else {
        console.error("Error fetching section content:", xhr.status);
      }
    }
  };

  if (restoName != undefined) {
    xhr.open(
      "GET",
      "/filter?restaurant=" +
        restoName +
        "&rating=5&isChecked=" +
        isChecked +
        "&" +
        uniqueParam,
      true
    );
    xhr.send();
  }
});

check2.addEventListener("change", function () {
  var isChecked = this.checked;
  var xhr = new XMLHttpRequest();
  var restoName = document.querySelector(".username").textContent;
  reviewTable = document.getElementById("reviewtable");

  var uniqueParam = "timestamp=" + new Date().getTime();

  console.log(document.querySelector(".username").textContent);

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        //console.log(xhr.responseText);
        let sections = JSON.parse(xhr.responseText);

        let reviewRows = document.querySelectorAll(".reviewRow");
        reviewRows.forEach(function (row) {
          row.parentNode.removeChild(row);
        });

        sections.forEach(function (row) {
          let tr = document.createElement("tr");
          tr.className = "reviewRow";

          let td = document.createElement("td");
          td.className = "reviewBody";
          td.id = row._id;

          let reviewDiv = document.createElement("div");
          reviewDiv.className = "review";

          let reviewInfo = document.createElement("div");
          reviewInfo.className = "review-info";
          reviewInfo.innerHTML = `<img src="images/${row.userDetails.profilePic}" alt="User Profile Picture"
          class="profile-pic">
          <p class="review-label">${row.username} reviewed <span
              class="restaurant-name">${row.restaurant}</span> <br><span class="date">
              ${row.date}</span></p>`;

          let helpfulSpan = document.createElement("span");
          helpfulSpan.className = "helpful";

          let helpButton = document.createElement("button");
          helpButton.className = "helpfulButton";

          helpfulSpan.innerHTML = `Helpful?(${row.helpful})`;
          helpButton.innerHTML = `👍`;

          reviewTable.appendChild(tr);
          tr.appendChild(td);
          td.appendChild(reviewDiv);
          reviewDiv.appendChild(reviewInfo);
          reviewDiv.innerHTML += `<img src="images/${row.image}" alt="Restaurant Review" class="review-photo">
          <img src="images/${row.rating}star.png" class="star">
          <p class="review-content">${row.body}</p>`;
          //reviewDiv.appendChild(reviewBottom);
          reviewDiv.appendChild(helpfulSpan);
          helpfulSpan.appendChild(helpButton);
        });

        console.log(sections[0]);
        helpfulbtns = document.querySelectorAll(".helpfulButton");

        helpfulbtns.forEach((button) => {
          button.addEventListener("click", () => {
            var parentItem = button.closest(".helpful");

            parentItem.textContent = "👍 Thanks for your vote";
          });
        });
      } else {
        console.error("Error fetching section content:", xhr.status);
      }
    }
  };

  if (restoName != undefined) {
    xhr.open(
      "GET",
      "/filter?restaurant=" +
        restoName +
        "&rating=4&isChecked=" +
        isChecked +
        "&" +
        uniqueParam,
      true
    );
    xhr.send();
  }
});

check3.addEventListener("change", function () {
  var isChecked = this.checked;
  var xhr = new XMLHttpRequest();
  var restoName = document.querySelector(".username").textContent;
  reviewTable = document.getElementById("reviewtable");

  var uniqueParam = "timestamp=" + new Date().getTime();

  console.log(document.querySelector(".username").textContent);

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        //console.log(xhr.responseText);
        let sections = JSON.parse(xhr.responseText);

        let reviewRows = document.querySelectorAll(".reviewRow");
        reviewRows.forEach(function (row) {
          row.parentNode.removeChild(row);
        });

        sections.forEach(function (row) {
          let tr = document.createElement("tr");
          tr.className = "reviewRow";

          let td = document.createElement("td");
          td.className = "reviewBody";
          td.id = row._id;

          let reviewDiv = document.createElement("div");
          reviewDiv.className = "review";

          let reviewInfo = document.createElement("div");
          reviewInfo.className = "review-info";
          reviewInfo.innerHTML = `<img src="images/${row.userDetails.profilePic}" alt="User Profile Picture"
          class="profile-pic">
          <p class="review-label">${row.username} reviewed <span
              class="restaurant-name">${row.restaurant}</span> <br><span class="date">
              ${row.date}</span></p>`;

          let helpfulSpan = document.createElement("span");
          helpfulSpan.className = "helpful";

          let helpButton = document.createElement("button");
          helpButton.className = "helpfulButton";

          helpfulSpan.innerHTML = `Helpful?(${row.helpful})`;
          helpButton.innerHTML = `👍`;

          reviewTable.appendChild(tr);
          tr.appendChild(td);
          td.appendChild(reviewDiv);
          reviewDiv.appendChild(reviewInfo);
          reviewDiv.innerHTML += `<img src="images/${row.image}" alt="Restaurant Review" class="review-photo">
          <img src="images/${row.rating}star.png" class="star">
          <p class="review-content">${row.body}</p>`;
          //reviewDiv.appendChild(reviewBottom);
          reviewDiv.appendChild(helpfulSpan);
          helpfulSpan.appendChild(helpButton);
        });

        console.log(sections[0]);
        helpfulbtns = document.querySelectorAll(".helpfulButton");

        helpfulbtns.forEach((button) => {
          button.addEventListener("click", () => {
            var parentItem = button.closest(".helpful");

            parentItem.textContent = "👍 Thanks for your vote";
          });
        });
      } else {
        console.error("Error fetching section content:", xhr.status);
      }
    }
  };

  if (restoName != undefined) {
    xhr.open(
      "GET",
      "/filter?restaurant=" +
        restoName +
        "&rating=3&isChecked=" +
        isChecked +
        "&" +
        uniqueParam,
      true
    );
    xhr.send();
  }
});

check4.addEventListener("change", function () {
  var isChecked = this.checked;
  var xhr = new XMLHttpRequest();
  var restoName = document.querySelector(".username").textContent;
  reviewTable = document.getElementById("reviewtable");

  var uniqueParam = "timestamp=" + new Date().getTime();

  console.log(document.querySelector(".username").textContent);

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        //console.log(xhr.responseText);
        let sections = JSON.parse(xhr.responseText);

        let reviewRows = document.querySelectorAll(".reviewRow");
        reviewRows.forEach(function (row) {
          row.parentNode.removeChild(row);
        });

        sections.forEach(function (row) {
          let tr = document.createElement("tr");
          tr.className = "reviewRow";

          let td = document.createElement("td");
          td.className = "reviewBody";
          td.id = row._id;

          let reviewDiv = document.createElement("div");
          reviewDiv.className = "review";

          let reviewInfo = document.createElement("div");
          reviewInfo.className = "review-info";
          reviewInfo.innerHTML = `<img src="images/${row.userDetails.profilePic}" alt="User Profile Picture"
          class="profile-pic">
          <p class="review-label">${row.username} reviewed <span
              class="restaurant-name">${row.restaurant}</span> <br><span class="date">
              ${row.date}</span></p>`;

          let helpfulSpan = document.createElement("span");
          helpfulSpan.className = "helpful";

          let helpButton = document.createElement("button");
          helpButton.className = "helpfulButton";

          helpfulSpan.innerHTML = `Helpful?(${row.helpful})`;
          helpButton.innerHTML = `👍`;

          reviewTable.appendChild(tr);
          tr.appendChild(td);
          td.appendChild(reviewDiv);
          reviewDiv.appendChild(reviewInfo);
          reviewDiv.innerHTML += `<img src="images/${row.image}" alt="Restaurant Review" class="review-photo">
          <img src="images/${row.rating}star.png" class="star">
          <p class="review-content">${row.body}</p>`;
          //reviewDiv.appendChild(reviewBottom);
          reviewDiv.appendChild(helpfulSpan);
          helpfulSpan.appendChild(helpButton);
        });

        console.log(sections[0]);
        helpfulbtns = document.querySelectorAll(".helpfulButton");

        helpfulbtns.forEach((button) => {
          button.addEventListener("click", () => {
            var parentItem = button.closest(".helpful");

            parentItem.textContent = "👍 Thanks for your vote";
          });
        });
      } else {
        console.error("Error fetching section content:", xhr.status);
      }
    }
  };

  if (restoName != undefined) {
    xhr.open(
      "GET",
      "/filter?restaurant=" +
        restoName +
        "&rating=2&isChecked=" +
        isChecked +
        "&" +
        uniqueParam,
      true
    );
    xhr.send();
  }
});

check5.addEventListener("change", function () {
  var isChecked = this.checked;
  var xhr = new XMLHttpRequest();
  var restoName = document.querySelector(".username").textContent;
  reviewTable = document.getElementById("reviewtable");

  var uniqueParam = "timestamp=" + new Date().getTime();

  console.log(document.querySelector(".username").textContent);

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        //console.log(xhr.responseText);
        let sections = JSON.parse(xhr.responseText);

        let reviewRows = document.querySelectorAll(".reviewRow");
        reviewRows.forEach(function (row) {
          row.parentNode.removeChild(row);
        });

        sections.forEach(function (row) {
          let tr = document.createElement("tr");
          tr.className = "reviewRow";

          let td = document.createElement("td");
          td.className = "reviewBody";
          td.id = row._id;

          let reviewDiv = document.createElement("div");
          reviewDiv.className = "review";

          let reviewInfo = document.createElement("div");
          reviewInfo.className = "review-info";
          reviewInfo.innerHTML = `<img src="images/${row.userDetails.profilePic}" alt="User Profile Picture"
          class="profile-pic">
          <p class="review-label">${row.username} reviewed <span
              class="restaurant-name">${row.restaurant}</span> <br><span class="date">
              ${row.date}</span></p>`;

          let helpfulSpan = document.createElement("span");
          helpfulSpan.className = "helpful";

          let helpButton = document.createElement("button");
          helpButton.className = "helpfulButton";

          helpfulSpan.innerHTML = `Helpful?(${row.helpful})`;
          helpButton.innerHTML = `👍`;

          reviewTable.appendChild(tr);
          tr.appendChild(td);
          td.appendChild(reviewDiv);
          reviewDiv.appendChild(reviewInfo);
          reviewDiv.innerHTML += `<img src="images/${row.image}" alt="Restaurant Review" class="review-photo">
          <img src="images/${row.rating}star.png" class="star">
          <p class="review-content">${row.body}</p>`;
          //reviewDiv.appendChild(reviewBottom);
          reviewDiv.appendChild(helpfulSpan);
          helpfulSpan.appendChild(helpButton);
        });

        console.log(sections[0]);
        helpfulbtns = document.querySelectorAll(".helpfulButton");

        helpfulbtns.forEach((button) => {
          button.addEventListener("click", () => {
            var parentItem = button.closest(".helpful");

            parentItem.textContent = "👍 Thanks for your vote";
          });
        });
      } else {
        console.error("Error fetching section content:", xhr.status);
      }
    }
  };

  if (restoName != undefined) {
    xhr.open(
      "GET",
      "/filter?restaurant=" +
        restoName +
        "&rating=1&isChecked=" +
        isChecked +
        "&" +
        uniqueParam,
      true
    );
    xhr.send();
  }
});
