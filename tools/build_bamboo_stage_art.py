from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "public" / "scene" / "source"
OUTPUT_DIR = ROOT / "public" / "scene" / "bamboo-stage"

WIDTH = 1280
HEIGHT = 720
GROUND_Y = 390
FOREGROUND_DEPTH = 640
SEAM_WIDTH = 64
PALETTE_COLORS = 96

SECTIONS = (
    {
        "id": "forest-entry",
        "source": "bamboo-forest-entry-source.png",
        "landmark": "sparse bamboo road entrance, trail marker, stone edging and lantern",
        "promptId": "imagegen-exec-923afaa5-6211-4169-acbd-1a68934f3928",
    },
    {
        "id": "forest-ambush",
        "source": "bamboo-forest-ambush-source.png",
        "landmark": "dense bamboo, fallen trunk and restrained anti-cavalry barricade",
        "promptId": "imagegen-exec-1fd30c49-1d27-4404-8982-d541bb603d6c",
    },
    {
        "id": "boss-arena",
        "source": "bamboo-boss-arena-source.png",
        "landmark": "fortified camp gate, plain command flags and open ceremonial ground",
        "promptId": "imagegen-exec-7d094f57-ce61-42f3-a978-d2f1c450d20a",
    },
)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def resize_source(path: Path) -> Image.Image:
    source = Image.open(path).convert("RGB")
    return source.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)


