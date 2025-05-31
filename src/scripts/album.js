import {
  getToken,
  getAlbums,
  toggleScrollButtons,
} from "./utils/spotify-api.js";

// 렌더링 함수 가져오기
import { renderAlbums } from "./utils/renderer.js";

/**
 * 앨범 데이터를 초기화하고 가져오는 함수
 * @async
 * @throws {Error} 데이터 로드 실패 시 에러 발생
 */
async function init() {
  try {
    const token = await getToken();

    // Fetch and render albums
    const albums = await getAlbums(token);
    renderAlbums(albums);
  } catch (e) {
    console.error("데이터를 불러오는 데 실패했습니다.", e);
    document.querySelector(".album-list").innerHTML =
      "<li>앨범 정보를 불러오지 못했습니다.</li>";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  init();
  setupEventListeners();
});

/**
 * 이벤트 리스너를 설정하는 함수
 * 스크롤 버튼과 Show All 토글 기능 설정
 */
function setupEventListeners() {
  // Album Scroll
  const albumList = document.querySelector(".album-list");

  document
    .querySelector(".album-scroll-btn-left")
    .addEventListener("click", () => {
      albumList.scrollTo({ left: 0, behavior: "smooth" });
    });

  document
    .querySelector(".album-scroll-btn-right")
    .addEventListener("click", () => {
      albumList.scrollTo({ left: albumList.scrollWidth, behavior: "smooth" });
    });

  // Show all toggle (for album)
  const albumShowAllBtn = document.querySelector(".album-show-all");
  if (albumShowAllBtn) {
    albumShowAllBtn.addEventListener("click", () => {
      const isGrid = albumList.classList.toggle("grid-mode");
      albumShowAllBtn.textContent = isGrid ? "Hide" : "Show All";
      toggleScrollButtons("album", !isGrid);
    });
  }
}
