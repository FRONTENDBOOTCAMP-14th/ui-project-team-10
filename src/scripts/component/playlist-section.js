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
 * @element playlist-section
 */

import { getToken, getPlaylists, playlistIds } from "../utils/spotify-api.js";
import "./playlist-card.js";
import { BaseSection } from "./base-section.js";
import { globalEventBus } from "../utils/state-manager.js";

class PlaylistSection extends BaseSection {
  constructor() {
    super();
    this.sectionName = "playlist";
    this.titleText = "플레이리스트";

    // 이벤트 구독 설정
    this.unsubscribeHandlers = [
      globalEventBus.subscribe(
        "playlist:stateChanged",
        this.handleStateUpdate.bind(this)
      ),
      globalEventBus.subscribe(
        "playlist:renderComplete",
        this.handleRenderComplete.bind(this)
      ),
      // 접근성: 추가 이벤트 구독
      globalEventBus.subscribe(
        "playlist:loadStart",
        this.handleLoadStart.bind(this)
      ),
      globalEventBus.subscribe(
        "playlist:loadComplete",
        this.handleLoadComplete.bind(this)
      ),
      globalEventBus.subscribe(
        "playlist:cardKeyboardActivation",
        this.handleCardKeyboardActivation.bind(this)
      ),
    ];

    this.render();
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
    // 특정 상태 변경에 따른 처리 로직
    console.log(`플레이리스트 섹션 상태 변경: ${data.property}`);
  }

  /**
   * 렌더링 완료 시 호출되는 핸들러
   * @param {Object} data - 렌더링 완료 데이터
   */
  handleRenderComplete(data) {
    console.log(`플레이리스트 렌더링 완료: ${data.itemCount} 항목`);
  }

  /**
   * 접근성: 데이터 로딩 시작 시 호출되는 핸들러
   * @param {Object} data - 로딩 시작 데이터
   */
  handleLoadStart(data) {
    // 스크린 리더용 로딩 상태 알림
    const loadingContainer =
      this.shadowRoot.querySelector(".loading-container");
    if (loadingContainer) {
      loadingContainer.setAttribute("aria-busy", "true");
    }
  }

  /**
   * 접근성: 데이터 로딩 완료 시 호출되는 핸들러
   * @param {Object} data - 로딩 완료 데이터
   */
  handleLoadComplete(data) {
    // 스크린 리더용 로딩 완료 알림
    const loadingContainer =
      this.shadowRoot.querySelector(".loading-container");
    if (loadingContainer) {
      loadingContainer.setAttribute("aria-busy", "false");
    }
  }

  /**
   * 접근성: 키보드 활성화 이벤트 처리
   * @param {Object} data - 키보드 활성화 데이터
   */
  handleCardKeyboardActivation(data) {
    if (data && data.url) {
      // Spotify로 연결 (보안 개선: noopener 추가)
      window.open(data.url, "_blank", "noopener");
    }
  }

  /**
   * 플레이리스트 데이터를 로드합니다.
   * BaseSection의 loadData 메서드를 구현합니다.
   * StateManager를 활용한 개선된 버전입니다.
   * 접근성을 위한 로딩 상태 알림 추가
   * @returns {Promise<Array>} 플레이리스트 배열
   */
  async loadData() {
    try {
      // 이벤트 발행: 데이터 로드 시작
      globalEventBus.publish("playlist:loadStart", { timestamp: new Date() });

      // 토큰 가져오기
      const token = await getToken();

      // spotify-api.js의 개선된 getPlaylists 함수 사용
      const playlists = await getPlaylists(token, playlistIds);

      // 이벤트 발행: 데이터 로드 완료
      globalEventBus.publish("playlist:loadComplete", {
        count: playlists.length,
        timestamp: new Date(),
      });

      // 상태 객체에 저장되므로 더 이상 로컬 변수에 저장할 필요 없음
      return playlists;
    } catch (error) {
      console.error("플레이리스트 데이터 로드 오류:", error.message);

      // 이벤트 발행: 데이터 로드 실패
      globalEventBus.publish("playlist:loadError", {
        error: error.message,
        timestamp: new Date(),
      });

      throw error;
    }
  }

