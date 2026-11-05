export const ARTIST_IDS = [
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
];

export const ALBUM_IDS = [
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
];

export const PLAYLIST_IDS = [
  "6IZ7kJDFvRoM3EP0JTVEMi",
  "4lqydlFFjybZbeShlvR5wp",
  "6wmGWoKWOjSBFjugPl6Fz8",
  "32xX8oN3MRsNwIiBaxRMaF",
  "2Q1ZRB9qy5uKFLirHGDgn6",
  "7JfeMWiAZ1MBktHRtD2Jy2",
  "6fuI3AxjJWgqJtZwkV7wIR",
  "2Vi2H4BhJVG0PFnzYB8sgb",
  "0t4oUhIb9iDGz9oWhzBFfc",
  "5b6vbelZurLI3M8vm084z4",
  "0b9D75TIV46vPqEPCXxHx7",
  "0Y5touMvca0Eo2IU31rEbD",
  "5kdNkkasrsN9jVIuciXwma",
  "6cbZvcmscZjPr9vvYwgDiF",
  "0qOUg1VuszvoMXChYvgXUs",
  "1iEp1GemYL5Hn1FqmVZIz9",
];

const API = "https://api.spotify.com/v1";

export async function getToken() {
  const res = await fetch("/.netlify/functions/spotify-token");
  if (!res.ok) throw new Error(`토큰 요청 실패: ${res.status}`);
  const { access_token } = await res.json();
  if (typeof access_token !== "string" || !access_token) {
    throw new Error("토큰 응답이 올바르지 않습니다.");
  }
  return access_token;
}

async function getJson(path, token) {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Spotify 요청 실패: ${path} ${res.status}`);
  return res.json();
}

export async function getArtists(token) {
  const data = await getJson(`/artists?ids=${ARTIST_IDS.join(",")}&market=KR`, token);
  return data.artists;
}

export async function getAlbums(token) {
  const data = await getJson(`/albums?ids=${ALBUM_IDS.join(",")}&market=KR`, token);
  return data.albums;
}

async function getPlaylistById(id, token) {
  try {
    return await getJson(`/playlists/${id}`, token);
  } catch (e) {
    console.error(`❌ ${id} 불러오기 실패`, e);
    return null;
  }
}

export async function getPlaylists(token) {
  const results = await Promise.all(
    PLAYLIST_IDS.map((id) => getPlaylistById(id, token))
  );
  return results.filter(Boolean);
}

function renderCards(list, items, toCard) {
  const fragment = document.createDocumentFragment();
  for (const item of items) {
    const li = document.createElement("li");
    li.className = "list-card";
    const { label, html } = toCard(item);
    li.setAttribute("aria-label", label);
    li.innerHTML = html;
    fragment.appendChild(li);
  }
  list.innerHTML = "";
  list.appendChild(fragment);
}

export function renderArtists(list, artists) {
  renderCards(list, artists, (artist) => ({
    label: artist.name,
    html: `
      <a href="${artist.external_urls.spotify}" target="_blank">
        <article>
          <div class="artist-cover">
            <img loading="lazy" src="${artist.images[0]?.url || ""}" alt="${artist.name}" class="artist-profile" />
            <img src="/icons/play.png" class="play-button" alt="play"/>
          </div>
          <h3 class="card-title">${artist.name}</h3>
          <p class="card-info">Artist</p>
        </article>
      </a>
    `,
  }));
}

export function renderAlbums(list, albums) {
  renderCards(list, albums, (album) => {
    const artistNames = album.artists.map((a) => a.name).join(", ");
    return {
      label: `${artistNames} , ${album.name}`,
      html: `
      <a href="${album.external_urls.spotify}" target="_blank">
        <article>
          <div class="album-cover">
            <img loading="lazy" src="${album.images[0]?.url || "default.jpg"}" alt="${album.name}" class="album-img" />
            <img src="/icons/play.png" class="play-button" alt="play"/>
          </div>
          <h3 class="card-title">${album.name}</h3>
          <p class="card-info">${artistNames}</p>
        </article>
      </a>
    `,
    };
  });
}

export function renderPlaylists(list, playlists) {
  renderCards(list, playlists, (playlist) => ({
    label: playlist.name,
    html: `
      <a href="${playlist.external_urls.spotify}" target="_blank">
        <article>
          <div class="album-cover">
            <img loading="lazy" src="${playlist.images[0]?.url || "default.jpg"}" alt="${playlist.name}" class="album-img" />
            <img src="/icons/play.png" class="play-button" alt="play"/>
          </div>
          <h3 class="card-title">${playlist.name}</h3>
          <p class="card-info">By ${playlist.owner.display_name}</p>
        </article>
      </a>
    `,
  }));
}

export function bindScrollButtons(list, leftSelector, rightSelector) {
  document.querySelector(leftSelector).addEventListener("click", () => {
    list.scrollTo({ left: 0, behavior: "smooth" });
  });
  document.querySelector(rightSelector).addEventListener("click", () => {
    list.scrollTo({ left: list.scrollWidth, behavior: "smooth" });
  });
}
