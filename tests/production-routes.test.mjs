import assert from "node:assert/strict";
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { collectProductionPublicAssetPaths } from "../tools/package-production-assets.mjs";
import { createProductionServer } from "../tools/serve-production.mjs";
import {
  HOSTING_CONTENT_TYPES,
  verifyHostingRoutes,
} from "../tools/verify-hosting-routes.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));

async function createGitHubPagesPreviewServer() {
  const outputRoot = resolve(root, "dist-github");
  return http.createServer(async (incoming, outgoing) => {
    const pathname = new URL(incoming.url ?? "/", "http://127.0.0.1").pathname;
    if (!pathname.startsWith("/three-kingdom/")) {
      outgoing.writeHead(404);
      outgoing.end("Not found");
      return;
    }

    const relative = pathname.slice("/three-kingdom/".length) || "index.html";
    const candidate = resolve(outputRoot, decodeURIComponent(relative));
    if (!candidate.startsWith(`${outputRoot}${sep}`)) {
      outgoing.writeHead(404);
      outgoing.end("Not found");
      return;
    }

    try {
      if (!(await stat(candidate)).isFile()) throw Object.assign(new Error("Not found"), { code: "ENOENT" });
      const contentType = HOSTING_CONTENT_TYPES[extname(candidate)] ?? "application/octet-stream";
      outgoing.writeHead(200, { "content-type": `${contentType}; charset=utf-8` });
      outgoing.end(await readFile(candidate));
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
      outgoing.writeHead(404);
      outgoing.end("Not found");
    }
  });
}

test("production server returns only generated routes and runtime public assets", async context => {
  const server = await createProductionServer();
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  context.after(() => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())));
  const { port } = server.address();
  const origin = `http://127.0.0.1:${port}`;

  const htmlResponse = await fetch(`${origin}/`);
  assert.equal(htmlResponse.status, 200);
  const html = await htmlResponse.text();
  assert.match(html, /吞食天地・Phaser 戰鬥原型/);

  const generatedRoutes = [...html.matchAll(/(?:href|src)="(\/assets\/[^"]+)"/g)].map(match => match[1]);
  assert.ok(generatedRoutes.length >= 2);
  for (const route of generatedRoutes) {
    assert.equal((await fetch(`${origin}${route}`)).status, 200, route);
  }

  for (const path of await collectProductionPublicAssetPaths()) {
    const route = `/${path}`;
    const response = await fetch(`${origin}${route}`);
    assert.equal(response.status, 200, route);
    assert.match(response.headers.get("content-type") ?? "", new RegExp(`^${HOSTING_CONTENT_TYPES[extname(path)]}`), route);
  }

  for (const route of [
    "/art/guanyu/guanyu-v2-debug.png",
    "/scene/bamboo-stage/bamboo-stage-overview.png",
    "/scene/source/bamboo-forest-entry-source.png",
  ]) {
    assert.equal((await fetch(`${origin}${route}`)).status, 404, route);
  }
});

test("GitHub Pages serves every generated and runtime route below the repository base path", async context => {
  const server = await createGitHubPagesPreviewServer();
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  context.after(() => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())));
  const { port } = server.address();
  const pageUrl = `http://127.0.0.1:${port}/three-kingdom/`;

  const report = await verifyHostingRoutes(pageUrl, { root });
  assert.equal(report.basePath, "/three-kingdom/");
  assert.equal(report.document.status, 200);
  assert.match(report.document.contentType, /^text\/html/);
  assert.ok(report.generatedRouteCount >= 2);
  assert.equal(report.publicRouteCount, 54);
  assert.ok(report.routes.every(result => result.status === 200));

  const reloadResponse = await fetch(`${pageUrl}?reload=1`);
  assert.equal(reloadResponse.status, 200);
  assert.match(reloadResponse.headers.get("content-type") ?? "", /^text\/html/);

  assert.equal((await fetch(`http://127.0.0.1:${port}/art/guanyu/guanyu-v2.png`)).status, 404);
  assert.equal((await fetch(`${pageUrl}art/guanyu/guanyu-v2-debug.png`)).status, 404);
});
