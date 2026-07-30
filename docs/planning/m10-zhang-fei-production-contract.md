# M10 / Task 10.3 — Zhang Fei Gameplay and Production Contract

Status: **Accepted for Task 10.4 production preview**

This document freezes the second playable general before any new frame is
produced or registered at runtime. Values in the gameplay tables are prototype
hypotheses for Task 10.5, not final balance and not authorization to change the
current game in Task 10.4.

## 1. Existing-source feasibility audit

The six existing files are legacy feasibility inputs only. None is an approved
runtime atlas.

| File | Canvas | Format | Observed content | Disposition |
|---|---:|---|---|---|
| `zhangfei-master.png` | 1024×1536 | ARGB | one transparent, high-detail unarmed heavy-warrior pose | identity concept reference only |
| `zhangfei-master-source.png` | 1024×1536 | RGB | opaque source for the same pose | provenance input only |
| `zhangfei-walk.png` | 1862×845 | ARGB | four separated walk-like poses | motion feasibility only |
| `zhangfei-walk-source.png` | 1862×845 | RGB | opaque source for the same four poses | provenance input only |
| `zhangfei-combo.png` | 2172×724 | ARGB | six separated unarmed strike/slam poses | motion feasibility only |
| `zhangfei-combo-source.png` | 2172×724 | RGB | opaque source for the same six poses | provenance input only |

SHA-256 audit:

- master transparent:
  `6C713E121E2E777D0E049789AE6BD1B086C8B0E029FC3E5387A1A315C2F8FD58`
- master source:
  `46511BD3D5BC528A554C7908350867AAC7DCF6A393B08A7EECA1F81A73DB9D70`
- walk transparent:
  `9FD9B8E48DB5C8CB71050E7F74CDB1CF8E58F1A16E8E63FF45631A5F46671ABF`
- walk source:
  `9C529CFEBA59E965E2D6DC0D180DCACBAA9405ADF096E7ED6706A96DF4703258`
- combo transparent:
  `EE22EF7D5D75F976BDFB6E12B94B4F48CD8C939DFF4B4DC072362280C0AAB124`
- combo source:
  `229239B7944C3F4C3825C052583DFC7DB5DBC1EBFE09FDFECA4B384D8A651D5E`

The audit found no serpent spear, no hurt sequence, no dead sequence, no idle
loop, no trustworthy frame rectangles, no common feet anchor, and no phase
classification. The visible walk and combo poses are also too sparse to prove
continuous motion. Task 10.4 must not crop or interpolate these images into a
production atlas and must not use rotate, scale, translate, tweening, or frame
duplication to conceal the missing poses.

## 2. Approved identity lock

The authoritative identity is this section plus the body, face, beard, and
palette direction visible in `public/art/zhangfei/zhangfei-master.png`. That
file is a **concept-only reference**, not a frame source. Where it conflicts
with this written lock, this section wins.

Zhang Fei is an original, Japanese arcade-realistic Three Kingdoms heavy
warrior:

- mature East Asian male with a broad chest, thick neck, powerful forearms,
  heavy legs, and a low, planted center of gravity;
- thick dark beard with a broad, rugged mass, clearly different from Guan Yu's
  long narrow beard;
- stern, explosive expression; no comic drunkenness or caricature;
- deep oxblood-red cloth, charcoal/black lamellar armor, aged bronze fittings,
  warm skin light, and cool forest shadow;
- one long **Zhangba serpent spear (丈八蛇矛)** with a visibly sinuous,
  symmetric double-edged steel spearhead, dark shaft, and compact red binding;
  it must never drift into a guandao or ordinary straight spear and must remain
  readable at 25% zoom;
- heavy width and planted stance distinguish him more than height. He remains
  visibly smaller than the Boss and must not read as a Mauler enemy.

The master image is accepted only for its broad body, dark beard, oxblood,
charcoal, and aged-bronze identity. Its bare-hand pose is not the weapon or
animation specification.

Prohibited drift:

- no Guan Yu recolor, copied established-game costume, frame, or armor motif;
- no bare-hand/brawler primary combat, giant club, halberd, sword, shield, or
  fantasy oversized spear;
- no Q-version, chibi head, modern anime youth, western barbarian, horned
  demon, shirtless berserker, or Boss-scale silhouette;
- no bright jade-green primary cloth, long Guan Yu beard, blue-white Soldier
  palette, or Mauler body/weapon reuse;
