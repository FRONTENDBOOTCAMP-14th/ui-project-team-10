import {
  getToken,
  getArtists,
  toggleScrollButtons,
} from "./utils/spotify-api.js";

// 렌더링 함수 가져오기
import { renderArtists } from "./utils/renderer.js";

/**
 * 페이지 초기화 함수. API에서 아티스트 정보를 가져와 화면에 표시합니다.
 * @async
 */
async function init() {
  try {
    const token = await getToken();

    // Fetch and render artists
    const artists = await getArtists(token);
    renderArtists(artists);
  } catch (e) {
    console.error("데이터를 불러오는 데 실패했습니다.", e);
    document.querySelector(".artist-list").innerHTML =
      "<li>아티스트 정보를 불러오지 못했습니다.</li>";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  init();
  setupEventListeners();
});

/**
 * 아티스트 섹션의 이벤트 리스너를 설정합니다.
 * - 스크롤 버튼 동작
 * - 그리드 모드 토글 기능
 */
function setupEventListeners() {
  // Artist Scroll
  const artistList = document.querySelector(".artist-list");
  const artistWrapper = document.querySelector(".artist-section");

  artistList.addEventListener("scroll", () => {
    artistWrapper.classList.toggle("scrolled", artistList.scrollLeft > 10);
  });

  document
    .querySelector(".artist-scroll-btn-left")
    .addEventListener("click", () => {
      artistList.scrollTo({ left: 0, behavior: "smooth" });
    });

  document
    .querySelector(".artist-scroll-btn-right")
    .addEventListener("click", () => {
      artistList.scrollTo({ left: artistList.scrollWidth, behavior: "smooth" });
    });

  // Show all toggle (for artist)
  const artistShowAllBtn = document.querySelector(".artist-show-all");
  if (artistShowAllBtn) {
    artistShowAllBtn.addEventListener("click", () => {
      const isGrid = artistList.classList.toggle("grid-mode");
      artistShowAllBtn.textContent = isGrid ? "Hide" : "Show All";
      toggleScrollButtons("artist", !isGrid);
    });
  }
}
