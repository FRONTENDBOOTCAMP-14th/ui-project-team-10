/**
 * Album Card Custom Element
 *
 * A reusable web component for displaying album cards with:
 * - Customizable album title, artist name, and cover image
 * - Hover effects and play button overlay
 * - Shadow DOM for encapsulation
 * - Responsive styling
 * - Custom event when clicked
 */
class AlbumCard extends HTMLElement {
  constructor() {
    super();
    // Create a shadow DOM
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return ["album-title", "album-artist", "album-cover"];
  }

  connectedCallback() {
    this.render();
    this.addEventListeners();
  }

  attributeChangedCallback() {
    // Re-render when attributes change
    if (this.shadowRoot.innerHTML !== "") {
      this.render();
    }
  }

  addEventListeners() {
    const card = this.shadowRoot.querySelector(".list-card");
    card.addEventListener("click", () => {
      // Dispatch custom event when album card is clicked
      this.dispatchEvent(
        new CustomEvent("album-click", {
          bubbles: true,
          composed: true,
          detail: {
            title: this.getAttribute("album-title"),
            artist: this.getAttribute("album-artist"),
            cover: this.getAttribute("album-cover"),
          },
        })
      );
    });
  }

  render() {
    // Get attribute values with fallbacks
    const albumTitle = this.getAttribute("album-title") || "앨범 이름";
    const albumArtist = this.getAttribute("album-artist") || "아티스트";
    const albumCover =
      this.getAttribute("album-cover") || "/image/default-album-cover.png";

    // Create the HTML content
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .list-card {
          width: 100%;
          max-width: 180px;
          cursor: pointer;
          transition: transform 0.2s ease;
          padding: 0.5rem;
          box-sizing: border-box;
        }

        .list-card:hover {
          transform: scale(1.05);
        }

        .album-cover {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          aspect-ratio: 1/1;
        }

        .album-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
        }

        .play-button {
          position: absolute;
          bottom: 10px;
          right: 10px;
          width: 40px;
          height: 40px;
          opacity: 0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.3s ease;
        }

        .album-cover:hover .play-button {
          opacity: 1;
        }

        .card-title {
          margin: 0.5rem 0 0.25rem 0;
          font-size: 14px;
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .card-info {
          margin: 0;
          font-size: 12px;
          color: #6c757d;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .list-card {
            max-width: 140px;
          }
        }
      </style>
      <article class="list-card">
        <div class="album-cover">
          <img src="${albumCover}" alt="${albumTitle}" class="album-img" />
          <img src="/icons/play.png" class="play-button" />
        </div>
        <h3 class="card-title">${albumTitle}</h3>
        <p class="card-info">${albumArtist}</p>
      </article>
    `;
  }
}

// Register the custom element
customElements.define("album-card", AlbumCard);
