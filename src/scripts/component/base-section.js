/**
 * 기본 섹션 컴포넌트
 *
 * 아티스트, 앨범, 플레이리스트 등의 섹션 컴포넌트가 공통으로 상속받는 기본 클래스입니다.
 * 공통 기능:
 * - Shadow DOM 초기화
 * - 데이터 로딩 구조
 * - 리스트 렌더링 패턴
 * - 스크롤 버튼 설정 및 이벤트 처리
 * - 기본 스타일링
 * - 상태 관리 (StateManager 활용)
 * - 이벤트 기반 업데이트
 * - 표준화된 이벤트 처리
 */
import { StateManager, globalEventBus } from "../utils/state-manager.js";
import {
  EventManager,
  EventTypes,
  throttle,
  delegateEvent,
} from "../utils/event-utils.js";

export class BaseSection extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.items = []; // 아이템 데이터를 저장할 배열
    this.sectionName = "section"; // 섹션 이름 (자식 클래스에서 재정의)
    this.titleText = "섹션"; // 섹션 제목 (자식 클래스에서 재정의)

    // 이벤트 관리자 초기화
    this.eventManager = new EventManager();

    // StateManager를 사용한 상태 관리 초기화
    this.stateManager = new StateManager(
      {
        isLoading: false,
        hasError: false,
        errorMessage: "",
        items: [],
      },
      this.handleStateChange.bind(this)
    );

    this.render();
  }

  connectedCallback() {
    this.init();
    this.setupScrollButtons();

    // 이벤트 발행: 섹션 마운트 완료
    this.eventManager.publish(EventTypes.SECTION.MOUNTED, {
      sectionName: this.sectionName,
      component: this,
      timestamp: new Date(),
    });

    // 기본 이벤트 구독 설정
    this.setupEventSubscriptions();
  }

  /**
   * 이벤트 구독 설정
   * 섹션 컴포넌트가 처리해야 하는 기본 이벤트를 구독합니다.
   */
  setupEventSubscriptions() {
    // 애플리케이션 전역 이벤트 구독
    this.eventManager.subscribe(EventTypes.APP.THEME_CHANGE, (data) => {
      // 테마 변경 시 필요한 처리
      console.log(`${this.sectionName} 섹션: 테마 변경 처리`, data);
    });

    // 해당 섹션 관련 이벤트 구독
    this.eventManager.subscribe(`${this.sectionName}:cardClick`, (data) => {
      // 카드 클릭 시 처리
      console.log(`${this.sectionName} 카드 클릭 처리:`, data.id);
    });
  }

  disconnectedCallback() {
    // 이벤트 발행: 섹션 언마운트
    this.eventManager.publish(EventTypes.SECTION.UNMOUNTED, {
      sectionName: this.sectionName,
      timestamp: new Date(),
    });

    // 모든 이벤트 리스너와 구독 정리
    this.eventManager.cleanup();
  }

  /**
   * 상태 변경 시 호출되는 핸들러
   * @param {string} property - 변경된 상태 속성 이름
   * @param {any} value - 변경된 값
   * @param {Object} state - 전체 상태 객체
   */
  handleStateChange(property, value, state) {
    // 이벤트 발행: 상태 변경
    this.eventManager.publish(`${this.sectionName}:stateChanged`, {
      property,
      value,
      timestamp: new Date(),
      state,
    });

    // UI 업데이트
    this.updateUI();

    // 특정 상태 변경에 따른 추가 처리
    if (property === "items") {
      if (value && value.length > 0) {
        this.renderItemList();
        this.eventManager.publish(EventTypes.SECTION.DATA_LOADED, {
          sectionName: this.sectionName,
          itemCount: value.length,
        });
      } else if (value && value.length === 0) {
        // 빈 데이터 처리
        this.renderItemList(); // 빈 상태 메시지 표시
      }
    }
  }

  /**
   * 컴포넌트 초기화 및 데이터 로딩
   */
  async init() {
    try {
      // 로딩 상태 설정
      this.stateManager.update({
        isLoading: true,
        hasError: false,
        errorMessage: "",
      });

      // 데이터 가져오기
      const items = await this.loadData();

      // items 업데이트 및 로딩 완료 상태 설정
      this.stateManager.update({
        items: items || [],
        isLoading: false,
      });
    } catch (error) {
      console.error(
        `${this.sectionName} 데이터를 불러오는 데 실패했습니다:`,
        error
      );

      // 에러 상태 설정
      this.stateManager.update({
        isLoading: false,
        hasError: true,
        errorMessage:
          error.message || `${this.sectionName} 데이터를 불러오지 못했습니다.`,
      });
    }
  }

  /**
   * 현재 상태에 따라 UI를 업데이트합니다.
   * 표준화된 이벤트 처리를 적용하였습니다.
   */
  updateUI() {
    // 이벤트 발행: UI 업데이트 시작
    this.eventManager.publish(`${this.sectionName}:uiUpdateStart`, {
      timestamp: new Date(),
    });

    // 로딩 상태 UI 업데이트
    const loadingElement = this.shadowRoot.querySelector(".loading-indicator");
    const errorElement = this.shadowRoot.querySelector(".error-message");
    const contentContainer = this.shadowRoot.querySelector(
      `.${this.sectionName}-container`
    );

    // 현재 상태값 가져오기
    const state = this.stateManager.state;
    let currentMode = "normal";

    if (loadingElement && errorElement && contentContainer) {
      // 로딩 상태 처리
      if (state.isLoading) {
        loadingElement.style.display = "flex";
        errorElement.style.display = "none";
        contentContainer.style.display = "none";
        currentMode = "loading";
      }
      // 에러 상태 처리
      else if (state.hasError) {
        loadingElement.style.display = "none";
        errorElement.style.display = "block";
        errorElement.textContent = state.errorMessage;
        contentContainer.style.display = "none";
        currentMode = "error";
      }
      // 정상 상태 처리
      else {
        loadingElement.style.display = "none";
        errorElement.style.display = "none";
        contentContainer.style.display = "block";
        currentMode = "normal";
      }

      // 디스플레이 상태가 변경되었을 때만 이벤트 발행
      if (this._prevDisplayMode !== currentMode) {
        this._prevDisplayMode = currentMode;

        this.eventManager.publish(`${this.sectionName}:modeChanged`, {
          mode: currentMode,
          hasError: state.hasError,
          isLoading: state.isLoading,
          errorMessage: state.errorMessage,
          timestamp: new Date(),
        });
      }
    }

    // 이벤트 발행: UI 업데이트 완료
    this.eventManager.publish(`${this.sectionName}:uiUpdated`, {
      state,
      mode: currentMode,
      timestamp: new Date(),
    });
  }

  /**
   * 데이터 로드 메서드
   * 자식 클래스에서 오버라이드해야 함
   */
  async loadData() {
    throw new Error("자식 클래스에서 loadData 메서드를 구현해야 합니다.");
  }

  /**
   * 각 아이템을 렌더링하기 위한 카드 요소 생성
   * 자식 클래스에서 오버라이드해야 함
   * @param {Object} item - 렌더링할 아이템 데이터
   * @returns {HTMLElement} 생성된 카드 요소
   */
  createCardElement(item) {
    throw new Error(
      "자식 클래스에서 createCardElement 메서드를 구현해야 합니다."
    );
  }

  /**
   * 아이템 리스트를 렌더링합니다
   * 표준화된 이벤트 처리 및 성능 최적화를 적용했습니다.
   */
  renderItemList() {
    const itemList = this.shadowRoot.querySelector(`.${this.sectionName}-list`);

    if (!itemList) return;

    // StateManager에서 items 가져오기
    const items = this.stateManager.get("items") || [];

    // 이전 데이터와 비교하여 변경사항이 있는 경우에만 재렌더링
    if (
      JSON.stringify(this.items) === JSON.stringify(items) &&
      itemList.children.length > 0
    ) {
      // 이벤트 발행: 렌더링 스킵
      this.eventManager.publish(`${this.sectionName}:renderSkipped`, {
        reason: "noChanges",
      });
      return; // 변경사항 없으면 재렌더링 스킵
    }

    // 로컬 참조 업데이트
    this.items = items;

    // 이벤트 발행: 렌더링 시작
    this.eventManager.publish(
      EventTypes.SECTION.RENDER_START || `${this.sectionName}:renderStart`,
      {
        sectionName: this.sectionName,
        itemCount: items.length,
        timestamp: new Date(),
      }
    );

    // 이전 이벤트 리스너 제거 (Delegation 사용으로 바꾸기 전 정리)
    this.cleanupItemEventListeners(itemList);

    itemList.innerHTML = "";

    // 배열이 비어있는지 검사
    if (items.length === 0) {
      // 빈 상태 UI 표시
      const emptyMessage = document.createElement("div");
      emptyMessage.className = "empty-message";
      emptyMessage.textContent = `${this.titleText}에 표시할 항목이 없습니다.`;
      itemList.appendChild(emptyMessage);

      // 이벤트 발행: 빈 상태 렌더링
      this.eventManager.publish(`${this.sectionName}:emptyState`, {
        timestamp: new Date(),
      });
      return;
    }

    // 이벤트 위임 설정 - 모든 카드의 클릭 이벤트를 하나의 리스너로 처리
    this.cardClickRemover = delegateEvent(
      itemList,
      ".list-card",
      "click",
      (event, targetElement) => {
        const index = parseInt(targetElement.dataset.index, 10);
        const item = items[index];
        if (item) {
          this.eventManager.publish(`${this.sectionName}:cardClick`, {
            id: item.id,
            index: index,
            item: item,
            timestamp: new Date(),
          });
        }
      }
    );

    items.forEach((item, index) => {
      // li 요소 생성
      const listItem = document.createElement("li");
      listItem.className = "list-card";
      listItem.dataset.index = index; // 인덱스 저장
      if (item.id) {
        listItem.dataset.id = item.id; // 아이템 ID 저장
      }

      // 카드 요소 생성 (자식 클래스에서 구현)
      const cardElement = this.createCardElement(item);

      // 리스트 아이템에 카드 추가
      listItem.appendChild(cardElement);
      itemList.appendChild(listItem);
    });

    // 이벤트 발행: 렌더링 완료
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
   * 이전에 등록한 아이템 이벤트 리스너를 정리합니다.
   * @param {HTMLElement} container - 아이템 컨테이너 요소
   */
  cleanupItemEventListeners(container) {
    // 위임 이벤트 제거
    if (this.cardClickRemover) {
      this.cardClickRemover();
      this.cardClickRemover = null;
    }
  }

  /**
   * 스크롤 버튼 설정
   * 이벤트 관리자를 활용하여 이벤트 관리를 개선했습니다.
   */
  setupScrollButtons() {
    const scrollLeftBtn = this.shadowRoot.querySelector(".scroll-left");
    const scrollRightBtn = this.shadowRoot.querySelector(".scroll-right");
    const container = this.shadowRoot.querySelector(
      `.${this.sectionName}-container`
    );

    if (!scrollLeftBtn || !scrollRightBtn || !container) return;

    // 초기 버튼 상태 설정
    this.toggleScrollButtons();

    // 스크롤 이벤트 리스너 - 스로틀링 적용
    this.eventManager.addListener(
      container,
      "scroll",
      throttle(() => {
        this.toggleScrollButtons();
      }, 100)
    );

    // 왼쪽 스크롤 버튼
    this.eventManager.addListener(scrollLeftBtn, "click", () => {
      // 이벤트 발행: 스크롤 버튼 클릭
      this.eventManager.publish(`${this.sectionName}:scrollLeft`, {
        timestamp: new Date(),
      });

      container.scrollBy({
        left: -300,
        behavior: "smooth",
      });
    });

    // 오른쪽 스크롤 버튼
    this.eventManager.addListener(scrollRightBtn, "click", () => {
      // 이벤트 발행: 스크롤 버튼 클릭
      this.eventManager.publish(`${this.sectionName}:scrollRight`, {
        timestamp: new Date(),
      });

      container.scrollBy({
        left: 300,
        behavior: "smooth",
      });
    });
  }

  /**
   * 스크롤 버튼 토글
   * 스크롤 상태에 따라 버튼 표시를 관리하고 이벤트를 발행합니다.
   */
  toggleScrollButtons() {
    const container = this.shadowRoot.querySelector(
      `.${this.sectionName}-container`
    );
    const leftBtn = this.shadowRoot.querySelector(".scroll-left");
    const rightBtn = this.shadowRoot.querySelector(".scroll-right");

    if (!container || !leftBtn || !rightBtn) return;

    const hasLeftScroll = container.scrollLeft > 0;
    const hasRightScroll =
      container.scrollWidth > container.clientWidth &&
      container.scrollLeft < container.scrollWidth - container.clientWidth;

    // 왼쪽 버튼 표시 여부
    if (hasLeftScroll) {
      leftBtn.style.display = "flex";
    } else {
      leftBtn.style.display = "none";
    }

    // 오른쪽 버튼 표시 여부
    if (hasRightScroll) {
      rightBtn.style.display = "flex";
    } else {
      rightBtn.style.display = "none";
    }

    // 버튼 표시 상태가 변경되었을 때만 이벤트 발행
    if (
      this._prevLeftScroll !== hasLeftScroll ||
      this._prevRightScroll !== hasRightScroll
    ) {
      this._prevLeftScroll = hasLeftScroll;
      this._prevRightScroll = hasRightScroll;

      this.eventManager.publish(`${this.sectionName}:scrollButtonsChanged`, {
        canScrollLeft: hasLeftScroll,
        canScrollRight: hasRightScroll,
        timestamp: new Date(),
      });
    }
  }

  /**
   * 공통 섹션 스타일을 반환합니다
   * @returns {string} 스타일 문자열
   */
  getBaseStyles() {
    return `
      :host {
        display: block;
        width: 100%;
      }
      
      .section-title {
        font-size: 24px;
        font-weight: 700;
        margin: 24px 0 16px;
      }
      
      .section-wrapper {
        position: relative;
        width: 100%;
      }
      
      .${this.sectionName}-container {
        width: 100%;
        overflow-x: auto;
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      
      .${this.sectionName}-container::-webkit-scrollbar {
        display: none;
      }
      
      .${this.sectionName}-list {
        display: flex;
        gap: 16px;
        list-style: none;
        padding: 0;
        margin: 0;
      }
      
      .list-card {
        flex: 0 0 auto;
        width: 180px;
      }
      
      .scroll-btn {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 40px;
        height: 40px;
        background-color: rgba(0, 0, 0, 0.7);
        border-radius: 50%;
        display: none;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        z-index: 1;
        border: none;
      }
      
      .scroll-left {
        left: 10px;
      }
      
      .scroll-right {
        right: 10px;
      }
      
      .scroll-icon {
        width: 24px;
        height: 24px;
        fill: white;
      }
      
      /* 로딩 인디케이터 스타일 */
      .loading-indicator {
        display: none;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 150px;
      }
      
      .spinner {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 3px solid rgba(30, 215, 96, 0.3);
        border-top-color: var(--spotify-green, #1ed760);
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      /* 에러 메시지 스타일 */
      .error-message {
        display: none;
        color: #f15e6c;
        text-align: center;
        margin: 20px 0;
        padding: 10px;
        border-radius: 4px;
        background-color: rgba(241, 94, 108, 0.1);
        font-weight: 500;
        font-size: 14px;
      }
      
      /* 빈 상태 메시지 스타일 */
      .empty-message {
        display: block;
        width: 100%;
        text-align: center;
        color: #b3b3b3;
        padding: 40px 0;
        font-size: 14px;
        font-weight: 500;
        background-color: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
      }
      
      @media (max-width: 768px) {
        .list-card {
          width: 140px;
        }
      }
    `;
  }

  /**
   * HTML 템플릿을 반환합니다
   * @returns {string} HTML 템플릿 문자열
   */
  getTemplate() {
    return `
      <h2 class="section-title">${this.titleText}</h2>
      
      <!-- 로딩 인디케이터 -->
      <div class="loading-indicator">
        <div class="spinner"></div>
      </div>
      
      <!-- 에러 메시지 -->
      <div class="error-message">
        데이터를 불러오는 데 오류가 발생했습니다.
      </div>
      
      <!-- 콘텐츠 영역 -->
      <div class="section-wrapper">
        <button class="scroll-btn scroll-left">
          <svg class="scroll-icon" viewBox="0 0 24 24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        <div class="${this.sectionName}-container">
          <ul class="${this.sectionName}-list">
            <li>데이터를 불러오는 중입니다...</li>
          </ul>
        </div>
        <button class="scroll-btn scroll-right">
          <svg class="scroll-icon" viewBox="0 0 24 24">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </button>
      </div>
    `;
  }

  /**
   * 섹션 렌더링
   */
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${this.getBaseStyles()}
      </style>
      ${this.getTemplate()}
    `;

    // 초기 UI 상태 설정
    setTimeout(() => this.updateUI(), 0);
  }
}
