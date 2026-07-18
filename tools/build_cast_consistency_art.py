from pathlib import Path
import json

from PIL import Image, ImageDraw

import build_boss_art
import build_boss_lifecycle_art
import build_enemy_art


ROOT = Path(__file__).resolve().parents[1]
ENEMY_ART = ROOT / "public" / "art" / "enemy"
BOSS_ART = ROOT / "public" / "art" / "boss"
GUANYU_ART = ROOT / "public" / "art" / "guanyu"


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def boss_frames() -> tuple[list[tuple[str, Image.Image, dict]], dict]:
    attack_metadata = load_json(BOSS_ART / "warlord-attacks.metadata.json")
    lifecycle_metadata = load_json(BOSS_ART / "warlord-lifecycle.metadata.json")
    attack_sheet = Image.open(BOSS_ART / "warlord-attacks.png").convert("RGBA")
    lifecycle_sheet = Image.open(BOSS_ART / "warlord-lifecycle.png").convert("RGBA")
    result = []
    for group, sheet, metadata in (
        ("attacks", attack_sheet, attack_metadata),
        ("lifecycle", lifecycle_sheet, lifecycle_metadata),
    ):
        for frame in metadata["frames"]:
            rect = frame["frame"]
            crop = sheet.crop((rect["x"], rect["y"], rect["x"] + rect["width"], rect["y"] + rect["height"]))
            result.append((group, crop, frame))
    audit = {
        "actor": "boss-warlord",
        "displayScale": 1.27,
        "feetAnchor": {"x": 224, "y": 420},
        "sourceFacing": -1,
        "targetLogicalIdleHeight": 300,
        "logicalIdleHeight": round(lifecycle_metadata["frames"][0]["visibleHeight"] * 1.27, 2),
        "provenance": {
            "original": True,
            "generatedBy": "built-in image generation in M5 asset tasks; no new generation in M6A.3",
            "sourceImages": sorted({frame[2]["sourceImage"] for frame in result}),
            "processingTools": ["tools/build_boss_art.py", "tools/build_boss_lifecycle_art.py", "tools/build_cast_consistency_art.py"],
            "processingRevision": "M6A.3",
        },
        "frames": [
            {
                "name": frame[2]["name"],
                "group": frame[0],
                "sourceImage": frame[2]["sourceImage"],
                "sourceRect": frame[2]["sourceRect"],
                "runtimeAlphaBounds": {
                    "x": frame[2]["displayOffsetX"], "y": frame[2]["displayOffsetY"],
                    "width": frame[2]["visibleWidth"], "height": frame[2]["visibleHeight"],
                },
                "feetAnchor": frame[2]["feetAnchor"],
                "displayScale": frame[2]["displayScale"],
                "sourceFacing": -1,
                "accepted": True,
                "rejectionReason": None,
            }
            for frame in result
        ],
    }
    return result, audit


def build_boss_qa(frames: list[tuple[str, Image.Image, dict]]) -> None:
    cell = 448
    cols = 6
    rows = 4
    onion = Image.new("RGBA", (cell * cols, cell * rows), (0, 0, 0, 0))
    silhouette = Image.new("RGBA", (cell * cols // 4, cell * rows // 4), (0, 0, 0, 0))
    previous_group = None
    previous = None
    for index, (group, crop, _) in enumerate(frames):
        row, col = divmod(index, cols)
        if previous is not None and previous_group == group:
            ghost = previous.copy()
            ghost.putalpha(ghost.getchannel("A").point(lambda alpha: round(alpha * 0.35)))
            onion.alpha_composite(ghost, (col * cell, row * cell))
        onion.alpha_composite(crop, (col * cell, row * cell))
        previous_group = group
        previous = crop
    small = onion.resize(silhouette.size, Image.Resampling.NEAREST)
    silhouette.paste((16, 20, 15, 255), mask=small.getchannel("A"))
    onion.save(BOSS_ART / "warlord-onion.png")
    silhouette.save(BOSS_ART / "warlord-silhouette-25.png")


def crop_named(sheet_path: Path, atlas_path: Path, frame_name: str) -> Image.Image:
    sheet = Image.open(sheet_path).convert("RGBA")
    rect = load_json(atlas_path)["frames"][frame_name]["frame"]
    return sheet.crop((rect["x"], rect["y"], rect["x"] + rect["w"], rect["y"] + rect["h"]))


def build_lineup() -> None:
    actors = [
        ("GUAN YU", crop_named(GUANYU_ART / "guanyu-v2.png", GUANYU_ART / "guanyu-v2.atlas.json", "idle-0"), 0.64),
        ("SOLDIER", crop_named(ENEMY_ART / "enemy-soldier.png", ENEMY_ART / "enemy-soldier.atlas.json", "idle-0"), 1.34),
        ("DUELIST", crop_named(ENEMY_ART / "duelist.png", ENEMY_ART / "duelist.atlas.json", "idle-0"), 0.94),
        ("MAULER", crop_named(ENEMY_ART / "mauler.png", ENEMY_ART / "mauler.atlas.json", "idle-0"), 1.10),
        ("BOSS", crop_named(BOSS_ART / "warlord-lifecycle.png", BOSS_ART / "warlord-lifecycle.atlas.json", "idle-0"), 1.27),
    ]
    canvas = Image.new("RGBA", (1600, 520), (31, 42, 34, 255))
    draw = ImageDraw.Draw(canvas)
    feet_y = 430
    draw.line((30, feet_y, 1570, feet_y), fill=(255, 72, 72, 255), width=3)
    for height in range(0, 351, 10):
        y = feet_y - height
        tick = 16 if height % 50 else 28
        draw.line((30, y, 30 + tick, y), fill=(224, 184, 107, 200), width=1)
        if height % 50 == 0:
            draw.text((2, y - 7), str(height), fill=(224, 184, 107, 255))
    for index, (label, frame, scale) in enumerate(actors):
        logical = frame.resize((round(frame.width * scale), round(frame.height * scale)), Image.Resampling.NEAREST)
        alpha_bounds = logical.getchannel("A").getbbox()
        if not alpha_bounds:
            raise RuntimeError(f"Missing lineup pose: {label}")
        visible = logical.crop(alpha_bounds)
        center_x = 190 + index * 300
        canvas.alpha_composite(visible, (center_x - visible.width // 2, feet_y - visible.height))
        draw.text((center_x - 42, 470), label, fill=(255, 244, 214, 255))
    canvas.save(ENEMY_ART / "cast-lineup-debug.png")


def main() -> None:
    build_enemy_art.main()
    build_boss_art.main()
    build_boss_lifecycle_art.main()
    frames, audit = boss_frames()
    (BOSS_ART / "warlord-consistency.metadata.json").write_text(json.dumps(audit, indent=2), encoding="utf-8")
    build_boss_qa(frames)
    build_lineup()


if __name__ == "__main__":
    main()
