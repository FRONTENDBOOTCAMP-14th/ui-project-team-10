async function loadPage() {
  // 현재 주소창에서 해시값을 가져옴. 예: #install-page
  const hash = location.hash;

  // 해시가 없으면 → 기본 페이지 (index.html의 <main>) 그대로 둠
  if (!hash) return;

  const pageName = hash.substring(1); // '#' 제거: "install-page"

  try {
    const response = await fetch(`./${pageName}.html`);
    const html = await response.text();
    document.querySelector("#main-content").innerHTML = html;
  } catch (error) {
    document.querySelector("#main-content").innerHTML =
      "<p>페이지를 불러올 수 없습니다.</p>";
  }
}

window.addEventListener("hashchange", () => {
  location.reload();
});

// 해시가 바뀌었을 때만 실행 (ex. #about, #contact 클릭)
window.addEventListener("hashchange", loadPage);

// 페이지 처음 열었을 때 실행
window.addEventListener("DOMContentLoaded", loadPage);
