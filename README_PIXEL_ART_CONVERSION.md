# GameClient - Pixel Art Conversion Project

This project contains tools and documentation for converting GameClient assets to pixel art style.

## 🎯 Project Goal

Convert all game assets (characters, equipment, items, effects) to pixel art style to:
- Create a unique visual identity for the game
- Avoid copyright issues with existing assets
- Establish a consistent, retro-inspired art style

## 📋 Quick Start

### 1. Install Dependencies

```bash
cd tools
pip install -r requirements.txt
```

### 2. Initialize Asset Tracking

```bash
python tools/track_conversion.py --init
```

This will scan all assets and create a tracking database.

### 3. Check Current Status

```bash
python tools/track_conversion.py --status
```

### 4. Start Converting Assets

**Option A: Semi-Automated (Quick Start)**

```bash
# Test on a single weapon
python tools/convert_to_pixel_art.py \
    --input assets/resources/actors/weapon/4000.png \
    --output /tmp/weapon_test.png \
    --size 64 --colors 32

# If satisfied, batch convert all weapons
python tools/convert_to_pixel_art.py \
    --input-dir assets/resources/actors/weapon/ \
    --output-dir assets/resources/actors/weapon/ \
    --size 64 --colors 32 --backup
```

**Option B: Manual Conversion (Recommended for Quality)**

```bash
# See what needs to be converted
python tools/track_conversion.py --list-pending --category weapon

# Convert manually in Aseprite/GraphicsGale
# Then validate and mark as complete
python tools/validate_assets.py --input assets/resources/actors/weapon/4000.png
python tools/track_conversion.py --mark-converted assets/resources/actors/weapon/4000.png
```

## 📚 Documentation

- **[Pixel Art Conversion Guide](PIXEL_ART_CONVERSION_GUIDE.md)** - Complete strategy and workflow
- **[Tools README](tools/README.md)** - Detailed tool usage and examples

## 🛠️ Available Tools

Located in the `tools/` directory:

1. **convert_to_pixel_art.py** - Semi-automated image conversion
2. **track_conversion.py** - Progress tracking and reporting
3. **validate_assets.py** - Quality validation

See [tools/README.md](tools/README.md) for detailed usage.

## 📊 Asset Inventory

### Priority 1: Character & Equipment (HIGH)
- **Armor**: 21 sets × 5 variants = ~105 PNG files
- **Weapons**: 37 PNG files
- **Helmets**: 37 PNG files
- **Shields**: Multiple PNG files
- **Characters**: Base models with Spine animations
- **NPCs**: Various character models
- **Mounts**: Ride/vehicle assets

**Total Priority 1**: ~200-300 files

### Priority 2: Item Icons (MEDIUM)
- **Item Icons**: 3,472 PNG files in `assets/resources/processed/`

### Priority 3: Effects & UI (LOW)
- **Effects**: Visual effects, animations, particles
- **UI Elements**: Various interface assets

**Total Assets**: ~3,700+ files

## 🎨 Recommended Settings

### Equipment (Armor, Weapons, Helmets, Shields)
- **Resolution**: 64×64 or 128×128 pixels
- **Colors**: 24-32 colors
- **Focus**: Clear silhouettes, recognizable shapes

### Item Icons
- **Resolution**: 48×48 or 64×64 pixels
- **Colors**: 16-24 colors
- **Focus**: Recognizable at small size

### Characters
- **Resolution**: 32×32 or 64×64 pixel base sprites
- **Colors**: 32 colors maximum
- **Focus**: Animation consistency

## 🔄 Recommended Workflow

### Phase 1: Setup (Week 1)
- [x] Install tools and dependencies
- [ ] Choose master color palette
- [ ] Create 5-10 sample conversions for approval
- [ ] Review samples with stakeholders

