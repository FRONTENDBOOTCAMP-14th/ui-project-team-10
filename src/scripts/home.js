const extendSearchBar = document.querySelector(".container");
const toggleSearchBtn = document.querySelector(".search-toggle-btn");
const searchInput = document.getElementById("search-box");
const clossingSearchBar = document.querySelector(".clossing-search-bar");

toggleSearchBtn.addEventListener("click", function () {
  const viewportWidth = window.visualViewport.width;
  // console.log("click");
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
  // console.log(viewportWidth);
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

const header = document.querySelector("header");
const guideModal = document.querySelector(".guide-modal");
const closedBtn = document.querySelector("#closed");
const dontShowTodayBtn = document.querySelector("#dont-show-today");
const resetModalBtn = document.querySelector("#reset-modal");

function isMaximizedWindow() {
  return window.innerWidth >= 1650;
}

function updateBackgroundZoom() {
  if (!isMaximizedWindow()) {
    header.style.backgroundSize = "cover";
    return;
  }

  const scrollY = window.scrollY;
  const zoom = 100 + scrollY * 0.05;
  const limitedZoom = Math.min(zoom, 200);
  header.style.backgroundSize = `${limitedZoom}%`;
}

// 모달 표시 여부 확인
function shouldShowModal() {
  const hideUntil = localStorage.getItem("hideModalUntil");
  if (!hideUntil) return true;

  const hideDate = new Date(hideUntil);
  const today = new Date();

  // 날짜만 비교 (시간 제외)
  hideDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return today > hideDate;
}

// 오늘 하루동안 숨기기
function hideModalForToday() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  localStorage.setItem("hideModalUntil", tomorrow.toISOString());
  guideModal.close();
}

// 모달 설정 초기화
function resetModalSettings() {
  localStorage.removeItem("hideModalUntil");
}

window.addEventListener("scroll", updateBackgroundZoom);
window.addEventListener("resize", updateBackgroundZoom);
window.addEventListener("DOMContentLoaded", updateBackgroundZoom);

// 모달 표시 여부 확인 후 표시
if (shouldShowModal()) {
  guideModal.showModal();
}

// 이벤트 리스너
closedBtn.addEventListener("click", () => {
  guideModal.close();
});

dontShowTodayBtn.addEventListener("click", hideModalForToday);
resetModalBtn.addEventListener("click", resetModalSettings);
