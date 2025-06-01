/**
 * 이벤트 처리 통합을 위한 유틸리티 모듈
 *
 * 이 모듈은 컴포넌트 간 이벤트 통신을 표준화하고
 * 이벤트 리스너 관리를 개선하기 위한 유틸리티 함수들을 제공합니다.
 */

/**
 * 컴포넌트 이벤트 핸들러 설정
 * @param {string} component - 컴포넌트 이름 (예: 'button', 'link')
 * @param {Function} [callback] - 이벤트 발생 시 실행할 콜백 함수
 * @returns {Function} 이벤트 핸들러 제거 함수
 */
export function setupComponentEvents(component, callback) {
  if (typeof component !== 'string') {
    throw new Error('Component name must be a string');
  }

  const eventName = `${component}-click`;
  const eventHandler = (e) => {
    const target = e.detail?.originalEvent?.target || e.target;
    const eventData = {
      component,
      target,
      timestamp: new Date().toISOString(),
      ...e.detail
    };

    // 이벤트 로깅
    logEvent(eventName, eventData);

    // 콜백 함수가 제공된 경우 실행
    if (typeof callback === 'function') {
      callback(eventData);
    }

    // 전역 이벤트 버스로 이벤트 전파
    globalEventBus.emit(eventName, eventData);
  };

  // 이벤트 리스너 등록
  document.addEventListener(eventName, eventHandler);

  // 이벤트 리스너 제거 함수 반환
  return () => {
    document.removeEventListener(eventName, eventHandler);
  };
}
import { globalEventBus } from "/src/scripts/utils/state-manager.js";

/**
 * 표준화된 이벤트 이름 포맷
 * @param {string} component - 컴포넌트 이름
 * @param {string} action - 액션 이름
 * @returns {string} 포맷된 이벤트 이름
 */
export const formatEventName = (component, action) => `${component}:${action}`;

/**
 * 이벤트 관리를 위한 클래스
 * 자동 리스너 등록/해제 및 이벤트 관리를 제공합니다.
 */
export class EventManager {
  constructor() {
    this._listeners = new Map();
    this._globalSubscriptions = [];
  }

  /**
   * DOM 요소에 이벤트 리스너 등록
   * @param {HTMLElement} element - 이벤트를 등록할 DOM 요소
   * @param {string} eventType - 이벤트 유형 (click, mouseover 등)
   * @param {Function} handler - 이벤트 핸들러 함수
   * @param {Object} options - 이벤트 리스너 옵션
   */
  addListener(element, eventType, handler, options = {}) {
    if (!element) return;

    element.addEventListener(eventType, handler, options);

    // 리스너 추적을 위해 저장
    if (!this._listeners.has(element)) {
      this._listeners.set(element, []);
    }

    this._listeners.get(element).push({
      type: eventType,
      handler,
      options,
    });
  }

  /**
   * DOM 요소에서 특정 이벤트 리스너 제거
   * @param {HTMLElement} element - 이벤트를 제거할 DOM 요소
   * @param {string} eventType - 이벤트 유형
   * @param {Function} handler - 이벤트 핸들러 함수
   * @param {Object} options - 이벤트 리스너 옵션
   */
  removeListener(element, eventType, handler, options = {}) {
    if (!element || !this._listeners.has(element)) return;

    element.removeEventListener(eventType, handler, options);

    // 리스너 목록에서 제거
    const listeners = this._listeners.get(element);
    const index = listeners.findIndex(
      (listener) => listener.type === eventType && listener.handler === handler
    );

    if (index !== -1) {
      listeners.splice(index, 1);
    }

    // 요소에 리스너가 없으면 Map에서 제거
    if (listeners.length === 0) {
      this._listeners.delete(element);
    }
  }

  /**
   * 요소에 연결된 모든 이벤트 리스너 제거
   * @param {HTMLElement} element - 이벤트를 제거할 DOM 요소
   */
  removeAllListeners(element) {
    if (!element || !this._listeners.has(element)) return;

    const listeners = this._listeners.get(element);

    listeners.forEach(({ type, handler, options }) => {
      element.removeEventListener(type, handler, options);
    });

    this._listeners.delete(element);
  }

  /**
   * 글로벌 이벤트 버스에 이벤트 구독
   * @param {string} eventName - 구독할 이벤트 이름
   * @param {Function} callback - 이벤트 콜백 함수
   * @returns {Function} 구독 취소 함수
   */
  subscribe(eventName, callback) {
    const unsubscribe = globalEventBus.subscribe(eventName, callback);
    this._globalSubscriptions.push({ eventName, unsubscribe });
    return unsubscribe;
  }

