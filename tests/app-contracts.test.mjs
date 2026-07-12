import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  clearRegisteredPhaserGame,
  registerPhaserGame,
  releasePhaserGame,
} from "../app/game/phaserLifecycle.ts";

test("React shell mounts only the Phaser lifecycle component", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /import PhaserGame from "\.\/game\/PhaserGame"/);
  assert.match(page, /<PhaserGame \/>/);
  assert.doesNotMatch(page, /<canvas|requestAnimationFrame|setInterval/);
});

test("Phaser registry survives 20 mount and destroy cycles without duplicates", () => {
  const registry = {};
  const games = [];
  for (let index = 0; index < 20; index += 1) {
    const game = { destroyCalls: 0, destroy() { this.destroyCalls += 1; } };
    clearRegisteredPhaserGame(registry);
    registerPhaserGame(registry, game);
    assert.equal(registry.__dynastyPhaserGame, game);
    releasePhaserGame(registry, game);
    assert.equal(registry.__dynastyPhaserGame, undefined);
    games.push(game);
  }
  assert.deepEqual(games.map(game => game.destroyCalls), Array(20).fill(1));
});

test("Enemy and combat source retain the current three-enemy contracts", async () => {
  const [manager, scene] = await Promise.all([
    readFile(new URL("../app/game/EnemyManager.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/game/MainScene.ts", import.meta.url), "utf8"),
  ]);
  const spawnBlock = manager.match(/const spawns = \[([\s\S]*?)\n    \];/)?.[1] ?? "";
  assert.equal([...spawnBlock.matchAll(/\{ x: \d+, y: \d+ \}/g)].length, 3);
  assert.match(manager, /get currentAttackerId\(\)/);
  assert.match(manager, /markPlayerAttackHit/);
  assert.match(scene, /this\.physics\.overlap\(this\.attackZone, enemy\.bodyZone\)/);
  assert.match(scene, /this\.enemyManager\.markPlayerAttackHit\(enemy, this\.playerAttackId\)/);
});
