"""Build the approved Zhang Fei preview atlas and visual QA artifacts."""

from __future__ import annotations

import hashlib
import json
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "art" / "zhangfei-v2"
SOURCE = OUT / "source"
CELL = (672, 448)
GRID = (6, 8)
FEET = (336, 420)
ORIGIN = (0.5, 0.9375)
DISPLAY_SCALE = 0.64
GLOBAL_SCALE = 1.20

SOURCES = {
    "idle": ("zhangfei-idle-transparent.png", 3, 2, list(range(6))),
    "walk": ("zhangfei-walk-transparent.png", 3, 3, list(range(8))),
    "attack1": ("zhangfei-attack1-transparent.png", 3, 2, list(range(6))),
    "attack2": ("zhangfei-attack12-transparent.png", 7, 2, list(range(7, 14))),
    "attack3": ("zhangfei-attack3-transparent.png", 5, 2, list(range(10))),
    "hurt": ("zhangfei-hurt-dead-transparent.png", 6, 2, list(range(4))),
    "dead": ("zhangfei-hurt-dead-transparent.png", 6, 2, list(range(6, 12))),
}

PHASES = {
    "idle": ["loop"] * 6,
    "walk": ["loop"] * 8,
    "attack1": ["startup", "startup", "active", "active", "recovery", "recovery"],
    "attack2": ["startup", "startup", "startup", "active", "active", "recovery", "recovery"],
    "attack3": ["startup"] * 4 + ["active"] * 3 + ["recovery"] * 3,
    "hurt": ["hurt"] * 4,
    "dead": ["death"] * 6,
}

PROMPTS = {
    "idle": "Japanese 1990s arcade-realistic Zhang Fei, heavy warrior, dark beard, oxblood and aged bronze armor, six grounded idle poses, complete Zhangba serpent spear (丈八蛇矛): long shaft and symmetric snake-shaped double-edged spearhead, never a guandao, chroma green background.",
    "walk": "Same Zhang Fei identity, eight genuine right-facing walk poses, stable feet and complete Zhangba serpent spear (丈八蛇矛), never a guandao, chroma green background.",
    "attack1": "Same Zhang Fei identity, six isolated right-facing compact thrust poses with complete Zhangba serpent spear (丈八蛇矛), three columns by two rows, chroma green background.",
    "attack12": "Same Zhang Fei identity, distinct attack1 thrust and attack2 sweep sequences with startup, active and recovery poses, chroma green background.",
    "attack3": "Same Zhang Fei identity, ten-frame high-commitment finishing attack sequence, continuous complete Zhangba serpent spear (丈八蛇矛) arc, chroma green background.",
    "hurt_dead": "Same Zhang Fei identity, four grounded hurt poses and six progressive grounded death poses, chroma green background.",
}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def connected_subjects(frame: Image.Image):
    """Extract complete connected subjects, independent of nominal grid width."""
    alpha = np.asarray(frame.getchannel("A"))
    opaque = alpha > 8
    visited = np.zeros(opaque.shape, dtype=bool)
    components: list[list[tuple[int, int]]] = []
    height, width = opaque.shape
    for start_y, start_x in np.argwhere(opaque):
        y, x = int(start_y), int(start_x)
        if visited[y, x]:
            continue
        component: list[tuple[int, int]] = []
        queue = deque([(y, x)])
        visited[y, x] = True
        while queue:
            current_y, current_x = queue.popleft()
            component.append((current_y, current_x))
            for next_y in range(max(0, current_y - 1), min(height, current_y + 2)):
                for next_x in range(max(0, current_x - 1), min(width, current_x + 2)):
                    if opaque[next_y, next_x] and not visited[next_y, next_x]:
                        visited[next_y, next_x] = True
                        queue.append((next_y, next_x))
        if len(component) >= 500:
            components.append(component)

    subjects = []
    source = np.asarray(frame)
    for component in components:
        ys, xs = zip(*component)
        left, right = min(xs), max(xs) + 1
        top, bottom = min(ys), max(ys) + 1
        result = np.zeros((bottom - top, right - left, 4), dtype=np.uint8)
        local_y = np.asarray(ys) - top
        local_x = np.asarray(xs) - left
        result[local_y, local_x] = source[np.asarray(ys), np.asarray(xs)]
        subjects.append((Image.fromarray(result, "RGBA"), (left, top, right - left, bottom - top)))
    return sorted(subjects, key=lambda subject: subject[1][0] + subject[1][2] / 2)


