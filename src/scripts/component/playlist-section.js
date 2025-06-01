/**
 * 플레이리스트 섹션 컴포넌트
 *
 * 플레이리스트 목록을 표시하는 섹션 컴포넌트입니다.
 * 새로운 상태 관리 시스템을 활용합니다.
 * 접근성 기능:
 * - 키보드 탐색 지원 (Tab, Enter, Space, 화살표 키)
 * - ARIA 속성 및 역할 추가
 * - 스크린 리더 호환성 개선
 * - 고대비 모드 지원
 *
 * 반응형 기능:
 * - 다양한 화면 크기에 최적화 (XS, S, M, LG, XL 브레이크포인트)
 * - 터치 인터페이스 개선
 * - 화면 사이즈에 따른 요소 걧좌와 간격 자동 조정
 * @element playlist-section
 */

import {
  getToken,
  getPlaylists,
  playlistIds,
} from "/src/scripts/utils/spotify-api.js";
import "/src/scripts/component/playlist-card.js";
import { BaseSection } from "/src/scripts/component/base-section.js";
import {
  StateManager,
  globalEventBus,
} from "/src/scripts/utils/state-manager.js";
import { BREAKPOINTS } from "/src/scripts/utils/responsive-utils.js";

class PlaylistSection extends BaseSection {
  constructor() {
    super();
    this.sectionName = "playlist";
    this.titleText = "플레이리스트";

    // 카드 생성 설정
    this.cardTagName = "playlist-card";
    this.cardAttributeMap = {
      "playlist-name": "name",
      "playlist-description": "description",
      "playlist-image": (item) => item.images[0]?.url || "default-playlist.jpg",
      "playlist-tracks": (item) => `${item.tracks.total} tracks`,
    };

    // DOM 요소 참조 캐싱
    this.accessibilityElements = null;

    // 이벤트 구독 설정 - 성능 최적화를 위해 이벤트 핸들러 미리 바인딩
    const boundHandlers = {
      stateUpdate: this.handleStateUpdate.bind(this),
      renderComplete: this.handleRenderComplete.bind(this),
      loadStart: this.handleLoadStart.bind(this),
      loadComplete: this.handleLoadComplete.bind(this),
      cardKeyboardActivation: this.handleCardKeyboardActivation.bind(this),
    };

    this.unsubscribeHandlers = [
      globalEventBus.subscribe(
        "playlist:stateChanged",
        boundHandlers.stateUpdate
      ),
      globalEventBus.subscribe(
        "playlist:renderComplete",
        boundHandlers.renderComplete
      ),
      globalEventBus.subscribe("playlist:loadStart", boundHandlers.loadStart),
      globalEventBus.subscribe(
        "playlist:loadComplete",
        boundHandlers.loadComplete
      ),
      globalEventBus.subscribe(
        "playlist:cardKeyboardActivation",
        boundHandlers.cardKeyboardActivation
      ),
    ];

    this.render();
  }

  /**
   * 기본 이벤트 구독 외에 플레이리스트 섹션에 특화된 추가 이벤트 구독을 설정합니다.
   * 템플릿 메서드 패턴의 일부로 BaseSection의 setupAdditionalEventSubscriptions 메서드를 구현합니다.
   */
  setupAdditionalEventSubscriptions() {
    // 플레이리스트 특화 이벤트 구독 추가 - 예를 들어 특정 플레이리스트 필터링
    // 현재는 필요한 이벤트 구독이 없음
  }

  /**
   * 접근성: 키보드 활성화 이벤트 처리 - 성능 최적화
   * @param {Object} data - 키보드 활성화 데이터
   */
  handleCardKeyboardActivation(data) {
    // 가능한 빠르게 처리하기 위해 url 존재 여부만 확인
    if (data?.url) {
      // Spotify로 연결 (보안 개선: noopener, noreferrer 추가)
      window.open(data.url, "_blank", "noopener,noreferrer");

      // 접근성: 스크린 리더에 알림
      this.dispatchEvent(
        new CustomEvent("announcement", {
          bubbles: true,
          composed: true,
          detail: { message: `플레이리스트 ${data.name || ""} 열기` },
        })
      );
    }
  }

