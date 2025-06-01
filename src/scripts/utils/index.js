/**
 * Utils Index
 *
 * 모든 유틸리티 클래스와 함수를 한 곳에서 내보내는 진입점 파일입니다.
 * 다른 컴포넌트에서 쉽게 접근할 수 있도록 합니다.
 */

// 새로 추가된 유틸리티 클래스
import { UIStateHandler } from "./ui-state-handler.js";
import { ElementFactory } from "./element-factory.js";

// 기존 유틸리티 모듈
import { renderArtists, renderAlbums, renderPlaylists } from "./renderer.js";
import { StateManager, EventBus, globalEventBus } from "./state-manager.js";
import {
  EventManager,
  setupComponentEvents,
  formatEventName,
  EventLogger,
} from "./event-utils.js";

// 모든 유틸리티 클래스와 함수 내보내기
export {
  // UI 상태 및 요소 생성 유틸리티
  UIStateHandler,
  ElementFactory,

  // 렌더링 유틸리티
  renderArtists,
  renderAlbums,
  renderPlaylists,

  // 상태 관리 유틸리티
  StateManager,
  EventBus,
  globalEventBus,

  // 이벤트 관리 유틸리티
  EventManager,
  setupComponentEvents,
  formatEventName,
  EventLogger,
};
