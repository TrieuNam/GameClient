# Pixel Art Conversion Guide

## Overview
This guide outlines the strategy to convert GameClient assets to pixel art style to avoid copyright issues and create a unique visual identity.

## Asset Inventory

### Priority 1: Character & Equipment Assets (High Copyright Risk)
Located in `/assets/resources/actors/` and `/assets/res/actors/`

1. **Armor Sets** (`/assets/resources/actors/armor/`)
   - 21 armor sets (IDs: 2000-2018, plus variants)
   - Each armor has 5 PNG variants (different angles/frames)
   - Total: ~105 PNG files
   - Average size: 2-7 KB per file

2. **Weapons** (`/assets/resources/actors/weapon/`)
   - 37 weapon designs (IDs: 4000-4036)
   - Single PNG per weapon
   - Total: 37 PNG files
   - Average size: 11-15 KB per file

3. **Helmets** (`/assets/resources/actors/helmet/`)
   - 37 helmet designs (IDs: 3000-3036)
   - Single PNG per helmet
   - Total: 37 PNG files

4. **Shields** (`/assets/resources/actors/shiled/`)
   - Shield equipment designs
   - Various PNG files

5. **Character Models** (`/assets/res/actors/10001/`)
   - Base character with Spine skeletal animation
   - Includes .skel, .atlas, and .png files

6. **NPCs** (`/assets/resources/actors/npc/`)
   - Non-player character models
   - Prefab files referencing sprites

7. **Mounts/Rides** (`/assets/resources/actors/ride/`)
   - Mount/vehicle assets

### Priority 2: Item Icons (Medium Copyright Risk)
Located in `/assets/resources/processed/`

- 3,472 PNG item icons
- Organized by numeric IDs (1-40128 range)
- Many items have multiple variants (e.g., 40000.png through 40000_6.png)
- These are inventory/UI preview images
- Average size: varies widely (1-50 KB)

### Priority 3: Effects & UI (Lower Copyright Risk)
Located in `/assets/res/effect/` and `/assets/resources/effect/`

- Visual effects (explosions, magic, particles)
- UI transitions and animations
- These can often be kept as-is or simplified

## Pixel Art Conversion Strategy

### Recommended Resolution Standards

For maintaining game functionality while achieving pixel art aesthetic:

1. **Equipment Assets (Armor, Weapons, Helmets, Shields)**
   - Current: Various sizes, typically 128x128 to 256x256 pixels
   - Recommended: 64x64 or 128x128 pixels
   - Use 16-32 colors per asset for authentic pixel art look

2. **Item Icons**
   - Current: Various sizes, typically 64x64 to 128x128 pixels
   - Recommended: 48x48 or 64x64 pixels
   - Use limited color palette (16-24 colors)

3. **Character Sprites**
   - Current: High-resolution sprites for Spine animation
   - Recommended: 32x32 or 64x64 pixel base sprites
   - Maintain separate sprite sheets for different animation frames

### Color Palette Guidelines

To ensure visual consistency across all converted assets:

1. **Limited Color Palette**: Use 16-32 colors maximum per asset
2. **Consistent Palette**: Create a master color palette for the entire game
3. **Recommended Palettes**:
   - DB32 (32 colors) - versatile, good for fantasy games
   - AAP-64 (64 colors) - more color options
   - Custom palette matching your game's theme

### Tools for Conversion

1. **Manual Conversion (Recommended for Quality)**:
   - **Aseprite** ($19.99, or compile from source) - Best for pixel art
   - **GraphicsGale** (Free) - Good alternative
   - **Piskel** (Free, web-based) - Simple online editor
   - **GIMP** (Free) - With pixel art plugins

2. **Semi-Automated Conversion**:
   - Downscale images to target resolution
   - Apply posterization/color reduction
   - Manual cleanup in pixel art editor
   - Add dithering if needed for gradients

3. **Batch Processing**:
   - Use ImageMagick for initial downscaling
   - Script provided in this repository (`tools/convert_to_pixel_art.py`)
   - Always manually review and refine results

## Conversion Workflow

### Phase 1: Setup (Week 1)
- [ ] Choose master color palette
- [ ] Set up pixel art editing tools
- [ ] Create style guide with 3-5 sample conversions
- [ ] Get stakeholder approval on style

### Phase 2: Priority 1 Assets (Weeks 2-4)
- [ ] Convert all armor sets (21 sets × 5 variants = 105 files)
- [ ] Convert all weapons (37 files)
- [ ] Convert all helmets (37 files)
- [ ] Convert all shields
- [ ] Update character base model (10001)
- [ ] Convert NPC models
- [ ] Convert mount/ride assets