- no airbrushed high-resolution illustration pasted into the pixel atlas;
- no different face, armor, beard, weapon, or body proportions between states.

## 3. Tactical role and measurable prototype hypotheses

Role: **committed space controller**. Guan Yu remains the faster all-rounder.
Zhang Fei exchanges movement and recovery safety for longer spear control,
stronger displacement, and a more decisive confirmed finisher. HP remains 10
in the first comparison so the distinction cannot be explained by survivability.

| Property | Frozen Guan Yu baseline | Zhang Fei Task 10.5 hypothesis |
|---|---:|---:|
| movement speed | 235 px/s | 200 px/s |
| ground body | 86×54 px | 96×58 px |
| max HP / hurt | 10 / 300ms | 10 / 300ms |
| shared attack hitbox | 142×86 at +104,-48 | 176×88 at +132,-48 |
| Attack 1 total | 375ms | 450ms |
| Attack 1 phases | 125 / 125 / 125ms | 150 / 100 / 200ms |
| Attack 1 damage / knockback / Hit Stop | 1 / 26px / 4f | 1 / 34px / 5f |
| Attack 2 total | 375ms | 525ms |
| Attack 2 phases | 125 / 125 / 125ms | 175 / 125 / 225ms |
| Attack 2 damage / knockback / Hit Stop | 1 / 26px / 4f | 1 / 42px / 5f |
| Attack 3 total | 650ms | 800ms |
| Attack 3 phases | 125 / 125 / 400ms | 225 / 150 / 425ms |
| Attack 3 damage / knockback / Hit Stop | 2 / 60px / 6f | 3 / 88px / 8f |

Phase values are `startup / active / recovery`. Hit Stop frames are measured at
60 FPS. The longer hitbox is an actor-level spear reach hypothesis supported by
the existing `PlayerDefinition`; Task 10.5 must not introduce per-frame or
per-attack hitbox shapes merely to make the prototype pass.

The hypothesis fails if Zhang Fei is simply safer at range, always kills faster,
or can keep enemies permanently outside retaliation. It also fails if his
startup/recovery makes the correct play mostly waiting, or if mobile controls
cannot reliably finish his one-button chain.

## 4. Preserved combat and lifecycle contracts

Both generals use the same input grammar and state graph:

`idle/walk → attack1 → attack2 → attack3 → idle`

- J/touch attack starts one stage; one press advances at most one stage.
- Attack 2 and Attack 3 require the previous stage to hit-confirm and a buffered
  press inside the existing Combo Window.
- A miss or block cannot open the next stage.
- Each attack owns a separate Arcade hitbox and can damage each target once.
- Attack frames never replace the ground body.
- Attack, hurt, dead, Pause, Hit Stop, Failure, retry, replay, Scene reset, and
  Title return use the existing owners and clocks.
- Zhang Fei does not receive a new input, throw, grab, jump, cancel, armor,
  guard, skill, weapon mode, or identity branch in Enemy/Boss/Stage code.
- Character identity is data selected by Phaser. React owns no character state.

## 5. Genuine animation budget

Task 10.4 must produce exactly 47 distinct approved poses before runtime
integration:

| State | Frames | Required content |
|---|---:|---|
| idle | 6 | planted breathing loop; spear held and stable |
| walk | 8 | contact/down/pass/up cycle with spear mass response |
| attack1 | 6 | 2 startup, 2 active, 2 recovery |
| attack2 | 7 | 3 startup, 2 active, 2 recovery |
| attack3 | 10 | 4 startup, 3 active, 3 recovery |
| hurt | 4 | grounded impact; no upward launch |
| dead | 6 | loss of balance, grounded fall, held final pose |

Attack 1 is a compact forward spear check. Attack 2 is a committed horizontal
sweep with readable hip rotation. Attack 3 is a heavy two-hand serpent-spear
finisher with the longest anticipation and follow-through. Adjacent poses must
show a continuous weapon arc, hand placement, weight transfer, and facing.
Different attacks cannot be concatenated and called one motion.

Frame counts do not authorize gameplay timing changes in Task 10.4. Preview
plays at 2/4/6/8/10 FPS for inspection. Task 10.5 maps approved poses to the
prototype timings in section 3.

## 6. Atlas, feet, scale, and provenance contract

