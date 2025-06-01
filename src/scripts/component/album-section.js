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

import {
  getToken,
  getAlbums,
  albumIds,
} from "/src/scripts/utils/spotify-api.js";
import "/src/scripts/component/album-card.js";
import { BaseSection } from "/src/scripts/component/base-section.js";
import { BREAKPOINTS } from "/src/scripts/utils/responsive-utils.js";
import { EventTypes } from "/src/scripts/utils/event-utils.js";
import { StateManager } from "/src/scripts/utils/state-manager.js";

class AlbumSection extends BaseSection {
  constructor() {
    super({
      sectionName: "album",
      cardTagName: "album-card",
    });

    // 앨범 카드 속성 매핑 설정
    this.cardAttributeMap = {
      "album-title": "name",
      "album-artist": (album) => album.artists.map((a) => a.name).join(", "),
      "album-cover": (album) =>
        album.images[0]?.url || "/image/default-album-cover.png",
    };

    // 상태 캐싱을 위한 ID 설정
    this.stateId = "album-section";

    this.render();
  }

  async render() {
    super.render();
    console.log("AlbumSection: render method called");

    // 렌더링 완료 후 섹션 컨테이너의 높이 로깅
    setTimeout(() => {
      const sectionContainer = this.shadowRoot.querySelector(".album-section");
      if (sectionContainer) {
        console.log(
          "AlbumSection: Container height after render:",
          sectionContainer.offsetHeight,
          "px"
        );
      }

      const itemList = this.shadowRoot.querySelector(".album-list");
      if (itemList) {
        console.log(
          "AlbumSection: Item list children count:",
          itemList.children.length
        );
      }
    }, 500);
  }