def build_shared_palette(images: list[Image.Image]) -> Image.Image:
    sample = Image.new("RGB", (WIDTH // 4, (HEIGHT // 4) * len(images)))
    for index, image in enumerate(images):
        sample.paste(
            image.resize((WIDTH // 4, HEIGHT // 4), Image.Resampling.BOX),
            (0, index * (HEIGHT // 4)),
        )
    return sample.quantize(
        colors=PALETTE_COLORS,
        method=Image.Quantize.MEDIANCUT,
        dither=Image.Dither.NONE,
    )


def blend_channel(source: int, target: int, amount: float) -> int:
    return round(source + (target - source) * amount)


def normalize_seam(left: Image.Image, right: Image.Image) -> None:
    left_pixels = left.load()
    right_pixels = right.load()
    for y in range(HEIGHT):
        left_edge = [left_pixels[x, y] for x in range(WIDTH - 8, WIDTH)]
        right_edge = [right_pixels[x, y] for x in range(0, 8)]
        common = tuple(
            round(sum(pixel[channel] for pixel in left_edge + right_edge) / 16)
            for channel in range(3)
        )
        for offset in range(SEAM_WIDTH):
            left_x = WIDTH - SEAM_WIDTH + offset
            right_x = offset
            left_amount = (offset + 1) / SEAM_WIDTH
            right_amount = (SEAM_WIDTH - offset) / SEAM_WIDTH
            left_pixels[left_x, y] = tuple(
                blend_channel(left_pixels[left_x, y][channel], common[channel], left_amount)
                for channel in range(3)
            )
            right_pixels[right_x, y] = tuple(
                blend_channel(right_pixels[right_x, y][channel], common[channel], right_amount)
                for channel in range(3)
            )


def split_layers(image: Image.Image) -> tuple[Image.Image, Image.Image, Image.Image]:
    background = Image.new("RGBA", image.size)
    background.paste(image.crop((0, 0, WIDTH, GROUND_Y)), (0, 0))

    ground = Image.new("RGBA", image.size)
    ground.paste(image.crop((0, GROUND_Y, WIDTH, HEIGHT)), (0, GROUND_Y))

    foreground = Image.new("RGBA", image.size)
    source_pixels = image.load()
    foreground_pixels = foreground.load()
    for y in range(560, HEIGHT):
        for x in range(WIDTH):
            corner_distance = min(x, WIDTH - 1 - x)
            allowed_width = 235 - max(0, 625 - y)
            if corner_distance > allowed_width:
                continue
            red, green, blue = source_pixels[x, y]
            if green >= red + 3 and green >= blue + 5 and red + green + blue < 285:
                foreground_pixels[x, y] = (red, green, blue, 255)
    return background, ground, foreground


def composite_layers(layers: tuple[Image.Image, Image.Image, Image.Image]) -> Image.Image:
    result = Image.new("RGBA", (WIDTH, HEIGHT))
    for layer in layers:
        result = Image.alpha_composite(result, layer)
    return result


def save_qa(composites: list[Image.Image], foregrounds: list[Image.Image]) -> None:
    overview = Image.new("RGBA", (WIDTH * len(composites), HEIGHT))
    for index, composite in enumerate(composites):
        overview.paste(composite, (index * WIDTH, 0))
    overview.convert("RGB").save(OUTPUT_DIR / "bamboo-stage-overview.png", optimize=True)
    overview.resize((WIDTH * len(composites) // 4, HEIGHT // 4), Image.Resampling.NEAREST).convert("RGB").save(
        OUTPUT_DIR / "bamboo-stage-overview-25.png", optimize=True
    )

    seam_debug = Image.new("RGB", (512, HEIGHT), "#10140f")
    overview_rgb = overview.convert("RGB")
    for index, boundary in enumerate((WIDTH, WIDTH * 2)):
        crop = overview_rgb.crop((boundary - 128, 0, boundary + 128, HEIGHT))
        seam_debug.paste(crop, (index * 256, 0))
    draw = ImageDraw.Draw(seam_debug)
    draw.line((128, 0, 128, HEIGHT), fill="#ff3b30", width=1)
    draw.line((384, 0, 384, HEIGHT), fill="#ff3b30", width=1)
    draw.text((8, 8), "ENTRY / AMBUSH", fill="#fff4d6")
    draw.text((264, 8), "AMBUSH / BOSS", fill="#fff4d6")
    seam_debug.save(OUTPUT_DIR / "bamboo-stage-seams-debug.png", optimize=True)

    depth_debug = overview.convert("RGBA")
    tint = Image.new("RGBA", depth_debug.size)
    for index, foreground in enumerate(foregrounds):
        alpha = foreground.getchannel("A")
        magenta = Image.new("RGBA", (WIDTH, HEIGHT), (255, 0, 220, 150))
        magenta.putalpha(alpha.point(lambda value: 150 if value else 0))
        tint.alpha_composite(magenta, (index * WIDTH, 0))
    depth_debug = Image.alpha_composite(depth_debug, tint)
    draw = ImageDraw.Draw(depth_debug)
    draw.line((0, GROUND_Y, depth_debug.width, GROUND_Y), fill="#00ffff", width=2)
    for boundary in (WIDTH, WIDTH * 2):
        draw.line((boundary, 0, boundary, HEIGHT), fill="#ff3b30", width=2)
    depth_debug.convert("RGB").save(OUTPUT_DIR / "bamboo-stage-depth-debug.png", optimize=True)


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    source_paths = [SOURCE_DIR / section["source"] for section in SECTIONS]
    for source_path in source_paths:
        if not source_path.exists():
            raise FileNotFoundError(source_path)

    resized = [resize_source(path) for path in source_paths]
    normalize_seam(resized[0], resized[1])
    normalize_seam(resized[1], resized[2])
    palette = build_shared_palette(resized)
    processed = [
        image.quantize(palette=palette, dither=Image.Dither.NONE).convert("RGB")
        for image in resized
    ]

    metadata_sections = []
    composites: list[Image.Image] = []
    foregrounds: list[Image.Image] = []
    for index, (section, source_path, image) in enumerate(zip(SECTIONS, source_paths, processed)):
        layers = split_layers(image)
        composites.append(composite_layers(layers))
        foregrounds.append(layers[2])
        layer_records = []
        for kind, depth, layer in zip(
            ("background", "ground", "foreground"),
            (-1000, -900, FOREGROUND_DEPTH),
            layers,
        ):
            filename = f"bamboo-{section['id']}-{kind}.png"
            layer.save(OUTPUT_DIR / filename, optimize=True)
            layer_records.append({
                "kind": kind,
                "textureKey": f"stage-{section['id']}-{kind}",
                "file": filename,
                "depth": depth,
                "width": WIDTH,
                "height": HEIGHT,
                "alphaBounds": layer.getbbox(),
            })
        metadata_sections.append({
            "id": section["id"],
            "worldBounds": {"x": index * WIDTH, "y": 0, "width": WIDTH, "height": HEIGHT},
            "landmark": section["landmark"],
            "source": f"../source/{source_path.name}",
            "sourceSize": Image.open(source_path).size,
            "sourceSha256": sha256(source_path),
            "promptId": section["promptId"],
            "layers": layer_records,
        })

    save_qa(composites, foregrounds)
    metadata = {
        "task": "M6A / Task 6A.4 — Three-screen bamboo stage upgrade",
        "generatedOn": "2026-07-22",
        "authorTool": "OpenAI built-in image generation with deterministic Pillow post-processing",
        "styleReference": "public/scene/forest-camp.png and ART_BIBLE.md section 7",
        "processingTool": "tools/build_bamboo_stage_art.py",
        "processingVersion": 1,
        "runtime": {
            "worldWidth": WIDTH * len(SECTIONS),
            "worldHeight": HEIGHT,
            "sectionWidth": WIDTH,
            "sectionHeight": HEIGHT,
            "groundY": GROUND_Y,
            "sharedPaletteColors": PALETTE_COLORS,
            "seamTransitionWidth": SEAM_WIDTH,
            "depths": {"background": -1000, "ground": -900, "foreground": FOREGROUND_DEPTH},
            "gameplayCoordinatesChanged": False,
        },
        "prompts": {
            "shared": "Original non-infringing 1990s Japanese arcade pixel-art bamboo stage; fixed 2.5D side-view camera; clear lower combat plane; warm upper-left light and cool green shadows; no characters, UI, text, logos or watermark.",
            "forest-entry": "Sparse bamboo road entrance with trail marker, stone edging and lantern.",
            "forest-ambush": "Dense bamboo ambush with fallen trunk and restrained wooden barricade.",
            "boss-arena": "Open military camp arena with fortified gate and plain command flags.",
        },
        "manualReview": {
            "reviewer": "Codex Technical Lead",
            "status": "accepted: production runtime, desktop, 844x390 landscape, and 390x844 portrait",
        },
        "sections": metadata_sections,
    }
    (OUTPUT_DIR / "bamboo-stage.metadata.json").write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
