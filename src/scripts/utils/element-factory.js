/**
 * ElementFactory
 *
 * UI 요소를 생성하는 유틸리티 클래스입니다.
 * 카드, 스크롤 버튼, 로딩 표시기, 오류 메시지 등 다양한 요소 생성을 담당합니다.
 */

export class ElementFactory {
  /**
   * ElementFactory 생성자
   *
   * @param {Object} options - 설정 옵션
   * @param {String} options.sectionName - 섹션 이름
   * @param {String} options.cardTagName - 카드 태그 이름 (기본값: 'div')
   * @param {Function} options.eventManager - 이벤트 관리자
   */
  constructor({ sectionName, cardTagName = "div", eventManager }) {
    this.sectionName = sectionName;
    this.cardTagName = cardTagName;
    this.eventManager = eventManager;
  }

  /**
   * 카드 요소 생성
   *
   * @param {Object} item - 카드 데이터
   * @param {Object} options - 추가 옵션
   * @returns {HTMLElement} 생성된 카드 요소
   */
  createCardElement(item, options = {}) {
    // 커스텀 카드 태그 사용 (예: <album-card>, <playlist-card>)
    const useCustomElement = this.cardTagName && this.cardTagName.includes("-");

    // 카드 요소 생성 (커스텀 요소 또는 표준 div)
    const card = document.createElement(this.cardTagName || "div");

    // 카드 기본 속성 설정
    card.className = options.className || `${this.sectionName}-card`;
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "listitem");

    // ID 속성 추가
    if (item.id) {
      card.setAttribute("data-id", item.id);
    }

    // URL 속성 추가
    if (item.external_urls?.spotify) {
      card.setAttribute("data-url", item.external_urls.spotify);
    }

    // 접근성 속성 설정
    this._setupCardAccessibility(card, item);

    // 커스텀 요소가 아닌 경우 내용 직접 설정
    if (!useCustomElement) {
      this._setupStandardCardContent(card, item, options);
    } else {
      // 커스텀 요소의 경우 속성을 통해 데이터 전달
      this._setupCustomCardProperties(card, item);
    }

    // 이벤트 처리 설정
    this._setupCardEvents(card, item);

