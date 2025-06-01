/**
 * RenderingMixin
 *
 * 컴포넌트의 렌더링 로직을 처리하는 믹스인입니다.
 * 카드 요소 생성, 이벤트 리스너 설정, 응답형 레이아웃 처리 등을 담당합니다.
 *
 * @mixin
 */

export const RenderingMixin = (Base) =>
  class extends Base {
    constructor() {
      super();
      this._cardElements = [];
      this._responseThrottleTimeout = null;
      this._renderRequestId = null;
      this._elementCache = new Map();
    }

    /**
     * 컴포넌트 연결 시 렌더링 초기화
     */
    connectedCallback() {
      if (super.connectedCallback) {
        super.connectedCallback();
      }

      // 응답형 리사이저 설정
      this._setupResponsiveResizer();
    }

    /**
     * 응답형 리사이저 설정
     * @private
     */
    _setupResponsiveResizer() {
      // 리사이즈 이벤트에 대한 쓰로틀링된 핸들러
      const handleResize = () => {
        // 이전 타임아웃 취소
        if (this._responseThrottleTimeout) {
          clearTimeout(this._responseThrottleTimeout);
        }

        // 200ms 후 실행되도록 쓰로틀링 (성능 최적화)
        this._responseThrottleTimeout = setTimeout(() => {
          if (this.shadowRoot && this.stateManager) {
            // 화면 크기에 따라 레이아웃 업데이트
            this._updateLayoutBasedOnBreakpoint();

            // 현재 상태에 따라 다시 렌더링
            const currentState = this.stateManager.state;
            if (currentState.items && currentState.items.length > 0) {
              this.renderItemList(currentState.items);
            }
          }
        }, 200);
      };

      // 리사이즈 이벤트 리스너 등록
      window.addEventListener("resize", handleResize);

      // 이벤트 리스너 정리를 위한 disconnectedCallback 확장
      const originalDisconnectedCallback = this.disconnectedCallback;
      this.disconnectedCallback = function () {
        window.removeEventListener("resize", handleResize);
        if (this._responseThrottleTimeout) {
          clearTimeout(this._responseThrottleTimeout);
        }
        if (originalDisconnectedCallback) {
          originalDisconnectedCallback.call(this);
        }
      };

      // 초기 레이아웃 설정
      this._updateLayoutBasedOnBreakpoint();
    }

    /**
     * 브레이크포인트에 따라 레이아웃 업데이트
     * @private
     */
    _updateLayoutBasedOnBreakpoint() {
      // 현재 뷰포트 너비
      const viewportWidth = window.innerWidth;

      // 레이아웃 클래스 업데이트를 위한 컨테이너 요소
      const listContainer = this.shadowRoot.querySelector(
        `.${this.sectionName}-list`
      );
      if (!listContainer) return;

      // 기존 반응형 클래스 제거
      listContainer.classList.remove(
        "mobile-layout",
        "tablet-layout",
        "desktop-layout"
      );

      // 뷰포트 너비에 따라 적절한 클래스 추가
      if (viewportWidth < 768) {
        listContainer.classList.add("mobile-layout");
        this._currentBreakpoint = "mobile";
      } else if (viewportWidth < 1024) {
        listContainer.classList.add("tablet-layout");
        this._currentBreakpoint = "tablet";
      } else {
        listContainer.classList.add("desktop-layout");
        this._currentBreakpoint = "desktop";
      }

      // 이벤트 발행: 레이아웃 변경
      this.eventManager.publish(`${this.sectionName}:layoutChanged`, {
        breakpoint: this._currentBreakpoint,
        viewportWidth,
        timestamp: new Date(),
      });
    }

    /**
     * 아이템 목록 렌더링
     * @param {Array} items - 렌더링할 아이템 배열
     */
    renderItemList(items) {
      if (!this.shadowRoot) return;

      // 렌더링 요청 식별자 업데이트 (중복 렌더링 방지)
      const requestId = Date.now();
      this._renderRequestId = requestId;

      // 비동기 렌더링으로 UI 블로킹 방지
      requestAnimationFrame(() => {
        // 다른 렌더링 요청이 발생한 경우 취소
        if (this._renderRequestId !== requestId) return;

        // 이벤트 발행: 렌더링 시작
        this.eventManager.publish(`${this.sectionName}:renderStart`, {
          itemCount: items.length,
          timestamp: new Date(),
        });

        // 카드 컨테이너 가져오기
        const listContainer = this.shadowRoot.querySelector(
          `.${this.sectionName}-list`
        );
        if (!listContainer) return;

        // 성능 최적화: DocumentFragment 사용
        const fragment = document.createDocumentFragment();

        // 기존 카드 요소 추적
        const existingCards = new Map();
        this._cardElements.forEach((card) => {
          if (card.dataset.id) {
            existingCards.set(card.dataset.id, card);
          }
        });

        // 새 카드 요소 배열
        const newCardElements = [];

        // 각 아이템에 대해 카드 요소 생성
        items.forEach((item) => {
          let cardElement;

          // ID가 있고 기존 카드가 있으면 재사용
          if (item.id && existingCards.has(item.id)) {
            cardElement = existingCards.get(item.id);
            existingCards.delete(item.id);

            // 카드 데이터 업데이트 (필요한 경우)
            this._updateCardElement(cardElement, item);
          } else {
            // 새 카드 요소 생성
            cardElement = this._createCardElement(item);
          }

          // 프래그먼트에 카드 추가
          fragment.appendChild(cardElement);
          newCardElements.push(cardElement);
        });

        // 사용되지 않은 기존 카드에 대해 이벤트 리스너 정리
        existingCards.forEach((card) => {
          this._cleanupCardElement(card);
        });

        // 컨테이너 비우고 새 카드들 추가
        listContainer.innerHTML = "";
        listContainer.appendChild(fragment);

        // 카드 요소 배열 업데이트
        this._cardElements = newCardElements;

        // 스크롤 버튼 상태 업데이트 (있는 경우)
        if (typeof this.toggleScrollButtons === "function") {
          setTimeout(() => this.toggleScrollButtons(), 100);
        }

        // 이벤트 발행: 렌더링 완료
        this.eventManager.publish(`${this.sectionName}:renderComplete`, {
          itemCount: items.length,
          timestamp: new Date(),
        });
      });
    }

    /**
     * 카드 요소 생성
     * @param {Object} item - 카드 데이터
     * @returns {HTMLElement} 생성된 카드 요소
     * @private
     */
    _createCardElement(item) {
      // 요소 생성
      const cardElement = document.createElement("div");
      cardElement.className = `${this.sectionName}-item card`;

      // 데이터 속성 설정
      this._setCardAttributes(cardElement, item);

      // 접근성 속성 설정
      this._setCardAccessibilityAttributes(cardElement, item);

      // 이벤트 리스너 설정
      this._setupCardEventListeners(cardElement, item);

      // 카드 컨텐츠 설정
      cardElement.innerHTML = this._generateCardContent(item);

      return cardElement;
    }

    /**
     * 카드 요소 업데이트
     * @param {HTMLElement} cardElement - 업데이트할 카드 요소
     * @param {Object} item - 새 카드 데이터
     * @private
     */
    _updateCardElement(cardElement, item) {
      // 데이터 속성 업데이트
      this._setCardAttributes(cardElement, item);

      // 접근성 속성 업데이트
      this._setCardAccessibilityAttributes(cardElement, item);

      // 내용이 변경된 경우에만 HTML 업데이트
      const newContent = this._generateCardContent(item);
      if (cardElement.innerHTML !== newContent) {
        cardElement.innerHTML = newContent;
      }
    }

    /**
     * 카드 요소 정리
     * @param {HTMLElement} cardElement - 정리할 카드 요소
     * @private
     */
    _cleanupCardElement(cardElement) {
      // 이벤트 리스너 제거 (클론 노드로 대체하는 방식)
      const newElement = cardElement.cloneNode(true);
      if (cardElement.parentNode) {
        cardElement.parentNode.replaceChild(newElement, cardElement);
      }
    }

    /**
     * 카드 속성 설정
     * @param {HTMLElement} cardElement - 카드 요소
     * @param {Object} item - 카드 데이터
     * @private
     */
    _setCardAttributes(cardElement, item) {
      // ID 설정
      if (item.id) {
        cardElement.dataset.id = item.id;
      }

      // URL 설정
      if (item.external_urls && item.external_urls.spotify) {
        cardElement.dataset.url = item.external_urls.spotify;
      }

      // 기타 기본 속성
      cardElement.dataset.type = this.sectionName;
      cardElement.dataset.name = item.name || "";

      // 아티스트 정보 (있는 경우)
      if (item.artists) {
        let artistsString = "";
        if (Array.isArray(item.artists)) {
          artistsString = item.artists.map((artist) => artist.name).join(",");
        } else if (item.artists.name) {
          artistsString = item.artists.name;
        }

        if (artistsString) {
          cardElement.dataset.artists = artistsString;
        }
      }
    }

    /**
     * 카드 접근성 속성 설정
     * @param {HTMLElement} cardElement - 카드 요소
     * @param {Object} item - 카드 데이터
     * @private
     */
    _setCardAccessibilityAttributes(cardElement, item) {
      // ARIA 역할 설정
      cardElement.setAttribute("role", "listitem");

      // 포커스 가능하도록 설정
      cardElement.setAttribute("tabindex", "0");

      // ARIA 레이블 생성
      let ariaLabel = item.name || "";

      // 아티스트 정보 추가
      if (item.artists) {
        if (Array.isArray(item.artists)) {
          ariaLabel += `, 아티스트: ${item.artists
            .map((artist) => artist.name)
            .join(", ")}`;
        } else if (item.artists.name) {
          ariaLabel += `, 아티스트: ${item.artists.name}`;
        }
      }

      // 소유자 정보 추가 (플레이리스트)
      if (item.owner && item.owner.display_name) {
        ariaLabel += `, 소유자: ${item.owner.display_name}`;
      }

      // 레이블 설정
      cardElement.setAttribute("aria-label", ariaLabel);
    }

    /**
     * 카드 이벤트 리스너 설정
     * @param {HTMLElement} cardElement - 카드 요소
     * @param {Object} item - 카드 데이터
     * @private
     */
    _setupCardEventListeners(cardElement, item) {
      // 클릭 이벤트
      cardElement.addEventListener("click", (e) => {
        this.eventManager.publish(`${this.sectionName}:cardClick`, {
          id: item.id,
          name: item.name,
          url: item.external_urls?.spotify,
          ...(item.artists && { artists: item.artists }),
          elementType: cardElement.tagName.toLowerCase(),
          timestamp: new Date(),
          clickEvent: e,
        });
      });

      // 키보드 이벤트
      cardElement.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();

          this.eventManager.publish(
            `${this.sectionName}:${this.sectionName}CardKeyboardActivation`,
            {
              id: item.id,
              name: item.name,
              url: item.external_urls?.spotify,
              ...(item.artists && { artists: item.artists }),
              activationKey: e.key,
              timestamp: new Date(),
            }
          );

          // 스페이스바 또는 엔터키로 클릭 이벤트 발생
          cardElement.click();
        }
      });
    }

    /**
     * 카드 컨텐츠 HTML 생성
     * @param {Object} item - 카드 데이터
     * @returns {string} 카드 HTML 컨텐츠
     * @private
     */
    _generateCardContent(item) {
      let html = "";

      // 이미지 추가
      if (item.images && item.images.length > 0) {
        const imageUrl = item.images[0].url;
        html += `<img class="card-image" src="${imageUrl}" alt="${
          item.name || "이미지"
        }" loading="lazy">`;
      }

      // 컨텐츠 컨테이너 시작
      html += '<div class="card-content">';

      // 이름 추가
      if (item.name) {
        html += `<h3 class="card-title">${item.name}</h3>`;
      }

      // 아티스트 추가
      if (item.artists) {
        html += '<p class="card-subtitle">';

        if (Array.isArray(item.artists)) {
          html += item.artists.map((artist) => artist.name).join(", ");
        } else if (item.artists.name) {
          html += item.artists.name;
        }

        html += "</p>";
      }

      // 소유자 정보 (플레이리스트)
      if (item.owner && item.owner.display_name) {
        html += `<p class="card-owner">By ${item.owner.display_name}</p>`;
      }

      // 트랙 개수 (플레이리스트, 앨범)
      if (item.tracks && item.tracks.total !== undefined) {
        html += `<p class="card-tracks">${item.tracks.total} 트랙</p>`;
      }

      // 팔로워 수 (아티스트)
      if (item.followers && item.followers.total !== undefined) {
        html += `<p class="card-followers">${item.followers.total.toLocaleString()} 팔로워</p>`;
      }

      // 컨텐츠 컨테이너 종료
      html += "</div>";

      // 플레이 버튼 오버레이 추가
      html += `
      <div class="card-overlay">
        <button class="play-button" aria-label="${item.name || "항목"} 재생">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="12" fill="currentColor"/>
            <path d="M15.5 12L10 16V8L15.5 12Z" fill="white"/>
          </svg>
        </button>
      </div>
    `;

      return html;
    }

    /**
     * 중첩된 객체 속성에 안전하게 접근
     * @param {Object} obj - 접근할 객체
     * @param {string} path - 점으로 구분된 속성 경로 (예: 'images.0.url')
     * @param {*} defaultValue - 속성이 없을 경우 반환할 기본값
     * @returns {*} 속성 값 또는 기본값
     */
    getNestedProperty(obj, path, defaultValue = "") {
      if (!obj || !path) return defaultValue;

      // 경로를 배열로 분할
      const pathArray = path.split(".");
      let current = obj;

      // 경로를 따라 속성 탐색
      for (const key of pathArray) {
        if (current === null || current === undefined) {
          return defaultValue;
        }

        current = current[key];
      }

      return current !== undefined ? current : defaultValue;
    }

    /**
     * 템플릿 문자열 렌더링
     * @param {string} template - 템플릿 문자열 (예: '{{name}} by {{artists.0.name}}')
     * @param {Object} data - 템플릿에 사용할 데이터 객체
     * @returns {string} 렌더링된 문자열
     */
    renderTemplate(template, data) {
      if (!template || !data) return "";

      // {{속성}} 패턴 찾기
      return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
        // 중첩 속성 가져오기
        return this.getNestedProperty(data, path.trim());
      });
    }

    /**
     * 컴포넌트가 DOM에서 제거될 때 정리
     */
    disconnectedCallback() {
      if (super.disconnectedCallback) {
        super.disconnectedCallback();
      }

      // 렌더링 타이머 정리
      if (this._responseThrottleTimeout) {
        clearTimeout(this._responseThrottleTimeout);
        this._responseThrottleTimeout = null;
      }

      // 카드 요소 정리
      this._cardElements.forEach((card) => {
        this._cleanupCardElement(card);
      });

      this._cardElements = [];
      this._elementCache.clear();
    }
  };