  /**
   * API에서 플레이리스트 데이터를 가져옵니다.
   * BaseSection의 getDataFromApi 메서드를 구현합니다.
   * @returns {Promise<Array>} API에서 가져온 플레이리스트 데이터 배열
   */
  async getDataFromApi() {
    try {
      // 플레이리스트 데이터가 상태 관리자에 이미 존재하는지 확인
      const existingData = StateManager.getInstance().get("playlists");
      if (
        existingData &&
        Array.isArray(existingData) &&
        existingData.length > 0
      ) {
        console.log("PlaylistSection: Using existing playlist data from state");
        return existingData;
      }

      // 그렇지 않으면 API에서 가져오기
      const token = await getToken();
      if (!playlistIds || !Array.isArray(playlistIds)) {
        console.error(
          "PlaylistSection: playlistIds is undefined or not an array"
        );
        throw new Error("플레이리스트 ID가 올바르게 정의되지 않았습니다.");
      }
      const data = await getPlaylists(token, playlistIds);

      // 플레이리스트 데이터를 상태 관리자에 저장하여 재사용
      if (data && Array.isArray(data)) {
        StateManager.getInstance().set("playlists", data);
      }

      return data;
    } catch (error) {
      console.error("Error fetching playlist data:", error);
      throw error;
    }
  }

  /**
   * 플레이리스트 카드의 ARIA 레이블을 생성합니다.
   * 부모 클래스의 getCardAriaLabel 메서드를 오버라이드합니다.
   * @param {Object} playlist - 플레이리스트 데이터
   * @returns {string} ARIA 레이블
   */
  getCardAriaLabel(playlist) {
    return `플레이리스트: ${playlist.name}, ${playlist.tracks.total} 튷99`;
  }

  /**
   * 컴포넌트가 DOM에서 제거될 때 이벤트 구독을 취소합니다.
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    // 모든 이벤트 구독 취소
    this.unsubscribeHandlers.forEach((unsubscribe) => unsubscribe());
  }

  /**
   * 상태 변경 시 호출되는 핸들러
   * @param {Object} data - 상태 변경 데이터
   */
  handleStateUpdate(data) {
    // 디버그 로그 제거 - 프로덕션에서는 불필요
    // 필요한 상태 변경 처리만 수행
    if (data && data.property === "items") {
      // 아이템 변경 시에만 특정 로직 수행 (필요한 경우)
      this._updateItemsView();
    }
  }

  /**
   * 렌더링 완료 시 호출되는 핸들러 - 성능 최적화
   * @param {Object} data - 렌더링 완료 데이터
   */
  handleRenderComplete(data) {
    // 디버그 로그 제거 - 프로덕션에서는 불필요
    // 렌더링 완료 후 추가 작업이 필요하면 여기서 처리
    if (data && data.itemCount === 0) {
      // 아이템이 없는 경우 처리 - 빈 상태 UI 표시 등
      this._getAccessibilityElements().sectionContainer?.setAttribute(
        "aria-label",
        `플레이리스트 없음`
      );
    }
  }

  /**
   * 아이템 목록 변경 시 UI 업데이트
   * 성능 최적화: DOM 접근 최소화 및 필요한 처리만 수행
   * @private
   */
  _updateItemsView() {
    const state = this.stateManager.state;

    // 데이터가 없거나 로딩 중이거나 오류가 발생한 경우 처리하지 않음
    if (!state.items || state.isLoading || state.hasError) {
      return;
    }

    // 이미 계산된 캐시된 요소 참조 사용
    const playlistList = this._getAccessibilityElements().playlistList;
    if (!playlistList) return;

    // 성능 정보 수집을 위해 시작 시간 기록 (개발 모드)
    const perfStart = performance.now();

    // requestAnimationFrame을 사용하여 레이아웃 쓰래싱 방지
    window.requestAnimationFrame(() => {
      // 중요: 기존 카드와 새 아이템 데이터 비교하여 필요한 업데이트만 수행
      const cards = playlistList.querySelectorAll(this.cardTagName);

      // 각 카드에 대해 데이터 업데이트 필요 여부 확인
      for (let i = 0; i < cards.length && i < state.items.length; i++) {
        const card = cards[i];
        const item = state.items[i];

        // 데이터 속성 갱신이 필요한 경우에만 업데이트 (변경점 감지)
        if (card.getAttribute("playlist-name") !== item.name) {
          card.setAttribute("playlist-name", item.name);
        }

        if (card.getAttribute("playlist-description") !== item.description) {
          card.setAttribute("playlist-description", item.description);
        }

        const imageUrl = item.images[0]?.url || "default-playlist.jpg";
        if (card.getAttribute("playlist-image") !== imageUrl) {
          card.setAttribute("playlist-image", imageUrl);
        }

        const tracksText = `${item.tracks.total} tracks`;
        if (card.getAttribute("playlist-tracks") !== tracksText) {
          card.setAttribute("playlist-tracks", tracksText);
        }

        // 원본 데이터 참조 업데이트 - 데이터 속성 저장
        if (card._data !== item) {
          card._data = item;
        }
      }

      // 성능 정보 기록 (개발 모드)
      if (process.env.NODE_ENV === "development") {
        const perfEnd = performance.now();
        console.debug(
          `PlaylistSection _updateItemsView - 성능: ${perfEnd - perfStart}ms`
        );
      }

      // 업데이트 완료 후 접근성 포커스 및 키보드 탐색 업데이트
      this._ensureKeyboardNavigation();
    });
  }

