# Downloading Card Images from Doomlings Compendium

This guide explains how to download card images from the official Doomlings website compendium for use in the browser-based game implementation.

## Overview

The Doomlings website maintains a card compendium at their official site. We can extract card image URLs from the HTML and download them locally. This process is useful for:
- Adding new expansion pack cards
- Updating existing card images
- Adding missing card images

## Prerequisites

- Bash shell (Git Bash on Windows, or native terminal on Mac/Linux)
- `curl` command (usually pre-installed)
- OR Python 3.x (optional alternative)

## Step-by-Step Process

### 1. Extract HTML from Doomlings Compendium

1. Navigate to the Doomlings card compendium page (specific URL varies by card type):
   - Dominant Traits
   - Various Traits (multiple pages)
   - Ages/Catastrophes

2. Open browser Developer Tools (F12)
3. Find the `<div role="list" class="collection-list w-dyn-items">` element
4. Copy the entire HTML content of this div
5. Save it to `docs/card_image_html_download.txt`

### 2. Run the Download Script

#### Option A: Using Bash Script (Recommended)

```bash
cd "F:/Claude Projects/Doomlings"
bash utilities/download_cards.sh
```

#### Option B: Using Python Script

```bash
cd "F:/Claude Projects/Doomlings"
python utilities/download_card_images.py
```

### 3. Verify Downloads

The script will:
- Extract card names and CDN URLs from the HTML
- Download images to `images/cards/`
- Skip cards that already exist
- Report download progress with ✅ for success, ⏭️ for skipped files

Example output:
```
📥 Downloading: ECHOLOCATION
   URL: https://cdn.prod.website-files.com/...
   ✅ Saved to: images/cards/ECHOLOCATION.png

⏭️  SKIP: IMMUNITY (already exists)
```

## How the Scripts Work

### HTML Pattern Recognition

The scripts look for this HTML pattern:
```html
<img alt="CARD NAME" src="https://cdn.prod.website-files.com/..." width="100" class="card-main">
```

### Extraction Process

1. **Regex Pattern**: `<img alt="[^"]+" src="https://cdn\.prod\.website-files\.com/[^"]+" width="100" class="card-main">`
2. **Parse**: Extracts card name from `alt` attribute and URL from `src` attribute
3. **Filename**: Creates `CARD NAME.png` in `images/cards/` directory
4. **Download**: Uses `curl` (bash) or `urllib` (python) to fetch the image

### File Naming

- Card names are used exactly as they appear in the HTML
- Filenames preserve spaces and special characters
- Examples:
  - `ECHOLOCATION.png`
  - `PACK BEHAVIOR.png`
  - `OPTIMISTIC NIHILISM.png`
  - `SWARM (2).png`

## Tips for Future Expansion Packs

### Organized Workflow

1. **Create a backup** of current `card_image_html_download.txt` before replacing it
2. **Process one page at a time** to track which cards come from which expansion
3. **Document new cards** by saving the output of each download run

### Handling Multiple Pages

If the compendium has pagination:

1. Download page 1 HTML → Save to `card_image_html_download.txt` → Run script
2. Download page 2 HTML → Overwrite `card_image_html_download.txt` → Run script again
3. Repeat for each page

The script automatically skips existing files, so running it multiple times is safe.

### Tracking New Cards

After downloading, you can check what was added:

```bash
# Count total images
cd images/cards
ls -1 | wc -l

# List recently added (by modification time)
ls -lt | head -20

# Find specific cards
ls -1 | grep "CARD_NAME"
```

## Troubleshooting

### Issue: "Python was not found"

Solution: Use the bash script instead, or install Python 3.x

### Issue: Missing images (404 errors)

This is expected - not all cards have images available on the CDN. The game handles missing images with a fallback placeholder.

### Issue: Wrong card names

The card names in the HTML might not match your `cards-data.js` exactly. You may need to rename files manually to match. Common differences:
- Capitalization
- Spaces vs underscores
- Special characters

### Issue: Download fails with curl error

Check your internet connection and verify the CDN URL is still valid. The Doomlings website may occasionally update their CDN structure.

## File Locations

```
F:/Claude Projects/Doomlings/
├── docs/
│   ├── card_image_html_download.txt    # HTML source (temporary)
│   └── downloading_card_images.md      # This guide
├── utilities/
│   ├── download_cards.sh               # Bash download script
│   └── download_card_images.py         # Python download script
└── images/
    └── cards/                          # Downloaded card images
        ├── ECHOLOCATION.png
        ├── IMMUNITY.png
        └── ...
```

## Advanced: Batch Processing

To process multiple HTML files at once:

```bash
# Save different pages to numbered files
docs/card_image_page1.txt
docs/card_image_page2.txt
docs/card_image_page3.txt

# Then run for each:
for page in docs/card_image_page*.txt; do
    cp "$page" docs/card_image_html_download.txt
    bash utilities/download_cards.sh
done
```

## Notes

- The scripts preserve the exact card names from the HTML
- Downloaded images are PNG format
- CDN URLs are from `cdn.prod.website-files.com`
- The scripts are idempotent (safe to run multiple times)
- No authentication required - images are publicly accessible

## Summary Stats from Initial Download

- **Page 1 (Dominant)**: 15 cards total, 8 new
- **Page 2 (Traits)**: 60 cards total, 20 new
- **Page 3 (Traits)**: 60 cards total, 27 new
- **Page 4 (Ages/Catastrophes)**: 37 cards total, 21 new
- **Total**: 172 unique cards processed, 76 new images downloaded
- **Final count**: 197 total card images in library
