/**
 * 렌더링 유틸리티
 *
 * 아티스트, 앨범, 플레이리스트 등의 데이터를 렌더링하는 공통 함수들을 모아둔 모듈
 */

import "/src/scripts/component/artist-card.js";
import "/src/scripts/component/album-card.js";
import "/src/scripts/component/playlist-card.js";

/**
 * 아티스트 정보를 화면에 렌더링합니다.
 * @param {Array} artists - 스포티파이 API에서 받아온 아티스트 정보 배열
 * @param {string} [selector=".artist-list"] - 아티스트를 렌더링할 요소의 선택자
 */
export function renderArtists(artists, selector = ".artist-list") {
  const artistList = document.querySelector(selector);
  if (!artistList) {
    console.error(`${selector} 요소를 찾을 수 없습니다.`);
    return;
  }

  artistList.innerHTML = "";

  artists.forEach((artist) => {
    // li 요소 생성
    const listItem = document.createElement("li");
    listItem.className = "list-card";

    // artist-card 커스텀 요소 생성
    const artistCard = document.createElement("artist-card");
    artistCard.setAttribute("artist-name", artist.name);
    artistCard.setAttribute("artist-type", "Artist");
    artistCard.setAttribute("artist-image", artist.images[0]?.url || "");

    // 클릭 이벤트 처리 - Spotify로 연결
    artistCard.addEventListener("artist-click", () => {
      window.open(artist.external_urls.spotify, "_blank");
    });

    // 리스트 아이템에 아티스트 카드 추가
    listItem.appendChild(artistCard);
    artistList.appendChild(listItem);
  });
}

/**
 * 앨범 데이터를 화면에 렌더링합니다.
 * @param {Array} albums - Spotify API에서 가져온 앨범 객체 배열
 * @param {string} [selector=".album-list"] - 앨범을 렌더링할 요소의 선택자
 */
export function renderAlbums(albums, selector = ".album-list") {
  const albumList = document.querySelector(selector);
  if (!albumList) {
    console.error(`${selector} 요소를 찾을 수 없습니다.`);
    return;
  }

  albumList.innerHTML = "";

  albums.forEach((album) => {
    // li 요소 생성
    const listItem = document.createElement("li");
    listItem.className = "list-card";

    // album-card 커스텀 요소 생성
    const albumCard = document.createElement("album-card");
    albumCard.setAttribute("album-title", album.name);
    albumCard.setAttribute(
      "album-artist",
      album.artists.map((a) => a.name).join(", ")
    );
    albumCard.setAttribute(
      "album-cover",
      album.images[0]?.url || "default.jpg"
    );

    // 클릭 이벤트 처리 - Spotify로 연결
    albumCard.addEventListener("album-click", () => {
      window.open(album.external_urls.spotify, "_blank");
    });

    // 리스트 아이템에 앨범 카드 추가
    listItem.appendChild(albumCard);
    albumList.appendChild(listItem);
  });
}

/**
 * 플레이리스트 데이터를 화면에 렌더링합니다.
 * @param {Array} playlists - Spotify API에서 가져온 플레이리스트 객체 배열
 * @param {string} [selector=".playlist-list"] - 플레이리스트를 렌더링할 요소의 선택자
 */
export function renderPlaylists(playlists, selector = ".playlist-list") {
  const playlistList = document.querySelector(selector);
  if (!playlistList) {
    console.error(`${selector} 요소를 찾을 수 없습니다.`);
    return;
  }

  playlistList.innerHTML = "";

  playlists.forEach((playlist) => {
    // li 요소 생성
    const listItem = document.createElement("li");
    listItem.className = "list-card";

    // playlist-card 커스텀 요소 생성
    const playlistCard = document.createElement("playlist-card");
    playlistCard.setAttribute("playlist-title", playlist.name);
    playlistCard.setAttribute("playlist-owner", playlist.owner.display_name);
    playlistCard.setAttribute(
      "playlist-cover",
      playlist.images[0]?.url || "default.jpg"
    );

    // 클릭 이벤트 처리 - Spotify로 연결
    playlistCard.addEventListener("playlist-click", () => {
      window.open(playlist.external_urls.spotify, "_blank");
    });

    // 리스트 아이템에 플레이리스트 카드 추가
    listItem.appendChild(playlistCard);
    playlistList.appendChild(listItem);
  });
}
