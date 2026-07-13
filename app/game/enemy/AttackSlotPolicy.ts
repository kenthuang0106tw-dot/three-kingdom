export type AttackSlotCandidate = {
  readonly id: number;
  readonly attackSlotGrantCount: number;
};

export function selectFairAttackCandidate<T extends AttackSlotCandidate>(
  candidates: readonly T[],
  lastAttackerId: number | null,
): T | null {
  if (candidates.length === 0) return null;

  const ordered = [...candidates].sort((a, b) => a.id - b.id);
  const nextIndex = lastAttackerId === null
    ? 0
    : ordered.findIndex(candidate => candidate.id > lastAttackerId);
  const startIndex = nextIndex < 0 ? 0 : nextIndex;
  const rotated = [...ordered.slice(startIndex), ...ordered.slice(0, startIndex)];
  const minimumGrantCount = Math.min(...rotated.map(candidate => candidate.attackSlotGrantCount));
  return rotated.find(candidate => candidate.attackSlotGrantCount === minimumGrantCount) ?? null;
}