### Phase 3: Priority 2 Assets (Weeks 5-8)
- [ ] Convert item icons in batches of 500
- [ ] Batch 1: Items 1-500
- [ ] Batch 2: Items 501-1000
- [ ] Batch 3: Items 1001-1500
- [ ] Continue until all 3,472 icons complete

### Phase 4: Priority 3 & Polish (Weeks 9-10)
- [ ] Review and adjust effects as needed
- [ ] Update UI elements for consistency
- [ ] Final QA pass on all assets

## Technical Implementation

### File Structure
Keep the existing directory structure but add a tracking system:

```
assets/
├── resources/
│   ├── actors/
│   │   ├── armor/
│   │   │   └── 2000/
│   │   │       ├── 2000_1.png (CONVERTED)
│   │   │       └── 2000_1.original.png (BACKUP)
│   │   └── ...
│   └── processed/
│       └── (item icons)
└── res/
    └── actors/
        └── 10001/
```

### Backup Strategy
**CRITICAL**: Always backup original assets before conversion!

1. Create `/assets/originals/` directory
2. Copy all original files there before starting
3. Use git to track changes
4. Consider using Git LFS for large binary files

### Asset Metadata
Create a tracking JSON file for conversion progress:

```json
{
  "conversion_started": "2026-03-31",
  "total_assets": 3700,
  "converted_assets": 0,
  "in_progress": [],
  "completed": [],
  "style_guide_version": "1.0"
}
```

## Quality Checklist

Before marking any asset as "complete", verify:

- [ ] Maintains recognizability (players can identify the item)
- [ ] Fits within color palette guidelines
- [ ] No anti-aliasing artifacts
- [ ] Proper transparency (alpha channel)
- [ ] Consistent pixel size/density with other converted assets
- [ ] File size is reasonable (pixel art should be smaller than originals)
- [ ] Works correctly in-game (test in actual game environment)

## Legal Considerations

### Copyright Compliance
- Original designs that closely resemble copyrighted work should be redesigned completely
- Pixel art style alone doesn't guarantee copyright safety
- Ensure distinctive visual elements differ from source material
- Consider consulting with a legal professional for high-risk assets

### Attribution
- Document any inspiration sources
- Ensure all converted assets are original works
- Keep conversion notes for legal defense if needed

## Testing Procedure

After converting assets:

1. **Visual Test**: View assets in game context
2. **Functional Test**: Verify game systems still work
3. **Performance Test**: Check load times and memory usage
4. **Cross-Platform Test**: Test on all target platforms

## Resources

### Pixel Art Tutorials
- [Pixel Art Tutorial by Pedro Medeiros](https://blog.studiominiboss.com/pixelart)
- [Pixel Logic - A Guide to Pixel Art](https://michafrar.gumroad.com/l/pixel-logic)
- [Pixel Art Course on Udemy](https://www.udemy.com/courses/search/?q=pixel%20art)

### Color Palettes
- [Lospec Palette List](https://lospec.com/palette-list)
- [DB32 Palette](https://lospec.com/palette-list/dawnbringer-32)
- [AAP-64](https://lospec.com/palette-list/aap-64)

### Community
- [Pixel Joint](http://pixeljoint.com/)
- [r/PixelArt](https://www.reddit.com/r/PixelArt/)
- [Pixel Art Discord Communities](https://disboard.org/servers/tag/pixel-art)

## Script Usage

### Conversion Helper Script
```bash
# Install dependencies
pip install -r tools/requirements.txt

# Convert a single asset
python tools/convert_to_pixel_art.py --input assets/resources/actors/weapon/4000.png --output assets/resources/actors/weapon/4000_pixel.png --size 64 --colors 32

# Batch convert a directory
python tools/convert_to_pixel_art.py --input-dir assets/resources/actors/armor/ --output-dir assets/resources/actors/armor/ --size 64 --colors 32 --backup

# Track conversion progress
python tools/track_conversion.py --status
```

### Validation Script
```bash
# Validate converted assets meet guidelines
python tools/validate_assets.py --dir assets/resources/actors/armor/

# Check for missing files
python tools/validate_assets.py --check-missing
```

## Notes

- **Estimated Total Time**: 8-10 weeks for complete conversion (with 1 dedicated artist)
- **Estimated Cost**: $0 if done in-house, or $5,000-$15,000 if outsourced to pixel artists
- **Tools Cost**: $0-$20 (Aseprite is recommended, $19.99)

## Next Steps

1. Review this guide with your team
2. Decide on the master color palette
3. Create 5-10 sample conversions for approval
4. Set up the conversion workflow
5. Begin systematic conversion following the priority order
