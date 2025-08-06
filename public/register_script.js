function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const button = input.parentElement.querySelector('.toggle-password');
  const eyeIcon = button.querySelector('.eye-icon');
  
  if (input.type === 'password') {
    input.type = 'text';
    button.classList.add('active');
    eyeIcon.textContent = '🙈';
  } else {
    input.type = 'password';
    button.classList.remove('active');
    eyeIcon.textContent = '👁️';
  }
}

function login() {
  var username = document.getElementById("loginUsername").value;
  var password = document.getElementById("loginPassword").value;
  var rememberMe = document.getElementById("rememberMe").checked;

  if (!username || !password) {
    alert("Please enter both username and password.");
    return;
  }

  var formData = new FormData();
  formData.append("username", username);
  formData.append("password", password);

  fetch("/login", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (response.redirected) {
        window.location.href = response.url;
      } else {
        return response.text();
      }
    })
    .then((data) => {
      if (data) {
        console.log(data);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function register() {
  var username = document.getElementById("registerUsername").value;
  var password = document.getElementById("registerPassword").value;
  var confirmPassword = document.getElementById("confirmPassword").value;
  var avatarFile = document.getElementById("avatar").files[0];
  var description = document.getElementById("description").value;
  var securityQuestion = document.getElementById("securityQuestion").value;
  var securityAnswer = document.getElementById("securityAnswer").value;

  if (username && password && confirmPassword && securityQuestion && securityAnswer) {
    if (password !== confirmPassword) {
      alert("Passwords do not match. Please try again.");
      return;
    }
    var formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    formData.append("description", description);
    formData.append("securityQuestion", securityQuestion);
    formData.append("securityAnswer", securityAnswer);

    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    fetch("/register", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (response.redirected) {
          window.location.href = response.url;
        } else {
          return response.text();
        }
      })
      .then((data) => {
        if (data) {
          console.log(data);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  } else {
    alert(
      "Please fill in all required fields including password confirmation and security question and answer."
    );
  }
}

var reviewBodyClass = document.querySelectorAll(".review-body");

reviewBodyClass.forEach((body) => {
  var maxLength = 120; // Maximum length of the text
  var text = body.textContent;
  var fullText = body.getAttribute("data-full-text");

  if (text.length > maxLength) {
    body.textContent = text.substring(0, maxLength) + "...";
  }
});

function showModal(modalId) {
  document.getElementById(modalId).style.display = "block";
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}

// Close modal when clicking outside of it
window.onclick = function (event) {
  var modals = document.getElementsByClassName("modal");
  for (var i = 0; i < modals.length; i++) {
    if (event.target == modals[i]) {
      modals[i].style.display = "none";
    }
  }
};
