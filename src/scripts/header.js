const DESKTOP_MIN_WIDTH = 1078;

export function initSearchToggle() {
  const extendSearchBar = document.querySelector(".container");
  const toggleSearchBtn = document.querySelector(".search-toggle-btn");
  const searchInput = document.getElementById("search-box");
  const clossingSearchBar = document.querySelector(".clossing-search-bar");

  function showDesktopLayout() {
    extendSearchBar.classList.remove("hidden");
    clossingSearchBar.classList.add("absolute");
  }

  toggleSearchBtn.addEventListener("click", function () {
    if (window.innerWidth < DESKTOP_MIN_WIDTH) {
      extendSearchBar.classList.toggle("hidden");
      clossingSearchBar.classList.toggle("absolute");
    }
    searchInput.focus();
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth >= DESKTOP_MIN_WIDTH) {
      showDesktopLayout();
    } else {
      extendSearchBar.classList.add("hidden");
      clossingSearchBar.classList.remove("absolute");
    }
  });

  if (window.innerWidth >= DESKTOP_MIN_WIDTH) showDesktopLayout();
}
