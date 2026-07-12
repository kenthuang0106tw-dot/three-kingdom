export type CombatTargetSnapshot = Readonly<{
  id: number;
  hp: number;
  active: boolean;
}>;

export type CombatHit = Readonly<{
  targetId: number;
  damage: number;
  remainingHp: number;
}>;

export type CombatResolution = Readonly<{
  attackId: number;
  hits: readonly CombatHit[];
  hitTargetIds: ReadonlySet<number>;
}>;

export type ResolveAttackInput = Readonly<{
  attackId: number;
  damage: number;
  targets: readonly CombatTargetSnapshot[];
  hitTargetIds: ReadonlySet<number>;
}>;

/** Purely resolves one attack against the targets overlapping its hitbox. */
export function resolveAttack(input: ResolveAttackInput): CombatResolution {
  const hitTargetIds = new Set(input.hitTargetIds);
  const hits: CombatHit[] = [];
  const damage = Math.max(0, Math.floor(input.damage));

  for (const target of input.targets) {
    if (!target.active || hitTargetIds.has(target.id)) continue;
    hitTargetIds.add(target.id);
    hits.push({
      targetId: target.id,
      damage,
      remainingHp: Math.max(0, target.hp - damage),
    });
  }

  return { attackId: input.attackId, hits, hitTargetIds };
}
