#!/usr/bin/env python3
"""
Script to extract card images from the Doomlings compendium HTML
and download them to the images/cards/ folder
"""

import re
import urllib.request
import urllib.parse
import os
from pathlib import Path

# Read the HTML file
html_file = Path(__file__).parent / 'docs' / 'card_image_html_download.txt'
with open(html_file, 'r', encoding='utf-8') as f:
    html_content = f.read()

# Extract all card-main images with pattern: <img alt="CARD NAME" src="CDN_URL" width="100" class="card-main">
pattern = r'<img alt="([^"]+)" src="(https://cdn\.prod\.website-files\.com/[^"]+)" width="100" class="card-main">'
matches = re.findall(pattern, html_content)

print(f"Found {len(matches)} card images in the HTML file\n")

# Create output directory if it doesn't exist
output_dir = Path(__file__).parent / 'images' / 'cards'
output_dir.mkdir(parents=True, exist_ok=True)

# Download each card image
downloaded = 0
skipped = 0
errors = 0

for card_name, cdn_url in matches:
    # Create filename from card name
    # The URL already has the proper encoding, we just need the filename
    filename = f"{card_name}.png"
    output_path = output_dir / filename

    # Skip if already exists
    if output_path.exists():
        print(f"⏭️  SKIP: {card_name} (already exists)")
        skipped += 1
        continue

    try:
        print(f"📥 Downloading: {card_name}")
        print(f"   URL: {cdn_url}")

        # Download the image
        urllib.request.urlretrieve(cdn_url, output_path)
        downloaded += 1
        print(f"   ✅ Saved to: {output_path}")

    except Exception as e:
        print(f"   ❌ ERROR: {e}")
        errors += 1

    print()

print("=" * 60)
print(f"Download Summary:")
print(f"  Total cards found: {len(matches)}")
print(f"  Downloaded: {downloaded}")
print(f"  Skipped (already exist): {skipped}")
print(f"  Errors: {errors}")
print("=" * 60)

# List all unique card names
print("\nCard names extracted:")
for i, (card_name, _) in enumerate(matches, 1):
    print(f"  {i:3d}. {card_name}")
