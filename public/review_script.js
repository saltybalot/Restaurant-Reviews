var modal = document.getElementById("myModal");

var replyModal = document.getElementById("replyModal");

var btn = document.getElementById("reviewButton");

var isLoggedIn = document.getElementById("isLoggedIn").value;

console.log(isLoggedIn);

btn.onclick = function () {
  if (isLoggedIn === "true") {
    modal.style.display = "block";
  } else {
    alert("Please Login first before you write your review");
  }
};

var reviewID;
interactButtons();

function interactButtons() {
  var replyBtns = document.querySelectorAll(".replyBtn");
  var username = document.getElementById("isOwner").value;
  var resto = document.getElementById("resto").value;

  var span = document.querySelectorAll(".close");

  replyBtns.forEach((button) => {
    if (resto == username) {
      button.addEventListener("click", function () {
        reviewID = button.closest(".reviewBody").id;
        console.log(reviewID);
        replyModal.style.display = "block";
      });
    } else {
      button.hidden = true;
    }
  });

  span.forEach((button) => {
    button.onclick = function () {
      modal.style.display = "none";
      replyModal.style.display = "none";
    };
  });

  window.onclick = function (event) {
    if (event.target == modal || event.target == replyModal) {
      modal.style.display = "none";
      replyModal.style.display = "none";
    }
  };
}

/*
document.getElementById("reviewForm").onsubmit = function (event) {
  event.preventDefault();
  modal.style.display = "none";
};*/

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

/*
var helpfulbtns = document.querySelectorAll(".helpfulButton");

helpfulbtns.forEach((button) => {
  button.addEventListener("click", () => {
    var parentItem = button.closest(".helpful");
    var reviewBodyClass = button.closest(".reviewBody");
    var reviewBodyID = reviewBodyClass.id;

    console.log(reviewBodyID);

    var xhr = new XMLHttpRequest();

    // Make a GET request
    parentItem.textContent = "👍 Thanks for your vote";
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        console.log("helpful success");
      }
    };
    xhr.open(
      "GET",
      "/getHelp?restaurant=" + restoName + "&id=" + reviewBodyID,
      true
    );
    xhr.send();
  });
});*/

//Stop it, get some help
getHelp();

var replyBlock = document.querySelectorAll(".replyBody");

