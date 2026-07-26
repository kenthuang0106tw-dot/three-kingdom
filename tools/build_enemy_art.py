import argparse
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
SOLDIER_CELL = 288
SOLDIER_FEET_Y = 265
SOLDIER_BASE_SCALE = 0.75
DUELIST_CELL = 288
DUELIST_FEET_Y = 265
DUELIST_PROCESSING_SCALE = 1.0
DUELIST_SOURCE_RECTS = (
    (0, 0, 346, 346),
    (346, 0, 661, 346),
    (661, 0, 965, 346),
    (965, 0, 1256, 346),
    (1256, 0, 1619, 346),
    (0, 346, 330, 619),
    (330, 346, 634, 619),
    (634, 346, 1005, 619),
    (1005, 346, 1271, 619),
    (1271, 346, 1619, 619),
    (0, 619, 323, 971),
    (323, 619, 607, 971),
    (607, 619, 888, 971),
    (888, 619, 1212, 971),
    (1212, 619, 1619, 971),
)
NAMES = [
    "idle-0", "idle-1", "walk-0", "walk-1", "walk-2",
    "walk-3", "attack-0", "attack-1", "attack-2", "hurt-0",
    "hurt-1", "dead-0", "dead-1", "dead-2", "dead-3",
]
ANIMATIONS = {
    "idle": NAMES[0:2], "walk": NAMES[2:6], "attack": NAMES[6:9],
    "hurt": NAMES[9:11], "dead": NAMES[11:15],
}
SOLDIER_CORRECTION_SCALE = 0.2325
SOLDIER_CORRECTION_SOURCES = {
    name: f"source/soldier-v2/{name}-transparent.png"
    for name in (
        "walk-3", "attack-0", "attack-1", "attack-2",
        "dead-0", "dead-1", "dead-2", "dead-3",
    )
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
    generated_by: str


ACTORS = (
    ActorSpec("soldier", "enemy-soldier-v2-source.png", "enemy-soldier.png", "enemy-soldier-v2-source-transparent.png", 1.025, -1, 210, "five-by-three-grid", "built-in image generation, ER.2 Soldier Production-Art Pilot"),
    ActorSpec("mauler", "mauler-source.png", "mauler.png", "mauler-source-transparent.png", 1.10, -1, 240, "four-by-four-grid", "built-in image generation in earlier asset tasks; no new generation in M6A.3"),
    ActorSpec("duelist", "duelist-source.png", "duelist.png", "duelist-source-transparent.png", 1.025, 1, 205, "measured-five-by-three", "built-in image generation, ER.3R Duelist Approved-Prototype Correction"),
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


def source_frames(spec: ActorSpec) -> list[tuple[Image.Image, dict[str, int | str]]]:
    cell = SOLDIER_CELL if spec.actor == "soldier" else DUELIST_CELL if spec.actor == "duelist" else CELL
    feet_y = SOLDIER_FEET_Y if spec.actor == "soldier" else DUELIST_FEET_Y if spec.actor == "duelist" else FEET_Y
    transparent_path = ART / spec.transparent_source if spec.transparent_source else None
    source = Image.open(transparent_path if transparent_path and transparent_path.exists() else ART / spec.source).convert("RGBA")
    if spec.transparent_source and not transparent_path.exists():
        source = remove_green_chroma(source)
        source.save(ART / spec.transparent_source)
    if spec.source_layout == "five-by-three-grid":
        edges_x = [round(index * source.width / COLS) for index in range(COLS + 1)]
        edges_y = [round(index * source.height / ROWS) for index in range(ROWS + 1)]
        rects = []
        for index in range(len(NAMES)):
            row, col = divmod(index, COLS)
            rects.append((edges_x[col], edges_y[row], edges_x[col + 1], edges_y[row + 1]))
    elif spec.source_layout == "measured-five-by-three":
        if source.size != (1619, 971):
            raise RuntimeError(f"Unexpected Duelist source size: {source.size}")
        rects = list(DUELIST_SOURCE_RECTS)
    elif spec.transparent_source:
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
        processing_scale = (
            SOLDIER_BASE_SCALE if spec.actor == "soldier"
            else DUELIST_PROCESSING_SCALE if spec.actor == "duelist"
            else 1
        )
        if processing_scale != 1:
            pose = pose.resize(
                (
                    round(pose.width * processing_scale),
                    round(pose.height * processing_scale),
                ),
                Image.Resampling.NEAREST,
            )
        if pose.width >= cell or pose.height >= feet_y:
            raise RuntimeError(f"{spec.actor} pose exceeds the shared cell: {pose.size}")
        source_rect = {
            "sourceImage": spec.transparent_source or spec.source,
            "x": rect[0], "y": rect[1], "width": rect[2] - rect[0], "height": rect[3] - rect[1],
            "alphaX": bounds[0], "alphaY": bounds[1], "alphaWidth": bounds[2] - bounds[0], "alphaHeight": bounds[3] - bounds[1],
        }
        if processing_scale != 1:
            source_rect["processingScale"] = processing_scale
        frames.append((pose, source_rect))

    if spec.actor == "soldier":
        for name, correction_source in SOLDIER_CORRECTION_SOURCES.items():
            correction = Image.open(ART / correction_source).convert("RGBA")
            bounds = correction.getchannel("A").getbbox()
            if not bounds:
                raise RuntimeError(f"No visible pixels in Soldier correction source {correction_source}")
            pose = correction.crop(bounds)
            pose = pose.resize(
                (
                    round(pose.width * SOLDIER_CORRECTION_SCALE),
                    round(pose.height * SOLDIER_CORRECTION_SCALE),
                ),
                Image.Resampling.NEAREST,
            )
            if pose.width >= cell or pose.height >= feet_y:
                raise RuntimeError(f"Soldier correction pose exceeds the shared cell: {name} {pose.size}")
            frames[NAMES.index(name)] = (pose, {
                "sourceImage": correction_source,
                "processingScale": SOLDIER_CORRECTION_SCALE,
                "x": 0, "y": 0, "width": correction.width, "height": correction.height,
                "alphaX": bounds[0], "alphaY": bounds[1], "alphaWidth": bounds[2] - bounds[0], "alphaHeight": bounds[3] - bounds[1],
            })
    return frames


def phase_for(name: str) -> str | None:
    if not name.startswith("attack-"):
        return None
    return {"attack-0": "startup", "attack-1": "active", "attack-2": "recovery"}[name]


def build_actor(spec: ActorSpec) -> tuple[Image.Image, dict]:
    cell = SOLDIER_CELL if spec.actor == "soldier" else DUELIST_CELL if spec.actor == "duelist" else CELL
    feet_y = SOLDIER_FEET_Y if spec.actor == "soldier" else DUELIST_FEET_Y if spec.actor == "duelist" else FEET_Y
    frame_source_facing = 1 if spec.actor == "mauler" else spec.source_facing
    sheet = Image.new("RGBA", (cell * COLS, cell * ROWS), (0, 0, 0, 0))
    atlas_frames = {}
    metadata_frames = []
    hashes = set()

    for index, (pose, source_rect) in enumerate(source_frames(spec)):
        name = NAMES[index]
        source_image = source_rect["sourceImage"]
        measured_rect = {key: value for key, value in source_rect.items() if key != "sourceImage"}
        row, col = divmod(index, COLS)
        offset_x = (cell - pose.width) // 2
        offset_y = feet_y - pose.height
        sheet.alpha_composite(pose, (col * cell + offset_x, row * cell + offset_y))
        digest = hashlib.sha256(pose.tobytes()).hexdigest()
        if digest in hashes:
            raise RuntimeError(f"Duplicate visible pose in {spec.actor}: {name}")
        hashes.add(digest)
        runtime_bounds = {"x": offset_x, "y": offset_y, "width": pose.width, "height": pose.height}
        metadata_frames.append({
            "name": name,
            "animation": name.split("-")[0],
            "phase": phase_for(name),
            "sourceImage": source_image,
            "sourceRect": measured_rect,
            "runtimeAlphaBounds": runtime_bounds,
            "originX": 0.5,
            "originY": feet_y / cell,
            "displayOffsetX": offset_x,
            "displayOffsetY": offset_y,
            "feetAnchor": {"x": cell // 2, "y": feet_y},
            "displayScale": spec.display_scale,
            "sourceFacing": frame_source_facing,
            "accepted": True,
            "rejectionReason": None,
            "pixelHash": digest,
        })
        atlas_frames[name] = {
            "frame": {"x": col * cell, "y": row * cell, "w": cell, "h": cell},
            "rotated": False, "trimmed": False,
            "spriteSourceSize": {"x": 0, "y": 0, "w": cell, "h": cell},
            "sourceSize": {"w": cell, "h": cell},
            "pivot": {"x": 0.5, "y": feet_y / cell},
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
        "cell": {"width": cell, "height": cell},
        "feetAnchor": {"x": cell // 2, "y": feet_y},
        "displayScale": spec.display_scale,
        "sourceFacing": spec.source_facing,
        "targetLogicalIdleHeight": spec.target_height,
        "logicalIdleHeight": round(metadata_frames[0]["runtimeAlphaBounds"]["height"] * spec.display_scale, 2),
        "animations": ANIMATIONS,
        "provenance": {
            "original": True,
            "source": spec.source,
            **({"correctionSources": SOLDIER_CORRECTION_SOURCES} if spec.actor == "soldier" else {}),
            "sourceLayout": spec.source_layout,
            "processingTool": "tools/build_enemy_art.py",
            "processingRevision": "2.0",
            "generatedBy": spec.generated_by,
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
    cell = SOLDIER_CELL if spec.actor == "soldier" else DUELIST_CELL if spec.actor == "duelist" else CELL
    feet_y = SOLDIER_FEET_Y if spec.actor == "soldier" else DUELIST_FEET_Y if spec.actor == "duelist" else FEET_Y
    debug = sheet.copy()
    draw = ImageDraw.Draw(debug)
    for index, frame in enumerate(frames):
        row, col = divmod(index, COLS)
        x, y = col * cell, row * cell
        draw.rectangle((x, y, x + cell - 1, y + cell - 1), outline=(255, 0, 0, 255), width=3)
        draw.line((x, y + feet_y, x + cell - 1, y + feet_y), fill=(255, 64, 64, 220), width=2)
        draw.text((x + 8, y + 8), frame["name"], fill=(255, 48, 48, 255), stroke_width=2, stroke_fill=(255, 255, 255, 255))
    debug_name = "enemy-soldier-debug.png" if spec.actor == "soldier" else f"{spec.actor}-debug.png"
    debug.save(ART / debug_name)

    onion = Image.new("RGBA", sheet.size, (0, 0, 0, 0))
    for index in range(len(frames)):
        row, col = divmod(index, COLS)
        current = sheet.crop((col * cell, row * cell, (col + 1) * cell, (row + 1) * cell))
        if index:
            previous_row, previous_col = divmod(index - 1, COLS)
            previous = sheet.crop((previous_col * cell, previous_row * cell, (previous_col + 1) * cell, (previous_row + 1) * cell))
            previous.putalpha(previous.getchannel("A").point(lambda alpha: round(alpha * 0.35)))
            onion.alpha_composite(previous, (col * cell, row * cell))
        onion.alpha_composite(current, (col * cell, row * cell))
    onion.save(ART / f"{spec.actor}-onion.png")

    silhouette = Image.new("RGBA", (cell * COLS // 4, cell * ROWS // 4), (0, 0, 0, 0))
    small = sheet.resize(silhouette.size, Image.Resampling.NEAREST)
    silhouette.putalpha(small.getchannel("A"))
    silhouette.paste((16, 20, 15, 255), mask=small.getchannel("A"))
    silhouette.save(ART / f"{spec.actor}-silhouette-25.png")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--actor", choices=[spec.actor for spec in ACTORS])
    args = parser.parse_args()
    ART.mkdir(parents=True, exist_ok=True)
    for spec in ACTORS:
        if not args.actor or args.actor == spec.actor:
            build_actor(spec)


if __name__ == "__main__":
    main()
