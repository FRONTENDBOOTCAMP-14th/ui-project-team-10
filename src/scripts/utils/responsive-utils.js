/**
 * 반응형 디자인 유틸리티
 * 
 * 웹 컴포넌트에서 사용할 수 있는 반응형 미디어 쿼리 및 유틸리티 함수를 제공합니다.
 */

/**
 * 미디어 쿼리 브레이크포인트 정의
 * xs: 800px 이하 (모바일)
 * s: 801px - 850px (소형 태블릿)
 * m: 851px - 1078px (태블릿 및 소형 데스크톱)
 * lg: 1079px - 1742px (데스크톱)
 * xl: 1743px 이상 (대형 디스플레이)
 */
export const BREAKPOINTS = {
  xs: 800,
  s: 850,
  m: 1078,
  lg: 1742
};

/**
 * 현재 뷰포트 크기가 주어진 최대 너비 이하인지 확인합니다.
 * @param {number} maxWidth - 최대 너비 (픽셀)
 * @returns {boolean} 현재 뷰포트가 주어진 최대 너비 이하인 경우 true
 */
export function isMaxWidth(maxWidth) {
  return window.matchMedia(`(max-width: ${maxWidth}px)`).matches;
}

/**
 * 현재 뷰포트 크기가 주어진 최소 너비 이상인지 확인합니다.
 * @param {number} minWidth - 최소 너비 (픽셀)
 * @returns {boolean} 현재 뷰포트가 주어진 최소 너비 이상인 경우 true
 */
export function isMinWidth(minWidth) {
  return window.matchMedia(`(min-width: ${minWidth}px)`).matches;
}

/**
 * 현재 뷰포트 크기가 주어진 범위 내에 있는지 확인합니다.
 * @param {number} minWidth - 최소 너비 (픽셀)
 * @param {number} maxWidth - 최대 너비 (픽셀)
 * @returns {boolean} 현재 뷰포트가 주어진 범위 내에 있는 경우 true
 */
export function isWidthBetween(minWidth, maxWidth) {
  return window.matchMedia(`(min-width: ${minWidth}px) and (max-width: ${maxWidth}px)`).matches;
}

/**
 * 현재 뷰포트 크기에 해당하는 디바이스 타입을 반환합니다.
 * @returns {string} 디바이스 타입 ('mobile', 'small-tablet', 'tablet', 'desktop', 'large-desktop')
 */
export function getDeviceType() {
  if (isMaxWidth(BREAKPOINTS.xs)) {
    return 'mobile';
  } else if (isMaxWidth(BREAKPOINTS.s)) {
    return 'small-tablet';
  } else if (isMaxWidth(BREAKPOINTS.m)) {
    return 'tablet';
  } else if (isMaxWidth(BREAKPOINTS.lg)) {
    return 'desktop';
  } else {
    return 'large-desktop';
  }
}

/**
 * CSS에서 사용할 미디어 쿼리 문자열을 생성합니다.
 * @param {string} breakpoint - 브레이크포인트 이름 ('xs', 's', 'm', 'lg', 'xl')
 * @param {string} type - 미디어 쿼리 타입 ('max', 'min', 'only')
 * @returns {string} CSS 미디어 쿼리 문자열
 */
export function getMediaQueryString(breakpoint, type = 'max') {
  const bpValue = BREAKPOINTS[breakpoint];
  
  if (!bpValue) {
    console.error(`유효하지 않은 브레이크포인트: ${breakpoint}`);
    return '';
  }
  
  if (type === 'max') {
    return `@media (max-width: ${bpValue}px)`;
  } else if (type === 'min') {
    return `@media (min-width: ${bpValue + 1}px)`;
  } else if (type === 'only') {
    const nextBreakpoint = getNextBreakpoint(breakpoint);
    if (nextBreakpoint) {
      return `@media (min-width: ${bpValue + 1}px) and (max-width: ${BREAKPOINTS[nextBreakpoint]}px)`;
    } else {
      return `@media (min-width: ${bpValue + 1}px)`;
    }
  }
  
  return '';
}

/**
 * 주어진 브레이크포인트의 다음 브레이크포인트를 반환합니다.
 * @param {string} breakpoint - 현재 브레이크포인트 이름
 * @returns {string|null} 다음 브레이크포인트 이름 또는 null (마지막 브레이크포인트인 경우)
 */
function getNextBreakpoint(breakpoint) {
  const breakpoints = Object.keys(BREAKPOINTS);
  const currentIndex = breakpoints.indexOf(breakpoint);
  
  if (currentIndex === -1 || currentIndex === breakpoints.length - 1) {
    return null;
  }
  
  return breakpoints[currentIndex + 1];
}

/**
 * 주어진 브레이크포인트에 대한 미디어 쿼리 스타일 템플릿 문자열을 반환합니다.
 * @param {string} breakpoint - 브레이크포인트 이름 ('xs', 's', 'm', 'lg')
 * @param {string} cssContent - CSS 내용
 * @param {string} type - 미디어 쿼리 타입 ('max', 'min', 'only')
 * @returns {string} 미디어 쿼리 템플릿 문자열
 */
export function getResponsiveStyle(breakpoint, cssContent, type = 'max') {
  const mediaQuery = getMediaQueryString(breakpoint, type);
  return `${mediaQuery} {
    ${cssContent}
  }`;
}

/**
 * 장치 방향이 가로 모드인지 확인합니다.
 * @returns {boolean} 가로 모드인 경우 true
 */
export function isLandscape() {
  return window.matchMedia('(orientation: landscape)').matches;
}

/**
 * 장치 방향이 세로 모드인지 확인합니다.
 * @returns {boolean} 세로 모드인 경우 true
 */
export function isPortrait() {
  return window.matchMedia('(orientation: portrait)').matches;
}

/**
 * 반응형 컴포넌트의 속성을 지정된 뷰포트 크기에 맞게 업데이트합니다.
 * @param {HTMLElement} component - 업데이트할 웹 컴포넌트
 * @param {Function} updateCallback - 현재 디바이스 타입을 매개변수로 받는 콜백 함수
 */
export function setupResponsiveAttributes(component, updateCallback) {
  // 초기 설정
  updateCallback(getDeviceType());
  
  // 리사이즈 이벤트에서 속성 업데이트
  const resizeObserver = new ResizeObserver(() => {
    updateCallback(getDeviceType());
  });
  
  resizeObserver.observe(document.body);
  
  // 컴포넌트가 DOM에서 제거될 때 옵저버 해제
  component.addEventListener('disconnected', () => {
    resizeObserver.disconnect();
  });
}
