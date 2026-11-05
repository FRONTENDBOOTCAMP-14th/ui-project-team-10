import {
  bindScrollButtons,
  bindShowAll,
  getAlbums,
  getArtists,
  getPlaylists,
  getToken,
  loadSection,
  renderAlbums,
  renderArtists,
  renderPlaylists,
} from "./spotify.js";

const artistList = document.querySelector(".artist-list");
const albumList = document.querySelector(".album-list");
const playlistList = document.querySelector(".playlist-list");

async function init() {
  const token = getToken();
  await Promise.all([
    loadSection(artistList, () => token.then(getArtists), renderArtists, "아티스트 정보를 불러오지 못했습니다."),
    loadSection(albumList, () => token.then(getAlbums), renderAlbums, "앨범 정보를 불러오지 못했습니다."),
    loadSection(playlistList, () => token.then(getPlaylists), renderPlaylists, "플레이리스트 정보를 불러오지 못했습니다."),
  ]);
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
