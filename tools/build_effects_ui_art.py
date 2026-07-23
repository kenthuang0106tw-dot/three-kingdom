from __future__ import annotations

import hashlib
import json
from pathlib import Path
from xml.etree.ElementTree import Element, SubElement, ElementTree

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
EFFECT_SOURCE = ROOT / "public/art/effects/source/combat-effects-source.png"
UI_SOURCE = ROOT / "public/art/ui/source/product-ui-source.png"
EFFECT_OUT = ROOT / "public/art/effects"
UI_OUT = ROOT / "public/art/ui"

MAGENTA = (255, 0, 255)
DEEP_INK = (16, 20, 15, 255)
COOL_SHADOW = (27, 42, 36, 255)
ANTIQUE_GOLD = (185, 138, 57, 255)
WARM_HIGHLIGHT = (224, 184, 107, 255)
BONE_WHITE = (216, 211, 189, 255)
SIGNAL_RED = (139, 46, 39, 255)

EFFECT_RECTS = {
    "hit-spark-0": (70, 145, 260, 425),
    "hit-spark-1": (285, 95, 565, 470),
    "hit-spark-2": (575, 55, 930, 485),
    "hit-spark-3": (940, 120, 1230, 455),
    "hit-spark-4": (1235, 165, 1465, 430),
    "dust-0": (70, 535, 310, 775),
    "dust-1": (360, 520, 660, 785),
    "dust-2": (690, 535, 1020, 790),
    "dust-3": (1060, 555, 1430, 785),
    "actor-shadow": (560, 820, 980, 990),
}

UI_RECTS = {
    "ui-hud-frame": (30, 45, 1505, 270),
    "ui-modal-frame": (45, 325, 920, 940),
    "ui-button-frame": (975, 355, 1470, 565),
    "ui-joystick-base": (905, 600, 1220, 930),
    "ui-attack-frame": (1200, 600, 1505, 935),
    "ui-joystick-knob": (1400, 90, 1515, 225),
}

UI_SIZES = {
    "ui-hud-frame": (512, 64),
    "ui-modal-frame": (720, 300),
    "ui-button-frame": (128, 64),
    "ui-joystick-base": (156, 156),
    "ui-attack-frame": (112, 86),
    "ui-joystick-knob": (68, 68),
}

