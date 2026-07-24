import assert from "node:assert/strict";
import test from "node:test";
import { extname } from "node:path";
import { collectProductionPublicAssetPaths } from "../tools/package-production-assets.mjs";
import { createProductionServer } from "../tools/serve-production.mjs";

const CONTENT_TYPES = {
  ".json": "application/json",
  ".png": "image/png",
  ".wav": "audio/wav",
  ".xml": "application/xml",
};

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
    assert.match(response.headers.get("content-type") ?? "", new RegExp(`^${CONTENT_TYPES[extname(path)]}`), route);
  }

  for (const route of [
    "/art/guanyu/guanyu-v2-debug.png",
    "/scene/bamboo-stage/bamboo-stage-overview.png",
    "/scene/source/bamboo-forest-entry-source.png",
  ]) {
    assert.equal((await fetch(`${origin}${route}`)).status, 404, route);
  }
});
