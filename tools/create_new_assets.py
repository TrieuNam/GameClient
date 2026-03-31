#!/usr/bin/env python3
"""
create_new_assets.py - Generate new pixel art characters and items for GameClient

This tool creates new pixel art assets (armor, weapons, helmets, shields, items)
in the same style as the existing game assets. Each asset is generated with a
distinct color theme and design.

Usage:
    python3 tools/create_new_assets.py [--output-dir <dir>] [--categories <list>] [--dry-run]

Examples:
    python3 tools/create_new_assets.py                          # Create all new assets
    python3 tools/create_new_assets.py --categories armor weapon  # Only armor & weapons
    python3 tools/create_new_assets.py --dry-run               # Preview without saving
"""

import os
import sys
import json
import uuid
import argparse
import math
from pathlib import Path

try:
    from PIL import Image, ImageDraw
except ImportError:
    print("ERROR: Pillow is required. Run: pip install Pillow")
    sys.exit(1)

# ---------------------------------------------------------------------------
# Asset root
# ---------------------------------------------------------------------------
ASSETS_ROOT = Path(__file__).parent.parent / "assets" / "resources"

# ---------------------------------------------------------------------------
# Color themes for new equipment sets
# ---------------------------------------------------------------------------
THEMES = {
    "fire":      {"primary": (220, 50, 30),  "secondary": (255, 140, 0),  "accent": (255, 220, 60),  "dark": (100, 20, 10),  "shine": (255, 200, 150)},
    "ice":       {"primary": (80, 180, 240),  "secondary": (150, 220, 255), "accent": (220, 245, 255), "dark": (30, 80, 130),  "shine": (240, 250, 255)},
    "nature":    {"primary": (40, 140, 40),   "secondary": (90, 180, 60),  "accent": (160, 220, 80),  "dark": (20, 60, 20),   "shine": (200, 240, 130)},
    "shadow":    {"primary": (60, 20, 80),    "secondary": (100, 40, 130), "accent": (170, 90, 200),  "dark": (20, 5, 30),    "shine": (220, 160, 240)},
    "lightning": {"primary": (200, 180, 0),   "secondary": (240, 220, 30), "accent": (255, 255, 120), "dark": (80, 70, 0),    "shine": (255, 255, 200)},
    "holy":      {"primary": (220, 200, 100), "secondary": (240, 230, 150),"accent": (255, 250, 220), "dark": (140, 120, 40),  "shine": (255, 255, 240)},
    "poison":    {"primary": (100, 180, 20),  "secondary": (140, 210, 40), "accent": (180, 240, 80),  "dark": (40, 70, 10),   "shine": (200, 250, 120)},
    "desert":    {"primary": (200, 150, 60),  "secondary": (230, 190, 100),"accent": (255, 230, 150), "dark": (100, 70, 20),  "shine": (255, 245, 200)},
    "ocean":     {"primary": (20, 100, 160),  "secondary": (40, 150, 200), "accent": (80, 200, 230),  "dark": (10, 50, 90),   "shine": (160, 230, 250)},
}

THEME_NAMES = list(THEMES.keys())

# ---------------------------------------------------------------------------
# Meta file generation
# ---------------------------------------------------------------------------

def make_meta(file_uuid: str, display_name: str, width: int, height: int) -> dict:
    """Create a Cocos meta file dictionary for a PNG asset."""
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


def save_meta(meta: dict, path: Path):
    with open(str(path) + ".meta", "w") as f:
        json.dump(meta, f, separators=(",", ":"))


# ---------------------------------------------------------------------------
# Pixel drawing helpers
# ---------------------------------------------------------------------------

def draw_rect(draw, x, y, w, h, color):
    draw.rectangle([x, y, x + w - 1, y + h - 1], fill=color)


def draw_outline(draw, x, y, w, h, color, thickness=1):
    for t in range(thickness):
        draw.rectangle([x + t, y + t, x + w - 1 - t, y + h - 1 - t], outline=color)


def blend(c1, c2, t):
    """Linearly blend two RGB(A) colors."""
    if len(c1) == 4:
        return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(4))
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def put_pixel(img, x, y, color):
    if 0 <= x < img.width and 0 <= y < img.height:
        img.putpixel((x, y), color)


def fill_circle(draw, cx, cy, r, color):
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color)


# ---------------------------------------------------------------------------
# Armor sprite (64×64, 5 pose variants)
# ---------------------------------------------------------------------------

