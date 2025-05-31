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
 * 접근성 기능:
 * - 키보드 탐색 지원 (Tab, Enter, Space)
 * - ARIA 속성 및 역할
 * - 스크린 리더 호환성
 * - 고대비 모드 지원
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

    // 접근성: 키보드 이벤트 처리 추가
    this.shadowRoot
      .querySelector(".list-card")
      .addEventListener("keydown", (e) => {
        // Enter 또는 Space 키로 활성화
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.handleClick();
        }
      });
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
    const artistName = this.getAttribute("artist-name") || "아티스트 이름";
    const artistType = this.getAttribute("artist-type") || "Artist";
    const artistImage =
      this.getAttribute("artist-image") || "/image/default-artist-image.png";

    // 접근성: 아티스트 카드에 고유 ID 생성
    const titleId = `artist-title-${this.generateUniqueId()}`;
    const typeId = `artist-type-${this.generateUniqueId()}`;
    const cardId = this.id || `artist-card-${this.generateUniqueId()}`;

    if (!this.id) {
      this.setAttribute("id", cardId);
    }

    // HTML 콘텐츠 생성 (접근성 개선 포함)
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
          /* 접근성: 가독성을 위한 스타일 조정 */
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .list-card:hover {
          transform: scale(1.05);
        }
        
        /* 접근성: 키보드 포커스 스타일 개선 */
        .list-card:focus-visible {
          outline: 2px solid #1db954;
          outline-offset: 2px;
          box-shadow: 0 0 0 4px rgba(29, 185, 84, 0.3);
          transform: scale(1.05);
        }
        
        .card-img-container {
          border-radius: 50%;
          overflow: hidden;
          position: relative;
          width: 100%;
          max-width: 160px;
          aspect-ratio: 1/1;
        }
        
        .card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .card-title, .card-description {
          text-align: center;
          margin: 0.5rem 0 0.25rem;
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .card-title {
          font-size: 1rem;
          line-height: 1.2;
        }
        
        .card-description {
          font-size: 0.875rem;
          line-height: 1.4;
          color: #b3b3b3;
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
      <article 
        class="list-card"
        role="button"
        tabindex="0"
        aria-labelledby="${titleId} ${typeId}"
        aria-label="아티스트: ${artistName}, 유형: ${artistType}">
        <div class="card-img-container" aria-hidden="true">
          <img src="${artistImage}" alt="" class="card-img" />
          <div class="play-button" role="presentation">
            <img src="/icons/play.svg" class="play-icon" alt="" />
          </div>
        </div>
        <h3 id="${titleId}" class="card-title">${artistName}</h3>
        <p id="${typeId}" class="card-description">${artistType}</p>
      </article>
    `;
  }
}

// 커스텀 엘리먼트 등록
customElements.define("artist-card", ArtistCard);
