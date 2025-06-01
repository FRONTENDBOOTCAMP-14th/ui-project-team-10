/**
 * 아티스트 섹션 컴포넌트
 *
 * 이벤트 관리 및 상태 관리를 표준화한 아티스트 섹션 컴포넌트입니다.
 * 접근성 기능:
 * - 키보드 탐색 지원 (Tab, Enter, Space, 화살표 키)
 * - ARIA 속성 및 역할 추가
 * - 스크린 리더 호환성 개선
 * - 고대비 모드 지원
 *
 * 반응형 기능:
 * - 표준화된 브레이크포인트를 활용한 다양한 화면 크기 지원 (XS, S, M, LG, XL)
 * - 세션 헤더, 페이지네이션 버튼, 아티스트 카드 간격 자동 조정
 * - 터치 인터페이스 최적화
 * - 스크롤 동작 및 타이틀 포멧팅 개선
 * @element artist-section
 */

import { getToken, getArtists } from "/src/scripts/utils/spotify-api.js";
import "/src/scripts/component/artist-card.js";
import { BaseSection } from "/src/scripts/component/base-section.js";
import { BREAKPOINTS } from "/src/scripts/utils/responsive-utils.js";

class ArtistSection extends BaseSection {
  constructor() {
    super();
    this.sectionName = "artist";
    this.titleText = "아티스트";

    // 카드 생성 설정
    this.cardTagName = "artist-card";
    this.cardAttributeMap = {
      "artist-name": "name",
      "artist-popularity": "popularity",
      "artist-image": (item) => item.images[0]?.url || "default-artist.jpg",
    };

    this.render();
  }

  /**
   * 기본 이벤트 구독 외에 아티스트 섹션에 특화된 추가 이벤트 구독을 설정합니다.
   * 템플릿 메서드 패턴의 일부로 BaseSection의 setupAdditionalEventSubscriptions 메서드를 구현합니다.
   */
  setupAdditionalEventSubscriptions() {
    // 필요한 경우 아티스트 섹션 특화 이벤트 구독 추가
    // 현재 적용할 추가 이벤트 구독이 없음
  }

  /**
   * API에서 아티스트 데이터를 가져옵니다.
   * BaseSection의 getDataFromApi 메서드를 구현합니다.
   * @returns {Promise<Array>} API에서 가져온 아티스트 데이터 배열
   */
  async getDataFromApi() {
    const token = await getToken();
    return await getArtists(token);
  }

  /**
   * 아티스트 카드의 ARIA 레이블을 생성합니다.
   * 부모 클래스의 getCardAriaLabel 메서드를 오버라이드합니다.
   * @param {Object} artist - 아티스트 데이터
   * @returns {string} ARIA 레이블
   */
  getCardAriaLabel(artist) {
    return `아티스트: ${artist.name}`;
  }
}

/**
 * 접근성 및 반응형 관련 추가 스타일을 반환합니다.
 * 상위 클래스의 getComponentStyles를 확장합니다.
 * @returns {string} 컴포넌트 스타일 문자열
 */
