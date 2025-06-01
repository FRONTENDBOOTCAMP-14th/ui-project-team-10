/**
 * ScrollableMixin
 *
 * 수평 스크롤 기능을 컴포넌트에 추가하는 믹스인입니다.
 * 스크롤 버튼, 스크롤 동작, IntersectionObserver를 통한 버튼 가시성 제어 등을 관리합니다.
 *
 * @mixin
 */

export const ScrollableMixin = (Base) =>
  class extends Base {
    constructor() {
      super();
      this._scrollObserver = null;
      this._scrollStartButton = null;
      this._scrollEndButton = null;
      this._scrollContainer = null;
      this._isScrolling = false;
      this._scrollButtonEventHandlers = [];
    }

    /**
     * 컴포넌트가 DOM에 연결될 때 스크롤 기능 초기화
     */
    connectedCallback() {
      if (super.connectedCallback) {
        super.connectedCallback();
      }

      // DOM이 준비되면 스크롤 버튼 설정
      // setTimeout을 사용하여 shadowRoot가 완전히 초기화된 후 실행
      setTimeout(() => {
        this._setupScrollButtons();
      }, 0);
    }

    /**
     * 스크롤 버튼 설정 및 이벤트 리스너 연결
     * @private
     */
    _setupScrollButtons() {
      // shadowRoot가 없으면 종료
      if (!this.shadowRoot) return;

      // 스크롤 컨테이너와 버튼 요소 캐싱
      this._scrollContainer = this.shadowRoot.querySelector(
        `.${this.sectionName}-list`
      );
      this._scrollStartButton =
        this.shadowRoot.querySelector(".scroll-left-btn");
      this._scrollEndButton =
        this.shadowRoot.querySelector(".scroll-right-btn");

      // 스크롤 컨테이너가 없으면 종료
      if (!this._scrollContainer) return;

      // 스크롤 이벤트 리스너 설정
      this._scrollContainer.addEventListener(
        "scroll",
        this._handleScroll.bind(this)
      );

      // 스크롤 버튼이 모두 있는 경우에만 설정
      if (this._scrollStartButton && this._scrollEndButton) {
        // IntersectionObserver 설정
        this._setupScrollObserver();

        // 버튼 클릭 이벤트 설정
        this._setupScrollButtonEvents();

        // 키보드 접근성 설정
        this._setupScrollButtonKeyboardAccess();

        // 초기 버튼 상태 설정
        this.toggleScrollButtons();
      }
    }

    /**
     * 스크롤 이벤트 핸들러
     * @private
     */
    _handleScroll() {
      if (!this._scrollContainer) return;

      // 스크롤 중이 아닌 경우에만 버튼 상태 업데이트
      if (!this._isScrolling) {
        this.toggleScrollButtons();
      }

      // 스크롤 이벤트 발행
      this.eventManager.publish(`${this.sectionName}:scrolled`, {
        scrollLeft: this._scrollContainer.scrollLeft,
        scrollWidth: this._scrollContainer.scrollWidth,
        clientWidth: this._scrollContainer.clientWidth,
        timestamp: new Date(),
      });
    }

    /**
     * 스크롤 버튼 표시 상태를 토글합니다.
     * 스크롤 위치에 따라 좌/우 버튼의 표시 여부를 결정합니다.
     */
    toggleScrollButtons() {
      if (
        !this._scrollContainer ||
        !this._scrollStartButton ||
        !this._scrollEndButton
      )
        return;

      const { scrollLeft, scrollWidth, clientWidth } = this._scrollContainer;
      const hasHorizontalScroll = scrollWidth > clientWidth;

      // 스크롤 버튼 표시 여부 조건
      const showStartButton = hasHorizontalScroll && scrollLeft > 0;
      const showEndButton =
        hasHorizontalScroll && scrollLeft < scrollWidth - clientWidth - 5; // 5px 여유 공간

      // 버튼 클래스 설정
      this._scrollStartButton.classList.toggle("visible", showStartButton);
      this._scrollEndButton.classList.toggle("visible", showEndButton);

      // ARIA 숨김 속성 설정
      this._scrollStartButton.setAttribute("aria-hidden", !showStartButton);
      this._scrollEndButton.setAttribute("aria-hidden", !showEndButton);
    }

    /**
     * 스크롤 버튼 이벤트 설정
     * @private
     */
    _setupScrollButtonEvents() {
      if (
        !this._scrollStartButton ||
        !this._scrollEndButton ||
        !this._scrollContainer
      )
        return;

      // 왼쪽 스크롤 버튼 클릭 이벤트 핸들러
      const handleScrollLeftClick = () => {
        this._scrollToDirection("left");
      };

      // 오른쪽 스크롤 버튼 클릭 이벤트 핸들러
      const handleScrollRightClick = () => {
        this._scrollToDirection("right");
      };

      // 이벤트 핸들러 등록
      this._scrollStartButton.addEventListener("click", handleScrollLeftClick);
      this._scrollEndButton.addEventListener("click", handleScrollRightClick);

      // 이벤트 핸들러 추적 (정리를 위해)
      this._scrollButtonEventHandlers.push(
        {
          element: this._scrollStartButton,
          event: "click",
          handler: handleScrollLeftClick,
        },
        {
          element: this._scrollEndButton,
          event: "click",
          handler: handleScrollRightClick,
        }
      );
    }

    /**
     * 스크롤 버튼 키보드 접근성 설정
     * @private
     */
    _setupScrollButtonKeyboardAccess() {
      if (!this._scrollStartButton || !this._scrollEndButton) return;

      // 키보드 이벤트 핸들러
      const handleKeydown = (direction) => (event) => {
        // Enter 또는 Space 키 누를 때 스크롤
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          this._scrollToDirection(direction);
        }
      };

      // 이벤트 핸들러 등록
      const handleLeftKeydown = handleKeydown("left");
      const handleRightKeydown = handleKeydown("right");

      this._scrollStartButton.addEventListener("keydown", handleLeftKeydown);
      this._scrollEndButton.addEventListener("keydown", handleRightKeydown);

      // 이벤트 핸들러 추적 (정리를 위해)
      this._scrollButtonEventHandlers.push(
        {
          element: this._scrollStartButton,
          event: "keydown",
          handler: handleLeftKeydown,
        },
        {
          element: this._scrollEndButton,
          event: "keydown",
          handler: handleRightKeydown,
        }
      );
    }

    /**
     * 지정된 방향으로 스크롤
     * @param {string} direction - 스크롤 방향 ('left' 또는 'right')
     * @private
     */
    _scrollToDirection(direction) {
      if (!this._scrollContainer) return;

      // 스크롤 중 상태 설정
      this._isScrolling = true;

      // 현재 스크롤 위치
      const { scrollLeft, clientWidth } = this._scrollContainer;

      // 스크롤 단위 (컨테이너 너비의 80%)
      const scrollAmount = clientWidth * 0.8;

      // 새 스크롤 위치 계산
      const newScrollLeft =
        direction === "left"
          ? Math.max(0, scrollLeft - scrollAmount)
          : scrollLeft + scrollAmount;

      // 부드러운 스크롤 적용
      this._scrollContainer.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });

      // 이벤트 발행: 스크롤 버튼 클릭
      this.eventManager.publish(`${this.sectionName}:scrollButtonClicked`, {
        direction,
        newScrollLeft,
        timestamp: new Date(),
      });

      // 스크롤 애니메이션이 완료된 후 상태 업데이트
      setTimeout(() => {
        this._isScrolling = false;
        this.toggleScrollButtons();
      }, 300); // 스크롤 애니메이션 시간에 맞춰 조정
    }

    /**
     * IntersectionObserver 설정
     * 카드 아이템의 가시성을 감지하여 스크롤 버튼 상태 업데이트
     * @private
     */
    _setupScrollObserver() {
      // 이미 Observer가 있으면 정리
      if (this._scrollObserver) {
        this._scrollObserver.disconnect();
      }

      // 카드 아이템 요소 선택
      const cardItems = this.shadowRoot.querySelectorAll(
        `.${this.sectionName}-item`
      );
      if (!cardItems.length) return;

      // IntersectionObserver 옵션
      const options = {
        root: this._scrollContainer,
        threshold: 0.1, // 10% 이상 보일 때 감지
      };

      // IntersectionObserver 생성
      this._scrollObserver = new IntersectionObserver((entries) => {
        // 가시성 변경 감지 시 스크롤 버튼 상태 업데이트
        this.toggleScrollButtons();

        // 가시 요소 추적 및 이벤트 발행
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.eventManager.publish(`${this.sectionName}:itemVisible`, {
              element: entry.target,
              id: entry.target.dataset.id,
              visibleRatio: entry.intersectionRatio,
              timestamp: new Date(),
            });
          }
        });
      }, options);

      // 각 카드 아이템 관찰 시작
      cardItems.forEach((item) => {
        this._scrollObserver.observe(item);
      });
    }

    /**
     * 컴포넌트가 DOM에서 제거될 때 정리
     */
    disconnectedCallback() {
      if (super.disconnectedCallback) {
        super.disconnectedCallback();
      }

      // IntersectionObserver 정리
      if (this._scrollObserver) {
        this._scrollObserver.disconnect();
        this._scrollObserver = null;
      }

      // 스크롤 이벤트 리스너 정리
      if (this._scrollContainer) {
        this._scrollContainer.removeEventListener("scroll", this._handleScroll);
      }

      // 스크롤 버튼 이벤트 핸들러 정리
      this._scrollButtonEventHandlers.forEach(({ element, event, handler }) => {
        if (element) {
          element.removeEventListener(event, handler);
        }
      });
      this._scrollButtonEventHandlers = [];

      // 참조 정리
      this._scrollContainer = null;
      this._scrollStartButton = null;
      this._scrollEndButton = null;
    }
  };
