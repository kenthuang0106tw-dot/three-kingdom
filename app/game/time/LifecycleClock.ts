import * as Phaser from "phaser";
import { ClockState } from "./ClockState";

const HIT_STOP_MS = (1000 / 60) * 4;

/** Owns visibility and hit-stop pause reasons without touching gameplay state. */
export class LifecycleClock {
  readonly state = new ClockState();
  private hitStopTimer?: Phaser.Time.TimerEvent;
  private visibilityPaused = false;
  private readonly onBlur = () => this.setVisibilityPaused(true);
  private readonly onFocus = () => this.setVisibilityPaused(false);

  constructor(private readonly scene: Phaser.Scene) {
    scene.game.events.on("blur", this.onBlur);
    scene.game.events.on("focus", this.onFocus);
  }

  beginHitStop(duration = HIT_STOP_MS) {
    if (this.state.has("hitStop")) return;
    this.state.setPaused("hitStop", true);
    this.applyManagers();
    this.hitStopTimer = this.scene.time.delayedCall(duration, () => {
      this.hitStopTimer = undefined;
      this.state.setPaused("hitStop", false);
      this.applyManagers();
    });
  }

  isPaused() { return this.state.isPaused(); }
  isVisibilityPaused() { return this.visibilityPaused; }

  destroy() {
    this.scene.game.events.off("blur", this.onBlur);
    this.scene.game.events.off("focus", this.onFocus);
    this.hitStopTimer?.remove(false);
    this.hitStopTimer = undefined;
  }

  private setVisibilityPaused(paused: boolean) {
    if (paused === this.visibilityPaused) return;
    this.visibilityPaused = paused;
    this.state.setPaused("visibility", paused);
    if (paused) this.scene.scene.pause();
    else {
      this.scene.scene.resume();
      this.applyManagers();
    }
  }

  private applyManagers() {
    if (this.state.isPaused()) {
      this.scene.physics.world.pause();
      this.scene.anims.pauseAll();
      this.scene.tweens.pauseAll();
    } else {
      this.scene.physics.world.resume();
      this.scene.anims.resumeAll();
      this.scene.tweens.resumeAll();
    }
  }
}
