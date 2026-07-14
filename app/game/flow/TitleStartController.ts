import type { GameFlowStateMachine } from "./GameFlowStateMachine";

/** Guards a single Title start through the game-flow owner. */
export class TitleStartController {
  private readonly flow: GameFlowStateMachine;

  constructor(flow: GameFlowStateMachine) {
    this.flow = flow;
  }

  requestStart(): boolean {
    if (this.flow.state !== "title") return false;
    this.flow.transition("playing");
    return true;
  }
}
