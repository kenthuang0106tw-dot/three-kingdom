from pathlib import Path
import hashlib
import json

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "public" / "art" / "enemy"
SOURCE = ART / "duelist-leap-source-transparent.png"
CELL = 288
FEET_Y = 265
PROCESSING_SCALE = 0.57
NAMES = ("leap-takeoff", "leap-airborne", "leap-descent", "leap-landing")
SOURCE_RECTS = tuple((index * 543, 0, (index + 1) * 543, 724) for index in range(4))


def build() -> None:
    source = Image.open(SOURCE).convert("RGBA")
    if source.size != (2172, 724):
        raise RuntimeError(f"Unexpected Duelist leap source size: {source.size}")

    sheet = Image.new("RGBA", (CELL * 4, CELL), (0, 0, 0, 0))
    frames = {}
    metadata_frames = []
    hashes = set()

    for index, (name, rect) in enumerate(zip(NAMES, SOURCE_RECTS)):
        crop = source.crop(rect)
        bounds = crop.getchannel("A").getbbox()
        if not bounds:
            raise RuntimeError(f"No visible pixels in {name}")
        pose = crop.crop(bounds).resize(
            (
                round((bounds[2] - bounds[0]) * PROCESSING_SCALE),
                round((bounds[3] - bounds[1]) * PROCESSING_SCALE),
            ),
            Image.Resampling.NEAREST,
        )
        if pose.width >= CELL or pose.height >= FEET_Y:
            raise RuntimeError(f"{name} exceeds the shared cell: {pose.size}")
        offset_x = (CELL - pose.width) // 2
        offset_y = FEET_Y - pose.height
        sheet.alpha_composite(pose, (index * CELL + offset_x, offset_y))
        digest = hashlib.sha256(pose.tobytes()).hexdigest()
        if digest in hashes:
            raise RuntimeError(f"Duplicate Duelist leap pose: {name}")
        hashes.add(digest)
        frames[name] = {
            "frame": {"x": index * CELL, "y": 0, "w": CELL, "h": CELL},
            "rotated": False,
            "trimmed": False,
            "spriteSourceSize": {"x": 0, "y": 0, "w": CELL, "h": CELL},
            "sourceSize": {"w": CELL, "h": CELL},
            "pivot": {"x": 0.5, "y": FEET_Y / CELL},
        }
        metadata_frames.append({
            "name": name,
            "sourceImage": SOURCE.name,
            "sourceRect": {
                "x": rect[0], "y": rect[1], "width": rect[2] - rect[0], "height": rect[3] - rect[1],
                "alphaX": bounds[0], "alphaY": bounds[1],
                "alphaWidth": bounds[2] - bounds[0], "alphaHeight": bounds[3] - bounds[1],
                "processingScale": PROCESSING_SCALE,
            },
            "runtimeAlphaBounds": {"x": offset_x, "y": offset_y, "width": pose.width, "height": pose.height},
            "originX": 0.5,
            "originY": FEET_Y / CELL,
            "displayOffsetX": offset_x,
            "displayOffsetY": offset_y,
            "feetAnchor": {"x": CELL // 2, "y": FEET_Y},
            "displayScale": 1.025,
            "sourceFacing": 1,
            "pixelHash": digest,
        })

    runtime = ART / "duelist-leap.png"
    sheet.save(runtime)
    atlas = {
        "frames": frames,
        "meta": {
            "app": "Three Kingdom GX.1 Duelist leap builder",
            "version": "1.0",
            "image": runtime.name,
            "format": "RGBA8888",
            "size": {"w": sheet.width, "h": sheet.height},
            "scale": "1",
        },
    }
    metadata = {
        "actor": "duelist",
        "task": "GX.1",
        "cell": {"width": CELL, "height": CELL},
        "feetAnchor": {"x": CELL // 2, "y": FEET_Y},
        "displayScale": 1.025,
        "sourceFacing": 1,
        "animations": {
            "takeoff": ["leap-takeoff"],
            "airborne": ["leap-airborne"],
            "descent": ["leap-descent"],
            "landing": ["leap-landing"],
        },
        "provenance": {
            "original": True,
            "source": "duelist-leap-source.png",
            "transparentSource": SOURCE.name,
            "processingTool": "tools/build_duelist_leap_art.py",
            "generatedBy": "built-in image generation, GX.1 Duelist Leap Mobility Prototype",
        },
        "frames": metadata_frames,
    }
    (ART / "duelist-leap.atlas.json").write_text(json.dumps(atlas, indent=2), encoding="utf-8")
    (ART / "duelist-leap.metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")

    debug = sheet.copy()
    draw = ImageDraw.Draw(debug)
    for index, name in enumerate(NAMES):
        x = index * CELL
        draw.rectangle((x, 0, x + CELL - 1, CELL - 1), outline=(255, 0, 0, 255), width=3)
        draw.line((x, FEET_Y, x + CELL - 1, FEET_Y), fill=(255, 64, 64, 230), width=2)
        draw.text((x + 7, 7), name, fill=(255, 48, 48, 255), stroke_width=2, stroke_fill=(255, 255, 255, 255))
    debug.save(ART / "duelist-leap-debug.png")

    onion = Image.new("RGBA", sheet.size, (0, 0, 0, 0))
    for index in range(4):
        current = sheet.crop((index * CELL, 0, (index + 1) * CELL, CELL))
        if index:
            previous = sheet.crop(((index - 1) * CELL, 0, index * CELL, CELL))
            previous.putalpha(previous.getchannel("A").point(lambda alpha: round(alpha * 0.3)))
            onion.alpha_composite(previous, (index * CELL, 0))
        onion.alpha_composite(current, (index * CELL, 0))
    onion.save(ART / "duelist-leap-onion.png")


if __name__ == "__main__":
    build()
