import type { GameplaySnapshot } from "../events/GameplayEvents";

export type HudBarView = Readonly<{
  hp: number;
  maxHp: number;
  ratio: number;
}>;

export type HudViewModel = Readonly<{
  visible: boolean;
  player: HudBarView;
  boss: HudBarView | null;
}>;

function createBar(hp: number, maxHp: number): HudBarView {
  const safeMaxHp = Math.max(1, maxHp);
  const safeHp = Math.max(0, Math.min(hp, safeMaxHp));
  return Object.freeze({ hp: safeHp, maxHp: safeMaxHp, ratio: safeHp / safeMaxHp });
}

export function createHudViewModel(snapshot?: GameplaySnapshot): HudViewModel {
  if (!snapshot) {
    return Object.freeze({ visible: false, player: createBar(0, 1), boss: null });
  }
  return Object.freeze({
    visible: snapshot.flow !== "title",
    player: createBar(snapshot.player.hp, snapshot.player.maxHp),
    boss: snapshot.boss ? createBar(snapshot.boss.hp, snapshot.boss.maxHp) : null,
  });
}