def draw_armor_sprite(theme: dict, pose: int) -> Image.Image:
    """Draw a 64×64 armored character figure for the given pose (1-5)."""
    img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    BLACK = (0, 0, 0, 255)
    p = theme["primary"] + (255,)
    s = theme["secondary"] + (255,)
    a = theme["accent"] + (255,)
    dk = theme["dark"] + (255,)
    sh = theme["shine"] + (255,)

    # Pose adjustments (arm/leg offsets)
    pose_offsets = {
        1: {"arm_l": (0, 0), "arm_r": (0, 0), "leg_l": (0, 0), "leg_r": (0, 0)},
        2: {"arm_l": (-1, -2), "arm_r": (1, 1), "leg_l": (-1, 1), "leg_r": (1, -1)},
        3: {"arm_l": (0, -3), "arm_r": (0, 2), "leg_l": (0, 2), "leg_r": (0, -1)},
        4: {"arm_l": (-2, 0), "arm_r": (2, 0), "leg_l": (-1, 0), "leg_r": (1, 0)},
        5: {"arm_l": (-1, -1), "arm_r": (-1, 2), "leg_l": (1, 1), "leg_r": (-1, 0)},
    }
    off = pose_offsets[pose]

    # Center figure around (32, 32)
    cx = 32

    # Head (helmet)
    hx, hy = cx - 4, 8
    draw_rect(d, hx, hy, 8, 7, p)
    draw_rect(d, hx + 1, hy - 2, 6, 3, s)         # crest
    draw_rect(d, hx + 2, hy + 2, 4, 3, sh)         # visor highlight
    draw_outline(d, hx, hy, 8, 7, BLACK)

    # Neck
    draw_rect(d, cx - 1, hy + 7, 2, 2, s)

    # Torso / chest plate
    tx, ty = cx - 6, hy + 9
    draw_rect(d, tx, ty, 12, 10, p)
    draw_rect(d, tx + 2, ty + 1, 8, 5, s)          # chest emblem
    draw_rect(d, tx + 4, ty + 2, 4, 2, a)          # center gem
    draw_outline(d, tx, ty, 12, 10, BLACK)

    # Shoulder guards
    draw_rect(d, tx - 3, ty, 4, 4, dk)
    draw_rect(d, tx + 11, ty, 4, 4, dk)
    draw_outline(d, tx - 3, ty, 4, 4, BLACK)
    draw_outline(d, tx + 11, ty, 4, 4, BLACK)

    # Left arm
    lax = tx - 2 + off["arm_l"][0]
    lay = ty + 4 + off["arm_l"][1]
    draw_rect(d, lax, lay, 3, 7, s)
    draw_rect(d, lax, lay + 7, 3, 3, p)            # gauntlet
    draw_outline(d, lax, lay, 3, 10, BLACK)

    # Right arm
    rax = tx + 11 + off["arm_r"][0]
    ray = ty + 4 + off["arm_r"][1]
    draw_rect(d, rax, ray, 3, 7, s)
    draw_rect(d, rax, ray + 7, 3, 3, p)
    draw_outline(d, rax, ray, 3, 10, BLACK)

    # Belt
    bx, by = cx - 5, ty + 10
    draw_rect(d, bx, by, 10, 3, dk)
    draw_rect(d, bx + 4, by, 2, 3, a)              # belt buckle
    draw_outline(d, bx, by, 10, 3, BLACK)

    # Left leg
    llx = cx - 5 + off["leg_l"][0]
    lly = by + 3 + off["leg_l"][1]
    draw_rect(d, llx, lly, 4, 8, p)
    draw_rect(d, llx, lly + 8, 5, 3, dk)           # boot
    draw_outline(d, llx, lly, 4, 11, BLACK)

    # Right leg
    rlx = cx + 1 + off["leg_r"][0]
    rly = by + 3 + off["leg_r"][1]
    draw_rect(d, rlx, rly, 4, 8, p)
    draw_rect(d, rlx, rly + 8, 5, 3, dk)
    draw_outline(d, rlx, rly, 4, 11, BLACK)

    return img


# ---------------------------------------------------------------------------
# Weapon sprite (128×104)
# ---------------------------------------------------------------------------

WEAPON_SHAPES = [
    "straight_sword",
    "curved_sword",
    "great_axe",
    "staff",
    "dagger",
    "spear",
    "hammer",
    "bow",
    "trident",
    "scythe",
]