- One logical cell: **672×448 px**.
- Layout target: **6 columns × 8 rows** (4032×3584 maximum page).
- Shared feet anchor: **(336, 420)**.
- Shared origin: **(0.5, 0.9375)**.
- Single initial display scale: **0.64** for every state.
- Neutral idle display height: **240±10 logical px**, measured from the feet
  line to highest opaque body pixel, excluding an upright weapon tip.
- Height ratio to Guan Yu: **1.00–1.09**; width and stance carry the heavy read.
- All authored poses face right. Runtime `flipX` handles left; no duplicated
  left-facing atlas and no inconsistent source facing.
- The complete body, beard, cloth, shadow-free feet, spear shaft, and spear tip
  must remain within the cell with at least 8 source pixels of safety margin.
- One state may not use a different scale or origin. Frame-specific placement
  is expressed only through measured atlas metadata.

The build step must identify alpha-connected components without assuming
equal-width source placement. For every frame metadata records source path and
SHA-256, source rectangle, alpha bounds, output rectangle, cell coordinates,
feet position, display offset, phase, facing, and pixel hash. Every frame pixel
hash must be unique.

Required QA outputs:

1. red frame-rectangle sheet with frame names and no neighboring contamination;
2. common feet-line sheet with cyan feet markers for all 47 frames;
3. 2 FPS onion-skin strips for every state and all three attacks;
4. neutral Guan Yu/Zhang Fei/Boss lineup at native size and 25% silhouette;
5. palette histogram and identity sheet;
6. interactive development-only preview with state/frame, source rectangle,
   alpha bounds, origin, offset, scale, phase, and feet data;
7. Desktop, 844×390, and 390×844 preview captures.

Acceptance tolerances:

- feet delta: 0 source pixels for idle/walk/attack/hurt; dead stays on the same
  ground line while its body changes pose;
- no unexplained body-top jump greater than 4 logical pixels between adjacent
  idle/walk poses;
- no clipped weapon/body pixel and no neighboring-frame pixel;
- no identity change and no fake intermediate transform;
- source and generated derivatives are reproducible from a committed tool and
  provenance record.

Task 10.4 stops at atlas/metadata/QA preview. It must not register the atlas in
the production asset manifest, create a formal character-select option, or tune
gameplay.

## 7. Task 10.5 comparison protocol

The comparison is development-only and uses the same build, fixed scenario
setup, enemy composition, spawn positions, and player for each paired run.
Guan Yu is the control. Zhang Fei uses only the hypotheses in section 3.

Contexts:

1. Forest Entry: Soldier + Shield Guard.
2. Forest Ambush: Mauler + Duelist + Crossbow.
3. Boss arena: close, legal attack range.

Run each general five times per context. Record:

- completion and player damage taken;
- combat duration;
- attacks 1/2/3 started, hit, missed, blocked, and interrupted;
- voluntary stops after Attack 1 and Attack 2;
- recovery-period hits received;
- multi-target hits and average enemies displaced per confirmed attack;
- time spent with no legal action because of commitment;
- Boss openings converted into confirmed Attack 3.

Use identical input strategy for the first three paired runs and an
archetype-aware strategy for the last two. The report includes medians and raw
runs; subjective “feels heavier” is not evidence.

### Accept

- all preserved contracts in section 4 pass;
- Zhang Fei's spear reach/displacement creates at least one useful spacing
  choice per encounter;
- Zhang Fei has more recovery punishment than Guan Yu in at least two contexts;
- neither general has both lower median damage taken and lower median clear
  time in all three contexts;
- both generals complete every context without requiring Enemy/Boss changes;
- testers choose to stop before Attack 3 at least once and complete Attack 3 at
  least once for a rational, visible reason.

### Adjust

Adjust only Zhang Fei definition values and remap existing approved phase
durations when the identity is valid but one metric misses narrowly. Do not
change enemies, Combo Window, Stage, Camera, or add systems to rescue the test.

### Reject

Reject and revert the prototype if Zhang Fei strictly dominates, is almost
never worth selecting, makes waiting the primary play, cannot be read on mobile,
requires fake animation or identity drift, breaks Pause/Hit Stop/reset, or
requires scope outside the current Player Definition. Rejection evidence is
kept; production does not advance to formal integration.

## 8. Scope gate

Task 10.3 changes documentation and contract tests only. No image was generated
or edited, and no runtime asset, animation, selection, Player gameplay,
Enemy/Boss/Stage/Camera/UI/Audio behavior, or generic character framework is
authorized.

The sole next implementation task is **M10 / Task 10.4 — Zhang Fei Atlas and
Animation Preview**.
