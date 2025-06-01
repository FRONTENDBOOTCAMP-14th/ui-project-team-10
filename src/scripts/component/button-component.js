/**
 * Custom button web component
 * Reusable button with various styles, sizes, and options
 *
 * 접근성 기능:
 * - 키보드 탐색 지원 (Tab, Enter, Space)
 * - ARIA 속성 및 역할
 * - 스크린 리더 호환성
 * - 높은 대비 모드 지원
 * - 포커스 관리
 */
import { sharedIconMap } from "/src/scripts/utils/shared-component-styles.js";
import {
  EventManager,
  formatEventName,
} from "/src/scripts/utils/event-utils.js";

class ButtonComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.eventManager = new EventManager();
  }

  static get observedAttributes() {
    return [
      "variant",
      "size",
      "rounded",
      "icon",
      "icon-position",
      "disabled",
      "color",
      "type",
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  connectedCallback() {
    this.render();
    this.addEventListeners();
  }

  disconnectedCallback() {
    this.eventManager.cleanup();
  }

  addEventListeners() {
    const button = this.shadowRoot.querySelector("button");
    if (button) {
      // EventManager를 사용하여 클릭 이벤트 등록
      this.eventManager.addListener(
        button,
        "click",
        this.handleClick.bind(this)
      );

      // 키보드 접근성 개선을 위한 이벤트 등록
      this.eventManager.addListener(button, "keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.handleClick(e);
        }
      });

      // 터치 디바이스 지원 강화
      if ("ontouchstart" in window) {
        const boundHandleClick = this.handleClick.bind(this);
        const throttledTouchHandler = (e) => {
          e.preventDefault();
          boundHandleClick(e);
        };
        this.eventManager.addListener(
          button,
          "touchstart",
          throttledTouchHandler,
          { passive: true }
        );
      }
    }
  }

  handleClick(e) {
    if (!this.disabled) {
      // 표준화된 이벤트 이름 생성
      const eventName = formatEventName("button", "click");
      const eventData = {
        component: "button-component",
        variant: this.variant,
        size: this.size,
        disabled: this.disabled,
        originalEvent: e,
        timestamp: new Date().toISOString(),
      };

      // 1. 기존 호환성을 위한 이벤트 발생
      this.dispatchEvent(
        new CustomEvent("button-click", {
          bubbles: true,
          composed: true,
          detail: eventData,
        })
      );

      // 2. 이벤트 매니저를 통한 표준화된 이벤트 발행
      this.eventManager.publish(eventName, eventData);
    }
  }

  get variant() {
    return this.getAttribute("variant") || "default";
  }

  get color() {
    return this.getAttribute("color") || "";
  }

  get type() {
    return this.getAttribute("type") || "button";
  }

  get size() {
    return this.getAttribute("size") || "medium";
  }

  get rounded() {
    return this.hasAttribute("rounded");
  }

  get icon() {
    return this.getAttribute("icon") || "";
  }

  get iconPosition() {
    return this.getAttribute("icon-position") || "left";
  }

  get disabled() {
    return this.hasAttribute("disabled");
  }

  getIconHTML() {
    if (!this.icon) return "";

    let svg = sharedIconMap[this.icon] || this.icon;

    svg = svg.replace(/\s+width="\d+"\s+/g, " ");
    svg = svg.replace(/\s+height="\d+"\s+/g, " ");

    return svg;
  }

  getButtonContent() {
    const iconHTML = this.getIconHTML();
    const hasContent = this.textContent.trim().length > 0;

    if (!hasContent && iconHTML) {
      return iconHTML;
    }

    return this.iconPosition === "left"
      ? `${iconHTML}<span class="btn-text"><slot></slot></span>`
      : `<span class="btn-text"><slot></slot></span>${iconHTML}`;
  }

  getButtonClasses() {
    return [
      "btn",
      `btn-${this.variant}`,
      `size-${this.size}`,
      this.rounded ? "btn-rounded" : "",
      this.icon ? "with-icon" : "",
      `icon-${this.iconPosition}`,
      this.disabled ? "disabled" : "",
      this.color ? `bg-${this.color}` : "",
      this.rounded && this.icon && !this.textContent.trim() ? "icon-btn" : "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  getStyles() {
    return `
      :host {
        display: inline-block;
      }
      
      button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-xs, 8px);
        font-family: var(--font-family, 'Circular Std', sans-serif);
        font-weight: var(--font-weight-bolder, 700);
        text-align: center;
        vertical-align: middle;
        border: none;
        cursor: pointer;
        transition: var(--button-transition, all 0.3s ease-in-out);
        border-radius: var(--border-radius-md, 8px);
        padding-left: var(--spacing-xs);
        padding-right: var(--spacing-xs);
        white-space: nowrap;
        background-color: var(--button-bg-color, #1f1f1f);
        color: var(--font-color, #b3b3b3);
      }
      
      /* Button variants */
      .btn-default {
        background-color: var(--button-bg-color, #1f1f1f);
        color: var(--font-color, #b3b3b3);
      }
      
      .btn-primary {
        background-color: var(--spotify-green, #1ED760);
        color: var(--spotify-black, #121212);
      }
      
      .btn-secondary {
        background-color: var(--spotify-white, #FFFFFF);
        color: var(--spotify-black, #121212);
      }
      
      .btn-transparent {
        background-color: transparent;
        color: var(--font-color, #b3b3b3);
      }
      
      .btn-outline {
        background-color: transparent;
        border: 1px solid var(--spotify-white, #FFFFFF);
        color: var(--spotify-white, #FFFFFF);
      }
      
      /* Size variants */
      .size-small {
        height: calc(var(--button-size, 48px) * 0.6); /* 28px */
        min-width: calc(var(--button-size, 48px) * 1.5); /* 72px */
        font-size: var(--font-size-small, 0.8rem);
        padding: 0 var(--spacing-xs, 8px);
      }
      
      .size-medium {
        height: calc(var(--button-size, 48px) * 0.83); /* 40px */
        min-width: calc(var(--button-size, 48px) * 2); /* 96px */
        font-size: var(--font-size-base, 1rem);
        padding: 0 var(--spacing-sm, 16px);
      }
      
      .size-large {
        height: var(--button-size, 48px);
        min-width: calc(var(--button-size, 48px) * 2.5); /* 120px */
        font-size: calc(var(--font-size-base, 1rem) * 1.1);
        padding: 0 var(--spacing-md, 24px);
      }
      
      /* Rounded variant */
      .btn-rounded {
        border-radius: var(--button-border-radius, 500px);
      }
      
      /* Hover effects */
      .btn:hover:not(:disabled) {
        filter: brightness(1.1);
      }

      .btn:active:not(:disabled) {
        transform: scale(0.98);
      }
      
      .btn-primary:hover:not(.disabled) {
        background-color: #1FDF64;
        transform: scale(1.02);
      }
      
      .btn-secondary:hover:not(.disabled) {
        background-color: #F6F6F6;
        transform: scale(1.02);
      }
      
      .btn-outline:hover:not(.disabled) {
        color: var(--spotify-white, #FFFFFF);
        transform: scale(1.02);
      }
      
      /* Icon styles */
      .with-icon {
        padding: 0;
      }
      
      .with-icon svg {
        width: var(--svg-size, 24px);
        height: var(--svg-size, 24px);
        fill: currentColor;
      }
      
      /* Size adjustments for SVG icons based on button size */
      .size-small svg {
        width: calc(var(--button-size, 48px) * 0.35);
        height: calc(var(--button-size, 48px) * 0.35);
      }
      
      .size-medium svg {
        width: calc(var(--button-size, 48px) * 0.45);
        height: calc(var(--button-size, 48px) * 0.45);
      }
      
      .size-large svg {
        width: calc(var(--button-size, 48px) * 0.5);
        height: calc(var(--button-size, 48px) * 0.5);
      }
      
      /* Button with only icon */
      .with-icon:not(:has(.btn-text:not(:empty))) {
        padding: 0;
        aspect-ratio: 1;
        justify-content: center;
        min-width: unset;
      }

      /* Size adjustments for icon-only buttons */
      .with-icon.size-small:not(:has(.btn-text:not(:empty))) {
        width: calc(var(--button-size, 48px) * 0.6); /* 28px */
      }
      
      .with-icon.size-medium:not(:has(.btn-text:not(:empty))) {
        width: calc(var(--button-size, 48px) * 0.83); /* 40px */
      }
      
      .with-icon.size-large:not(:has(.btn-text:not(:empty))) {
        width: var(--button-size, 48px);
      }
      
      /* Icon-only rounded button (fully circular) */
      .icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border-radius: 50% !important;
        transition: all 0.2s ease;
      }
      
      /* Size adjustments for rounded icon buttons */
      .icon-btn.size-small {
        width: calc(var(--button-size, 48px) * 0.6) !important;
        height: calc(var(--button-size, 48px) * 0.6) !important;
      }
      
      .icon-btn.size-medium {
        width: calc(var(--button-size, 48px) * 0.83) !important;
        height: calc(var(--button-size, 48px) * 0.83) !important;
      }
      
      .icon-btn.size-large {
        width: var(--button-size, 48px) !important;
        height: var(--button-size, 48px) !important;
      }
      
      /* Background color variants */
      .bg-green {
        background-color: var(--spotify-green, #1ED760);
        color: var(--spotify-black, #121212);
      }
      
      .bg-blue {
        background-color: var(--spotify-blue, #1d75de);
        color: var(--spotify-white, #FFFFFF);
      }
      
      .bg-black {
        background-color: var(--spotify-black, #121212);
        color: var(--spotify-white, #FFFFFF);
      }
      
      /* Hover effects for color variants */
      .bg-green:hover:not(.disabled) {
        background-color: #1FDF64;
        transform: scale(1.04);
      }
      
      .bg-blue:hover:not(.disabled) {
        background-color: #1a68c6;
        transform: scale(1.04);
      }
      
      .bg-black:hover:not(.disabled) {
        background-color: #2a2a2a;
        transform: scale(1.04);
      }
      
      /* Disabled state */
      .disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      /* 접근성: 키보드 포커스 시각적 표시 */
      .btn:focus {
        outline: 2px solid #1db954;
        outline-offset: 2px;
      }
      
      /* 접근성: 높은 대비 모드 지원 */
      @media (forced-colors: active) {
        .btn {
          border: 1px solid ButtonText;
        }
        .btn:focus {
          outline: 2px solid Highlight;
        }
        .disabled {
          opacity: 1;
          color: GrayText;
          border-color: GrayText;
        }
        .btn-primary {
          background-color: Highlight;
          color: HighlightText;
        }
        .btn-secondary {
          background-color: ButtonFace;
          color: ButtonText;
        }
      }
      
      /* Reset for possible nested interactive elements */
      .btn-text {
        display: inline-block;
      }
    `;
  }

  render() {
    const buttonClasses = this.getButtonClasses();
    const content = this.getButtonContent();
    const ariaLabel =
      this.getAttribute("aria-label") || this.textContent || "Button";
    const ariaPressed = this.hasAttribute("aria-pressed")
      ? this.getAttribute("aria-pressed")
      : null;
    const ariaExpanded = this.hasAttribute("aria-expanded")
      ? this.getAttribute("aria-expanded")
      : null;
    const ariaControls = this.getAttribute("aria-controls") || null;

    // 접근성 속성 구성
    let ariaAttributes = `
      aria-label="${ariaLabel}"
      ${this.disabled ? 'aria-disabled="true"' : ""}
    `;

    // 조건부 ARIA 속성 추가
    if (ariaPressed) ariaAttributes += ` aria-pressed="${ariaPressed}"`;
    if (ariaExpanded) ariaAttributes += ` aria-expanded="${ariaExpanded}"`;
    if (ariaControls) ariaAttributes += ` aria-controls="${ariaControls}"`;

    this.shadowRoot.innerHTML = `
      <style>${this.getStyles()}</style>
      <button 
        part="button"
        class="btn ${this.getButtonClasses()}"
        type="${this.type || "button"}"
        ?disabled="${this.disabled}"
        aria-disabled="${this.disabled}"
        tabindex="${this.disabled ? -1 : 0}"
      >
        ${content}
      </button>
    `;
  }
}

// 커스텀 요소 정의
customElements.define("button-component", ButtonComponent);