def draw_weapon_sprite(theme: dict, shape: str) -> Image.Image:
    img = Image.new("RGBA", (128, 104), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    BLACK = (0, 0, 0, 255)
    p = theme["primary"] + (255,)
    s = theme["secondary"] + (255,)
    a = theme["accent"] + (255,)
    dk = theme["dark"] + (255,)
    sh = theme["shine"] + (255,)

    cx, cy = 64, 52

    if shape == "straight_sword":
        # Blade (vertical)
        draw_rect(d, cx - 2, 10, 4, 60, s)
        draw_rect(d, cx - 1, 10, 2, 55, sh)
        draw_rect(d, cx - 2, 10, 1, 60, dk)
        # Cross-guard
        draw_rect(d, cx - 12, 65, 24, 5, p)
        draw_outline(d, cx - 12, 65, 24, 5, BLACK)
        # Handle
        draw_rect(d, cx - 2, 70, 4, 14, dk)
        draw_rect(d, cx - 1, 70, 2, 14, p)
        # Pommel
        fill_circle(d, cx, 85, 5, p)
        draw_outline(d, cx - 5, 80, 10, 10, BLACK)
        # Blade outline
        draw_outline(d, cx - 2, 10, 4, 60, BLACK)
        # Tip
        put_pixel(img, cx, 8, s)
        put_pixel(img, cx - 1, 9, s)
        put_pixel(img, cx + 1, 9, s)

    elif shape == "curved_sword":
        for i in range(55):
            ox = int(math.sin(i * 0.07) * 8)
            for w in range(-2, 3):
                c = sh if w == 0 else (s if abs(w) == 1 else dk)
                put_pixel(img, cx + ox + w, 12 + i, c)
                put_pixel(img, cx + ox - 3, 12 + i, BLACK)
                put_pixel(img, cx + ox + 3, 12 + i, BLACK)
        draw_rect(d, cx - 10, 67, 20, 4, p)
        draw_outline(d, cx - 10, 67, 20, 4, BLACK)
        draw_rect(d, cx - 2, 71, 4, 14, dk)
        fill_circle(d, cx, 86, 5, p)

    elif shape == "great_axe":
        # Handle
        draw_rect(d, cx - 2, 20, 4, 65, dk)
        draw_rect(d, cx - 1, 20, 2, 65, p)
        draw_outline(d, cx - 2, 20, 4, 65, BLACK)
        # Axe head left
        pts_l = [(cx - 2, 25), (cx - 22, 35), (cx - 22, 55), (cx - 2, 58)]
        d.polygon(pts_l, fill=s, outline=BLACK)
        d.polygon([(cx - 2, 25), (cx - 18, 38), (cx - 18, 50), (cx - 2, 53)], fill=sh)
        # Axe head right (smaller)
        pts_r = [(cx + 2, 30), (cx + 15, 38), (cx + 15, 52), (cx + 2, 55)]
        d.polygon(pts_r, fill=p, outline=BLACK)

    elif shape == "staff":
        # Staff pole
        draw_rect(d, cx - 2, 20, 4, 70, dk)
        draw_rect(d, cx - 1, 20, 2, 70, p)
        draw_outline(d, cx - 2, 20, 4, 70, BLACK)
        # Orb at top
        fill_circle(d, cx, 16, 10, s)
        fill_circle(d, cx - 2, 13, 5, sh)
        d.ellipse([cx - 10, 6, cx + 10, 26], outline=BLACK)
        # Magic rings
        for i, r in enumerate([12, 9, 6]):
            d.ellipse([cx - r, 16 - r, cx + r, 16 + r], outline=a if i == 0 else dk)

    elif shape == "dagger":
        # Blade (smaller, angled)
        for i in range(40):
            w = max(1, 3 - i // 15)
            for j in range(-w, w + 1):
                c = sh if j == 0 else (s if abs(j) == 1 else BLACK)
                put_pixel(img, cx + j, 18 + i, c)
        draw_rect(d, cx - 8, 58, 16, 3, p)
        draw_outline(d, cx - 8, 58, 16, 3, BLACK)
        draw_rect(d, cx - 2, 61, 4, 12, dk)
        fill_circle(d, cx, 74, 4, p)

    elif shape == "spear":
        # Long shaft
        draw_rect(d, cx - 1, 25, 2, 72, dk)
        draw_outline(d, cx - 1, 25, 2, 72, BLACK)
        # Spear tip
        pts = [(cx, 10), (cx - 4, 28), (cx + 4, 28)]
        d.polygon(pts, fill=s, outline=BLACK)
        d.polygon([(cx, 10), (cx - 1, 28), (cx + 1, 28)], fill=sh)
        # Cross piece
        draw_rect(d, cx - 8, 28, 16, 3, p)
        draw_outline(d, cx - 8, 28, 16, 3, BLACK)

    elif shape == "hammer":
        # Handle
        draw_rect(d, cx - 2, 35, 4, 55, dk)
        draw_rect(d, cx - 1, 35, 2, 55, p)
        draw_outline(d, cx - 2, 35, 4, 55, BLACK)
        # Hammer head
        draw_rect(d, cx - 16, 15, 32, 22, p)
        draw_rect(d, cx - 14, 17, 28, 18, s)
        draw_rect(d, cx - 10, 18, 12, 8, sh)  # face shine
        draw_rect(d, cx + 4, 17, 8, 18, dk)   # back bevel
        draw_outline(d, cx - 16, 15, 32, 22, BLACK)

    elif shape == "bow":
        # Bow curve (left side)
        for i in range(70):
            t = i / 70.0
            ox = int(math.sin(t * math.pi) * 18)
            put_pixel(img, cx - 20 + ox, 17 + i, s)
            put_pixel(img, cx - 21 + ox, 17 + i, dk)
        # String
        draw_rect(d, cx - 2, 17, 1, 70, a)
        # Arrow nocked
        draw_rect(d, cx - 2, 40, 28, 1, sh)
        pts = [(cx + 26, 38), (cx + 26, 42), (cx + 32, 40)]
        d.polygon(pts, fill=p, outline=BLACK)

    elif shape == "trident":
        # Handle
        draw_rect(d, cx - 1, 30, 2, 65, dk)
        draw_outline(d, cx - 1, 30, 2, 65, BLACK)
        # Center prong
        draw_rect(d, cx - 1, 12, 2, 20, s)
        draw_outline(d, cx - 1, 12, 2, 20, BLACK)
        put_pixel(img, cx, 10, s)
        # Left prong
        draw_rect(d, cx - 9, 18, 2, 15, s)
        draw_outline(d, cx - 9, 18, 2, 15, BLACK)
        put_pixel(img, cx - 9, 16, s)
        # Right prong
        draw_rect(d, cx + 7, 18, 2, 15, s)
        draw_outline(d, cx + 7, 18, 2, 15, BLACK)
        put_pixel(img, cx + 8, 16, s)
        # Cross bar
        draw_rect(d, cx - 10, 32, 20, 3, p)
        draw_outline(d, cx - 10, 32, 20, 3, BLACK)

    elif shape == "scythe":
        # Handle (diagonal)
        for i in range(75):
            x_ = cx - 20 + i // 3
            y_ = 20 + i
            put_pixel(img, x_, y_, dk)
            put_pixel(img, x_ - 1, y_, p)
        # Blade
        for i in range(40):
            t = i / 40.0
            bx_ = cx - 10 + int(t * 30)
            by_ = 18 - int(math.sin(t * math.pi) * 18)
            for w in range(-2, 3):
                c = sh if w == 0 else (s if abs(w) <= 1 else dk)
                put_pixel(img, bx_, by_ + w, c)
                put_pixel(img, bx_ - 1, by_ + w, BLACK)
                put_pixel(img, bx_ + 1, by_ + w, BLACK)

    return img


# ---------------------------------------------------------------------------
# Helmet sprite (192×147)
# ---------------------------------------------------------------------------

HELMET_STYLES = [
    "full_plate",
    "horned",
    "crested",
    "visor",
    "circlet",
    "bucket",
    "barbuta",
    "winged",
    "crown",
]


def draw_helmet_sprite(theme: dict, style: str) -> Image.Image:
    img = Image.new("RGBA", (192, 147), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    BLACK = (0, 0, 0, 255)
    p = theme["primary"] + (255,)
    s = theme["secondary"] + (255,)
    a = theme["accent"] + (255,)
    dk = theme["dark"] + (255,)
    sh = theme["shine"] + (255,)

    cx, cy = 96, 73

    # Base head shape (shared)
    head_w, head_h = 52, 60
    hx, hy = cx - head_w // 2, cy - head_h // 2

    d.ellipse([hx, hy + 10, hx + head_w, hy + head_h], fill=p, outline=BLACK)
    d.rectangle([hx, hy + 20, hx + head_w, hy + head_h], fill=p)
    draw_outline(d, hx, hy + 20, head_w, head_h - 20, BLACK)

    # Visor/face opening
    vx, vy = cx - 18, hy + 22
    draw_rect(d, vx, vy, 36, 20, dk)
    draw_outline(d, vx, vy, 36, 20, BLACK)

    # Eye slits
    draw_rect(d, vx + 4, vy + 6, 10, 3, a)
    draw_rect(d, vx + 22, vy + 6, 10, 3, a)

    if style == "full_plate":
        # Cheek guards
        draw_rect(d, hx - 6, hy + 25, 10, 20, p)
        draw_rect(d, hx + head_w - 4, hy + 25, 10, 20, p)
        draw_outline(d, hx - 6, hy + 25, 10, 20, BLACK)
        draw_outline(d, hx + head_w - 4, hy + 25, 10, 20, BLACK)
        # Top ridge
        draw_rect(d, cx - 3, hy + 5, 6, head_h // 2, s)
        draw_outline(d, cx - 3, hy + 5, 6, head_h // 2, BLACK)

    elif style == "horned":
        # Left horn
        pts_l = [(hx, hy + 20), (hx - 20, hy - 20), (hx + 8, hy + 5)]
        d.polygon(pts_l, fill=s, outline=BLACK)
        # Right horn
        pts_r = [(hx + head_w, hy + 20), (hx + head_w + 20, hy - 20), (hx + head_w - 8, hy + 5)]
        d.polygon(pts_r, fill=s, outline=BLACK)

    elif style == "crested":
        # Tall crest
        for i in range(30):
            w = max(2, 8 - i // 4)
            draw_rect(d, cx - w // 2, hy - 5 - i, w, 2, s if i % 2 == 0 else a)
        draw_outline(d, cx - 4, hy - 35, 8, 35, BLACK)

    elif style == "visor":
        # Full visor covering face
        draw_rect(d, vx - 2, vy - 2, 40, 26, s)
        draw_outline(d, vx - 2, vy - 2, 40, 26, BLACK)
        # Visor slots
        for i in range(4):
            draw_rect(d, vx + 4, vy + 4 + i * 5, 32, 2, dk)

    elif style == "circlet":
        # Thin crown/circlet
        draw_rect(d, hx - 2, hy + 12, head_w + 4, 8, p)
        draw_outline(d, hx - 2, hy + 12, head_w + 4, 8, BLACK)
        # Gems on circlet
        for i in range(5):
            gx = hx + 4 + i * 10
            fill_circle(d, gx, hy + 16, 3, a)

    elif style == "bucket":
        # Simple bucket helm - smooth dome
        draw_rect(d, hx - 4, hy + 15, head_w + 8, head_h // 2, p)
        draw_outline(d, hx - 4, hy + 15, head_w + 8, head_h // 2, BLACK)
        draw_rect(d, hx - 2, hy + 12, head_w + 4, 5, s)  # brim
        draw_outline(d, hx - 2, hy + 12, head_w + 4, 5, BLACK)

    elif style == "barbuta":
        # T-shaped face opening
        draw_rect(d, vx + 12, vy, 12, 24, dk)
        draw_rect(d, vx, vy + 8, 36, 10, dk)
        draw_outline(d, vx, vy, 36, 24, BLACK)

    elif style == "winged":
        # Wings on sides
        pts_lw = [(hx - 2, hy + 25), (hx - 30, hy + 5), (hx - 30, hy + 40), (hx - 2, hy + 45)]
        d.polygon(pts_lw, fill=s, outline=BLACK)
        # Inner wing detail
        draw_rect(d, hx - 22, hy + 15, 14, 4, sh)
        draw_rect(d, hx - 22, hy + 25, 14, 4, sh)
        pts_rw = [(hx + head_w + 2, hy + 25), (hx + head_w + 30, hy + 5), (hx + head_w + 30, hy + 40), (hx + head_w + 2, hy + 45)]
        d.polygon(pts_rw, fill=s, outline=BLACK)
        draw_rect(d, hx + head_w + 8, hy + 15, 14, 4, sh)
        draw_rect(d, hx + head_w + 8, hy + 25, 14, 4, sh)

    elif style == "crown":
        # Royal crown
        pts_crown = [
            (cx - 26, hy + 18), (cx - 26, hy + 5), (cx - 16, hy + 15),
            (cx - 8, hy - 8), (cx, hy + 12), (cx + 8, hy - 8),
            (cx + 16, hy + 15), (cx + 26, hy + 5), (cx + 26, hy + 18),
        ]
        d.polygon(pts_crown, fill=p, outline=BLACK)
        # Gems on crown points
        fill_circle(d, cx - 8, hy - 8, 4, a)
        fill_circle(d, cx, hy + 10, 4, sh)
        fill_circle(d, cx + 8, hy - 8, 4, a)

    # Chin strap / neck guard
    draw_rect(d, cx - 8, hy + head_h - 2, 16, 8, dk)
    draw_outline(d, cx - 8, hy + head_h - 2, 16, 8, BLACK)

    # Shine highlight
    draw_rect(d, hx + 4, hy + 14, 8, 12, sh)

    return img


# ---------------------------------------------------------------------------
# Shield sprite (64×64)
# ---------------------------------------------------------------------------

SHIELD_STYLES = [
    "kite",
    "round",
    "tower",
    "heater",
    "buckler",
    "pavise",
    "targe",
    "scutum",
    "aspis",
]


def draw_shield_sprite(theme: dict, style: str) -> Image.Image:
    img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    BLACK = (0, 0, 0, 255)
    p = theme["primary"] + (255,)
    s = theme["secondary"] + (255,)
    a = theme["accent"] + (255,)
    dk = theme["dark"] + (255,)
    sh = theme["shine"] + (255,)

    cx, cy = 32, 32

    if style == "kite":
        pts = [(cx, 6), (cx + 22, 20), (cx + 22, 42), (cx, 60), (cx - 22, 42), (cx - 22, 20)]
        d.polygon(pts, fill=p, outline=BLACK)
        d.polygon([(cx, 8), (cx + 18, 21), (cx + 18, 40), (cx, 56), (cx - 18, 40), (cx - 18, 21)], fill=s)
        draw_rect(d, cx - 3, 14, 6, 36, a)
        draw_rect(d, cx - 16, cy - 2, 32, 4, a)
        fill_circle(d, cx, cy, 4, sh)

    elif style == "round":
        fill_circle(d, cx, cy, 25, p)
        fill_circle(d, cx, cy, 20, s)
        fill_circle(d, cx, cy, 12, p)
        fill_circle(d, cx, cy, 6, a)
        d.ellipse([cx - 25, cy - 25, cx + 25, cy + 25], outline=BLACK)
        d.ellipse([cx - 20, cy - 20, cx + 20, cy + 20], outline=dk)

    elif style == "tower":
        draw_rect(d, cx - 20, 8, 40, 48, p)
        draw_rect(d, cx - 20, 8, 40, 6, s)  # top battlements (simplified)
        draw_rect(d, cx - 16, 10, 32, 40, s)
        draw_rect(d, cx - 8, 20, 16, 24, a)
        draw_outline(d, cx - 20, 8, 40, 48, BLACK)
        fill_circle(d, cx, cy, 5, sh)

    elif style == "heater":
        pts = [(cx, 8), (cx + 20, 15), (cx + 20, 40), (cx, 58), (cx - 20, 40), (cx - 20, 15)]
        d.polygon(pts, fill=p, outline=BLACK)
        d.polygon([(cx, 12), (cx + 15, 18), (cx + 15, 38), (cx, 52), (cx - 15, 38), (cx - 15, 18)], fill=s)
        draw_rect(d, cx - 2, 14, 4, 36, a)
        draw_rect(d, cx - 14, cy - 2, 28, 4, a)

    elif style == "buckler":
        fill_circle(d, cx, cy, 18, p)
        fill_circle(d, cx, cy, 14, s)
        fill_circle(d, cx, cy, 6, dk)
        # Boss (center spike)
        pts = [(cx, cy - 8), (cx - 4, cy + 4), (cx + 4, cy + 4)]
        d.polygon(pts, fill=sh, outline=BLACK)
        d.ellipse([cx - 18, cy - 18, cx + 18, cy + 18], outline=BLACK)

    elif style == "pavise":
        draw_rect(d, cx - 18, 6, 36, 52, p)
        # Central spine
        draw_rect(d, cx - 2, 6, 4, 52, dk)
        # Decorative panels
        draw_rect(d, cx - 14, 10, 12, 20, s)
        draw_rect(d, cx + 2, 10, 12, 20, s)
        draw_rect(d, cx - 14, 34, 12, 20, s)
        draw_rect(d, cx + 2, 34, 12, 20, s)
        draw_outline(d, cx - 18, 6, 36, 52, BLACK)

    elif style == "targe":
        fill_circle(d, cx, cy, 22, p)
        fill_circle(d, cx, cy, 18, s)
        fill_circle(d, cx, cy, 10, p)
        # Decorative rivets
        for angle in range(0, 360, 45):
            rx = cx + int(math.cos(math.radians(angle)) * 16)
            ry = cy + int(math.sin(math.radians(angle)) * 16)
            fill_circle(d, rx, ry, 2, sh)
        d.ellipse([cx - 22, cy - 22, cx + 22, cy + 22], outline=BLACK)

    elif style == "scutum":
        # Rectangular Roman-style
        draw_rect(d, cx - 20, 10, 40, 44, p)
        # Curved top/bottom (approximated)
        draw_rect(d, cx - 16, 8, 32, 48, s)
        draw_outline(d, cx - 20, 10, 40, 44, BLACK)
        # Central boss
        fill_circle(d, cx, cy, 7, dk)
        fill_circle(d, cx, cy, 4, sh)
        # Horizontal lines (pilum boss holes)
        draw_rect(d, cx - 14, cy - 12, 28, 2, dk)
        draw_rect(d, cx - 14, cy + 10, 28, 2, dk)

    elif style == "aspis":
        fill_circle(d, cx, cy, 24, p)
        fill_circle(d, cx, cy, 20, s)
        # Rim decoration
        for i in range(8):
            angle = i * 45
            rx = cx + int(math.cos(math.radians(angle)) * 21)
            ry = cy + int(math.sin(math.radians(angle)) * 21)
            fill_circle(d, rx, ry, 3, a)
        fill_circle(d, cx, cy, 8, dk)
        fill_circle(d, cx - 2, cy - 2, 4, sh)
        d.ellipse([cx - 24, cy - 24, cx + 24, cy + 24], outline=BLACK)

    return img


# ---------------------------------------------------------------------------
# Item icon (96×96)
# ---------------------------------------------------------------------------

ITEM_TYPES = [
    "potion_red",
    "potion_blue",
    "gem_ruby",
    "gem_sapphire",
    "scroll",
    "ring",
    "boots",
    "gloves",
    "necklace",
    "key",
]


def draw_item_icon(item_type: str) -> Image.Image:
    img = Image.new("RGBA", (96, 96), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    BLACK = (0, 0, 0, 255)
    cx, cy = 48, 48

    if item_type == "potion_red":
        # Bottle shape
        draw_rect(d, cx - 4, 20, 8, 6, (180, 180, 180, 255))   # neck
        draw_outline(d, cx - 4, 20, 8, 6, BLACK)
        draw_rect(d, cx - 3, 18, 6, 3, (180, 180, 180, 255))   # stopper
        d.ellipse([cx - 16, 28, cx + 16, 75], fill=(220, 30, 30, 255), outline=BLACK)
        fill_circle(d, cx - 5, 38, 4, (255, 100, 100, 255))  # highlight
        fill_circle(d, cx - 2, 36, 2, (255, 200, 200, 255))

    elif item_type == "potion_blue":
        draw_rect(d, cx - 4, 20, 8, 6, (180, 180, 180, 255))
        draw_outline(d, cx - 4, 20, 8, 6, BLACK)
        draw_rect(d, cx - 3, 18, 6, 3, (180, 180, 180, 255))
        d.ellipse([cx - 16, 28, cx + 16, 75], fill=(30, 60, 220, 255), outline=BLACK)
        fill_circle(d, cx - 5, 38, 4, (80, 120, 255, 255))
        fill_circle(d, cx - 2, 36, 2, (180, 200, 255, 255))

    elif item_type == "gem_ruby":
        pts = [(cx, 20), (cx + 20, 38), (cx + 14, 60), (cx - 14, 60), (cx - 20, 38)]
        d.polygon(pts, fill=(200, 20, 40, 255), outline=BLACK)
        d.polygon([(cx, 22), (cx + 16, 38), (cx, 52), (cx - 16, 38)], fill=(255, 80, 100, 255))
        d.polygon([(cx - 8, 26), (cx + 8, 26), (cx, 22)], fill=(255, 180, 180, 255))

    elif item_type == "gem_sapphire":
        pts = [(cx, 20), (cx + 20, 38), (cx + 14, 60), (cx - 14, 60), (cx - 20, 38)]
        d.polygon(pts, fill=(20, 60, 200, 255), outline=BLACK)
        d.polygon([(cx, 22), (cx + 16, 38), (cx, 52), (cx - 16, 38)], fill=(80, 120, 255, 255))
        d.polygon([(cx - 8, 26), (cx + 8, 26), (cx, 22)], fill=(180, 200, 255, 255))

    elif item_type == "scroll":
        # Rolled scroll
        d.ellipse([cx - 20, 18, cx + 20, 34], fill=(230, 200, 140, 255), outline=BLACK)
        draw_rect(d, cx - 20, 26, 40, 42, (230, 200, 140, 255))
        draw_outline(d, cx - 20, 26, 40, 42, BLACK)
        d.ellipse([cx - 20, 50, cx + 20, 66], fill=(230, 200, 140, 255), outline=BLACK)
        # Text lines
        for i in range(4):
            draw_rect(d, cx - 14, 32 + i * 8, 28, 2, (120, 80, 40, 255))
        # Red seal
        fill_circle(d, cx, 54, 6, (180, 30, 30, 255))

    elif item_type == "ring":
        d.ellipse([cx - 20, cy - 20, cx + 20, cy + 20], fill=(210, 170, 50, 255), outline=BLACK)
        d.ellipse([cx - 12, cy - 12, cx + 12, cy + 12], fill=(0, 0, 0, 0), outline=BLACK)
        # Gem on ring
        fill_circle(d, cx, cy - 18, 6, (100, 180, 255, 255))
        d.ellipse([cx - 6, cy - 24, cx + 6, cy - 12], outline=BLACK)

    elif item_type == "boots":
        # Boot outline
        pts = [(cx - 14, 30), (cx + 14, 30), (cx + 14, 68), (cx + 22, 70), (cx + 22, 76), (cx - 14, 76)]
        d.polygon(pts, fill=(120, 80, 40, 255), outline=BLACK)
        draw_rect(d, cx - 12, 30, 24, 20, (150, 110, 60, 255))  # shaft
        # Laces
        for i in range(3):
            draw_rect(d, cx - 8, 34 + i * 6, 16, 2, (200, 160, 100, 255))

    elif item_type == "gloves":
        # Palm
        d.ellipse([cx - 16, cy - 8, cx + 16, cy + 24], fill=(120, 80, 40, 255), outline=BLACK)
        # Fingers
        for i, fx in enumerate([cx - 12, cx - 4, cx + 4, cx + 12]):
            draw_rect(d, fx - 3, cy - 22, 6, 20, (120, 80, 40, 255))
            draw_outline(d, fx - 3, cy - 22, 6, 20, BLACK)
        # Thumb
        draw_rect(d, cx - 20, cy - 4, 6, 14, (120, 80, 40, 255))
        draw_outline(d, cx - 20, cy - 4, 6, 14, BLACK)
        # Knuckle detail
        for i, fx in enumerate([cx - 12, cx - 4, cx + 4, cx + 12]):
            fill_circle(d, fx, cy - 18, 2, (150, 110, 60, 255))

    elif item_type == "necklace":
        # Chain arc
        for i in range(0, 180, 10):
            nx = cx + int(math.cos(math.radians(i)) * 24)
            ny = cy - 10 + int(math.sin(math.radians(i)) * 16)
            fill_circle(d, nx, ny, 2, (210, 170, 50, 255))
        # Pendant
        pts = [(cx, cy + 10), (cx - 8, cy + 20), (cx, cy + 36), (cx + 8, cy + 20)]
        d.polygon(pts, fill=(200, 30, 30, 255), outline=BLACK)
        fill_circle(d, cx, cy + 22, 4, (255, 100, 100, 255))

    elif item_type == "key":
        # Key bow (ring)
        d.ellipse([cx - 20, 20, cx, 40], fill=(210, 170, 50, 255), outline=BLACK)
        d.ellipse([cx - 15, 25, cx - 5, 35], fill=(0, 0, 0, 0), outline=BLACK)
        # Key shaft
        draw_rect(d, cx, 29, 30, 4, (210, 170, 50, 255))
        draw_outline(d, cx, 29, 30, 4, BLACK)
        # Key teeth
        draw_rect(d, cx + 16, 33, 4, 8, (210, 170, 50, 255))
        draw_outline(d, cx + 16, 33, 4, 8, BLACK)
        draw_rect(d, cx + 24, 33, 4, 6, (210, 170, 50, 255))
        draw_outline(d, cx + 24, 33, 4, 6, BLACK)

    return img


# ---------------------------------------------------------------------------
# Main generation logic
# ---------------------------------------------------------------------------

def get_next_ids():
    """Find the next available IDs for each category."""
    actors = ASSETS_ROOT / "actors"

    # Armor: directories like 2000, 2001, …
    armor_ids = sorted([
        int(d.name) for d in (actors / "armor").iterdir()
        if d.is_dir() and d.name.isdigit()
    ])
    next_armor = max(armor_ids) + 1 if armor_ids else 2000

    # Weapons: 4000.png, 4001.png, …
    weapon_ids = sorted([
        int(f.stem) for f in (actors / "weapon").glob("*.png")
        if f.stem.isdigit() and not f.stem.startswith(".")
    ])
    # Exclude 4999 (special) from continuity check
    normal_weapons = [x for x in weapon_ids if x < 4900]
    next_weapon = max(normal_weapons) + 1 if normal_weapons else 4000

    # Helmets: 1000.png, 1001.png, …
    helmet_ids = sorted([
        int(f.stem) for f in (actors / "helmet").glob("*.png")
        if f.stem.isdigit()
    ])
    next_helmet = max(helmet_ids) + 1 if helmet_ids else 1000

    # Shields
    shield_ids = sorted([
        int(f.stem) for f in (actors / "shiled").glob("*.png")
        if f.stem.isdigit()
    ])
    next_shield = max(shield_ids) + 1 if shield_ids else 3000

    # Items (numeric only)
    item_ids = sorted([
        int(f.stem) for f in (ASSETS_ROOT / "processed").glob("*.png")
        if f.stem.isdigit()
    ])
    next_item = max(item_ids) + 1 if item_ids else 500000

    return {
        "armor": next_armor,
        "weapon": next_weapon,
        "helmet": next_helmet,
        "shield": next_shield,
        "item": next_item,
    }


def create_armor_set(armor_id: int, theme_name: str, dry_run: bool = False):
    theme = THEMES[theme_name]
    folder = ASSETS_ROOT / "actors" / "armor" / str(armor_id)
    if not dry_run:
        folder.mkdir(parents=True, exist_ok=True)
    for pose in range(1, 6):
        fname = f"{armor_id}_{pose}.png"
        out_path = folder / fname
        img = draw_armor_sprite(theme, pose)
        if dry_run:
            print(f"  [DRY] Would create {out_path}")
        else:
            img.save(str(out_path))
            meta = make_meta(str(uuid.uuid4()), f"{armor_id}_{pose}", 64, 64)
            save_meta(meta, out_path)
            print(f"  Created {out_path}")
    # Folder meta
    folder_meta_path = ASSETS_ROOT / "actors" / "armor" / f"{armor_id}.meta"
    if not dry_run and not folder_meta_path.exists():
        with open(folder_meta_path, "w") as f:
            json.dump({"ver": "1.0.1", "importer": "directory", "imported": True,
                       "uuid": str(uuid.uuid4()), "files": [], "subMetas": {},
                       "userData": {}}, f, separators=(",", ":"))


def create_weapon(weapon_id: int, theme_name: str, shape: str, dry_run: bool = False):
    theme = THEMES[theme_name]
    out_path = ASSETS_ROOT / "actors" / "weapon" / f"{weapon_id}.png"
    img = draw_weapon_sprite(theme, shape)
    if dry_run:
        print(f"  [DRY] Would create {out_path}")
    else:
        img.save(str(out_path))
        meta = make_meta(str(uuid.uuid4()), str(weapon_id), 128, 104)
        save_meta(meta, out_path)
        print(f"  Created {out_path}")


def create_helmet(helmet_id: int, theme_name: str, style: str, dry_run: bool = False):
    theme = THEMES[theme_name]
    for suffix in ["", "-1"]:
        out_path = ASSETS_ROOT / "actors" / "helmet" / f"{helmet_id}{suffix}.png"
        img = draw_helmet_sprite(theme, style)
        if dry_run:
            print(f"  [DRY] Would create {out_path}")
        else:
            img.save(str(out_path))
            meta = make_meta(str(uuid.uuid4()), f"{helmet_id}{suffix}", 192, 147)
            save_meta(meta, out_path)
            print(f"  Created {out_path}")


def create_shield(shield_id: int, theme_name: str, style: str, dry_run: bool = False):
    theme = THEMES[theme_name]
    out_path = ASSETS_ROOT / "actors" / "shiled" / f"{shield_id}.png"
    img = draw_shield_sprite(theme, style)
    if dry_run:
        print(f"  [DRY] Would create {out_path}")
    else:
        img.save(str(out_path))
        meta = make_meta(str(uuid.uuid4()), str(shield_id), 64, 64)
        save_meta(meta, out_path)
        print(f"  Created {out_path}")


def create_item(item_id: int, item_type: str, dry_run: bool = False):
    out_path = ASSETS_ROOT / "processed" / f"{item_id}.png"
    img = draw_item_icon(item_type)
    if dry_run:
        print(f"  [DRY] Would create {out_path}")
    else:
        img.save(str(out_path))
        meta = make_meta(str(uuid.uuid4()), str(item_id), 96, 96)
        save_meta(meta, out_path)
        print(f"  Created {out_path}")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args():
    parser = argparse.ArgumentParser(description="Generate new pixel art game assets")
    parser.add_argument(
        "--categories",
        nargs="+",
        choices=["armor", "weapon", "helmet", "shield", "item"],
        default=["armor", "weapon", "helmet", "shield", "item"],
        help="Asset categories to generate (default: all)",
    )
    parser.add_argument(
        "--count",
        type=int,
        default=9,
        help="Number of new assets per category (default: 9)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be created without saving",
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default=None,
        help="Override base output directory (default: assets/resources)",
    )
    return parser.parse_args()


def main():
    args = parse_args()

    global ASSETS_ROOT
    if args.output_dir:
        ASSETS_ROOT = Path(args.output_dir)

    count = min(args.count, len(THEME_NAMES))
    dry = args.dry_run

    print("=" * 60)
    print("GameClient - New Pixel Art Asset Generator")
    print("=" * 60)
    if dry:
        print("DRY RUN - no files will be written")
    print()

    ids = get_next_ids()
    print(f"Starting IDs: armor={ids['armor']}, weapon={ids['weapon']},",
          f"helmet={ids['helmet']}, shield={ids['shield']}, item={ids['item']}")
    print()

    summary = {}

    if "armor" in args.categories:
        print(f"[ARMOR] Generating {count} new armor sets ({5 * count} sprites)…")
        created = []
        for i in range(count):
            theme_name = THEME_NAMES[i % len(THEME_NAMES)]
            armor_id = ids["armor"] + i
            create_armor_set(armor_id, theme_name, dry_run=dry)
            created.append(armor_id)
        summary["armor"] = created
        print()

    if "weapon" in args.categories:
        print(f"[WEAPON] Generating {count} new weapons…")
        created = []
        for i in range(count):
            theme_name = THEME_NAMES[i % len(THEME_NAMES)]
            shape = WEAPON_SHAPES[i % len(WEAPON_SHAPES)]
            weapon_id = ids["weapon"] + i
            create_weapon(weapon_id, theme_name, shape, dry_run=dry)
            created.append(weapon_id)
        summary["weapon"] = created
        print()

    if "helmet" in args.categories:
        print(f"[HELMET] Generating {count} new helmets…")
        created = []
        for i in range(count):
            theme_name = THEME_NAMES[i % len(THEME_NAMES)]
            style = HELMET_STYLES[i % len(HELMET_STYLES)]
            helmet_id = ids["helmet"] + i
            create_helmet(helmet_id, theme_name, style, dry_run=dry)
            created.append(helmet_id)
        summary["helmet"] = created
        print()

    if "shield" in args.categories:
        print(f"[SHIELD] Generating {count} new shields…")
        created = []
        for i in range(count):
            theme_name = THEME_NAMES[i % len(THEME_NAMES)]
            style = SHIELD_STYLES[i % len(SHIELD_STYLES)]
            shield_id = ids["shield"] + i
            create_shield(shield_id, theme_name, style, dry_run=dry)
            created.append(shield_id)
        summary["shield"] = created
        print()

    if "item" in args.categories:
        print(f"[ITEM] Generating {count} new item icons…")
        created = []
        for i in range(count):
            item_type = ITEM_TYPES[i % len(ITEM_TYPES)]
            item_id = ids["item"] + i
            create_item(item_id, item_type, dry_run=dry)
            created.append(item_id)
        summary["item"] = created
        print()

    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    total = 0
    for cat, ids_list in summary.items():
        files = len(ids_list) * 5 if cat == "armor" else (len(ids_list) * 2 if cat == "helmet" else len(ids_list))
        total += files
        print(f"  {cat:8s}: {len(ids_list)} new sets/items (IDs: {ids_list[0]}-{ids_list[-1]})")
    print(f"  Total files created: {total}")
    print()
    if not dry:
        print("All new pixel art assets have been generated successfully!")
        print("Note: meta files will be regenerated by the Cocos editor on next import.")
    else:
        print("DRY RUN complete – re-run without --dry-run to create files.")


if __name__ == "__main__":
    main()
