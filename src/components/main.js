async function main() {
  async function getToken() {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + btoa(`${clientId}:${clientSecret}`),
      },
      body: 'grant_type=client_credentials',
    });

    const data = await res.json();
    return data.access_token;
  }

  async function getNewReleases(token) {
    const res = await fetch('https://api.spotify.com/v1/browse/new-releases?limit=10', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    console.log(data);
    return data.albums.items;
  }

  function renderAlbums(albums) {
    const albumList = document.querySelector('#list');
    albumList.innerHTML = '';

    albums.forEach((album) => {
      const albumCard = document.createElement('li');
      albumCard.className = 'album-card';

      albumCard.innerHTML = `
        <article>
            <img src="${album.images[0]?.url || ''}" alt="${album.name}" class="album-cover" />
            <h3 class="album-title">${album.name}</h3>
            <p class="album-info">${album.artists.map((artist) => artist.name).join(', ')}</p>
        </article>
    `;

      albumList.appendChild(albumCard);
    });
  }

  async function init() {
    const token = await getToken();
    const albums = await getNewReleases(token);
    renderAlbums(albums);
  }

  init();
}

document.addEventListener('DOMContentLoaded', main);

document.addEventListener('DOMContentLoaded', () => {
  const albumList = document.querySelector('.album-list');
  const scrollAmount = 200;

  document.querySelector('.scroll-btn-left').addEventListener('click', () => {
    albumList.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    console.log('left');
  });

  document.querySelector('.scroll-btn-right').addEventListener('click', () => {
    albumList.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    console.log('right');
  });
});
