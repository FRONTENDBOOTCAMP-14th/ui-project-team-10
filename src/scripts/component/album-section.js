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
    
    // 카드 생성 설정
    this.cardTagName = "album-card";
    this.cardAttributeMap = {
      "album-title": "name",
      "album-artist": (item) => item.artists.map(a => a.name).join(", "),
      "album-cover": (item) => item.images[0]?.url || "default.jpg"
    };
    
    this.render();
  }

  /**
   * 기본 이벤트 구독 외에 앨범 섹션에 특화된 추가 이벤트 구독을 설정합니다.
   * 템플릿 메서드 패턴의 일부로 BaseSection의 setupAdditionalEventSubscriptions 메서드를 구현합니다.
   */
  setupAdditionalEventSubscriptions() {
    // 필요한 경우 앨범 섹션 특화 이벤트 구독 추가
    // 데이터 로드 후 첫 번째 앨범 카드에 초기 포커스 위치 설정 (선택적)
    this.eventManager.subscribe(`${this.sectionName}:loadSuccess`, () => {
      // setTimeout(() => {
      //   const firstCard = this.shadowRoot.querySelector('album-card');
      //   if (firstCard) firstCard.focus();
      // }, 500);
    });
  }

  /**
   * API에서 앨범 데이터를 가져옵니다.
   * BaseSection의 getDataFromApi 메서드를 구현합니다.
   * @returns {Promise<Array>} API에서 가져온 앨범 데이터 배열
   */
  async getDataFromApi() {
    const token = await getToken();
    return await getAlbums(token);
  }

  /**
   * 앨범 카드의 ARIA 레이블을 생성합니다.
   * 부모 클래스의 getCardAriaLabel 메서드를 오버라이드합니다.
   * @param {Object} album - 앨범 데이터
   * @returns {string} ARIA 레이블
   */
  getCardAriaLabel(album) {
    return `${album.name}, ${album.artists.map(a => a.name).join(", ")}`;
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