  /**
   * 키보드 탐색 지원 확인 및 개선
   * @private
   */
  _ensureKeyboardNavigation() {
    const playlistList = this._getAccessibilityElements().playlistList;
    if (!playlistList) return;

    const cards = playlistList.querySelectorAll(this.cardTagName);
    cards.forEach((card, index) => {
      // 키보드 탐색 순서 설정 및 타입 확인
      if (card.getAttribute("tabindex") !== "0") {
        card.setAttribute("tabindex", "0");
      }

      // ARIA 속성 업데이트
      if (!card.hasAttribute("role")) {
        card.setAttribute("role", "button");
      }
    });
  }

  /**
   * 접근성: 데이터 로딩 시작 시 호출되는 핸들러
   * @param {Object} data - 로딩 시작 데이터
   */
  handleLoadStart(data) {
    // DOM 접근 최소화를 위해 요소 참조 캐싱
    this._getAccessibilityElements().loadingContainer?.setAttribute(
      "aria-busy",
      "true"
    );
  }

  /**
   * 접근성: 데이터 로딩 완료 시 호출되는 핸들러
   * @param {Object} data - 로딩 완료 데이터
   */
  handleLoadComplete(data) {
    // 캐시된 요소 참조 사용
    this._getAccessibilityElements().loadingContainer?.setAttribute(
      "aria-busy",
      "false"
    );
  }

  /**
   * 접근성 관련 DOM 요소를 캐싱하여 반환합니다.
   * @returns {Object} 접근성 관련 DOM 요소 참조
   * @private
   */
  _getAccessibilityElements() {
    if (!this.accessibilityElements) {
      this.accessibilityElements = {
        loadingContainer: this.shadowRoot.querySelector(".loading-container"),
        playlistList: this.shadowRoot.querySelector(".playlist-list"),
        sectionContainer: this.shadowRoot.querySelector(".playlist-container"),
      };
    }
    return this.accessibilityElements;
  }

