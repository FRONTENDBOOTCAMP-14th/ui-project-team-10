import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ALBUM_IDS,
  ARTIST_IDS,
  PLAYLIST_IDS,
  getAlbums,
  getArtists,
  getPlaylists,
  escapeHtml,
  getToken,
  loadSection,
  renderAlbums,
  renderArtists,
  renderPlaylists,
} from "../spotify.js";

const ok = (body) => Promise.resolve(Response.json(body));
const fail = (status) => Promise.resolve(new Response("{}", { status }));

afterEach(() => vi.unstubAllGlobals());

describe("id lists", () => {
  it("PLAYLIST_IDS has no duplicates", () => {
    expect(new Set(PLAYLIST_IDS).size).toBe(PLAYLIST_IDS.length);
  });
  it("ARTIST_IDS and ALBUM_IDS have no duplicates", () => {
    expect(new Set(ARTIST_IDS).size).toBe(ARTIST_IDS.length);
    expect(new Set(ALBUM_IDS).size).toBe(ALBUM_IDS.length);
  });
});

describe("getToken", () => {
  it("calls the Netlify function and returns the access token", async () => {
    const fetchMock = vi.fn(() => ok({ access_token: "tok", expires_in: 3600 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(getToken()).resolves.toBe("tok");
    expect(fetchMock).toHaveBeenCalledWith("/.netlify/functions/spotify-token");
  });

  it("throws when the response is not ok", async () => {
    vi.stubGlobal("fetch", vi.fn(() => fail(502)));
    await expect(getToken()).rejects.toThrow();
  });

  it("throws when access_token is missing or empty", async () => {
    vi.stubGlobal("fetch", vi.fn(() => ok({})));
    await expect(getToken()).rejects.toThrow();
    vi.stubGlobal("fetch", vi.fn(() => ok({ access_token: "" })));
    await expect(getToken()).rejects.toThrow();
  });
});

describe("data fetchers", () => {
  it("getAlbums returns data.albums and sends the bearer token", async () => {
    const fetchMock = vi.fn(() => ok({ albums: [{ id: 1 }] }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(getAlbums("t")).resolves.toEqual([{ id: 1 }]);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/v1/albums?ids=");
    expect(init.headers.Authorization).toBe("Bearer t");
  });

  it("getAlbums and getArtists throw on non-ok", async () => {
    vi.stubGlobal("fetch", vi.fn(() => fail(401)));
    await expect(getAlbums("t")).rejects.toThrow();
    await expect(getArtists("t")).rejects.toThrow();
  });

  it("getArtists returns data.artists", async () => {
    vi.stubGlobal("fetch", vi.fn(() => ok({ artists: [{ id: "a" }] })));
    await expect(getArtists("t")).resolves.toEqual([{ id: "a" }]);
  });

  it("getPlaylists drops failed playlists and keeps the rest", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    let n = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(() => (n++ === 0 ? fail(404) : ok({ id: `p${n}` })))
    );
    const result = await getPlaylists("t");
    expect(result).toHaveLength(PLAYLIST_IDS.length - 1);
    expect(result.every(Boolean)).toBe(true);
  });
});

describe("renderAlbums", () => {
  it("renders one card per album into the list", () => {
    const list = document.createElement("ul");
    list.innerHTML = "<li>old</li>";
    renderAlbums(list, [
      {
        name: "A",
        external_urls: { spotify: "https://s/a" },
        images: [],
        artists: [{ name: "X" }, { name: "Y" }],
      },
    ]);
    expect(list.children).toHaveLength(1);
    expect(list.querySelector(".card-title").textContent).toBe("A");
    expect(list.querySelector(".card-info").textContent).toBe("X, Y");
    expect(list.firstElementChild.getAttribute("aria-label")).toBe("X, Y , A");
  });
});

describe("escapeHtml", () => {
  it("escapes & < > \" and '", () => {
    expect(escapeHtml(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&#39;");
  });
  it("stringifies non-strings", () => {
    expect(escapeHtml(5)).toBe("5");
  });
});

describe("render escaping", () => {
  const evil = `x"><img src=x onerror=alert(1)>`;

  it("renderPlaylists neutralizes markup in name and owner", () => {
    const list = document.createElement("ul");
    renderPlaylists(list, [
      {
        name: evil,
        external_urls: { spotify: "https://s/p" },
        images: [],
        owner: { display_name: "<b>o</b>" },
      },
    ]);
    expect(list.querySelector("[onerror]")).toBeNull();
    expect(list.querySelector("b")).toBeNull();
    expect(list.querySelector(".card-title").textContent).toBe(evil);
    expect(list.querySelector(".card-info").textContent).toBe("By <b>o</b>");
  });

  it("renderAlbums and renderArtists neutralize markup", () => {
    const albums = document.createElement("ul");
    renderAlbums(albums, [
      {
        name: evil,
        external_urls: { spotify: "https://s/a" },
        images: [],
        artists: [{ name: "<i>X</i>" }],
      },
    ]);
    expect(albums.querySelector("[onerror]")).toBeNull();
    expect(albums.querySelector("i")).toBeNull();
    expect(albums.querySelector(".card-info").textContent).toBe("<i>X</i>");

    const artists = document.createElement("ul");
    renderArtists(artists, [
      { name: evil, external_urls: { spotify: "https://s/r" }, images: [] },
    ]);
    expect(artists.querySelector("[onerror]")).toBeNull();
    expect(artists.querySelector(".card-title").textContent).toBe(evil);
  });
});

describe("image fallbacks", () => {
  const firstSrc = (list) => list.querySelector("img").getAttribute("src");
  const base = { name: "n", external_urls: { spotify: "https://s/" }, images: [] };

  it("uses an existing default image per kind", () => {
    const a = document.createElement("ul");
    renderArtists(a, [base]);
    expect(firstSrc(a)).toBe("/image/default-artist.jpg");

    const b = document.createElement("ul");
    renderAlbums(b, [{ ...base, artists: [] }]);
    expect(firstSrc(b)).toBe("/image/default-album-cover.png");

    const c = document.createElement("ul");
    renderPlaylists(c, [{ ...base, owner: { display_name: "o" } }]);
    expect(firstSrc(c)).toBe("/image/default-playlist-cover.png");
  });
});

describe("loadSection", () => {
  it("renders loaded items", async () => {
    const list = document.createElement("ul");
    const render = vi.fn();
    await loadSection(list, () => Promise.resolve([1]), render, "err");
    expect(render).toHaveBeenCalledWith(list, [1]);
  });

  it("writes the error message and does not reject on failure", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const list = document.createElement("ul");
    await expect(
      loadSection(list, () => Promise.reject(new Error("x")), vi.fn(), "err")
    ).resolves.toBeUndefined();
    expect(list.innerHTML).toBe("<li>err</li>");
  });
});
