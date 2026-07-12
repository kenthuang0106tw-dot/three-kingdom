import assert from "node:assert/strict";
import test from "node:test";
import { createProductionServer } from "../tools/serve-production.mjs";

test("production server returns HTML, generated assets, atlases and sprites", async context => {
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

  for (const route of [
    "/art/guanyu/guanyu-attack.atlas.json",
    "/art/guanyu/guanyu-combo.png",
    "/art/enemy/enemy-soldier.atlas.json",
    "/art/enemy/enemy-soldier.png",
    "/scene/forest-camp.png",
  ]) {
    assert.equal((await fetch(`${origin}${route}`)).status, 200, route);
  }
});
