import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const spotify = (path) => ({
  external_urls: { spotify: "https://s/" + path },
  images: [],
  name: path,
});

function stubFetch({ tokenOk = true } = {}) {
  const fetchMock = vi.fn((url) => {
    const u = String(url);
    if (u.includes("spotify-token")) {
      return Promise.resolve(
        tokenOk ? Response.json({ access_token: "tok" }) : new Response("{}", { status: 502 })
      );
    }
    if (u.includes("/artists?")) {
      return Promise.resolve(Response.json({ artists: [spotify("artist")] }));
    }
    if (u.includes("/albums?")) {
      return Promise.resolve(
        Response.json({ albums: [{ ...spotify("album"), artists: [{ name: "X" }] }] })
      );
    }
    return Promise.resolve(
      Response.json({ ...spotify("pl"), owner: { display_name: "me" } })
    );
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

async function boot() {
  vi.resetModules();
  await import("../main.js");
  document.dispatchEvent(new Event("DOMContentLoaded"));
}

describe("scripts/main.js", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <section class="artist-section">
        <button class="artist-scroll-btn-left"></button>
        <button class="artist-scroll-btn-right"></button>
        <button class="artist-show-all">Show All</button>
        <ul class="artist-list"></ul>
      </section>
      <button class="album-scroll-btn-left"></button>
      <button class="album-scroll-btn-right"></button>
      <button class="album-show-all">Show All</button>
      <ul class="album-list"></ul>
      <button class="playlist-scroll-btn-left"></button>
      <button class="playlist-scroll-btn-right"></button>
      <button class="playlist-show-all">Show All</button>
      <ul class="playlist-list"></ul>
    `;
  });

  afterEach(() => vi.unstubAllGlobals());

  it("requests the token exactly once and renders all three lists", async () => {
    const fetchMock = stubFetch();
    await boot();
    await vi.waitFor(() =>
      expect(document.querySelectorAll(".playlist-list .list-card").length).toBeGreaterThan(0)
    );

    const tokenCalls = fetchMock.mock.calls.filter(([u]) => String(u).includes("spotify-token"));
    expect(tokenCalls).toHaveLength(1);
    expect(document.querySelectorAll(".artist-list .list-card")).toHaveLength(1);
    expect(document.querySelectorAll(".album-list .list-card")).toHaveLength(1);
  });

  it("shows failure messages in all three lists when the token fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    stubFetch({ tokenOk: false });
    await boot();
    await vi.waitFor(() =>
      expect(document.querySelector(".artist-list").textContent).toContain(
        "아티스트 정보를 불러오지 못했습니다."
      )
    );
    expect(document.querySelector(".album-list").textContent).toContain(
      "앨범 정보를 불러오지 못했습니다."
    );
    expect(document.querySelector(".playlist-list").textContent).toContain(
      "플레이리스트 정보를 불러오지 못했습니다."
    );
  });

  it("show-all toggles grid-mode and hides the scroll buttons", async () => {
    stubFetch();
    await boot();
    const list = document.querySelector(".album-list");
    document.querySelector(".album-show-all").click();
    expect(list.classList.contains("grid-mode")).toBe(true);
    expect(document.querySelector(".album-scroll-btn-left").style.display).toBe("none");
    document.querySelector(".album-show-all").click();
    expect(list.classList.contains("grid-mode")).toBe(false);
    expect(document.querySelector(".album-scroll-btn-left").style.display).toBe("block");
  });
});
