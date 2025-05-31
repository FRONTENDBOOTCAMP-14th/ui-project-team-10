/**
 * 플레이리스트 카드 컴포넌트
 *
 * 플레이리스트 정보를 표시하는 웹 컴포넌트입니다.
 * @element playlist-card
 * @attribute {string} playlist-title - 플레이리스트 제목
 * @attribute {string} playlist-owner - 플레이리스트 소유자
 * @attribute {string} playlist-cover - 플레이리스트 커버 이미지 URL
 * @fires {CustomEvent} playlist-click - 플레이리스트가 클릭되었을 때 발생하는 이벤트
 * 
 * 접근성 기능:
 * - 키보드 탐색 지원 (Tab, Enter, Space)
 * - ARIA 속성 및 역할 추가
 * - 스크린 리더 호환성 개선
 * - 고대비 모드 지원
 */

import { BaseCard } from "./base-card.js";

class PlaylistCard extends BaseCard {
  constructor() {
    super(); // BaseCard에서 Shadow DOM 생성
  }

  static get observedAttributes() {
    return ["playlist-title", "playlist-owner", "playlist-cover"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this.shadowRoot.innerHTML !== "") {
      this.render();
    }
  }

  /**
   * 클릭 이벤트 핸들러를 구현합니다.
   * BaseCard의 addEventListeners에서 이 메서드를 호출합니다.
   */
  handleClick() {
    // 플레이리스트 카드가 클릭되면 커스텀 이벤트 발생
    this.dispatchEvent(
      new CustomEvent("playlist-click", {
        bubbles: true,
        composed: true,
        detail: {
          title: this.getAttribute("playlist-title"),
          owner: this.getAttribute("playlist-owner"),
          cover: this.getAttribute("playlist-cover"),
        },
      })
    );
  }

  connectedCallback() {
    this.render();
    this.addEventListeners();
  }

  render() {
    const playlistTitle =
      this.getAttribute("playlist-title") || "플레이리스트 이름";
    const playlistOwner = this.getAttribute("playlist-owner") || "소유자";
    const playlistCover =
      this.getAttribute("playlist-cover") ||
      "/image/default-playlist-cover.png";
      
    // 접근성 개선: 플레이리스트 카드에 고유 ID 생성
    const playlistId = this.getAttribute("id") || `playlist-card-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    if (!this.getAttribute("id")) {
      this.setAttribute("id", playlistId);
    }

    this.shadowRoot.innerHTML = `
      <style>
        ${this.getBaseStyles()}
        
        /* 플레이리스트 카드 고유 스타일 */
        :host {
          font-family: system-ui, -apple-system, sans-serif;
        }
        
        .list-card {
          max-width: 180px;
          transition: transform 0.3s ease;
          padding: 0.5rem;
          /* 접근성: 가독성을 위한 스타일 조정 */
          position: relative;
          display: flex;
          flex-direction: column;
        }
        
        .list-card:hover {
          transform: scale(1.05);
        }
        
        /* 접근성: 키보드 포커스 스타일 개선 */
        .list-card:focus-visible {
          outline: 2px solid #1db954;
          outline-offset: 2px;
          box-shadow: 0 0 0 4px rgba(29, 185, 84, 0.3);
        }
        
        .card-img-container {
          border-radius: 4px;
          margin-bottom: 8px;
          position: relative;
        }
        
        .card-img {
          border-radius: 4px;
          width: 100%;
          height: auto;
        }
        
        .play-button {
          background-color: var(--spotify-green, #1ed760);
          /* 접근성: 표시 개선 */
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .card-title {
          font-weight: 700;
          margin-top: 0.5rem;
          margin-bottom: 0.25rem;
          /* 접근성: 가독성 개선 */
          font-size: 1rem;
          line-height: 1.2;
        }
        
        .card-description {
          color: #b3b3b3;
          margin: 0;
          /* 접근성: 가독성 개선 */
          font-size: 0.875rem;
          line-height: 1.4;
        }
        
        /* 접근성: 키보드 포커스 아이콘 표시 */
        .play-button:focus-visible {
          outline: 2px solid white;
          border-radius: 50%;
        }
        
        /* 접근성: 고대비 모드 지원 */
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
            border: 1px solid ButtonText;
            background-color: ButtonFace;
          }
          
          .play-icon {
            forced-color-adjust: none;
            fill: ButtonText;
          }
        }
        
        @media (max-width: 768px) {
          .list-card {
            max-width: 140px;
          }
        }
      </style>
      
      <article class="list-card" 
        role="button"
        tabindex="0"
        aria-label="플레이리스트: ${playlistTitle}, 제작자: ${playlistOwner}"
        aria-describedby="${playlistId}-title ${playlistId}-owner">
        
        <div class="card-img-container">
          <img src="${playlistCover}" alt="플레이리스트 ${playlistTitle} 커버 이미지" class="card-img" />
          <div class="play-button" role="presentation" aria-hidden="true">
            <img src="/icons/play.svg" alt="" class="play-icon" />
          </div>
        </div> 
        <h3 id="${playlistId}-title" class="card-title">${playlistTitle}</h3>
        <p id="${playlistId}-owner" class="card-description">By ${playlistOwner}</p>
      </article>
    `;
  }
}

customElements.define("playlist-card", PlaylistCard);
