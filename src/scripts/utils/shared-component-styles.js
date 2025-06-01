/**
 * 컴포넌트 간에 공유되는 스타일 및 유틸리티
 * 모든 컴포넌트에서 사용하는 공통 스타일, 아이콘, 유틸리티 함수
 * 여기에는 아티스트, 앨범, 플레이리스트 카드의 공통 스타일도 포함됩니다.
 */

import { BREAKPOINTS } from "./responsive-utils.js";

/**
 * 공통 아이콘 맵을 가져옵니다.
 * @returns {Object} 아이콘 이름과 SVG 문자열의 맵
 */
export const sharedIconMap = {
  search:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>',
  home: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>',
  play: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
  pause:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>',
  next: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>',
  prev: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z"/></svg>',
  close:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
  settings:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',
  plus: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>',
  heart:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
  globe:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
  download:
    '<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_29_2486)"><path d="M4.99497 8.745C5.1356 8.60455 5.32622 8.52566 5.52497 8.52566C5.72373 8.52566 5.91435 8.60455 6.05497 8.745L7.24997 9.939V4C7.24997 3.80109 7.32899 3.61032 7.46964 3.46967C7.6103 3.32902 7.80106 3.25 7.99997 3.25C8.19889 3.25 8.38965 3.32902 8.5303 3.46967C8.67096 3.61032 8.74997 3.80109 8.74997 4V9.94L9.94497 8.745C10.0136 8.67131 10.0964 8.61221 10.1884 8.57122C10.2804 8.53023 10.3797 8.50819 10.4805 8.50641C10.5812 8.50463 10.6812 8.52316 10.7746 8.56088C10.868 8.5986 10.9528 8.65474 11.024 8.72596C11.0952 8.79718 11.1514 8.88201 11.1891 8.9754C11.2268 9.06879 11.2453 9.16882 11.2436 9.26952C11.2418 9.37023 11.2197 9.46954 11.1788 9.56154C11.1378 9.65354 11.0787 9.73634 11.005 9.805L7.99997 12.811L7.47197 12.283C7.4703 12.2813 7.46864 12.2797 7.46697 12.278L4.99497 9.805C4.85452 9.66437 4.77563 9.47375 4.77563 9.275C4.77563 9.07625 4.85452 8.88563 4.99497 8.745Z" fill="currentColor"/><path d="M0 8C0 5.87827 0.842855 3.84344 2.34315 2.34315C3.84344 0.842855 5.87827 0 8 0C10.1217 0 12.1566 0.842855 13.6569 2.34315C15.1571 3.84344 16 5.87827 16 8C16 10.1217 15.1571 12.1566 13.6569 13.6569C12.1566 15.1571 10.1217 16 8 16C5.87827 16 3.84344 15.1571 2.34315 13.6569C0.842855 12.1566 0 10.1217 0 8ZM8 1.5C6.27609 1.5 4.62279 2.18482 3.40381 3.40381C2.18482 4.62279 1.5 6.27609 1.5 8C1.5 9.72391 2.18482 11.3772 3.40381 12.5962C4.62279 13.8152 6.27609 14.5 8 14.5C9.72391 14.5 11.3772 13.8152 12.5962 12.5962C13.8152 11.3772 14.5 9.72391 14.5 8C14.5 6.27609 13.8152 4.62279 12.5962 3.40381C11.3772 2.18482 9.72391 1.5 8 1.5Z" fill="currentColor"/></g></svg>',
  browse:
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_29_2587)"><path d="M15 16.02C15 17.125 13.657 18.02 12 18.02C10.343 18.02 9 17.125 9 16.02C9 14.915 10.343 14.02 12 14.02C13.657 14.02 15 14.915 15 16.02Z" fill="currentColor"/><path d="M1.51307 9.88996C1.60698 9.7742 1.72558 9.6809 1.86019 9.61688C1.9948 9.55287 2.14202 9.51975 2.29107 9.51996H21.7091C21.8581 9.51983 22.0053 9.55302 22.1399 9.6171C22.2745 9.68118 22.393 9.77454 22.4868 9.89033C22.5807 10.0061 22.6475 10.1414 22.6823 10.2864C22.7171 10.4313 22.7191 10.5822 22.6881 10.728L20.3491 21.728C20.3014 21.952 20.1783 22.1529 20.0003 22.2971C19.8223 22.4413 19.6001 22.5199 19.3711 22.52H4.63007C4.401 22.5199 4.17889 22.4413 4.00087 22.2971C3.82285 22.1529 3.69972 21.952 3.65207 21.728L1.31307 10.728C1.28214 10.5823 1.28413 10.4315 1.3189 10.2867C1.35368 10.1419 1.42036 10.0067 1.51407 9.89096L1.51307 9.88996ZM3.52507 11.52L5.43807 20.52H18.5611L20.4741 11.52H3.52507ZM4.00007 2.51996C4.00007 2.25474 4.10543 2.00039 4.29297 1.81285C4.4805 1.62532 4.73486 1.51996 5.00007 1.51996H19.0001C19.2653 1.51996 19.5196 1.62532 19.7072 1.81285C19.8947 2.00039 20.0001 2.25474 20.0001 2.51996V6.51996H18.0001V3.51996H6.00007V6.51996H4.00007V2.51996Z" fill="currentColor"/></g></svg>',
  external:
    '<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M1.75 2h5.5a.75.75 0 0 1 0 1.5h-5.5A.25.25 0 0 0 1.5 3.75v10.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-5.5a.75.75 0 0 1 1.5 0v5.5A1.75 1.75 0 0 1 12.25 16H1.75A1.75 1.75 0 0 1 0 14.25V3.75C0 2.784.784 2 1.75 2zM7.5 1.75a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0V3.56L7.28 9.78a.75.75 0 0 1-1.06-1.06l6.22-6.22H8.25a.75.75 0 0 1-.75-.75z" fill="currentColor"/></svg>',
};

