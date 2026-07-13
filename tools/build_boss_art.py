from pathlib import Path
import json
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "public" / "art" / "boss"
CELL = 448
FEET_Y = 420
DISPLAY_SCALE = 0.75

ATTACKS = [
    ("attack1", ART / "warlord-attack1-transparent.png", [0, 703, 1436, 2172]),
    ("attack2", ART / "warlord-attack2-transparent.png", [0, 662, 1513, 2172]),
    ("attack3", ART / "warlord-attack3-transparent.png", [0, 640, 1491, 2172]),
]
PHASES = ["startup", "active", "recovery"]
SHEET = ART / "warlord-attacks.png"
DEBUG = ART / "warlord-attacks-debug.png"
ATLAS = ART / "warlord-attacks.atlas.json"
METADATA = ART / "warlord-attacks.metadata.json"


def clean_alpha(image: Image.Image) -> Image.Image:
    image = image.copy().convert("RGBA")
    alpha = image.getchannel("A").point(lambda value: 0 if value < 48 else value)
    image.putalpha(alpha)
    return image


def main() -> None:
    ART.mkdir(parents=True, exist_ok=True)
    poses = []
    for attack, source_path, x_edges in ATTACKS:
        source = clean_alpha(Image.open(source_path))
        if source.size != (2172, 724):
            raise RuntimeError(f"Unexpected Boss source size: {source_path.name} {source.size}")
        for index, phase in enumerate(PHASES):
            source_rect = (x_edges[index], 0, x_edges[index + 1], source.height)
            raw = source.crop(source_rect)
            bounds = raw.getchannel("A").getbbox()
            if not bounds:
                raise RuntimeError(f"No visible pixels in {attack}-{phase}")
            poses.append((f"{attack}-{phase}", attack, phase, source_path.name, source_rect, raw.crop(bounds), bounds))

    max_width = max(pose.width for *_, pose, _ in poses)
    max_height = max(pose.height for *_, pose, _ in poses)
    source_scale = min((CELL - 28) / max_width, (FEET_Y - 20) / max_height)
    sheet = Image.new("RGBA", (CELL * 3, CELL * 3), (0, 0, 0, 0))
    frames = {}
    metadata = []

    for frame_index, (name, attack, phase, source_name, source_rect, pose, alpha_bounds) in enumerate(poses):
        row, col = divmod(frame_index, 3)
        width = max(1, round(pose.width * source_scale))
        height = max(1, round(pose.height * source_scale))
        pose = pose.resize((width, height), Image.Resampling.NEAREST)
        x = col * CELL + (CELL - width) // 2
        y = row * CELL + FEET_Y - height
        sheet.alpha_composite(pose, (x, y))
        frames[name] = {
            "frame": {"x": col * CELL, "y": row * CELL, "w": CELL, "h": CELL},
            "rotated": False,
            "trimmed": False,
            "spriteSourceSize": {"x": 0, "y": 0, "w": CELL, "h": CELL},
            "sourceSize": {"w": CELL, "h": CELL},
            "pivot": {"x": 0.5, "y": FEET_Y / CELL},
        }
        metadata.append({
            "name": name,
            "attack": attack,
            "phase": phase,
            "sourceImage": source_name,
            "sourceRect": {"x": source_rect[0], "y": 0, "width": source_rect[2] - source_rect[0], "height": source_rect[3]},
            "alphaBounds": {"x": alpha_bounds[0], "y": alpha_bounds[1], "width": alpha_bounds[2] - alpha_bounds[0], "height": alpha_bounds[3] - alpha_bounds[1]},
            "frame": {"x": col * CELL, "y": row * CELL, "width": CELL, "height": CELL},
            "originX": 0.5,
            "originY": FEET_Y / CELL,
            "displayOffsetX": x - col * CELL,
            "displayOffsetY": y - row * CELL,
            "visibleWidth": width,
            "visibleHeight": height,
            "feetAnchor": {"x": CELL // 2, "y": FEET_Y},
            "sourceScale": source_scale,
            "displayScale": DISPLAY_SCALE,
        })

    sheet.save(SHEET)
    debug = sheet.copy()
    draw = ImageDraw.Draw(debug)
    for index, item in enumerate(metadata):
        row, col = divmod(index, 3)
        x, y = col * CELL, row * CELL
        draw.rectangle((x, y, x + CELL - 1, y + CELL - 1), outline=(255, 0, 0, 255), width=3)
        draw.line((x, y + FEET_Y, x + CELL - 1, y + FEET_Y), fill=(255, 0, 0, 220), width=2)
        draw.text((x + 8, y + 8), item["name"], fill=(255, 0, 0, 255), stroke_width=2, stroke_fill=(255, 255, 255, 255))
    debug.save(DEBUG)
    ATLAS.write_text(json.dumps({
        "frames": frames,
        "meta": {"app": "Codex Boss art builder", "version": "1.0", "image": SHEET.name,
                 "format": "RGBA8888", "size": {"w": CELL * 3, "h": CELL * 3}, "scale": "1"},
    }, indent=2), encoding="utf-8")
    METADATA.write_text(json.dumps({
        "cellSize": CELL,
        "feetAnchor": {"x": CELL // 2, "y": FEET_Y},
        "displayScale": DISPLAY_SCALE,
        "sourceScale": source_scale,
        "frames": metadata,
    }, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
