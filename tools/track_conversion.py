#!/usr/bin/env python3
"""
Asset Conversion Tracking Tool

This script tracks the progress of converting game assets to pixel art style.
It scans the assets directory and maintains a database of conversion status.

Usage:
    # Initialize tracking database
    python track_conversion.py --init

    # Show conversion status
    python track_conversion.py --status

    # Mark assets as converted
    python track_conversion.py --mark-converted path/to/asset.png

    # Show detailed report
    python track_conversion.py --report

    # Export tracking data
    python track_conversion.py --export tracking_report.json
"""

import argparse
import json
import os
import sys
from pathlib import Path
from datetime import datetime
from collections import defaultdict


class ConversionTracker:
    """Tracks conversion progress of game assets"""

    def __init__(self, assets_root='assets', db_path='conversion_tracking.json'):
        self.assets_root = Path(assets_root)
        self.db_path = db_path
        self.db = self._load_db()

    def _load_db(self):
        """Load tracking database"""
        if os.path.exists(self.db_path):
            with open(self.db_path, 'r') as f:
                return json.load(f)
        return {
            'initialized': datetime.now().isoformat(),
            'last_updated': datetime.now().isoformat(),
            'style_guide_version': '1.0',
            'assets': {},
            'categories': {}
        }

    def _save_db(self):
        """Save tracking database"""
        self.db['last_updated'] = datetime.now().isoformat()
        with open(self.db_path, 'w') as f:
            json.dump(self.db, f, indent=2)

    def scan_assets(self):
        """Scan assets directory and categorize files"""
        print("Scanning assets directory...")

        categories = {
            'armor': [],
            'weapon': [],
            'helmet': [],
            'shield': [],
            'npc': [],
            'ride': [],
            'role': [],
            'processed': [],
            'effects': [],
            'other': []
        }

        # Scan resources/actors
        actors_path = self.assets_root / 'resources' / 'actors'
        if actors_path.exists():
            for category in ['armor', 'weapon', 'helmet', 'shiled', 'npc', 'ride', 'role']:
                category_path = actors_path / category
                if category_path.exists():
                    for file_path in category_path.rglob('*.png'):
                        # Skip backup files
                        if '.original.' in str(file_path):
                            continue

                        rel_path = str(file_path.relative_to(self.assets_root))
                        cat_key = 'shield' if category == 'shiled' else category
                        categories[cat_key].append(rel_path)

        # Scan processed items
        processed_path = self.assets_root / 'resources' / 'processed'
        if processed_path.exists():
            for file_path in processed_path.rglob('*.png'):
                if '.original.' in str(file_path):
                    continue
                rel_path = str(file_path.relative_to(self.assets_root))
                categories['processed'].append(rel_path)

        # Scan effects
        for effect_base in ['resources/effect', 'res/effect']:
            effect_path = self.assets_root / effect_base
            if effect_path.exists():
                for file_path in effect_path.rglob('*.png'):
                    if '.original.' in str(file_path):
                        continue
                    rel_path = str(file_path.relative_to(self.assets_root))
                    categories['effects'].append(rel_path)

        # Update database with new assets
        for category, files in categories.items():
            for file_path in files:
                if file_path not in self.db['assets']:
                    self.db['assets'][file_path] = {
                        'category': category,
                        'status': 'pending',
                        'priority': self._get_priority(category),
                        'discovered': datetime.now().isoformat(),
                        'original_exists': self._check_backup_exists(file_path),
                        'notes': ''
                    }

        # Update category counts
        self.db['categories'] = {}
        for asset_path, asset_info in self.db['assets'].items():
            category = asset_info['category']
            status = asset_info['status']

            if category not in self.db['categories']:
                self.db['categories'][category] = {
                    'total': 0,
                    'pending': 0,
                    'in_progress': 0,
                    'completed': 0,
                    'skipped': 0
                }

            self.db['categories'][category]['total'] += 1
            self.db['categories'][category][status] += 1

        self._save_db()
        return categories

    def _get_priority(self, category):
        """Get priority level for category"""
        priority_map = {
            'armor': 1,
            'weapon': 1,
            'helmet': 1,
            'shield': 1,
            'role': 1,
            'npc': 1,
            'ride': 1,
            'processed': 2,
            'effects': 3,
            'other': 4
        }
        return priority_map.get(category, 4)

    def _check_backup_exists(self, asset_path):
        """Check if original backup exists for an asset"""
        full_path = self.assets_root / asset_path
        if not full_path.exists():
            return False

        backup_path = full_path.parent / f"{full_path.stem}.original{full_path.suffix}"
        return backup_path.exists()

    def mark_converted(self, asset_paths, status='completed'):
        """Mark assets as converted"""
        if isinstance(asset_paths, str):
            asset_paths = [asset_paths]

        for asset_path in asset_paths:
            # Convert to relative path if needed
            asset_path = str(asset_path)
            if asset_path.startswith(str(self.assets_root)):
                asset_path = str(Path(asset_path).relative_to(self.assets_root))

            if asset_path in self.db['assets']:
                self.db['assets'][asset_path]['status'] = status
                self.db['assets'][asset_path]['converted_date'] = datetime.now().isoformat()
                print(f"✓ Marked as {status}: {asset_path}")
            else:
                print(f"✗ Asset not found in database: {asset_path}")

        self._save_db()

    def get_status(self):
        """Get overall conversion status"""
        total = len(self.db['assets'])
        if total == 0:
            return {
                'total': 0,
                'pending': 0,
                'in_progress': 0,
                'completed': 0,
                'skipped': 0,
                'progress_percent': 0
            }

        status_counts = defaultdict(int)
        for asset_info in self.db['assets'].values():
            status_counts[asset_info['status']] += 1

        completed = status_counts['completed']
        progress_percent = (completed / total * 100) if total > 0 else 0

        return {
            'total': total,
            'pending': status_counts['pending'],
            'in_progress': status_counts['in_progress'],
            'completed': completed,
            'skipped': status_counts['skipped'],
            'progress_percent': progress_percent
        }

    def print_status(self):
        """Print status summary"""
        status = self.get_status()

        print("\n" + "="*60)
        print("PIXEL ART CONVERSION STATUS")
        print("="*60)
        print(f"\nOverall Progress: {status['completed']}/{status['total']} assets ({status['progress_percent']:.1f}%)")
        print(f"  ✓ Completed:    {status['completed']}")
        print(f"  ⧗ In Progress:  {status['in_progress']}")
        print(f"  ○ Pending:      {status['pending']}")
        print(f"  ⊘ Skipped:      {status['skipped']}")

        print("\n" + "-"*60)
        print("BY CATEGORY:")
        print("-"*60)

        # Sort by priority
        categories = sorted(
            self.db['categories'].items(),
            key=lambda x: self._get_priority(x[0])
        )

        for category, stats in categories:
            if stats['total'] == 0:
                continue

            progress = (stats['completed'] / stats['total'] * 100) if stats['total'] > 0 else 0
            priority = self._get_priority(category)
            priority_label = ['', 'HIGH', 'MEDIUM', 'LOW', 'OPTIONAL'][priority] if priority < 5 else 'OPTIONAL'

            print(f"\n{category.upper()} (Priority: {priority_label})")
            print(f"  Progress: {stats['completed']}/{stats['total']} ({progress:.1f}%)")
            print(f"  Pending: {stats['pending']} | In Progress: {stats['in_progress']} | Completed: {stats['completed']}")

        print("\n" + "="*60)
        print(f"Last updated: {self.db['last_updated']}")
        print("="*60 + "\n")

    def generate_report(self):
        """Generate detailed report"""
        report = {
            'generated': datetime.now().isoformat(),
            'summary': self.get_status(),
            'categories': self.db['categories'],
            'assets_by_status': defaultdict(list)
        }

        for asset_path, asset_info in self.db['assets'].items():
            report['assets_by_status'][asset_info['status']].append({
                'path': asset_path,
                'category': asset_info['category'],
                'priority': asset_info['priority']
            })

        return report

    def export_report(self, output_path):
        """Export detailed report to JSON"""
        report = self.generate_report()
        with open(output_path, 'w') as f:
            json.dump(report, f, indent=2)
        print(f"Report exported to: {output_path}")

    def list_pending(self, category=None, limit=20):
        """List pending assets"""
        pending = []
        for asset_path, asset_info in self.db['assets'].items():
            if asset_info['status'] == 'pending':
                if category is None or asset_info['category'] == category:
                    pending.append((asset_path, asset_info))

        # Sort by priority
        pending.sort(key=lambda x: x[1]['priority'])

        print(f"\nPending assets ({len(pending)} total):")
        print("-"*60)

        for i, (asset_path, asset_info) in enumerate(pending[:limit], 1):
            priority_label = ['', 'HIGH', 'MEDIUM', 'LOW'][asset_info['priority']] if asset_info['priority'] < 4 else 'OPTIONAL'
            print(f"{i}. [{priority_label}] {asset_path}")

        if len(pending) > limit:
            print(f"\n... and {len(pending) - limit} more")


