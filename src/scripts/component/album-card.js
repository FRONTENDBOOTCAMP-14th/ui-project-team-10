/**
 * 앨범 카드 커스텀 엘리먼트
 *
 * 다음 기능을 갖춤 앨범 카드를 표시하는 재사용 가능한 웹 컴포넌트:
 * - 사용자 지정 앨범 제목, 아티스트 이름 및 커버 이미지
 * - 호버 효과 및 재생 버튼 오버레이
 * - 캡슐화를 위한 Shadow DOM
 * - 반응형 스타일링
 * - 클릭 시 커스텀 이벤트
 *
 * @element album-card
 * @attribute {string} album-title - 앨범 제목
 * @attribute {string} album-artist - 앨범 아티스트
 * @attribute {string} album-cover - 앨범 커버 이미지 URL
 * @fires {CustomEvent} album-click - 앨범 카드가 클릭되었을 때 발생하는 이벤트
 */

import { BaseCard } from "./base-card.js";

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
          transition: transform 0.2s ease;
          padding: 0.5rem;
        }
        
        .list-card:hover {
          transform: scale(1.05);
        }
        
        .list-card:focus {
          transform: scale(1.05);
        }
        
        .card-img-container {
          border-radius: 8px;
          position: relative;
        }
        
        .card-img {
          border-radius: 8px;
        }
        
        /* 접근성: 높은 대비 모드 지원 */
        @media (forced-colors: active) {
          .play-button {
            background-color: ButtonFace;
            border: 1px solid ButtonText;
          }
          .play-icon {
            fill: ButtonText;
          }
        }
        
        @media (max-width: 768px) {
          .list-card {
            max-width: 140px;
          }
        }
      </style>
      <article 
        class="list-card" 
        role="button" 
        tabindex="0" 
        aria-label="${albumTitle} by ${albumArtist}">
        <div class="card-img-container" aria-hidden="true">
          <img src="${albumCover}" alt="${albumTitle} album cover" class="card-img" />
          <div class="play-button" aria-label="Play ${albumTitle}">
            <img src="/icons/play.svg" class="play-icon" alt="" />
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