  /**
   * 플레이리스트 카드 요소를 생성합니다.
   * BaseSection의 createCardElement 메서드를 구현합니다.
   * 이벤트 기반 통신을 추가하여 개선되었습니다.
   * 접근성 기능 추가: ARIA 속성, 키보드 탐색, 스크린 리더 지원
   * @param {Object} playlist - 플레이리스트 데이터
   * @returns {HTMLElement} 생성된 플레이리스트 카드 요소
   */
  createCardElement(playlist) {
    // 이벤트 발행: 카드 생성 시작
    globalEventBus.publish("playlist:cardCreate", {
      id: playlist.id,
      name: playlist.name,
    });

    // playlist-card 커스텀 요소 생성
    const playlistCard = document.createElement("playlist-card");
    playlistCard.setAttribute("playlist-title", playlist.name);
    playlistCard.setAttribute("playlist-owner", playlist.owner.display_name);
    playlistCard.setAttribute(
      "playlist-cover",
      playlist.images[0]?.url || "default.jpg"
    );
    // 데이터 속성 추가
    playlistCard.dataset.id = playlist.id;

    // 접근성: 추가 속성 설정
    const playlistId = `playlist-${playlist.id}`;
    playlistCard.setAttribute("id", playlistId);
    playlistCard.setAttribute("role", "listitem");
    playlistCard.setAttribute(
      "aria-label",
      `플레이리스트 ${playlist.name}, 제작자 ${playlist.owner.display_name}`
    );
    playlistCard.setAttribute("tabindex", "0");

    // 연결된 외부 링크에 대한 정보 제공
    if (playlist.external_urls && playlist.external_urls.spotify) {
      playlistCard.setAttribute("data-url", playlist.external_urls.spotify);
      playlistCard.setAttribute(
        "aria-description",
        "Spotify에서 플레이리스트 열기. 새 창에서 열립니다."
      );
    }

    // 클릭 이벤트 처리 - Spotify로 연결
    playlistCard.addEventListener("playlist-click", (event) => {
      // 이벤트 발행: 카드 클릭
      globalEventBus.publish("playlist:cardClick", {
        id: playlist.id,
        name: playlist.name,
        url: playlist.external_urls.spotify,
        interactionType: "mouse",
      });

      window.open(playlist.external_urls.spotify, "_blank", "noopener");
    });

    // 접근성: 키보드 이벤트 처리 추가
    playlistCard.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();

        // 플레이리스트 카드 클릭 이벤트와 동일한 기능 수행
        globalEventBus.publish("playlist:cardKeyboardActivation", {
          id: playlist.id,
          name: playlist.name,
          url: playlist.external_urls.spotify,
          activationKey: event.key,
          interactionType: "keyboard",
        });
      }
    });

    // 마우스 호버 이벤트 처리 추가
    playlistCard.addEventListener("mouseenter", () => {
      globalEventBus.publish("playlist:cardHover", { id: playlist.id });

      // 접근성: 포커스 상태 알림
      playlistCard.setAttribute("aria-current", "true");
    });

    playlistCard.addEventListener("mouseleave", () => {
      globalEventBus.publish("playlist:cardHoverEnd", { id: playlist.id });

      // 접근성: 포커스 상태 제거
      playlistCard.removeAttribute("aria-current");
    });

    // 접근성: 포커스 이벤트 처리 추가
    playlistCard.addEventListener("focus", () => {
      globalEventBus.publish("playlist:cardFocusStart", { id: playlist.id });
    });

    playlistCard.addEventListener("blur", () => {
      globalEventBus.publish("playlist:cardFocusEnd", { id: playlist.id });
    });

    return playlistCard;
  }
}

/**
 * 접근성 관련 추가 스타일을 반환합니다.
 * 상위 클래스의 getComponentStyles를 확장합니다.
 * @returns {string} 컴포넌트 스타일 문자열
 */
PlaylistSection.prototype.getComponentStyles = function () {
  // 기본 스타일(상위 클래스에서 정의된 경우 호출)
  const baseStyles =
    super.getComponentStyles && typeof super.getComponentStyles === "function"
      ? super.getComponentStyles()
      : "";

  return `
    ${baseStyles}
    
    /* 접근성: 키보드 포커스 스타일 */
    .playlist-container playlist-card:focus-visible {
      outline: 2px solid #1db954;
      outline-offset: 2px;
      border-radius: 4px;
    }
    
    /* 접근성: 고대비 모드 지원 */
    @media (forced-colors: active) {
      .playlist-container playlist-card:focus-visible {
        outline: 3px solid HighlightText;
      }
      
      .playlist-container playlist-card {
        border: 1px solid ButtonText;
      }
      
      .playlist-section .section-title {
        color: ButtonText;
      }
      
      .scroll-button {
        border: 1px solid ButtonText;
      }
    }
  `;
};

customElements.define("playlist-section", PlaylistSection);
