/**
 * Custom link web component
 * Reusable link with various styles, sizes, and options
 * Can be styled as a regular link or as a button
 *
 * 접근성 기능:
 * - 키보드 탐색 지원 (Tab, Enter, Space)
 * - ARIA 속성 및 역할
 * - 스크린 리더 호환성
 * - 높은 대비 모드 지원
 * - 포커스 관리
 */
import { sharedIconMap } from "/src/scripts/utils/shared-component-styles.js";

class LinkComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return [
      "href",
      "variant",
      "size",
      "rounded",
      "icon",
      "icon-position",
      "disabled",
      "button-style",
      "color",
      "target",
      "full-width",
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
    this.removeEventListeners();
  }

  addEventListeners() {
    const link = this.shadowRoot.querySelector("a");
    link.addEventListener("click", this.handleClick.bind(this));
    link.addEventListener("keydown", (event) => {
      // 링크에 대한 Enter 및 Space 키 지원 추가
      if ((event.key === "Enter" || event.key === " ") && !this.disabled) {
        event.preventDefault();
        this.handleClick(event);
      }
    });
  }

  removeEventListeners() {
    const link = this.shadowRoot.querySelector("a");
    if (link) {
      link.removeEventListener("click", this.handleClick.bind(this));
      link.removeEventListener("keydown", (event) => {
        // 링크에 대한 Enter 및 Space 키 지원 추가
        if ((event.key === "Enter" || event.key === " ") && !this.disabled) {
          event.preventDefault();
          this.handleClick(event);
        }
      });
    }
  }

  handleClick(e) {
    if (this.disabled) {
      e.preventDefault();
      return;
    }

    this.dispatchEvent(
      new CustomEvent("link-click", {
        bubbles: true,
        composed: true,
        detail: { originalEvent: e },
      })
    );
  }

  get href() {
    return this.getAttribute("href") || "#";
  }

  get variant() {
    return this.getAttribute("variant") || "default";
  }

  get color() {
    return this.getAttribute("color") || "";
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

  get fullWidth() {
    return this.hasAttribute("full-width");
  }

  get buttonStyle() {
    return this.hasAttribute("button-style");
  }

  get target() {
    return this.getAttribute("target") || "_self";
  }

  getIconHTML() {
    if (!this.icon) return "";

    let svg = sharedIconMap[this.icon] || this.icon;

    svg = svg.replace(/\s+width="\d+"\s+/g, " ");
    svg = svg.replace(/\s+height="\d+"\s+/g, " ");

    return svg;
  }

  getLinkContent() {
    const iconHTML = this.getIconHTML();
    const hasContent = this.textContent.trim().length > 0;

    if (!hasContent && iconHTML) {
      return iconHTML;
    }

    return this.iconPosition === "left"
      ? `${iconHTML}<span class="link-text"><slot></slot></span>`
      : `<span class="link-text"><slot></slot></span>${iconHTML}`;
  }

  getLinkClasses() {
    // Base classes that apply to both link and button styles
    const baseClasses = [
      this.icon ? "with-icon" : "",
      this.iconPosition === "right" ? "icon-right" : "",
      this.disabled ? "disabled" : "",
      this.color ? `bg-${this.color}` : "",
      this.fullWidth ? "full-width" : "",
    ];

    // Button-style specific classes
    if (this.buttonStyle) {
      return [
        "btn",
        `btn-${this.variant}`,
        `size-${this.size}`,
        this.rounded ? "btn-rounded" : "",
        this.rounded && this.icon && !this.textContent.trim() ? "icon-btn" : "",
        ...baseClasses,
      ]
        .filter(Boolean)
        .join(" ");
    }
    // Regular link style classes
    else {
      return [
        "link",
        `link-${this.variant}`,
        `size-${this.size}`,
        this.rounded ? "link-rounded" : "",
        this.rounded && this.icon && !this.textContent.trim()
          ? "icon-link"
          : "",
        ...baseClasses,
      ]
        .filter(Boolean)
        .join(" ");
    }
  }

  getStyles() {
    return `
      :host {
        display: inline-block;
      }

      a {
        text-decoration: none;
        color: inherit;
      }
      
      /* Plain link styles */
      .link {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-xs, 8px);
        font-family: var(--font-family, 'Circular Std', sans-serif);
        font-weight: var(--font-weight-normal, 400);
        color: var(--spotify-green, #1ED760);
        text-decoration: none;
        cursor: pointer;
        transition: var(--button-transition, all 0.3s ease-in-out);
      }
      
      .link-primary {
        color: var(--spotify-green, #1ED760);
      }
      
      .link-secondary {
        color: var(--link-secondary-color, #FFFFFF);
      }
      
      /* Link hover effects */
      .link:active:not(.disabled) {
        transform: scale(0.98);
      }
      
      /* Full width styling */
      .full-width {
        width: 100%;
      }
      
      /* Size variants for links */
      .link.size-small {
        font-size: var(--font-size-small, 0.8rem);
        padding: calc(var(--spacing-xs, 8px) * 0.5) var(--spacing-xs, 8px);
      }
      
      .link.size-medium {
        font-size: var(--font-size-base, 1rem);
        padding: var(--spacing-xs, 8px) var(--spacing-sm, 16px);
      }
      
      .link.size-large {
        font-size: calc(var(--font-size-base, 1rem) * 1.1);
        padding: calc(var(--spacing-xs, 8px) * 1.5) var(--spacing-md, 24px);
      }
      
      /* Button style links */
      .btn {
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
        padding: 0 var(--spacing-sm, 16px);
        white-space: nowrap;
        background-color: var(--button-bg-color, #1f1f1f);
        color: var(--font-color, #b3b3b3);
        text-decoration: none;
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
      
      .btn-outline:hover:not(.disabled) {
        background-color: rgba(255, 255, 255, 0.1);
        color: var(--spotify-white, #FFFFFF);
        transform: scale(1.02);
      }
      
      /* Size variants for buttons */
      .btn.size-small {
        height: calc(var(--button-size, 48px) * 0.6); /* 28px */
        min-width: calc(var(--button-size, 48px) * 1.5); /* 72px */
        font-size: var(--font-size-small, 0.8rem);
        padding: 0 var(--spacing-xs, 8px);
      }
      
      .btn.size-medium {
        height: calc(var(--button-size, 48px) * 0.83); /* 40px */
        min-width: calc(var(--button-size, 48px) * 2); /* 96px */
        font-size: var(--font-size-base, 1rem);
        padding: 0 var(--spacing-sm, 16px);
      }
      
      .btn.size-large {
        height: var(--button-size, 48px);
        min-width: calc(var(--button-size, 48px) * 2.5); /* 120px */
        font-size: calc(var(--font-size-base, 1rem) * 1.1);
        padding: 0 var(--spacing-md, 24px);
      }
      
      /* Rounded variant */
      .btn-rounded {
        border-radius: var(--button-border-radius, 500px);
      }
      
      /* Hover effects for button-style links */
      .btn:hover:not(.disabled) {
        background-color: var(--button-hover-color, #2a2a2a);
        transform: scale(1.02);
      }
      
      .btn-primary:hover:not(.disabled) {
        background-color: #1FDF64;
        transform: scale(1.02);
      }
      
      .btn-secondary:hover:not(.disabled) {
        background-color: #F6F6F6;
        transform: scale(1.02);
      }
      
      /* Icon styles */
      .with-icon {
        padding: 0 var(--spacing-xs, 8px);
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
      
      /* Button/link with only icon */
      .with-icon:not(:has(.btn-text:not(:empty))) {
        padding: 0;
        aspect-ratio: 1;
        justify-content: center;
        min-width: unset;
      }

      /* Size adjustments for icon-only buttons/links */
      .with-icon.size-small:not(:has(.btn-text:not(:empty))) {
        width: calc(var(--button-size, 48px) * 0.6); /* 28px */
      }
      
      .with-icon.size-medium:not(:has(.btn-text:not(:empty))) {
        width: calc(var(--button-size, 48px) * 0.83); /* 40px */
      }
      
      .with-icon.size-large:not(:has(.btn-text:not(:empty))) {
        width: var(--button-size, 48px);
      }
      
      /* Icon-only rounded link (fully circular) */
      .icon-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border-radius: 50% !important;
        transition: all 0.2s ease;
      }
      
      /* Size adjustments for rounded icon links */
      .icon-link.size-small {
        width: calc(var(--button-size, 48px) * 0.6) !important;
        height: calc(var(--button-size, 48px) * 0.6) !important;
      }
      
      .icon-link.size-medium {
        width: calc(var(--button-size, 48px) * 0.83) !important;
        height: calc(var(--button-size, 48px) * 0.83) !important;
      }
      
      .icon-link.size-large {
        width: var(--button-size, 48px) !important;
        height: var(--button-size, 48px) !important;
      }
      
      /* Button with only icon */
      .btn.with-icon:not(:has(.link-text:not(:empty))) {
        padding: 0;
        width: var(--button-size, 40px);
        aspect-ratio: 1;
        justify-content: center;
      }
      
      /* Icon-only rounded button (fully circular) */
      .icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: var(--button-size, 40px);
        height: var(--button-size, 40px);
        padding: 0;
        border-radius: 50%;
        transition: all 0.2s ease;
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
        pointer-events: none;
      }
      
      /* 접근성: 키보드 포커스 시각적 표시 */
      .link:focus,
      .btn:focus {
        outline: 2px solid #1db954;
        outline-offset: 2px;
      }
      
      /* 접근성: 높은 대비 모드 지원 */
      @media (forced-colors: active) {
        .link {
          color: LinkText;
        }
        .link:visited {
          color: VisitedText;
        }
        .btn, .link-btn {
          border: 1px solid ButtonText;
        }
        .link:focus,
        .btn:focus,
        .link-btn:focus {
          outline: 2px solid Highlight;
        }
        .disabled {
          opacity: 1;
          color: GrayText;
          border-color: GrayText;
        }
        .btn-primary, .link-btn-primary {
          background-color: Highlight;
          color: HighlightText;
        }
        .btn-secondary, .link-btn-secondary {
          background-color: ButtonFace;
          color: ButtonText;
        }
      }
      
      /* Reset for possible nested interactive elements */
      .link-text {
        display: inline-block;
      }
    `;
  }

  render() {
    const linkClasses = this.getLinkClasses();
    const content = this.getLinkContent();
    const ariaLabel =
      this.getAttribute("aria-label") || this.textContent || "Link";
    const ariaExpanded = this.hasAttribute("aria-expanded")
      ? this.getAttribute("aria-expanded")
      : null;
    const ariaControls = this.getAttribute("aria-controls") || null;
    const ariaHaspopup = this.hasAttribute("aria-haspopup")
      ? this.getAttribute("aria-haspopup")
      : null;

    // 접근성 속성 구성
    let ariaAttributes = `
      aria-label="${ariaLabel}"
      aria-disabled="${this.disabled}"
    `;

    // 조건부 ARIA 속성 추가
    if (ariaExpanded) ariaAttributes += ` aria-expanded="${ariaExpanded}"`;
    if (ariaControls) ariaAttributes += ` aria-controls="${ariaControls}"`;
    if (ariaHaspopup) ariaAttributes += ` aria-haspopup="${ariaHaspopup}"`;

    // 버튼 스타일의 링크일 경우 role="button" 추가
    const role = this.buttonStyle ? 'role="button"' : "";

    this.shadowRoot.innerHTML = `
      <style>${this.getStyles()}</style>
      <a class="${linkClasses}" 
         href="${this.disabled ? "javascript:void(0)" : this.href}" 
         target="${this.target}"
         part="link"
         ${role}
         ${ariaAttributes}
         tabindex="${this.disabled ? "-1" : "0"}">
        ${content}
      </a>
    `;
  }
}

// Define the custom element
customElements.define("link-component", LinkComponent);
