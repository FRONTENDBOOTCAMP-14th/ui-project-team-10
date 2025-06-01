import {
  getToken,
  getAlbums,
  toggleScrollButtons,
} from "/src/scripts/utils/spotify-api.js";
import { EventManager, formatEventName } from "/src/scripts/utils/event-utils.js";

// 렌더링 함수 가져오기
import { renderAlbums } from "/src/scripts/utils/renderer.js";

// 이벤트 매니저 초기화
const eventManager = new EventManager();

// DOM 요소
let albumList;
let albumShowAllBtn;

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

    // DOM 요소 캐시
    albumList = document.querySelector(".album-list");
    albumShowAllBtn = document.querySelector(".album-show-all");

    // 이벤트 리스너 설정
    setupEventListeners();
  } catch (e) {
    console.error("데이터를 불러오는 데 실패했습니다.", e);
    const albumListContainer = document.querySelector(".album-list");
    if (albumListContainer) {
      albumListContainer.innerHTML =
        "<li>앨범 정보를 불러오지 못했습니다.</li>";
    }
  }
}

/**
 * 스크롤 이벤트 핸들러
 * @param {boolean} toEnd - 오른쪽 끝으로 스크롤할지 여부
 */
function handleAlbumScroll(toEnd) {
  if (!albumList) return;

  albumList.scrollTo({
    left: toEnd ? albumList.scrollWidth : 0,
    behavior: "smooth",
  });
}

/**
 * Show All 토글 핸들러
 */
function handleShowAllToggle() {
  if (!albumList || !albumShowAllBtn) return;

  const isGrid = albumList.classList.toggle("grid-mode");
  albumShowAllBtn.textContent = isGrid ? "Hide" : "Show All";
  toggleScrollButtons("album", !isGrid);
}

/**
 * 이벤트 리스너를 설정하는 함수
 * 스크롤 버튼과 Show All 토글 기능 설정
 */
function setupEventListeners() {
  // Album Scroll Left
  const leftBtn = document.querySelector(".album-scroll-btn-left");
  if (leftBtn) {
    eventManager.addListener(leftBtn, "click", () => handleAlbumScroll(false));
  }

  // Album Scroll Right
  const rightBtn = document.querySelector(".album-scroll-btn-right");
  if (rightBtn) {
    eventManager.addListener(rightBtn, "click", () => handleAlbumScroll(true));
  }

  // Show all toggle (for album)
  if (albumShowAllBtn) {
    eventManager.addListener(albumShowAllBtn, "click", handleShowAllToggle);
  }
  
  // 표준화된 이벤트 구독 설정
  setupStandardizedEvents();
}

// DOM이 로드되면 초기화
document.addEventListener("DOMContentLoaded", init);

/**
 * 표준화된 이벤트를 구독하는 함수
 */
function setupStandardizedEvents() {
  // 기존 legacy 이벤트 구독 (호환성을 위해 유지)
  document.addEventListener("album-click", handleAlbumClick);
  
  // 표준화된 이벤트 구독
  const albumClickEvent = formatEventName("album", "click");
  eventManager.subscribe(albumClickEvent, handleStandardizedAlbumClick);
}

/**
 * 기존 album-click 이벤트 핸들러
 * @param {CustomEvent} event 앨범 클릭 이벤트
 */
function handleAlbumClick(event) {
  console.log("Legacy album click event:", event.detail);
  // 스포티파이 링크나 추가 작업 처리
}

/**
 * 표준화된 album.click 이벤트 핸들러
 * @param {Object} data 이벤트 데이터
 */
function handleStandardizedAlbumClick(data) {
  console.log("Standardized album click event:", data);
  // 이벤트 데이터에서 필요한 정보 추출 및 처리
  const { title, artist, cover, timestamp } = data;
  
  // 애널리틱스 추적이나 로깅을 위한 타임스킬프 활용
  console.log(`Album ${title} by ${artist} clicked at ${timestamp}`);
  
  // 여기서 추가 작업 수행 (스포티파이 링크 열기, 상세 정보 표시 등)
}

// 페이지 언로드 시 이벤트 정리
window.addEventListener("unload", () => {
  // 기존 이벤트 리스너 제거
  document.removeEventListener("album-click", handleAlbumClick);
  
  // EventManager의 모든 리스너 제거
  eventManager.removeAllListeners();
});
