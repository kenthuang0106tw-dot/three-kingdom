from dataclasses import dataclass
from pathlib import Path
from collections import deque
import hashlib
import json

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "public" / "art" / "enemy"
REVIEWS = ROOT / "docs" / "visual-baselines" / "enemy-cast-v2"
CELL = 288
FEET_Y = 265
DISPLAY_SCALE = 1.025
COLS = 5
ROWS = 5


@dataclass(frozen=True)
class SourceFrame:
    name: str
    source: str
    rect: tuple[int, int, int, int]
    processing_scale: float


BASE_SOURCE = "shield-guard-source-transparent.png"
EXTRA_SOURCE = "shield-guard-extra-source-transparent.png"
BASE_SCALE = 0.775
EXTRA_SCALE = 0.53

FRAMES = (
    SourceFrame("idle-0", BASE_SOURCE, (99, 40, 296, 327), BASE_SCALE),
    SourceFrame("idle-1", BASE_SOURCE, (370, 41, 575, 327), BASE_SCALE),
    SourceFrame("walk-0", BASE_SOURCE, (635, 42, 830, 324), BASE_SCALE),
    SourceFrame("walk-1", BASE_SOURCE, (885, 42, 1105, 324), BASE_SCALE),
    SourceFrame("walk-2", BASE_SOURCE, (1162, 45, 1383, 325), BASE_SCALE),
    SourceFrame("walk-3", BASE_SOURCE, (52, 371, 273, 647), BASE_SCALE),
    SourceFrame("attack-0", BASE_SOURCE, (344, 378, 588, 645), BASE_SCALE),
    SourceFrame("attack-1", BASE_SOURCE, (609, 403, 899, 645), BASE_SCALE),
    SourceFrame("attack-2", BASE_SOURCE, (924, 388, 1150, 647), BASE_SCALE),
    SourceFrame("hurt-0", BASE_SOURCE, (1192, 387, 1410, 647), BASE_SCALE),
    SourceFrame("hurt-1", BASE_SOURCE, (51, 688, 264, 945), BASE_SCALE),
    SourceFrame("dead-0", BASE_SOURCE, (317, 733, 555, 939), BASE_SCALE),
    SourceFrame("dead-1", BASE_SOURCE, (594, 762, 850, 949), BASE_SCALE),
    SourceFrame("dead-2", BASE_SOURCE, (856, 813, 1167, 960), BASE_SCALE),
    SourceFrame("dead-3", BASE_SOURCE, (1153, 841, 1493, 953), BASE_SCALE),
    SourceFrame("guard-0", EXTRA_SOURCE, (138, 53, 458, 467), EXTRA_SCALE),
    SourceFrame("guard-1", EXTRA_SOURCE, (618, 54, 940, 467), EXTRA_SCALE),
    SourceFrame("block-0", EXTRA_SOURCE, (1090, 88, 1407, 467), EXTRA_SCALE),
    SourceFrame("block-1", EXTRA_SOURCE, (122, 540, 447, 926), EXTRA_SCALE),
    SourceFrame("recovery-0", EXTRA_SOURCE, (530, 532, 937, 926), EXTRA_SCALE),
    SourceFrame("recovery-1", EXTRA_SOURCE, (1025, 530, 1392, 926), EXTRA_SCALE),
)

ANIMATIONS = {
    "idle": ["idle-0", "idle-1"],
    "walk": ["walk-0", "walk-1", "walk-2", "walk-3"],
    "attack": ["attack-0", "attack-1", "attack-2"],
    "hurt": ["hurt-0", "hurt-1"],
    "dead": ["dead-0", "dead-1", "dead-2", "dead-3"],
    "guard": ["guard-0", "guard-1"],
    "block": ["block-0", "block-1"],
    "recovery": ["recovery-0", "recovery-1"],
}


def phase_for(name: str) -> str | None:
    if name == "attack-0":
        return "startup"
    if name == "attack-1":
        return "active"
    if name == "attack-2":
        return "recovery"
    return None


def remove_tiny_components(image: Image.Image, minimum_pixels: int = 80) -> Image.Image:
    alpha = image.getchannel("A")
    pixels = alpha.load()
    width, height = alpha.size
    visited: set[tuple[int, int]] = set()
    remove: list[tuple[int, int]] = []
    for y in range(height):
        for x in range(width):
            if pixels[x, y] < 4 or (x, y) in visited:
                continue
            component: list[tuple[int, int]] = []
            queue = deque([(x, y)])
            visited.add((x, y))
            while queue:
                point = queue.popleft()
                component.append(point)
                px, py = point
                for ny in range(max(0, py - 1), min(height, py + 2)):
                    for nx in range(max(0, px - 1), min(width, px + 2)):
                        if pixels[nx, ny] >= 4 and (nx, ny) not in visited:
                            visited.add((nx, ny))
                            queue.append((nx, ny))
            if len(component) < minimum_pixels:
                remove.extend(component)
    for x, y in remove:
        pixels[x, y] = 0
    image.putalpha(alpha)
    return image


