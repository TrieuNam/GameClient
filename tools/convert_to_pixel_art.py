#!/usr/bin/env python3
"""
Pixel Art Conversion Tool

This script helps convert game assets to pixel art style using various techniques.
Note: This provides a starting point - manual refinement is still recommended for best results.

Usage:
    # Convert single file
    python convert_to_pixel_art.py --input path/to/image.png --output path/to/output.png --size 64 --colors 32

    # Batch convert directory
    python convert_to_pixel_art.py --input-dir path/to/dir/ --output-dir path/to/output/ --size 64 --colors 32 --backup

    # Preview mode (doesn't save, just shows stats)
    python convert_to_pixel_art.py --input path/to/image.png --preview
"""

import argparse
import os
import sys
import json
from pathlib import Path
from datetime import datetime

try:
    from PIL import Image, ImageDraw
    import numpy as np
except ImportError:
    print("Error: Required libraries not found.")
    print("Please install dependencies:")
    print("  pip install Pillow numpy")
    sys.exit(1)


class PixelArtConverter:
    """Converts images to pixel art style"""

    def __init__(self, target_size=64, num_colors=32, backup=True):
        self.target_size = target_size
        self.num_colors = num_colors
        self.backup = backup
        self.conversion_log = []

    def convert_image(self, input_path, output_path=None):
        """
        Convert a single image to pixel art style

        Args:
            input_path: Path to input image
            output_path: Path to save output (None for preview mode)

        Returns:
            dict with conversion info
        """
        try:
            # Load image
            img = Image.open(input_path)
            original_size = img.size
            original_mode = img.mode

            # Preserve alpha channel if present
            has_alpha = img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info)

            # Convert to RGBA if has alpha, otherwise RGB
            if has_alpha:
                img = img.convert('RGBA')
            else:
                img = img.convert('RGB')

            # Step 1: Resize to target pixel size using nearest neighbor (no smoothing)
            # Calculate aspect ratio to maintain proportions
            aspect_ratio = img.size[0] / img.size[1]

            if aspect_ratio > 1:
                new_width = self.target_size
                new_height = int(self.target_size / aspect_ratio)
            else:
                new_height = self.target_size
                new_width = int(self.target_size * aspect_ratio)

            # Ensure minimum size of 1 pixel
            new_width = max(1, new_width)
            new_height = max(1, new_height)

            # Resize using nearest neighbor (NEAREST) for pixel art effect
            img_small = img.resize((new_width, new_height), Image.Resampling.NEAREST)

            # Step 2: Reduce colors using posterization
            if has_alpha:
                # Split alpha channel
                r, g, b, a = img_small.split()

                # Reduce colors in RGB channels
                rgb = Image.merge('RGB', (r, g, b))
                rgb = self._reduce_colors(rgb, self.num_colors)

                # Merge back with alpha
                r, g, b = rgb.split()
                img_small = Image.merge('RGBA', (r, g, b, a))
            else:
                img_small = self._reduce_colors(img_small, self.num_colors)

            # Step 3: Scale back up to reasonable size (optional, for display)
            # Keep it small for true pixel art, or scale to original size
            scale_factor = max(original_size[0] // new_width, original_size[1] // new_height, 1)
            scale_factor = min(scale_factor, 4)  # Don't scale too much

            final_width = new_width * scale_factor
            final_height = new_height * scale_factor
            img_final = img_small.resize((final_width, final_height), Image.Resampling.NEAREST)

            # Backup original if requested and output path provided
            if self.backup and output_path:
                backup_path = str(Path(output_path).parent / f"{Path(input_path).stem}.original{Path(input_path).suffix}")
                if not os.path.exists(backup_path):
                    img_original = Image.open(input_path)
                    img_original.save(backup_path)

            # Save converted image
            if output_path:
                # Ensure output directory exists
                os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else '.', exist_ok=True)
                img_final.save(output_path, 'PNG', optimize=True)

            # Get file sizes
            original_file_size = os.path.getsize(input_path)
            converted_file_size = os.path.getsize(output_path) if output_path and os.path.exists(output_path) else 0

            info = {
                'input': str(input_path),
                'output': str(output_path) if output_path else 'preview',
                'original_size': original_size,
                'pixel_size': (new_width, new_height),
                'final_size': (final_width, final_height),
                'original_file_size': original_file_size,
                'converted_file_size': converted_file_size,
                'compression_ratio': f"{(1 - converted_file_size/original_file_size)*100:.1f}%" if converted_file_size > 0 else "N/A",
                'status': 'success'
            }

            self.conversion_log.append(info)
            return info

        except Exception as e:
            error_info = {
                'input': str(input_path),
                'output': str(output_path) if output_path else 'preview',
                'status': 'error',
                'error': str(e)
            }
            self.conversion_log.append(error_info)
            return error_info

    def _reduce_colors(self, img, num_colors):
        """Reduce number of colors in image using quantization"""
        # Convert to P mode with limited palette
        img_quantized = img.quantize(colors=num_colors, method=Image.Quantize.MEDIANCUT)
        # Convert back to RGB/RGBA
        return img_quantized.convert(img.mode)

    def batch_convert(self, input_dir, output_dir, pattern='*.png'):
        """
        Convert all images in a directory

        Args:
            input_dir: Input directory path
            output_dir: Output directory path
            pattern: File pattern to match (default: *.png)
        """
        input_path = Path(input_dir)
        output_path = Path(output_dir)

        # Find all matching files
        files = list(input_path.rglob(pattern))

        print(f"Found {len(files)} files to convert")

        for i, file_path in enumerate(files, 1):
            # Calculate relative path to maintain directory structure
            rel_path = file_path.relative_to(input_path)
            output_file = output_path / rel_path

            print(f"[{i}/{len(files)}] Converting {file_path.name}...", end=' ')

            result = self.convert_image(str(file_path), str(output_file))

            if result['status'] == 'success':
                print(f"✓ {result['pixel_size'][0]}x{result['pixel_size'][1]} pixels, {result['compression_ratio']} smaller")
            else:
                print(f"✗ Error: {result['error']}")

        return self.conversion_log

    def save_log(self, log_path='conversion_log.json'):
        """Save conversion log to JSON file"""
        with open(log_path, 'w') as f:
            json.dump({
                'timestamp': datetime.now().isoformat(),
                'settings': {
                    'target_size': self.target_size,
                    'num_colors': self.num_colors,
                    'backup': self.backup
                },
                'conversions': self.conversion_log
            }, f, indent=2)


