/**
 * 메인 페이지 스크립트
 *
 * 아티스트, 앨범, 플레이리스트 데이터를 가져와서 렌더링하는 기능 구현
 */

// 섹션 컴포넌트 가져오기
import "./component/artist-section.js";
import "./component/album-section.js";
import "./component/playlist-section.js";

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

// 페이지 로드 시 초기화 함수 실행
document.addEventListener("DOMContentLoaded", () => {
  init();
  setupEventListeners();
});

/**
 * 이벤트 리스너를 설정하는 함수
 *
 * 컴포넌트 기반 구조에서는 각 컴포넌트가 자체적으로 이벤트 처리를 담당합니다.
 * 이 함수는 글로벌 이벤트나 컴포넌트 간 통신을 위해 필요한 경우 확장할 수 있습니다.
 */
function setupEventListeners() {
  // 추가 이벤트 리스너가 필요한 경우 여기에 추가
  console.log("컴포넌트 기반 구조로 변경되었습니다.");
}
