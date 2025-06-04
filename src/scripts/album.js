const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

const albumIds = [
  "5NUuj9AlcNI1khPYJJAVtV",
  "6ZG5lRT77aJ3btmArcykra",
  "3j7aiYai9ezbvxVCgrd2mb",
  "2oCAY48bhZvQte0l7apmYC",
  "28GiIRNu9nEugqnUci3aIC",
  "3T4tUhGYeRNVUGevb0wThu",
  "7pH8F7IVHTp2ZYKG0xN1CE",
  "32n91KG3YeLMLJ9e64EfXy",
  "01dPJcwyht77brL4JQiR8R",
  "5V8n6fqyAPxvFTibPhQVcp",
  "4TeDL95L9OTCpYnuQwlrwY",
  "34Q2W5StgW4WC6HhbsNWnv",
  "1HMLpmZAnNyl9pxvOnTovV",
  "0VciVDVU6NoqtQ0WAIlTmD",
  "7CUqeaQmtkBWd6xQTlZ0Sg",
  "58nrjxdxUZJOVvLU1uyc6b",
  "0i4V6w1zpf6CFXSS67cyfQ",
  "68enXe5XcJdciSDAZr0Alr",
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

// ✅ 앨범 API
async function getAlbums(token) {
  const res = await fetch(
    `https://api.spotify.com/v1/albums?ids=${albumIds}&market=KR`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("앨범 데이터를 불러오지 못했습니다.");
  }

  const data = await res.json();
  return data.albums;
}

function renderAlbums(albums) {
  const albumList = document.querySelector(".album-list");
  albumList.innerHTML = "";

  albums.forEach((album) => {
    const albumCard = document.createElement("li");
    albumCard.className = "list-card";

    albumCard.innerHTML = `
      <a href="${album.external_urls.spotify}" target="_blank">
        <article>
          <div class="album-cover">
            <img src="${album.images[0]?.url || "default.jpg"}" alt="${
      album.name
    }" class="album-img" />
            <img src="/icons/play.png" class="play-button"/>
          </div>
          <h3 class="card-title">${album.name}</h3>
          <p class="card-info">${album.artists
            .map((a) => a.name)
            .join(", ")}</p>
        </article>
      </a>
    `;
    albumList.appendChild(albumCard);
  });
}

// ✅ 공통 초기화 함수
async function init() {
  try {
    const token = await getToken();

    // Fetch and render albums
    const albums = await getAlbums(token);
    renderAlbums(albums);
  } catch (e) {
    console.error("데이터를 불러오는 데 실패했습니다.", e);
    document.querySelector(".album-list").innerHTML =
      "<li>앨범 정보를 불러오지 못했습니다.</li>";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  init();
  setupEventListeners();
});

function setupEventListeners() {
  // Album Scroll
  const albumList = document.querySelector(".album-list");

  document
    .querySelector(".album-scroll-btn-left")
    .addEventListener("click", () => {
      albumList.scrollTo({ left: 0, behavior: "smooth" });
    });

  document
    .querySelector(".album-scroll-btn-right")
    .addEventListener("click", () => {
      albumList.scrollTo({ left: albumList.scrollWidth, behavior: "smooth" });
    });

  // Show all toggle (for album)
  const albumShowAllBtn = document.querySelector(".album-show-all");
  if (albumShowAllBtn) {
    albumShowAllBtn.addEventListener("click", () => {
      const isGrid = albumList.classList.toggle("grid-mode");
      albumShowAllBtn.textContent = isGrid ? "Hide" : "Show All";
      toggleScrollButtons("album", !isGrid);
    });
  }
}

function toggleScrollButtons(type, show) {
  const selectors = {
    artist: [".artist-scroll-btn-left", ".artist-scroll-btn-right"],
    album: [".album-scroll-btn-left", ".album-scroll-btn-right"],
    playlist: [".playlist-scroll-btn-left", ".playlist-scroll-btn-right"],
  };

  selectors[type].forEach((selector) => {
    const btn = document.querySelector(selector);
    if (btn) btn.style.display = show ? "block" : "none";
  });
}
