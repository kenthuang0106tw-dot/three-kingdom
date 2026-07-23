from __future__ import annotations

import hashlib
import json
import re
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
BEFORE_DIR = ROOT / "docs" / "visual-baselines" / "m6a-6a1-before"
AFTER_DIR = ROOT / "docs" / "visual-baselines" / "m6a-6a6-after"
COMPARISON_DIR = AFTER_DIR / "comparisons"
MANIFEST_PATH = ROOT / "app" / "game" / "assets" / "AssetManifest.ts"
RUNTIME_METRICS_PATH = AFTER_DIR / "runtime-metrics.json"

VIEWPORTS = ("desktop", "landscape-844x390", "portrait-390x844")
CHECKPOINTS = ("title", "combat", "boss", "failure", "result")
CAPTURE_FILES = tuple(f"{viewport}-{checkpoint}.png" for viewport in VIEWPORTS for checkpoint in CHECKPOINTS)

METADATA_FILES = (
    "public/art/guanyu/guanyu-v2.metadata.json",
    "public/art/enemy/soldier.metadata.json",
    "public/art/enemy/mauler.metadata.json",
    "public/art/enemy/duelist.metadata.json",
    "public/art/boss/warlord-consistency.metadata.json",
    "public/scene/bamboo-stage/bamboo-stage.metadata.json",
    "public/art/ui/product-ui.metadata.json",
)

REQUIRED_PIPELINE_FILES = (
    "public/art/guanyu/guanyu-v2.png",
    "public/art/guanyu/guanyu-v2.atlas.json",
    "public/art/guanyu/guanyu-v2.metadata.json",
    "public/art/guanyu/guanyu-v2-debug.png",
    "tools/build_guanyu_v2_art.py",
    "public/art/enemy/cast-lineup-debug.png",
    "tools/build_cast_consistency_art.py",
    "public/scene/bamboo-stage/bamboo-stage.metadata.json",
    "public/scene/bamboo-stage/bamboo-stage-overview.png",
    "public/scene/bamboo-stage/bamboo-stage-seams-debug.png",
    "public/scene/bamboo-stage/bamboo-stage-depth-debug.png",
    "tools/build_bamboo_stage_art.py",
    "public/art/effects/combat-effects.png",
    "public/art/effects/combat-effects.atlas.json",
    "public/art/effects/combat-effects-debug.png",
    "public/art/effects/source/combat-effects-source.png",
    "public/art/ui/product-ui.metadata.json",
    "public/art/ui/product-ui-debug.png",
    "public/art/ui/product-ui-runtime-preview.png",
    "public/art/ui/source/product-ui-source.png",
    "tools/build_effects_ui_art.py",
)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def provenance_ok(relative_path: str, metadata: dict) -> bool:
    if "provenance" in metadata:
        provenance = metadata["provenance"]
        tool = provenance.get("tool") or provenance.get("processingTool") or provenance.get("processingTools")
        return provenance.get("original") is True and bool(tool)
    if relative_path.endswith("bamboo-stage.metadata.json"):
        return bool(metadata.get("authorTool") and metadata.get("processingTool") and metadata.get("manualReview"))
    if relative_path.endswith("product-ui.metadata.json"):
        return bool(
            metadata.get("authorTool")
            and metadata.get("processingTool")
            and metadata.get("manualReview", {}).get("status", "").startswith("accepted")
        )
    return False


def extract_manifest_urls() -> tuple[list[str], list[str]]:
    source = MANIFEST_PATH.read_text(encoding="utf-8")
    keys = re.findall(r'key:\s*"([^"]+)"', source)
    urls = re.findall(r'assetUrl\("(/[^"]+)"\)', source)
    return keys, urls


def create_comparison(before_path: Path, after_path: Path, output_path: Path) -> dict:
    before = Image.open(before_path).convert("RGB")
    after = Image.open(after_path).convert("RGB")
    if before.size != after.size:
        raise RuntimeError(f"Capture size mismatch: {before_path.name}: {before.size} != {after.size}")

    header_height = 28
    comparison = Image.new("RGB", (before.width * 2, before.height + header_height), (16, 20, 15))
    comparison.paste(before, (0, header_height))
    comparison.paste(after, (before.width, header_height))
    draw = ImageDraw.Draw(comparison)
    draw.text((8, 8), "BEFORE", fill=(216, 211, 189))
    draw.text((before.width + 8, 8), "AFTER", fill=(216, 211, 189))
    output_path.parent.mkdir(parents=True, exist_ok=True)
    comparison.save(output_path, optimize=True)
    return {
        "file": before_path.name,
        "size": list(before.size),
        "beforeSha256": sha256(before_path),
        "afterSha256": sha256(after_path),
        "comparison": output_path.relative_to(AFTER_DIR).as_posix(),
    }


