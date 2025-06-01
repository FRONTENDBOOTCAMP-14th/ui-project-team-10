/**
 * BaseSection Component
 *
 * 아티스트, 앨범, 플레이리스트 등의 섹션 컴포넌트의 기본 클래스입니다.
 * Shadow DOM 초기화, 데이터 로딩, 리스트 렌더링, 스크롤 버튼 설정 및 이벤트, 스타일링 등을 처리합니다.
 */

// 상태 관리 및 이벤트 관련 유틸리티 가져오기
import { StateManager } from "/src/scripts/utils/state-manager.js";
import { EventManager, EventTypes } from "/src/scripts/utils/event-utils.js";
import { UIStateHandler } from "/src/scripts/utils/ui-state-handler.js";
import { ElementFactory } from "/src/scripts/utils/element-factory.js";
import { BREAKPOINTS } from "/src/scripts/utils/responsive-utils.js";
import { delegateEvent } from "/src/scripts/utils/event-utils.js";

// 믹스인 가져오기
import {
  AccessibilityMixin,
  LifecycleMixin,
  RenderingMixin,
  ScrollableMixin,
  applyAllMixins,
} from "../mixins/index.js";

// 모든 믹스인이 적용된 HTML 엘리먼트 클래스 생성
const EnhancedHTMLElement = applyAllMixins(HTMLElement);

/**
 * BaseSection 클래스
 * 섹션 컴포넌트의 기본 기능을 제공하는 추상 기본 클래스입니다.
 */
export class BaseSection extends EnhancedHTMLElement {
  /**
   * BaseSection 생성자
   * Shadow DOM 초기화, 상태 관리자 및 이벤트 관리자 설정
   */
  constructor() {
    super();

    // Shadow DOM 초기화
    this.attachShadow({ mode: "open" });

    // 상태 관리자 초기화
    this.stateManager = new StateManager({
      loading: false,
      error: null,
      items: [],
      hasScrollButtons: false,
      theme: "light",
    });

    // 이벤트 관리자 초기화
    this.eventManager = new EventManager();

    // UI 상태 핸들러 초기화
    this.uiStateHandler = new UIStateHandler(this);

    // 섹션 이름 설정 (기본값은 'base', 자식 클래스에서 재정의 필요)
    this.sectionName = "base";

    // 스크롤 이벤트 핸들러 저장용 속성
    this.scrollEventHandlers = [];

    // 카드 이벤트 리스너 제거 함수 저장
    this.cardClickRemover = null;
    this.keyboardEventRemover = null;
  }

  /**
   * 컴포넌트가 DOM에 연결될 때 호출되는 라이프사이클 메서드
   */
  connectedCallback() {
    // 라이프사이클 믹스인에서 제공하는 초기화 메서드 호출
    this.initialize();
  }

  /**
   * 컴포넌트 초기화
   * 템플릿 설정, 스타일 적용, 이벤트 구독 및 데이터 로드
   */
  async init() {
    try {
      // 기본 HTML 구조 설정
      this.setupTemplate();

      // 스타일 적용
      this.applyStyles();

      // 이벤트 구독 설정
      this.setupEventSubscriptions();

      // 데이터 로딩
      const items = await this.loadData();

      if (items && Array.isArray(items)) {
        // 상태 업데이트
        this.stateManager.setState({ items, loading: false });

        // 아이템 리스트 렌더링
        this.renderItemList(items);

        // 스크롤 버튼 설정 (필요한 경우)
        this.setupScrollButtons();
      }
    } catch (error) {
      console.error(
        `${this.sectionName} 섹션 초기화 중 오류가 발생했습니다:`,
        error
      );
      this.stateManager.setState({ error, loading: false });
      this.handleError(error);
    }
  }

  /**
   * 데이터 로드 기본 구현
   * 자식 클래스에서 getDataFromApi 메서드를 구현해야 합니다.
   * @returns {Promise<Array>} 로드된 데이터 아이템 배열
   */
  async loadData() {
    try {
      this.eventManager.publish(`${this.sectionName}:loadStart`, {
        timestamp: new Date(),
      });
      this.stateManager.setState({ loading: true });

      const items = await this.getDataFromApi();

      this.eventManager.publish(`${this.sectionName}:loadSuccess`, {
        itemCount: items.length,
        timestamp: new Date(),
      });
      return items;
    } catch (error) {
      console.error(
        `${this.sectionName} 데이터를 불러오는 데 실패했습니다:`,
        error
      );
      this.eventManager.publish(`${this.sectionName}:loadError`, {
        error: error.message,
        timestamp: new Date(),
      });
      this.stateManager.setState({ error });
      throw error;
    }
  }

