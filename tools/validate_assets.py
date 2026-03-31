#!/usr/bin/env python3
"""
Asset Validation Tool

This script validates converted pixel art assets to ensure they meet quality guidelines.

Usage:
    # Validate single file
    python validate_assets.py --input path/to/asset.png

    # Validate directory
    python validate_assets.py --dir path/to/assets/

    # Check for missing backups
    python validate_assets.py --check-missing

    # Validate with strict rules
    python validate_assets.py --dir path/to/assets/ --strict
"""

import argparse
import os
import sys
from pathlib import Path
from collections import defaultdict

try:
    from PIL import Image
except ImportError:
    print("Error: PIL/Pillow not found.")
    print("Please install: pip install Pillow")
    sys.exit(1)


class AssetValidator:
    """Validates pixel art assets against quality guidelines"""

    def __init__(self, strict=False):
        self.strict = strict
        self.issues = []
        self.warnings = []
        self.validated = 0

    def validate_file(self, file_path):
        """
        Validate a single asset file

        Returns:
            dict with validation results
        """
        try:
            img = Image.open(file_path)

            result = {
                'path': str(file_path),
                'valid': True,
                'issues': [],
                'warnings': [],
                'info': {
                    'size': img.size,
                    'mode': img.mode,
                    'format': img.format,
                    'file_size': os.path.getsize(file_path)
                }
            }

            # Check 1: File size (pixel art should be relatively small)
            file_size_kb = result['info']['file_size'] / 1024
            if file_size_kb > 100:
                result['warnings'].append(f"Large file size: {file_size_kb:.1f}KB (pixel art usually <100KB)")

            # Check 2: Image dimensions (should be power of 2 or reasonable pixel art size)
            width, height = img.size
            if width > 512 or height > 512:
                result['warnings'].append(f"Large dimensions: {width}x{height} (pixel art usually ≤512px)")

            if width < 8 or height < 8:
                result['issues'].append(f"Very small dimensions: {width}x{height} (may be too small)")
                result['valid'] = False

            # Check 3: Color mode
            if img.mode not in ('RGB', 'RGBA', 'P', 'L'):
                result['issues'].append(f"Unusual color mode: {img.mode}")
                result['valid'] = False

            # Check 4: Format (should be PNG for pixel art)
            if img.format != 'PNG':
                result['warnings'].append(f"Non-PNG format: {img.format} (PNG recommended for pixel art)")

            # Check 5: Check for backup file
            backup_path = Path(file_path).parent / f"{Path(file_path).stem}.original{Path(file_path).suffix}"
            result['info']['has_backup'] = backup_path.exists()

            if not result['info']['has_backup']:
                result['warnings'].append("No backup file found (.original.png)")

            # Check 6: Color count (pixel art should have limited colors)
            if img.mode in ('RGB', 'RGBA'):
                colors = img.getcolors(maxcolors=256)
                if colors:
                    num_colors = len(colors)
                    result['info']['num_colors'] = num_colors

                    if num_colors > 64:
                        result['warnings'].append(f"High color count: {num_colors} (pixel art usually ≤64 colors)")
                else:
                    # More than 256 colors
                    result['warnings'].append("More than 256 colors (pixel art usually has limited palette)")

            # Check 7: Check for anti-aliasing (not desired in pixel art)
            # This is a simplified check - looks for semi-transparent pixels
            if img.mode == 'RGBA':
                # Use tobytes() instead of deprecated getdata()
                import numpy as np
                pixels_array = np.array(img)
                alpha_channel = pixels_array[:, :, 3]
                semi_transparent = np.sum((alpha_channel > 0) & (alpha_channel < 255))
                total_pixels = alpha_channel.size
                semi_transparent_ratio = semi_transparent / total_pixels if total_pixels > 0 else 0

                if semi_transparent_ratio > 0.05:  # More than 5% semi-transparent
                    result['warnings'].append(f"Possible anti-aliasing detected ({semi_transparent_ratio*100:.1f}% semi-transparent pixels)")

            # Strict mode checks
            if self.strict:
                if width > 256 or height > 256:
                    result['issues'].append(f"Strict: Dimensions exceed 256px ({width}x{height})")
                    result['valid'] = False

                if file_size_kb > 50:
                    result['issues'].append(f"Strict: File size exceeds 50KB ({file_size_kb:.1f}KB)")
                    result['valid'] = False

            # Accumulate results
            self.issues.extend(result['issues'])
            self.warnings.extend(result['warnings'])
            self.validated += 1

            return result

        except Exception as e:
            return {
                'path': str(file_path),
                'valid': False,
                'issues': [f"Error: {str(e)}"],
                'warnings': [],
                'info': {}
            }

    def validate_directory(self, dir_path, pattern='*.png'):
        """Validate all assets in a directory"""
        path = Path(dir_path)
        files = list(path.rglob(pattern))

        # Filter out backup files
        files = [f for f in files if '.original.' not in str(f)]

        print(f"Found {len(files)} files to validate")
        print()

        results = []
        for i, file_path in enumerate(files, 1):
            print(f"[{i}/{len(files)}] Validating {file_path.name}...", end=' ')

            result = self.validate_file(file_path)

            if result['valid'] and not result['warnings']:
                print("✓")
            elif result['valid'] and result['warnings']:
                print(f"⚠ {len(result['warnings'])} warnings")
            else:
                print(f"✗ {len(result['issues'])} issues")

            results.append(result)

        return results

    def print_summary(self, results):
        """Print validation summary"""
        valid_count = sum(1 for r in results if r['valid'])
        warning_count = sum(len(r['warnings']) for r in results)
        issue_count = sum(len(r['issues']) for r in results)

        print("\n" + "="*60)
        print("VALIDATION SUMMARY")
        print("="*60)
        print(f"\nTotal files validated: {len(results)}")
        print(f"  ✓ Valid: {valid_count}")
        print(f"  ✗ Invalid: {len(results) - valid_count}")
        print(f"  ⚠ Total warnings: {warning_count}")
        print(f"  ✗ Total issues: {issue_count}")

        # List files with issues
        if issue_count > 0:
            print("\n" + "-"*60)
            print("FILES WITH ISSUES:")
            print("-"*60)
            for result in results:
                if result['issues']:
                    print(f"\n{result['path']}:")
                    for issue in result['issues']:
                        print(f"  ✗ {issue}")

        # List files with warnings
        if warning_count > 0 and issue_count == 0:
            print("\n" + "-"*60)
            print("FILES WITH WARNINGS:")
            print("-"*60)
            for result in results:
                if result['warnings']:
                    print(f"\n{result['path']}:")
                    for warning in result['warnings']:
                        print(f"  ⚠ {warning}")

        print("\n" + "="*60 + "\n")

    def check_missing_backups(self, assets_root='assets'):
        """Check for assets without backup files"""
        path = Path(assets_root)
        png_files = list(path.rglob('*.png'))

        # Filter out backup files
        asset_files = [f for f in png_files if '.original.' not in str(f)]

        missing_backups = []
        for file_path in asset_files:
            backup_path = file_path.parent / f"{file_path.stem}.original{file_path.suffix}"
            if not backup_path.exists():
                missing_backups.append(file_path)

        print("\n" + "="*60)
        print("BACKUP FILES CHECK")
        print("="*60)
        print(f"\nTotal assets: {len(asset_files)}")
        print(f"Assets with backups: {len(asset_files) - len(missing_backups)}")
        print(f"Assets WITHOUT backups: {len(missing_backups)}")

        if missing_backups:
            print("\n" + "-"*60)
            print("ASSETS WITHOUT BACKUP FILES:")
            print("-"*60)
            print("(These files may be original assets that need conversion)")
            print()

            # Group by directory
            by_dir = defaultdict(list)
            for file_path in missing_backups:
                by_dir[file_path.parent].append(file_path.name)

            for dir_path in sorted(by_dir.keys()):
                print(f"\n{dir_path}:")
                for filename in sorted(by_dir[dir_path])[:10]:
                    print(f"  - {filename}")
                if len(by_dir[dir_path]) > 10:
                    print(f"  ... and {len(by_dir[dir_path]) - 10} more")

        print("\n" + "="*60 + "\n")

        return missing_backups


