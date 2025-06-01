/**
 * 메인 페이지 스크립트
 *
 * 아티스트, 앨범, 플레이리스트 데이터를 가져와서 렌더링하는 기능 구현
 */

// 섹션 컴포넌트 가져오기
import "/src/scripts/component/artist-section.js";
import "/src/scripts/component/album-section.js";
import "/src/scripts/component/playlist-section.js";

import { EventManager, formatEventName } from "/src/scripts/utils/event-utils.js";

/**
 * 플레이리스트 ID로 해당 플레이리스트 정보를 가져옵니다.
 * @async
 * @param {string} id - 플레이리스트 ID
 * @param {string} token - Spotify API 인증 토큰
 * @returns {Promise<Object|null>} 플레이리스트 데이터 또는 오류 발생 시 null
 */
async function getPlaylistById(id, token) {
  const res = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    console.error(`❌ ${id} 불러오기 실패`, res.status);
    return null;
  }

  const data = await res.json();
  return data;
}

/**
 * 여러 플레이리스트 ID에 해당하는 플레이리스트 정보를 모두 가져옵니다.
 * @async
 * @param {string} token - Spotify API 인증 토큰
 * @returns {Promise<Array>} 플레이리스트 객체 배열
 */
async function getPlaylists(token) {
  const playlists = [];

  for (const id of playlistIds) {
    const playlist = await getPlaylistById(id, token);
    if (playlist) {
      playlists.push(playlist);
    }
  }

  return playlists;
}

/**
 * 페이지 초기화 함수
 * 웹 컴포넌트를 페이지에 추가합니다.
 */
function init() {
  const mainContainer = document.querySelector("main .container");
  if (!mainContainer) {
    console.error("main .container 요소를 찾을 수 없습니다.");
    return;
  }

  // 기존 콘텐츠 제거
  mainContainer.innerHTML = "";

  // 컴포넌트 기반 구조로 변경
  const artistSection = document.createElement("artist-section");
  const albumSection = document.createElement("album-section");
  const playlistSection = document.createElement("playlist-section");

  // 순서대로 컴포넌트 추가
  mainContainer.appendChild(artistSection);
  mainContainer.appendChild(albumSection);
  mainContainer.appendChild(playlistSection);
}

// 이벤트 매니저 초기화
const eventManager = new EventManager();

// 페이지 로드 시 초기화 함수 실행
document.addEventListener("DOMContentLoaded", () => {
  init();
  setupEventListeners();
});

/**
 * 이벤트 리스너를 설정하는 함수
 *
 * EventManager를 활용하여 이벤트 관리를 중앙화합니다.
 * 컴포넌트 간 통신 및 글로벌 이벤트 처리를 담당합니다.
 */
function setupEventListeners() {
  // 기존 legacy 이벤트 구독 (호환성을 위해 유지)
  setupLegacyEvents();
  
  // 표준화된 이벤트 구독
  setupStandardizedEvents();
  
  console.log("EventManager로 이벤트 관리가 중앙화되었습니다.");
}

/**
 * 기존 legacy 이벤트를 구독하는 함수
 */
function setupLegacyEvents() {
  // 앨범 클릭 이벤트 구독
  document.addEventListener("album-click", handleAlbumClick);
  
  // 아티스트 클릭 이벤트 구독
  document.addEventListener("artist-click", handleArtistClick);
  
  // 플레이리스트 클릭 이벤트 구독
  document.addEventListener("playlist-click", handlePlaylistClick);
  
  // 버튼 클릭 이벤트 구독
  document.addEventListener("button-click", handleButtonClick);
  
  // 링크 클릭 이벤트 구독
  document.addEventListener("link-click", handleLinkClick);
}

/**
 * 표준화된 이벤트를 구독하는 함수
 */
