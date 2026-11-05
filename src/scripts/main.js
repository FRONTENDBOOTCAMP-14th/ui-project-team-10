import {
  bindScrollButtons,
  getAlbums,
  getArtists,
  getPlaylists,
  getToken,
  renderAlbums,
  renderArtists,
  renderPlaylists,
} from "./spotify.js";

const artistList = document.querySelector(".artist-list");
const albumList = document.querySelector(".album-list");
const playlistList = document.querySelector(".playlist-list");

async function init() {
  try {
    const token = await getToken();

    const [artists, albums, playlists] = await Promise.all([
      getArtists(token),
      getAlbums(token),
      getPlaylists(token),
    ]);

    renderArtists(artistList, artists);
    renderAlbums(albumList, albums);
    renderPlaylists(playlistList, playlists);
  } catch (e) {
    console.error("데이터를 불러오는 데 실패했습니다.", e);
    artistList.innerHTML = "<li>아티스트 정보를 불러오지 못했습니다.</li>";
    albumList.innerHTML = "<li>앨범 정보를 불러오지 못했습니다.</li>";
    playlistList.innerHTML = "<li>플레이리스트 정보를 불러오지 못했습니다.</li>";
  }
}

function toggleScrollButtons(name, show) {
  for (const side of ["left", "right"]) {
    const btn = document.querySelector(`.${name}-scroll-btn-${side}`);
    if (btn) btn.style.display = show ? "block" : "none";
  }
}

function bindShowAll(name, list) {
  const btn = document.querySelector(`.${name}-show-all`);
  if (!btn) return;
  btn.addEventListener("click", () => {
    const isGrid = list.classList.toggle("grid-mode");
    btn.textContent = isGrid ? "Hide" : "Show All";
    toggleScrollButtons(name, !isGrid);
  });
}

function setupEventListeners() {
  const artistWrapper = document.querySelector(".artist-section");
  artistList.addEventListener("scroll", () => {
    artistWrapper.classList.toggle("scrolled", artistList.scrollLeft > 10);
  });

  bindScrollButtons(artistList, ".artist-scroll-btn-left", ".artist-scroll-btn-right");
  bindScrollButtons(albumList, ".album-scroll-btn-left", ".album-scroll-btn-right");
  bindScrollButtons(playlistList, ".playlist-scroll-btn-left", ".playlist-scroll-btn-right");

  bindShowAll("album", albumList);
  bindShowAll("artist", artistList);
  bindShowAll("playlist", playlistList);
}

document.addEventListener("DOMContentLoaded", () => {
  init();
  setupEventListeners();
});
