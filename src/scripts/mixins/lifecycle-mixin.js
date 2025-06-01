/**
 * LifecycleMixin
 *
 * 컴포넌트 라이프사이클 관리를 위한 믹스인입니다.
 * 이벤트 구독 관리, 리소스 정리, 컴포넌트 마운트/언마운트 처리를 담당합니다.
 *
 * @mixin
 */

import { globalEventBus } from "/src/scripts/utils/state-manager.js";

export const LifecycleMixin = (Base) =>
  class extends Base {
    constructor() {
      super();
      this._subscriptions = [];
      this._isInitialized = false;
      this._isConnected = false;
      this._mountTime = null;
    }

    /**
     * 컴포넌트가 DOM에 연결될 때 호출됩니다.
     */
    connectedCallback() {
      if (super.connectedCallback) {
        super.connectedCallback();
      }

      // 이미 연결된 경우 중복 실행 방지
      if (this._isConnected) return;
      this._isConnected = true;
      this._mountTime = new Date();

      // 이벤트 발행: 섹션 마운트 시작
      this.eventManager.publish(`${this.sectionName}:mountStart`, {
        timestamp: this._mountTime,
      });

      // 기본 이벤트 구독 설정
      this.setupEventSubscriptions();

      // 이벤트 발행: 섹션 마운트 완료
      this.eventManager.publish(`${this.sectionName}:mounted`, {
        sectionName: this.sectionName,
        component: this,
        mountDuration: new Date() - this._mountTime,
        timestamp: new Date(),
      });
    }

    /**
     * 컴포넌트가 DOM에서 제거될 때 호출됩니다.
     */
    disconnectedCallback() {
      if (super.disconnectedCallback) {
        super.disconnectedCallback();
      }

      // 이미 연결 해제된 경우 중복 실행 방지
      if (!this._isConnected) return;
      this._isConnected = false;

      // 이벤트 발행: 섹션 언마운트 시작
      this.eventManager.publish(`${this.sectionName}:unmountStart`, {
        timestamp: new Date(),
      });

      // 모든 이벤트 구독 해제
      this.unsubscribeAll();

      // 이벤트 발행: 섹션 언마운트 완료
      this.eventManager.publish(`${this.sectionName}:unmounted`, {
        sectionName: this.sectionName,
        timestamp: new Date(),
      });
    }

    /**
     * 이벤트 구독 설정
     * 섹션 컴포넌트가 처리해야 하는 기본 이벤트를 구독합니다.
     * 공통 이벤트 구독 및 자식 클래스 확장을 위한 템플릿 메서드 패턴 사용
     */
    setupEventSubscriptions() {
      // 애플리케이션 전역 이벤트 구독
      this.subscribe(globalEventBus, "themeChange", (data) => {
        // 테마 변경 시 필요한 처리
        console.log(`${this.sectionName} 섹션: 테마 변경 처리`, data);
      });

      // 카드 클릭 이벤트 구독
      this.subscribe(
        this.eventManager,
        `${this.sectionName}:cardClick`,
        (data) => {
          if (data && data.url) {
            this.eventManager.publish(
              `${this.sectionName}:${this.sectionName}Selected`,
              {
                id: data.id,
                name: data.name,
                ...(data.artists && { artists: data.artists }),
                url: data.url,
                timestamp: new Date(),
                interactionType: "mouse",
              }
            );

            // Spotify로 연결
            if (data.url) {
              window.open(data.url, "_blank", "noopener");
            }
          }
        }
      );

      // 키보드 활성화 이벤트 구독
      this.subscribe(
        this.eventManager,
        `${this.sectionName}:${this.sectionName}CardKeyboardActivation`,
        (data) => {
          if (data) {
            this.eventManager.publish(
              `${this.sectionName}:${this.sectionName}Selected`,
              {
                id: data.id,
                name: data.name,
                ...(data.artists && { artists: data.artists }),
                url: data.url,
                timestamp: new Date(),
                interactionType: "keyboard",
                activationKey: data.activationKey,
              }
            );
          }
        }
      );

      // 로딩 상태 관련 이벤트 구독
      this.subscribe(this.eventManager, `${this.sectionName}:loadStart`, () => {
        // 스크린 리더용 로딩 상태 알림
        const loadingContainer =
          this.shadowRoot.querySelector(".loading-container");
        if (loadingContainer) {
          loadingContainer.setAttribute("aria-busy", "true");
        }
      });

      this.subscribe(
        this.eventManager,
        `${this.sectionName}:loadSuccess`,
        () => {
          // 스크린 리더용 로딩 완료 알림
          const loadingContainer =
            this.shadowRoot.querySelector(".loading-container");
          if (loadingContainer) {
            loadingContainer.setAttribute("aria-busy", "false");
          }
        }
      );

      // 자식 클래스별 추가 이벤트 구독 설정 (템플릿 메서드 패턴)
      this.setupAdditionalEventSubscriptions();
    }

    /**
     * 자식 클래스에서 확장할 수 있는 추가 이벤트 구독 설정 메서드
     * 기본 구현은 아무것도 하지 않으며, 자식 클래스에서 필요에 따라 오버라이드합니다.
     */
    setupAdditionalEventSubscriptions() {
      // 기본 구현은 아무 작업도 수행하지 않음
      // 자식 클래스에서 필요한 추가 이벤트 구독 설정을 위해 오버라이드
    }

    /**
     * 이벤트 구독 추가 및 추적
     * @param {object} emitter - 이벤트 발행자 (eventManager 또는 다른 EventEmitter)
     * @param {string} eventName - 이벤트 이름
     * @param {Function} handler - 이벤트 핸들러 함수
     * @returns {object} 구독 객체 (해제를 위해 사용)
     */
    subscribe(emitter, eventName, handler) {
      if (!emitter || !eventName || !handler) {
        console.warn(`${this.sectionName}: 유효하지 않은 구독 시도`, {
          emitter,
          eventName,
        });
        return null;
      }

      // 이벤트 구독
      const subscription = emitter.subscribe
        ? emitter.subscribe(eventName, handler)
        : { unsubscribe: () => emitter.unsubscribe(eventName, handler) };

      // 구독 목록에 추가
      this._subscriptions.push({
        emitter,
        eventName,
        handler,
        subscription,
      });

      return subscription;
    }

    /**
     * 특정 이벤트 구독 해제
     * @param {string} eventName - 해제할 이벤트 이름 (없으면 모든 이벤트)
     * @param {object} emitter - 이벤트 발행자 (없으면 모든 발행자)
     */
    unsubscribe(eventName = null, emitter = null) {
      // 조건에 맞는 구독 필터링
      const subscriptionsToRemove = this._subscriptions.filter((sub) => {
        return (
          (!eventName || sub.eventName === eventName) &&
          (!emitter || sub.emitter === emitter)
        );
      });

      // 해당 구독 해제
      subscriptionsToRemove.forEach((sub) => {
        if (
          sub.subscription &&
          typeof sub.subscription.unsubscribe === "function"
        ) {
          sub.subscription.unsubscribe();
        } else if (
          sub.emitter &&
          typeof sub.emitter.unsubscribe === "function"
        ) {
          sub.emitter.unsubscribe(sub.eventName, sub.handler);
        }
      });

      // 구독 목록에서 제거
      this._subscriptions = this._subscriptions.filter((sub) => {
        return !subscriptionsToRemove.includes(sub);
      });
    }

    /**
     * 모든 이벤트 구독 해제
     */
    unsubscribeAll() {
      // 모든 구독 해제
      this._subscriptions.forEach((sub) => {
        if (
          sub.subscription &&
          typeof sub.subscription.unsubscribe === "function"
        ) {
          sub.subscription.unsubscribe();
        } else if (
          sub.emitter &&
          typeof sub.emitter.unsubscribe === "function"
        ) {
          sub.emitter.unsubscribe(sub.eventName, sub.handler);
        }
      });

      // 구독 목록 초기화
      this._subscriptions = [];
    }

    /**
     * 컴포넌트 초기화 및 데이터 로딩
     */
    async init() {
      // 이미 초기화된 경우 중복 실행 방지
      if (this._isInitialized) return;

      try {
        // 초기화 시작 이벤트 발행
        this.eventManager.publish(`${this.sectionName}:initStart`, {
          timestamp: new Date(),
        });

        // 로딩 상태 설정
        this.stateManager.update({
          isLoading: true,
          hasError: false,
          errorMessage: "",
        });

        // 데이터 가져오기
        const items = await this.loadData();

        // 초기화 완료 표시
        this._isInitialized = true;

        // items 업데이트 및 로딩 완료 상태 설정
        this.stateManager.update({
          items: items || [],
          isLoading: false,
        });

        // 초기화 완료 이벤트 발행
        this.eventManager.publish(`${this.sectionName}:initialized`, {
          success: true,
          itemCount: items?.length || 0,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error(
          `${this.sectionName} 데이터를 불러오는 데 실패했습니다:`,
          error
        );

        // 에러 상태 설정
        this.stateManager.update({
          isLoading: false,
          hasError: true,
          errorMessage:
            error.message ||
            `${this.sectionName} 데이터를 불러오지 못했습니다.`,
        });

        // 초기화 실패 이벤트 발행
        this.eventManager.publish(`${this.sectionName}:initError`, {
          error: error.message,
          timestamp: new Date(),
        });
      }
    }

    /**
     * 데이터 로드 메서드의 기본 구현
     * 자식 클래스에서 오버라이드할 수 있으며, 이 기본 구현은 getDataFromApi 메서드를 사용합니다.
     * @returns {Promise<Array>} 로드된 아이템 배열
     */
    async loadData() {
      try {
        // 이벤트 발행: 로드 시작
        this.eventManager.publish(`${this.sectionName}:loadStart`, {
          timestamp: new Date(),
        });

        // getDataFromApi 메서드는 자식 클래스에서 구현해야 함
        const items = await this.getDataFromApi();

        // 이벤트 발행: 로드 성공
        this.eventManager.publish(`${this.sectionName}:loadSuccess`, {
          itemCount: items.length,
          timestamp: new Date(),
        });

        return items;
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
     * 컴포넌트 성능 정보 수집
     * @returns {Object} 성능 데이터
     */
    getPerformanceData() {
      return {
        sectionName: this.sectionName,
        mountTime: this._mountTime,
        isInitialized: this._isInitialized,
        isConnected: this._isConnected,
        subscriptionCount: this._subscriptions.length,
        itemCount: this.stateManager?.state?.items?.length || 0,
        hasError: this.stateManager?.state?.hasError || false,
        timestamp: new Date(),
      };
    }
  };
