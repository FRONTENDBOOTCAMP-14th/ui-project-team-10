import { beforeEach, describe, expect, it, vi } from "vitest";
import { copyToClipboard } from "../copy-button.js";

describe("copyToClipboard", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <p id="source">hello <b>world</b></p>
      <button id="btn">copy</button>
    `;
    vi.stubGlobal("alert", vi.fn());
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockResolvedValue() } });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("copies text content on click and alerts success", async () => {
    await copyToClipboard("source", "btn");
    document.getElementById("btn").click();
    await vi.waitFor(() => expect(alert).toHaveBeenCalledWith("복사 성공!"));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("hello world");
  });

  it("copies innerHTML when copyType is html", async () => {
    await copyToClipboard("source", "btn", "html");
    document.getElementById("btn").click();
    await vi.waitFor(() => expect(alert).toHaveBeenCalled());
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("hello <b>world</b>");
  });

  it("alerts failure when clipboard rejects", async () => {
    navigator.clipboard.writeText.mockRejectedValue(new Error("denied"));
    await copyToClipboard("source", "btn");
    document.getElementById("btn").click();
    await vi.waitFor(() => expect(alert).toHaveBeenCalledWith("복사 실패!"));
  });

  it("logs an error and registers no handler when elements are missing", async () => {
    await copyToClipboard("missing", "btn");
    document.getElementById("btn").click();
    expect(console.error).toHaveBeenCalledWith("Required elements not found");
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
  });
});
