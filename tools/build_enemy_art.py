from dataclasses import dataclass
from pathlib import Path
import hashlib
import json

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "public" / "art" / "enemy"
CELL = 384
COLS = 5
ROWS = 3
FEET_Y = 354
NAMES = [
    "idle-0", "idle-1", "walk-0", "walk-1", "walk-2",
    "walk-3", "attack-0", "attack-1", "attack-2", "hurt-0",
    "hurt-1", "dead-0", "dead-1", "dead-2", "dead-3",
]
ANIMATIONS = {
    "idle": NAMES[0:2], "walk": NAMES[2:6], "attack": NAMES[6:9],
    "hurt": NAMES[9:11], "dead": NAMES[11:15],
}


@dataclass(frozen=True)
class ActorSpec:
    actor: str
    source: str
    runtime: str
    transparent_source: str | None
    display_scale: float
    source_facing: int
    target_height: int
    source_layout: str


ACTORS = (
    ActorSpec("soldier", "enemy-source-transparent.png", "enemy-soldier.png", None, 1.34, -1, 210, "soldier-gutter-grid"),
    ActorSpec("mauler", "mauler-source.png", "mauler.png", "mauler-source-transparent.png", 1.10, 1, 240, "four-by-four-grid"),
    ActorSpec("duelist", "duelist-source.png", "duelist.png", "duelist-source-transparent.png", 0.94, 1, 205, "four-by-four-grid"),
)


