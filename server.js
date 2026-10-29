import { stat } from "node:fs/promises";
import { resolve, sep } from "node:path";

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const publicDirectory = process.env.PUBLIC_DIR
  ? resolve(process.env.PUBLIC_DIR)
  : null;
const links = new Map();
const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function getBaseUrl() {
  if (process.env.BASE_URL) {
    return new URL(process.env.BASE_URL).origin;
  }

  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN.replace(/\/$/, "")}`;
  }

  return `http://localhost:${port}`;
}

const baseUrl = getBaseUrl();

function corsHeaders(extraHeaders = {}) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    ...extraHeaders,
  };
}

function jsonResponse(data, status = 200) {
  return Response.json(data, { status, headers: corsHeaders() });
}

function createCode() {
  while (true) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    let code = "";

    for (const byte of bytes) {
      if (byte >= 248) continue;
      code += alphabet[byte % alphabet.length];
      if (code.length === 6) break;
    }

    if (code.length === 6 && !links.has(code)) return code;
  }
}

async function serveStaticFile(pathname) {
  if (!publicDirectory) return null;

  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  const relativePath = decodedPath === "/" ? "index.html" : decodedPath.slice(1);
  const filePath = resolve(publicDirectory, relativePath);
  if (!filePath.startsWith(`${publicDirectory}${sep}`)) return null;

  try {
    if (!(await stat(filePath)).isFile()) return null;
    return new Response(Bun.file(filePath), { headers: corsHeaders() });
  } catch {
    return null;
  }
}

async function handleRequest(request) {
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (url.pathname === "/api/links" && request.method === "GET") {
    return jsonResponse(Array.from(links.values()));
  }

  if (url.pathname === "/api/links" && request.method === "POST") {
    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON" }, 400);
    }

    if (typeof body?.url !== "string") {
      return jsonResponse({ error: "A URL is required" }, 400);
    }

    let targetUrl;
    try {
      targetUrl = new URL(body.url);
      if (targetUrl.protocol !== "http:" && targetUrl.protocol !== "https:") {
        throw new Error("Unsupported URL scheme");
      }
    } catch {
      return jsonResponse({ error: "URL must be a valid HTTP or HTTPS URL" }, 400);
    }

    const code = createCode();
    const link = {
      code,
      url: targetUrl.href,
      shortUrl: `${baseUrl}/${code}`,
      hits: 0,
      createdAt: new Date().toISOString(),
    };
    links.set(code, link);
    return jsonResponse(link, 201);
  }

  const staticResponse = request.method === "GET"
    ? await serveStaticFile(url.pathname)
    : null;
  if (staticResponse) return staticResponse;

  const codeMatch = url.pathname.match(/^\/([^/]+)$/);
  if (request.method === "GET" && codeMatch) {
    const link = links.get(codeMatch[1]);
    if (!link) return jsonResponse({ error: "Link not found" }, 404);

    link.hits += 1;
    return new Response(null, {
      status: 302,
      headers: corsHeaders({ Location: link.url }),
    });
  }

  return jsonResponse({ error: "Not found" }, 404);
}

Bun.serve({
  port,
  fetch: handleRequest,
});

console.log(`Snip backend listening on ${baseUrl}`);