    return card;
  }

  /**
   * 표준 카드 요소의 내용 설정
   *
   * @param {HTMLElement} card - 카드 요소
   * @param {Object} item - 카드 데이터
   * @param {Object} options - 추가 옵션
   * @private
   */
  _setupStandardCardContent(card, item, options = {}) {
    // 이미지 컨테이너
    const imageContainer = document.createElement("div");
    imageContainer.className = "card-image-container";

    // 이미지 요소
    if (item.images && item.images.length > 0) {
      const image = document.createElement("img");
      image.className = "card-image";
      image.src = item.images[0]?.url || "";
      image.alt = `${item.name || ""}의 이미지`;
      image.loading = "lazy";
      imageContainer.appendChild(image);
    } else {
      // 이미지가 없는 경우 대체 이미지
      const fallbackImage = document.createElement("div");
      fallbackImage.className = "card-image-fallback";
      fallbackImage.textContent = item.name?.[0]?.toUpperCase() || "?";
      imageContainer.appendChild(fallbackImage);
    }

    // 이름 요소
    const nameElement = document.createElement("div");
    nameElement.className = "card-name";
    nameElement.textContent = item.name || "";

    // 아티스트/설명 요소 (있는 경우)
    let descriptionElement = null;
    if (item.artists || item.description) {
      descriptionElement = document.createElement("div");
      descriptionElement.className = "card-description";

      if (item.artists && item.artists.length > 0) {
        descriptionElement.textContent = item.artists
          .map((artist) => artist.name)
          .join(", ");
      } else if (item.description) {
        descriptionElement.textContent = item.description;
      }
    }

    // 컨텐츠 컨테이너에 모든 요소 추가
    card.appendChild(imageContainer);
    card.appendChild(nameElement);
    if (descriptionElement) {
      card.appendChild(descriptionElement);
    }

    // 추가 사용자 정의 컨텐츠 (있는 경우)
    if (options.customContent) {
      const customContentElement = document.createElement("div");
      customContentElement.className = "card-custom-content";

      if (typeof options.customContent === "string") {
        customContentElement.innerHTML = options.customContent;
      } else if (options.customContent instanceof HTMLElement) {
        customContentElement.appendChild(options.customContent);
      }

      card.appendChild(customContentElement);
    }
  }

  /**
   * 커스텀 카드 요소의 속성 설정
   *
   * @param {HTMLElement} card - 카드 요소
   * @param {Object} item - 카드 데이터
   * @private
   */
  _setupCustomCardProperties(card, item) {
    // 아이템 데이터를 속성으로 설정
    if (item.name) {
      card.setAttribute("name", item.name);
    }

    if (item.images && item.images.length > 0) {
      card.setAttribute("image-url", item.images[0]?.url || "");
    }

    if (item.artists && item.artists.length > 0) {
      card.setAttribute("artists", JSON.stringify(item.artists));
    }

    if (item.description) {
      card.setAttribute("description", item.description);
    }

    if (item.external_urls?.spotify) {
      card.setAttribute("url", item.external_urls.spotify);
    }

    // 추가 데이터 속성
    Object.entries(item).forEach(([key, value]) => {
      if (typeof value !== "object" && value !== undefined) {
        card.setAttribute(`data-${key}`, value.toString());
      }
    });
  }

  /**
   * 카드 접근성 속성 설정
   *
   * @param {HTMLElement} card - 카드 요소
   * @param {Object} item - 카드 데이터
   * @private
   */
  _setupCardAccessibility(card, item) {
    // ARIA 레이블 설정
    let ariaLabel = item.name || "";

    if (item.artists && item.artists.length > 0) {
      ariaLabel += `, 아티스트: ${item.artists
        .map((artist) => artist.name)
        .join(", ")}`;
    } else if (item.description) {
      ariaLabel += `, ${item.description}`;
    }

    if (item.external_urls?.spotify) {
      ariaLabel += ", Spotify에서 열기";
    }

    card.setAttribute("aria-label", ariaLabel);
  }

  /**
   * 카드 이벤트 처리 설정
   *
   * @param {HTMLElement} card - 카드 요소
   * @param {Object} item - 카드 데이터
   * @private
   */
  _setupCardEvents(card, item) {
    // 클릭 이벤트 처리
    card.addEventListener("click", (event) => {
      // 이벤트 데이터 준비
      const eventData = {
        id: item.id,
        name: item.name,
        url: item.external_urls?.spotify,
        element: card,
        originalEvent: event,
        timestamp: new Date(),
      };

      // 아티스트 정보가 있는 경우 추가
      if (item.artists && item.artists.length > 0) {
        eventData.artists = item.artists;
      }

      // 이벤트 발행
      this.eventManager.publish(`${this.sectionName}:cardClick`, eventData);
    });

    // 키보드 이벤트 처리
    card.addEventListener("keydown", (event) => {
      // Enter 또는 Space 키로 카드 활성화
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();

        // 이벤트 데이터 준비
        const eventData = {
          id: item.id,
          name: item.name,
          url: item.external_urls?.spotify,
          element: card,
          activationKey: event.key,
          timestamp: new Date(),
        };

        // 아티스트 정보가 있는 경우 추가
        if (item.artists && item.artists.length > 0) {
          eventData.artists = item.artists;
        }

        // 이벤트 발행
        this.eventManager.publish(
          `${this.sectionName}:${this.sectionName}CardKeyboardActivation`,
          eventData
        );
      }
    });
  }

  /**
   * 스크롤 버튼 생성
   *
   * @param {String} direction - 버튼 방향 ('left' 또는 'right')
   * @returns {HTMLElement} 생성된 스크롤 버튼
   */
  createScrollButton(direction) {
    const button = document.createElement("button");
    button.className = `scroll-${direction}-btn`;
    button.setAttribute(
      "aria-label",
      `${this.sectionName} ${
        direction === "left" ? "왼쪽" : "오른쪽"
      }으로 스크롤`
    );
    button.setAttribute("tabindex", "0");

    // 아이콘 요소
    const icon = document.createElement("span");
    icon.className = `scroll-${direction}-icon`;
    icon.innerHTML = direction === "left" ? "◄" : "►";

    button.appendChild(icon);

    return button;
  }

  /**
   * 로딩 표시기 생성
   *
   * @param {String} message - 로딩 메시지
   * @returns {HTMLElement} 생성된 로딩 표시기
   */
  createLoadingIndicator(message = "로딩 중...") {
    const loadingContainer = document.createElement("div");
    loadingContainer.className = "loading-container";
    loadingContainer.setAttribute("role", "status");
    loadingContainer.setAttribute("aria-live", "polite");

    // 스피너 요소
    const spinner = document.createElement("div");
    spinner.className = "loading-spinner";

    // 메시지 요소
    const messageElement = document.createElement("p");
    messageElement.className = "loading-message";
    messageElement.textContent = message;

    loadingContainer.appendChild(spinner);
    loadingContainer.appendChild(messageElement);

    return loadingContainer;
  }

  /**
   * 오류 메시지 요소 생성
   *
   * @param {String} message - 오류 메시지
   * @returns {HTMLElement} 생성된 오류 메시지 요소
   */
  createErrorMessage(message = "오류가 발생했습니다.") {
    const errorContainer = document.createElement("div");
    errorContainer.className = "error-container";
    errorContainer.setAttribute("role", "alert");

    // 아이콘 요소
    const icon = document.createElement("div");
    icon.className = "error-icon";
    icon.innerHTML = "⚠️";

    // 메시지 요소
    const messageElement = document.createElement("p");
    messageElement.className = "error-message";
    messageElement.textContent = message;

    // 재시도 버튼
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
   * 섹션 제목 요소 생성
   *
   * @param {String} titleText - 제목 텍스트
   * @param {Object} options - 추가 옵션
   * @returns {HTMLElement} 생성된 제목 요소
   */
  createTitleElement(titleText, options = {}) {
    const titleContainer = document.createElement("div");
    titleContainer.className = "section-title-container";

    // 제목 요소
    const title = document.createElement("h2");
    title.className = "section-title";
    title.id = `${this.sectionName}-title`;
    title.textContent = titleText;

    titleContainer.appendChild(title);

    // 더보기 링크 (선택적)
    if (options.viewAllUrl) {
      const viewAllLink = this.createViewAllLink(
        options.viewAllUrl,
        options.viewAllText
      );
      titleContainer.appendChild(viewAllLink);
    }

    return titleContainer;
  }

  /**
   * 더보기 링크 생성
   *
   * @param {String} url - 링크 URL
   * @param {String} text - 링크 텍스트 (기본값: '더보기')
   * @returns {HTMLElement} 생성된 링크 요소
   */
  createViewAllLink(url, text = "더보기") {
    // 커스텀 링크 컴포넌트 사용 가능 여부 확인
    const customLinkAvailable =
      customElements.get("link-component") !== undefined;

    let link;
    if (customLinkAvailable) {
      // 커스텀 링크 컴포넌트 사용
      link = document.createElement("link-component");
      link.setAttribute("href", url);
      link.setAttribute("text", text);
      link.setAttribute("aria-label", `${this.sectionName} ${text}`);
    } else {
      // 표준 링크 요소 사용
      link = document.createElement("a");
      link.className = "view-all-link";
      link.href = url;
      link.textContent = text;
      link.setAttribute("aria-label", `${this.sectionName} ${text}`);
    }

    return link;
  }

  /**
   * 빈 상태 메시지 요소 생성
   *
   * @param {String} message - 빈 상태 메시지
   * @returns {HTMLElement} 생성된 빈 상태 메시지 요소
   */
  createEmptyStateMessage(message = "표시할 내용이 없습니다.") {
    const emptyContainer = document.createElement("div");
    emptyContainer.className = "empty-state-container";

    // 아이콘 요소
    const icon = document.createElement("div");
    icon.className = "empty-state-icon";
    icon.innerHTML = "📭";

    // 메시지 요소
    const messageElement = document.createElement("p");
    messageElement.className = "empty-state-message";
    messageElement.textContent = message;

    emptyContainer.appendChild(icon);
    emptyContainer.appendChild(messageElement);

    return emptyContainer;
  }
}
