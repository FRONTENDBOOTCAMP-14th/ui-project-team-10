/**
 * 아티스트 카드 커스텀 엘리먼트
 *
 * 다음 기능을 갖춘 아티스트 카드를 표시하는 재사용 가능한 웹 컴포넌트:
 * - 사용자 지정 아티스트 이름 및 프로필 이미지
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
 * - 원형 이미지 및 컨텐츠 크기 자동 조정
 * - 화면 크기별 적절한 여백과 폰트 크기 적용
 *
 * @element artist-card
 * @attribute {string} artist-name - 아티스트 이름
 * @attribute {string} artist-type - 아티스트 유형 (예: "Artist")
 * @attribute {string} artist-image - 아티스트 프로필 이미지 URL
 * @fires {CustomEvent} artist-click - 아티스트 카드가 클릭되었을 때 발생하는 이벤트
 */

import { BaseCard } from "/src/scripts/component/base-card.js";
import { BREAKPOINTS } from "/src/scripts/utils/responsive-utils.js";
import {
  EventManager,
  formatEventName,
} from "/src/scripts/utils/event-utils.js";
import { getArtistCardStyles } from "/src/scripts/utils/shared-component-styles.js";

class ArtistCard extends BaseCard {
  constructor() {
    super(); // BaseCard에서 이미 Shadow DOM을 생성합니다
    this.eventManager = new EventManager();
  }

  static get observedAttributes() {
    return ["artist-name", "artist-type", "artist-image"];
  }

  connectedCallback() {
    this.render();
    this.addEventListeners();
  }

  disconnectedCallback() {
    // 컴포넌트가 DOM에서 제거될 때 이벤트 정리
    this.eventManager.cleanup();
  }

  /**
   * 이벤트 리스너를 추가합니다.
   */
  addEventListeners() {
    const card = this.shadowRoot.querySelector(".list-card");

    // EventManager를 사용하여 이벤트 리스너 등록
    this.eventManager.addListener(card, "click", this.handleClick.bind(this));

    // 키보드 접근성 이벤트
    this.eventManager.addListener(card, "keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.handleClick();
      }
    });

    // 추가: 터치 이벤트 최적화 (모바일 디바이스용)
    if ("ontouchstart" in window) {
      // 터치 이벤트에 스로틀 적용
      const throttledTouchHandler = this.eventManager.throttle(() => {
        this.handleClick();
      }, 300);

      this.eventManager.addListener(
        card,
        "touchstart",
        (e) => {
          // 스크롤 방지를 위해 터치 이벤트 처리
          if (e.touches.length === 1) {
            e.preventDefault();
            throttledTouchHandler();
          }
        },
        { passive: false }
      );
    }
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
    // event-utils를 사용하여 표준화된 이벤트 이름 생성 및 이벤트 발행
    const eventName = formatEventName("artist", "click");
    const eventData = {
      name: this.getAttribute("artist-name"),
      type: this.getAttribute("artist-type"),
      image: this.getAttribute("artist-image"),
      component: "artist-card",
      timestamp: new Date().toISOString(),
      // 호환성을 위해 원래 이벤트 이름으로도 전송
      originalEvent: "artist-click",
    };

    // 1. 레거시 지원을 위한 기존 이벤트 방식 유지
    this.dispatchEvent(
      new CustomEvent("artist-click", {
        bubbles: true,
        composed: true,
        detail: eventData,
      })
    );

    // 2. 이벤트 매니저를 통한 표준화된 이벤트 발행
    this.eventManager.publish(eventName, eventData);
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
        ${getArtistCardStyles()}
        
        .list-card:hover {
          transform: scale(1.05);
          background-color: #282828;
        }
        
        /* 접근성: 키보드 포커스 스타일 개선 */
        .list-card:focus-visible {
          outline: 2px solid #1db954;
          outline-offset: 2px;
          box-shadow: 0 0 0 4px rgba(29, 185, 84, 0.3);
          transform: scale(1.05);
          background-color: #282828;
        }
        
        .card-img-container {
          margin-bottom: 12px;
          position: relative;
          overflow: hidden;
          border-radius: 50%;
          width: 100%;
          max-width: 160px;
          aspect-ratio: 1/1;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .list-card:hover .card-img-container {
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.3);
          transform: translateY(-4px);
        }
        
        .card-img {
          width: 100%;
          height: auto;
          transition: transform 0.3s ease;
        }
        
        .list-card:hover .card-img {
          transform: scale(1.05);
        }
        
        .play-button {
          position: absolute;
          bottom: 8%;
          right: 8%;
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
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          z-index: 1;
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
        
        .card-title, .card-description {
          text-align: center;
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .card-title {
          font-size: 16px;
          font-weight: 700;
          line-height: 1.2;
          margin: 12px 0 4px;
          color: #fff;
        }
        
        .card-description {
          font-size: 14px;
          line-height: 1.4;
          color: #b3b3b3;
          margin: 0 0 8px;
        }
        
        /* 접근성: 고대비 모드 지원 */
        @media (forced-colors: active) {
          .list-card {
            border: 1px solid ButtonText;
          }
          
          .list-card:focus-visible {
            outline: 3px solid Highlight;
            forced-color-adjust: none;
          }
          
          .card-title, .card-description {
            color: ButtonText;
          }
          
          .card-img-container {
            border: 1px solid ButtonText;
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
            max-width: 130px;
            padding: 12px;
          }
          
          .card-img-container {
            max-width: 110px;
            margin-bottom: 8px;
          }
          
          .card-title {
            font-size: 14px;
            margin: 8px 0 2px;
          }
          
          .card-description {
            font-size: 12px;
            margin: 0 0 4px;
          }
          
          .play-button {
            width: 32px;
            height: 32px;
            opacity: 0.9; /* 모바일에서는 항상 약간 보이게 */
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
            max-width: 150px;
            padding: 14px;
          }
          
          .card-img-container {
            max-width: 130px;
            margin-bottom: 10px;
          }
          
          .card-title {
            font-size: 15px;
          }
          
          .card-description {
            font-size: 13px;
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
        
        /* 반응형 스타일: M (851px - 1078px) - 태블릿 및 소형 데스크톱 */
        @media (min-width: ${BREAKPOINTS.s + 1}px) and (max-width: ${
      BREAKPOINTS.m
    }px) {
          .list-card {
            max-width: 160px;
          }
          
          .card-img-container {
            max-width: 140px;
          }
          
          .play-button {
            width: 38px;
            height: 38px;
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
          
          .card-img-container {
            max-width: 160px;
          }
        }
        
        /* 반응형 스타일: XL (1743px 이상) - 대형 디스플레이 */
        @media (min-width: ${BREAKPOINTS.lg + 1}px) {
          .list-card {
            max-width: 200px;
            padding: 20px;
          }
          
          .card-img-container {
            max-width: 180px;
            margin-bottom: 16px;
          }
          
          .card-title {
            font-size: 18px;
            margin: 14px 0 6px;
          }
          
          .card-description {
            font-size: 16px;
            margin: 0 0 10px;
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
        aria-labelledby="${titleId} ${typeId}"
        aria-label="아티스트: ${artistName}, 유형: ${artistType}">
        <div class="card-img-container" aria-hidden="true">
          <img src="${artistImage}" alt="" class="card-img" />
          <div class="play-button" role="presentation">
            <img src="/icons/play-arrow-only.svg" class="play-icon" alt="" />
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
