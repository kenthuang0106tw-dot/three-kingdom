import type * as Phaser from "phaser";

export interface GameplayClock { now(): number; }
export interface RandomSource { between(min: number, max: number): number; }

export class PhaserGameplayClock implements GameplayClock {
  private readonly scene: Phaser.Scene;
  constructor(scene: Phaser.Scene) { this.scene = scene; }
  now() { return this.scene.time.now; }
}

export class TestClock implements GameplayClock {
  private currentTime: number;
  constructor(currentTime = 0) { this.currentTime = currentTime; }
  now() { return this.currentTime; }
  advance(milliseconds: number) { this.currentTime += milliseconds; }
}

export class SeededRandom implements RandomSource {
  private state: number;

  constructor(seed: number) { this.state = (seed >>> 0) || 1; }

  between(min: number, max: number) {
    if (max < min) throw new Error("Random range must be ordered");
    return min + Math.floor(this.next() * (max - min + 1));
  }

  private next() {
    let value = this.state;
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    this.state = value >>> 0;
    return this.state / 0x100000000;
  }
}
