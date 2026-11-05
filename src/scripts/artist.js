import { bindScrollButtons, getArtists, getToken, renderArtists } from "./spotify.js";

const artistList = document.querySelector(".artist-list");
const artistWrapper = document.querySelector(".artist-section");

async function init() {
  try {
    const token = await getToken();
    const artists = await getArtists(token);
    renderArtists(artistList, artists);
  } catch (e) {
    console.error("데이터를 불러오는 데 실패했습니다.", e);
    artistList.innerHTML = "<li>아티스트 정보를 불러오지 못했습니다.</li>";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  init();
  artistList.addEventListener("scroll", () => {
    artistWrapper.classList.toggle("scrolled", artistList.scrollLeft > 10);
  });
  bindScrollButtons(artistList, ".artist-scroll-btn-left", ".artist-scroll-btn-right");
});