  /**
   * 앨범 섹션 HTML 템플릿을 생성합니다.
   * @returns {string} 앨범 섹션 HTML 템플릿
   */
  getTemplate() {
    return `
      <div class="album-section" aria-labelledby="album-section-title">
        <div class="section-header">
          <h2 id="album-section-title" class="section-title">앨범</h2>
          <button class="show-all-button" aria-label="모든 앨범 보기">
            모두 보기
          </button>
        </div>
        <div class="section-content">
          <div class="scroll-container">
            <button class="scroll-button left" aria-label="왼쪽으로 스크롤">
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M15.54 21.15L5.095 12.23 15.54 3.31l.65.76-9.555 8.16 9.555 8.16z"></path>
              </svg>
            </button>
            <div class="album-container">
              <ul class="album-list" role="list" aria-label="앨범 목록"></ul>
            </div>
            <button class="scroll-button right" aria-label="오른쪽으로 스크롤">
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M8.46 21.15l-.65-.76 9.555-8.16L7.81 4.07l.65-.76 10.445 8.92z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
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
    try {
      // 앨범 데이터가 상태 관리자에 이미 존재하는지 확인
      const existingData = StateManager.getInstance().get("albums");
      if (
        existingData &&
        Array.isArray(existingData) &&
        existingData.length > 0
      ) {
        console.log("AlbumSection: Using existing album data from state");
        return existingData;
      }

      // 그렇지 않으면 API에서 가져오기
      console.log("AlbumSection: Fetching album data...");
      const token = await getToken();
      const data = await getAlbums(token, albumIds);
      console.log(
        "AlbumSection: Album data fetched:",
        data?.length || 0,
        "albums"
      );

      // 앨범 데이터를 상태 관리자에 저장하여 재사용
      if (data && Array.isArray(data)) {
        StateManager.getInstance().set("albums", data);
      }

      return data;
    } catch (error) {
      console.error("Error fetching album data:", error);
      throw error;
    }
  }

  /**
   * 앨범 카드의 ARIA 레이블을 생성합니다.
   * 부모 클래스의 getCardAriaLabel 메서드를 오버라이드합니다.
   * @param {Object} album - 앨범 데이터
   * @returns {string} ARIA 레이블
   */
  getCardAriaLabel(album) {
    return `${album.name}, ${album.artists.map((a) => a.name).join(", ")}`;
  }

  /**
   * 앨범 카드 요소를 생성합니다.
   * BaseSection의 createCardElement 메서드를 구현합니다.
   * @param {Object} album - 앨범 데이터 객체
   * @returns {HTMLElement} 생성된 앨범 카드 요소
   */
  createCardElement(album) {
    // album-card 컨테이너 요소 생성
    const card = document.createElement(this.cardTagName);

    // 카드 속성 설정
    // 사전 정의된 cardAttributeMap을 사용해 속성 매핑
    Object.entries(this.cardAttributeMap).forEach(([attrName, propValue]) => {
      const value =
        typeof propValue === "function" ? propValue(album) : album[propValue];

      if (value) card.setAttribute(attrName, value);
    });

    // 접근성 향상을 위한 ARIA 레이블 설정
    card.setAttribute("aria-label", this.getCardAriaLabel(album));

    // 키보드 탭 순서에 포함
    card.setAttribute("tabindex", "0");

    return card;
  }
}

/**
 * 접근성 및 반응형 스타일을 반환합니다.
 * 상위 클래스의 getComponentStyles를 확장합니다.
 * @returns {string} 컴포넌트 스타일 문자열
 */
AlbumSection.prototype.getStyles = function () {
  // 기본 스타일을 가져오고 섹션 특화 스타일 추가
  // super.getStyles()를 직접 호출할 수 없으므로 BaseSection의 메서드를 직접 호출
  const baseStyles = BaseSection.prototype.getStyles.call(this);

  return `
    ${baseStyles}
    
    /* 앨범 섹션 전용 스타일 */
    .album-section {
      position: relative;
      padding: 24px 36px;
      color: var(--spotify-white);
      min-height: 300px;
      background-color: var(--spotify-black);
      border-radius: var(--border-radius-md);
      margin-bottom: 24px;
    }
    
    .album-section .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .album-section .section-title {
      font-size: 24px;
      font-weight: bold;
      margin: 0;
    }
    
    .album-section .show-all-button {
      background-color: transparent;
      border: none;
      padding: 0;
      font-size: 16px;
      color: var(--spotify-white);
      cursor: pointer;
    }
    
    .album-section .show-all-button:hover {
      text-decoration: underline;
    }
    
    .album-section .scroll-container {
      position: relative;
      overflow-x: auto;
      overflow-y: hidden;
      scroll-behavior: smooth;
      scrollbar-width: thin;
      scrollbar-color: var(--spotify-dark-gray) var(--spotify-black);
    }
    
    .album-section .album-container {
      display: flex;
      gap: 24px;
      overflow-x: auto;
      overflow-y: hidden;
      scroll-behavior: smooth;
      scrollbar-width: thin;
      scrollbar-color: var(--spotify-dark-gray) var(--spotify-black);
      margin: 0 -16px;
      padding: 4px 16px 20px;
      /* 스크롤 버튼이 있는 경우를 대비한 패딩 */
      scroll-padding: 0 40px;
      position: relative;
      min-height: 250px;
    }
    
    .album-section .album-list {
      display: flex;
      gap: 24px;
      padding: 0;
      margin: 0;
      list-style: none;
    }
    
    .album-section .album-list .list-item {
      flex: 0 0 auto;
      width: 180px;
      min-height: 250px;
    }
    
    .album-section .scroll-button {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background-color: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      border: none;
      padding: 0;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      z-index: 1;
    }
    
    .album-section .scroll-button.left {
      left: 0;
    }
    
    .album-section .scroll-button.right {
      right: 0;
    }
    
    .album-section .scroll-button:hover, .album-section .scroll-button:focus-visible {
      background-color: rgba(29, 185, 84, 0.8);
      transform: scale(1.1);
    }
    
    .album-section .scroll-button:focus-visible {
      outline: 2px solid #1db954;
      outline-offset: 2px;
    }
    
    /* 접근성: 고대비 모드 지원 */
    @media (forced-colors: active) {
      .album-section {
        forced-color-adjust: none;
      }
      
      .album-section .section-title {
        color: ButtonText;
      }
      
      .album-section .show-all-button {
        color: ButtonText;
      }
      
      .album-section .scroll-button {
        border: 1px solid ButtonText;
        background-color: ButtonFace;
      }
      
      .album-section .scroll-button:hover, .album-section .scroll-button:focus-visible {
        background-color: Highlight;
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
      
      .album-section .album-container {
        gap: 8px;
        margin: 0 -8px;
        padding: 4px 8px;
      }
      
      .album-section .scroll-button {
        width: 32px;
        height: 32px;
        top: calc(50% - 16px);
      }
      
      .album-section .scroll-button.left {
        left: 4px;
      }
      
      .album-section .scroll-button.right {
        right: 4px;
      }
      
      /* 터치 화면에서 가로 스크롤 개선 */
      .album-section .album-container {
        touch-action: pan-x;
        -webkit-tap-highlight-color: transparent;
      }
      
      /* 모바일에서는 스크롤 버튼 숨김 */
      .album-section .scroll-button {
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
      
      .album-section .album-container {
        gap: 12px;
        margin: 0 -12px;
        padding: 4px 12px;
      }
      
      .album-section .scroll-button {
        width: 36px;
        height: 36px;
        top: calc(50% - 18px);
      }
      
      .album-section .scroll-button.left {
        left: 8px;
      }
      
      .album-section .scroll-button.right {
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
      
      .album-section .album-container {
        gap: 16px;
        margin: 0 -16px;
        padding: 4px 16px;
      }
      
      .album-section .scroll-button {
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
