#!/usr/bin/env python3
"""
create_new_assets.py - Generate new pixel art characters and items for GameClient
by recoloring existing high-quality game assets.

Each new asset is created by taking an existing game asset as a template and
applying a hue-rotation color transformation to produce a visually distinct
variant in a different color theme. The shapes, proportions, and outlines are
preserved exactly — only the color theme changes.

Usage:
    python3 tools/create_new_assets.py [--count N] [--categories <list>] [--dry-run]

Examples:
    python3 tools/create_new_assets.py                          # Create 9 of each category
    python3 tools/create_new_assets.py --count 5               # Create 5 of each
    python3 tools/create_new_assets.py --categories armor weapon  # Only armor & weapons
    python3 tools/create_new_assets.py --dry-run               # Preview without saving
"""

import os
import sys
import json
import uuid
import math
import argparse
import colorsys
from pathlib import Path
from collections import Counter

try:
    from PIL import Image
except ImportError:
    print("ERROR: Pillow is required. Run: pip install Pillow")
    sys.exit(1)

# ---------------------------------------------------------------------------
# Asset root
# ---------------------------------------------------------------------------
REPO_ROOT = Path(__file__).parent.parent
ASSETS_ROOT = REPO_ROOT / "assets" / "resources"

# ---------------------------------------------------------------------------
# Color themes: each entry is (target_hue, sat_boost, name)
# target_hue  — 0.0-1.0 on the HSV color wheel
# sat_boost   — multiplier on saturation (>1 = more vivid, <1 = more muted)
# ---------------------------------------------------------------------------
THEMES = [
    ("fire",       0.02, 1.30),   # red-orange
    ("ice",        0.58, 1.15),   # cyan-blue
    ("nature",     0.33, 1.20),   # green
    ("shadow",     0.75, 1.10),   # purple
    ("lightning",  0.14, 1.25),   # yellow
    ("holy",       0.10, 1.05),   # gold
    ("poison",     0.28, 1.20),   # yellow-green
    ("desert",     0.07, 1.00),   # orange-brown
    ("ocean",      0.52, 1.15),   # teal
]


# ---------------------------------------------------------------------------
# Core recoloring
# ---------------------------------------------------------------------------

