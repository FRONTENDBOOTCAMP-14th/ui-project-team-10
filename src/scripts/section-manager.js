/**
 * 섹션 관리 통합 모듈
 *
 * 아티스트, 앨범, 플레이리스트 등 각 섹션의 공통 기능을 제공하는 클래스입니다.
 * 중복 코드를 제거하고 일관된 방식으로 섹션을 관리합니다.
 */

// Spotify API 유틸리티 가져오기
import {
  getToken,
  toggleScrollButtons,
} from "/src/scripts/utils/spotify-api.js";

// 이벤트 관련 유틸리티 가져오기
import {
  EventManager,
  formatEventName,
} from "/src/scripts/utils/event-utils.js";

/**
 * 섹션 관리 클래스
 * 모든 유형의 섹션(앨범, 아티스트, 플레이리스트)에 대한 공통 기능 제공
 */
export class SectionManager {
  /**
   * 섹션 관리자 생성자
   * @param {string} type - 섹션 유형 ('album', 'artist', 'playlist')
   * @param {Object} options - 추가 옵션
   * @param {Function} options.dataLoader - 데이터 로드 함수 (기본값: null)
   * @param {Function} options.renderer - 렌더링 함수 (기본값: null)
   */
  constructor(type, options = {}) {
    if (!type) {
      throw new Error("섹션 유형은 필수입니다.");
    }

    this.type = type; // 'album', 'artist', 'playlist'
    this.elements = {};
    this.eventManager = new EventManager();
    this.options = {
      dataLoader: null, // 데이터 로드 함수
      renderer: null, // 렌더링 함수
      ...options,
    };

    // 이벤트 핸들러 바인딩
    this.handleScroll = this.handleScroll.bind(this);
    this.handleShowAllToggle = this.handleShowAllToggle.bind(this);

    // 표준화된 이벤트 핸들러 바인딩
    this.handleStandardizedItemClick =
      this.handleStandardizedItemClick.bind(this);
    this.handleLegacyItemClick = this.handleLegacyItemClick.bind(this);
  }

  /**
   * 섹션 초기화
   * 데이터 로드, DOM 요소 캐시, 이벤트 설정을 수행합니다.
   * @async
   * @returns {Promise<void>}
   */
  async init() {
    try {
      // 토큰 및 데이터 가져오기
      const token = await getToken();
      const data = this.options.dataLoader
        ? await this.options.dataLoader(token)
        : null;

      // 데이터 렌더링
      if (data && this.options.renderer) {
        this.options.renderer(data);
      }

      // DOM 요소 캐시
      this.cacheElements();

      // 이벤트 리스너 설정
      this.setupEventListeners();

      console.log(`${this.type} 섹션 초기화 완료`);
    } catch (e) {
      console.error(`${this.type} 데이터를 불러오는 데 실패했습니다.`, e);
      this.showErrorMessage();
    }
  }

  /**
   * DOM 요소를 캐시합니다.
   */
  cacheElements() {
    // 리스트 요소
    this.elements.list = document.querySelector(`.${this.type}-list`);

    // Show All 버튼
    this.elements.showAllBtn = document.querySelector(`.${this.type}-show-all`);

    // 스크롤 버튼
    this.elements.scrollLeftBtn = document.querySelector(
      `.${this.type}-scroll-btn-left`
    );
    this.elements.scrollRightBtn = document.querySelector(
      `.${this.type}-scroll-btn-right`
    );
  }

  /**
   * 에러 메시지 표시
   */
  showErrorMessage() {
    const container = document.querySelector(`.${this.type}-list`);
    if (container) {
      container.innerHTML = `<li>${this.type} 정보를 불러오지 못했습니다.</li>`;
    }
  }

  /**
   * 스크롤 이벤트 핸들러
   * @param {boolean} toEnd - 오른쪽 끝으로 스크롤할지 여부
   */
  handleScroll(toEnd) {
    if (!this.elements.list) return;

    this.elements.list.scrollTo({
      left: toEnd ? this.elements.list.scrollWidth : 0,
      behavior: "smooth",
    });
  }

  /**
   * Show All 토글 핸들러
   */
  handleShowAllToggle() {
    if (!this.elements.list || !this.elements.showAllBtn) return;

    const isGrid = this.elements.list.classList.toggle("grid-mode");
    this.elements.showAllBtn.textContent = isGrid ? "Hide" : "Show All";
    toggleScrollButtons(this.type, !isGrid);
  }

  /**
   * 이벤트 리스너를 설정하는 함수
   */
  setupEventListeners() {
    // 왼쪽 스크롤 버튼
    if (this.elements.scrollLeftBtn) {
      this.eventManager.addListener(this.elements.scrollLeftBtn, "click", () =>
        this.handleScroll(false)
      );
    }

    // 오른쪽 스크롤 버튼
    if (this.elements.scrollRightBtn) {
      this.eventManager.addListener(this.elements.scrollRightBtn, "click", () =>
        this.handleScroll(true)
      );
    }

    // Show all 버튼 토글 이벤트 리스너
    if (this.elements.showAllBtn) {
      this.eventManager.addListener(
        this.elements.showAllBtn,
        "click",
        this.handleShowAllToggle
      );
    }

    // 표준화된 이벤트 구독 설정
    this.setupStandardizedEvents();
  }

  /**
   * 표준화된 이벤트를 구독하는 함수
   */
  setupStandardizedEvents() {
    // 기존 legacy 이벤트 구독 (호환성을 위해 유지)
    document.addEventListener(`${this.type}-click`, this.handleLegacyItemClick);

    // 표준화된 이벤트 구독
    const clickEvent = formatEventName(this.type, "click");
    this.eventManager.subscribe(clickEvent, this.handleStandardizedItemClick);
  }

  /**
   * 기존 legacy 이벤트 핸들러
   * @param {CustomEvent} event 이벤트 객체
   */
  handleLegacyItemClick(event) {
    console.log(`Legacy ${this.type} click event:`, event.detail);
    // 하위 클래스에서 필요에 따라 오버라이드
  }

  /**
   * 표준화된 아이템 클릭 이벤트 핸들러
   * @param {Object} data 이벤트 데이터
   */
  handleStandardizedItemClick(data) {
    console.log(`Standardized ${this.type} click event:`, data);

    // 애널리틱스 추적이나 로깅을 위한 타임스탬프 활용
    const timestamp = data.timestamp || new Date().toISOString();
    console.log(`${this.type} clicked at ${timestamp}`);

    // 하위 클래스에서 필요에 따라 오버라이드
  }

  /**
   * 리소스 정리
   * 이벤트 리스너와 구독을 제거합니다.
   */
  cleanup() {
    // 기존 이벤트 리스너 제거
    document.removeEventListener(
      `${this.type}-click`,
      this.handleLegacyItemClick
    );

    // EventManager의 모든 리스너 제거
    this.eventManager.removeAllListeners();
    this.eventManager.unsubscribeAll();
  }
}

/**
 * 페이지 언로드 시 이벤트 정리를 위해 모든 섹션 관리자 인스턴스를 추적합니다.
 */
const sectionInstances = [];

/**
 * 섹션 관리자 인스턴스를 생성하고 반환합니다.
 * @param {string} type - 섹션 유형
 * @param {Object} options - 추가 옵션
 * @returns {SectionManager} 생성된 섹션 관리자 인스턴스
 */
export function createSection(type, options = {}) {
  const section = new SectionManager(type, options);
  sectionInstances.push(section);
  return section;
}

// 페이지 언로드 시 모든 섹션의 이벤트 정리
window.addEventListener("unload", () => {
  sectionInstances.forEach((section) => section.cleanup());
});
