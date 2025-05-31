/**
 * 컴포넌트 상태 관리를 위한 헬퍼 클래스
 * Proxy를 사용하여 상태 변경을 감지하고 자동으로 UI를 업데이트합니다.
 */
class StateManager {
  /**
   * StateManager 생성자
   * @param {Object} initialState - 초기 상태 객체
   * @param {Function} onChange - 상태 변경 시 호출될 콜백 함수
   */
  constructor(initialState = {}, onChange = null) {
    this._onChange = onChange;
    this._state = new Proxy(initialState, {
      set: (target, property, value) => {
        // 값이 변경되지 않았다면 불필요한 업데이트를 방지
        if (target[property] === value) {
          return true;
        }

        // 값 업데이트
        target[property] = value;

        // 변경 콜백 호출
        if (this._onChange) {
          this._onChange(property, value, target);
        }

        return true;
      },
    });
  }

  /**
   * 현재 상태 객체 반환
   * @returns {Object} 상태 객체
   */
  get state() {
    return this._state;
  }

  /**
   * 특정 상태 속성 값을 반환
   * @param {string} key - 상태 속성 키
   * @returns {any} 상태 값
   */
  get(key) {
    return this._state[key];
  }

  /**
   * 단일 상태 속성 값을 설정
   * @param {string} key - 상태 속성 키
   * @param {any} value - 설정할 값
   */
  set(key, value) {
    this._state[key] = value;
  }

  /**
   * 여러 상태 속성을 한 번에 업데이트
   * @param {Object} newState - 업데이트할 상태 객체
   */
  update(newState) {
    Object.entries(newState).forEach(([key, value]) => {
      this._state[key] = value;
    });
  }

  /**
   * 상태 변경 콜백 함수 변경
   * @param {Function} callback - 새로운 콜백 함수
   */
  setOnChange(callback) {
    this._onChange = callback;
  }
}

/**
 * 컴포넌트 간 통신을 위한 이벤트 버스
 * 컴포넌트 간의 느슨한 결합을 유지하면서 통신을 가능하게 합니다.
 */
class EventBus {
  constructor() {
    this.events = {};
  }

  /**
   * 이벤트 구독
   * @param {string} eventName - 이벤트 이름
   * @param {Function} callback - 이벤트 발생 시 호출될 콜백 함수
   */
  subscribe(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);

    // 구독 취소 함수 반환
    return () => {
      this.events[eventName] = this.events[eventName].filter(
        (eventCallback) => eventCallback !== callback
      );
    };
  }

  /**
   * 이벤트 발행
   * @param {string} eventName - 이벤트 이름
   * @param {any} data - 이벤트와 함께 전달할 데이터
   */
  publish(eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach((callback) => {
        callback(data);
      });
    }
  }
}

// 앱 전체에서 사용할 단일 이벤트 버스 인스턴스
const globalEventBus = new EventBus();

export { StateManager, EventBus, globalEventBus };
