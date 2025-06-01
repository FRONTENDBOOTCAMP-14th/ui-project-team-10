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
 *
 * 반응형 기능:
 * - 다양한 화면 크기에 최적화 (XS, S, M, LG, XL 브레이크포인트)
 * - 터치 인터페이스 개선
 * - 요소의 크기와 스타일을 장치에 따라 자동 조정
 */

import { BaseCard } from "/src/scripts/component/base-card.js";
import { BREAKPOINTS } from "/src/scripts/utils/responsive-utils.js";
import {
  EventManager,
  formatEventName,
} from "/src/scripts/utils/event-utils.js";

class PlaylistCard extends BaseCard {
  constructor() {
    super(); // BaseCard에서 Shadow DOM 생성
    this.eventManager = new EventManager();
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
    // 표준화된 이벤트 이름 생성 및 이벤트 데이터 구성
    const eventName = formatEventName("playlist", "click");
    const eventData = {
      title: this.getAttribute("playlist-title"),
      owner: this.getAttribute("playlist-owner"),
      cover: this.getAttribute("playlist-cover"),
      component: "playlist-card",
      timestamp: new Date().toISOString(),
      originalEvent: "playlist-click",
    };

    // 1. 레거시 지원을 위한 기존 이벤트 방식 유지
    this.dispatchEvent(
      new CustomEvent("playlist-click", {
        bubbles: true,
        composed: true,
        detail: eventData,
      })
    );

    // 2. 이벤트 매니저를 통한 표준화된 이벤트 발행
    this.eventManager.publish(eventName, eventData);
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

    // 터치 이벤트 최적화 (모바일 디바이스용)
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

  render() {
    const playlistTitle =
      this.getAttribute("playlist-title") || "플레이리스트 이름";
    const playlistOwner = this.getAttribute("playlist-owner") || "소유자";
    const playlistCover =
      this.getAttribute("playlist-cover") ||
      "/image/default-playlist-cover.png";

    // 접근성 개선: 플레이리스트 카드에 고유 ID 생성
    const playlistId =
      this.getAttribute("id") ||
      `playlist-card-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
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
          box-shadow: 0 0 0 4px rgba(29, 185, 84, 0.3);
        }
        
        .card-img-container {
          border-radius: 4px;
          margin-bottom: 12px;
          position: relative;
          overflow: hidden;
        }
        
        .card-img {
          border-radius: 4px;
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
      
      <article class="list-card" 
        role="button"
        aria-label="플레이리스트: ${playlistTitle}, 제작자: ${playlistOwner}"
        aria-describedby="${playlistId}-title ${playlistId}-owner">
        
        <div class="card-img-container">
          <img src="${playlistCover}" alt="플레이리스트 ${playlistTitle} 커버 이미지" class="card-img" />
          <div class="play-button" role="presentation" aria-hidden="true">
            <img src="/icons/play-arrow-only.svg" alt="" class="play-icon" />
          </div>
        </div> 
        <h3 id="${playlistId}-title" class="card-title">${playlistTitle}</h3>
        <p id="${playlistId}-owner" class="card-description">By ${playlistOwner}</p>
      </article>
    `;
  }
}

customElements.define("playlist-card", PlaylistCard);
