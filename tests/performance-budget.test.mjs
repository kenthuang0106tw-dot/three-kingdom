import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  PERFORMANCE_SAMPLE_CONFIG,
  PerformanceSampler,
  summarizeFrameDeltas,
} from "../app/game/debug/PerformanceSampler.ts";
import { collectPerformanceAssetReport } from "../tools/report_performance_assets.mjs";

test("Performance sampler uses the fixed warm-up and 300-frame contract", () => {
  const sampler = new PerformanceSampler();
  for (let index = 0; index < PERFORMANCE_SAMPLE_CONFIG.warmupFrames; index += 1) {
    assert.equal(sampler.record(50), undefined);
  }
  for (let index = 0; index < PERFORMANCE_SAMPLE_CONFIG.sampleFrames - 1; index += 1) {
    assert.equal(sampler.record(1000 / 60), undefined);
  }
  const sample = sampler.record(25);

  assert.equal(sample?.sampleCount, 300);
  assert.ok(sample.averageFps < 60);
  assert.equal(sample.worstFrameTimeMs, 25);
  assert.ok(sample.onePercentLowFps < 60);
  assert.equal(sampler.record(100), undefined);
});

test("Performance summary derives average, one-percent low, and worst frame", () => {
  const deltas = Array.from({ length: 300 }, () => 10);
  deltas[297] = 20;
  deltas[298] = 25;
  deltas[299] = 50;
  const sample = summarizeFrameDeltas(deltas);

  assert.equal(sample.sampleCount, 300);
  assert.equal(sample.worstFrameTimeMs, 50);
  assert.equal(sample.onePercentLowFps, 1000 / ((20 + 25 + 50) / 3));
  assert.ok(sample.averageFps > sample.onePercentLowFps);
  assert.ok(Object.isFrozen(sample));
});

test("Performance profiling is development-only and exposes readonly datasets", async () => {
  const [scene, shell] = await Promise.all([
    readFile(new URL("../app/game/MainScene.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/game/PhaserGame.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(scene, /this\.performanceProfileMode = development && query\.get\("performanceProfile"\) === "1"/);
  assert.match(scene, /performanceProfileCheckpoint/);
  assert.match(scene, /performanceProfileWorstFrameTimeMs/);
  assert.match(scene, /performanceProfileHeapUsedBytes/);
  assert.match(scene, /this\.updatePerformanceProfileMetrics\(\)/);
  assert.match(scene, /case "title":[\s\S]*case "combat":[\s\S]*case "handoff":[\s\S]*case "boss":[\s\S]*case "failure":[\s\S]*case "result":/);
  assert.match(scene, /this\.performanceProfileMode && this\.performanceCheckpoint === "failure"/);
  assert.match(scene, /performanceProfileViewport/);
  assert.match(shell, /process\.env\.NODE_ENV !== "production"/);
  assert.match(shell, /landscape: \{ width: "832px", height: "390px" \}/);
  assert.match(shell, /portrait: \{ width: "390px", height: "182\.8125px" \}/);
  assert.match(shell, /shell\.removeAttribute\("style"\)/);
});

test("Performance asset report separates requested runtime files from deployment size", async () => {
  const report = await collectPerformanceAssetReport(fileURLToPath(new URL("..", import.meta.url)));

  assert.equal(report.logicalEntries, 35);
  assert.equal(report.requestFiles, 43);
  assert.equal(report.byExtension[".png"].files, 23);
  assert.equal(report.byExtension[".wav"].files, 12);
  assert.equal(report.decodedRgbaBytes, 128_888_320);
  assert.equal(report.productionPublicFiles, 46);
  assert.ok(report.productionPublicBytes > report.encodedBytes);
  assert.ok(report.encodedBytes < 15 * 1024 * 1024);
  assert.ok(report.githubPagesBytes === null || report.githubPagesBytes > report.encodedBytes);
  assert.ok(report.githubPagesBytes === null || report.githubPagesBytes < 30 * 1024 * 1024);
  assert.ok(report.githubPagesJavaScriptBytes === null || report.githubPagesJavaScriptBytes < 2 * 1024 * 1024);
});
