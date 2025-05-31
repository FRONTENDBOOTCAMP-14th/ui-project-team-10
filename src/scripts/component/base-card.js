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
 * @class BaseCard
 * @extends HTMLElement
 */
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
        transition: background-color 0.3s, outline 0.2s;
        cursor: pointer;
        height: 100%;
        box-sizing: border-box;
        /* 접근성: 탭 초점 지원 */
        tabindex: 0;
        outline: none;
      }
      
      /* 접근성: 키보드 초점 상태에 시각적 표시 */
      .list-card:focus {
        outline: 2px solid #1db954;
        outline-offset: 2px;
      }
      
      .list-card:hover {
        background-color: #282828;
      }
      
      /* 접근성: 높은 대비 모드 지원 */
      @media (forced-colors: active) {
        .list-card {
          border: 1px solid CanvasText;
        }
        .list-card:focus {
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
        border-radius: 50%;
        background-color: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transform: translateY(8px);
        transition: all 0.3s;
      }
      
      .play-icon {
        width: 40px;
        height: 40px;
      }
      
      .list-card:hover .play-button {
        opacity: 1;
        transform: translateY(0);
      }
      
      .card-title {
        font-weight: 700;
        font-size: 16px;
        margin: 0 0 8px;
        color: white;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .card-description {
        font-size: 14px;
        color: #b3b3b3;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      /* 접근성: 높은 대비 모드에서 텍스트 가독성 보장 */
      @media (forced-colors: active) {
        .card-title {
          color: CanvasText;
        }
        .card-description {
          color: CanvasText;
        }
      }
    `;
  }
}
