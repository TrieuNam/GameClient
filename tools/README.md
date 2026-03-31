# Pixel Art Conversion Tools

This directory contains Python scripts to help with the conversion of game assets to pixel art style.

## Overview

These tools are designed to assist with the systematic conversion of GameClient assets to pixel art style to:
- Create a unique visual identity
- Avoid copyright issues
- Maintain a consistent art style across all game assets

## Prerequisites

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Required packages:
- **Pillow** (PIL fork) - Image processing
- **numpy** - Numerical operations

## Tools

### 1. convert_to_pixel_art.py

Converts images to pixel art style using downscaling and color reduction.

**Features:**
- Single file or batch directory conversion
- Configurable target size and color palette
- Automatic backup of original files
- Preview mode to test settings
- Conversion logging

**Usage:**

```bash
# Convert single file
python convert_to_pixel_art.py --input weapon.png --output weapon_pixel.png --size 64 --colors 32

# Batch convert directory with backups
python convert_to_pixel_art.py --input-dir assets/resources/actors/armor/ \
                                --output-dir assets/resources/actors/armor/ \
                                --size 64 --colors 32 --backup

# Preview conversion without saving
python convert_to_pixel_art.py --input weapon.png --preview

# Convert with custom settings
python convert_to_pixel_art.py --input armor.png --output armor_pixel.png --size 128 --colors 16
```

**Parameters:**
- `--input`, `-i` - Input image file
- `--input-dir`, `-d` - Input directory for batch conversion
- `--output`, `-o` - Output file path
- `--output-dir` - Output directory for batch conversion
- `--size`, `-s` - Target pixel size (default: 64)
- `--colors`, `-c` - Number of colors in palette (default: 32)
- `--backup`, `-b` - Backup original files as .original.png
- `--preview`, `-p` - Preview mode (no output saved)
- `--pattern` - File pattern for batch conversion (default: *.png)
- `--log` - Path to save conversion log (default: conversion_log.json)

**Notes:**
- The script provides a starting point; manual refinement in pixel art tools (Aseprite, GraphicsGale) is recommended
- Always use `--backup` flag to preserve original assets
- Lower color counts (16-32) create more authentic pixel art look
- Experiment with size values to find the right balance for your game

### 2. track_conversion.py

Tracks the progress of pixel art conversion across all game assets.

**Features:**
- Scans assets directory and catalogs all files
- Tracks conversion status (pending, in_progress, completed)
- Organizes assets by category and priority
- Generates progress reports
- Exports tracking data to JSON

**Usage:**

```bash
# Initialize tracking database
python track_conversion.py --init

# Show current status
python track_conversion.py --status

# Mark assets as converted
python track_conversion.py --mark-converted assets/resources/actors/weapon/4000.png

# Mark multiple assets as in progress
python track_conversion.py --mark-in-progress assets/resources/actors/armor/2000/*.png

# List pending assets
python track_conversion.py --list-pending

# List pending assets by category
python track_conversion.py --list-pending --category armor

# Export detailed report
python track_conversion.py --export tracking_report.json
```

**Parameters:**
- `--init` - Initialize tracking database by scanning assets
- `--status` - Show conversion status summary
- `--mark-converted PATH [PATH...]` - Mark assets as completed
- `--mark-in-progress PATH [PATH...]` - Mark assets as in progress
- `--list-pending` - List assets that need conversion
- `--report` - Generate detailed JSON report
- `--export FILE` - Export report to JSON file
- `--category CAT` - Filter by category
- `--limit N` - Limit number of results (default: 20)
- `--assets-root DIR` - Root assets directory (default: assets)
- `--db FILE` - Path to tracking database (default: conversion_tracking.json)

**Asset Categories:**
- **Priority 1 (HIGH):** armor, weapon, helmet, shield, role, npc, ride
- **Priority 2 (MEDIUM):** processed (item icons)
- **Priority 3 (LOW):** effects
- **Priority 4 (OPTIONAL):** other

### 3. validate_assets.py

Validates converted pixel art assets against quality guidelines.

**Features:**
- Checks file size, dimensions, and format
- Verifies color count and palette usage
- Detects potential anti-aliasing issues
- Ensures backup files exist
- Strict mode for rigorous validation

**Usage:**

```bash
# Validate single file
python validate_assets.py --input weapon.png

# Validate entire directory
python validate_assets.py --dir assets/resources/actors/armor/

# Validate with strict rules
python validate_assets.py --dir assets/resources/actors/ --strict

# Check for missing backup files
python validate_assets.py --check-missing
```

**Parameters:**
- `--input`, `-i` - Input file to validate
- `--dir`, `-d` - Directory to validate
- `--check-missing` - Check for assets without backups
- `--strict` - Use strict validation rules (max 256px, 50KB)
- `--pattern` - File pattern to match (default: *.png)
- `--assets-root` - Root assets directory (default: assets)

**Validation Checks:**
- ✓ File size (pixel art should be <100KB, strict: <50KB)
- ✓ Image dimensions (reasonable for pixel art, strict: ≤256px)
- ✓ Color mode (RGB, RGBA, P, L)
- ✓ File format (PNG recommended)
- ✓ Color count (should be limited for pixel art)
- ✓ Anti-aliasing detection (semi-transparent pixels)
- ✓ Backup file existence

