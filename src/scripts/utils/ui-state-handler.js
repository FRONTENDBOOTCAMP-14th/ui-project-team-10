/**
 * UIStateHandler
 *
 * UI 상태 관리를 담당하는 유틸리티 클래스입니다.
 * 로딩, 오류, 정상 컨텐츠 표시, 빈 상태 등 다양한 UI 상태를 처리합니다.
 */

export class UIStateHandler {
  /**
   * UIStateHandler 생성자
   *
   * @param {Object} options - 설정 옵션
   * @param {HTMLElement} options.container - 컨테이너 요소
   * @param {Object} options.eventManager - 이벤트 관리자
   * @param {String} options.sectionName - 섹션 이름 (이벤트 발행용)
   * @param {Function} options.renderContent - 컨텐츠 렌더링 함수
   * @param {Function} options.createLoadingElement - 로딩 요소 생성 함수
   * @param {Function} options.createErrorElement - 오류 요소 생성 함수
   * @param {Function} options.createEmptyElement - 빈 상태 요소 생성 함수
   */
  constructor({
    container,
    eventManager,
    sectionName,
    renderContent,
    createLoadingElement,
    createErrorElement,
    createEmptyElement,
  }) {
    this.container = container;
    this.eventManager = eventManager;
    this.sectionName = sectionName;

    // 렌더링 콜백 함수
    this.renderContent = renderContent;
    this.createLoadingElement = createLoadingElement;
    this.createErrorElement = createErrorElement;
    this.createEmptyElement = createEmptyElement;

    // 현재 UI 상태
    this.currentState = "initial";
  }

  /**
   * 로딩 상태 표시
   *
   * @param {String} loadingMessage - 로딩 메시지 (선택적)
   */
  showLoading(loadingMessage = "로딩 중...") {
    if (this.currentState === "loading") return;
    this.currentState = "loading";

    // 컨테이너 비우기
    this._clearContainer();

    // 로딩 요소 생성 및 추가
    const loadingElement = this.createLoadingElement
      ? this.createLoadingElement(loadingMessage)
      : this._createDefaultLoadingElement(loadingMessage);

    this.container.appendChild(loadingElement);

    // ARIA 속성 설정
    this.container.setAttribute("aria-busy", "true");

    // 이벤트 발행: 로딩 상태 시작
    this.eventManager.publish(`${this.sectionName}:loadingStateActivated`, {
      message: loadingMessage,
      timestamp: new Date(),
    });
  }

  /**
   * 오류 상태 표시
   *
   * @param {String} errorMessage - 오류 메시지
   * @param {Error} error - 오류 객체 (선택적)
   */
  showError(errorMessage, error = null) {
    if (this.currentState === "error" && this.lastErrorMessage === errorMessage)
      return;
    this.currentState = "error";
    this.lastErrorMessage = errorMessage;

    // 컨테이너 비우기
    this._clearContainer();

    // 오류 요소 생성 및 추가
    const errorElement = this.createErrorElement
      ? this.createErrorElement(errorMessage, error)
      : this._createDefaultErrorElement(errorMessage);

    this.container.appendChild(errorElement);

    // ARIA 속성 설정
    this.container.setAttribute("aria-busy", "false");

    // 이벤트 발행: 오류 상태 표시
    this.eventManager.publish(`${this.sectionName}:errorStateActivated`, {
      message: errorMessage,
      error: error,
      timestamp: new Date(),
    });
  }

  /**
   * 정상 콘텐츠 표시
   *
   * @param {Array} items - 표시할 아이템 배열
   * @param {Object} options - 추가 옵션 (선택적)
   */
  showContent(items, options = {}) {
    this.currentState = "content";

    // 컨테이너 비우기
    this._clearContainer();

    // 아이템이 없는 경우 빈 상태 표시
    if (!items || items.length === 0) {
      this.showEmpty(options.emptyMessage);
      return;
    }

    // 콘텐츠 렌더링
    const contentElement = this.renderContent(items, options);
    if (contentElement) {
      this.container.appendChild(contentElement);
    }

    // ARIA 속성 설정
    this.container.setAttribute("aria-busy", "false");

    // 이벤트 발행: 콘텐츠 표시
    this.eventManager.publish(`${this.sectionName}:contentStateActivated`, {
      itemCount: items.length,
      timestamp: new Date(),
    });
  }

