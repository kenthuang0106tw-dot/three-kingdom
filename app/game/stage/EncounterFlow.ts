export type EncounterStatus = "ready" | "active" | "cleared";

export type EncounterFlowState = {
  readonly status: EncounterStatus;
  readonly spawnedCount: number;
  readonly removedEnemyIds: readonly number[];
};

export function createEncounterFlow(): EncounterFlowState {
  return { status: "ready", spawnedCount: 0, removedEnemyIds: [] };
}

export function beginEncounter(_state: EncounterFlowState, spawnedCount: number): EncounterFlowState {
  if (!Number.isInteger(spawnedCount) || spawnedCount <= 0) throw new Error("Encounter must spawn at least one enemy");
  return { status: "active", spawnedCount, removedEnemyIds: [] };
}

export function recordEnemyRemoved(state: EncounterFlowState, enemyId: number): EncounterFlowState {
  if (state.status !== "active" || state.removedEnemyIds.includes(enemyId)) return state;
  const removedEnemyIds = [...state.removedEnemyIds, enemyId];
  return {
    status: removedEnemyIds.length >= state.spawnedCount ? "cleared" : "active",
    spawnedCount: state.spawnedCount,
    removedEnemyIds,
  };
}

export function isEncounterCleared(state: EncounterFlowState): boolean {
  return state.status === "cleared";
}
