import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const FAIL_MESSAGE = "페이지를 불러올 수 없습니다.";

async function boot(hash) {
  // replaceState does not fire hashchange
  history.replaceState(null, "", hash || location.pathname);
  vi.resetModules();
  await import("../page.js");
  // in browsers DOMContentLoaded bubbles from document to window
  document.dispatchEvent(new Event("DOMContentLoaded", { bubbles: true }));
}

describe("page.js hash loader", () => {
  let main;

  beforeEach(() => {
    document.body.innerHTML = `<main class="main-component"><p>home</p></main>`;
    main = document.querySelector(".main-component");
    // jsdom logs "Not implemented: navigation" for location.reload()
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    history.replaceState(null, "", location.pathname);
  });

  it("does nothing without a hash", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await boot("");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(main.textContent).toBe("home");
  });

  it("loads an allow-listed page into .main-component", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(new Response("<p>install</p>")));
    vi.stubGlobal("fetch", fetchMock);
    await boot("#install-page");
    await vi.waitFor(() => expect(main.textContent).toBe("install"));
    expect(fetchMock).toHaveBeenCalledWith("./install-page.html");
  });

  it("injects only style elements and body content from a full document", async () => {
    const doc =
      '<!DOCTYPE html><html><head><title>T</title><link rel="stylesheet" href="/x.css"><style>.a{}</style></head><body><p>install</p></body></html>';
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(new Response(doc))));
    await boot("#install-page");
    await vi.waitFor(() => expect(main.textContent).toContain("install"));
    expect(main.querySelector("style")).not.toBeNull();
    expect(main.querySelector("title, link")).toBeNull();
  });

  it("never fetches a hash that is not allow-listed", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await boot("#../../secret");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(main.textContent).toBe("home");
  });

  it("shows the failure message on a non-ok response instead of injecting the body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response("<h1>404 body</h1>", { status: 404 })))
    );
    await boot("#install-page");
    await vi.waitFor(() => expect(main.textContent).toBe(FAIL_MESSAGE));
  });

  it("shows the failure message when fetch rejects", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("offline"))));
    await boot("#install-page");
    await vi.waitFor(() => expect(main.textContent).toBe(FAIL_MESSAGE));
  });

  it("hashchange does not fetch (the page reloads instead)", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(new Response("<p>x</p>")));
    vi.stubGlobal("fetch", fetchMock);
    await boot("");
    history.replaceState(null, "", "#install-page");
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    await Promise.resolve();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