  /**
   * API에서 데이터를 가져오는 메서드
   * 이 메서드는 자식 클래스에서 반드시 구현해야 합니다.
   * @returns {Promise<Array>} API에서 가져온 데이터 아이템 배열
   */
  async getDataFromApi() {
    throw new Error(
      `${this.constructor.name}: getDataFromApi 메서드를 구현해야 합니다.`
    );
  }

  /**
   * 이벤트 구독 설정
   * 테마 변경, 상태 변경, 글로벌 이벤트 등을 구독합니다.
   */
  setupEventSubscriptions() {
    // 테마 변경 이벤트 구독
    this.eventManager.subscribe(
      EventTypes.THEME.CHANGE || "theme:change",
      this.handleThemeChange.bind(this)
    );

    // 상태 변경 감지 및 UI 업데이트 설정
    this.stateManager.onChange("loading", (loading) => {
      this.uiStateHandler.updateLoadingState(loading);
    });

    this.stateManager.onChange("error", (error) => {
      this.uiStateHandler.updateErrorState(error);
    });

    this.stateManager.onChange("items", (items) => {
      if (items && Array.isArray(items)) {
        this.uiStateHandler.updateItemsState(items);
      }
    });

    // 자식 클래스에서 추가 이벤트 구독을 위한 메서드 호출
    this.setupAdditionalSubscriptions();
  }

  /**
   * 추가 이벤트 구독 설정 (자식 클래스에서 확장 가능)
   */
  setupAdditionalSubscriptions() {
    // 자식 클래스에서 확장하도록 설계됨
  }

  /**
   * 테마 변경 처리
   * @param {Object} data - 테마 변경 이벤트 데이터
   */
  handleThemeChange(data) {
    if (data && data.theme) {
      this.stateManager.setState({ theme: data.theme });
      this.updateThemeAttributes(data.theme);
    }
  }

  /**
   * 테마 속성 업데이트
   * @param {string} theme - 적용할 테마 ('light' 또는 'dark')
   */
  updateThemeAttributes(theme) {
    this.shadowRoot.host.setAttribute("data-theme", theme);
  }

  /**
   * 오류 처리
   * @param {Error} error - 발생한 오류 객체
   */
  handleError(error) {
    const errorContainer =
      this.shadowRoot.querySelector(".error-container") ||
      this.createErrorContainer();
    errorContainer.textContent = `오류가 발생했습니다: ${error.message}`;
    errorContainer.setAttribute("aria-live", "assertive");
    errorContainer.style.display = "block";
  }

  /**
   * 오류 컨테이너 생성
   * @returns {HTMLElement} 오류 메시지를 표시할 컨테이너 요소
   */
  createErrorContainer() {
    const container = document.createElement("div");
    container.className = "error-container";
    container.setAttribute("role", "alert");
    this.shadowRoot.appendChild(container);
    return container;
  }

