function showModal(modalId) {
  var modal = document.getElementById(modalId);
  modal.style.display = "block";
}

function closeModal(modalId) {
  var modal = document.getElementById(modalId);
  modal.style.display = "none";
}
/*
function login() {
  var username = document.getElementById("loginUsername").value;
  var password = document.getElementById("loginPassword").value;
  var rememberMe = document.getElementById("rememberMe").checked;
  var sampleData = [
    { username: "Peter", password: "Parker" },
    { username: "Donna", password: "Martinez" },
    { username: "Futaba", password: "Sakura" },
    { username: "Macie", password: "Adams" },
    { username: "Patricia", password: "Thomas" },
  ];
  var isValidCredentials = sampleData.some(function (data) {
    return data.username === username && data.password === password;
  });

  if (isValidCredentials) {
    alert("Login successful!");
    if (rememberMe) {
      setRememberMeCookie();
    }
    window.location.href = "FrontPageLoggedIn.html";
  } else {
    alert("Invalid username or password. Please try again.");
  }
}

function register() {
  var username = document.getElementById("registerUsername").value;
  var password = document.getElementById("registerPassword").value;
  var avatarFile = document.getElementById("avatar").files[0];
  var description = document.getElementById("description").value;
  if (username && password && avatarFile) {
    alert("Registration successful!\nAvatar File: " + avatarFile.name);
    closeModal("registerModal");
  } else {
    alert(
      "Please enter a valid username, password, and select an avatar file."
    );
  }
}*/

var reviewBodyClass = document.querySelectorAll(".review-body");

reviewBodyClass.forEach((body) => {
  var maxLength = 120; // Maximum length of the text
  var text = body.textContent;
  var fullText = body.getAttribute("data-full-text");

  if (text.length > maxLength) {
    body.textContent = text.substring(0, maxLength) + "...";
  }
});

var messageOverlay = document.querySelector(".message-overlay");

messageOverlay.addEventListener("click", function (event) {
  messageOverlay.hidden = "true";
});
