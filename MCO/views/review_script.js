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
  reviewText = textForm.value;
  console.log(reviewText);

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
