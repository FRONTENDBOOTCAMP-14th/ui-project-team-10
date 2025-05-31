/**
 * Custom link web component
 * Reusable link with various styles, sizes, and options
 * Can be styled as a regular link or as a button
 */
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
  }

  removeEventListeners() {
    const link = this.shadowRoot.querySelector("a");
    if (link) {
      link.removeEventListener("click", this.handleClick.bind(this));
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

    // Simple mapping for common icons
    const iconMap = {
      search:
        '<svg data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 24 24"><path d="M10.533 1.27893C5.35215 1.27893 1.12598 5.41887 1.12598 10.5579C1.12598 15.697 5.35215 19.8369 10.533 19.8369C12.767 19.8369 14.8235 19.0671 16.4402 17.7794L20.7929 22.132C21.1834 22.5226 21.8166 22.5226 22.2071 22.132C22.5976 21.7415 22.5976 21.1083 22.2071 20.7178L17.8634 16.3741C19.1616 14.7849 19.94 12.7634 19.94 10.5579C19.94 5.41887 15.7138 1.27893 10.533 1.27893ZM3.12598 10.5579C3.12598 6.55226 6.42768 3.27893 10.533 3.27893C14.6383 3.27893 17.94 6.55226 17.94 10.5579C17.94 14.5636 14.6383 17.8369 10.533 17.8369C6.42768 17.8369 3.12598 14.5636 3.12598 10.5579Z"></path></svg>',
      home: '<svg data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 24 24"><path d="M13.5 1.515a3 3 0 0 0-3 0L3 5.845a2 2 0 0 0-1 1.732V21a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6h4v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7.577a2 2 0 0 0-1-1.732l-7.5-4.33z"></path></svg>',
      download:
        '<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_29_2486)"><path d="M4.99497 8.745C5.1356 8.60455 5.32622 8.52566 5.52497 8.52566C5.72373 8.52566 5.91435 8.60455 6.05497 8.745L7.24997 9.939V4C7.24997 3.80109 7.32899 3.61032 7.46964 3.46967C7.6103 3.32902 7.80106 3.25 7.99997 3.25C8.19889 3.25 8.38965 3.32902 8.5303 3.46967C8.67096 3.61032 8.74997 3.80109 8.74997 4V9.94L9.94497 8.745C10.0136 8.67131 10.0964 8.61221 10.1884 8.57122C10.2804 8.53023 10.3797 8.50819 10.4805 8.50641C10.5812 8.50463 10.6812 8.52316 10.7746 8.56088C10.868 8.5986 10.9528 8.65474 11.024 8.72596C11.0952 8.79718 11.1514 8.88201 11.1891 8.9754C11.2268 9.06879 11.2453 9.16882 11.2436 9.26952C11.2418 9.37023 11.2197 9.46954 11.1788 9.56154C11.1378 9.65354 11.0787 9.73634 11.005 9.805L7.99997 12.811L7.47197 12.283C7.4703 12.2813 7.46864 12.2797 7.46697 12.278L4.99497 9.805C4.85452 9.66437 4.77563 9.47375 4.77563 9.275C4.77563 9.07625 4.85452 8.88563 4.99497 8.745Z" fill="currentColor"/><path d="M0 8C0 5.87827 0.842855 3.84344 2.34315 2.34315C3.84344 0.842855 5.87827 0 8 0C10.1217 0 12.1566 0.842855 13.6569 2.34315C15.1571 3.84344 16 5.87827 16 8C16 10.1217 15.1571 12.1566 13.6569 13.6569C12.1566 15.1571 10.1217 16 8 16C5.87827 16 3.84344 15.1571 2.34315 13.6569C0.842855 12.1566 0 10.1217 0 8ZM8 1.5C6.27609 1.5 4.62279 2.18482 3.40381 3.40381C2.18482 4.62279 1.5 6.27609 1.5 8C1.5 9.72391 2.18482 11.3772 3.40381 12.5962C4.62279 13.8152 6.27609 14.5 8 14.5C9.72391 14.5 11.3772 13.8152 12.5962 12.5962C13.8152 11.3772 14.5 9.72391 14.5 8C14.5 6.27609 13.8152 4.62279 12.5962 3.40381C11.3772 2.18482 9.72391 1.5 8 1.5Z" fill="currentColor"/></g></svg>',
      play: '<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"></path></svg>',
      browse:
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_29_2587)"><path d="M15 16.02C15 17.125 13.657 18.02 12 18.02C10.343 18.02 9 17.125 9 16.02C9 14.915 10.343 14.02 12 14.02C13.657 14.02 15 14.915 15 16.02Z" fill="currentColor"/><path d="M1.51307 9.88996C1.60698 9.7742 1.72558 9.6809 1.86019 9.61688C1.9948 9.55287 2.14202 9.51975 2.29107 9.51996H21.7091C21.8581 9.51983 22.0053 9.55302 22.1399 9.6171C22.2745 9.68118 22.393 9.77454 22.4868 9.89033C22.5807 10.0061 22.6475 10.1414 22.6823 10.2864C22.7171 10.4313 22.7191 10.5822 22.6881 10.728L20.3491 21.728C20.3014 21.952 20.1783 22.1529 20.0003 22.2971C19.8223 22.4413 19.6001 22.5199 19.3711 22.52H4.63007C4.401 22.5199 4.17889 22.4413 4.00087 22.2971C3.82285 22.1529 3.69972 21.952 3.65207 21.728L1.31307 10.728C1.28214 10.5823 1.28413 10.4315 1.3189 10.2867C1.35368 10.1419 1.42036 10.0067 1.51407 9.89096L1.51307 9.88996ZM3.52507 11.52L5.43807 20.52H18.5611L20.4741 11.52H3.52507ZM4.00007 2.51996C4.00007 2.25474 4.10543 2.00039 4.29297 1.81285C4.4805 1.62532 4.73486 1.51996 5.00007 1.51996H19.0001C19.2653 1.51996 19.5196 1.62532 19.7072 1.81285C19.8947 2.00039 20.0001 2.25474 20.0001 2.51996V6.51996H18.0001V3.51996H6.00007V6.51996H4.00007V2.51996Z" fill="currentColor"/></g></svg>',
      external:
        '<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M1.75 2h5.5a.75.75 0 0 1 0 1.5h-5.5A.25.25 0 0 0 1.5 3.75v10.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-5.5a.75.75 0 0 1 1.5 0v5.5A1.75 1.75 0 0 1 12.25 16H1.75A1.75 1.75 0 0 1 0 14.25V3.75C0 2.784.784 2 1.75 2zM7.5 1.75a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0V3.56L7.28 9.78a.75.75 0 0 1-1.06-1.06l6.22-6.22H8.25a.75.75 0 0 1-.75-.75z" fill="currentColor"/></svg>',
    };

    // Standardize the SVG by removing any explicit width/height attributes
    let svg = iconMap[this.icon] || this.icon;

    // Remove width and height attributes from SVG to allow CSS to control size
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
      
      /* Reset for possible nested interactive elements */
      .link-text {
        display: inline-block;
      }
    `;
  }

  render() {
    const linkClasses = this.getLinkClasses();
    const content = this.getLinkContent();

    this.shadowRoot.innerHTML = `
      <style>${this.getStyles()}</style>
      <a class="${linkClasses}" 
         href="${this.disabled ? "javascript:void(0)" : this.href}" 
         target="${this.target}"
         part="link"
         aria-disabled="${this.disabled}">
        ${content}
      </a>
    `;
  }
}

// Define the custom element
customElements.define("link-component", LinkComponent);