def recolor_sprite(img: Image.Image, target_hue: float, sat_boost: float = 1.2) -> Image.Image:
    """
    Recolor an RGBA sprite by rotating all colored pixels to *target_hue*.

    Rules:
      - Transparent pixels are kept transparent.
      - Very dark pixels (outlines, v < 0.12) are preserved as-is.
      - Very bright/neutral pixels (s < 0.06, v > 0.90) are preserved.
      - All other pixels have their hue replaced with target_hue while
        keeping saturation (×sat_boost) and value identical.
      - Near-neutral pixels (s < 0.15) receive a gentle tint toward target_hue.
    """
    if img.mode != "RGBA":
        img = img.convert("RGBA")

    # Use numpy for speed if available, otherwise fall back to pixel loop
    try:
        import numpy as np

        arr = np.array(img, dtype=np.float32) / 255.0
        r, g, b, a = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]

        # HSV channels (vectorized via colorsys-equivalent formulas)
        cmax = np.maximum(np.maximum(r, g), b)
        cmin = np.minimum(np.minimum(r, g), b)
        delta = cmax - cmin

        v = cmax
        safe_cmax = np.where(cmax > 1e-6, cmax, 1.0)  # avoid division by zero
        s = np.where(cmax > 1e-6, delta / safe_cmax, 0.0)

        # Hue calculation
        h = np.zeros_like(r)
        mask_r = (cmax == r) & (delta > 1e-6)
        mask_g = (cmax == g) & (delta > 1e-6)
        mask_b = (cmax == b) & (delta > 1e-6)
        h[mask_r] = ((g[mask_r] - b[mask_r]) / delta[mask_r]) % 6
        h[mask_g] = (b[mask_g] - r[mask_g]) / delta[mask_g] + 2
        h[mask_b] = (r[mask_b] - g[mask_b]) / delta[mask_b] + 4
        h = h / 6.0  # normalize to [0, 1]

        # Masks for preserving pixels
        transparent = a < 0.04
        dark_outline = (v < 0.12) & ~transparent
        bright_neutral = (v > 0.90) & (s < 0.06) & ~transparent
        near_neutral = (s < 0.15) & ~transparent & ~dark_outline & ~bright_neutral
        colored = ~transparent & ~dark_outline & ~bright_neutral

        # Build new hue array
        new_h = np.full_like(h, target_hue)
        new_h[dark_outline] = h[dark_outline]      # keep outline hue
        new_h[bright_neutral] = h[bright_neutral]  # keep highlight hue

        # Saturation: near-neutral gets gentle tint, colored gets full boost
        new_s = np.clip(s * sat_boost, 0.0, 1.0)
        new_s[near_neutral] = np.clip(s[near_neutral] + 0.08, 0.0, 0.60)
        new_s[dark_outline] = s[dark_outline]
        new_s[bright_neutral] = s[bright_neutral]

        # Convert HSV back to RGB
        h6 = new_h * 6.0
        hi = np.floor(h6).astype(int) % 6
        f = h6 - np.floor(h6)
        p = v * (1 - new_s)
        q = v * (1 - f * new_s)
        t = v * (1 - (1 - f) * new_s)

        new_r = np.select(
            [hi == 0, hi == 1, hi == 2, hi == 3, hi == 4, hi == 5],
            [v, q, p, p, t, v], default=v
        )
        new_g = np.select(
            [hi == 0, hi == 1, hi == 2, hi == 3, hi == 4, hi == 5],
            [t, v, v, q, p, p], default=v
        )
        new_b = np.select(
            [hi == 0, hi == 1, hi == 2, hi == 3, hi == 4, hi == 5],
            [p, p, t, v, v, q], default=v
        )

        # For preserved pixels, restore original RGB
        for chan, orig in [(new_r, r), (new_g, g), (new_b, b)]:
            chan[dark_outline] = orig[dark_outline]
            chan[bright_neutral] = orig[bright_neutral]
            chan[transparent] = 0.0

        out_arr = np.stack([new_r, new_g, new_b, a], axis=-1)
        out_arr = np.clip(out_arr * 255, 0, 255).astype(np.uint8)
        return Image.fromarray(out_arr, "RGBA")

    except ImportError:
        # Pure-Python fallback
        result = Image.new("RGBA", img.size, (0, 0, 0, 0))
        for x in range(img.width):
            for y in range(img.height):
                r_v, g_v, b_v, a_v = img.getpixel((x, y))
                if a_v < 10:
                    continue
                h, s, v = colorsys.rgb_to_hsv(r_v / 255, g_v / 255, b_v / 255)
                if v < 0.12 or (v > 0.90 and s < 0.06):
                    result.putpixel((x, y), (r_v, g_v, b_v, a_v))
                    continue
                new_h = target_hue
                if s < 0.15:
                    new_s = min(1.0, s + 0.08)
                else:
                    new_s = min(1.0, s * sat_boost)
                nr, ng, nb = colorsys.hsv_to_rgb(new_h, new_s, v)
                result.putpixel((x, y), (int(nr * 255), int(ng * 255), int(nb * 255), a_v))
        return result


# ---------------------------------------------------------------------------
# Meta file helper
# ---------------------------------------------------------------------------

def make_meta(file_uuid: str, display_name: str, width: int, height: int) -> dict:
    tex_uuid = f"{file_uuid}@6c48a"
    sf_uuid = f"{file_uuid}@f9941"
    return {
        "ver": "1.0.23",
        "importer": "image",
        "imported": True,
        "uuid": file_uuid,
        "files": [".png", ".json"],
        "subMetas": {
            "6c48a": {
                "importer": "texture",
                "uuid": tex_uuid,
                "displayName": display_name,
                "id": "6c48a",
                "name": "texture",
                "userData": {
                    "wrapModeS": "clamp-to-edge",
                    "wrapModeT": "clamp-to-edge",
                    "minfilter": "linear",
                    "magfilter": "linear",
                    "mipfilter": "none",
                    "anisotropy": 0,
                    "isUuid": True,
                    "imageUuidOrDatabaseUri": file_uuid,
                },
                "ver": "1.0.21",
                "imported": True,
                "files": [".json"],
                "subMetas": {},
            },
            "f9941": {
                "importer": "sprite-frame",
                "uuid": sf_uuid,
                "displayName": display_name,
                "id": "f9941",
                "name": "spriteFrame",
                "userData": {
                    "trimType": "none",
                    "trimThreshold": 1,
                    "rotated": False,
                    "offsetX": 0,
                    "offsetY": 0,
                    "trimX": 0,
                    "trimY": 0,
                    "width": width,
                    "height": height,
                    "rawWidth": width,
                    "rawHeight": height,
                    "borderTop": 0,
                    "borderBottom": 0,
                    "borderLeft": 0,
                    "borderRight": 0,
                    "packable": True,
                    "isUuid": True,
                    "imageUuidOrDatabaseUri": tex_uuid,
                    "atlasUuid": "",
                },
                "ver": "1.0.9",
                "imported": True,
                "files": [".json"],
                "subMetas": {},
            },
        },
        "userData": {
            "type": "sprite-frame",
            "fixAlphaTransparencyArtifacts": True,
            "hasAlpha": True,
            "redirect": sf_uuid,
            "compressSettings": {
                "useCompressTexture": True,
                "presetId": "e9m1+qxy5Es64FQz9zay7v",
            },
        },
    }