ArtistSection.prototype.getComponentStyles = function () {
  // 기본 스타일(상위 클래스에서 정의된 경우 호출)
  const baseStyles =
    BaseSection.prototype.getComponentStyles &&
    typeof BaseSection.prototype.getComponentStyles === "function"
      ? BaseSection.prototype.getComponentStyles.call(this)
      : "";

  return `
    ${baseStyles}
    
    /* 아티스트 섹션 기본 스타일 */
    .artist-section {
      padding: 24px 32px;
      position: relative;
    }
    
    .artist-container {
      display: flex;
      gap: 20px;
      overflow-x: auto;
      scroll-behavior: smooth;
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* IE/Edge */
      padding: 8px 16px;
      margin: 0 -16px;
      -webkit-overflow-scrolling: touch; /* iOS 부드러운 스크롤 */
    }
    
    .artist-container::-webkit-scrollbar {
      display: none; /* Chrome, Safari, Opera */
    }
    
    /* 접근성: 키보드 포커스 스타일 */
    .artist-container artist-card:focus-visible {
      outline: 2px solid #1db954;
      outline-offset: 2px;
      border-radius: 4px;
      box-shadow: 0 0 0 4px rgba(29, 185, 84, 0.3);
      transform: scale(1.05);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      z-index: 1;
    }
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .section-title {
      font-size: 24px;
      font-weight: 700;
      margin: 0;
      color: #fff;
    }
    
    .scroll-buttons {
      display: flex;
      gap: 8px;
    }
    
    .scroll-button {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: rgba(0, 0, 0, 0.7);
      border: none;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background-color 0.2s, transform 0.2s;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
    
    .scroll-button:hover {
      background-color: #333;
      transform: scale(1.05);
    }
    
    .scroll-button:focus-visible {
      outline: 2px solid #1db954;
      outline-offset: 2px;
      box-shadow: 0 0 0 4px rgba(29, 185, 84, 0.3);
    }
    
    .scroll-button:active {
      transform: scale(0.95);
    }
    
    .scroll-button[disabled] {
      opacity: 0.3;
      cursor: not-allowed;
      transform: none;
    }
    
    /* 반응형 스타일: XS (800px 이하) - 모바일 */
    @media (max-width: ${BREAKPOINTS.xs}px) {
      .artist-section {
        padding: 12px 16px;
      }
      
      .artist-container {
        gap: 8px;
        margin: 0 -8px;
        padding: 4px 8px;
      }
      
      .section-title {
        font-size: 18px;
      }
      
      .scroll-button {
        width: 32px;
        height: 32px;
      }
      
      /* 터치 인터페이스 개선 */
      .artist-container {
        touch-action: pan-x; /* 터치 스크롤 최적화 */
      }
    }
    
    /* 반응형 스타일: S (801px - 850px) - 소형 태블릿 */
    @media (min-width: ${BREAKPOINTS.xs + 1}px) and (max-width: ${
    BREAKPOINTS.s
  }px) {
      .artist-section {
        padding: 16px 24px;
      }
      
      .artist-container {
        gap: 12px;
      }
      
      .section-title {
        font-size: 20px;
      }
      
      .scroll-button {
        width: 36px;
        height: 36px;
      }
    }
    
    /* 반응형 스타일: M (851px - 1078px) - 태블릿 및 소형 데스크톱 */
    @media (min-width: ${BREAKPOINTS.s + 1}px) and (max-width: ${
    BREAKPOINTS.m
  }px) {
      .artist-section {
        padding: 20px 28px;
      }
      
      .artist-container {
        gap: 16px;
      }
      
      .section-title {
        font-size: 22px;
      }
      
      .scroll-button {
        width: 38px;
        height: 38px;
      }
    }
    
    /* 반응형 스타일: LG (1079px - 1742px) - 데스크톱 */
    @media (min-width: ${BREAKPOINTS.m + 1}px) and (max-width: ${
    BREAKPOINTS.lg
  }px) {
      /* 기본 스타일이 이 브레이크포인트에 맞춵니다 */
    }
    
    /* 반응형 스타일: XL (1743px 이상) - 대형 디스플레이 */
    @media (min-width: ${BREAKPOINTS.lg + 1}px) {
      .artist-section {
        padding: 32px 40px;
      }
      
      .artist-container {
        gap: 24px;
        padding: 12px 20px;
        margin: 0 -20px;
      }
      
      .section-title {
        font-size: 28px;
      }
      
      .scroll-button {
        width: 44px;
        height: 44px;
      }
    }
    
    /* 접근성: 고대비 모드 지원 */
    @media (forced-colors: active) {
      .artist-container artist-card:focus-visible {
        outline: 3px solid Highlight;
        forced-color-adjust: none;
      }
      
      .artist-container artist-card {
        border: 1px solid ButtonText;
      }
      
      .artist-section .section-title {
        color: ButtonText;
      }
      
      .scroll-button {
        border: 1px solid ButtonText;
        background-color: ButtonFace;
        color: ButtonText;
      }
      
      .scroll-button[disabled] {
        opacity: 0.5;
      }
    }
  `;
};

customElements.define("artist-section", ArtistSection);
