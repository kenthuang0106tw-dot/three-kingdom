# NEXT_TASK

## M10 / Task 10.1 — Second Vertical Slice Scope Lock

### Why this is next

Version `0.1.0` completes the first public Vertical Slice. The backlog now
contains several large, competing directions: another playable general, a
second Stage, more content, and release-operations improvements. Implementing
one without first fixing the next playable goal would recreate cross-milestone
scope drift and expensive rework.

### Completion conditions

- Review owner feedback from `0.1.0` and the existing P1/P2 backlog.
- Select exactly one player-visible goal for the second Vertical Slice.
- Define strict included and excluded scope.
- Order its minimum dependencies and tasks.
- Give every task measurable acceptance criteria and expected files.
- Identify which existing contracts must remain unchanged.
- Select exactly one implementation task as the next NEXT_TASK.
- Do not implement gameplay, content, art, Audio, UI, Stage, or infrastructure.

### Acceptance and validation

- The selected increment is playable and demonstrably different from `0.1.0`.
- It can be delivered without simultaneously adding a new character, Stage,
  enemy family, and progression system.
- Dependencies prevent art from preceding accepted gameplay contracts.
- Mobile, reset, Pause, performance, production, and rollback regressions have
  explicit acceptance coverage.
- The project owner can accept or reject the scope before implementation.

### Expected files

- `GAME_ROADMAP.md`
- `BACKLOG.md`
- `SPRINT.md`
- `NEXT_TASK.md`
- Planning/checklist documents only.

### Risks

- Choosing several visible features instead of one coherent slice.
- Starting production art before gameplay acceptance.
- Treating release-operation debt as a gameplay blocker.
- Expanding the first post-release task into implementation.