def main():
    parser = argparse.ArgumentParser(
        description='Convert game assets to pixel art style',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Convert single file
  %(prog)s --input weapon.png --output weapon_pixel.png --size 64 --colors 32

  # Batch convert directory
  %(prog)s --input-dir assets/actors/armor/ --output-dir assets/actors/armor/ --size 64 --colors 32 --backup

  # Preview mode (no output)
  %(prog)s --input weapon.png --preview
        """
    )

    # Input options
    input_group = parser.add_mutually_exclusive_group(required=True)
    input_group.add_argument('--input', '-i', help='Input image file')
    input_group.add_argument('--input-dir', '-d', help='Input directory for batch conversion')

    # Output options
    parser.add_argument('--output', '-o', help='Output image file (for single file conversion)')
    parser.add_argument('--output-dir', help='Output directory (for batch conversion)')

    # Conversion parameters
    parser.add_argument('--size', '-s', type=int, default=64,
                       help='Target pixel size (default: 64)')
    parser.add_argument('--colors', '-c', type=int, default=32,
                       help='Number of colors in palette (default: 32)')
    parser.add_argument('--backup', '-b', action='store_true',
                       help='Backup original files as .original.png')

    # Other options
    parser.add_argument('--preview', '-p', action='store_true',
                       help='Preview mode - show info without saving')
    parser.add_argument('--pattern', default='*.png',
                       help='File pattern for batch conversion (default: *.png)')
    parser.add_argument('--log', default='conversion_log.json',
                       help='Path to save conversion log (default: conversion_log.json)')

    args = parser.parse_args()

    # Validate arguments
    if args.input_dir and not args.output_dir and not args.preview:
        parser.error("--input-dir requires --output-dir (unless using --preview)")

    # Create converter
    converter = PixelArtConverter(
        target_size=args.size,
        num_colors=args.colors,
        backup=args.backup
    )

    # Single file conversion
    if args.input:
        if not os.path.exists(args.input):
            print(f"Error: Input file not found: {args.input}")
            return 1

        output_path = args.output if not args.preview else None

        print(f"Converting {args.input}...")
        print(f"Settings: {args.size}x{args.size} pixels, {args.colors} colors")

        result = converter.convert_image(args.input, output_path)

        if result['status'] == 'success':
            print(f"\n✓ Conversion successful!")
            print(f"  Original size: {result['original_size'][0]}x{result['original_size'][1]} ({result['original_file_size']} bytes)")
            print(f"  Pixel size: {result['pixel_size'][0]}x{result['pixel_size'][1]}")
            print(f"  Final size: {result['final_size'][0]}x{result['final_size'][1]} ({result['converted_file_size']} bytes)")
            print(f"  Compression: {result['compression_ratio']}")
            if output_path:
                print(f"  Saved to: {output_path}")
        else:
            print(f"\n✗ Conversion failed: {result['error']}")
            return 1

    # Batch conversion
    elif args.input_dir:
        if not os.path.exists(args.input_dir):
            print(f"Error: Input directory not found: {args.input_dir}")
            return 1

        print(f"Batch converting {args.input_dir}")
        print(f"Settings: {args.size}x{args.size} pixels, {args.colors} colors")
        print(f"Pattern: {args.pattern}")
        print(f"Output: {args.output_dir if not args.preview else 'preview mode'}")
        print()

        results = converter.batch_convert(
            args.input_dir,
            args.output_dir if not args.preview else args.input_dir,
            args.pattern
        )

        # Print summary
        successful = sum(1 for r in results if r['status'] == 'success')
        failed = len(results) - successful

        print(f"\n{'='*60}")
        print(f"Conversion complete: {successful} successful, {failed} failed")

        if not args.preview:
            print(f"Log saved to: {args.log}")
            converter.save_log(args.log)

    return 0


if __name__ == '__main__':
    sys.exit(main())
