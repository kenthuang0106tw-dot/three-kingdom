export type FailureRestartSource = "keyboard" | "pointer";

/** Accepts at most one explicit restart request for each failed state. */
export class FailureRestartGate {
  private isOpen = false;
  private accepted = false;
  private pending?: FailureRestartSource;

  open(): void {
    this.isOpen = true;
    this.accepted = false;
    this.pending = undefined;
  }

  request(source: FailureRestartSource): boolean {
    if (!this.isOpen || this.accepted) return false;
    this.accepted = true;
    this.pending = source;
    return true;
  }

  consume(): FailureRestartSource | undefined {
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
