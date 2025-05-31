/**
 * 앨범 섹션 컴포넌트
 *
 * 이벤트 관리 및 상태 관리를 표준화한 앨범 섹션 컴포넌트입니다.
 * 접근성 기능:
 * - 키보드 탐색 지원 (Tab, Enter, Space, 화살표 키)
 * - ARIA 속성 및 역할 추가
 * - 스크린 리더 호환성 개선
 * - 고대비 모드 지원
 *
 * 반응형 기능:
 * - 다양한 화면 크기에 최적화 (XS, S, M, LG, XL 브레이크포인트)
 * - 터치 인터페이스 개선
 * - 화면 사이즈에 따른 카드 갰좌 및 간격 자동 조정
 * - 수평 스크롤 및 누비기 여부에 따른 필터링
 * @element album-section
 */

import { getToken, getAlbums } from "/src/scripts/utils/spotify-api.js";
import "/src/scripts/component/album-card.js";
import { BaseSection } from "/src/scripts/component/base-section.js";
import { BREAKPOINTS } from "/src/scripts/utils/responsive-utils.js";

class AlbumSection extends BaseSection {
  constructor() {
    super();
    this.sectionName = "album";
    this.titleText = "앨범";
    this.items = [];
    this.render();

    // 앨범 전용 이벤트 구독 설정
    this.setupAlbumEventSubscriptions();
  }