## Workflow

### Initial Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Initialize tracking:**
   ```bash
   python track_conversion.py --init
   ```

3. **Check status:**
   ```bash
   python track_conversion.py --status
   ```

### Converting Assets

#### Option A: Semi-Automated Conversion

1. **Test conversion on a single file first:**
   ```bash
   python convert_to_pixel_art.py --input assets/resources/actors/weapon/4000.png \
                                   --output /tmp/weapon_test.png --size 64 --colors 32
   ```

2. **Review the result and adjust parameters if needed**

3. **Batch convert a category:**
   ```bash
   python convert_to_pixel_art.py --input-dir assets/resources/actors/weapon/ \
                                   --output-dir assets/resources/actors/weapon/ \
                                   --size 64 --colors 32 --backup
   ```

4. **Validate converted assets:**
   ```bash
   python validate_assets.py --dir assets/resources/actors/weapon/
   ```

5. **Mark as converted:**
   ```bash
   python track_conversion.py --mark-converted assets/resources/actors/weapon/*.png
   ```

#### Option B: Manual Conversion (Recommended for Quality)

1. **List assets to convert:**
   ```bash
   python track_conversion.py --list-pending --category weapon --limit 50
   ```

2. **Mark assets as in-progress:**
   ```bash
   python track_conversion.py --mark-in-progress assets/resources/actors/weapon/4000.png
   ```

3. **Convert manually in Aseprite/GraphicsGale/etc.**

4. **Validate result:**
   ```bash
   python validate_assets.py --input assets/resources/actors/weapon/4000.png
   ```

5. **Mark as completed:**
   ```bash
   python track_conversion.py --mark-converted assets/resources/actors/weapon/4000.png
   ```

6. **Check progress:**
   ```bash
   python track_conversion.py --status
   ```

### Monitoring Progress

```bash
# Quick status check
python track_conversion.py --status

# Detailed report
python track_conversion.py --report

# Export for stakeholders
python track_conversion.py --export status_report_$(date +%Y%m%d).json
```

## Recommendations

### Conversion Quality

**For best results:**
1. Use the automated converter as a starting point only
2. Manually refine results in dedicated pixel art software (Aseprite recommended)
3. Maintain consistent pixel density across similar assets
4. Use a limited, consistent color palette (16-32 colors recommended)
5. Avoid anti-aliasing and use hard edges
6. Test converted assets in-game to ensure they work correctly

### Recommended Settings

**Equipment (armor, weapons, helmets, shields):**
- Size: 64x64 or 128x128 pixels
- Colors: 24-32 colors
- Focus on silhouette clarity

**Item Icons:**
- Size: 48x48 or 64x64 pixels
- Colors: 16-24 colors
- Ensure recognizability at small size

**Characters:**
- Size: 32x32 or 64x64 pixel base sprites
- Colors: 32 colors maximum
- Maintain animation frame consistency

### Backup Strategy

**CRITICAL: Always backup original assets!**

1. The `--backup` flag automatically creates `.original.png` files
2. Keep original files in a separate backup directory
3. Use version control (git) to track changes
4. Consider using Git LFS for large binary files

## Troubleshooting

### "ModuleNotFoundError: No module named 'PIL'"

Install dependencies:
```bash
pip install -r requirements.txt
```

### Converted assets look blurry

- Ensure viewer/game engine is using nearest-neighbor scaling
- Check that no smoothing/filtering is applied during rendering
- Verify assets weren't accidentally upscaled with bilinear filtering

### Colors look wrong

- Try different color count values (--colors parameter)
- Consider using a fixed color palette for consistency
- Manual adjustment in pixel art editor may be necessary

### File sizes too large

- Reduce target size (--size parameter)
- Reduce color count (--colors parameter)
- Ensure PNG optimization is working (images should be smaller)

## Advanced Usage

### Custom Color Palettes

To use a specific color palette (requires code modification):

1. Edit `convert_to_pixel_art.py`
2. Modify the `_reduce_colors()` method to use your custom palette
3. See [Lospec](https://lospec.com/palette-list) for palette inspiration

### Batch Processing with Custom Scripts

```bash
# Convert all armor sets
for armor in assets/resources/actors/armor/*/; do
    python convert_to_pixel_art.py --input-dir "$armor" --output-dir "$armor" \
                                    --size 64 --colors 32 --backup
done

# Validate all converted assets
python validate_assets.py --dir assets/resources/actors/
```

### Integration with Build Pipeline

Add to your CI/CD pipeline:

```bash
# Validate all assets meet quality standards
python validate_assets.py --dir assets/ --strict || exit 1
```

## Support

For issues or questions:
1. Check the main project documentation: `../PIXEL_ART_CONVERSION_GUIDE.md`
2. Review tool help: `python <tool>.py --help`
3. Open an issue in the project repository

## Credits

These tools were created to assist with the GameClient pixel art conversion project.

**Tools used:**
- Python 3.x
- Pillow (Python Imaging Library fork)
- numpy

**Recommended pixel art software:**
- [Aseprite](https://www.aseprite.org/) ($19.99, or compile from source)
- [GraphicsGale](https://graphicsgale.com/) (Free)
- [Piskel](https://www.piskelapp.com/) (Free, web-based)
- [GIMP](https://www.gimp.org/) with pixel art plugins (Free)