def build():
    atlas = Image.new("RGBA", (CELL[0] * GRID[0], CELL[1] * GRID[1]))
    debug = Image.new("RGBA", atlas.size, (18, 20, 24, 255))
    metadata_frames = []
    atlas_frames = {}
    rendered = []
    global_index = 0

    for animation, (filename, columns, rows, indices) in SOURCES.items():
        image = Image.open(SOURCE / filename).convert("RGBA")
        subject_rows = {}
        for row in sorted({index // columns for index in indices}):
            y0 = round(row * image.height / rows)
            y1 = round((row + 1) * image.height / rows)
            subject_rows[row] = connected_subjects(image.crop((0, y0, image.width, y1)))
        for local_index, source_index in enumerate(indices):
            source_row, source_column = divmod(source_index, columns)
            row_subjects = subject_rows[source_row]
            if source_column >= len(row_subjects):
                raise ValueError(f"{animation}-{local_index} subject is missing")
            raw, row_rect = row_subjects[source_column]
            row_y = round(source_row * image.height / rows)
            source_rect = (row_rect[0], row_y + row_rect[1], row_rect[2], row_rect[3])
            size = (
                max(1, round(raw.width * GLOBAL_SCALE)),
                max(1, round(raw.height * GLOBAL_SCALE)),
            )
            frame = raw.resize(size, Image.Resampling.NEAREST)
            paste_x = FEET[0] - frame.width // 2
            paste_y = FEET[1] - frame.height
            if paste_x < 8 or paste_y < 8 or paste_x + frame.width > CELL[0] - 8:
                raise ValueError(f"{animation}-{local_index} exceeds safe cell bounds")

            col, row = global_index % GRID[0], global_index // GRID[0]
            cell_x, cell_y = col * CELL[0], row * CELL[1]
            atlas.alpha_composite(frame, (cell_x + paste_x, cell_y + paste_y))
            debug.alpha_composite(frame, (cell_x + paste_x, cell_y + paste_y))

            name = f"{animation}-{local_index}"
            alpha_bounds = (paste_x, paste_y, frame.width, frame.height)
            atlas_frames[name] = {
                "frame": {"x": cell_x, "y": cell_y, "w": CELL[0], "h": CELL[1]},
                "rotated": False,
                "trimmed": False,
                "spriteSourceSize": {"x": 0, "y": 0, "w": CELL[0], "h": CELL[1]},
                "sourceSize": {"w": CELL[0], "h": CELL[1]},
            }
            metadata_frames.append(
                {
                    "index": global_index,
                    "name": name,
                    "animation": animation,
                    "animationFrame": local_index,
                    "phase": PHASES[animation][local_index],
                    "facing": "right",
                    "source": f"source/{filename}",
                    "sourceIndex": source_index,
                    "sourceRect": dict(zip(("x", "y", "width", "height"), source_rect)),
                    "alphaBounds": dict(zip(("x", "y", "width", "height"), alpha_bounds)),
                    "outputRect": {"x": cell_x, "y": cell_y, "width": CELL[0], "height": CELL[1]},
                    "displayOffset": {"x": paste_x, "y": paste_y},
                    "feetAnchor": {"x": FEET[0], "y": FEET[1]},
                    "origin": {"x": ORIGIN[0], "y": ORIGIN[1]},
                    "globalScale": GLOBAL_SCALE,
                    "displayScale": DISPLAY_SCALE,
                    "pixelHash": hashlib.sha256(frame.tobytes()).hexdigest(),
                }
            )
            rendered.append((name, frame, paste_x, paste_y))
            global_index += 1

    atlas.save(OUT / "zhangfei-v2.png")
    atlas_json = {
        "frames": atlas_frames,
        "meta": {
            "app": "tools/build_zhangfei_v2_art.py",
            "version": "2.0",
            "image": "zhangfei-v2.png",
            "format": "RGBA8888",
            "size": {"w": atlas.width, "h": atlas.height},
            "scale": "1",
        },
    }
    (OUT / "zhangfei-v2.atlas.json").write_text(
        json.dumps(atlas_json, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    source_files = sorted({
        SOURCE / filename.replace("-transparent.png", "-source.png")
        for filename, _, _, _ in SOURCES.values()
    })
    metadata = {
        "schemaVersion": 1,
        "character": "zhang-fei",
        "status": "development-preview-only",
        "frameCount": len(metadata_frames),
        "cell": {"width": CELL[0], "height": CELL[1], "columns": GRID[0], "rows": GRID[1]},
        "feetAnchor": {"x": FEET[0], "y": FEET[1]},
        "origin": {"x": ORIGIN[0], "y": ORIGIN[1]},
        "displayScale": DISPLAY_SCALE,
        "globalScale": GLOBAL_SCALE,
        "animations": {key: {"frameCount": len(value), "phases": PHASES[key]} for key, value in SOURCES.items()},
        "provenance": {
            "tool": "OpenAI built-in imagegen",
            "mode": "project-bound chroma-key generation",
            "prompts": PROMPTS,
            "sourceFiles": [{"path": f"source/{path.name}", "sha256": sha256(path)} for path in source_files],
        },
        "frames": metadata_frames,
    }
    (OUT / "zhangfei-v2.metadata.json").write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    draw = ImageDraw.Draw(debug)
    for item in metadata_frames:
        rect = item["outputRect"]
        cell_x, cell_y = rect["x"], rect["y"]
        bounds = item["alphaBounds"]
        draw.rectangle(
            (
                cell_x + bounds["x"],
                cell_y + bounds["y"],
                cell_x + bounds["x"] + bounds["width"] - 1,
                cell_y + bounds["y"] + bounds["height"] - 1,
            ),
            outline=(255, 48, 48, 255),
            width=3,
        )
        draw.line((cell_x, cell_y + FEET[1], cell_x + CELL[0], cell_y + FEET[1]), fill=(0, 255, 255, 255), width=2)
        draw.ellipse((cell_x + FEET[0] - 4, cell_y + FEET[1] - 4, cell_x + FEET[0] + 4, cell_y + FEET[1] + 4), fill=(255, 255, 0, 255))
        draw.text((cell_x + 8, cell_y + 8), f'{item["index"]:02d} {item["name"]} {item["phase"]}', fill="white")
    debug.save(OUT / "zhangfei-v2-debug.png")

    onion = Image.new("RGBA", (CELL[0] * len(SOURCES), CELL[1]), (18, 20, 24, 255))
    onion_draw = ImageDraw.Draw(onion)
    rendered_by_name = {name: (frame, x, y) for name, frame, x, y in rendered}
    for state_index, (state, (_, _, _, indices)) in enumerate(SOURCES.items()):
        panel = Image.new("RGBA", CELL)
        for frame_index in range(len(indices)):
            frame, x, y = rendered_by_name[f"{state}-{frame_index}"]
            layer = Image.new("RGBA", CELL)
            layer.alpha_composite(frame, (x, y))
            layer.putalpha(round(45 + 180 * frame_index / max(1, len(indices) - 1)))
            panel.alpha_composite(layer)
        onion.alpha_composite(panel, (state_index * CELL[0], 0))
        onion_draw.line((state_index * CELL[0], FEET[1], (state_index + 1) * CELL[0], FEET[1]), fill=(0, 255, 255, 255), width=2)
        onion_draw.text((state_index * CELL[0] + 8, 8), f"{state} @ 2 FPS", fill="white")
    onion.save(OUT / "zhangfei-v2-onion.png")

    silhouette = atlas.resize((atlas.width // 4, atlas.height // 4), Image.Resampling.NEAREST)
    silhouette.save(OUT / "zhangfei-v2-silhouette-25.png")

    identity = Image.new("RGBA", (CELL[0] * 4, CELL[1]), (18, 20, 24, 255))
    for destination, source_index in enumerate((0, 7, 16, 37)):
        identity.alpha_composite(atlas.crop((source_index % 6 * CELL[0], source_index // 6 * CELL[1], (source_index % 6 + 1) * CELL[0], (source_index // 6 + 1) * CELL[1])), (destination * CELL[0], 0))
    identity.save(OUT / "zhangfei-v2-identity.png")

    lineup = Image.new("RGBA", (1280, 720), (18, 20, 24, 255))
    lineup_draw = ImageDraw.Draw(lineup)
    lineup_draw.line((60, 610, 1220, 610), fill=(0, 255, 255, 255), width=2)

    def atlas_frame(image_path: Path, json_path: Path, name: str):
        image = Image.open(image_path).convert("RGBA")
        frame_data = json.loads(json_path.read_text(encoding="utf-8"))["frames"][name]["frame"]
        return image.crop((frame_data["x"], frame_data["y"], frame_data["x"] + frame_data["w"], frame_data["y"] + frame_data["h"]))

    lineup_specs = [
        ("Guan Yu", atlas_frame(OUT.parent / "guanyu" / "guanyu-v2.png", OUT.parent / "guanyu" / "guanyu-v2.atlas.json", "idle-0"), 0.64, 320),
        ("Zhang Fei", atlas.crop((0, 0, CELL[0], CELL[1])), DISPLAY_SCALE, 640),
        ("Boss", atlas_frame(OUT.parent / "boss" / "warlord-lifecycle.png", OUT.parent / "boss" / "warlord-lifecycle.atlas.json", "idle-0"), 1.27, 990),
    ]
    for label, frame, scale, center_x in lineup_specs:
        displayed = frame.resize((round(frame.width * scale), round(frame.height * scale)), Image.Resampling.NEAREST)
        lineup.alpha_composite(displayed, (center_x - displayed.width // 2, 610 - round(displayed.height * 0.9375)))
        lineup_draw.text((center_x - 35, 650), label, fill="white")
    lineup.save(OUT / "zhangfei-v2-lineup.png")

    colors = atlas.get_flattened_data()
    histogram = {}
    for red, green, blue, alpha in colors:
        if alpha > 128:
            key = f"#{red:02x}{green:02x}{blue:02x}"
            histogram[key] = histogram.get(key, 0) + 1
    palette = sorted(histogram.items(), key=lambda item: item[1], reverse=True)[:24]
    (OUT / "zhangfei-v2-palette.json").write_text(
        json.dumps({"dominantColors": [{"hex": color, "pixels": count} for color, count in palette]}, indent=2),
        encoding="utf-8",
    )

    print(f"Built {len(metadata_frames)} Zhang Fei frames at {atlas.size}")


if __name__ == "__main__":
    build()