def save_meta(out_path: Path, display_name: str, width: int, height: int):
    meta = make_meta(str(uuid.uuid4()), display_name, width, height)
    meta_path = str(out_path) + ".meta"
    with open(meta_path, "w") as f:
        json.dump(meta, f, separators=(",", ":"))


def save_dir_meta(path: Path):
    if not path.exists():
        return
    meta_file = path.parent / (path.name + ".meta")
    if not meta_file.exists():
        with open(meta_file, "w") as f:
            json.dump(
                {"ver": "1.0.1", "importer": "directory", "imported": True,
                 "uuid": str(uuid.uuid4()), "files": [], "subMetas": {}, "userData": {}},
                f, separators=(",", ":"),
            )


# ---------------------------------------------------------------------------
# ID discovery helpers
# ---------------------------------------------------------------------------

def next_armor_id() -> int:
    armor_dir = ASSETS_ROOT / "actors" / "armor"
    ids = sorted(int(d.name) for d in armor_dir.iterdir() if d.is_dir() and d.name.isdigit())
    return max(ids) + 1 if ids else 2000


def next_weapon_id() -> int:
    weapon_dir = ASSETS_ROOT / "actors" / "weapon"
    ids = sorted(int(f.stem) for f in weapon_dir.glob("*.png") if f.stem.isdigit() and int(f.stem) < 4900)
    return max(ids) + 1 if ids else 4000


def next_helmet_id() -> int:
    helmet_dir = ASSETS_ROOT / "actors" / "helmet"
    ids = sorted(int(f.stem) for f in helmet_dir.glob("*.png") if f.stem.isdigit())
    return max(ids) + 1 if ids else 1000


def next_shield_id() -> int:
    shield_dir = ASSETS_ROOT / "actors" / "shiled"
    ids = sorted(int(f.stem) for f in shield_dir.glob("*.png") if f.stem.isdigit())
    return max(ids) + 1 if ids else 3000


def next_item_id() -> int:
    proc_dir = ASSETS_ROOT / "processed"
    ids = sorted(int(f.stem) for f in proc_dir.glob("*.png") if f.stem.isdigit())
    return max(ids) + 1 if ids else 500000


# ---------------------------------------------------------------------------
# Per-category generators
# ---------------------------------------------------------------------------

def generate_armors(count: int, dry_run: bool) -> list:
    """Generate *count* new armor sets by recoloring existing templates."""
    armor_dir = ASSETS_ROOT / "actors" / "armor"

    # Build list of existing template IDs (lowest-numbered first)
    template_ids = sorted(
        int(d.name) for d in armor_dir.iterdir() if d.is_dir() and d.name.isdigit()
    )
    if not template_ids:
        print("  WARNING: No existing armor templates found, skipping.")
        return []

    start_id = max(template_ids) + 1
    created = []

    for i in range(count):
        theme_name, target_hue, sat_boost = THEMES[i % len(THEMES)]
        template_id = template_ids[i % len(template_ids)]
        new_id = start_id + i

        template_dir = armor_dir / str(template_id)
        new_dir = armor_dir / str(new_id)

        if not dry_run:
            new_dir.mkdir(parents=True, exist_ok=True)

        # Find all pose PNGs in the template dir
        pose_files = sorted(f for f in template_dir.glob("*.png") if not f.name.endswith(".meta"))

        for pose_file in pose_files:
            # Derive new filename (replace template_id prefix with new_id)
            new_name = pose_file.name.replace(str(template_id), str(new_id), 1)
            out_path = new_dir / new_name

            if dry_run:
                print(f"  [DRY] {template_dir.name}/{pose_file.name}  →  {new_dir.name}/{new_name}  [{theme_name}]")
            else:
                src = Image.open(pose_file)
                result = recolor_sprite(src, target_hue, sat_boost)
                result.save(str(out_path))
                save_meta(out_path, new_name.replace(".png", ""), result.width, result.height)
                print(f"  {new_dir.name}/{new_name}  (theme: {theme_name}, template: {template_id})")

        if not dry_run:
            save_dir_meta(new_dir)

        created.append(new_id)

    return created


