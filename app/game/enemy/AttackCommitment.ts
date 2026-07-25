export type AttackCommitment = Readonly<{
  facing: 1 | -1;
  lineY: number;
}>;

export function createAttackCommitment(facing: 1 | -1, lineY: number): AttackCommitment {
  return { facing, lineY };
}

export function isWithinAttackLine(commitment: AttackCommitment, targetY: number, range: number): boolean {
  return Math.abs(targetY - commitment.lineY) <= range;
}
