/**
 * 메인 페이지 스크립트
 *
 * 앨범, 아티스트, 플레이리스트 섹션을 초기화하고 조율하는 메인 스크립트
 * 섹션 매니저 모듈을 활용하여 코드를 간소화하고 구조를 평탄화
 */

// 섹션 매니저 모듈 가져오기
import { albumSection } from "/src/scripts/album.js";
import { artistSection } from "/src/scripts/artist.js";
import { playlistSection } from "/src/scripts/playlist.js";

// 공통 API 유틸리티
import { getAllSectionData } from "/src/scripts/utils/spotify-api.js";
import {
  renderAlbums,
  renderArtists,
  renderPlaylists,
} from "/src/scripts/utils/renderer.js";
import { EventManager } from "/src/scripts/utils/event-utils.js";

// 이벤트 매니저 초기화 (페이지 전역 이벤트용)
const eventManager = new EventManager();

/**
 * 메인 페이지 초기화 함수
 * 모든 섹션을 초기화하고 페이지 전역 이벤트를 설정
 * @async
 */
async function initMainPage() {
  try {
    // DOM 요소 존재 확인
    ensureDOMElementsExist();

    // 모든 섹션 초기화 - 각 섹션의 init()은 이미 데이터 로드와 렌더링을 수행함
    await Promise.all([
      albumSection.init(),
      artistSection.init(),
      playlistSection.init(),
    ]);

    // 페이지 전역 이벤트 리스너 설정
    setupGlobalEventListeners();

    console.log("메인 페이지 초기화 완료");
  } catch (e) {
    console.error("메인 페이지 초기화에 실패했습니다.", e);
    showErrorMessage();
  }
}

/**
 * 오류 메시지를 표시하는 함수
 */
function showErrorMessage() {
  const errorBanner = document.createElement("div");
  errorBanner.classList.add("error-banner");
  errorBanner.textContent =
    "데이터를 불러오는 중 오류가 발생했습니다. 나중에 다시 시도해주세요.";

  document.body.insertBefore(errorBanner, document.body.firstChild);

  // 5초 후 오류 메시지 제거
  setTimeout(() => {
    errorBanner.remove();
  }, 5000);
}

/**
 * 페이지 초기화 시 저장된 테마 적용
 */
function applyStoredTheme() {
  const storedTheme = localStorage.getItem("theme");
  if (storedTheme === "dark") {
    document.body.classList.add("dark-theme");
  }
}

/**
 * 데이터 로드 실패 시 에러 메시지 표시
 */
function showErrorMessages() {
  const containers = [
    { selector: ".album-list", message: "앨범 정보를 불러오지 못했습니다." },
    {
      selector: ".artist-list",
      message: "아티스트 정보를 불러오지 못했습니다.",
    },
    {
      selector: ".playlist-list",
      message: "플레이리스트 정보를 불러오지 못했습니다.",
    },
  ];

  containers.forEach(({ selector, message }) => {
    const container = document.querySelector(selector);
    if (container) {
      container.innerHTML = `<li>${message}</li>`;
    }
  });
}

/**
 * 스크롤 이벤트 핸들러
 * @param {string} type - 컨테이너 타입 (album, artist, playlist)
 * @param {boolean} toEnd - 오른쪽 끝으로 스크롤할지 여부
 */
function handleScroll(type, toEnd) {
  const listMap = {
    album: albumList,
    artist: artistList,
    playlist: playlistList,
  };

  const list = listMap[type];
  if (!list) return;

  list.scrollTo({
    left: toEnd ? list.scrollWidth : 0,
    behavior: "smooth",
  });
}

/**
 * Show All 토글 핸들러
 * @param {string} type - 컨테이너 타입 (album, artist, playlist)
 */
function handleShowAllToggle(type) {
  const listMap = {
    album: { list: albumList, btn: albumShowAllBtn },
    artist: { list: artistList, btn: artistShowAllBtn },
    playlist: { list: playlistList, btn: playlistShowAllBtn },
  };

  const { list, btn } = listMap[type];
  if (!list || !btn) return;

  const isGrid = list.classList.toggle("grid-mode");
  btn.textContent = isGrid ? "Hide" : "Show All";
  toggleScrollButtons(type, !isGrid);
}

/**
 * 페이지 전역 이벤트 리스너를 설정하는 함수
 */
