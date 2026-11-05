// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import handler from "../spotify-token.mjs";

const req = (method = "GET") =>
  new Request("http://localhost/.netlify/functions/spotify-token", { method });

describe("spotify-token function", () => {
  beforeEach(() => {
    vi.stubEnv("SPOTIFY_CLIENT_ID", "id");
    vi.stubEnv("SPOTIFY_CLIENT_SECRET", "shh-secret");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("rejects non-GET with 405", async () => {
    const res = await handler(req("POST"));
    expect(res.status).toBe(405);
  });

  it("returns 500 missing_credentials when env is not set", async () => {
    vi.stubEnv("SPOTIFY_CLIENT_SECRET", "");
    const res = await handler(req());
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "missing_credentials" });
  });

  it("returns 502 token_request_failed when Spotify responds non-ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 400 })));
    const res = await handler(req());
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "token_request_failed" });
  });

  it("returns 502 when fetch itself rejects", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    const res = await handler(req());
    expect(res.status).toBe(502);
  });

  it("returns only access_token and expires_in, never the secret", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({ access_token: "tok", expires_in: 3600, token_type: "Bearer" })
    );
    vi.stubGlobal("fetch", fetchMock);

    const res = await handler(req());
    const text = await res.text();

    expect(res.status).toBe(200);
    expect(JSON.parse(text)).toEqual({ access_token: "tok", expires_in: 3600 });
    expect(text).not.toContain("shh-secret");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://accounts.spotify.com/api/token");
    expect(init.headers.Authorization).toBe("Basic " + btoa("id:shh-secret"));
  });
});
