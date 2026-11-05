import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// home.js는 import 시점에 DOM을 조회하고 모달을 띄우므로, 매 테스트마다 픽스처를 만든 뒤 새로 import한다.
const NOW = new Date(2026, 10, 6, 12, 0, 0); // 2026-11-06 12:00 로컬

async function loadHome() {
  vi.resetModules();
  await import("../home.js");
}

function dayOffsetISO(days) {
  const d = new Date(NOW);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

describe("home.js guide modal", () => {
  let modal;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
    localStorage.clear();

    document.body.innerHTML = `
      <header></header>
      <div class="container"></div>
      <button class="search-toggle-btn"></button>
      <input id="search-box" />
      <div class="clossing-search-bar"></div>
      <dialog class="guide-modal"></dialog>
      <button id="closed"></button>
      <button id="dont-show-today"></button>
      <button id="reset-modal"></button>
    `;
    modal = document.querySelector(".guide-modal");
    // jsdom은 HTMLDialogElement.showModal/close를 구현하지 않는다.
    modal.showModal = vi.fn();
    modal.close = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the modal when nothing is stored", async () => {
    await loadHome();
    expect(modal.showModal).toHaveBeenCalledTimes(1);
  });

  it("hides the modal while hideModalUntil is today or later", async () => {
    localStorage.setItem("hideModalUntil", dayOffsetISO(0));
    await loadHome();
    expect(modal.showModal).not.toHaveBeenCalled();

    localStorage.setItem("hideModalUntil", dayOffsetISO(1));
    await loadHome();
    expect(modal.showModal).not.toHaveBeenCalled();
  });

  it("shows the modal again once hideModalUntil is in the past", async () => {
    localStorage.setItem("hideModalUntil", dayOffsetISO(-1));
    await loadHome();
    expect(modal.showModal).toHaveBeenCalledTimes(1);
  });

  it("'don't show today' stores tomorrow and closes the modal", async () => {
    await loadHome();
    document.querySelector("#dont-show-today").click();
    expect(localStorage.getItem("hideModalUntil")).toBe(dayOffsetISO(1));
    expect(modal.close).toHaveBeenCalledTimes(1);
  });

  it("close button closes the modal without storing anything", async () => {
    await loadHome();
    document.querySelector("#closed").click();
    expect(modal.close).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem("hideModalUntil")).toBeNull();
  });

  it("reset button removes the stored value", async () => {
    localStorage.setItem("hideModalUntil", dayOffsetISO(1));
    await loadHome();
    document.querySelector("#reset-modal").click();
    expect(localStorage.getItem("hideModalUntil")).toBeNull();
  });
});