  /**
   * 빈 상태 표시
   *
   * @param {String} emptyMessage - 빈 상태 메시지 (선택적)
   */
  showEmpty(emptyMessage = "표시할 내용이 없습니다.") {
    if (this.currentState === "empty" && this.lastEmptyMessage === emptyMessage)
      return;
    this.currentState = "empty";
    this.lastEmptyMessage = emptyMessage;

    // 컨테이너 비우기
    this._clearContainer();

    // 빈 상태 요소 생성 및 추가
    const emptyElement = this.createEmptyElement
      ? this.createEmptyElement(emptyMessage)
      : this._createDefaultEmptyElement(emptyMessage);

    this.container.appendChild(emptyElement);

    // ARIA 속성 설정
    this.container.setAttribute("aria-busy", "false");

    // 이벤트 발행: 빈 상태 표시
    this.eventManager.publish(`${this.sectionName}:emptyStateActivated`, {
      message: emptyMessage,
      timestamp: new Date(),
    });
  }

  /**
   * 컨테이너 내용 지우기
   * @private
   */
  _clearContainer() {
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }
  }

  /**
   * 기본 로딩 요소 생성
   *
   * @param {String} message - 로딩 메시지
   * @returns {HTMLElement} 로딩 요소
   * @private
   */
  _createDefaultLoadingElement(message) {
    const loadingContainer = document.createElement("div");
    loadingContainer.className = "loading-container";
    loadingContainer.setAttribute("role", "status");
    loadingContainer.setAttribute("aria-live", "polite");

    const spinner = document.createElement("div");
    spinner.className = "loading-spinner";

    const messageElement = document.createElement("p");
    messageElement.className = "loading-message";
    messageElement.textContent = message;

    loadingContainer.appendChild(spinner);
    loadingContainer.appendChild(messageElement);

    return loadingContainer;
  }

  /**
   * 기본 오류 요소 생성
   *
   * @param {String} message - 오류 메시지
   * @returns {HTMLElement} 오류 요소
   * @private
   */
  _createDefaultErrorElement(message) {
    const errorContainer = document.createElement("div");
    errorContainer.className = "error-container";
    errorContainer.setAttribute("role", "alert");
    errorContainer.setAttribute("aria-live", "assertive");

    const icon = document.createElement("div");
    icon.className = "error-icon";
    icon.innerHTML = "⚠️";

    const messageElement = document.createElement("p");
    messageElement.className = "error-message";
    messageElement.textContent = message;

    const retryButton = document.createElement("button");
    retryButton.className = "retry-button";
    retryButton.textContent = "다시 시도";
    retryButton.addEventListener("click", () => {
      this.eventManager.publish(`${this.sectionName}:retryRequested`, {
        timestamp: new Date(),
      });
    });

    errorContainer.appendChild(icon);
    errorContainer.appendChild(messageElement);
    errorContainer.appendChild(retryButton);

    return errorContainer;
  }

  /**
   * 기본 빈 상태 요소 생성
   *
   * @param {String} message - 빈 상태 메시지
   * @returns {HTMLElement} 빈 상태 요소
   * @private
   */
  _createDefaultEmptyElement(message) {
    const emptyContainer = document.createElement("div");
    emptyContainer.className = "empty-container";

    const icon = document.createElement("div");
    icon.className = "empty-icon";
    icon.innerHTML = "📭";

    const messageElement = document.createElement("p");
    messageElement.className = "empty-message";
    messageElement.textContent = message;

    emptyContainer.appendChild(icon);
    emptyContainer.appendChild(messageElement);

    return emptyContainer;
  }

  /**
   * 현재 UI 상태 가져오기
   *
   * @returns {String} 현재 UI 상태 ('initial', 'loading', 'error', 'content', 'empty')
   */
  getCurrentState() {
    return this.currentState;
  }

  /**
   * 특정 상태인지 확인
   *
   * @param {String} state - 확인할 상태
   * @returns {Boolean} 상태 일치 여부
   */
  isState(state) {
    return this.currentState === state;
  }
}