replyBlock.forEach((reply) => {
  console.log(reply.textContent);
  if (reply.textContent.trim() == "") {
    let replyParent = reply.closest(".reply");
    replyParent.style.display = "none";
    console.log("reply hidden");
  }
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

/*
document.getElementById("reviewForm").onsubmit = function (event) {
  var restoName = document.querySelector(".username").textContent;
  var userID = document.getElementById("userID").value;
  reviewText = textForm.value;
  console.log(reviewText);

  var xhr = new XMLHttpRequest();

  // Make a GET request

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
      location.reload();
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
};*/

var replyForm = document.getElementById("replyForm");

replyForm.onsubmit = function (event) {
  event.preventDefault();
  let replyBody = document.getElementById("replyBody").value;

  window.location.href = "/writeReply?id=" + reviewID + "&body=" + replyBody;
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

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        console.log(xhr.responseText);
        let sections = JSON.parse(xhr.responseText);

        let reviewRows = document.querySelectorAll(".reviewRow");
        reviewRows.forEach(function (row) {
          row.parentNode.removeChild(row);
        });

        //console.log(sections);
        console.log("hello");
        //console.log(sections[0].replyDetails);

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

          let unHelpButton = document.createElement("button");
          unHelpButton.className = "unHelpfulButton";
          unHelpButton.innerHTML = `👎`;

          let replyButton = document.createElement("span");
          replyButton.className = "replyBtn";
          replyButton.innerHTML = `<img src="images/reply.png" style="height: 17px; width: 17px;">
          Reply`;

          reviewTable.appendChild(tr);
          tr.appendChild(td);
          td.appendChild(reviewDiv);
          reviewDiv.appendChild(reviewInfo);
          reviewDiv.innerHTML += `<img src="images/${row.image}" alt="Restaurant Review" class="review-photo">
          <img src="images/${row.rating}star.png" class="star">`;

          let replyContent = document.createElement("div");
          replyContent.className = "reply";
          if (row.replyDetails == null) {
            replyContent.style.display = "none";
            console.log("reply hidden");
          } else {
            replyContent.innerHTML = `<div class=" replyHeader">
          <div class="replyUsername"> <span class="replyResto"> ${row.restaurant}</span>
              replied: </div>
          <div class="replyDate">${row.replyDetails.date}</div>
      </div>
      <div class="replyBody">
          ${row.replyDetails.body}
      </div>`;
          }

          let reviewContent = document.createElement("p");
          reviewContent.className = "review-content";
          reviewContent.setAttribute("data-full-text", row.body);
          reviewContent.innerHTML = row.body;
          reviewDiv.appendChild(reviewContent);
          //reviewDiv.appendChild(reviewBottom);
          reviewDiv.appendChild(helpfulSpan);
          helpfulSpan.appendChild(helpButton);
          helpfulSpan.appendChild(unHelpButton);
          reviewDiv.appendChild(replyButton);
          reviewDiv.appendChild(replyContent);
        });

        console.log(sections[0]);
        getHelp();
        truncateReview();
        interactButtons();
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
        console.log(xhr.responseText);
        let sections = JSON.parse(xhr.responseText);

        let reviewRows = document.querySelectorAll(".reviewRow");
        reviewRows.forEach(function (row) {
          row.parentNode.removeChild(row);
        });

        //console.log(sections);
        console.log("hello");
        //console.log(sections[0].replyDetails);

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

          let unHelpButton = document.createElement("button");
          unHelpButton.className = "unHelpfulButton";
          unHelpButton.innerHTML = `👎`;

          let replyButton = document.createElement("span");
          replyButton.className = "replyBtn";
          replyButton.innerHTML = `<img src="images/reply.png" style="height: 17px; width: 17px;">
          Reply`;

          reviewTable.appendChild(tr);
          tr.appendChild(td);
          td.appendChild(reviewDiv);
          reviewDiv.appendChild(reviewInfo);
          reviewDiv.innerHTML += `<img src="images/${row.image}" alt="Restaurant Review" class="review-photo">
          <img src="images/${row.rating}star.png" class="star">`;

          let replyContent = document.createElement("div");
          replyContent.className = "reply";
          if (row.replyDetails == null) {
            replyContent.style.display = "none";
            console.log("reply hidden");
          } else {
            replyContent.innerHTML = `<div class=" replyHeader">
          <div class="replyUsername"> <span class="replyResto"> ${row.restaurant}</span>
              replied: </div>
          <div class="replyDate">${row.replyDetails.date}</div>
      </div>
      <div class="replyBody">
          ${row.replyDetails.body}
      </div>`;
          }

          let reviewContent = document.createElement("p");
          reviewContent.className = "review-content";
          reviewContent.setAttribute("data-full-text", row.body);
          reviewContent.innerHTML = row.body;
          reviewDiv.appendChild(reviewContent);
          //reviewDiv.appendChild(reviewBottom);
          reviewDiv.appendChild(helpfulSpan);
          helpfulSpan.appendChild(helpButton);
          helpfulSpan.appendChild(unHelpButton);
          reviewDiv.appendChild(replyButton);
          reviewDiv.appendChild(replyContent);
        });

        console.log(sections[0]);
        getHelp();
        truncateReview();
        interactButtons();
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
        console.log(xhr.responseText);
        let sections = JSON.parse(xhr.responseText);

        let reviewRows = document.querySelectorAll(".reviewRow");
        reviewRows.forEach(function (row) {
          row.parentNode.removeChild(row);
        });

        //console.log(sections);
        console.log("hello");
        //console.log(sections[0].replyDetails);

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

          let unHelpButton = document.createElement("button");
          unHelpButton.className = "unHelpfulButton";
          unHelpButton.innerHTML = `👎`;

          let replyButton = document.createElement("span");
          replyButton.className = "replyBtn";
          replyButton.innerHTML = `<img src="images/reply.png" style="height: 17px; width: 17px;">
          Reply`;

          reviewTable.appendChild(tr);
          tr.appendChild(td);
          td.appendChild(reviewDiv);
          reviewDiv.appendChild(reviewInfo);
          reviewDiv.innerHTML += `<img src="images/${row.image}" alt="Restaurant Review" class="review-photo">
          <img src="images/${row.rating}star.png" class="star">`;

          let replyContent = document.createElement("div");
          replyContent.className = "reply";
          if (row.replyDetails == null) {
            replyContent.style.display = "none";
            console.log("reply hidden");
          } else {
            replyContent.innerHTML = `<div class=" replyHeader">
          <div class="replyUsername"> <span class="replyResto"> ${row.restaurant}</span>
              replied: </div>
          <div class="replyDate">${row.replyDetails.date}</div>
      </div>
      <div class="replyBody">
          ${row.replyDetails.body}
      </div>`;
          }

          let reviewContent = document.createElement("p");
          reviewContent.className = "review-content";
          reviewContent.setAttribute("data-full-text", row.body);
          reviewContent.innerHTML = row.body;
          reviewDiv.appendChild(reviewContent);
          //reviewDiv.appendChild(reviewBottom);
          reviewDiv.appendChild(helpfulSpan);
          helpfulSpan.appendChild(helpButton);
          helpfulSpan.appendChild(unHelpButton);
          reviewDiv.appendChild(replyButton);
          reviewDiv.appendChild(replyContent);
        });

        console.log(sections[0]);
        getHelp();
        truncateReview();
        interactButtons();
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
        console.log(xhr.responseText);
        let sections = JSON.parse(xhr.responseText);

        let reviewRows = document.querySelectorAll(".reviewRow");
        reviewRows.forEach(function (row) {
          row.parentNode.removeChild(row);
        });

        //console.log(sections);
        console.log("hello");
        //console.log(sections[0].replyDetails);

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

          let unHelpButton = document.createElement("button");
          unHelpButton.className = "unHelpfulButton";
          unHelpButton.innerHTML = `👎`;

          let replyButton = document.createElement("span");
          replyButton.className = "replyBtn";
          replyButton.innerHTML = `<img src="images/reply.png" style="height: 17px; width: 17px;">
          Reply`;

          reviewTable.appendChild(tr);
          tr.appendChild(td);
          td.appendChild(reviewDiv);
          reviewDiv.appendChild(reviewInfo);
          reviewDiv.innerHTML += `<img src="images/${row.image}" alt="Restaurant Review" class="review-photo">
          <img src="images/${row.rating}star.png" class="star">`;

          let replyContent = document.createElement("div");
          replyContent.className = "reply";
          if (row.replyDetails == null) {
            replyContent.style.display = "none";
            console.log("reply hidden");
          } else {
            replyContent.innerHTML = `<div class=" replyHeader">
          <div class="replyUsername"> <span class="replyResto"> ${row.restaurant}</span>
              replied: </div>
          <div class="replyDate">${row.replyDetails.date}</div>
      </div>
      <div class="replyBody">
          ${row.replyDetails.body}
      </div>`;
          }

          let reviewContent = document.createElement("p");
          reviewContent.className = "review-content";
          reviewContent.setAttribute("data-full-text", row.body);
          reviewContent.innerHTML = row.body;
          reviewDiv.appendChild(reviewContent);
          //reviewDiv.appendChild(reviewBottom);
          reviewDiv.appendChild(helpfulSpan);
          helpfulSpan.appendChild(helpButton);
          helpfulSpan.appendChild(unHelpButton);
          reviewDiv.appendChild(replyButton);
          reviewDiv.appendChild(replyContent);
        });

        console.log(sections[0]);
        getHelp();
        truncateReview();
        interactButtons();
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
        console.log(xhr.responseText);
        let sections = JSON.parse(xhr.responseText);

        let reviewRows = document.querySelectorAll(".reviewRow");
        reviewRows.forEach(function (row) {
          row.parentNode.removeChild(row);
        });

        //console.log(sections);
        console.log("hello");
        //console.log(sections[0].replyDetails);

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

          let unHelpButton = document.createElement("button");
          unHelpButton.className = "unHelpfulButton";
          unHelpButton.innerHTML = `👎`;

          let replyButton = document.createElement("span");
          replyButton.className = "replyBtn";
          replyButton.innerHTML = `<img src="images/reply.png" style="height: 17px; width: 17px;">
          Reply`;

          reviewTable.appendChild(tr);
          tr.appendChild(td);
          td.appendChild(reviewDiv);
          reviewDiv.appendChild(reviewInfo);
          reviewDiv.innerHTML += `<img src="images/${row.image}" alt="Restaurant Review" class="review-photo">
          <img src="images/${row.rating}star.png" class="star">`;

          let replyContent = document.createElement("div");
          replyContent.className = "reply";
          if (row.replyDetails == null) {
            replyContent.style.display = "none";
            console.log("reply hidden");
          } else {
            replyContent.innerHTML = `<div class=" replyHeader">
          <div class="replyUsername"> <span class="replyResto"> ${row.restaurant}</span>
              replied: </div>
          <div class="replyDate">${row.replyDetails.date}</div>
      </div>
      <div class="replyBody">
          ${row.replyDetails.body}
      </div>`;
          }

          let reviewContent = document.createElement("p");
          reviewContent.className = "review-content";
          reviewContent.setAttribute("data-full-text", row.body);
          reviewContent.innerHTML = row.body;
          reviewDiv.appendChild(reviewContent);
          //reviewDiv.appendChild(reviewBottom);
          reviewDiv.appendChild(helpfulSpan);
          helpfulSpan.appendChild(helpButton);
          helpfulSpan.appendChild(unHelpButton);
          reviewDiv.appendChild(replyButton);
          reviewDiv.appendChild(replyContent);
        });

        console.log(sections[0]);
        getHelp();
        truncateReview();
        interactButtons();
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