  /**
   * 글로벌 이벤트 버스에 이벤트 발행
   * @param {string} eventName - 발행할 이벤트 이름
   * @param {any} data - 이벤트 데이터
   */
  publish(eventName, data) {
    // 이벤트 로깅 기능 적용
    if (EventLogger.isEnabled) {
      EventLogger.logEvent(eventName, data);
    }

    globalEventBus.publish(eventName, data);
  }

  /**
   * 특정 이벤트에 대한 모든 구독 취소
   * @param {string} eventName - 구독 취소할 이벤트 이름
   */
  unsubscribeEvent(eventName) {
    this._globalSubscriptions = this._globalSubscriptions.filter((sub) => {
      if (sub.eventName === eventName) {
        sub.unsubscribe();
        return false;
      }
      return true;
    });
  }

  /**
   * 모든 글로벌 이벤트 구독 취소
   */
  unsubscribeAll() {
    this._globalSubscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
    this._globalSubscriptions = [];
  }

  /**
   * 모든 이벤트 리스너 및 구독 정리
   * 컴포넌트 해제 시 호출해야 함
   */
  cleanup() {
    // DOM 이벤트 리스너 정리
    this._listeners.forEach((listeners, element) => {
      listeners.forEach(({ type, handler, options }) => {
        element.removeEventListener(type, handler, options);
      });
    });

    this._listeners.clear();

    // 글로벌 이벤트 구독 정리
    this.unsubscribeAll();
  }
}

/**
 * 이벤트 위임 설정
 * 부모 요소에 이벤트 리스너를 등록하여 여러 자식 요소의 이벤트를 처리
 * @param {HTMLElement} parentElement - 이벤트를 위임할 부모 요소
 * @param {string} selector - 이벤트를 처리할 자식 요소 선택자
 * @param {string} eventType - 이벤트 유형
 * @param {Function} handler - 이벤트 핸들러 함수
 * @param {Object} options - 이벤트 리스너 옵션
 * @returns {Function} 이벤트 리스너 제거 함수
 */
export const delegateEvent = (
  parentElement,
  selector,
  eventType,
  handler,
  options = {}
) => {
  if (!parentElement) return () => {};

  const delegatedHandler = (event) => {
    const targetElement = event.target.closest(selector);

    if (targetElement && parentElement.contains(targetElement)) {
      handler.call(targetElement, event, targetElement);
    }
  };

  parentElement.addEventListener(eventType, delegatedHandler, options);

  // 정리 함수 반환
  return () => {
    parentElement.removeEventListener(eventType, delegatedHandler, options);
  };
};

/**
 * 이벤트를 한 번만 발생시키는 디바운스 함수
 * @param {Function} callback - 실행할 콜백 함수
 * @param {number} delay - 지연 시간(ms)
 * @returns {Function} 디바운스된 함수
 */
export const debounce = (callback, delay = 300) => {
  let timeoutId;

  return (...args) => {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      callback.apply(this, args);
    }, delay);
  };
};

/**
 * 여러 번 호출되는 함수를 일정 주기로 제한하는 스로틀 함수
 * @param {Function} callback - 실행할 콜백 함수
 * @param {number} limit - 제한 시간(ms)
 * @returns {Function} 스로틀된 함수
 */
export const throttle = (callback, limit = 300) => {
  let waiting = false;

  return (...args) => {
    if (!waiting) {
      callback.apply(this, args);
      waiting = true;

      setTimeout(() => {
        waiting = false;
      }, limit);
    }
  };
};

/**
 * 이벤트 상수 정의
 * 컴포넌트 간 일관된 이벤트 이름 사용을 위한 상수
 */