def build() -> tuple[Image.Image, dict]:
    sources = {
        BASE_SOURCE: Image.open(ART / BASE_SOURCE).convert("RGBA"),
        EXTRA_SOURCE: Image.open(ART / EXTRA_SOURCE).convert("RGBA"),
    }
    sheet = Image.new("RGBA", (COLS * CELL, ROWS * CELL), (0, 0, 0, 0))
    atlas_frames: dict[str, dict] = {}
    metadata_frames = []
    hashes: set[str] = set()

    for index, frame in enumerate(FRAMES):
        source = sources[frame.source]
        left, top, right, bottom = frame.rect
        crop = remove_tiny_components(source.crop(frame.rect))
        alpha_bounds = crop.getchannel("A").getbbox()
        if not alpha_bounds:
            raise RuntimeError(f"No visible pixels in {frame.name}")
        pose = crop.crop(alpha_bounds)
        pose = pose.resize(
            (
                round(pose.width * frame.processing_scale),
                round(pose.height * frame.processing_scale),
            ),
            Image.Resampling.NEAREST,
        )
        if pose.width > CELL - 24 or pose.height >= FEET_Y:
            raise RuntimeError(f"{frame.name} exceeds padding contract: {pose.size}")

        row, column = divmod(index, COLS)
        offset_x = (CELL - pose.width) // 2
        offset_y = FEET_Y - pose.height
        sheet.alpha_composite(pose, (column * CELL + offset_x, row * CELL + offset_y))
        digest = hashlib.sha256(pose.tobytes()).hexdigest()
        if digest in hashes:
            raise RuntimeError(f"Duplicate pose: {frame.name}")
        hashes.add(digest)

        runtime_bounds = {
            "x": offset_x,
            "y": offset_y,
            "width": pose.width,
            "height": pose.height,
        }
        metadata_frames.append({
            "name": frame.name,
            "animation": frame.name.split("-")[0],
            "phase": phase_for(frame.name),
            "sourceImage": frame.source,
            "sourceRect": {
                "x": left,
                "y": top,
                "width": right - left,
                "height": bottom - top,
                "alphaX": alpha_bounds[0],
                "alphaY": alpha_bounds[1],
                "alphaWidth": alpha_bounds[2] - alpha_bounds[0],
                "alphaHeight": alpha_bounds[3] - alpha_bounds[1],
                "processingScale": frame.processing_scale,
            },
            "runtimeAlphaBounds": runtime_bounds,
            "originX": 0.5,
            "originY": FEET_Y / CELL,
            "displayOffsetX": offset_x,
            "displayOffsetY": offset_y,
            "feetAnchor": {"x": CELL // 2, "y": FEET_Y},
            "displayScale": DISPLAY_SCALE,
            "sourceFacing": -1,
            "accepted": True,
            "rejectionReason": None,
            "pixelHash": digest,
        })
        atlas_frames[frame.name] = {
            "frame": {"x": column * CELL, "y": row * CELL, "w": CELL, "h": CELL},
            "rotated": False,
            "trimmed": False,
            "spriteSourceSize": {"x": 0, "y": 0, "w": CELL, "h": CELL},
            "sourceSize": {"w": CELL, "h": CELL},
            "pivot": {"x": 0.5, "y": FEET_Y / CELL},
        }

    sheet.save(ART / "shield-guard.png")
    atlas = {
        "frames": atlas_frames,
        "meta": {
            "app": "Three Kingdom Shield Guard production builder",
            "version": "1.0",
            "image": "shield-guard.png",
            "format": "RGBA8888",
            "size": {"w": sheet.width, "h": sheet.height},
            "scale": "1",
        },
    }
    metadata = {
        "actor": "shield-guard",
        "cell": {"width": CELL, "height": CELL},
        "feetAnchor": {"x": CELL // 2, "y": FEET_Y},
        "displayScale": DISPLAY_SCALE,
        "sourceFacing": -1,
        "targetLogicalIdleHeight": 215,
        "logicalIdleHeight": round(metadata_frames[0]["runtimeAlphaBounds"]["height"] * DISPLAY_SCALE, 2),
        "animations": ANIMATIONS,
        "provenance": {
            "original": True,
            "identityGate": "shield-guard-idle-gate-source.png",
            "sources": ["shield-guard-source.png", "shield-guard-extra-source.png"],
            "sourceLayout": "measured-five-by-three-plus-three-by-two",
            "processingTool": "tools/build_shield_guard_art.py",
            "processingRevision": "1.0",
            "generatedBy": "built-in image generation, ER.5 Shield Guard Production-Art Replacement",
        },
        "frames": metadata_frames,
    }
    (ART / "shield-guard.atlas.json").write_text(json.dumps(atlas, indent=2), encoding="utf-8")
    (ART / "shield-guard.metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    build_qa(sheet, metadata_frames)
    return sheet, metadata


def build_qa(sheet: Image.Image, frames: list[dict]) -> None:
    debug = sheet.copy()
    draw = ImageDraw.Draw(debug)
    for index, frame in enumerate(frames):
        row, column = divmod(index, COLS)
        x, y = column * CELL, row * CELL
        draw.rectangle((x, y, x + CELL - 1, y + CELL - 1), outline=(255, 0, 0, 255), width=3)
        draw.line((x, y + FEET_Y, x + CELL - 1, y + FEET_Y), fill=(255, 64, 64, 220), width=2)
        draw.text((x + 8, y + 8), frame["name"], fill=(255, 48, 48, 255),
                  stroke_width=2, stroke_fill=(255, 255, 255, 255))
    debug.save(ART / "shield-guard-debug.png")

    onion = Image.new("RGBA", sheet.size, (0, 0, 0, 0))
    for names in ANIMATIONS.values():
        previous = None
        for name in names:
            index = next(index for index, frame in enumerate(frames) if frame["name"] == name)
            row, column = divmod(index, COLS)
            current = sheet.crop((column * CELL, row * CELL, (column + 1) * CELL, (row + 1) * CELL))
            if previous is not None:
                ghost = previous.copy()
                ghost.putalpha(ghost.getchannel("A").point(lambda alpha: round(alpha * 0.35)))
                onion.alpha_composite(ghost, (column * CELL, row * CELL))
            onion.alpha_composite(current, (column * CELL, row * CELL))
            previous = current
    onion.save(ART / "shield-guard-onion.png")

    silhouette = sheet.resize((sheet.width // 4, sheet.height // 4), Image.Resampling.NEAREST)
    silhouette.paste((16, 20, 15, 255), mask=silhouette.getchannel("A"))
    silhouette.save(ART / "shield-guard-silhouette-25.png")

    review = Image.new("RGBA", (1600, 620), (31, 42, 34, 255))
    review_draw = ImageDraw.Draw(review)
    review_draw.line((20, 510, 1580, 510), fill=(255, 72, 72, 255), width=3)
    color_reference = Image.open(REVIEWS / "approved-five-enemy-color.png").convert("RGBA")
    silhouette_reference = Image.open(REVIEWS / "approved-five-enemy-silhouette.png").convert("RGBA")
    color_reference = color_reference.crop((1050, 130, 1410, 760))
    silhouette_reference = silhouette_reference.crop((1050, 160, 1410, 760))
    color_reference.thumbnail((260, 430), Image.Resampling.LANCZOS)
    silhouette_reference.thumbnail((260, 430), Image.Resampling.LANCZOS)
    gate = Image.open(ART / "shield-guard-idle-gate-transparent.png").convert("RGBA")
    gate_bounds = gate.getchannel("A").getbbox()
    gate = gate.crop(gate_bounds)
    gate.thumbnail((260, 430), Image.Resampling.NEAREST)
    runtime = sheet.crop((0, 0, CELL, CELL)).resize((288, 288), Image.Resampling.NEAREST)
    silhouette_idle = runtime.resize((72, 72), Image.Resampling.NEAREST)
    silhouette_idle.paste((0, 0, 0, 255), mask=silhouette_idle.getchannel("A"))
    review.alpha_composite(color_reference, (170 - color_reference.width // 2, 510 - color_reference.height))
    review.alpha_composite(silhouette_reference, (470 - silhouette_reference.width // 2, 510 - silhouette_reference.height))
    review.alpha_composite(gate, (770 - gate.width // 2, 510 - gate.height))
    review.alpha_composite(runtime, (1010, 510 - 288))
    review.alpha_composite(silhouette_idle, (1450, 510 - 72))
    review_draw.text((110, 548), "APPROVED COLOR", fill=(255, 244, 214, 255))
    review_draw.text((395, 548), "APPROVED SILHOUETTE", fill=(255, 244, 214, 255))
    review_draw.text((690, 548), "IDENTITY GATE", fill=(255, 244, 214, 255))
    review_draw.text((1095, 548), "RUNTIME IDLE", fill=(255, 244, 214, 255))
    review_draw.text((1400, 548), "25% SILHOUETTE", fill=(255, 244, 214, 255))
    review.save(REVIEWS / "shield-guard-er5-idle-gate.png")
    debug.save(REVIEWS / "shield-guard-er5-review.png")


if __name__ == "__main__":
    build()
