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

const playListIds = [
  "6IZ7kJDFvRoM3EP0JTVEMi",
  "4lqydlFFjybZbeShlvR5wp",
  "6wmGWoKWOjSBFjugPl6Fz8",
  "32xX8oN3MRsNwIiBaxRMaF",
  "2Q1ZRB9qy5uKFLirHGDgn6",
  "7JfeMWiAZ1MBktHRtD2Jy2",
  "6fuI3AxjJWgqJtZwkV7wIR",
  "6wmGWoKWOjSBFjugPl6Fz8",
  "2Vi2H4BhJVG0PFnzYB8sgb",
  "0t4oUhIb9iDGz9oWhzBFfc",
  "5b6vbelZurLI3M8vm084z4",
  "0b9D75TIV46vPqEPCXxHx7",
  "0Y5touMvca0Eo2IU31rEbD",
  "5kdNkkasrsN9jVIuciXwma",
  "1rUKksNlvTXLQh6UNaMlnq",
  "6cbZvcmscZjPr9vvYwgDiF",
  "0qOUg1VuszvoMXChYvgXUs",
  "1iEp1GemYL5Hn1FqmVZIz9",
];

// ✅ 공통 토큰 요청
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

// ✅ 아티스트 API
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
    artistCard.setAttribute("aria-label", artist.name);

    artistCard.innerHTML = `
      <a href="${artist.external_urls.spotify}" target="_blank">
        <article>
          <div class="artist-cover">
            <img src="${artist.images[0]?.url || ""}" alt="${
      artist.name
    }" class="artist-profile" />
            <img src="/icons/play.png" class="play-button"/>
          </div>
          <h3 class="card-title">${artist.name}</h3>
          <p class="card-info">Artist</p>
        </article>
      </a>
    `;
    artistList.appendChild(artistCard);
  });
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
    albumCard.setAttribute(
      "aria-label",
      `${album.artists.map((a) => a.name).join(", ")} , ${album.name}`
    );

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
          <p class="card-info"></p>
        </article>
      </a>
    `;
    albumList.appendChild(albumCard);
  });
}

async function getPlaylistById(id, token) {
  const res = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    console.error(`❌ ${id} 불러오기 실패`, res.status);
    return null;
  }

  const data = await res.json();
  return data;
}

async function getPlaylists(token) {
  const playlists = [];

  for (const id of playListIds) {
    const playlist = await getPlaylistById(id, token);
    if (playlist) {
      playlists.push(playlist);
    }
  }

  return playlists;
}

function renderPlaylists(playlists) {
  const playlistList = document.querySelector(".playlist-list");
  playlistList.innerHTML = "";

  playlists.forEach((playlist) => {
    const playlistCard = document.createElement("li");
    playlistCard.className = "list-card";
    playlistCard.setAttribute("aria-label", playlist.name);

    playlistCard.innerHTML = `
      <a href="${playlist.external_urls.spotify}" target="_blank">
        <article>
          <div class="album-cover">
            <img src="${playlist.images[0]?.url || "default.jpg"}" alt="${
      playlist.name
    }" class="album-img" />
            <img src="/icons/play.png" class="play-button"/>
          </div>
          <h3 class="card-title">${playlist.name}</h3>
          <p class="card-info">By ${playlist.owner.display_name}</p>
        </article>
      </a>
    `;
    playlistList.appendChild(playlistCard);
  });
}

// ✅ 공통 초기화 함수
async function init() {
  try {
    const token = await getToken();

    // Fetch and render artists
    const artists = await getArtists(token);
    renderArtists(artists);

    // Fetch and render albums
    const albums = await getAlbums(token);
    renderAlbums(albums);

    const playlists = await getPlaylists(token);
    renderPlaylists(playlists);
  } catch (e) {
    console.error("데이터를 불러오는 데 실패했습니다.", e);
    document.querySelector(".artist-list").innerHTML =
      "<li>아티스트 정보를 불러오지 못했습니다.</li>";
    document.querySelector(".album-list").innerHTML =
      "<li>앨범 정보를 불러오지 못했습니다.</li>";
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

  // playlist Scroll
  const playlistList = document.querySelector(".playlist-list");

  document
    .querySelector(".playlist-scroll-btn-left")
    .addEventListener("click", () => {
      playlistList.scrollTo({ left: 0, behavior: "smooth" });
    });

  document
    .querySelector(".playlist-scroll-btn-right")
    .addEventListener("click", () => {
      playlistList.scrollTo({
        left: playlistList.scrollWidth,
        behavior: "smooth",
      });
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

  // Show all toggle (for artist)
  const artistShowAllBtn = document.querySelector(".artist-show-all");
  if (artistShowAllBtn) {
    artistShowAllBtn.addEventListener("click", () => {
      const isGrid = artistList.classList.toggle("grid-mode");
      artistShowAllBtn.textContent = isGrid ? "Hide" : "Show All";
      toggleScrollButtons("artist", !isGrid);
    });
  }

  // Show all toggle (for playlist)
  const playlistShowAllBtn = document.querySelector(".playlist-show-all");
  if (playlistShowAllBtn) {
    playlistShowAllBtn.addEventListener("click", () => {
      const isGrid = playlistList.classList.toggle("grid-mode");
      playlistShowAllBtn.textContent = isGrid ? "Hide" : "Show All";
      toggleScrollButtons("playlist", !isGrid);
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
