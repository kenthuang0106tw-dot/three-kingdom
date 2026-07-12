import type { StageExit } from "./StageConfig";

export type StageExitStatus = "locked" | "available" | "requested";

export type StageExitState = {
  readonly status: StageExitStatus;
  readonly exitId: string | null;
};

export function createStageExitState(exits: readonly StageExit[]): StageExitState {
  if (new Set(exits.map(exit => exit.id)).size !== exits.length) throw new Error("Duplicate stage exit id");
  return { status: "locked", exitId: null };
}

export function makeExitAvailable(state: StageExitState, exits: readonly StageExit[], exitId: string): StageExitState {
  if (state.status !== "locked" || !exits.some(exit => exit.id === exitId)) return state;
  return { status: "available", exitId };
}

export function requestStageExit(state: StageExitState): StageExitState {
  return state.status === "available" ? { status: "requested", exitId: state.exitId } : state;
}

export function resetStageExit(): StageExitState {
  return { status: "locked", exitId: null };
}

export function canRequestStageExit(state: StageExitState): boolean {
  return state.status === "available";
}
