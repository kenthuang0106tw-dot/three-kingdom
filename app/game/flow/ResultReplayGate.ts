export type ResultReplaySource = "keyboard" | "pointer";

/** Accepts at most one explicit replay request for each cleared state. */
export class ResultReplayGate {
  private isOpen = false;
  private accepted = false;
  private pending?: ResultReplaySource;

  open(): void {
    this.isOpen = true;
    this.accepted = false;
    this.pending = undefined;
  }

  request(source: ResultReplaySource): boolean {
    if (!this.isOpen || this.accepted) return false;
    this.accepted = true;
    this.pending = source;
    return true;
  }

  consume(): ResultReplaySource | undefined {
    const source = this.pending;
    this.pending = undefined;
    return source;
  }

  close(): void {
    this.isOpen = false;
    this.accepted = false;
    this.pending = undefined;
  }
}
