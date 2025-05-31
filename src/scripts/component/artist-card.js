/**
 * 아티스트 카드 커스텀 엘리먼트
 *
 * 다음 기능을 갖춘 아티스트 카드를 표시하는 재사용 가능한 웹 컴포넌트:
 * - 사용자 지정 아티스트 이름 및 프로필 이미지
 * - 호버 효과 및 재생 버튼 오버레이
 * - 캡슐화를 위한 Shadow DOM
 * - 반응형 스타일링
 * - 클릭 시 커스텀 이벤트
 *
 * @element artist-card
 * @attribute {string} artist-name - 아티스트 이름
 * @attribute {string} artist-type - 아티스트 유형 (예: "Artist")
 * @attribute {string} artist-image - 아티스트 프로필 이미지 URL
 * @fires {CustomEvent} artist-click - 아티스트 카드가 클릭되었을 때 발생하는 이벤트
 */

import { BaseCard } from "./base-card.js";

class ArtistCard extends BaseCard {
  constructor() {
    super(); // BaseCard에서 이미 Shadow DOM을 생성합니다
  }

  static get observedAttributes() {
    return ["artist-name", "artist-type", "artist-image"];
  }

  connectedCallback() {
    this.render();
    this.addEventListeners();
  }

  attributeChangedCallback() {
    // 속성이 변경되면 다시 렌더링
    if (this.shadowRoot.innerHTML !== "") {
      this.render();
    }
  }

  /**
   * 클릭 이벤트 핸들러를 구현합니다.
   * BaseCard의 addEventListeners에서 이 메서드를 호출합니다.
   */
  handleClick() {
    // 아티스트 카드가 클릭되면 커스텀 이벤트 발생
    this.dispatchEvent(
      new CustomEvent("artist-click", {
        bubbles: true,
        composed: true,
        detail: {
          name: this.getAttribute("artist-name"),
          type: this.getAttribute("artist-type"),
          image: this.getAttribute("artist-image"),
        },
      })
    );
  }

  render() {
    // 기본값이 있는 속성 값 가져오기
    const artistName = this.getAttribute("artist-name") || "아티스트 이름";
    const artistType = this.getAttribute("artist-type") || "Artist";
    const artistImage =
      this.getAttribute("artist-image") || "/image/default-artist-image.png";

    // HTML 콘텐츠 생성
    this.shadowRoot.innerHTML = `
      <style>
        ${this.getBaseStyles()}
        
        /* 아티스트 카드 고유 스타일 */
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
        
        .card-img-container {
          border-radius: 50%;
        }
        
        .card-title, .card-description {
          text-align: center;
        }
        
        @media (max-width: 768px) {
          .list-card {
            max-width: 140px;
          }
        }
      </style>
      <article class="list-card">
        <div class="card-img-container">
          <img src="${artistImage}" alt="${artistName}" class="card-img" />
          <div class="play-button">
            <img src="/icons/play.svg" class="play-icon" alt="play" />
          </div>
        </div>
        <h3 class="card-title">${artistName}</h3>
        <p class="card-description">${artistType}</p>
      </article>
    `;
  }
}

// 커스텀 엘리먼트 등록
customElements.define("artist-card", ArtistCard);
