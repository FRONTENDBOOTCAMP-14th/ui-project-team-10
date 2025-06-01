/**
 * AccessibilityMixin
 *
 * 접근성 관련 기능을 제공하는 믹스인입니다.
 * 키보드 탐색, ARIA 속성 설정, 스크린 리더 지원 등을 담당합니다.
 *
 * @mixin
 */

export const AccessibilityMixin = (Base) =>
  class extends Base {
    constructor() {
      super();
      this._keyboardEventHandlers = [];
      this._focusableElements = null;
      this._currentFocusIndex = -1;
    }

    /**
     * 컴포넌트가 DOM에 연결될 때 접근성 기능 초기화
     */
    connectedCallback() {
      if (super.connectedCallback) {
        super.connectedCallback();
      }

      // 접근성 초기화
      this._initAccessibility();

      // 접근성 관련 이벤트 설정
      this._setupAccessibilityEventListeners();
    }

    /**
     * 접근성 기능 초기화
     * @private
     */
    _initAccessibility() {
      // 섹션에 ARIA 랜드마크 역할 설정
      const sectionWrapper = this.shadowRoot.querySelector(
        `.${this.sectionName}-wrapper`
      );
      if (sectionWrapper) {
        sectionWrapper.setAttribute("role", "region");
        sectionWrapper.setAttribute(
          "aria-labelledby",
          `${this.sectionName}-title`
        );
      }

      // 제목 요소에 ID 설정
      const titleElement = this.shadowRoot.querySelector(".section-title");
      if (titleElement) {
        titleElement.id = `${this.sectionName}-title`;
      }

      // 리스트 컨테이너에 역할 설정
      const listContainer = this.shadowRoot.querySelector(
        `.${this.sectionName}-list`
      );
      if (listContainer) {
        listContainer.setAttribute("role", "list");
        listContainer.setAttribute("aria-label", `${this.titleText} 목록`);
      }

      // 로딩 상태 요소 설정
      const loadingElement =
        this.shadowRoot.querySelector(".loading-indicator");
      if (loadingElement) {
        loadingElement.setAttribute("role", "status");
        loadingElement.setAttribute("aria-live", "polite");
      }

      // 에러 메시지 요소 설정
      const errorElement = this.shadowRoot.querySelector(".error-message");
      if (errorElement) {
        errorElement.setAttribute("role", "alert");
        errorElement.setAttribute("aria-live", "assertive");
      }

      // 스크린 리더 전용 라이브 리전 설정
      let liveRegion = this.shadowRoot.querySelector(".sr-live-region");
      if (!liveRegion) {
        liveRegion = document.createElement("div");
        liveRegion.className = "sr-live-region sr-only";
        liveRegion.setAttribute("aria-live", "polite");
        this.shadowRoot.appendChild(liveRegion);
      }

      // 스크롤 버튼 접근성 설정
      this._setupScrollButtonsAccessibility();
    }

    /**
     * 접근성 관련 이벤트 리스너 설정
     * @private
     */
    _setupAccessibilityEventListeners() {
      // 섹션 내 키보드 탐색 이벤트 핸들러
      const keydownHandler = this._handleSectionKeydown.bind(this);
      this.shadowRoot.addEventListener("keydown", keydownHandler);

      // 추적을 위한 핸들러 저장
      this._keyboardEventHandlers.push({
        element: this.shadowRoot,
        event: "keydown",
        handler: keydownHandler,
      });

      // 포커스 추적 이벤트 핸들러
      const focusinHandler = this._handleFocusIn.bind(this);
      this.shadowRoot.addEventListener("focusin", focusinHandler);

      // 추적을 위한 핸들러 저장
      this._keyboardEventHandlers.push({
        element: this.shadowRoot,
        event: "focusin",
        handler: focusinHandler,
      });
    }

    /**
     * 스크롤 버튼 접근성 설정
     * @private
     */
    _setupScrollButtonsAccessibility() {
      const leftButton = this.shadowRoot.querySelector(".scroll-left-btn");
      const rightButton = this.shadowRoot.querySelector(".scroll-right-btn");

      if (leftButton) {
        leftButton.setAttribute(
          "aria-label",
          `${this.titleText} 왼쪽으로 스크롤`
        );
        leftButton.setAttribute("tabindex", "0");
      }

      if (rightButton) {
        rightButton.setAttribute(
          "aria-label",
          `${this.titleText} 오른쪽으로 스크롤`
        );
        rightButton.setAttribute("tabindex", "0");
      }
    }

    /**
     * 섹션 내 키보드 탐색 처리
     * @param {KeyboardEvent} event - 키보드 이벤트
     * @private
     */
    _handleSectionKeydown(event) {
      // 화살표 키 탐색 처리
      if (
        [
          "ArrowRight",
          "ArrowLeft",
          "ArrowUp",
          "ArrowDown",
          "Home",
          "End",
        ].includes(event.key)
      ) {
        // 포커스 가능한 요소 목록 가져오기
        if (!this._focusableElements) {
          this._updateFocusableElements();
        }

        if (this._focusableElements.length === 0) return;

        // 현재 포커스된 요소의 인덱스 찾기
        const activeElement =
          this.shadowRoot.activeElement || document.activeElement;
        this._currentFocusIndex = this._focusableElements.findIndex(
          (el) => el === activeElement
        );

        // 키 입력에 따라 다음 포커스 인덱스 계산
        let nextIndex = this._currentFocusIndex;

        switch (event.key) {
          case "ArrowRight":
          case "ArrowDown":
            event.preventDefault();
            nextIndex =
              (this._currentFocusIndex + 1) % this._focusableElements.length;
            break;
          case "ArrowLeft":
          case "ArrowUp":
            event.preventDefault();
            nextIndex =
              (this._currentFocusIndex - 1 + this._focusableElements.length) %
              this._focusableElements.length;
            break;
          case "Home":
            event.preventDefault();
            nextIndex = 0;
            break;
          case "End":
            event.preventDefault();
            nextIndex = this._focusableElements.length - 1;
            break;
        }

        // 다음 요소에 포커스
        if (
          nextIndex !== this._currentFocusIndex &&
          this._focusableElements[nextIndex]
        ) {
          this._focusableElements[nextIndex].focus();
          this._currentFocusIndex = nextIndex;

          // 포커스 변경을 스크린 리더에 알림
          this._announceToScreenReader(
            `${this._getFocusedElementDescription(
              this._focusableElements[nextIndex]
            )}에 포커스됨`
          );
        }
      }
    }

    /**
     * 포커스 가능한 요소 목록 업데이트
     * @private
     */
    _updateFocusableElements() {
      // 포커스 가능한 셀렉터
      const focusableSelector = [
        "button:not([disabled])",
        "[href]",
        "input:not([disabled])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        '[tabindex]:not([tabindex="-1"])',
        `${this.cardTagName || "div"}[tabindex]:not([tabindex="-1"])`,
      ].join(",");

      // 섹션 내 포커스 가능한 요소 찾기
      this._focusableElements = Array.from(
        this.shadowRoot.querySelectorAll(focusableSelector)
      ).filter((el) => el.offsetWidth > 0 || el.offsetHeight > 0); // 화면에 보이는 요소만
    }

    /**
     * focusin 이벤트 처리
     * @param {FocusEvent} event - 포커스 이벤트
     * @private
     */
    _handleFocusIn(event) {
      // 포커스 가능한 요소 목록 업데이트
      this._updateFocusableElements();

      // 현재 포커스된 요소의 인덱스 업데이트
      const focusedElement = event.target;
      this._currentFocusIndex = this._focusableElements.findIndex(
        (el) => el === focusedElement
      );

      // 아이템으로 포커스가 이동했을 때 자동 스크롤
      if (focusedElement.matches(this.cardTagName)) {
        this._scrollToElement(focusedElement);
      }

      // 이벤트 발행: 포커스 변경
      this.eventManager.publish(`${this.sectionName}:focusChanged`, {
        element: focusedElement,
        elementType: focusedElement.tagName.toLowerCase(),
        isCard: focusedElement.matches(this.cardTagName),
        timestamp: new Date(),
      });
    }

    /**
     * 요소로 스크롤 이동
     * @param {HTMLElement} element - 스크롤할 대상 요소
     * @private
     */
    _scrollToElement(element) {
      if (!element) return;

      const listContainer = this.shadowRoot.querySelector(
        `.${this.sectionName}-list`
      );
      if (!listContainer) return;

      // 요소가 컨테이너 내에 있는지 확인
      if (!listContainer.contains(element)) return;

      // 요소가 뷰포트에 완전히 보이는지 확인
      const containerRect = listContainer.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      // 요소가 컨테이너의 왼쪽이나 오른쪽 경계를 벗어나는 경우 스크롤
      if (
        elementRect.left < containerRect.left ||
        elementRect.right > containerRect.right
      ) {
        // 스크롤 위치 계산: 요소를 컨테이너 중앙에 배치
        const scrollLeft =
          element.offsetLeft -
          listContainer.clientWidth / 2 +
          element.offsetWidth / 2;

        // 부드러운 스크롤 적용
        listContainer.scrollTo({
          left: scrollLeft,
          behavior: "smooth",
        });

        // 스크롤 버튼 상태 업데이트 (있는 경우)
        if (typeof this.toggleScrollButtons === "function") {
          setTimeout(() => this.toggleScrollButtons(), 300);
        }
      }
    }

    /**
     * 포커스된 요소 설명 생성
     * @param {HTMLElement} element - 포커스된 요소
     * @returns {string} 요소 설명
     * @private
     */
    _getFocusedElementDescription(element) {
      if (!element) return "";

      // 요소 유형별 설명
      if (element.matches(".scroll-left-btn")) {
        return "왼쪽 스크롤 버튼";
      } else if (element.matches(".scroll-right-btn")) {
        return "오른쪽 스크롤 버튼";
      } else if (element.matches(this.cardTagName)) {
        // 카드의 경우 ARIA 레이블 또는 텍스트 컨텐츠 사용
        return (
          element.getAttribute("aria-label") ||
          element.textContent.trim() ||
          "카드 아이템"
        );
      }

      // 기본 설명: 요소 역할과 텍스트
      const role =
        element.getAttribute("role") || element.tagName.toLowerCase();
      const text =
        element.getAttribute("aria-label") || element.textContent.trim();

      return text ? `${role} ${text}` : role;
    }

    /**
     * 스크린 리더에 메시지 알림
     * @param {string} message - 알림 메시지
     * @private
     */
    _announceToScreenReader(message) {
      if (!message) return;

      const liveRegion = this.shadowRoot.querySelector(".sr-live-region");
      if (!liveRegion) return;

      // 메시지 설정
      liveRegion.textContent = message;

      // 일정 시간 후 메시지 지우기
      setTimeout(() => {
        liveRegion.textContent = "";
      }, 3000);
    }

    /**
     * 고대비 모드 지원 설정
     * @private
     */
    _setupHighContrastMode() {
      // 고대비 모드 감지
      const isHighContrast = window.matchMedia(
        "(forced-colors: active)"
      ).matches;

      if (isHighContrast) {
        // 섹션에 고대비 모드 클래스 추가
        this.shadowRoot
          .querySelector(`.${this.sectionName}-wrapper`)
          ?.classList.add("high-contrast-mode");

        // 이벤트 발행: 고대비 모드 감지
        this.eventManager.publish(
          `${this.sectionName}:highContrastModeDetected`,
          {
            timestamp: new Date(),
          }
        );
      }

      // 고대비 모드 변경 감지
      window
        .matchMedia("(forced-colors: active)")
        .addEventListener("change", (e) => {
          const wrapper = this.shadowRoot.querySelector(
            `.${this.sectionName}-wrapper`
          );
          if (!wrapper) return;

          if (e.matches) {
            wrapper.classList.add("high-contrast-mode");
          } else {
            wrapper.classList.remove("high-contrast-mode");
          }

          // 이벤트 발행: 고대비 모드 변경
          this.eventManager.publish(
            `${this.sectionName}:highContrastModeChanged`,
            {
              isHighContrast: e.matches,
              timestamp: new Date(),
            }
          );
        });
    }

    /**
     * 축소된 동작 선호 설정 지원
     * @private
     */
    _setupReducedMotionPreference() {
      // 축소된 동작 선호 감지
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      // 컴포넌트에 상태 저장
      this._prefersReducedMotion = prefersReducedMotion;

      if (prefersReducedMotion) {
        // 섹션에 축소된 동작 클래스 추가
        this.shadowRoot
          .querySelector(`.${this.sectionName}-wrapper`)
          ?.classList.add("reduced-motion");

        // 이벤트 발행
        this.eventManager.publish(
          `${this.sectionName}:reducedMotionPreferred`,
          {
            timestamp: new Date(),
          }
        );
      }

      // 선호도 변경 감지
      window
        .matchMedia("(prefers-reduced-motion: reduce)")
        .addEventListener("change", (e) => {
          this._prefersReducedMotion = e.matches;
          const wrapper = this.shadowRoot.querySelector(
            `.${this.sectionName}-wrapper`
          );
          if (!wrapper) return;

          if (e.matches) {
            wrapper.classList.add("reduced-motion");
          } else {
            wrapper.classList.remove("reduced-motion");
          }

          // 이벤트 발행
          this.eventManager.publish(
            `${this.sectionName}:reducedMotionPreferenceChanged`,
            {
              prefersReducedMotion: e.matches,
              timestamp: new Date(),
            }
          );
        });
    }

    /**
     * 컴포넌트가 제거될 때 정리
     */
    disconnectedCallback() {
      if (super.disconnectedCallback) {
        super.disconnectedCallback();
      }

      // 키보드 이벤트 리스너 정리
      this._keyboardEventHandlers.forEach(({ element, event, handler }) => {
        if (element) {
          element.removeEventListener(event, handler);
        }
      });
      this._keyboardEventHandlers = [];

      // 참조 정리
      this._focusableElements = null;
      this._currentFocusIndex = -1;
    }
  };
