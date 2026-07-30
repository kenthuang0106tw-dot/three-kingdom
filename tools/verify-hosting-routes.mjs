import { extname } from "node:path";
import { pathToFileURL } from "node:url";
import { collectProductionPublicAssetPaths } from "./package-production-assets.mjs";

export const HOSTING_CONTENT_TYPES = Object.freeze({
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".wav": "audio/wav",
  ".xml": "application/xml",
});

const ACCEPTED_CONTENT_TYPES = Object.freeze({
  ".js": Object.freeze(["text/javascript", "application/javascript"]),
});

function basePathFromUrl(url) {
  const pathname = new URL(url).pathname;
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

function documentRoutes(html, pageUrl) {
  const origin = new URL(pageUrl).origin;
  return [...html.matchAll(/(?:href|src)="([^"]+)"/g)]
    .map(match => new URL(match[1], pageUrl))
    .filter(url => url.origin === origin)
    .map(url => `${url.pathname}${url.search}`);
}

async function verifyRoute(origin, route, expectedType) {
  const response = await fetch(new URL(route, origin));
  const actualType = response.headers.get("content-type") ?? "";
  const acceptedTypes = ACCEPTED_CONTENT_TYPES[extname(new URL(route, origin).pathname)] ?? [expectedType];
  if (response.status !== 200 || !acceptedTypes.some(type => actualType.startsWith(type))) {
    throw new Error(`${route}: expected 200 ${expectedType}, received ${response.status} ${actualType || "(none)"}`);
  }
  return Object.freeze({ route, status: response.status, contentType: actualType });
}

export async function verifyHostingRoutes(pageUrl, { root = process.cwd() } = {}) {
  const normalizedPageUrl = new URL(pageUrl).href;
  const basePath = basePathFromUrl(normalizedPageUrl);
  const documentResponse = await fetch(normalizedPageUrl);
  const documentType = documentResponse.headers.get("content-type") ?? "";
  if (documentResponse.status !== 200 || !documentType.startsWith("text/html")) {
    throw new Error(`${basePath}: expected 200 text/html, received ${documentResponse.status} ${documentType || "(none)"}`);
  }

  const html = await documentResponse.text();
  const generatedRoutes = documentRoutes(html, normalizedPageUrl);
  const publicRoutes = (await collectProductionPublicAssetPaths(root))
    .map(path => `${basePath}${path}`);
  const routes = [...new Set([...generatedRoutes, ...publicRoutes])].sort();
  const results = await Promise.all(routes.map(route => {
    const expectedType = HOSTING_CONTENT_TYPES[extname(new URL(route, normalizedPageUrl).pathname)];
    if (!expectedType) throw new Error(`${route}: unsupported hosting extension`);
    return verifyRoute(normalizedPageUrl, route, expectedType);
  }));

  return Object.freeze({
    pageUrl: normalizedPageUrl,
    basePath,
    document: Object.freeze({ status: documentResponse.status, contentType: documentType }),
    generatedRouteCount: generatedRoutes.length,
    publicRouteCount: publicRoutes.length,
    routes: Object.freeze(results),
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const pageUrl = process.argv[2];
  if (!pageUrl) throw new Error("Usage: node tools/verify-hosting-routes.mjs <page-url>");
  console.log(JSON.stringify(await verifyHostingRoutes(pageUrl), null, 2));
}
