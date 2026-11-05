import { bindScrollButtons, getAlbums, getToken, renderAlbums } from "./spotify.js";

const albumList = document.querySelector(".album-list");

async function init() {
  try {
    const token = await getToken();
    const albums = await getAlbums(token);
    renderAlbums(albumList, albums);
  } catch (e) {
    console.error("데이터를 불러오는 데 실패했습니다.", e);
    albumList.innerHTML = "<li>앨범 정보를 불러오지 못했습니다.</li>";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  init();
  bindScrollButtons(albumList, ".album-scroll-btn-left", ".album-scroll-btn-right");
});