  /**
   * 앨범 관련 이벤트 구독을 설정합니다.
   * 접근성 개선 포함: 키보드 이벤트 및 포커스 이벤트 추가
   */
  setupAlbumEventSubscriptions() {
    // 앨범 카드 클릭 이벤트 구독
    this.eventManager.subscribe(`${this.sectionName}:cardClick`, (data) => {
      if (data && data.item && data.item.external_urls) {
        this.eventManager.publish(`${this.sectionName}:albumSelected`, {
          id: data.item.id,
          name: data.item.name,
          artists: data.item.artists,
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
      `${this.sectionName}:albumCardKeyboardActivation`,
      (data) => {
        if (data) {
          this.eventManager.publish(`${this.sectionName}:albumSelected`, {
            id: data.id,
            name: data.name,
            artists: data.artists,
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

      // 데이터 로드 후 첫 번째 앨범 카드에 초기 포커스 위치 설정 (선택적)
      // setTimeout(() => {
      //   const firstCard = this.shadowRoot.querySelector('album-card');
      //   if (firstCard) firstCard.focus();
      // }, 500);
    });
  }

  /**
   * 앨범 데이터를 로드합니다.
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
      this.items = await getAlbums(token);

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
   * 앨범 카드 요소를 생성합니다.
   * BaseSection의 createCardElement 메서드를 구현합니다.
   * 이벤트 처리를 개선하였습니다.
   * 접근성 기능 추가: ARIA 속성, 키보드 탐색, 스크린 리더 지원
   * @param {Object} album - 앨범 데이터
   * @returns {HTMLElement} 생성된 앨범 카드 요소
   */
  createCardElement(album) {
    // 이벤트 발행: 카드 생성 시작
    this.eventManager.publish(`${this.sectionName}:cardCreateStart`, {
      albumId: album.id,
      timestamp: new Date(),
    });

    // album-card 커스텀 요소 생성
    const albumCard = document.createElement("album-card");
    albumCard.setAttribute("album-title", album.name);
    albumCard.setAttribute(
      "album-artist",
      album.artists.map((a) => a.name).join(", ")
    );
    albumCard.setAttribute(
      "album-cover",
      album.images[0]?.url || "default.jpg"
    );

    // 접근성: 추가 속성 설정
    const albumId = `album-${album.id}`;
    albumCard.setAttribute("id", albumId);
    albumCard.setAttribute("role", "listitem");
    albumCard.setAttribute(
      "aria-label",
      `${album.name}, ${album.artists.map((a) => a.name).join(", ")}`
    );

    // 연결된 외부 링크에 대한 정보 제공
    if (album.external_urls && album.external_urls.spotify) {
      albumCard.setAttribute("data-url", album.external_urls.spotify);
      albumCard.setAttribute(
        "aria-description",
        "Spotify에서 앨범 열기. 새 창에서 열립니다."
      );
    }

    // 클릭 이벤트 처리 - 이벤트 관리자 사용
    this.eventManager.addListener(albumCard, "album-click", () => {
      this.eventManager.publish(`${this.sectionName}:albumCardClick`, {
        id: album.id,
        name: album.name,
        artists: album.artists,
        url: album.external_urls.spotify,
        timestamp: new Date(),
      });

      // 데이터 해석 및 UI 업데이트는 구독자에서 처리
    });

    // 접근성: 키보드 이벤트 처리 추가
    this.eventManager.addListener(albumCard, "keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();

        // 앨범 카드 클릭 이벤트와 동일한 기능 수행
        this.eventManager.publish(
          `${this.sectionName}:albumCardKeyboardActivation`,
          {
            id: album.id,
            name: album.name,
            artists: album.artists,
            url: album.external_urls.spotify,
            activationKey: event.key,
            timestamp: new Date(),
          }
        );

        // Spotify로 연결
        if (album.external_urls && album.external_urls.spotify) {
          window.open(album.external_urls.spotify, "_blank", "noopener");
        }
      }
    });

    // 호버 이벤트 처리 추가
    this.eventManager.addListener(albumCard, "mouseenter", () => {
      this.eventManager.publish(`${this.sectionName}:cardHoverStart`, {
        albumId: album.id,
        timestamp: new Date(),
      });

      // 접근성: 포커스 상태 알림
      albumCard.setAttribute("aria-current", "true");
    });

    this.eventManager.addListener(albumCard, "mouseleave", () => {
      this.eventManager.publish(`${this.sectionName}:cardHoverEnd`, {
        albumId: album.id,
        timestamp: new Date(),
      });

      // 접근성: 포커스 상태 제거
      albumCard.removeAttribute("aria-current");
    });

    // 접근성: 포커스 이벤트 처리 추가
    this.eventManager.addListener(albumCard, "focus", () => {
      this.eventManager.publish(`${this.sectionName}:cardFocusStart`, {
        albumId: album.id,
        timestamp: new Date(),
      });
    });

    this.eventManager.addListener(albumCard, "blur", () => {
      this.eventManager.publish(`${this.sectionName}:cardFocusEnd`, {
        albumId: album.id,
        timestamp: new Date(),
      });
    });

    // 이벤트 발행: 카드 생성 완료
    this.eventManager.publish(`${this.sectionName}:cardCreateComplete`, {
      albumId: album.id,
      timestamp: new Date(),
    });

    return albumCard;
  }
}

/**
 * 접근성 및 반응형 스타일을 반환합니다.
 * 상위 클래스의 getComponentStyles를 확장합니다.
 * @returns {string} 컴포넌트 스타일 문자열
 */
AlbumSection.prototype.getComponentStyles = function () {
  // 기본 스타일(상위 클래스에서 정의된 경우 호출)
  const baseStyles =
    BaseSection.prototype.getComponentStyles &&
    typeof BaseSection.prototype.getComponentStyles === "function"
      ? BaseSection.prototype.getComponentStyles.call(this)
      : "";

  return `
    ${baseStyles}
    
    /* 앨범 섹션 고유 스타일 */
    .album-section {
      position: relative;
    }
    
    .album-container {
      position: relative;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch; /* iOS 스크롤 개선 */
      scrollbar-width: thin; /* Firefox 스크롤바 스타일 */
    }
    
    /* 접근성: 키보드 포커스 스타일 */
    .album-container album-card:focus-visible {
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
      .album-container album-card:focus-visible {
        outline: 3px solid Highlight;
        forced-color-adjust: none;
      }
      
      .album-container album-card {
        border: 1px solid ButtonText;
      }
      
      .album-section .section-title {
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
      .album-section {
        padding: 12px 16px;
      }
      
      .album-section .section-title {
        font-size: 18px;
        margin-bottom: 12px;
      }
      
      .album-container {
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
      .album-container {
        touch-action: pan-x;
        -webkit-tap-highlight-color: transparent;
      }
      
      /* 모바일에서는 스크롤 버튼 숨김 */
      .scroll-button {
        opacity: 0.5;
        transform: scale(0.9);
      }
    }
    
    /* 반응형 스타일: S (801px - 850px) - 소형 태블릿 */
    @media (min-width: ${BREAKPOINTS.xs + 1}px) and (max-width: ${
    BREAKPOINTS.s
  }px) {
      .album-section {
        padding: 16px 24px;
      }
      
      .album-container {
        gap: 12px;
        margin: 0 -12px;
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
      .album-section {
        padding: 20px 32px;
      }
      
      .album-section .section-title {
        font-size: 20px;
        margin-bottom: 16px;
      }
      
      .album-container {
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
      .album-section {
        padding: 24px 40px;
      }
      
      .album-section .section-title {
        font-size: 22px;
        margin-bottom: 18px;
      }
      
      .album-container {
        gap: 20px;
        margin: 0 -20px;
        padding: 4px 20px;
      }
    }
    
    /* 반응형 스타일: XL (1743px 이상) - 대형 디스플레이 */
    @media (min-width: ${BREAKPOINTS.lg + 1}px) {
      .album-section {
        padding: 28px 48px;
      }
      
      .album-section .section-title {
        font-size: 24px;
        margin-bottom: 20px;
      }
      
      .album-container {
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
};

customElements.define("album-section", AlbumSection);
