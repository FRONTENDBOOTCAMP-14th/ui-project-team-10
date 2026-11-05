import { beforeEach, describe, expect, it } from "vitest";
import { initSearchToggle } from "../header.js";

describe("initSearchToggle", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="container"></div>
      <button class="search-toggle-btn"></button>
      <input id="search-box" />
      <div class="clossing-search-bar"></div>
    `;
  });

  it("toggles the search bar on click below the desktop width", () => {
    window.innerWidth = 800;
    initSearchToggle();

    const container = document.querySelector(".container");
    document.querySelector(".search-toggle-btn").click();
    expect(container.classList.contains("hidden")).toBe(true);
    document.querySelector(".search-toggle-btn").click();
    expect(container.classList.contains("hidden")).toBe(false);
  });
});
