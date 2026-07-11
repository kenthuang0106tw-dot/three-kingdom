from pathlib import Path
import json
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "public" / "art" / "enemy"
SOURCE = ART / "enemy-source-transparent.png"
SHEET = ART / "enemy-soldier.png"
DEBUG = ART / "enemy-soldier-debug.png"
ATLAS = ART / "enemy-soldier.atlas.json"
METADATA = ART / "enemy-frame-metadata.json"

NAMES = [
    "idle-0", "idle-1", "walk-0", "walk-1", "walk-2",
    "walk-3", "attack-0", "attack-1", "attack-2", "hurt-0",
    "hurt-1", "dead-0", "dead-1", "dead-2", "dead-3",
]
CELL = 384
COL_EDGES = [0, 307, 614, 922, 1229, 1536]
# The generated poses are laid out on three visual rows, but the generous
# gutters are not mathematically equal. These boundaries sit in the empty
# gutters so no hurt/death pixels leak into row two.
ROW_EDGES = [0, 330, 610, 1024]


def clean_alpha(image: Image.Image):
    image = image.copy()
    alpha = image.getchannel("A")
    # Soft chroma removal leaves nearly invisible magenta residue in otherwise
    # empty gutters. It must not participate in pose bounds or feet alignment.
    alpha = alpha.point(lambda value: 0 if value < 72 else value)
    image.putalpha(alpha)
    return image


def alpha_bounds(image: Image.Image):
    return image.getchannel("A").getbbox()


def main():
    ART.mkdir(parents=True, exist_ok=True)
    source = Image.open(SOURCE).convert("RGBA")
    sheet = Image.new("RGBA", (CELL * 5, CELL * 3), (0, 0, 0, 0))
    frames = {}
    metadata = []

    for index, name in enumerate(NAMES):
        row, col = divmod(index, 5)
        raw = clean_alpha(source.crop((COL_EDGES[col], ROW_EDGES[row], COL_EDGES[col + 1], ROW_EDGES[row + 1])))
        bounds = alpha_bounds(raw)
        if not bounds:
            raise RuntimeError(f"No visible pixels in {name}")
        pose = raw.crop(bounds)
        if pose.width > CELL - 20 or pose.height > CELL - 20:
            scale = min((CELL - 20) / pose.width, (CELL - 20) / pose.height)
            pose = pose.resize((round(pose.width * scale), round(pose.height * scale)), Image.Resampling.NEAREST)
        x = col * CELL + (CELL - pose.width) // 2
        y = row * CELL + 354 - pose.height
        sheet.alpha_composite(pose, (x, y))
        metadata.append({
            "name": name,
            "sourceX": col * CELL,
            "sourceY": row * CELL,
            "width": CELL,
            "height": CELL,
            "originX": 0.5,
            "originY": 354 / CELL,
            "displayOffsetX": x - col * CELL,
            "displayOffsetY": y - row * CELL,
            "visibleWidth": pose.width,
            "visibleHeight": pose.height,
            "feetAnchor": {"x": CELL // 2, "y": 354},
        })
        frames[name] = {
            "frame": {"x": col * CELL, "y": row * CELL, "w": CELL, "h": CELL},
            "rotated": False,
            "trimmed": False,
            "spriteSourceSize": {"x": 0, "y": 0, "w": CELL, "h": CELL},
            "sourceSize": {"w": CELL, "h": CELL},
            "pivot": {"x": 0.5, "y": 354 / CELL},
        }

    sheet.save(SHEET)
    debug = sheet.copy()
    draw = ImageDraw.Draw(debug)
    for index, name in enumerate(NAMES):
        row, col = divmod(index, 5)
        x, y = col * CELL, row * CELL
        draw.rectangle((x, y, x + CELL - 1, y + CELL - 1), outline=(255, 0, 0, 255), width=3)
        draw.text((x + 8, y + 8), name, fill=(255, 0, 0, 255), stroke_width=2, stroke_fill=(255, 255, 255, 255))
        draw.line((x, y + 354, x + CELL - 1, y + 354), fill=(255, 0, 0, 200), width=2)
    debug.save(DEBUG)
    ATLAS.write_text(json.dumps({
        "frames": frames,
        "meta": {"app": "Codex enemy art builder", "version": "1.0", "image": SHEET.name,
                 "format": "RGBA8888", "size": {"w": CELL * 5, "h": CELL * 3}, "scale": "1"},
    }, indent=2), encoding="utf-8")
    METADATA.write_text(json.dumps({"displayScale": 1.4, "frames": metadata}, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
