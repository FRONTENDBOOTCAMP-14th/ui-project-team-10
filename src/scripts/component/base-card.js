/**
 * 기본 카드 컴포넌트
 *
 * 모든 카드 컴포넌트(아티스트, 앨범, 플레이리스트)의 공통 기능을 제공하는 베이스 클래스입니다.
 * 이 클래스는 직접 사용하기보다는 다른 카드 컴포넌트들이 상속받아 사용합니다.
 *
 * 접근성 기능:
 * - 키보드 탐색 지원 (Tab, Enter, Space)
 * - ARIA 속성 및 역할
 * - 스크린 리더 호환성
 * - 색상 대비 개선
 *
 * 반응형 기능:
 * - 다양한 화면 크기에 대한 최적화
 * - 터치 인터랙션 지원 개선
 * - 화면 너비에 따른 요소 크기 조정
 *
 * @class BaseCard
 * @extends HTMLElement
 */

import {
  EventManager,
  formatEventName,
  throttle,
} from "/src/scripts/utils/event-utils.js";
import { getCardBaseStyles } from "/src/scripts/utils/shared-component-styles.js";

export class BaseCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // EventManager 초기화
    this.eventManager = new EventManager();

    // 이벤트 핸들러 바인딩
    this.handleClick = this.handleClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleTouchStart = throttle(this.handleTouchStart.bind(this), 300);
  }

  /**
   * 컴포넌트가 DOM에 연결될 때 호출됩니다.
   */
  connectedCallback() {
    this.render();
    this.addEventListeners();
  }

  /**
   * 컴포넌트가 DOM에서 제거될 때 호출됩니다.
   * 이벤트 리스너를 정리하여 메모리 누수를 방지합니다.
   */
  disconnectedCallback() {
    // 모든 이벤트 리스너 제거
    this.eventManager.removeAllListeners();
  }

  /**
   * 컴포넌트의 관찰할 속성들을 정의합니다.
   * 이 메서드는 하위 클래스에서 오버라이드해야 합니다.
   * @returns {string[]} 관찰할 속성 배열
   */
  static get observedAttributes() {
    return [];
  }

  /**
   * 속성이 변경되면 다시 렌더링합니다.
   */
  attributeChangedCallback() {
    if (this.shadowRoot.innerHTML !== "") {
      this.render();
    }
  }

  /**
   * 이벤트 리스너를 추가합니다.
   * 이 메서드는 하위 클래스에서 필요에 따라 확장할 수 있습니다.
   */
  addEventListeners() {
    const card = this.shadowRoot.querySelector(".list-card");
    if (card) {
      // EventManager를 사용하여 이벤트 리스너 등록
      this.eventManager.addListener(card, "click", this.handleClick);

      // 키보드 접근성 지원
      this.eventManager.addListener(card, "keydown", this.handleKeyDown);

      // 터치 이벤트 지원 - 쓰롬틀링으로 성능 최적화
      this.eventManager.addListener(card, "touchstart", this.handleTouchStart);
    }
  }

  /**
   * 키보드 이벤트 핸들러
   * @param {KeyboardEvent} event - 키보드 이벤트
   */
  handleKeyDown(event) {
    // Enter 또는 Space 키를 누르면 클릭 이벤트와 동일하게 처리
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.handleClick(event);
    }
  }

  /**
   * 터치 이벤트 핸들러
   * @param {TouchEvent} event - 터치 이벤트
   */
  handleTouchStart(event) {
    // 터치 이벤트에 대한 추가 처리가 필요한 경우 여기서 구현
    // 기본적으로 클릭 이벤트와 동일한 기능 제공
    // 이 이벤트는 쓰롬틀링되어 있어 중복 발생 방지
  }

  /**
   * 클릭 이벤트 핸들러입니다.
   * 이 메서드는 하위 클래스에서 오버라이드해야 합니다.
   * @param {Event} event - 클릭 이벤트
   */
  handleClick(event) {
    // 기본 구현 - 일반적인 카드 클릭 이벤트 발생
    // 표준화된 이벤트 이름 생성
    const eventName = formatEventName("card", "click");

    // 기본 이벤트 데이터 구성
    const eventData = {
      component: this.tagName.toLowerCase(),
      timestamp: new Date().toISOString(),
      originalEvent: event,
      cardType: "base",
    };

    // 표준화된 이벤트 발행
    this.eventManager.publish(eventName, eventData);

    // 하위 클래스에서 오버라이드하여 추가 기능 구현 가능
  }

  /**
   * 컴포넌트를 렌더링합니다.
   * 이 메서드는 하위 클래스에서 오버라이드해야 합니다.
   */
  render() {
    // 기본 구현은 아무 작업도 수행하지 않습니다.
    // 하위 클래스에서 오버라이드하여 구현해야 합니다.
  }

  /**
   * 기본 카드 스타일을 반환합니다.
   * 공통 스타일 모듈에서 가져온 스타일을 사용합니다.
   * @returns {string} 카드의 기본 CSS 스타일
   */
  getBaseStyles() {
    return getCardBaseStyles();
  }
}
