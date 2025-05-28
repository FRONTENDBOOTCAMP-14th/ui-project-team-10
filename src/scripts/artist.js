const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

const artistIds = [
  "30b9WulBM8sFuBo17nNq9c",
  "5TnQc2N1iKlFjYD7CPGvFc",
  "6YVMFz59CuY7ngCxTxjpxE",
  "6zn0ihyAApAYV51zpXxdEp",
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

  async function getNewReleases(token) {
    const res = await fetch(
      `https://api.spotify.com/v1/artists/?ids=${artistIds}&market=KR`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await res.json();
    console.log(data);
    return data.artists;
  }

  function renderArtists(artists) {
    const artistList = document.querySelector(".artist-list");
    artistList.innerHTML = "";

    console.log(artists);

    artists.forEach((artist) => {
      const artistCard = document.createElement("li");
      artistCard.className = "artist-card";

      artistCard.innerHTML = `
        <a href="${artist.external_urls.spotify}" target="_blank">
          <article>
            <div class="artist-cover">
                <img src="${artist.images[0]?.url || ""}" alt="${
        artist.name
      }" class="artist-profile" />
                <img src="../assets/play.png" class="artist-play-button"/>
            </div>
              <h3 class="artist-name">${artist.name}</h3>
              <p class="artist-info">Artist</p>       
          </article>
        </a>
    `;

      artistList.appendChild(artistCard);
    });
  }

  async function init() {
    const token = await getToken();
    const artists = await getNewReleases(token);
    console.log(artists);
    renderArtists(artists);
  }

  init();
})();

// document.addEventListener("DOMContentLoaded", () => {
//   const albumList = document.querySelector(".album-list");

//   document.querySelector(".scroll-btn-left").addEventListener("click", () => {
//     albumList.scrollTo({
//       left: 0,
//       behavior: "smooth",
//     });
//   });

//   document.querySelector(".scroll-btn-right").addEventListener("click", () => {
//     albumList.scrollTo({
//       left: albumList.scrollWidth,
//       behavior: "smooth",
//     });
//   });
// });