def main():
    parser = argparse.ArgumentParser(
        description='Validate pixel art assets',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    # Input options
    input_group = parser.add_mutually_exclusive_group()
    input_group.add_argument('--input', '-i', help='Input file to validate')
    input_group.add_argument('--dir', '-d', help='Directory to validate')
    input_group.add_argument('--check-missing', action='store_true',
                           help='Check for assets without backup files')

    # Validation options
    parser.add_argument('--strict', action='store_true',
                       help='Use strict validation rules')
    parser.add_argument('--pattern', default='*.png',
                       help='File pattern to match (default: *.png)')
    parser.add_argument('--assets-root', default='assets',
                       help='Root assets directory (default: assets)')

    args = parser.parse_args()

    # Create validator
    validator = AssetValidator(strict=args.strict)

    # Single file validation
    if args.input:
        if not os.path.exists(args.input):
            print(f"Error: File not found: {args.input}")
            return 1

        print(f"Validating {args.input}...")
        if args.strict:
            print("(Strict mode enabled)")
        print()

        result = validator.validate_file(args.input)

        # Print detailed result
        print("="*60)
        print(f"VALIDATION RESULT: {result['path']}")
        print("="*60)
        print(f"\nStatus: {'✓ VALID' if result['valid'] else '✗ INVALID'}")

        print("\nImage Info:")
        for key, value in result['info'].items():
            print(f"  {key}: {value}")

        if result['issues']:
            print("\nIssues:")
            for issue in result['issues']:
                print(f"  ✗ {issue}")

        if result['warnings']:
            print("\nWarnings:")
            for warning in result['warnings']:
                print(f"  ⚠ {warning}")

        print("="*60 + "\n")

        return 0 if result['valid'] else 1

    # Directory validation
    elif args.dir:
        if not os.path.exists(args.dir):
            print(f"Error: Directory not found: {args.dir}")
            return 1

        print(f"Validating directory: {args.dir}")
        if args.strict:
            print("(Strict mode enabled)")
        print(f"Pattern: {args.pattern}")
        print()

        results = validator.validate_directory(args.dir, args.pattern)
        validator.print_summary(results)

        # Return error code if any files invalid
        return 0 if all(r['valid'] for r in results) else 1

    # Check missing backups
    elif args.check_missing:
        missing = validator.check_missing_backups(args.assets_root)
        return 0

    else:
        parser.print_help()
        return 1


if __name__ == '__main__':
    sys.exit(main())
