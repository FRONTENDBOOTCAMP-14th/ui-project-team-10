const ALLOWED_PAGES = ["install-page"];

async function loadPage() {
  // 현재 주소창에서 해시값을 가져옴. 예: #install-page
  const pageName = location.hash.substring(1);

  // 해시가 없거나 허용 목록에 없으면 index의 <main> 그대로 둠
  if (!ALLOWED_PAGES.includes(pageName)) return;

  const main = document.querySelector(".main-component");
  try {
    const response = await fetch(`./${pageName}.html`);
    if (!response.ok) throw new Error(`페이지 요청 실패: ${response.status}`);
    main.innerHTML = await response.text();
  } catch (error) {
    main.innerHTML = "<p>페이지를 불러올 수 없습니다.</p>";
  }
}

// 해시 변경 시 새로고침하여 초기 <main>과 main.js가 붙인 이벤트 리스너를 복원한다.
// innerHTML 교체만으로는 해시 제거(#install-page -> 없음) 시 원래 <main>을 되돌릴 수 없다.
// 로드는 새로고침 후 DOMContentLoaded에서 수행한다.
window.addEventListener("hashchange", () => {
  location.reload();
});

window.addEventListener("DOMContentLoaded", loadPage);
