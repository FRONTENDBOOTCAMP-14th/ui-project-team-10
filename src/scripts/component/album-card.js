/**
 * 앨범 카드 커스텀 엘리먼트
 *
 * 다음 기능을 갖춤 앨범 카드를 표시하는 재사용 가능한 웹 컴포넌트:
 * - 사용자 지정 앨범 제목, 아티스트 이름 및 커버 이미지
 * - 호버 효과 및 재생 버튼 오버레이
 * - 캡슐화를 위한 Shadow DOM
 * - 클릭 시 커스텀 이벤트
 *
 * 접근성 기능:
 * - 키보드 탐색 지원 (Tab, Enter, Space)
 * - ARIA 속성 및 역할
 * - 스크린 리더 호환성
 * - 고대비 모드 지원
 *
 * 반응형 기능:
 * - 다양한 화면 크기에 최적화 (XS, S, M, LG, XL 브레이크포인트)
 * - 터치 인터페이스 개선
 * - 요소의 크기와 스타일을 장치에 따라 자동 조정
 *
 * @element album-card
 * @attribute {string} album-title - 앨범 제목
 * @attribute {string} album-artist - 앨범 아티스트
 * @attribute {string} album-cover - 앨범 커버 이미지 URL
 * @fires {CustomEvent} album-click - 앨범 카드가 클릭되었을 때 발생하는 이벤트
 */

import { BaseCard } from "/src/scripts/component/base-card.js";
import { BREAKPOINTS } from "/src/scripts/utils/responsive-utils.js";

class AlbumCard extends BaseCard {
  constructor() {
    super(); // BaseCard에서 이미 Shadow DOM을 생성합니다
  }

  static get observedAttributes() {
    return ["album-title", "album-artist", "album-cover"];
  }

  connectedCallback() {
    this.render();
    this.addEventListeners();
  }

  attributeChangedCallback() {
    // Re-render when attributes change
    if (this.shadowRoot.innerHTML !== "") {
      this.render();
    }
  }

  /**
   * 클릭 이벤트 핸들러를 구현합니다.
   * BaseCard의 addEventListeners에서 이 메서드를 호출합니다.
   */
  handleClick() {
    // 앨범 카드가 클릭되면 커스텀 이벤트 발생
    this.dispatchEvent(
      new CustomEvent("album-click", {
        bubbles: true,
        composed: true,
        detail: {
          title: this.getAttribute("album-title"),
          artist: this.getAttribute("album-artist"),
          cover: this.getAttribute("album-cover"),
        },
      })
    );
  }

  /**
   * 접근성 구현을 위한 고유 ID 생성
   * 각 요소에 고유한 ID를 제공하여 스크린 리더가 요소를 식별하는 데 도움을 줍니다.
   * @returns {string} 고유 ID 문자열
   */
  generateUniqueId() {
    return Math.random().toString(36).substring(2, 10);
  }