function setupGlobalEventListeners() {
  // 헤더 메뉴 버튼
  const menuBtn = document.querySelector(".header-menu-btn");
  if (menuBtn) {
    eventManager.addListener(menuBtn, "click", toggleMenu);
  }

  // 검색 버튼
  const searchBtn = document.querySelector(".search-btn");
  if (searchBtn) {
    eventManager.addListener(searchBtn, "click", toggleSearch);
  }

  // 테마 전환 버튼
  const themeToggleBtn = document.querySelector(".theme-toggle");
  if (themeToggleBtn) {
    eventManager.addListener(themeToggleBtn, "click", toggleTheme);
  }

  // 로그인 버튼
  const loginBtn = document.querySelector(".login-btn");
  if (loginBtn) {
    eventManager.addListener(loginBtn, "click", handleLogin);
  }

  // 윈도우 리사이즈 이벤트 - 반응형 UI 처리
  eventManager.addListener(window, "resize", handleResize);

  // 페이지 언로드 시 이벤트 정리
  window.addEventListener("unload", () => {
    eventManager.removeAllListeners();
  });
}

/**
 * 메뉴 토글 핸들러
 */
function toggleMenu() {
  document.body.classList.toggle("menu-open");
}

/**
 * 검색창 토글 핸들러
 */
function toggleSearch() {
  document.body.classList.toggle("search-open");
  const searchInput = document.querySelector(".search-input");
  if (searchInput && document.body.classList.contains("search-open")) {
    searchInput.focus();
  }
}

/**
 * 테마 전환 핸들러
 */
function toggleTheme() {
  document.body.classList.toggle("dark-theme");
  const isDarkTheme = document.body.classList.contains("dark-theme");
  localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
}

/**
 * 로그인 핸들러
 */
function handleLogin() {
  console.log("로그인 처리");
  // 로그인 모달 표시 또는 로그인 페이지로 이동
}

/**
 * 윈도우 리사이즈 핸들러
 */
function handleResize() {
  // 모바일 모드 감지 및 레이아웃 조정
  const isMobile = window.innerWidth < 768;
  document.body.classList.toggle("mobile-view", isMobile);
}

/**
 * 모든 섹션 데이터를 동시에 로드하는 함수
 * @async
 * @returns {Promise<Object>} 모든 섹션 데이터를 포함하는 객체
 */
function loadAllSections() {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await getAllSectionData();
      // Check if any required data is missing or undefined
      if (!data.playlists || !Array.isArray(data.playlists)) {
        throw new Error("플레이리스트 데이터를 불러오지 못했습니다.");
      }
      if (!data.albums || !Array.isArray(data.albums)) {
        throw new Error("앨범 데이터를 불러오지 못했습니다.");
      }
      if (!data.artists || !Array.isArray(data.artists)) {
        throw new Error("아티스트 데이터를 불러오지 못했습니다.");
      }
      resolve(data);
    } catch (error) {
      console.error("섹션 데이터를 불러오는데 실패했습니다.", error);
      reject(error);
    }
  });
}

/**
 * 필수 DOM 요소가 존재하는지 확인하는 함수
 * DOM 요소가 없는 경우 필요한 요소를 생성
 */
function ensureDOMElementsExist() {
  // 앨범 리스트 확인
  if (!document.querySelector(".album-list")) {
    console.warn('".album-list" 요소가 없습니다. 생성하는 중...');
    const albumContainer = document.querySelector(
      ".list-component:nth-child(1) .scroll-wrapper"
    );
    if (albumContainer && !albumContainer.querySelector(".album-list")) {
      const albumList = document.createElement("ul");
      albumList.className = "album-list";
      albumContainer.appendChild(albumList);
    }
  }

  // 아티스트 리스트 확인
  if (!document.querySelector(".artist-list")) {
    console.warn('".artist-list" 요소가 없습니다. 생성하는 중...');
    const artistContainer = document.querySelector(
      ".list-component:nth-child(2) .scroll-wrapper"
    );
    if (artistContainer && !artistContainer.querySelector(".artist-list")) {
      const artistList = document.createElement("ul");
      artistList.className = "artist-list";
      artistContainer.appendChild(artistList);
    }
  }

  // 플레이리스트 리스트 확인
  if (!document.querySelector(".playlist-list")) {
    console.warn('".playlist-list" 요소가 없습니다. 생성하는 중...');
    const playlistContainer = document.querySelector(
      ".list-component:nth-child(3) .scroll-wrapper"
    );
    if (
      playlistContainer &&
      !playlistContainer.querySelector(".playlist-list")
    ) {
      const playlistList = document.createElement("ul");
      playlistList.className = "playlist-list";
      playlistContainer.appendChild(playlistList);
    }
  }
}

// DOM이 로드되면 메인 페이지 초기화
document.addEventListener("DOMContentLoaded", () => {
  applyStoredTheme();
  initMainPage();
});

// 참고: 모든 섹션별 이벤트 리스너는 각 SectionManager가 자동으로 처리합니다.
