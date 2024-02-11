var username;
var password;
var rememberMe;

var sampleData = [
  { username: "Peter", password: "Parker" },
  { username: "Donna", password: "Martinez" },
  { username: "Futaba", password: "Sakura" },
  { username: "Macie", password: "Adams" },
  { username: "Patricia", password: "Thomas" },
];

function showModal(modalId) {
  var modal = document.getElementById(modalId);
  modal.style.display = "block";
}

function closeModal(modalId) {
  var modal = document.getElementById(modalId);
  modal.style.display = "none";
}

function login() {
  username = document.getElementById("loginUsername").value;
  password = document.getElementById("loginPassword").value;
  rememberMe = document.getElementById("rememberMe").checked;

  var isValidCredentials = sampleData.some(function (data) {
    return data.username === username && data.password === password;
  });

  if (isValidCredentials) {
    alert("Login successful!");
    document.cookie = `${username}=${password}; path=/`;
    let name = username + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    console.log(decodedCookie);
    let ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        alert(c.substring(name.length, c.length));
      }
    }

    if (rememberMe) {
      setRememberMeCookie();
    }
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
}