/**
 * 공통 카드 컴포넌트 스타일
 * 모든 카드 컴포넌트에서 사용할 수 있는 기본 스타일
 * @returns {string} 공통 카드 CSS 스타일
 */
export function getCardBaseStyles() {
  return `
    :host {
      display: block;
      width: 100%;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .list-card {
      background-color: #181818;
      border-radius: 6px;
      transition: background-color 0.3s, outline 0.2s, transform 0.2s;
      cursor: pointer;
      height: 100%;
      box-sizing: border-box;
      outline: none;
      position: relative;
      max-width: 180px;
      padding: 16px;
      display: flex;
      flex-direction: column;
    }

    /* 접근성: 키보드 초점 상태에 시각적 표시 */
    .list-card:focus-visible {
      outline: 2px solid #1db954;
      outline-offset: 2px;
      transform: scale(1.05);
      box-shadow: 0 0 0 4px rgba(29, 185, 84, 0.3);
    }

    .list-card:hover {
      background-color: #282828;
      transform: scale(1.05);
    }

    /* 접근성: 높은 대비 모드 지원 */
    @media (forced-colors: active) {
      .list-card {
        border: 1px solid CanvasText;
      }
      .list-card:focus-visible {
        outline: 2px solid Highlight;
      }
    }

    .card-img-container {
      position: relative;
      width: 100%;
      margin-bottom: 16px;
      border-radius: 4px;
      overflow: hidden;
    }

    .card-img {
      width: 100%;
      height: auto;
      border-radius: 4px;
      transition: transform 0.3s ease;
    }

    .list-card:hover .card-img {
      transform: scale(1.05);
    }

    .play-button {
      position: absolute;
      bottom: 8px;
      right: 8px;
      width: 36px;
      height: 36px;
      background-color: #1db954;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transform: translateY(8px);
      transition: opacity 0.3s, transform 0.3s;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      z-index: 1;
    }

    .list-card:hover .play-button,
    .list-card:focus-visible .play-button {
      opacity: 1;
      transform: translateY(0);
    }

    .play-button svg {
      width: 24px;
      height: 24px;
      fill: white;
    }

    .card-title {
      font-weight: 700;
      font-size: 14px;
      margin: 0 0 4px;
      color: white;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .card-subtitle {
      font-size: 12px;
      color: #b3b3b3;
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* 반응형 스타일 */
    @media (max-width: ${BREAKPOINTS.SM}px) {
      .list-card {
        max-width: 140px;
        padding: 12px;
      }
      .card-title {
        font-size: 12px;
      }
      .card-subtitle {
        font-size: 10px;
      }
      .play-button {
        width: 32px;
        height: 32px;
      }
      .play-button svg {
        width: 20px;
        height: 20px;
      }
    }

    @media (max-width: ${BREAKPOINTS.XS}px) {
      .list-card {
        max-width: 120px;
        padding: 8px;
      }
    }
  `;
}

/**
 * 앨범 카드 특화 스타일
 * @returns {string} 앨범 카드 CSS 스타일
 */
export function getAlbumCardStyles() {
  return `
    .card-img-container {
      border-radius: 4px;
      aspect-ratio: 1/1;
    }
  `;
}

/**
 * 아티스트 카드 특화 스타일
 * @returns {string} 아티스트 카드 CSS 스타일
 */
export function getArtistCardStyles() {
  return `
    .card-img-container {
      border-radius: 50%;
      aspect-ratio: 1/1;
    }
    .card-img {
      border-radius: 50%;
    }
    .card-title {
      text-align: center;
    }
    .card-subtitle {
      text-align: center;
    }
  `;
}

/**
 * 플레이리스트 카드 특화 스타일
 * @returns {string} 플레이리스트 카드 CSS 스타일
 */
export function getPlaylistCardStyles() {
  return `
    .card-img-container {
      border-radius: 4px;
      aspect-ratio: 1/1;
    }
    .card-owner {
      font-size: 12px;
      color: #b3b3b3;
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `;
}

/**
 * 공통 사용자 정의 이벤트 디스패치 헬퍼
 * @param {HTMLElement} element 이벤트를 발생시킬 요소
 * @param {string} eventName 이벤트 이름
 * @param {Object} detail 이벤트 상세 정보
 */
export function dispatchCustomEvent(element, eventName, detail = {}) {
  element.dispatchEvent(
    new CustomEvent(eventName, {
      bubbles: true,
      composed: true,
      detail,
    })
  );
}
