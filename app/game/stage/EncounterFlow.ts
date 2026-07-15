import type { StageEncounter, StagePoint } from "./StageConfig";

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

export type EncounterSequenceState = {
  readonly nextEncounterIndex: number;
  readonly activeEncounterId: string | null;
  readonly clearedEncounterIds: readonly string[];
};

export type EncounterTriggerResult = {
  readonly state: EncounterSequenceState;
  readonly encounter: StageEncounter;
};

export function createEncounterSequence(): EncounterSequenceState {
  return { nextEncounterIndex: 0, activeEncounterId: null, clearedEncounterIds: [] };
}

export function triggerNextEncounter(
  state: EncounterSequenceState,
  encounters: readonly StageEncounter[],
  previous: StagePoint,
  current: StagePoint,
): EncounterTriggerResult | null {
  if (state.activeEncounterId || state.nextEncounterIndex >= encounters.length || current.x <= previous.x) return null;
  const encounter = encounters[state.nextEncounterIndex];
  const trigger = encounter.trigger;
  const crossedX = previous.x < trigger.x + trigger.width && current.x >= trigger.x;
  const alignedY = current.y >= trigger.y && current.y <= trigger.y + trigger.height;
  if (!crossedX || !alignedY) return null;
  return { state: { ...state, activeEncounterId: encounter.id }, encounter };
}

export function clearActiveEncounter(state: EncounterSequenceState, encounterId: string): EncounterSequenceState {
  if (state.activeEncounterId !== encounterId) return state;
  return {
    nextEncounterIndex: state.nextEncounterIndex + 1,
    activeEncounterId: null,
    clearedEncounterIds: [...state.clearedEncounterIds, encounterId],
  };
}

export function isEncounterSequenceCleared(state: EncounterSequenceState, encounterCount: number): boolean {
  return state.activeEncounterId === null && state.nextEncounterIndex >= encounterCount;
}