### Phase 2: High Priority Assets (Weeks 2-4)
- [ ] Convert all armor sets (~105 files)
- [ ] Convert all weapons (37 files)
- [ ] Convert all helmets (37 files)
- [ ] Convert all shields
- [ ] Convert character models
- [ ] Convert NPC models
- [ ] Convert mounts

### Phase 3: Item Icons (Weeks 5-8)
- [ ] Convert item icons in batches of 500
- [ ] Validate each batch before proceeding

### Phase 4: Effects & Polish (Weeks 9-10)
- [ ] Review and adjust effects
- [ ] Update UI elements
- [ ] Final QA pass

## ⚠️ Important Notes

### Before You Start

1. **Backup Everything**: Original assets are irreplaceable
   ```bash
   # All tools support --backup flag
   python tools/convert_to_pixel_art.py --backup [...]
   ```

2. **Test First**: Always test on a few files before batch conversion
   ```bash
   python tools/convert_to_pixel_art.py --preview [...]
   ```

3. **Manual Refinement**: Automated conversion is a starting point - manual editing in pixel art software is recommended for best results

### Quality Standards

All converted assets must:
- ✓ Maintain recognizability
- ✓ Use limited color palette (16-32 colors)
- ✓ Have hard edges (no anti-aliasing)
- ✓ Work correctly in-game
- ✓ Be smaller file size than originals
- ✓ Have consistent style with other assets

### Legal Compliance

- Pixel art style alone doesn't guarantee copyright safety
- Ensure designs differ significantly from potential copyrighted sources
- Document any inspiration sources
- Consider legal consultation for high-risk assets

## 🎓 Learning Resources

### Pixel Art Tutorials
- [Pixel Art Tutorial by Pedro Medeiros](https://blog.studiominiboss.com/pixelart)
- [Pixel Logic - A Guide to Pixel Art](https://michafrar.gumroad.com/l/pixel-logic)

### Recommended Software
- **[Aseprite](https://www.aseprite.org/)** ($19.99) - Professional pixel art editor
- **[GraphicsGale](https://graphicsgale.com/)** (Free) - Good alternative
- **[Piskel](https://www.piskelapp.com/)** (Free, web-based) - Simple online editor

### Color Palettes
- [Lospec Palette List](https://lospec.com/palette-list)
- [DB32 Palette](https://lospec.com/palette-list/dawnbringer-32) (Recommended)
- [AAP-64](https://lospec.com/palette-list/aap-64)

### Communities
- [r/PixelArt](https://www.reddit.com/r/PixelArt/)
- [Pixel Joint](http://pixeljoint.com/)
- Pixel Art Discord communities

## 📈 Tracking Progress

Check conversion progress at any time:

```bash
# Quick status
python tools/track_conversion.py --status

# Detailed report
python tools/track_conversion.py --report

# Export report
python tools/track_conversion.py --export progress_$(date +%Y%m%d).json
```

## 🐛 Troubleshooting

### Installation Issues

```bash
# If PIL/Pillow import fails
pip install --upgrade Pillow numpy

# If permission errors
chmod +x tools/*.py
```

### Conversion Issues

- **Blurry results**: Ensure game engine uses nearest-neighbor scaling
- **Wrong colors**: Adjust `--colors` parameter or edit manually
- **Large file sizes**: Reduce `--size` parameter or color count

See [tools/README.md](tools/README.md) for more troubleshooting tips.

## 📞 Support

For questions or issues:
1. Review documentation: [PIXEL_ART_CONVERSION_GUIDE.md](PIXEL_ART_CONVERSION_GUIDE.md)
2. Check tool help: `python tools/<tool>.py --help`
3. Open an issue in the repository

## 📝 License

This toolset is provided for the GameClient project. Original game assets remain under their original licenses/copyrights until converted.

---

**Estimated Timeline**: 8-10 weeks with 1 dedicated artist
**Estimated Cost**: $0 (in-house) or $5,000-$15,000 (outsourced)
**Tools Cost**: $0-$20 (Aseprite recommended at $19.99)
