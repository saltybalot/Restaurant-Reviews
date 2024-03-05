
var modal = document.getElementById("myModal");

var btn = document.getElementById("reviewButton");

var span = document.getElementsByClassName("close")[0];

btn.onclick = function() {
  modal.style.display = "block";
}

span.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

document.getElementById("reviewForm").onsubmit = function(event) {
  event.preventDefault();
  modal.style.display = "none";
}


btn.onclick = function() {
  modal.style.display = "block";
}

span.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

var stars = document.querySelectorAll(".star");

stars.forEach(function(star) {
  star.addEventListener("click", function() {
    var value = parseInt(star.dataset.value);
    document.getElementById("rating").value = value;
    stars.forEach(function(s) {
      if (parseInt(s.dataset.value) <= value) {
        s.classList.add("active");
      } else {
        s.classList.remove("active");
      }
    });
  });
});

document.getElementById("reviewForm").onsubmit = function(event) {
  event.preventDefault();
  modal.style.display = "none";
}