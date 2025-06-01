/**
 * 컴포넌트 팩토리 모듈
 *
 * 재사용 가능한 UI 컴포넌트를 생성하고 관리하는 유틸리티 함수들을 제공합니다.
 * 이 모듈은 중복 코드를 제거하고 일관된 방식으로 컴포넌트를 생성합니다.
 */

import { formatEventName } from "/src/scripts/utils/event-utils.js";

/**
 * 앨범 카드 컴포넌트 생성
 * @param {Object} album - 앨범 데이터
 * @param {string} album.title - 앨범 제목
 * @param {string} album.artist - 아티스트 이름
 * @param {string} album.cover - 앨범 커버 이미지 URL
 * @returns {HTMLElement} 생성된 앨범 카드 컴포넌트
 */
export function createAlbumCard(album) {
  const { title, artist, cover } = album;

  // 앨범 카드 웹 컴포넌트 생성
  const albumCard = document.createElement("album-card");
  albumCard.setAttribute("album-title", title || "앨범 이름");
  albumCard.setAttribute("album-artist", artist || "아티스트");
  albumCard.setAttribute(
    "album-cover",
    cover || "/image/default-album-cover.png"
  );

  return albumCard;
}

/**
 * 아티스트 카드 컴포넌트 생성
 * @param {Object} artist - 아티스트 데이터
 * @param {string} artist.name - 아티스트 이름
 * @param {string} artist.type - 아티스트 유형
 * @param {string} artist.image - 아티스트 이미지 URL
 * @returns {HTMLElement} 생성된 아티스트 카드 컴포넌트
 */
export function createArtistCard(artist) {
  const { name, type, image } = artist;

  // 아티스트 카드 웹 컴포넌트 생성
  const artistCard = document.createElement("artist-card");
  artistCard.setAttribute("artist-name", name || "아티스트 이름");
  artistCard.setAttribute("artist-type", type || "");
  artistCard.setAttribute(
    "artist-image",
    image || "/image/default-artist-image.png"
  );

  return artistCard;
}

/**
 * 플레이리스트 카드 컴포넌트 생성
 * @param {Object} playlist - 플레이리스트 데이터
 * @param {string} playlist.name - 플레이리스트 이름
 * @param {string} playlist.description - 플레이리스트 설명
 * @param {string} playlist.cover - 플레이리스트 커버 이미지 URL
 * @returns {HTMLElement} 생성된 플레이리스트 카드 컴포넌트
 */
export function createPlaylistCard(playlist) {
  const { name, description, cover } = playlist;

  // 플레이리스트 카드 웹 컴포넌트 생성
  const playlistCard = document.createElement("playlist-card");
  playlistCard.setAttribute("playlist-name", name || "플레이리스트 이름");
  playlistCard.setAttribute("playlist-description", description || "");
  playlistCard.setAttribute(
    "playlist-cover",
    cover || "/image/default-playlist-cover.png"
  );

  return playlistCard;
}

/**
 * 버튼 컴포넌트 생성
 * @param {Object} options - 버튼 옵션
 * @param {string} options.text - 버튼 텍스트
 * @param {string} options.variant - 버튼 변형(default, primary, secondary, transparent)
 * @param {string} options.size - 버튼 크기(small, medium, large)
 * @param {string} options.icon - 버튼 아이콘
 * @returns {HTMLElement} 생성된 버튼 컴포넌트
 */
export function createButton(options) {
  const { text, variant, size, icon } = options;

  // 버튼 웹 컴포넌트 생성
  const button = document.createElement("button-component");

  if (text) button.setAttribute("text", text);
  if (variant) button.setAttribute("variant", variant);
  if (size) button.setAttribute("size", size);
  if (icon) button.setAttribute("icon", icon);

  return button;
}

/**
 * 링크 컴포넌트 생성
 * @param {Object} options - 링크 옵션
 * @param {string} options.text - 링크 텍스트
 * @param {string} options.href - 링크 URL
 * @param {boolean} options.buttonStyle - 버튼 스타일 적용 여부
 * @param {string} options.variant - 링크 변형(default, primary, secondary, transparent)
 * @returns {HTMLElement} 생성된 링크 컴포넌트
 */
export function createLink(options) {
  const { text, href, buttonStyle, variant } = options;

  // 링크 웹 컴포넌트 생성
  const link = document.createElement("link-component");

  if (text) link.setAttribute("text", text);
  if (href) link.setAttribute("href", href);
  if (buttonStyle) link.setAttribute("button-style", buttonStyle.toString());
  if (variant) link.setAttribute("variant", variant);

  return link;
}

/**
 * 컴포넌트 렌더링 최적화 함수
 * 여러 컴포넌트를 DocumentFragment를 사용해 효율적으로 렌더링
 * @param {HTMLElement} container - 컴포넌트를 추가할 컨테이너
 * @param {Array<HTMLElement>} components - 렌더링할 컴포넌트 배열
 */
export function renderComponents(container, components) {
  if (!container || !components?.length) return;

  // DocumentFragment 사용하여 리플로우 최소화
  const fragment = document.createDocumentFragment();

  components.forEach((component) => {
    fragment.appendChild(component);
  });

  // 컨테이너에 한 번에 추가
  container.appendChild(fragment);
}
