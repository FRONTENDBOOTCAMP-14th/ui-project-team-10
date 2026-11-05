const json = (body, status = 200) => Response.json(body, { status });

export default async function handler(req) {
  if (req.method !== "GET") return json({ error: "method_not_allowed" }, 405);

  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) return json({ error: "missing_credentials" }, 500);

  try {
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + btoa(`${id}:${secret}`),
      },
      body: "grant_type=client_credentials",
    });
    if (!res.ok) return json({ error: "token_request_failed" }, 502);

    const { access_token, expires_in } = await res.json();
    if (typeof access_token !== "string" || !access_token) {
      return json({ error: "token_request_failed" }, 502);
    }
    return json({ access_token, expires_in });
  } catch {
    return json({ error: "token_request_failed" }, 502);
  }
}
