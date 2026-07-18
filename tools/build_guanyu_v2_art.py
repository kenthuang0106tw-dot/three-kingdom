from __future__ import annotations

import json
import hashlib
from pathlib import Path
from statistics import median

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "public" / "art" / "guanyu"

CELL_WIDTH = 640
CELL_HEIGHT = 448
FEET_X = 320
FEET_Y = 420
COLUMNS = 8
DISPLAY_SCALE = 0.64
TARGET_VISIBLE_HEIGHT = 360
ALPHA_THRESHOLD = 32

IDLE_SOURCE = ART / "guanyu-idle-v2-transparent.png"
ACTIONS_SOURCE = ART / "guanyu-actions-v2-transparent.png"
DEAD_FINAL_SOURCE = ART / "guanyu-dead-final-v2-transparent.png"
RUNTIME_SHEET = ART / "guanyu-v2.png"
ATLAS = ART / "guanyu-v2.atlas.json"
METADATA = ART / "guanyu-v2.metadata.json"
DEBUG_SHEET = ART / "guanyu-v2-debug.png"
SILHOUETTE_SHEET = ART / "guanyu-v2-silhouette-debug.png"
ONION_SHEET = ART / "guanyu-v2-onion-debug.png"

ANIMATIONS = {
    "idle": {"frames": [f"idle-{index}" for index in range(6)], "phase": "loop"},
    "walk": {"frames": [f"walk-{index}" for index in range(8)], "phase": "locomotion"},
    "attack1": {
        "frames": [f"attack1-{index}" for index in range(5)],
        "phases": ["startup", "startup", "active", "active", "recovery"],
    },
    "attack2": {
        "frames": [f"attack2-{index}" for index in range(6)],
        "phases": ["startup", "startup", "active", "active", "recovery", "recovery"],
    },
    "attack3": {
        "frames": [f"attack3-{index}" for index in range(8)],
        "phases": ["startup", "startup", "startup", "active", "active", "active", "recovery", "recovery"],
    },
    "hurt": {"frames": [f"hurt-{index}" for index in range(4)], "phase": "hurt"},
    "dead": {"frames": [f"dead-{index}" for index in range(6)], "phase": "dead"},
}


