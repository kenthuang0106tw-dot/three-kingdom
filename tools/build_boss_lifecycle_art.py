from pathlib import Path
import json
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "public" / "art" / "boss"
CELL = 448
FEET_Y = 420
COLUMNS = 4
DISPLAY_SCALE = 0.9
SOURCE_SCALE = 0.5769230769230769

GROUPS = [
    (ART / "warlord-idle-hurt-transparent.png", [0, 546, 1052, 1572, 2172],
     ["idle-0", "idle-1", "hurt-0", "hurt-1"]),
    (ART / "warlord-phase-transparent.png", [0, 705, 1410, 2172],
     ["phase-0", "phase-1", "phase-2"]),
    (ART / "warlord-death-transparent.png", [0, 536, 1066, 1619, 2172],
     ["dead-0", "dead-1", "dead-2", "dead-3"]),
    (ART / "warlord-walk-transparent.png", [0, 546, 1052, 1572, 2172],
     ["walk-0", "walk-1", "walk-2", "walk-3"]),
]

SHEET = ART / "warlord-lifecycle.png"
DEBUG = ART / "warlord-lifecycle-debug.png"
ATLAS = ART / "warlord-lifecycle.atlas.json"
METADATA = ART / "warlord-lifecycle.metadata.json"


def clean_alpha(image: Image.Image) -> Image.Image:
    image = image.copy().convert("RGBA")
    alpha = image.getchannel("A").point(lambda value: 0 if value < 48 else value)
    image.putalpha(alpha)
    return image


def main() -> None:
    poses = []
    for source_path, x_edges, names in GROUPS:
        source = clean_alpha(Image.open(source_path))
        if source.size != (2172, 724):
            raise RuntimeError(f"Unexpected Boss lifecycle source size: {source_path.name} {source.size}")
        for index, name in enumerate(names):
            source_rect = (x_edges[index], 0, x_edges[index + 1], source.height)
            raw = source.crop(source_rect)
            bounds = raw.getchannel("A").getbbox()
            if not bounds:
                raise RuntimeError(f"No visible pixels in {name}")
            poses.append((name, source_path.name, source_rect, raw.crop(bounds), bounds))

    rows = (len(poses) + COLUMNS - 1) // COLUMNS
    sheet = Image.new("RGBA", (CELL * COLUMNS, CELL * rows), (0, 0, 0, 0))
    frames = {}
    metadata = []

    for frame_index, (name, source_name, source_rect, pose, alpha_bounds) in enumerate(poses):
        row, col = divmod(frame_index, COLUMNS)
        width = max(1, round(pose.width * SOURCE_SCALE))
        height = max(1, round(pose.height * SOURCE_SCALE))
        if width > CELL - 16 or height > FEET_Y:
            raise RuntimeError(f"Boss lifecycle pose exceeds frame: {name} {width}x{height}")
        pose = pose.resize((width, height), Image.Resampling.NEAREST)
        frame_x, frame_y = col * CELL, row * CELL
        x = frame_x + (CELL - width) // 2
        y = frame_y + FEET_Y - height
        sheet.alpha_composite(pose, (x, y))
        frames[name] = {
            "frame": {"x": frame_x, "y": frame_y, "w": CELL, "h": CELL},
            "rotated": False,
            "trimmed": False,
            "spriteSourceSize": {"x": 0, "y": 0, "w": CELL, "h": CELL},
            "sourceSize": {"w": CELL, "h": CELL},
            "pivot": {"x": 0.5, "y": FEET_Y / CELL},
        }
        metadata.append({
            "name": name,
            "sourceImage": source_name,
            "sourceRect": {"x": source_rect[0], "y": 0,
                           "width": source_rect[2] - source_rect[0], "height": source_rect[3]},
            "alphaBounds": {"x": alpha_bounds[0], "y": alpha_bounds[1],
                            "width": alpha_bounds[2] - alpha_bounds[0],
                            "height": alpha_bounds[3] - alpha_bounds[1]},
            "frame": {"x": frame_x, "y": frame_y, "width": CELL, "height": CELL},
            "originX": 0.5,
            "originY": FEET_Y / CELL,
            "displayOffsetX": x - frame_x,
            "displayOffsetY": y - frame_y,
            "visibleWidth": width,
            "visibleHeight": height,
            "feetAnchor": {"x": CELL // 2, "y": FEET_Y},
            "sourceScale": SOURCE_SCALE,
            "displayScale": DISPLAY_SCALE,
        })

    sheet.save(SHEET)
    debug = sheet.copy()
    draw = ImageDraw.Draw(debug)
    for index, item in enumerate(metadata):
        row, col = divmod(index, COLUMNS)
        x, y = col * CELL, row * CELL
        draw.rectangle((x, y, x + CELL - 1, y + CELL - 1), outline=(255, 0, 0, 255), width=3)
        draw.line((x, y + FEET_Y, x + CELL - 1, y + FEET_Y), fill=(255, 0, 0, 220), width=2)
        draw.text((x + 8, y + 8), item["name"], fill=(255, 0, 0, 255),
                  stroke_width=2, stroke_fill=(255, 255, 255, 255))
    debug.save(DEBUG)
    ATLAS.write_text(json.dumps({
        "frames": frames,
        "meta": {"app": "Codex Boss lifecycle art builder", "version": "1.0",
                 "image": SHEET.name, "format": "RGBA8888",
                 "size": {"w": CELL * COLUMNS, "h": CELL * rows}, "scale": "1"},
    }, indent=2), encoding="utf-8")
    METADATA.write_text(json.dumps({
        "cellSize": CELL,
        "feetAnchor": {"x": CELL // 2, "y": FEET_Y},
        "displayScale": DISPLAY_SCALE,
        "sourceScale": SOURCE_SCALE,
        "frames": metadata,
    }, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