  /**
   * 접근성 및 반응형 스타일을 반환합니다.
   * 상위 클래스의 getComponentStyles를 확장합니다.
   * 메모이제이션을 적용하여 성능 향상
   * @returns {string} 컴포넌트 스타일 문자열
   */
  getComponentStyles() {
    // 스타일 메모이제이션 - 재계산 방지
    if (this._cachedStyles) {
      return this._cachedStyles;
    }

    // 기본 스타일(상위 클래스에서 정의된 경우 호출)
    const baseStyles =
      BaseSection.prototype.getComponentStyles &&
      typeof BaseSection.prototype.getComponentStyles === "function"
        ? BaseSection.prototype.getComponentStyles.call(this)
        : "";

    // 플레이리스트 고유 스타일 - 모든 스타일을 메모이제이션에 포함
    this._cachedStyles = `
      ${baseStyles}
      
      /* 플레이리스트 섹션 고유 스타일 */
      .playlist-section {
        position: relative;
      }
      
      .playlist-container {
        position: relative;
        scroll-behavior: smooth;
        -webkit-overflow-scrolling: touch; /* iOS 스크롤 개선 */
        scrollbar-width: thin; /* Firefox 스크롤바 스타일 */
      }
      
      /* 접근성: 키보드 포커스 스타일 - 클래스 기반 적용 */
      .playlist-container playlist-card:focus-visible {
        outline: 2px solid #1db954;
        outline-offset: 2px;
        border-radius: 4px;
        box-shadow: 0 0 0 4px rgba(29, 185, 84, 0.3);
        transform: scale(1.05);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        z-index: 1;
      }
      
      /* 스크롤 버튼 스타일 개선 */
      .scroll-button {
        background-color: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        transition: opacity 0.3s ease, transform 0.3s ease, background-color 0.3s ease;
        z-index: 2;
      }
      
      .scroll-button:hover, .scroll-button:focus-visible {
        background-color: rgba(29, 185, 84, 0.8);
        transform: scale(1.1);
      }
      
      .scroll-button:focus-visible {
        outline: 2px solid #1db954;
        outline-offset: 2px;
      }
      
      /* 접근성: 고대비 모드 지원 */
      @media (forced-colors: active) {
        .playlist-container playlist-card:focus-visible {
          outline: 3px solid Highlight;
          forced-color-adjust: none;
        }
        
        .playlist-container playlist-card {
          border: 1px solid ButtonText;
        }
        
        .playlist-section .section-title {
          color: ButtonText;
        }
        
        .scroll-button {
          border: 1px solid ButtonText;
          background-color: ButtonFace;
        }
        
        .scroll-button:hover, .scroll-button:focus-visible {
          background-color: Highlight;
        }
        
        .scroll-button svg {
          fill: ButtonText;
        }
      }
      
      /* 반응형 스타일: XS (800px 이하) - 모바일 */
      @media (max-width: ${BREAKPOINTS.xs}px) {
        .playlist-section {
          padding: 12px 16px;
        }
        
        .playlist-section .section-title {
          font-size: 18px;
          margin-bottom: 12px;
        }
        
        .playlist-container {
          gap: 8px;
          margin: 0 -8px;
          padding: 4px 8px;
        }
        
        .scroll-button {
          width: 32px;
          height: 32px;
          top: calc(50% - 16px);
        }
        
        .scroll-button.left {
          left: 4px;
        }
        
        .scroll-button.right {
          right: 4px;
        }
        
        /* 터치 화면에서 가로 스크롤 개선 */
        .playlist-container {
          touch-action: pan-x;
          -webkit-tap-highlight-color: transparent;
    
    /* 반응형 스타일: XS (800px 이하) - 모바일 */
    @media (max-width: ${BREAKPOINTS.xs}px) {
      .playlist-section {
        padding: 12px 16px;
      }
      
      .playlist-section .section-title {
        font-size: 18px;
        margin-bottom: 12px;
          padding: 4px 12px;
        }
        
        .scroll-button {
          width: 36px;
          height: 36px;
          top: calc(50% - 18px);
        }
        
        .scroll-button.left {
          left: 8px;
        }
        
        .scroll-button.right {
          right: 8px;
        }
      }
      
      /* 반응형 스타일: M (851px - 1078px) - 태블릿 및 소형 데스크톱 */
      @media (min-width: ${BREAKPOINTS.s + 1}px) and (max-width: ${
      BREAKPOINTS.m
    }px) {
        .playlist-section {
          padding: 20px 32px;
        }
        
        .playlist-section .section-title {
          font-size: 20px;
          margin-bottom: 16px;
        }
        
        .playlist-container {
          gap: 16px;
          margin: 0 -16px;
          padding: 4px 16px;
        }
        
        .scroll-button {
          width: 40px;
          height: 40px;
          top: calc(50% - 20px);
        }
      }
      
      /* 반응형 스타일: LG (1079px - 1742px) - 데스크톱 */
      @media (min-width: ${BREAKPOINTS.m + 1}px) and (max-width: ${
      BREAKPOINTS.lg
    }px) {
        .playlist-section {
          padding: 24px 40px;
        }
        
        .playlist-section .section-title {
          font-size: 22px;
          margin-bottom: 18px;
        }
        
        .playlist-container {
          gap: 20px;
          margin: 0 -20px;
          padding: 4px 20px;
        }
      }
      
      /* 반응형 스타일: XL (1743px 이상) - 대형 디스플레이 */
      @media (min-width: ${BREAKPOINTS.lg + 1}px) {
        .playlist-section {
          padding: 28px 48px;
        }
        
        .playlist-section .section-title {
          font-size: 24px;
          margin-bottom: 20px;
        }
        
        .playlist-container {
          gap: 24px;
          margin: 0 -24px;
          padding: 8px 24px;
        }
        
        .scroll-button {
          width: 48px;
          height: 48px;
          top: calc(50% - 24px);
        }
      }
    `;
  }
}

customElements.define("playlist-section", PlaylistSection);
