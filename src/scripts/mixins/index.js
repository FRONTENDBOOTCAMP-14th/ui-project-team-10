/**
 * Mixins Index
 *
 * 모든 믹스인을 한 곳에서 내보내는 진입점 파일입니다.
 * 여러 믹스인을 한번에 적용하는 헬퍼 함수도 제공합니다.
 */

import { AccessibilityMixin } from "./accessibility-mixin.js";
import { LifecycleMixin } from "./lifecycle-mixin.js";
import { RenderingMixin } from "./rendering-mixin.js";
import { ScrollableMixin } from "./scrollable-mixin.js";

// 모든 믹스인 내보내기
export { AccessibilityMixin, LifecycleMixin, RenderingMixin, ScrollableMixin };

/**
 * 모든 믹스인을 기본 클래스에 적용하는 함수
 * @param {Class} BaseClass - 믹스인을 적용할 기본 클래스
 * @returns {Class} 모든 믹스인이 적용된 클래스
 */
export function applyAllMixins(BaseClass) {
  return AccessibilityMixin(
    LifecycleMixin(RenderingMixin(ScrollableMixin(BaseClass)))
  );
}

/**
 * 선택한 믹스인들을 기본 클래스에 적용하는 함수
 * @param {Class} BaseClass - 믹스인을 적용할 기본 클래스
 * @param {Array<Function>} mixins - 적용할 믹스인 함수 배열
 * @returns {Class} 선택한 믹스인들이 적용된 클래스
 */
export function applyMixins(BaseClass, mixins = []) {
  return mixins.reduce((result, mixin) => mixin(result), BaseClass);
}