def generate_weapons(count: int, dry_run: bool) -> list:
    """Generate *count* new weapons by recoloring existing templates."""
    weapon_dir = ASSETS_ROOT / "actors" / "weapon"

    template_files = sorted(
        f for f in weapon_dir.glob("*.png")
        if f.stem.isdigit() and int(f.stem) < 4900 and not f.name.endswith(".meta")
    )
    if not template_files:
        print("  WARNING: No existing weapon templates found, skipping.")
        return []

    template_ids = [int(f.stem) for f in template_files]
    start_id = max(template_ids) + 1
    created = []

    for i in range(count):
        theme_name, target_hue, sat_boost = THEMES[i % len(THEMES)]
        template_file = template_files[i % len(template_files)]
        new_id = start_id + i
        out_path = weapon_dir / f"{new_id}.png"

        if dry_run:
            print(f"  [DRY] {template_file.name}  →  {out_path.name}  [{theme_name}]")
        else:
            src = Image.open(template_file)
            result = recolor_sprite(src, target_hue, sat_boost)
            result.save(str(out_path))
            save_meta(out_path, str(new_id), result.width, result.height)
            print(f"  {out_path.name}  (theme: {theme_name}, template: {template_file.stem})")

        created.append(new_id)

    return created


def generate_helmets(count: int, dry_run: bool) -> list:
    """Generate *count* new helmets (with -1 variant) by recoloring existing templates."""
    helmet_dir = ASSETS_ROOT / "actors" / "helmet"

    # Templates: base files only (no -1 suffix)
    template_files = sorted(
        f for f in helmet_dir.glob("*.png")
        if f.stem.isdigit() and not f.name.endswith(".meta")
    )
    if not template_files:
        print("  WARNING: No existing helmet templates found, skipping.")
        return []

    template_ids = [int(f.stem) for f in template_files]
    start_id = max(template_ids) + 1
    created = []

    for i in range(count):
        theme_name, target_hue, sat_boost = THEMES[i % len(THEMES)]
        template_base = template_files[i % len(template_files)]
        new_id = start_id + i

        # Process base and -1 variant
        for suffix in ("", "-1"):
            template_path = helmet_dir / (template_base.stem + suffix + ".png")
            if not template_path.exists():
                template_path = template_base  # fallback to base
            out_path = helmet_dir / f"{new_id}{suffix}.png"

            if dry_run:
                print(f"  [DRY] {template_path.name}  →  {out_path.name}  [{theme_name}]")
            else:
                src = Image.open(template_path)
                result = recolor_sprite(src, target_hue, sat_boost)
                result.save(str(out_path))
                save_meta(out_path, out_path.stem, result.width, result.height)
                print(f"  {out_path.name}  (theme: {theme_name}, template: {template_path.stem})")

        created.append(new_id)

    return created


def generate_shields(count: int, dry_run: bool) -> list:
    """Generate *count* new shields by recoloring existing templates."""
    shield_dir = ASSETS_ROOT / "actors" / "shiled"

    template_files = sorted(
        f for f in shield_dir.glob("*.png")
        if f.stem.isdigit() and not f.name.endswith(".meta")
    )
    if not template_files:
        print("  WARNING: No existing shield templates found, skipping.")
        return []

    template_ids = [int(f.stem) for f in template_files]
    start_id = max(template_ids) + 1
    created = []

    for i in range(count):
        theme_name, target_hue, sat_boost = THEMES[i % len(THEMES)]
        template_file = template_files[i % len(template_files)]
        new_id = start_id + i
        out_path = shield_dir / f"{new_id}.png"

        if dry_run:
            print(f"  [DRY] {template_file.name}  →  {out_path.name}  [{theme_name}]")
        else:
            src = Image.open(template_file)
            result = recolor_sprite(src, target_hue, sat_boost)
            result.save(str(out_path))
            save_meta(out_path, str(new_id), result.width, result.height)
            print(f"  {out_path.name}  (theme: {theme_name}, template: {template_file.stem})")

        created.append(new_id)

    return created