def remove_green_chroma(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            red, green, blue, alpha = pixels[x, y]
            if green > 150 and green > red * 1.25 and green > blue * 1.25:
                pixels[x, y] = (red, green, blue, 0)
            elif alpha < 72:
                pixels[x, y] = (red, green, blue, 0)
    return image


def source_frames(spec: ActorSpec) -> list[tuple[Image.Image, dict[str, int]]]:
    source = Image.open(ART / spec.source).convert("RGBA")
    if spec.transparent_source:
        source = remove_green_chroma(source)
        source.save(ART / spec.transparent_source)
        edges_x = [round(index * source.width / 4) for index in range(5)]
        edges_y = [round(index * source.height / 4) for index in range(5)]
        rects = []
        for index in range(len(NAMES)):
            row, col = divmod(index, 4)
            rects.append((edges_x[col], edges_y[row], edges_x[col + 1], edges_y[row + 1]))
    else:
        col_edges = [0, 307, 614, 922, 1229, 1536]
        row_edges = [0, 330, 610, 1024]
        rects = []
        for index in range(len(NAMES)):
            row, col = divmod(index, 5)
            rects.append((col_edges[col], row_edges[row], col_edges[col + 1], row_edges[row + 1]))

    frames = []
    for rect in rects:
        crop = source.crop(rect)
        bounds = crop.getchannel("A").getbbox()
        if not bounds:
            raise RuntimeError(f"No visible pixels in {spec.actor} source rectangle {rect}")
        pose = crop.crop(bounds)
        if pose.width >= CELL or pose.height >= FEET_Y:
            raise RuntimeError(f"{spec.actor} pose exceeds the shared cell: {pose.size}")
        frames.append((pose, {
            "x": rect[0], "y": rect[1], "width": rect[2] - rect[0], "height": rect[3] - rect[1],
            "alphaX": bounds[0], "alphaY": bounds[1], "alphaWidth": bounds[2] - bounds[0], "alphaHeight": bounds[3] - bounds[1],
        }))
    return frames


def phase_for(name: str) -> str | None:
    if not name.startswith("attack-"):
        return None
    return {"attack-0": "startup", "attack-1": "active", "attack-2": "recovery"}[name]


def build_actor(spec: ActorSpec) -> tuple[Image.Image, dict]:
    sheet = Image.new("RGBA", (CELL * COLS, CELL * ROWS), (0, 0, 0, 0))
    atlas_frames = {}
    metadata_frames = []
    hashes = set()

    for index, (pose, source_rect) in enumerate(source_frames(spec)):
        name = NAMES[index]
        row, col = divmod(index, COLS)
        offset_x = (CELL - pose.width) // 2
        offset_y = FEET_Y - pose.height
        sheet.alpha_composite(pose, (col * CELL + offset_x, row * CELL + offset_y))
        digest = hashlib.sha256(pose.tobytes()).hexdigest()
        if digest in hashes:
            raise RuntimeError(f"Duplicate visible pose in {spec.actor}: {name}")
        hashes.add(digest)
        runtime_bounds = {"x": offset_x, "y": offset_y, "width": pose.width, "height": pose.height}
        metadata_frames.append({
            "name": name,
            "animation": name.split("-")[0],
            "phase": phase_for(name),
            "sourceImage": spec.transparent_source or spec.source,
            "sourceRect": source_rect,
            "runtimeAlphaBounds": runtime_bounds,
            "originX": 0.5,
            "originY": FEET_Y / CELL,
            "displayOffsetX": offset_x,
            "displayOffsetY": offset_y,
            "feetAnchor": {"x": CELL // 2, "y": FEET_Y},
            "displayScale": spec.display_scale,
            "sourceFacing": spec.source_facing,
            "accepted": True,
            "rejectionReason": None,
            "pixelHash": digest,
        })
        atlas_frames[name] = {
            "frame": {"x": col * CELL, "y": row * CELL, "w": CELL, "h": CELL},
            "rotated": False, "trimmed": False,
            "spriteSourceSize": {"x": 0, "y": 0, "w": CELL, "h": CELL},
            "sourceSize": {"w": CELL, "h": CELL},
            "pivot": {"x": 0.5, "y": FEET_Y / CELL},
        }

    sheet.save(ART / spec.runtime)
    atlas_name = "enemy-soldier.atlas.json" if spec.actor == "soldier" else f"{spec.actor}.atlas.json"
    metadata_name = f"{spec.actor}.metadata.json"
    atlas = {
        "frames": atlas_frames,
        "meta": {"app": "Three Kingdom cast consistency builder", "version": "2.0", "image": spec.runtime,
                 "format": "RGBA8888", "size": {"w": sheet.width, "h": sheet.height}, "scale": "1"},
    }
    metadata = {
        "actor": spec.actor,
        "cell": {"width": CELL, "height": CELL},
        "feetAnchor": {"x": CELL // 2, "y": FEET_Y},
        "displayScale": spec.display_scale,
        "sourceFacing": spec.source_facing,
        "targetLogicalIdleHeight": spec.target_height,
        "logicalIdleHeight": round(metadata_frames[0]["runtimeAlphaBounds"]["height"] * spec.display_scale, 2),
        "animations": ANIMATIONS,
        "provenance": {
            "original": True,
            "source": spec.source,
            "sourceLayout": spec.source_layout,
            "processingTool": "tools/build_enemy_art.py",
            "processingRevision": "2.0",
            "generatedBy": "built-in image generation in earlier asset tasks; no new generation in M6A.3",
        },
        "frames": metadata_frames,
    }
    (ART / atlas_name).write_text(json.dumps(atlas, indent=2), encoding="utf-8")
    (ART / metadata_name).write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    if spec.actor == "soldier":
        (ART / "enemy-frame-metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    build_qa(spec, sheet, metadata_frames)
    return sheet, metadata


def build_qa(spec: ActorSpec, sheet: Image.Image, frames: list[dict]) -> None:
    debug = sheet.copy()
    draw = ImageDraw.Draw(debug)
    for index, frame in enumerate(frames):
        row, col = divmod(index, COLS)
        x, y = col * CELL, row * CELL
        draw.rectangle((x, y, x + CELL - 1, y + CELL - 1), outline=(255, 0, 0, 255), width=3)
        draw.line((x, y + FEET_Y, x + CELL - 1, y + FEET_Y), fill=(255, 64, 64, 220), width=2)
        draw.text((x + 8, y + 8), frame["name"], fill=(255, 48, 48, 255), stroke_width=2, stroke_fill=(255, 255, 255, 255))
    debug_name = "enemy-soldier-debug.png" if spec.actor == "soldier" else f"{spec.actor}-debug.png"
    debug.save(ART / debug_name)

    onion = Image.new("RGBA", sheet.size, (0, 0, 0, 0))
    for index in range(len(frames)):
        row, col = divmod(index, COLS)
        current = sheet.crop((col * CELL, row * CELL, (col + 1) * CELL, (row + 1) * CELL))
        if index:
            previous_row, previous_col = divmod(index - 1, COLS)
            previous = sheet.crop((previous_col * CELL, previous_row * CELL, (previous_col + 1) * CELL, (previous_row + 1) * CELL))
            previous.putalpha(previous.getchannel("A").point(lambda alpha: round(alpha * 0.35)))
            onion.alpha_composite(previous, (col * CELL, row * CELL))
        onion.alpha_composite(current, (col * CELL, row * CELL))
    onion.save(ART / f"{spec.actor}-onion.png")

    silhouette = Image.new("RGBA", (CELL * COLS // 4, CELL * ROWS // 4), (0, 0, 0, 0))
    small = sheet.resize(silhouette.size, Image.Resampling.NEAREST)
    silhouette.putalpha(small.getchannel("A"))
    silhouette.paste((16, 20, 15, 255), mask=small.getchannel("A"))
    silhouette.save(ART / f"{spec.actor}-silhouette-25.png")


def main() -> None:
    ART.mkdir(parents=True, exist_ok=True)
    for spec in ACTORS:
        build_actor(spec)


if __name__ == "__main__":
    main()
