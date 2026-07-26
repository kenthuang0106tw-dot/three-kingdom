# TP-3 Shield Guard + Crossbow Composition Prototype

Status: implementation verification pending manual acceptance.

## Development-only entrance

Open `?shieldCrossbowTest=1` after starting the local development server.
It spawns exactly one Shield Guard at `(510, 560)` and one Crossbow at
`(790, 500)`. Formal Stage encounter data is unchanged.

## Acceptance focus

1. The Shield Guard creates a frontal-position problem; the Crossbow creates
   a readable horizontal-line problem.
2. The existing single Attack Slot prevents simultaneous primary attacks.
3. Moving vertically to evade the locked arrow must not make the Shield Guard
   automatically rotate and block from behind.
4. The best response is neither permanent waiting nor a fixed first target.
5. Arrows pass through other enemies and only threaten the Player; the Shield
   Guard cannot be blocked, damaged, or killed by its ally's shots.

Record manual observations before accepting this prototype. No formal art,
Stage configuration, new attacks, or extra enemy type belongs to TP-3.
