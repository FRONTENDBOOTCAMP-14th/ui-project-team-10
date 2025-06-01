import {
  getToken,
  getArtists,
  toggleScrollButtons,
} from "/src/scripts/utils/spotify-api.js";
import { EventManager, formatEventName } from "/src/scripts/utils/event-utils.js";

// 렌더링 함수 가져오기
import { renderArtists } from "/src/scripts/utils/renderer.js";

// 이벤트 매니저 초기화
const eventManager = new EventManager();

// DOM 요소
let artistList;
let artistShowAllBtn;

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

    // DOM 요소 캐시
    artistList = document.querySelector(".artist-list");
    artistShowAllBtn = document.querySelector(".artist-show-all");

    // 이벤트 리스너 설정
    setupEventListeners();
  } catch (e) {
    console.error("데이터를 불러오는 데 실패했습니다.", e);
    const artistListContainer = document.querySelector(".artist-list");
    if (artistListContainer) {
      artistListContainer.innerHTML =
        "<li>아티스트 정보를 불러오지 못했습니다.</li>";
    }
  }
}

/**
 * 스크롤 이벤트 핸들러
 * @param {boolean} toEnd - 오른쪽 끝으로 스크롤할지 여부
 */
function handleArtistScroll(toEnd) {
  if (!artistList) return;

  artistList.scrollTo({
    left: toEnd ? artistList.scrollWidth : 0,
    behavior: "smooth",
  });
}

/**
 * Show All 토글 핸들러
 */
function handleShowAllToggle() {
  if (!artistList || !artistShowAllBtn) return;

  const isGrid = artistList.classList.toggle("grid-mode");
  artistShowAllBtn.textContent = isGrid ? "Hide" : "Show All";
  toggleScrollButtons("artist", !isGrid);
}

/**
 * 이벤트 리스너를 설정하는 함수
 */
function setupEventListeners() {
  // Artist Scroll Left
  const leftBtn = document.querySelector(".artist-scroll-btn-left");
  if (leftBtn) {
    eventManager.addListener(leftBtn, "click", () => handleArtistScroll(false));
  }

  // Artist Scroll Right
  const rightBtn = document.querySelector(".artist-scroll-btn-right");
  if (rightBtn) {
    eventManager.addListener(rightBtn, "click", () => handleArtistScroll(true));
  }

  // Show all toggle (for artist)
  if (artistShowAllBtn) {
    eventManager.addListener(artistShowAllBtn, "click", handleShowAllToggle);
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
  document.addEventListener("artist-click", handleArtistClick);
  
  // 표준화된 이벤트 구독
  const artistClickEvent = formatEventName("artist", "click");
  eventManager.subscribe(artistClickEvent, handleStandardizedArtistClick);
}

/**
 * 기존 artist-click 이벤트 핸들러
 * @param {CustomEvent} event 아티스트 클릭 이벤트
 */
function handleArtistClick(event) {
  console.log("Legacy artist click event:", event.detail);
  // 스포티파이 링크나 추가 작업 처리
}

/**
 * 표준화된 artist.click 이벤트 핸들러
 * @param {Object} data 이벤트 데이터
 */
function handleStandardizedArtistClick(data) {
  console.log("Standardized artist click event:", data);
  // 이벤트 데이터에서 필요한 정보 추출 및 처리
  const { name, type, image, timestamp } = data;
  
  // 애널리틱스 추적이나 로깅을 위한 타임스킬프 활용
  console.log(`Artist ${name} clicked at ${timestamp}`);
  
  // 여기서 추가 작업 수행 (스포티파이 링크 열기, 상세 정보 표시 등)
}

// 페이지 언로드 시 이벤트 정리
window.addEventListener("unload", () => {
  // 기존 이벤트 리스너 제거
  document.removeEventListener("artist-click", handleArtistClick);
  
  // EventManager의 모든 리스너 제거
  eventManager.removeAllListeners();
});
