import * as Phaser from "phaser";
import type { GameplayEventHub } from "../events/GameplayEvents";
import { createHudViewModel } from "./HudViewModel";

const HUD_DEPTH = 21_000;
const PLAYER_BAR_WIDTH = 300;
const BOSS_BAR_WIDTH = 500;
const BAR_HEIGHT = 22;

type HudBar = Readonly<{
  container: Phaser.GameObjects.Container;
  fill: Phaser.GameObjects.Graphics;
  value: Phaser.GameObjects.Text;
  width: number;
  color: number;
}>;

/** Phaser-owned presentation that observes gameplay only through the readonly event hub. */
export class GameHud {
  private readonly root: Phaser.GameObjects.Container;
  private readonly playerBar: HudBar;
  private readonly bossBar: HudBar;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly events: GameplayEventHub,
    private readonly development: boolean,
  ) {
    this.playerBar = this.createBar(24, 20, PLAYER_BAR_WIDTH, 0xe6b92f, "PLAYER");
    this.bossBar = this.createBar(390, 20, BOSS_BAR_WIDTH, 0xc83b35, "BOSS");
    this.root = scene.add.container(0, 0, [this.playerBar.container, this.bossBar.container])
      .setScrollFactor(0)
      .setDepth(HUD_DEPTH);
  }

  update(): void {
    const view = createHudViewModel(this.events.getSnapshot());
    this.root.setVisible(view.visible);
    this.updateBar(this.playerBar, view.player.hp, view.player.maxHp, view.player.ratio);
    this.bossBar.container.setVisible(view.boss !== null);
    if (view.boss) this.updateBar(this.bossBar, view.boss.hp, view.boss.maxHp, view.boss.ratio);

    if (this.development) {
      const dataset = this.scene.game.canvas.dataset;
      dataset.hudVisible = String(view.visible);
      dataset.hudPlayerHp = String(view.player.hp);
      dataset.hudBossVisible = String(view.boss !== null);
      dataset.hudBossHp = view.boss ? String(view.boss.hp) : "";
      dataset.hudObjectCount = "13";
    }
  }

  destroy(): void {
    this.root.destroy(true);
  }

  private createBar(x: number, y: number, width: number, color: number, label: string): HudBar {
    const panel = this.scene.add.graphics()
      .fillStyle(0x080b0a, 0.86)
      .fillRoundedRect(-8, -6, width + 16, 58, 7)
      .lineStyle(2, 0xe8d7a0, 1)
      .strokeRoundedRect(-8, -6, width + 16, 58, 7);
    const track = this.scene.add.graphics()
      .fillStyle(0x241b18, 1)
      .fillRect(0, 27, width, BAR_HEIGHT)
      .lineStyle(2, 0xf4e8bd, 1)
      .strokeRect(0, 27, width, BAR_HEIGHT);
    const fill = this.scene.add.graphics();
    const title = this.scene.add.text(0, 0, label, {
      fontFamily: "Consolas, monospace", fontSize: "20px", color: "#fff1bd",
      stroke: "#35130d", strokeThickness: 3,
    });
    const value = this.scene.add.text(width, 0, "", {
      fontFamily: "Consolas, monospace", fontSize: "18px", color: "#ffffff",
      stroke: "#1b0b08", strokeThickness: 3,
    }).setOrigin(1, 0);
    const container = this.scene.add.container(x, y, [panel, track, fill, title, value]);
    return Object.freeze({ container, fill, value, width, color });
  }

  private updateBar(bar: HudBar, hp: number, maxHp: number, ratio: number): void {
    bar.fill.clear();
    if (ratio > 0) bar.fill.fillStyle(bar.color, 1).fillRect(2, 29, Math.round((bar.width - 4) * ratio), BAR_HEIGHT - 4);
    bar.value.setText(`${hp} / ${maxHp}`);
  }
}
