/**
 * 기본 카드 컴포넌트
 *
 * 모든 카드 컴포넌트(아티스트, 앨범, 플레이리스트)의 공통 기능을 제공하는 베이스 클래스입니다.
 * 이 클래스는 직접 사용하기보다는 다른 카드 컴포넌트들이 상속받아 사용합니다.
 *
 * 접근성 기능:
 * - 키보드 탐색 지원 (Tab, Enter, Space)
 * - ARIA 속성 및 역할
 * - 스크린 리더 호환성
 * - 색상 대비 개선
 *
 * 반응형 기능:
 * - 다양한 화면 크기에 대한 최적화
 * - 터치 인터랙션 지원 개선
 * - 화면 너비에 따른 요소 크기 조정
 *
 * @class BaseCard
 * @extends HTMLElement
 */

import { BREAKPOINTS } from "../utils/responsive-utils.js";
export class BaseCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  /**
   * 컴포넌트가 DOM에 연결될 때 호출됩니다.
   */
  connectedCallback() {
    this.render();
    this.addEventListeners();
  }

  /**
   * 컴포넌트의 관찰할 속성들을 정의합니다.
   * 이 메서드는 하위 클래스에서 오버라이드해야 합니다.
   * @returns {string[]} 관찰할 속성 배열
   */
  static get observedAttributes() {
    return [];
  }

  /**
   * 속성이 변경되면 다시 렌더링합니다.
   */
  attributeChangedCallback() {
    if (this.shadowRoot.innerHTML !== "") {
      this.render();
    }
  }

  /**
   * 이벤트 리스너를 추가합니다.
   * 이 메서드는 하위 클래스에서 오버라이드해야 합니다.
   */
  addEventListeners() {
    const card = this.shadowRoot.querySelector(".list-card");
    if (card) {
      card.addEventListener("click", this.handleClick.bind(this));

      // 키보드 접근성 지원 추가
      card.addEventListener("keydown", (event) => {
        // Enter 또는 Space 키를 누르면 클릭 이벤트와 동일하게 처리
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          this.handleClick(event);
        }
      });
    }
  }

  /**
   * 클릭 이벤트 핸들러입니다.
   * 이 메서드는 하위 클래스에서 오버라이드해야 합니다.
   * @param {Event} event - 클릭 이벤트
   */
  handleClick(event) {
    // 기본 구현은 아무 작업도 수행하지 않습니다.
    // 하위 클래스에서 오버라이드하여 구현해야 합니다.
  }

  /**
   * 컴포넌트를 렌더링합니다.
   * 이 메서드는 하위 클래스에서 오버라이드해야 합니다.
   */
  render() {
    // 기본 구현은 아무 작업도 수행하지 않습니다.
    // 하위 클래스에서 오버라이드하여 구현해야 합니다.
  }

  /**
   * 기본 카드 스타일을 반환합니다.
   * @returns {string} 카드의 기본 CSS 스타일
   */
  getBaseStyles() {
    return `
      :host {
        display: block;
        width: 100%;
      }
      
      .list-card {
        background-color: #181818;
        border-radius: 6px;
        padding: 16px;
        transition: background-color 0.3s, outline 0.2s, transform 0.2s;
        cursor: pointer;
        height: 100%;
        box-sizing: border-box;
        /* 접근성: 탭 초점 지원 */
        tabindex: 0;
        outline: none;
        position: relative;
      }
      
      /* 접근성: 키보드 초점 상태에 시각적 표시 */
      .list-card:focus-visible {
        outline: 2px solid #1db954;
        outline-offset: 2px;
        transform: scale(1.05);
      }
      
      .list-card:hover {
        background-color: #282828;
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
        padding-top: 100%;
        margin-bottom: 16px;
        border-radius: 4px;
        overflow: hidden;
      }
      
      .card-img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .play-button {
        position: absolute;
        bottom: 8px;
        right: 8px;
        width: 40px;
        height: 40px;
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
        width: 24px;
        height: 24px;
      }
      
      /* 접근성: 높은 대비 모드에서 플레이 버튼 스타일 조정 */
      @media (forced-colors: active) {
        .play-button {
          opacity: 1;
          background-color: ButtonFace;
          border: 1px solid ButtonText;
        }
        
        .play-icon {
          fill: ButtonText;
          forced-color-adjust: none;
        }
      }
      
      /* 반응형 스타일: XS (800px 이하) - 모바일 */
      @media (max-width: ${BREAKPOINTS.xs}px) {
        .list-card {
          padding: 12px;
        }
        
        .card-img-container {
          margin-bottom: 12px;
        }
        
        .card-title {
          font-size: 14px;
          margin-bottom: 4px;
        }
        
        .card-description {
          font-size: 12px;
        }
        
        .play-button {
          width: 36px;
          height: 36px;
          opacity: 0.9; /* 모바일에서 항상 약간 보이게 */
        }
        
        .play-icon {
          width: 20px;
          height: 20px;
        }
        
        /* 터치 인터페이스 개선 */
        .list-card {
          -webkit-tap-highlight-color: rgba(29, 185, 84, 0.3); /* iOS 터치 하이라이트 */
          touch-action: manipulation; /* 더 좋은 터치 반응성 */
        }
        
        .play-button {
          /* 터치 자연스럽게 하기 위해 터치 타겟 크기 증가 */
          bottom: 4px;
          right: 4px;
        }
      }
      
      /* 반응형 스타일: S (801px - 850px) - 소형 태블릿 */
      @media (min-width: ${BREAKPOINTS.xs + 1}px) and (max-width: ${
      BREAKPOINTS.s
    }px) {
        .list-card {
          padding: 14px;
        }
        
        .card-title {
          font-size: 15px;
        }
        
        .card-description {
          font-size: 13px;
        }
      }
      
      /* 반응형 스타일: XL (1743px 이상) - 대형 디스플레이 */
      @media (min-width: ${BREAKPOINTS.lg + 1}px) {
        .list-card {
          padding: 20px;
        }
        
        .card-img-container {
          margin-bottom: 20px;
        }
        
        .card-title {
          font-size: 18px;
          margin-bottom: 10px;
        }
        
        .card-description {
          font-size: 16px;
        }
        
        .play-button {
          width: 48px;
          height: 48px;
        }
        
        .play-icon {
          width: 28px;
          height: 28px;
        }
      }
      
      .card-title {
        font-weight: 700;
        font-size: 16px;
        margin: 0 0 8px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: #fff;
      }
      
      .card-description {
        font-size: 14px;
        margin: 0;
        color: #b3b3b3;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `;
  }
}
