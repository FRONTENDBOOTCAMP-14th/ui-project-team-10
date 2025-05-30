const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

const artistIds = [
  "30b9WulBM8sFuBo17nNq9c",
  "5TnQc2N1iKlFjYD7CPGvFc",
  "6YVMFz59CuY7ngCxTxjpxE",
  "6zn0ihyAApAYV51zpXxdEp",
  "6mEQK9m2krja6X1cfsAjfl",
  "3eVa5w3URK5duf6eyVDbu9",
  "4gzpq5DPGxSnKTe4SA8HAU",
  "5wVJpXzuKV6Xj7Yhsf2uYx",
  "6lESE9VeLV05vQBw8TB4YA",
  "0dBTTLuseszs4BqgyXCrC8",
  "4XDi67ZENZcbfKnvMnTYsI",
  "6UbmqUEgjLA6jAcXwbM1Z9",
  "2QM5S4yO6xHgnNvF0nbZZq",
].join(",");

async function getToken() {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa(`${clientId}:${clientSecret}`),
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  return data.access_token;
}

async function getArtists(token) {
  const res = await fetch(
    `https://api.spotify.com/v1/artists?ids=${artistIds}&market=KR`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data = await res.json();
  return data.artists;
}

function renderArtists(artists) {
  const artistList = document.querySelector(".artist-list");
  artistList.innerHTML = "";

  artists.forEach((artist) => {
    const artistCard = document.createElement("li");
    artistCard.className = "list-card";

    artistCard.innerHTML = `
      <a href="${artist.external_urls.spotify}" target="_blank">
        <article>
          <div class="artist-cover">
            <img src="${artist.images[0]?.url || ""}" alt="${
      artist.name
    }" class="artist-profile" />
            <img src="../assets/play.png" class="play-button"/>
          </div>
          <h3 class="card-title">${artist.name}</h3>
          <p class="card-info">Artist</p>
        </article>
      </a>
    `;
    artistList.appendChild(artistCard);
  });
}

async function init() {
  try {
    const token = await getToken();

    // Fetch and render artists
    const artists = await getArtists(token);
    renderArtists(artists);
  } catch (e) {
    console.error("데이터를 불러오는 데 실패했습니다.", e);
    document.querySelector(".artist-list").innerHTML =
      "<li>아티스트 정보를 불러오지 못했습니다.</li>";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  init();
  setupEventListeners();
});

function setupEventListeners() {
  // Artist Scroll
  const artistList = document.querySelector(".artist-list");
  const artistWrapper = document.querySelector(".artist-section");

  artistList.addEventListener("scroll", () => {
    artistWrapper.classList.toggle("scrolled", artistList.scrollLeft > 10);
  });

  document
    .querySelector(".artist-scroll-btn-left")
    .addEventListener("click", () => {
      artistList.scrollTo({ left: 0, behavior: "smooth" });
    });

  document
    .querySelector(".artist-scroll-btn-right")
    .addEventListener("click", () => {
      artistList.scrollTo({ left: artistList.scrollWidth, behavior: "smooth" });
    });

  // Show all toggle (for artist)
  const artistShowAllBtn = document.querySelector(".artist-show-all");
  if (artistShowAllBtn) {
    artistShowAllBtn.addEventListener("click", () => {
      const isGrid = artistList.classList.toggle("grid-mode");
      artistShowAllBtn.textContent = isGrid ? "Hide" : "Show All";
      toggleScrollButtons("artist", !isGrid);
    });
  }

  function toggleScrollButtons(type, show) {
    const selectors = {
      artist: [".artist-scroll-btn-left", ".artist-scroll-btn-right"],
    };

    selectors[type].forEach((selector) => {
      const btn = document.querySelector(selector);
      if (btn) btn.style.display = show ? "block" : "none";
    });
  }
}