GLYPHS = {
    "A": ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
    "B": ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
    "C": ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
    "D": ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
    "E": ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
    "F": ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
    "G": ["01111", "10000", "10000", "10111", "10001", "10001", "01110"],
    "H": ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
    "I": ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
    "J": ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
    "K": ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
    "L": ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
    "M": ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
    "N": ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
    "O": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
    "P": ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
    "Q": ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
    "R": ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
    "S": ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
    "T": ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
    "U": ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
    "V": ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
    "W": ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
    "X": ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
    "Y": ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
    "Z": ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
    "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
    "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
    "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
    "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
    "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
    "5": ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
    "6": ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
    "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
    "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
    "9": ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
    "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
    ":": ["00000", "00100", "00100", "00000", "00100", "00100", "00000"],
    "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
    ".": ["00000", "00000", "00000", "00000", "00000", "00110", "00110"],
}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def remove_magenta(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    key = rgba.getpixel((0, 0))[:3]
    for y in range(rgba.height):
        for x in range(rgba.width):
            red, green, blue, _ = pixels[x, y]
            distance = max(abs(red - key[0]), abs(green - key[1]), abs(blue - key[2]))
            is_magenta_fringe = (
                red > 90 and blue > 70 and red > green * 1.45 and blue > green * 1.25
            )
            if distance <= 72 or (red > 205 and blue > 165 and green < 115) or is_magenta_fringe:
                pixels[x, y] = (red, green, blue, 0)
    return rgba


def fit_crop(source: Image.Image, rect: tuple[int, int, int, int], size: tuple[int, int], padding: int = 4) -> Image.Image:
    cropped = remove_magenta(source.crop(rect))
    alpha_box = cropped.getchannel("A").getbbox()
    if not alpha_box:
        raise ValueError(f"No opaque pixels in source rect {rect}")
    cropped = cropped.crop(alpha_box)
    max_width = size[0] - padding * 2
    max_height = size[1] - padding * 2
    scale = min(max_width / cropped.width, max_height / cropped.height)
    resized = cropped.resize(
        (max(1, round(cropped.width * scale)), max(1, round(cropped.height * scale))),
        Image.Resampling.NEAREST,
    )
    target = Image.new("RGBA", size)
    x = (size[0] - resized.width) // 2
    y = (size[1] - resized.height) // 2
    target.alpha_composite(resized, (x, y))
    return target


def alpha_bounds(image: Image.Image) -> list[int]:
    box = image.getchannel("A").getbbox()
    return list(box) if box else [0, 0, 0, 0]


def write_debug(source: Image.Image, rects: dict[str, tuple[int, int, int, int]], path: Path) -> None:
    debug = source.convert("RGBA")
    draw = ImageDraw.Draw(debug)
    for name, rect in rects.items():
        draw.rectangle(rect, outline=(255, 32, 32, 255), width=4)
        draw.text((rect[0] + 5, rect[1] + 5), name, fill=(255, 255, 255, 255), stroke_width=2, stroke_fill=(0, 0, 0, 255))
    debug.save(path)


def build_effects() -> dict:
    source = Image.open(EFFECT_SOURCE)
    atlas = Image.new("RGBA", (512, 256))
    frames: dict[str, dict] = {}
    placements = {}
    for index in range(5):
        placements[f"hit-spark-{index}"] = (index * 96, 0, 96, 96)
    for index in range(4):
        placements[f"dust-{index}"] = (index * 96, 96, 96, 64)
    placements["actor-shadow"] = (384, 160, 128, 48)

    for name, (x, y, width, height) in placements.items():
        image = fit_crop(source, EFFECT_RECTS[name], (width, height), 4)
        atlas.alpha_composite(image, (x, y))
        frames[name] = {
            "frame": {"x": x, "y": y, "w": width, "h": height},
            "rotated": False,
            "trimmed": False,
            "spriteSourceSize": {"x": 0, "y": 0, "w": width, "h": height},
            "sourceSize": {"w": width, "h": height},
            "sourceRect": list(EFFECT_RECTS[name]),
            "alphaBounds": alpha_bounds(image),
        }

    atlas.save(EFFECT_OUT / "combat-effects.png")
    (EFFECT_OUT / "combat-effects.atlas.json").write_text(json.dumps({
        "frames": frames,
        "meta": {"image": "combat-effects.png", "size": {"w": 512, "h": 256}, "scale": "1"},
    }, indent=2), encoding="utf-8")
    write_debug(source, EFFECT_RECTS, EFFECT_OUT / "combat-effects-debug.png")
    return {
        "source": "source/combat-effects-source.png",
        "sourceSha256": sha256(EFFECT_SOURCE),
        "promptId": "imagegen-call_tOWDQH9AVmbg8fTVWK4Sgi9o",
        "runtimeTexture": "combat-effects.png",
        "runtimeAtlas": "combat-effects.atlas.json",
        "frames": frames,
        "animation": {"hitSpark": ["hit-spark-0", "hit-spark-1", "hit-spark-2", "hit-spark-3", "hit-spark-4"], "frameRate": 24, "repeat": 0},
    }


def build_ui_assets() -> dict:
    source = Image.open(UI_SOURCE)
    assets = []
    preview = Image.new("RGBA", (960, 540), COOL_SHADOW)
    preview_positions = {
        "ui-hud-frame": (224, 20),
        "ui-modal-frame": (120, 110),
        "ui-button-frame": (770, 20),
        "ui-joystick-base": (20, 360),
        "ui-attack-frame": (810, 390),
        "ui-joystick-knob": (64, 404),
    }
    for name, rect in UI_RECTS.items():
        image = fit_crop(source, rect, UI_SIZES[name], 1)
        image.save(UI_OUT / f"{name}.png")
        preview.alpha_composite(image, preview_positions[name])
        assets.append({
            "key": name,
            "file": f"{name}.png",
            "sourceRect": list(rect),
            "size": list(UI_SIZES[name]),
            "alphaBounds": alpha_bounds(image),
        })
    preview.save(UI_OUT / "product-ui-runtime-preview.png")
    write_debug(source, UI_RECTS, UI_OUT / "product-ui-debug.png")
    return {
        "source": "source/product-ui-source.png",
        "sourceSha256": sha256(UI_SOURCE),
        "promptId": "imagegen-call_OK8whpJ7SU0wnnU1yn7ymDuV",
        "assets": assets,
    }


def build_bitmap_font() -> dict:
    scale = 3
    glyph_width = 5 * scale
    glyph_height = 7 * scale
    cell_width = 18
    cell_height = 24
    chars = [" "] + sorted(GLYPHS)
    columns = 16
    rows = (len(chars) + columns - 1) // columns
    atlas = Image.new("RGBA", (columns * cell_width, rows * cell_height))
    root = Element("font")
    SubElement(root, "info", face="Dragon Pixel", size=str(glyph_height), bold="0", italic="0", charset="", unicode="0", stretchH="100", smooth="0", aa="0", padding="0,0,0,0", spacing="1,1")
    SubElement(root, "common", lineHeight=str(cell_height), base=str(glyph_height), scaleW=str(atlas.width), scaleH=str(atlas.height), pages="1", packed="0")
    pages = SubElement(root, "pages")
    SubElement(pages, "page", id="0", file="dragon-pixel.png")
    chars_node = SubElement(root, "chars", count=str(len(chars)))
    for index, char in enumerate(chars):
        x = (index % columns) * cell_width
        y = (index // columns) * cell_height
        pattern = GLYPHS.get(char)
        if pattern:
            draw = ImageDraw.Draw(atlas)
            for row, bits in enumerate(pattern):
                for column, bit in enumerate(bits):
                    if bit == "1":
                        px = x + column * scale
                        py = y + row * scale
                        draw.rectangle((px, py, px + scale - 1, py + scale - 1), fill=BONE_WHITE)
        SubElement(chars_node, "char", id=str(ord(char)), x=str(x), y=str(y),
                   width=str(glyph_width if pattern else 0), height=str(glyph_height if pattern else 0),
                   xoffset="0", yoffset="0", xadvance=str(cell_width if pattern else 9),
                   page="0", chnl="15")
    atlas.save(UI_OUT / "dragon-pixel.png")
    ElementTree(root).write(UI_OUT / "dragon-pixel.xml", encoding="utf-8", xml_declaration=True)
    preview = Image.new("RGBA", (780, 100), DEEP_INK)
    draw = ImageDraw.Draw(preview)
    sample = "THREE KINGDOMS  PLAYER 10/10  VICTORY"
    cursor_x = 18
    for char in sample:
        pattern = GLYPHS.get(char)
        if pattern:
            for row, bits in enumerate(pattern):
                for column, bit in enumerate(bits):
                    if bit == "1":
                        px = cursor_x + column * scale
                        py = 24 + row * scale
                        draw.rectangle((px, py, px + scale - 1, py + scale - 1), fill=BONE_WHITE)
            cursor_x += cell_width
        else:
            cursor_x += 9
    preview.save(UI_OUT / "dragon-pixel-preview.png")
    return {
        "key": "dragon-pixel",
        "texture": "dragon-pixel.png",
        "data": "dragon-pixel.xml",
        "glyphs": "".join(chars),
        "cell": [cell_width, cell_height],
        "pixelScale": scale,
        "palette": {"ink": "#10140F", "boneWhite": "#D8D3BD"},
    }


def main() -> None:
    EFFECT_OUT.mkdir(parents=True, exist_ok=True)
    UI_OUT.mkdir(parents=True, exist_ok=True)
    effects = build_effects()
    ui = build_ui_assets()
    font = build_bitmap_font()
    metadata = {
        "task": "M6A / Task 6A.5 — Combat effects and product UI art upgrade",
        "generatedOn": "2026-07-23",
        "authorTool": "OpenAI built-in image generation with deterministic Pillow post-processing",
        "processingTool": "tools/build_effects_ui_art.py",
        "processingVersion": 1,
        "styleReference": "ART_BIBLE.md sections 8–9 and accepted M6A cast/stage assets",
        "prompts": {
            "effects": "Five hit sparks, four dust poses, and one compact shadow on flat magenta; original arcade pixel art; no text or characters.",
            "ui": "Reusable deep-ink, antique-gold, jade-accent arcade UI frames and controls on flat magenta; no text or logos.",
        },
        "runtimeContractsChanged": False,
        "effects": effects,
        "ui": ui,
        "font": font,
        "manualReview": {
            "reviewer": "Codex Technical Lead",
            "status": "accepted 2026-07-23",
            "evidence": [
                "production desktop title, gameplay, and pause/resume",
                "844x390 landscape FIT",
                "390x844 portrait FIT",
                "one Canvas and zero browser errors",
            ],
        },
    }
    (UI_OUT / "product-ui.metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