def main():
    parser = argparse.ArgumentParser(
        description='Track pixel art conversion progress',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    parser.add_argument('--assets-root', default='assets',
                       help='Root directory of assets (default: assets)')
    parser.add_argument('--db', default='conversion_tracking.json',
                       help='Path to tracking database (default: conversion_tracking.json)')

    # Actions
    action_group = parser.add_mutually_exclusive_group()
    action_group.add_argument('--init', action='store_true',
                            help='Initialize tracking database by scanning assets')
    action_group.add_argument('--status', action='store_true',
                            help='Show conversion status')
    action_group.add_argument('--report', action='store_true',
                            help='Generate detailed report')
    action_group.add_argument('--export', metavar='FILE',
                            help='Export report to JSON file')
    action_group.add_argument('--mark-converted', metavar='PATH', nargs='+',
                            help='Mark asset(s) as converted')
    action_group.add_argument('--mark-in-progress', metavar='PATH', nargs='+',
                            help='Mark asset(s) as in progress')
    action_group.add_argument('--list-pending', action='store_true',
                            help='List pending assets')

    parser.add_argument('--category', help='Filter by category')
    parser.add_argument('--limit', type=int, default=20,
                       help='Limit number of results (default: 20)')

    args = parser.parse_args()

    # Create tracker
    tracker = ConversionTracker(assets_root=args.assets_root, db_path=args.db)

    # Execute action
    if args.init:
        print("Initializing conversion tracking...")
        categories = tracker.scan_assets()
        print("\nAssets discovered by category:")
        for category, files in categories.items():
            if files:
                print(f"  {category}: {len(files)} files")
        print(f"\nTracking database saved to: {args.db}")
        tracker.print_status()

    elif args.status:
        tracker.print_status()

    elif args.report:
        report = tracker.generate_report()
        print(json.dumps(report, indent=2))

    elif args.export:
        tracker.export_report(args.export)

    elif args.mark_converted:
        tracker.mark_converted(args.mark_converted, status='completed')
        tracker.print_status()

    elif args.mark_in_progress:
        tracker.mark_converted(args.mark_in_progress, status='in_progress')
        tracker.print_status()

    elif args.list_pending:
        tracker.list_pending(category=args.category, limit=args.limit)

    else:
        # Default: show status
        tracker.print_status()

    return 0


if __name__ == '__main__':
    sys.exit(main())
