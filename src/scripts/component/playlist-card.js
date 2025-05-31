/**
 * 플레이리스트 카드 컴포넌트
 *
 * 플레이리스트 정보를 표시하는 웹 컴포넌트입니다.
 * @element playlist-card
 * @attribute {string} playlist-title - 플레이리스트 제목
 * @attribute {string} playlist-owner - 플레이리스트 소유자
 * @attribute {string} playlist-cover - 플레이리스트 커버 이미지 URL
 * @fires {CustomEvent} playlist-click - 플레이리스트가 클릭되었을 때 발생하는 이벤트
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
        }
        
        .list-card:hover {
          transform: scale(1.05);
        }
        
        .card-img-container {
          border-radius: 4px;
          margin-bottom: 8px;
        }
        
        .card-img {
          border-radius: 4px;
        }
        
        .play-button {
          background-color: var(--spotify-green, #1ed760);
        }
        
        .card-title {
          font-weight: 700;
        }
        
        .card-description {
          color: #b3b3b3;
        }
        
        @media (max-width: 768px) {
          .list-card {
            max-width: 140px;
          }
        }
      </style>
      
      <article class="list-card">
        <div class="card-img-container">
          <img src="${playlistCover}" alt="${playlistTitle}" class="card-img" />
          <div class="play-button">
            <img src="/icons/play.svg" alt="Play" class="play-icon" />
          </div>
        </div> 
        <h3 class="card-title">${playlistTitle}</h3>
        <p class="card-description">By ${playlistOwner}</p>
      </article>
    `;
  }
}

customElements.define("playlist-card", PlaylistCard);
