import { bindScrollButtons, getArtists, getToken, loadSection, renderArtists } from "./spotify.js";

const artistList = document.querySelector(".artist-list");
const artistWrapper = document.querySelector(".artist-section");

function init() {
  return loadSection(
    artistList,
    () => getToken().then(getArtists),
    renderArtists,
    "아티스트 정보를 불러오지 못했습니다."
  );
}

document.addEventListener("DOMContentLoaded", () => {
  init();
  artistList.addEventListener("scroll", () => {
    artistWrapper.classList.toggle("scrolled", artistList.scrollLeft > 10);
  });
  bindScrollButtons(artistList, ".artist-scroll-btn-left", ".artist-scroll-btn-right");
});
