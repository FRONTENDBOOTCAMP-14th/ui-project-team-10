import { bindScrollButtons, bindShowAll, getAlbums, getToken, loadSection, renderAlbums } from "./spotify.js";

const albumList = document.querySelector(".album-list");

function init() {
  return loadSection(
    albumList,
    () => getToken().then(getAlbums),
    renderAlbums,
    "앨범 정보를 불러오지 못했습니다."
  );
}

document.addEventListener("DOMContentLoaded", () => {
  init();
  bindScrollButtons(albumList, ".album-scroll-btn-left", ".album-scroll-btn-right");
  bindShowAll("album", albumList);
});