function setupStandardizedEvents() {
  // 표준화된 이벤트 이름 생성
  const albumClickEvent = formatEventName("album", "click");
  const artistClickEvent = formatEventName("artist", "click");
  const playlistClickEvent = formatEventName("playlist", "click");
  const buttonClickEvent = formatEventName("button", "click");
  const linkClickEvent = formatEventName("link", "click");
  
  // 표준화된 이벤트 구독
  eventManager.subscribe(albumClickEvent, handleStandardizedAlbumClick);
  eventManager.subscribe(artistClickEvent, handleStandardizedArtistClick);
  eventManager.subscribe(playlistClickEvent, handleStandardizedPlaylistClick);
  eventManager.subscribe(buttonClickEvent, handleStandardizedButtonClick);
  eventManager.subscribe(linkClickEvent, handleStandardizedLinkClick);
}

/**
 * 앨범 클릭 이벤트 핸들러
 * @param {CustomEvent} event 이벤트 객체
 */
function handleAlbumClick(event) {
  console.log("Legacy album click:", event.detail);
}

/**
 * 표준화된 앨범 클릭 이벤트 핸들러
 * @param {Object} data 이벤트 데이터
 */
function handleStandardizedAlbumClick(data) {
  console.log("Standardized album click:", data);
  // 상세 로깅 및 추적
  logInteraction("album", data);
}

/**
 * 아티스트 클릭 이벤트 핸들러
 * @param {CustomEvent} event 이벤트 객체
 */
function handleArtistClick(event) {
  console.log("Legacy artist click:", event.detail);
}

/**
 * 표준화된 아티스트 클릭 이벤트 핸들러
 * @param {Object} data 이벤트 데이터
 */
function handleStandardizedArtistClick(data) {
  console.log("Standardized artist click:", data);
  // 상세 로깅 및 추적
  logInteraction("artist", data);
}

/**
 * 플레이리스트 클릭 이벤트 핸들러
 * @param {CustomEvent} event 이벤트 객체
 */
function handlePlaylistClick(event) {
  console.log("Legacy playlist click:", event.detail);
}

/**
 * 표준화된 플레이리스트 클릭 이벤트 핸들러
 * @param {Object} data 이벤트 데이터
 */
function handleStandardizedPlaylistClick(data) {
  console.log("Standardized playlist click:", data);
  // 상세 로깅 및 추적
  logInteraction("playlist", data);
}

/**
 * 버튼 클릭 이벤트 핸들러
 * @param {CustomEvent} event 이벤트 객체
 */
function handleButtonClick(event) {
  console.log("Legacy button click:", event.detail);
}

/**
 * 표준화된 버튼 클릭 이벤트 핸들러
 * @param {Object} data 이벤트 데이터
 */
function handleStandardizedButtonClick(data) {
  console.log("Standardized button click:", data);
  // 상세 로깅 및 추적
  logInteraction("button", data);
}

/**
 * 링크 클릭 이벤트 핸들러
 * @param {CustomEvent} event 이벤트 객체
 */
function handleLinkClick(event) {
  console.log("Legacy link click:", event.detail);
}

/**
 * 표준화된 링크 클릭 이벤트 핸들러
 * @param {Object} data 이벤트 데이터
 */
function handleStandardizedLinkClick(data) {
  console.log("Standardized link click:", data);
  // 상세 로깅 및 추적
  logInteraction("link", data);
}

/**
 * 이벤트 인터렉션 로깅 함수
 * @param {string} type 인터렉션 타입
 * @param {Object} data 이벤트 데이터
 */
function logInteraction(type, data) {
  // 타임스킬프 추출
  const timestamp = data.timestamp || new Date().toISOString();
  
  // 상세 로깅 및 분석
  console.log(`${type} interaction at ${timestamp}:`, data);
  
  // 여기서 로깅 시스템이나 애널리틱스로 데이터 전송
  // trackEvent(type, data);
}

// 페이지 언로드 시 이벤트 정리
window.addEventListener("unload", () => {
  // 기존 이벤트 리스너 제거
  document.removeEventListener("album-click", handleAlbumClick);
  document.removeEventListener("artist-click", handleArtistClick);
  document.removeEventListener("playlist-click", handlePlaylistClick);
  document.removeEventListener("button-click", handleButtonClick);
  document.removeEventListener("link-click", handleLinkClick);
  
  // EventManager의 모든 리스너 제거
  eventManager.removeAllListeners();
});