  render() {
    // 기본값이 있는 속성 값 가져오기
    const albumTitle = this.getAttribute("album-title") || "앨범 이름";
    const albumArtist = this.getAttribute("album-artist") || "아티스트";
    const albumCover =
      this.getAttribute("album-cover") || "/image/default-album-cover.png";

    // HTML 콘텐츠 생성
    this.shadowRoot.innerHTML = `
      <style>
        ${this.getBaseStyles()}
        
        /* 앨범 카드 고유 스타일 */
        :host {
          font-family: system-ui, -apple-system, sans-serif;
        }
        
        .list-card {
          max-width: 180px;
          transition: transform 0.3s ease, background-color 0.3s;
          padding: 16px;
          /* 접근성: 가독성을 위한 스타일 조정 */
          position: relative;
          display: flex;
          flex-direction: column;
        }
        
        .list-card:hover {
          transform: scale(1.05);
          background-color: #282828;
        }
        
        /* 접근성: 키보드 포커스 스타일 개선 */
        .list-card:focus-visible {
          outline: 2px solid #1db954;
          outline-offset: 2px;
          transform: scale(1.05);
          box-shadow: 0 0 0 4px rgba(29, 185, 84, 0.3);
        }
        
        .card-img-container {
          border-radius: 8px;
          margin-bottom: 12px;
          position: relative;
          overflow: hidden;
        }
        
        .card-img {
          border-radius: 8px;
          width: 100%;
          height: auto;
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
          transition: all 0.3s ease;
          box-shadow: 0 8px 8px rgba(0, 0, 0, 0.3);
        }
        
        .list-card:hover .play-button,
        .list-card:focus-visible .play-button {
          opacity: 1;
          transform: translateY(0);
        }
        
        .play-button:hover {
          transform: scale(1.1);
          background-color: #1ed760;
        }
        
        .play-icon {
          width: 40%;
          height: 40%;
        }
        
        .card-title {
          font-weight: 700;
          margin-top: 0;
          margin-bottom: 8px;
          /* 접근성: 가독성 개선 */
          font-size: 16px;
          line-height: 1.2;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .card-description {
          color: #b3b3b3;
          margin: 0;
          /* 접근성: 가독성 개선 */
          font-size: 14px;
          line-height: 1.4;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        /* 접근성: 높은 대비 모드 지원 */
        @media (forced-colors: active) {
          .list-card {
            border: 1px solid ButtonText;
          }
          
          .list-card:focus-visible {
            outline: 3px solid Highlight;
          }
          
          .card-title, .card-description {
            color: ButtonText;
          }
          
          .play-button {
            opacity: 1;
            border: 1px solid ButtonText;
            background-color: ButtonFace;
          }
          
          .play-icon {
            forced-color-adjust: none;
            fill: ButtonText;
          }
        }
        
        /* 반응형 스타일: XS (800px 이하) - 모바일 */
        @media (max-width: ${BREAKPOINTS.xs}px) {
          .list-card {
            max-width: 120px;
            padding: 12px;
          }
          
          .card-img-container {
            margin-bottom: 8px;
          }
          
          .card-title {
            font-size: 14px;
            margin-bottom: 4px;
          }
          
          .card-description {
            font-size: 12px;
          }
          
          .play-button {
            width: 32px;
            height: 32px;
            opacity: 0.9; /* 모바일에서는 항상 약간 보이게 */
            bottom: 4px;
            right: 4px;
          }
          
          .play-icon {
            width: 40%;
            height: 40%;
          }
          
          /* 터치 인터페이스 개선 */
          .list-card {
            -webkit-tap-highlight-color: rgba(29, 185, 84, 0.3); /* iOS 터치 하이라이트 */
            touch-action: manipulation; /* 더 좋은 터치 반응성 */
          }
        }
        
        /* 반응형 스타일: S (801px - 850px) - 소형 태블릿 */
        @media (min-width: ${BREAKPOINTS.xs + 1}px) and (max-width: ${
      BREAKPOINTS.s
    }px) {
          .list-card {
            max-width: 140px;
            padding: 14px;
          }
          
          .card-title {
            font-size: 15px;
          }
          
          .card-description {
            font-size: 13px;
          }
        }
        
        /* 반응형 스타일: M (851px - 1078px) - 태블릿 및 소형 데스크톱 */
        @media (min-width: ${BREAKPOINTS.s + 1}px) and (max-width: ${
      BREAKPOINTS.m
    }px) {
          .list-card {
            max-width: 160px;
          }
          
          .play-button {
            width: 36px;
            height: 36px;
          }
          
          .play-icon {
            width: 40%;
            height: 40%;
          }
        }
        
        /* 반응형 스타일: LG (1079px - 1742px) - 데스크톱 */
        @media (min-width: ${BREAKPOINTS.m + 1}px) and (max-width: ${
      BREAKPOINTS.lg
    }px) {
          .list-card {
            max-width: 180px;
          }
        }
        
        /* 반응형 스타일: XL (1743px 이상) - 대형 디스플레이 */
        @media (min-width: ${BREAKPOINTS.lg + 1}px) {
          .list-card {
            max-width: 200px;
            padding: 20px;
          }
          
          .card-img-container {
            margin-bottom: 16px;
          }
          
          .card-title {
            font-size: 18px;
            margin-bottom: 10px;
          }
          
          .card-description {
            font-size: 16px;
          }
          
          .play-button {
            width: 40px;
            height: 40px;
          }
          
          .play-icon {
            width: 40%;
            height: 40%;
          }
        }
      </style>
      <article 
        class="list-card" 
        role="button" 
        aria-label="${albumTitle} by ${albumArtist}">
        <div class="card-img-container" aria-hidden="true">
          <img src="${albumCover}" alt="${albumTitle} album cover" class="card-img" />
          <div class="play-button" aria-label="Play ${albumTitle}">
            <img src="/icons/play-arrow-only.svg" class="play-icon" alt="" />
          </div>
        </div>
        <h3 class="card-title" id="album-title-${this.generateUniqueId()}">${albumTitle}</h3>
        <p class="card-description" id="album-artist-${this.generateUniqueId()}">${albumArtist}</p>
      </article>
    `;
  }
}

// Register the custom element
customElements.define("album-card", AlbumCard);
