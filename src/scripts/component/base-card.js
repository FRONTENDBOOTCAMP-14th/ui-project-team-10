/**
 * 기본 카드 컴포넌트
 *
 * 모든 카드 컴포넌트(아티스트, 앨범, 플레이리스트)의 공통 기능을 제공하는 베이스 클래스입니다.
 * 이 클래스는 직접 사용하기보다는 다른 카드 컴포넌트들이 상속받아 사용합니다.
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
        transition: background-color 0.3s;
        cursor: pointer;
        height: 100%;
        box-sizing: border-box;
      }
      
      .list-card:hover {
        background-color: #282828;
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
    `;
  }
}
