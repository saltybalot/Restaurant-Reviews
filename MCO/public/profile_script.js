var modal = document.getElementById("edit-profile-modal");

var btn = document.getElementById("edit-profile-btn");

var span = document.getElementsByClassName("close")[0];

var submitBtn = document.getElementById("submitBtn");

var reviewModal = document.getElementById("edit-review-modal");

btn.onclick = function () {
  modal.style.display = "block";
};

span.onclick = function () {
  modal.style.display = "none";
  reviewModal.style.display = "none";
};

var profilePic;
var desc;

var profileForm = document.getElementById("profile-picture-upload");
var descForm = document.getElementById("description");

profileForm.addEventListener("change", function (event) {
  var fileList = event.target.files;
  profilePic = fileList[0].name;
  console.log(profilePic);
});

document.getElementById("edit-profile-form").onsubmit = function (event) {
  var profilePicBlock = document.getElementById("profile-picture");
  var descriptionBlock = document.getElementById("profileDescription");
  desc = descForm.value;
  console.log(desc);
  if (profilePic == undefined) profilePic = "profilephoto.jpg";

  profilePicBlock.innerHTML = `<img src="images/${profilePic}" alt="Profile Picture">`;
  descriptionBlock.innerHTML = desc;
  event.preventDefault();
  modal.style.display = "none";
};

var deleteBtns = document.querySelectorAll(".delete-btn");

deleteBtns.forEach((button) => {
  button.addEventListener("click", () => {
    var parentItem = button.closest(".review");

    parentItem.innerHTML = "deleted";
  });
});

var editBtns = document.querySelectorAll(".edit-btn");

editBtns.forEach((button) => {
  button.addEventListener("click", (event) => {
    var parentItem = button.closest(".review");
    console.log(parentItem);
    reviewModal.style.display = "block";
    span = document.getElementsByClassName("close")[1];

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

      parentItem.innerHTML = `
        <div class="review-info">
          <img src="images/profilephoto.jpg" alt="User Profile Picture" class="profile-pic">
          <p class="review-label">Patricia Thomas reviewed <span
              class="restaurant-name">Restaurant#3</span>
            <br><span class="date">
              02/12/2024</span>
          </p>
          <div class="review-actions">
            <div class="dropdown">
              <button class="dropdown-btn">&#8942;</button>
              <div class="dropdown-content">
                <a href="#" class="edit-btn">Edit</a>
                <a href="#" class="delete-btn">Delete</a>
              </div>
            </div>
          </div>
        </div>
        <img src="images/${reviewImg}" alt="Restaurant Review" class="review-photo">
        <img src="images/${starValue}star.png" class="star">
        <p class="review-content">${reviewText}
        </p>`;
      event.preventDefault();
      reviewModal.style.display = "none";
    };

    span.onclick = function () {
      modal.style.display = "none";
      reviewModal.style.display = "none";
    };

    event.preventDefault();
    //parentItem.innerHTML = "deleted";
  });
});

window.onclick = function (event) {
  if (event.target == modal || event.target == reviewModal) {
    modal.style.display = "none";
  }
};
