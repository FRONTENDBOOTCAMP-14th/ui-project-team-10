/**
 * 아티스트 섹션 컴포넌트
 *
 * 이벤트 관리 및 상태 관리를 표준화한 아티스트 섹션 컴포넌트입니다.
 * 접근성 기능:
 * - 키보드 탐색 지원 (Tab, Enter, Space, 화살표 키)
 * - ARIA 속성 및 역할 추가
 * - 스크린 리더 호환성 개선
 * - 고대비 모드 지원
 * @element artist-section
 */

import { getToken, getArtists } from "../utils/spotify-api.js";
import "./artist-card.js";
import { BaseSection } from "./base-section.js";
import { EventTypes } from "../utils/event-utils.js";

class ArtistSection extends BaseSection {
  constructor() {
    super();
    this.sectionName = "artist";
    this.titleText = "아티스트";
    this.items = [];
    this.render();

    // 아티스트 전용 이벤트 구독 설정
    this.setupArtistEventSubscriptions();
  }

  /**
   * 아티스트 관련 이벤트 구독을 설정합니다.
   * 접근성 개선 포함: 키보드 이벤트 및 포커스 이벤트 추가
   */
  setupArtistEventSubscriptions() {
    // 아티스트 카드 클릭 이벤트 구독
    this.eventManager.subscribe(`${this.sectionName}:cardClick`, (data) => {
      if (data && data.item && data.item.external_urls) {
        this.eventManager.publish(`${this.sectionName}:artistSelected`, {
          id: data.item.id,
          name: data.item.name,
          url: data.item.external_urls.spotify,
          timestamp: new Date(),
          interactionType: "mouse",
        });

        // Spotify로 연결 (보안 개선: noopener 추가)
        window.open(data.item.external_urls.spotify, "_blank", "noopener");
      }
    });

    // 접근성: 키보드 활성화 이벤트 구독
    this.eventManager.subscribe(
      `${this.sectionName}:artistCardKeyboardActivation`,
      (data) => {
        if (data) {
          this.eventManager.publish(`${this.sectionName}:artistSelected`, {
            id: data.id,
            name: data.name,
            url: data.url,
            timestamp: new Date(),
            interactionType: "keyboard",
            activationKey: data.activationKey,
          });
        }
      }
    );

    // 접근성: 알림 메시지 관리를 위한 구독
    this.eventManager.subscribe(`${this.sectionName}:loadStart`, () => {
      // 스크린 리더용 로딩 상태 알림
      const loadingContainer =
        this.shadowRoot.querySelector(".loading-container");
      if (loadingContainer) {
        loadingContainer.setAttribute("aria-busy", "true");
      }
    });

    this.eventManager.subscribe(`${this.sectionName}:loadSuccess`, () => {
      // 스크린 리더용 로딩 완료 알림
      const loadingContainer =
        this.shadowRoot.querySelector(".loading-container");
      if (loadingContainer) {
        loadingContainer.setAttribute("aria-busy", "false");
      }
    });
  }

  /**
   * 아티스트 데이터를 로드합니다.
   * BaseSection의 loadData 메서드를 구현합니다.
   * 이벤트 발행 기능을 추가하였습니다.
   * 접근성을 위한 로딩 상태 알림 추가
   */
  async loadData() {
    try {
      // 이벤트 발행: 로드 시작
      this.eventManager.publish(`${this.sectionName}:loadStart`, {
        timestamp: new Date(),
      });

      const token = await getToken();
      this.items = await getArtists(token);

      // 이벤트 발행: 로드 성공
      this.eventManager.publish(`${this.sectionName}:loadSuccess`, {
        itemCount: this.items.length,
        timestamp: new Date(),
      });

      return this.items;
    } catch (error) {
      // 이벤트 발행: 로드 오류
      this.eventManager.publish(`${this.sectionName}:loadError`, {
        error: error.message,
        timestamp: new Date(),
      });

      throw error;
    }
  }

