import type { GameplayEvent } from "./GameplayEvents";

export type StageCompletedEvent = Extract<GameplayEvent, { type: "stage-completed" }>;

/** One-shot publication ownership for a single Scene run. */
export class StageCompletionGate {
  private completed = false;

  complete(stageId: string, at: number): StageCompletedEvent | null {
    if (this.completed) return null;
    this.completed = true;
    return { type: "stage-completed", stageId, at };
  }

  reset(): void {
    this.completed = false;
  }
}
