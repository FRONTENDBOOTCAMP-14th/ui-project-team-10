import { beforeEach, describe, expect, it, vi } from "vitest";

describe("indexBackground.js", () => {
  beforeEach(() => {
    vi.resetModules();
    // index.html has a <header> but no .guide-modal / #closed
    document.body.innerHTML = `<header></header>`;
  });

  it("imports without throwing when the page has no guide modal", async () => {
    await expect(import("../indexBackground.js")).resolves.toBeDefined();
  });

  it("sets background-size to cover below the maximized breakpoint", async () => {
    vi.stubGlobal("innerWidth", 1200);
    await import("../indexBackground.js");
    window.dispatchEvent(new Event("resize"));
    expect(document.querySelector("header").style.backgroundSize).toBe("cover");
    vi.unstubAllGlobals();
  });

  it("zooms with scroll on maximized windows, capped at 200%", async () => {
    vi.stubGlobal("innerWidth", 1700);
    vi.stubGlobal("scrollY", 400);
    await import("../indexBackground.js");
    window.dispatchEvent(new Event("scroll"));
    // jsdom normalizes "120%" to "120% auto"
    expect(document.querySelector("header").style.backgroundSize).toMatch(/^120%/);

    vi.stubGlobal("scrollY", 100000);
    window.dispatchEvent(new Event("scroll"));
    expect(document.querySelector("header").style.backgroundSize).toMatch(/^200%/);
    vi.unstubAllGlobals();
  });
});