export const EventTypes = {
  // 섹션 관련 이벤트
  SECTION: {
    MOUNTED: "section:mounted",
    UNMOUNTED: "section:unmounted",
    DATA_LOADED: "section:dataLoaded",
    RENDER_START: "section:renderStart",
    RENDER_COMPLETE: "section:renderComplete",
    RENDER_SKIPPED: "section:renderSkipped",
    EMPTY_STATE: "section:emptyState",
    ERROR: "section:error",
  },

  // 카드 관련 이벤트
  CARD: {
    CLICK: "card:click",
    HOVER_START: "card:hoverStart",
    HOVER_END: "card:hoverEnd",
    PLAY: "card:play",
    CREATE_START: "card:createStart",
    CREATE_COMPLETE: "card:createComplete",
  },

  // 플레이리스트 관련 이벤트
  PLAYLIST: {
    LOAD_START: "playlist:loadStart",
    LOAD_COMPLETE: "playlist:loadComplete",
    LOAD_ERROR: "playlist:loadError",
    CARD_CLICK: "playlist:cardClick",
    ITEM_SELECTED: "playlist:itemSelected",
  },

  // 아티스트 관련 이벤트
  ARTIST: {
    LOAD_START: "artist:loadStart",
    LOAD_COMPLETE: "artist:loadComplete",
    LOAD_ERROR: "artist:loadError",
    CARD_CLICK: "artist:cardClick",
    ARTIST_SELECTED: "artist:artistSelected",
  },

  // 앨범 관련 이벤트
  ALBUM: {
    LOAD_START: "album:loadStart",
    LOAD_COMPLETE: "album:loadComplete",
    LOAD_ERROR: "album:loadError",
    CARD_CLICK: "album:cardClick",
    ALBUM_SELECTED: "album:albumSelected",
  },

  // 앱 전역 이벤트
  APP: {
    INIT: "app:init",
    READY: "app:ready",
    ERROR: "app:error",
    THEME_CHANGE: "app:themeChange",
    UI_UPDATE: "app:uiUpdate",
    MODE_CHANGE: "app:modeChange",
  },

  // 사용자 상호작용 추적 이벤트
  ANALYTICS: {
    SECTION_VIEW: "analytics:sectionView",
    ITEM_CLICK: "analytics:itemClick",
    SCROLL: "analytics:scroll",
    INTERACTION: "analytics:interaction",
  },

  // 디버깅 관련 이벤트
  DEBUG: {
    LOG: "debug:log",
    WARN: "debug:warn",
    ERROR: "debug:error",
    INFO: "debug:info",
  },
};

/**
 * 이벤트 로깅 및 디버깅을 위한 유틸리티
 */
export const EventLogger = {
  isEnabled: false,
  eventHistory: [],
  maxHistorySize: 50,

  /**
   * 이벤트 로깅 활성화
   * @param {boolean} enabled 로깅 활성화 여부
   */
  enable(enabled = true) {
    this.isEnabled = enabled;
    if (enabled) {
      console.log("💬 이벤트 로깅 활성화");
    }
  },

  /**
   * 이벤트 기록
   * @param {string} eventName 이벤트 이름
   * @param {object} data 이벤트 데이터
   */
  logEvent(eventName, data) {
    if (!this.isEnabled) return;

    const eventInfo = {
      eventName,
      data,
      timestamp: new Date(),
    };

    // 기록 유지 개수 제한
    this.eventHistory.push(eventInfo);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // 콘솔에 로그 출력
    console.log(`💬 이벤트: ${eventName}`, data);

    // 디버깅 이벤트로 발행
    globalEventBus.publish(EventTypes.DEBUG.LOG, eventInfo);
  },

  /**
   * 기록된 이벤트 히스토리 조회
   * @returns {Array} 이벤트 히스토리 배열
   */
  getHistory() {
    return [...this.eventHistory];
  },

  /**
   * 특정 이벤트 검색
   * @param {string} eventNameFilter 검색할 이벤트 이름 패턴
   * @returns {Array} 필터링된 이벤트 배열
   */
  findEvents(eventNameFilter) {
    if (!this.isEnabled) return [];

    return this.eventHistory.filter((event) =>
      event.eventName.includes(eventNameFilter)
    );
  },

  /**
   * 이벤트 히스토리 초기화
   */
  clear() {
    this.eventHistory = [];
    console.log("💬 이벤트 히스토리 초기화");
  },

  /**
   * 특정 컴포넌트의 이벤트 로그 보기
   * @param {string} componentName 컴포넌트 이름(예: artist, album, playlist)
   * @returns {Array} 필터링된 이벤트 배열
   */
  logComponentEvents(componentName) {
    const events = this.findEvents(componentName);
    console.table(
      events.map((e) => ({
        event: e.eventName,
        time: e.timestamp.toLocaleTimeString(),
        data:
          JSON.stringify(e.data).substring(0, 50) +
          (JSON.stringify(e.data).length > 50 ? "..." : ""),
      }))
    );
    return events;
  },
};
