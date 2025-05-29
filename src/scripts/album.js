const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

const albumIds = [
  "5NUuj9AlcNI1khPYJJAVtV,6ZG5lRT77aJ3btmArcykra",
  "3j7aiYai9ezbvxVCgrd2mb",
  "2oCAY48bhZvQte0l7apmYC",
  "28GiIRNu9nEugqnUci3aIC",
  "3T4tUhGYeRNVUGevb0wThu",
  "7pH8F7IVHTp2ZYKG0xN1CE",
  "32n91KG3YeLMLJ9e64EfXy",
].join(",");

(async function () {
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
            <img src="../assets/play.png" class="play-button"/>
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

  async function init() {
    try {
      const token = await getToken();
      const albums = await getAlbums(token);
      renderAlbums(albums);
    } catch (error) {
      console.error("Error initializing app:", error);
    }
  }

  init();
})();

document.addEventListener("DOMContentLoaded", () => {
  const albumList = document.querySelector(".album-list");

  document.querySelector(".scroll-btn-left").addEventListener("click", () => {
    albumList.scrollTo({
      left: 0,
      behavior: "smooth",
    });
  });

  document.querySelector(".scroll-btn-right").addEventListener("click", () => {
    albumList.scrollTo({
      left: albumList.scrollWidth,
      behavior: "smooth",
    });
  });
});
