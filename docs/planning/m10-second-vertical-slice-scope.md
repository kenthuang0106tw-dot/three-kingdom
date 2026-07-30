# M10 Second Vertical Slice Scope Lock

Date: 2026-07-30

## Decision

The second Vertical Slice will make **Zhang Fei a second playable general in
the existing released bamboo Stage**.

This is the smallest increment that is visibly different to the player and
advances the original product requirement of Guan Yu, Zhang Fei, and Zhao Yun.
It reuses the accepted Stage, five enemies, Boss, Camera, flow, mobile, Audio,
and release contracts instead of starting a second content stack.

## Player-visible Result

From the Phaser Title screen, the player chooses Guan Yu or Zhang Fei and can
complete the existing Title → two encounters → Boss → Result flow with either
general.

Zhang Fei must be visually and tactically distinct:

- Japanese arcade-realistic Three Kingdoms pixel-art identity.
- Heavy warrior silhouette and serpent-spear weapon identity.
- Lower mobility and longer attack commitment than Guan Yu.
- Higher damage, impact, or space-control return, proven by playtest.
- Same one-button, three-stage hit-confirm combo grammar; no new input.

Exact balance values are not fixed by this planning task. They must be measured
in the isolated prototype before formal integration. Zhang Fei must not become
strictly better or worse than Guan Yu.

## Included Scope

- One minimal `PlayerDefinition` seam for the two known playable generals.
- Guan Yu regression freeze through the new seam.
- Zhang Fei gameplay/animation production contract and approved identity gate.
- Genuine idle, walk, attack1–3, hurt, and dead frames with measured atlas
  metadata, one feet anchor, one display scale, debug, onion, and preview QA.
- Development-only Zhang Fei combat prototype in the existing combat context.
- Phaser-owned two-character selection on Title.
- Formal integration into the existing full Stage.
- Desktop, 844×390, 390×844, reset, Pause, performance, packaging, production,
  and public-route acceptance.

## Explicitly Excluded

- Zhao Yun.
- A second Stage, new Stage theme, new encounter sequence, or new Boss.
- New enemy types or changes to existing enemy HP, AI, damage, or timing.
- New buttons, skills, dodge, jump, rage, weapon pickup, progression, or
  character growth.
- New music, voice, or character-specific SFX.
- Save data, backend, online services, co-op, or multiplayer.
- A generic character framework for an unknown number of future actors.
- Unrelated refactoring of EnemyManager, Stage, Camera, UI, Audio, or React.

## Preserved Contracts

- React owns only the shell and Phaser lifecycle.
- Keyboard and touch continue through the shared `ActionSnapshot`.
- Player states remain `idle | walk | attack1 | attack2 | attack3 | hurt |
  dead`.
- Hit-confirm, one-input/one-step, per-target hit-once, independent hitbox,
  Hit Stop, Flash, Spark, Knockback, and Shake contracts remain.
- EnemyManager, single Attack Slot, five enemy roles, Boss, Stage geometry,
  Camera locks/handoff, Pause, Failure, Result, Audio events, and accessibility
  settings remain unchanged.
- Retry/replay returns to Title and requires a new explicit character choice;
  no hidden selection persistence is added.

## Dependency Order

1. **10.2 Player Definition Boundary and Guan Yu Freeze**
   Introduce only the data seam required by a second known player. Runtime still
   registers and plays Guan Yu only.
2. **10.3 Zhang Fei Gameplay and Production Contract**
   Lock heavy-warrior decisions, animation budget, identity reference, atlas
   rules, and prototype comparison plan before full art production.
3. **10.4 Zhang Fei Atlas and Animation Preview**
   Produce genuine frames and QA evidence; no formal Stage selection yet.
4. **10.5 Zhang Fei Combat Prototype**
   Tune the heavy commitment/reward tradeoff in a development-only entrance.
5. **10.6 Character Select and Formal Integration**
   Add Phaser Title selection and complete the released Stage with both actors.
6. **10.7 Second Vertical Slice Acceptance**
   Full regression, performance, packaging, mobile, and release-candidate
   evidence.

## Acceptance Matrix

| Area | Required result |
| --- | --- |
| Product | Zhang Fei is visibly and tactically distinct from Guan Yu |
| Guan Yu | Existing movement, attacks, damage, timing, art, and full clear remain unchanged |
| Combat | Both actors obey the same state, hit-confirm, hit-once, and effect contracts |
| Selection | Phaser owns one explicit two-character Title choice; React owns none |
| Art | Genuine frames, approved identity, measured atlas, stable feet, one scale |
| Stage | Same two encounters and Boss can be cleared or failed by either actor |
| Lifecycle | Pause, visibility, Failure/Retry, Result/Replay, and 10 resets have no stale selection or actor |
| Mobile | 844×390 and 390×844 selection, movement, attack, Pause, and full flow pass |
| Performance | Existing frame, memory, asset-delivery, and Canvas budgets remain green |
| Production | Both builds, runtime inventory, routes, one Canvas, and debug isolation pass |

## Rejection Conditions

- The work requires a second Stage, new enemy, or new Boss to make Zhang Fei
  useful.
- Zhang Fei is only a Guan Yu recolor or reuses Guan Yu's animation sequence.
- The only distinction is more HP or damage.
- Guan Yu behavior changes to fit a generic abstraction.
- Character selection is stored in React or a parallel gameplay state.
- Art is integrated before its identity, feet, frame, and gameplay contract is
  accepted.
- Zhang Fei is always the correct choice or almost never worth choosing.

## Next Task

M10 / Task 10.2 — Player Definition Boundary and Guan Yu Freeze.