def generate_items(count: int, dry_run: bool) -> list:
    """Generate *count* new item icons by recoloring existing templates."""
    proc_dir = ASSETS_ROOT / "processed"

    # Pick diverse templates: prefer 96x96 or 48x48 items with good pixel density
    candidates = []
    for f in sorted(proc_dir.glob("*.png"), key=lambda p: int(p.stem) if p.stem.isdigit() else 999999):
        if not f.stem.isdigit():
            continue
        iid = int(f.stem)
        if iid >= 510000:
            continue
        try:
            img = Image.open(f)
            if img.size not in [(96, 96), (48, 48), (64, 64)]:
                continue
            total = img.width * img.height
            visible = sum(1 for x in range(img.width) for y in range(img.height) if img.getpixel((x, y))[3] > 10)
            if visible / total < 0.35:
                continue
            candidates.append((iid, f))
        except Exception:
            continue

    if not candidates:
        print("  WARNING: No existing item templates found, skipping.")
        return []

    # Select a spread of templates with diverse IDs
    step = max(1, len(candidates) // max(count * 2, 20))
    templates = [candidates[i * step % len(candidates)] for i in range(count)]

    # Start new IDs after current max
    all_ids = sorted(int(f.stem) for f in proc_dir.glob("*.png") if f.stem.isdigit())
    start_id = max(all_ids) + 1 if all_ids else 510000
    created = []

    for i in range(count):
        theme_name, target_hue, sat_boost = THEMES[i % len(THEMES)]
        template_iid, template_file = templates[i]
        new_id = start_id + i
        out_path = proc_dir / f"{new_id}.png"

        if dry_run:
            print(f"  [DRY] {template_file.name}  →  {out_path.name}  [{theme_name}]")
        else:
            src = Image.open(template_file)
            result = recolor_sprite(src, target_hue, sat_boost)
            result.save(str(out_path))
            save_meta(out_path, str(new_id), result.width, result.height)
            print(f"  {out_path.name}  (theme: {theme_name}, template: {template_file.stem})")

        created.append(new_id)

    return created


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args():
    p = argparse.ArgumentParser(
        description="Generate new pixel art game assets by recoloring existing ones",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Color themes applied in order:
  1. fire (red-orange)    2. ice (cyan-blue)   3. nature (green)
  4. shadow (purple)      5. lightning (yellow) 6. holy (gold)
  7. poison (yellow-green) 8. desert (orange)  9. ocean (teal)

Templates used: existing assets are referenced as source shapes.
The script auto-detects the next available ID for each category.
""",
    )
    p.add_argument(
        "--categories",
        nargs="+",
        choices=["armor", "weapon", "helmet", "shield", "item"],
        default=["armor", "weapon", "helmet", "shield", "item"],
        help="Asset categories to generate (default: all)",
    )
    p.add_argument(
        "--count",
        type=int,
        default=9,
        help="Number of new assets per category (default: 9, max themes: 9)",
    )
    p.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be created without writing any files",
    )
    return p.parse_args()


def main():
    args = parse_args()
    dry = args.dry_run

    print("=" * 64)
    print("GameClient — New Pixel Art Asset Generator (recolor mode)")
    print("=" * 64)
    if dry:
        print("DRY RUN — no files will be written\n")
    else:
        print()

    summary = {}

    if "armor" in args.categories:
        print(f"[ARMOR] Generating {args.count} new armor sets …")
        created = generate_armors(args.count, dry)
        summary["armor"] = created
        print()

    if "weapon" in args.categories:
        print(f"[WEAPON] Generating {args.count} new weapons …")
        created = generate_weapons(args.count, dry)
        summary["weapon"] = created
        print()

    if "helmet" in args.categories:
        print(f"[HELMET] Generating {args.count} new helmets …")
        created = generate_helmets(args.count, dry)
        summary["helmet"] = created
        print()

    if "shield" in args.categories:
        print(f"[SHIELD] Generating {args.count} new shields …")
        created = generate_shields(args.count, dry)
        summary["shield"] = created
        print()

    if "item" in args.categories:
        print(f"[ITEM] Generating {args.count} new item icons …")
        created = generate_items(args.count, dry)
        summary["item"] = created
        print()

    print("=" * 64)
    print("SUMMARY")
    print("=" * 64)
    total = 0
    for cat, ids_list in summary.items():
        if ids_list:
            file_count = len(ids_list) * 5 if cat == "armor" else (len(ids_list) * 2 if cat == "helmet" else len(ids_list))
            total += file_count
            id_range = f"{ids_list[0]}–{ids_list[-1]}" if len(ids_list) > 1 else str(ids_list[0])
            print(f"  {cat:8s}: {len(ids_list)} new  (IDs {id_range})")
        else:
            print(f"  {cat:8s}: 0 (no templates found or skipped)")
    print(f"\n  Total asset files: {total}")
    if not dry:
        print("\nAll new assets created successfully using existing sprites as templates.")
        print("Note: Cocos .meta files are included. Re-import in the editor for full integration.")
    else:
        print("\nDRY RUN complete — re-run without --dry-run to create files.")


if __name__ == "__main__":
    main()