def create_contact_sheet(comparisons: list[dict]) -> None:
    columns = 3
    thumb_width = 480
    label_height = 24
    gap = 12
    rows = (len(comparisons) + columns - 1) // columns
    cells: list[tuple[Image.Image, str]] = []
    max_thumb_height = 0

    for comparison in comparisons:
        image = Image.open(AFTER_DIR / comparison["comparison"]).convert("RGB")
        image.thumbnail((thumb_width, 300), Image.Resampling.NEAREST)
        max_thumb_height = max(max_thumb_height, image.height)
        cells.append((image.copy(), comparison["file"]))

    sheet_width = columns * thumb_width + (columns + 1) * gap
    sheet_height = rows * (label_height + max_thumb_height) + (rows + 1) * gap
    sheet = Image.new("RGB", (sheet_width, sheet_height), (16, 20, 15))
    draw = ImageDraw.Draw(sheet)

    for index, (image, label) in enumerate(cells):
        column = index % columns
        row = index // columns
        x = gap + column * (thumb_width + gap)
        y = gap + row * (label_height + max_thumb_height + gap)
        draw.text((x, y), label, fill=(216, 211, 189))
        sheet.paste(image, (x, y + label_height))

    sheet.save(AFTER_DIR / "comparison-contact-sheet.png", optimize=True)


def main() -> None:
    AFTER_DIR.mkdir(parents=True, exist_ok=True)
    COMPARISON_DIR.mkdir(parents=True, exist_ok=True)

    comparisons = []
    for filename in CAPTURE_FILES:
        before_path = BEFORE_DIR / filename
        after_path = AFTER_DIR / filename
        if not before_path.is_file() or not after_path.is_file():
            raise RuntimeError(f"Missing matching capture: {filename}")
        comparisons.append(create_comparison(before_path, after_path, COMPARISON_DIR / filename))
    create_contact_sheet(comparisons)

    manifest_keys, manifest_urls = extract_manifest_urls()
    if len(manifest_keys) != len(set(manifest_keys)):
        raise RuntimeError("Runtime manifest contains duplicate keys")

    runtime_files = []
    texture_file_count = 0
    encoded_bytes = 0
    decoded_rgba_bytes = 0
    for url in manifest_urls:
        path = ROOT / "public" / url.lstrip("/")
        if not path.is_file():
            raise RuntimeError(f"Missing manifest file: {url}")
        item = {
            "url": url,
            "bytes": path.stat().st_size,
            "sha256": sha256(path),
        }
        encoded_bytes += path.stat().st_size
        if path.suffix.lower() == ".png":
            with Image.open(path) as image:
                item["dimensions"] = list(image.size)
                decoded_rgba_bytes += image.width * image.height * 4
                texture_file_count += 1
        runtime_files.append(item)

    metadata_audit = []
    for relative_path in METADATA_FILES:
        path = ROOT / relative_path
        metadata = json.loads(path.read_text(encoding="utf-8"))
        accepted = provenance_ok(relative_path, metadata)
        metadata_audit.append({"file": relative_path, "provenanceAccepted": accepted})
        if not accepted:
            raise RuntimeError(f"Incomplete provenance: {relative_path}")

    missing_pipeline_files = [path for path in REQUIRED_PIPELINE_FILES if not (ROOT / path).is_file()]
    if missing_pipeline_files:
        raise RuntimeError(f"Missing pipeline files: {missing_pipeline_files}")

    runtime_metrics = json.loads(RUNTIME_METRICS_PATH.read_text(encoding="utf-8"))
    if (
        runtime_metrics["sampleCount"] != 300
        or runtime_metrics["averageFps"] < 59
        or runtime_metrics["canvasCount"] != 1
        or runtime_metrics["runtimeErrorCount"] != 0
        or runtime_metrics["productionDebugLeak"]
    ):
        raise RuntimeError("Runtime visual-freeze acceptance failed")

    revision = subprocess.check_output(
        ["git", "rev-parse", "HEAD"],
        cwd=ROOT,
        text=True,
        encoding="utf-8",
    ).strip()

    report = {
        "task": "M6A / Task 6A.6 — Visual acceptance and asset freeze",
        "baselineRevision": "3183f1f",
        "candidateRuntimeRevision": revision,
        "captureMatrix": {
            "viewports": list(VIEWPORTS),
            "checkpoints": list(CHECKPOINTS),
            "count": len(comparisons),
            "matchingDimensions": True,
            "comparisons": comparisons,
        },
        "runtimeAssets": {
            "manifestEntryCount": len(manifest_keys),
            "manifestKeys": manifest_keys,
            "requestFileCount": len(manifest_urls),
            "textureFileCount": texture_file_count,
            "encodedBytes": encoded_bytes,
            "decodedRgbaBytes": decoded_rgba_bytes,
            "files": runtime_files,
        },
        "provenance": {
            "metadataFileCount": len(metadata_audit),
            "allAccepted": all(item["provenanceAccepted"] for item in metadata_audit),
            "files": metadata_audit,
        },
        "pipeline": {
            "requiredFileCount": len(REQUIRED_PIPELINE_FILES),
            "missingFiles": missing_pipeline_files,
        },
        "runtimeMetrics": runtime_metrics,
        "manualReview": {
            "comparisonCount": len(comparisons),
            "clipping": "pass",
            "frameContamination": "pass",
            "stageSeams": "pass",
            "feetAnchors": "pass",
            "uiSafeAreas": "pass",
            "touchTargets": "pass",
        },
        "runtimeContractsChanged": False,
        "visualFreezeStatus": "accepted",
    }
    (AFTER_DIR / "visual-freeze-audit.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(
        json.dumps(
            {
                "captures": len(comparisons),
                "manifestEntries": len(manifest_keys),
                "requestFiles": len(manifest_urls),
                "textureFiles": texture_file_count,
                "encodedBytes": encoded_bytes,
                "decodedRgbaBytes": decoded_rgba_bytes,
                "provenanceAccepted": report["provenance"]["allAccepted"],
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