  /**
   * 템플릿 설정
   * 컴포넌트의 기본 HTML 구조를 초기화합니다.
   */
  setupTemplate() {
    const template = this.createTemplate();
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  /**
   * 템플릿 생성
   * @returns {HTMLTemplateElement} 컴포넌트의 HTML 구조를 담은 템플릿 요소
   */
  createTemplate() {
    const template = document.createElement("template");
    template.innerHTML = `
      <div class="${this.sectionName}-section section-container">
        <div class="section-header">
          <h2 class="section-title">${this.getTitle()}</h2>
          <div class="scroll-buttons" style="display: none;">
            <button class="scroll-button scroll-left" aria-label="좌측으로 스크롤">
              <span class="sr-only">좌측으로 스크롤</span>
            </button>
            <button class="scroll-button scroll-right" aria-label="우측으로 스크롤">
              <span class="sr-only">우측으로 스크롤</span>
            </button>
          </div>
        </div>
        <div class="section-content">
          <ul class="${
            this.sectionName
          }-list item-list" role="list" aria-label="${this.getTitle()} 목록"></ul>
        </div>
        <div class="loading-indicator" style="display: none;">
          <span class="spinner"></span>
          <span>로딩 중...</span>
        </div>
      </div>
    `;
    return template;
  }

  /**
   * 섹션 제목 가져오기
   * @returns {string} 섹션 제목
   */
  getTitle() {
    return (
      this.getAttribute("title") ||
      `${this.sectionName.charAt(0).toUpperCase() + this.sectionName.slice(1)}`
    );
  }

  /**
   * 스타일 적용
   * 컴포넌트의 CSS 스타일을 적용합니다.
   */
  applyStyles() {
    const styleElement = document.createElement("style");
    styleElement.textContent = this.getStyles();
    this.shadowRoot.appendChild(styleElement);
  }

  /**
   * 컴포넌트 스타일 가져오기
   * @returns {string} 컴포넌트의 CSS 스타일
   */
  getStyles() {
    return `
      :host {
        display: block;
        width: 100%;
        margin-bottom: 2rem;
      }
      
      .section-container {
        position: relative;
      }
      
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }
      
      .section-title {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0;
        color: var(--text-color, #000);
      }
      
      .section-content {
        position: relative;
        overflow: hidden;
      }
      
      .item-list {
        display: flex;
        list-style: none;
        padding: 0;
        margin: 0;
        overflow-x: auto;
        scroll-behavior: smooth;
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE and Edge */
        gap: 1rem;
      }
      
      .item-list::-webkit-scrollbar {
        display: none; /* Chrome, Safari, Opera */
      }
      
      .list-item {
        flex: 0 0 auto;
      }
      
      .list-card {
        cursor: pointer;
        transition: transform 0.2s ease;
      }
      
      .list-card:hover, .list-card:focus {
        transform: scale(1.05);
      }
      
      .scroll-buttons {
        display: flex;
        gap: 0.5rem;
      }
      
      .scroll-button {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: var(--primary-color, #1db954);
        color: var(--white, #fff);
        border: none;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        transition: all 0.2s ease;
      }
      
      .scroll-button:hover {
        background-color: var(--primary-hover, #1ed760);
        transform: translateY(-2px);
      }
      
      .scroll-button:focus {
        outline: 2px solid var(--focus-color, #1db954);
        outline-offset: 2px;
      }
      
      .scroll-left::before {
        content: "\u2039"; /* 왼쪽 화살표 */
        font-size: 1.5rem;
      }
      
      .scroll-right::before {
        content: "\u203A"; /* 오른쪽 화살표 */
        font-size: 1.5rem;
      }
      
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }
      
      .loading-indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 1rem;
      }
      
      .spinner {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 2px solid rgba(0, 0, 0, 0.1);
        border-left-color: var(--primary-color, #1db954);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      .error-container {
        color: var(--error-color, #e22134);
        padding: 1rem;
        margin: 1rem 0;
        border: 1px solid var(--error-color, #e22134);
        border-radius: 4px;
        background-color: var(--error-bg, rgba(226, 33, 52, 0.1));
      }
      
      /* 반응형 스타일 */
      @media (max-width: ${BREAKPOINTS.xs}) {
        .item-list {
          gap: 0.5rem;
        }
      }
      
      /* 고대비 모드 지원 */
      @media (forced-colors: active) {
        .scroll-button {
          border: 1px solid ButtonText;
        }
      }
      
      /* 다크 테마 */
      :host([data-theme="dark"]) .section-title {
        color: var(--text-color-dark, #fff);
      }
      
      :host([data-theme="dark"]) .spinner {
        border-color: rgba(255, 255, 255, 0.1);
        border-left-color: var(--primary-color, #1db954);
      }
    `;

    // 추가 스타일 적용 (자식 클래스에서 확장 가능)
    return this.getAdditionalStyles();
  }

  /**
   * 추가 스타일 가져오기 (자식 클래스에서 확장 가능)
   * @returns {string} 추가 CSS 스타일
   */
  getAdditionalStyles() {
    return "";
  }

  /**
   * 아이템 리스트 렌더링
   * @param {Array} items - 렌더링할 아이템 배열
   */
  renderItemList(items) {
    if (!items || !Array.isArray(items)) {
      console.warn(`${this.sectionName}: 렌더링할 아이템이 없습니다.`);
      return;
    }

    const itemList = this.shadowRoot.querySelector(`.${this.sectionName}-list`);
    if (!itemList) {
      console.error(`${this.sectionName}: 리스트 컨테이너를 찾을 수 없습니다.`);
      return;
    }

    itemList.innerHTML = "";
    this.cleanupItemEventListeners();

    items.forEach((item, index) => {
      const listItem = document.createElement("li");
      listItem.className = "list-item";
      listItem.setAttribute("role", "none");

      const cardElement = this.createCardElement(item);
      cardElement.classList.add("list-card");
      cardElement.setAttribute("tabindex", "0");
      cardElement.setAttribute("role", "listitem");
      cardElement.setAttribute("aria-posinset", index + 1);
      cardElement.setAttribute("aria-setsize", items.length);
      cardElement.setAttribute("data-index", index);
      cardElement.setAttribute(
        "data-spotify-url",
        item.external_urls?.spotify || ""
      );

      listItem.appendChild(cardElement);
      itemList.appendChild(listItem);
    });

    this.setupCardEvents(itemList, items);

    this.eventManager.publish(
      EventTypes.SECTION.RENDER_COMPLETE ||
        `${this.sectionName}:renderComplete`,
      {
        sectionName: this.sectionName,
        itemCount: items.length,
        timestamp: new Date(),
      }
    );
  }

  /**
   * 아이템 카드 요소 생성 (자식 클래스에서 구현 필요)
   * @param {Object} item - 카드로 렌더링할 아이템 데이터
   * @returns {HTMLElement} 카드 요소
   */
  createCardElement(item) {
    throw new Error(
      `${this.constructor.name}: createCardElement 메서드를 구현해야 합니다.`
    );
  }

  /**
   * 카드 이벤트 설정
   * @param {HTMLElement} container - 카드를 포함하는 컨테이너 요소
   * @param {Array} items - 카드로 렌더링된 아이템 배열
   */
  setupCardEvents(container, items) {
    this.cardClickRemover = delegateEvent(
      container,
      ".list-card",
      "click",
      (event, targetElement) => {
        const index = parseInt(targetElement.dataset.index, 10);
        const item = items[index];
        if (!item) return;

        this.eventManager.publish(`${this.sectionName}:cardClick`, {
          id: item.id,
          name: item.name,
          ...(item.artists && { artists: item.artists }),
          url: item.external_urls?.spotify,
          timestamp: new Date(),
        });

        if (targetElement.dataset.spotifyUrl) {
          window.open(targetElement.dataset.spotifyUrl, "_blank", "noopener");
        }
      }
    );

    this.keyboardEventRemover = delegateEvent(
      container,
      ".list-card",
      "keydown",
      (event, targetElement) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();

          const index = parseInt(targetElement.dataset.index, 10);
          const item = items[index];
          if (!item) return;

          this.eventManager.publish(
            `${this.sectionName}:${this.sectionName}CardKeyboardActivation`,
            {
              id: item.id,
              name: item.name,
              ...(item.artists && { artists: item.artists }),
              url: item.external_urls?.spotify,
              activationKey: event.key,
              timestamp: new Date(),
            }
          );

          if (targetElement.dataset.spotifyUrl) {
            window.open(targetElement.dataset.spotifyUrl, "_blank", "noopener");
          }
        }
      }
    );
  }

  /**
   * 스크롤 버튼 설정
   * 리스트가 화면에 넓어 스크롤이 필요한 경우 스크롤 버튼을 표시합니다.
   */
  setupScrollButtons() {
    const itemList = this.shadowRoot.querySelector(`.${this.sectionName}-list`);
    const scrollButtons = this.shadowRoot.querySelector(".scroll-buttons");

    if (!itemList || !scrollButtons) return;

    // 스크롤 가능 여부 확인
    const hasOverflow = itemList.scrollWidth > itemList.clientWidth;

    // 스크롤 버튼 표시 여부 설정
    scrollButtons.style.display = hasOverflow ? "flex" : "none";
    this.stateManager.setState({ hasScrollButtons: hasOverflow });

    if (hasOverflow) {
      this.setupScrollButtonEvents();
    } else {
      this.cleanupScrollEventListeners();
    }
  }

  /**
   * 스크롤 버튼 이벤트 설정
   */
  setupScrollButtonEvents() {
    this.cleanupScrollEventListeners();

    const itemList = this.shadowRoot.querySelector(`.${this.sectionName}-list`);
    const leftButton = this.shadowRoot.querySelector(".scroll-left");
    const rightButton = this.shadowRoot.querySelector(".scroll-right");

    if (!itemList || !leftButton || !rightButton) return;

    // 좌측 버튼 클릭 이벤트
    const leftClickHandler = () => {
      this.scrollList(itemList, -300);
    };
    leftButton.addEventListener("click", leftClickHandler);

    // 우측 버튼 클릭 이벤트
    const rightClickHandler = () => {
      this.scrollList(itemList, 300);
    };
    rightButton.addEventListener("click", rightClickHandler);

    // 스크롤 이벤트 - 버튼 활성화/비활성화 상태 관리
    const scrollHandler = this.throttle(() => {
      this.updateScrollButtonStates(itemList, leftButton, rightButton);
    }, 100);

    itemList.addEventListener("scroll", scrollHandler);

    // 키보드 이벤트 설정
    const keydownHandler = (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();

        if (event.target === leftButton) {
          this.scrollList(itemList, -300);
        } else if (event.target === rightButton) {
          this.scrollList(itemList, 300);
        }
      }
    };

    leftButton.addEventListener("keydown", keydownHandler);
    rightButton.addEventListener("keydown", keydownHandler);

    // 이벤트 해제를 위해 핸들러 저장
    this.scrollEventHandlers = [
      { element: leftButton, event: "click", handler: leftClickHandler },
      { element: rightButton, event: "click", handler: rightClickHandler },
      { element: itemList, event: "scroll", handler: scrollHandler },
      { element: leftButton, event: "keydown", handler: keydownHandler },
      { element: rightButton, event: "keydown", handler: keydownHandler },
    ];

    // 초기 버튼 상태 설정
    this.updateScrollButtonStates(itemList, leftButton, rightButton);

    // 리사이즈 감지하여 스크롤 버튼 상태 업데이트
    if (!this.resizeObserver) {
      this.resizeObserver = new ResizeObserver(
        this.throttle(() => {
          this.setupScrollButtons();
        }, 200)
      );

      this.resizeObserver.observe(itemList);
    }
  }

  /**
   * 스크롤 버튼 상태 업데이트
   * @param {HTMLElement} itemList - 아이템 리스트 요소
   * @param {HTMLElement} leftButton - 좌측 스크롤 버튼
   * @param {HTMLElement} rightButton - 우측 스크롤 버튼
   */
  updateScrollButtonStates(itemList, leftButton, rightButton) {
    if (!itemList || !leftButton || !rightButton) return;

    const isAtStart = itemList.scrollLeft <= 10;
    const isAtEnd =
      itemList.scrollLeft + itemList.clientWidth >= itemList.scrollWidth - 10;

    // 버튼 활성화/비활성화 상태 설정
    leftButton.disabled = isAtStart;
    leftButton.setAttribute("aria-disabled", isAtStart.toString());
    leftButton.style.opacity = isAtStart ? "0.5" : "1";

    rightButton.disabled = isAtEnd;
    rightButton.setAttribute("aria-disabled", isAtEnd.toString());
    rightButton.style.opacity = isAtEnd ? "0.5" : "1";
  }

  /**
   * 리스트 스크롤 처리
   * @param {HTMLElement} itemList - 스크롤할 요소
   * @param {number} scrollAmount - 스크롤 양
   */
  scrollList(itemList, scrollAmount) {
    if (!itemList) return;

    itemList.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });

    this.eventManager.publish(`${this.sectionName}:scroll`, {
      direction: scrollAmount > 0 ? "right" : "left",
      amount: Math.abs(scrollAmount),
      timestamp: new Date(),
    });
  }

  /**
   * 이벤트 제한 (throttle) 함수
   * @param {Function} callback - 제한할 원본 함수
   * @param {number} delay - 제한 시간(밀리초)
   * @returns {Function} 제한된 함수
   */
  throttle(callback, delay) {
    let lastCall = 0;
    return function (...args) {
      const now = new Date().getTime();
      if (now - lastCall < delay) return;
      lastCall = now;
      return callback(...args);
    };
  }

  /**
   * 컴포넌트가 DOM에서 제거될 때 호출되는 라이프사이클 메서드
   */
  disconnectedCallback() {
    this.cleanup();
  }

  /**
   * 섹션 컴포넌트 정리
   */
  cleanup() {
    // 이벤트 구독 취소
    this.eventManager.unsubscribeAll();

    // 스크롤 이벤트 리스너 제거
    this.cleanupScrollEventListeners();

    // 카드 이벤트 리스너 제거
    this.cleanupItemEventListeners();

    // ResizeObserver 정리
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  /**
   * 스크롤 이벤트 리스너 정리
   */
  cleanupScrollEventListeners() {
    if (this.scrollEventHandlers && this.scrollEventHandlers.length > 0) {
      this.scrollEventHandlers.forEach(({ element, event, handler }) => {
        if (element && handler) {
          element.removeEventListener(event, handler);
        }
      });
      this.scrollEventHandlers = [];
    }
  }

  /**
   * 카드 이벤트 리스너 정리
   */
  cleanupItemEventListeners() {
    if (typeof this.cardClickRemover === "function") {
      this.cardClickRemover();
      this.cardClickRemover = null;
    }

    if (typeof this.keyboardEventRemover === "function") {
      this.keyboardEventRemover();
      this.keyboardEventRemover = null;
    }
  }
}