function getHelp() {
  var helpfulbtns = document.querySelectorAll(".helpfulButton");
  var unHelpfulbtns = document.querySelectorAll(".unHelpfulButton");

  helpfulbtns.forEach((button) => {
    button.addEventListener("click", () => {
      var parentItem = button.closest(".helpful");
      var reviewBodyClass = button.closest(".reviewBody");
      var reviewBodyID = reviewBodyClass.id;

      console.log(reviewBodyID);

      var xhr = new XMLHttpRequest();

      // Make a GET request

      parentItem.textContent = "👍 Thanks for your vote";

      xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
          console.log("helpful success");
        }
      };
      xhr.open("GET", "/getHelp?&id=" + reviewBodyID + "&isHelpful=true", true);
      xhr.send();
    });
  });

  unHelpfulbtns.forEach((button) => {
    button.addEventListener("click", () => {
      var parentItem = button.closest(".helpful");
      var reviewBodyClass = button.closest(".reviewBody");
      var reviewBodyID = reviewBodyClass.id;

      console.log(reviewBodyID);

      var xhr = new XMLHttpRequest();

      // Make a GET request

      parentItem.textContent = "👎 Thanks for your vote";

      xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
          console.log("unhelpful success");
        }
      };
      xhr.open(
        "GET",
        "/getHelp?&id=" + reviewBodyID + "&isHelpful=false",
        true
      );
      xhr.send();
    });
  });
}

function truncateReview() {
  var reviewBodyClass = document.querySelectorAll(".review-content");

  reviewBodyClass.forEach((body) => {
    var maxLength = 120; // Maximum length of the text
    var text = body.textContent;
    var fullText = body.getAttribute("data-full-text");

    if (text.length > maxLength) {
      body.textContent = text.substring(0, maxLength) + "...";
      let seeMore = document.createElement("a");
      seeMore.className = "seeMore";
      seeMore.innerHTML = "See More";
      body.appendChild(seeMore);

      seeMore.addEventListener("click", function () {
        body.textContent = fullText;
      });
    }
  });
}

truncateReview();