def clean_alpha(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    alpha = image.getchannel("A").point(lambda value: 0 if value < ALPHA_THRESHOLD else value)
    image.putalpha(alpha)
    return image


def alpha_bounds(image: Image.Image) -> tuple[int, int, int, int]:
    bounds = image.getchannel("A").getbbox()
    if bounds is None:
        raise RuntimeError("Frame contains no visible pixels")
    return bounds


def connected_poses(image: Image.Image, minimum_pixels: int = 500) -> list[dict[str, object]]:
    alpha = image.getchannel("A")
    width, height = image.size
    values = alpha.tobytes()
    visited = bytearray(width * height)
    components: list[dict[str, object]] = []

    for start, value in enumerate(values):
        if value < ALPHA_THRESHOLD or visited[start]:
            continue
        visited[start] = 1
        stack = [start]
        pixels: list[tuple[int, int]] = []
        min_x = max_x = start % width
        min_y = max_y = start // width
        while stack:
            index = stack.pop()
            x, y = index % width, index // width
            pixels.append((x, y))
            min_x, max_x = min(min_x, x), max(max_x, x)
            min_y, max_y = min(min_y, y), max(max_y, y)
            if x > 0:
                neighbor = index - 1
                if values[neighbor] >= ALPHA_THRESHOLD and not visited[neighbor]:
                    visited[neighbor] = 1
                    stack.append(neighbor)
            if x + 1 < width:
                neighbor = index + 1
                if values[neighbor] >= ALPHA_THRESHOLD and not visited[neighbor]:
                    visited[neighbor] = 1
                    stack.append(neighbor)
            if y > 0:
                neighbor = index - width
                if values[neighbor] >= ALPHA_THRESHOLD and not visited[neighbor]:
                    visited[neighbor] = 1
                    stack.append(neighbor)
            if y + 1 < height:
                neighbor = index + width
                if values[neighbor] >= ALPHA_THRESHOLD and not visited[neighbor]:
                    visited[neighbor] = 1
                    stack.append(neighbor)
        if len(pixels) < minimum_pixels:
            continue
        rect = (min_x, min_y, max_x + 1, max_y + 1)
        pose = image.crop(rect)
        mask = Image.new("L", pose.size, 0)
        mask_pixels = mask.load()
        for x, y in pixels:
            mask_pixels[x - min_x, y - min_y] = alpha.getpixel((x, y))
        pose.putalpha(mask)
        components.append({"rect": rect, "image": pose, "pixels": len(pixels)})
    return components


def source_cells() -> list[dict[str, object]]:
    idle = clean_alpha(Image.open(IDLE_SOURCE))
    actions = clean_alpha(Image.open(ACTIONS_SOURCE))
    dead_final = clean_alpha(Image.open(DEAD_FINAL_SOURCE))
    if idle.size != (2172, 724):
        raise RuntimeError(f"Unexpected idle source size: {idle.size}")
    if actions.size != (1448, 1086):
        raise RuntimeError(f"Unexpected actions source size: {actions.size}")
    if dead_final.size != (1536, 1024):
        raise RuntimeError(f"Unexpected final death source size: {dead_final.size}")

    cells: list[dict[str, object]] = []
    idle_components = sorted(connected_poses(idle), key=lambda item: item["rect"][0])
    if len(idle_components) != 6:
        raise RuntimeError(f"Expected 6 isolated idle poses, got {len(idle_components)}")
    idle_cell_width = idle.width / 6
    for index, component in enumerate(idle_components):
        rect = component["rect"]
        cells.append({
            "name": f"idle-{index}", "animation": "idle", "phase": "loop",
            "sourceName": IDLE_SOURCE.name, "sourceRect": rect, "image": component["image"],
            "sourceRootX": (index + 0.5) * idle_cell_width - rect[0],
        })

    row_specs = [
        (0, "walk", 8),
        (1, "attack1", 5),
        (2, "attack2", 6),
        (3, "attack3", 8),
        (4, "hurt", 4),
        (5, "dead", 5),
    ]
    action_components = sorted(connected_poses(actions), key=lambda item: ((item["rect"][1] + item["rect"][3]) / 2, item["rect"][0]))
    if len(action_components) != 36:
        raise RuntimeError(f"Expected 36 isolated action poses, got {len(action_components)}")
    cursor = 0
    action_cell_width = actions.width / 8
    for row, animation, count in row_specs:
        phases = ANIMATIONS[animation].get("phases")
        row_components = sorted(action_components[cursor:cursor + count], key=lambda item: item["rect"][0])
        cursor += count
        for index, component in enumerate(row_components):
            rect = component["rect"]
            cells.append({
                "name": f"{animation}-{index}", "animation": animation,
                "phase": phases[index] if phases else ANIMATIONS[animation]["phase"],
                "sourceName": ACTIONS_SOURCE.name, "sourceRect": rect, "image": component["image"],
                "sourceRootX": (index + 0.5) * action_cell_width - rect[0],
            })
    final_components = connected_poses(dead_final)
    if len(final_components) != 1:
        raise RuntimeError(f"Expected one isolated final death pose, got {len(final_components)}")
    final_component = final_components[0]
    final_rect = final_component["rect"]
    cells.append({
        "name": "dead-5", "animation": "dead", "phase": "dead",
        "sourceName": DEAD_FINAL_SOURCE.name, "sourceRect": final_rect,
        "image": final_component["image"], "sourceRootX": final_component["image"].width / 2,
    })
    return cells


def source_scales(cells: list[dict[str, object]]) -> dict[str, float]:
    idle_heights = []
    walk_heights = []
    for item in cells:
        bounds = alpha_bounds(item["image"])
        height = bounds[3] - bounds[1]
        if item["animation"] == "idle":
            idle_heights.append(height)
        elif item["animation"] == "walk":
            walk_heights.append(height)
    scales = {
        IDLE_SOURCE.name: TARGET_VISIBLE_HEIGHT / median(idle_heights),
        ACTIONS_SOURCE.name: TARGET_VISIBLE_HEIGHT / median(walk_heights),
    }
    action_dead_widths = [item["image"].width * scales[ACTIONS_SOURCE.name]
                          for item in cells if item["animation"] == "dead" and item["sourceName"] == ACTIONS_SOURCE.name]
    final = next(item for item in cells if item["sourceName"] == DEAD_FINAL_SOURCE.name)
    scales[DEAD_FINAL_SOURCE.name] = median(action_dead_widths[-2:]) / final["image"].width
    return scales


def make_onion_frame(previous: Image.Image, current: Image.Image) -> Image.Image:
    result = Image.new("RGBA", current.size, (0, 0, 0, 0))
    previous_tint = Image.new("RGBA", previous.size, (80, 205, 255, 0))
    previous_tint.putalpha(previous.getchannel("A").point(lambda value: round(value * 0.32)))
    result.alpha_composite(previous_tint)
    result.alpha_composite(current)
    return result


def legacy_audit() -> list[dict[str, object]]:
    records: list[dict[str, object]] = []
    sources = [
        ("guanyu-master.png", "guanyu-idle.atlas.json", "identity reference only; rejected as one-frame runtime"),
        ("guanyu-walk.png", "guanyu-walk.atlas.json", "four usable key poses; rejected as incomplete cycle and separate scale"),
        ("guanyu-combo-frames.png", "guanyu-attack.atlas.json", "six usable key poses; rejected as incomplete transitions and separate scale"),
    ]
    for image_name, atlas_name, decision in sources:
        image = clean_alpha(Image.open(ART / image_name))
        atlas = json.loads((ART / atlas_name).read_text(encoding="utf-8"))
        for name, entry in atlas["frames"].items():
            frame = entry["frame"]
            rect = (frame["x"], frame["y"], frame["x"] + frame["w"], frame["y"] + frame["h"])
            bounds = alpha_bounds(image.crop(rect))
            records.append({
                "name": name, "image": image_name,
                "sourceRect": {"x": rect[0], "y": rect[1], "width": rect[2] - rect[0], "height": rect[3] - rect[1]},
                "alphaBounds": {"x": bounds[0], "y": bounds[1], "width": bounds[2] - bounds[0], "height": bounds[3] - bounds[1]},
                "facing": "right", "feetAnchor": "frame-specific legacy pivot", "decision": decision,
            })

    air = clean_alpha(Image.open(ART / "guanyu-air-hit.png"))
    edges = [0, 362, 724, 1086, 1448, 1810, 2172]
    decisions = [
        "usable hurt reference", "rejected airborne transition", "rejected unrelated kick",
        "usable hurt reference", "rejected airborne fall", "usable grounded death reference",
    ]
    for index, decision in enumerate(decisions):
        rect = (edges[index], 0, edges[index + 1], air.height)
        bounds = alpha_bounds(air.crop(rect))
        records.append({
            "name": f"air-hit-{index}", "image": "guanyu-air-hit.png",
            "sourceRect": {"x": rect[0], "y": 0, "width": rect[2] - rect[0], "height": rect[3]},
            "alphaBounds": {"x": bounds[0], "y": bounds[1], "width": bounds[2] - bounds[0], "height": bounds[3] - bounds[1]},
            "facing": "right", "feetAnchor": "not normalized", "decision": decision,
        })
    return records


def main() -> None:
    cells = source_cells()
    scales = source_scales(cells)
    rows = (len(cells) + COLUMNS - 1) // COLUMNS
    sheet = Image.new("RGBA", (CELL_WIDTH * COLUMNS, CELL_HEIGHT * rows), (0, 0, 0, 0))
    frames: dict[str, object] = {}
    metadata_frames: list[dict[str, object]] = []
    rendered: dict[str, Image.Image] = {}
    pose_hashes: set[str] = set()

    for frame_index, item in enumerate(cells):
        source_image = item["image"]
        bounds = alpha_bounds(source_image)
        left, top, right, bottom = bounds
        scale = scales[item["sourceName"]]
        pose = source_image.crop(bounds)
        width = max(1, round(pose.width * scale))
        height = max(1, round(pose.height * scale))
        if width > CELL_WIDTH - 16 or height > FEET_Y:
            raise RuntimeError(f"Pose exceeds runtime cell: {item['name']} {width}x{height}")
        pose = pose.resize((width, height), Image.Resampling.NEAREST)

        source_root_x = item["sourceRootX"]
        paste_x = round(FEET_X - source_root_x * scale)
        paste_y = FEET_Y - height
        if paste_x < 0 or paste_x + width > CELL_WIDTH or paste_y < 0:
            raise RuntimeError(f"Pose placement exceeds runtime cell: {item['name']}")

        runtime_frame = Image.new("RGBA", (CELL_WIDTH, CELL_HEIGHT), (0, 0, 0, 0))
        runtime_frame.alpha_composite(pose, (paste_x, paste_y))
        pose_hash = hashlib.sha256(runtime_frame.tobytes()).hexdigest()
        if pose_hash in pose_hashes:
            raise RuntimeError(f"Duplicate runtime pose: {item['name']}")
        pose_hashes.add(pose_hash)
        rendered[item["name"]] = runtime_frame

        row, column = divmod(frame_index, COLUMNS)
        frame_x, frame_y = column * CELL_WIDTH, row * CELL_HEIGHT
        sheet.alpha_composite(runtime_frame, (frame_x, frame_y))
        runtime_bounds = alpha_bounds(runtime_frame)
        if runtime_bounds[3] != FEET_Y:
            raise RuntimeError(f"Feet anchor drift: {item['name']} bottom={runtime_bounds[3]}")
        rect = item["sourceRect"]
        frames[item["name"]] = {
            "frame": {"x": frame_x, "y": frame_y, "w": CELL_WIDTH, "h": CELL_HEIGHT},
            "rotated": False, "trimmed": False,
            "spriteSourceSize": {"x": 0, "y": 0, "w": CELL_WIDTH, "h": CELL_HEIGHT},
            "sourceSize": {"w": CELL_WIDTH, "h": CELL_HEIGHT},
            "pivot": {"x": FEET_X / CELL_WIDTH, "y": FEET_Y / CELL_HEIGHT},
        }
        metadata_frames.append({
            "name": item["name"], "animation": item["animation"], "phase": item["phase"],
            "sourceImage": item["sourceName"],
            "sourceRect": {"x": rect[0], "y": rect[1], "width": rect[2] - rect[0], "height": rect[3] - rect[1]},
            "alphaBounds": {"x": left, "y": top, "width": right - left, "height": bottom - top},
            "runtimeAlphaBounds": {"x": runtime_bounds[0], "y": runtime_bounds[1], "width": runtime_bounds[2] - runtime_bounds[0], "height": runtime_bounds[3] - runtime_bounds[1]},
            "frame": {"x": frame_x, "y": frame_y, "width": CELL_WIDTH, "height": CELL_HEIGHT},
            "originX": FEET_X / CELL_WIDTH, "originY": FEET_Y / CELL_HEIGHT,
            "displayOffsetX": paste_x, "displayOffsetY": paste_y,
            "feetAnchor": {"x": FEET_X, "y": FEET_Y},
            "sourceScale": scale, "displayScale": DISPLAY_SCALE,
        })

    sheet.save(RUNTIME_SHEET)

    debug = sheet.copy()
    draw = ImageDraw.Draw(debug)
    for index, item in enumerate(metadata_frames):
        row, column = divmod(index, COLUMNS)
        x, y = column * CELL_WIDTH, row * CELL_HEIGHT
        draw.rectangle((x, y, x + CELL_WIDTH - 1, y + CELL_HEIGHT - 1), outline=(255, 0, 0, 255), width=3)
        draw.line((x, y + FEET_Y, x + CELL_WIDTH - 1, y + FEET_Y), fill=(255, 0, 0, 230), width=2)
        draw.line((x + FEET_X - 6, y + FEET_Y, x + FEET_X + 6, y + FEET_Y), fill=(255, 255, 0, 255), width=3)
        draw.text((x + 8, y + 8), f"{item['name']} / {item['phase']}", fill=(255, 0, 0, 255), stroke_width=2, stroke_fill=(255, 255, 255, 255))
    debug.save(DEBUG_SHEET)

    silhouette = Image.new("RGBA", sheet.size, (0, 0, 0, 0))
    silhouette_alpha = sheet.getchannel("A")
    silhouette.paste((16, 20, 15, 255), (0, 0, sheet.width, sheet.height), silhouette_alpha)
    silhouette.resize((sheet.width // 4, sheet.height // 4), Image.Resampling.NEAREST).save(SILHOUETTE_SHEET)

    onion = Image.new("RGBA", sheet.size, (0, 0, 0, 0))
    for index, item in enumerate(metadata_frames):
        sequence = ANIMATIONS[item["animation"]]["frames"]
        position = sequence.index(item["name"])
        previous_name = sequence[position - 1] if position > 0 else item["name"]
        row, column = divmod(index, COLUMNS)
        onion.alpha_composite(make_onion_frame(rendered[previous_name], rendered[item["name"]]), (column * CELL_WIDTH, row * CELL_HEIGHT))
    onion.save(ONION_SHEET)

    ATLAS.write_text(json.dumps({
        "frames": frames,
        "meta": {"app": "Codex Guan Yu v2 art builder", "version": "1.0", "image": RUNTIME_SHEET.name,
                 "format": "RGBA8888", "size": {"w": sheet.width, "h": sheet.height}, "scale": "1"},
    }, ensure_ascii=False, indent=2), encoding="utf-8")
    METADATA.write_text(json.dumps({
        "provenance": {
            "tool": "OpenAI built-in image generator plus chroma-key removal and tools/build_guanyu_v2_art.py",
            "generatedAt": "2026-07-18", "original": True,
            "reference": "project-owned guanyu-master-source.png identity and motion reference sheets",
            "generationPromptSummary": [
                "Original 1990s Japanese-realistic Three Kingdoms pixel-art Guan Yu; jade, blue-black, antique-gold, and red costume; right-facing; flat magenta chroma background; six subtle grounded idle poses with fixed feet.",
                "Same original Guan Yu identity and palette; genuine right-facing walk, three attack, grounded hurt, and death action rows; fixed feet; no text, shadow, watermark, interpolation, or transform-derived poses.",
                "Same original Guan Yu identity; one distinct final grounded settled death pose on flat magenta chroma background; no text, shadow, watermark, or third-party character copy.",
            ],
            "sourceRevision": "b752653", "manualReviewer": "Codex Technical Lead",
            "acceptedBaseline": "docs/visual-baselines/m6a-6a1-before/desktop-combat.png",
        },
        "runtimeTextureKey": "guanyu-v2", "animationKeys": [f"guanyu-{name}" for name in ANIMATIONS],
        "cell": {"width": CELL_WIDTH, "height": CELL_HEIGHT},
        "feetAnchor": {"x": FEET_X, "y": FEET_Y}, "displayScale": DISPLAY_SCALE,
        "logicalIdleHeight": TARGET_VISIBLE_HEIGHT * DISPLAY_SCALE,
        "sourceScales": scales, "animations": ANIMATIONS,
        "frames": metadata_frames, "legacyAudit": legacy_audit(),
    }, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
