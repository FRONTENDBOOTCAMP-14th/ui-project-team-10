const extendSearchBar = document.querySelector(".container");
const toggleSearchBtn = document.querySelector(".search-toggle-btn");
const searchInput = document.getElementById("search-box");
const clossingSearchBar = document.querySelector(".clossing-search-bar");

toggleSearchBtn.addEventListener("click", function () {
  const viewportWidth = window.visualViewport.width;
  console.log("click");
  if (viewportWidth < 1078) {
    extendSearchBar.classList.toggle("hidden");
    clossingSearchBar.classList.toggle("absolute");
    searchInput.focus();
  } else {
    searchInput.focus();
  }
});

window.addEventListener("resize", function () {
  const viewportWidth = window.innerWidth;
  console.log(viewportWidth);
  if (viewportWidth >= 1078) {
    extendSearchBar.classList.remove("hidden");
    clossingSearchBar.classList.add("absolute");
  } else if (viewportWidth < 1078) {
    extendSearchBar.classList.add("hidden");
    clossingSearchBar.classList.remove("absolute");
  }
});

window.addEventListener("DOMContentLoaded", function () {
  const viewportWidth = window.innerWidth;

  if (viewportWidth >= 1078) {
    extendSearchBar.classList.remove("hidden");
    clossingSearchBar.classList.add("absolute");
  }
});
