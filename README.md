# Snip backend

Zero-dependency Bun URL shortener. Start it with `bun start` (default port 3000).
Set `PORT`, `BASE_URL`, or `RAILWAY_PUBLIC_DOMAIN` to configure the server; set
`PUBLIC_DIR` to also serve static files from a directory.

- `POST /api/links` with `{ "url": "https://example.com" }` creates a short link.
- `GET /api/links` lists links.
- `GET /:code` redirects to the original URL and increments its hit count.

Links are held in memory and are cleared when the server restarts.