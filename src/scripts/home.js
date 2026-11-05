import { initSearchToggle } from "./header.js";
import "./indexBackground.js";

initSearchToggle();

const guideModal = document.querySelector(".guide-modal");
const closedBtn = document.querySelector("#closed");
const dontShowTodayBtn = document.querySelector("#dont-show-today");
const resetModalBtn = document.querySelector("#reset-modal");

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
  localStorage.setItem("hideModalUntil", new Date().toISOString());
  guideModal.close();
}

// 모달 설정 초기화
function resetModalSettings() {
  localStorage.removeItem("hideModalUntil");
}

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