  /**
   * 아티스트 카드 요소를 생성합니다.
   * BaseSection의 createCardElement 메서드를 구현합니다.
   * 이벤트 처리를 개선하였습니다.
   * 접근성 기능 추가: ARIA 속성, 키보드 탐색, 스크린 리더 지원
   * @param {Object} artist - 아티스트 데이터
   * @returns {HTMLElement} 생성된 아티스트 카드 요소
   */
  createCardElement(artist) {
    // 이벤트 발행: 카드 생성 시작
    this.eventManager.publish(`${this.sectionName}:cardCreateStart`, {
      artistId: artist.id,
      timestamp: new Date(),
    });

    // artist-card 커스텀 요소 생성
    const artistCard = document.createElement("artist-card");
    artistCard.setAttribute("artist-name", artist.name);
    artistCard.setAttribute("artist-type", "Artist");
    artistCard.setAttribute("artist-image", artist.images[0]?.url || "");

    // 접근성: 추가 속성 설정
    const artistId = `artist-${artist.id}`;
    artistCard.setAttribute("id", artistId);
    artistCard.setAttribute("role", "listitem");
    artistCard.setAttribute("aria-label", `아티스트 ${artist.name}`);

    // 연결된 외부 링크에 대한 정보 제공
    if (artist.external_urls && artist.external_urls.spotify) {
      artistCard.setAttribute("data-url", artist.external_urls.spotify);
      artistCard.setAttribute(
        "aria-description",
        "Spotify에서 아티스트 프로필 열기. 새 창에서 열립니다."
      );
    }

    // 클릭 이벤트 처리 - 이벤트 관리자 사용
    this.eventManager.addListener(artistCard, "artist-click", () => {
      this.eventManager.publish(`${this.sectionName}:artistCardClick`, {
        id: artist.id,
        name: artist.name,
        url: artist.external_urls.spotify,
        timestamp: new Date(),
      });

      // 데이터 해석 및 UI 업데이트는 구독자에서 처리
    });

    // 접근성: 키보드 이벤트 처리 추가
    this.eventManager.addListener(artistCard, "keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();

        // 아티스트 카드 클릭 이벤트와 동일한 기능 수행
        this.eventManager.publish(
          `${this.sectionName}:artistCardKeyboardActivation`,
          {
            id: artist.id,
            name: artist.name,
            url: artist.external_urls.spotify,
            activationKey: event.key,
            timestamp: new Date(),
          }
        );

        // Spotify로 연결
        if (artist.external_urls && artist.external_urls.spotify) {
          window.open(artist.external_urls.spotify, "_blank", "noopener");
        }
      }
    });

    // 호버 이벤트 처리 추가
    this.eventManager.addListener(artistCard, "mouseenter", () => {
      this.eventManager.publish(`${this.sectionName}:cardHoverStart`, {
        artistId: artist.id,
        timestamp: new Date(),
      });

      // 접근성: 포커스 상태 알림
      artistCard.setAttribute("aria-current", "true");
    });

    this.eventManager.addListener(artistCard, "mouseleave", () => {
      this.eventManager.publish(`${this.sectionName}:cardHoverEnd`, {
        artistId: artist.id,
        timestamp: new Date(),
      });

      // 접근성: 포커스 상태 제거
      artistCard.removeAttribute("aria-current");
    });

    // 접근성: 포커스 이벤트 처리 추가
    this.eventManager.addListener(artistCard, "focus", () => {
      this.eventManager.publish(`${this.sectionName}:cardFocusStart`, {
        artistId: artist.id,
        timestamp: new Date(),
      });
    });

    this.eventManager.addListener(artistCard, "blur", () => {
      this.eventManager.publish(`${this.sectionName}:cardFocusEnd`, {
        artistId: artist.id,
        timestamp: new Date(),
      });
    });

    // 이벤트 발행: 카드 생성 완료
    this.eventManager.publish(`${this.sectionName}:cardCreateComplete`, {
      artistId: artist.id,
      timestamp: new Date(),
    });

    return artistCard;
  }
}

/**
 * 접근성 관련 추가 스타일을 반환합니다.
 * 상위 클래스의 getComponentStyles를 확장합니다.
 * @returns {string} 컴포넌트 스타일 문자열
 */
ArtistSection.prototype.getComponentStyles = function () {
  // 기본 스타일(상위 클래스에서 정의된 경우 호출)
  const baseStyles =
    super.getComponentStyles && typeof super.getComponentStyles === "function"
      ? super.getComponentStyles()
      : "";

  return `
    ${baseStyles}
    
    /* 접근성: 키보드 포커스 스타일 */
    .artist-container artist-card:focus-visible {
      outline: 2px solid #1db954;
      outline-offset: 2px;
      border-radius: 4px;
    }
    
    /* 접근성: 고대비 모드 지원 */
    @media (forced-colors: active) {
      .artist-container artist-card:focus-visible {
        outline: 3px solid HighlightText;
      }
      
      .artist-container artist-card {
        border: 1px solid ButtonText;
      }
      
      .artist-section .section-title {
        color: ButtonText;
      }
      
      .scroll-button {
        border: 1px solid ButtonText;
      }
    }
  `;
};

customElements.define("artist-section", ArtistSection);
