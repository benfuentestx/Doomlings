#!/usr/bin/env python3
"""
Download Doomlings card images from worldofdoomlings.com

This script constructs URLs for each card based on the card data
and downloads the images.

NOTE: This script will NOT work in restricted proxy environments.
Run this on a local machine or unrestricted server.
"""

import json
import os
import time
import requests
from urllib.parse import quote

# Configuration
CARDS_JSON = "doomlings_cards.json"
OUTPUT_DIR = "doomlings_images"
BASE_URL = "https://www.worldofdoomlings.com/cards/"

# Create output directory
os.makedirs(OUTPUT_DIR, exist_ok=True)

def slugify(text):
    """Convert card name to URL slug"""
    return text.lower().replace(" ", "-").replace("'", "")

def get_card_image_url(card_name):
    """Construct the card page URL"""
    slug = slugify(card_name)
    return f"{BASE_URL}{slug}#"

def download_image_from_page(card_name, page_url):
    """
    Download card image from the card page.
    This would need to parse the HTML to find the actual image URL.
    """
    try:
        # Add headers to mimic a real browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Referer': 'https://www.worldofdoomlings.com/',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }

        # Get the page
        response = requests.get(page_url, headers=headers, timeout=10)
        response.raise_for_status()

        # Parse HTML to find image (would need BeautifulSoup)
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(response.text, 'html.parser')

        # Find the card image - adjust selector based on actual HTML structure
        # Common possibilities:
        img_tag = (
            soup.find('img', class_='card-image') or
            soup.find('img', {'alt': card_name}) or
            soup.find('div', class_='card').find('img') if soup.find('div', class_='card') else None or
            soup.find('img', src=True)  # Fallback to first image
        )

        if not img_tag or 'src' not in img_tag.attrs:
            print(f"  ❌ No image found for {card_name}")
            return None

        img_url = img_tag['src']

        # Handle relative URLs
        if img_url.startswith('//'):
            img_url = 'https:' + img_url
        elif img_url.startswith('/'):
            img_url = 'https://www.worldofdoomlings.com' + img_url

        # Download the actual image
        img_response = requests.get(img_url, headers=headers, timeout=10)
        img_response.raise_for_status()

        # Determine file extension
        content_type = img_response.headers.get('content-type', '')
        if 'png' in content_type:
            ext = 'png'
        elif 'jpeg' in content_type or 'jpg' in content_type:
            ext = 'jpg'
        elif 'webp' in content_type:
            ext = 'webp'
        else:
            ext = 'png'  # default

        # Save image
        safe_name = slugify(card_name)
        filename = f"{safe_name}.{ext}"
        filepath = os.path.join(OUTPUT_DIR, filename)

        with open(filepath, 'wb') as f:
            f.write(img_response.content)

        print(f"  ✅ Downloaded: {filename}")
        return filename

    except requests.exceptions.RequestException as e:
        print(f"  ❌ Error downloading {card_name}: {e}")
        return None
    except Exception as e:
        print(f"  ❌ Unexpected error for {card_name}: {e}")
        return None

def main():
    # Load card data
    print(f"Loading card data from {CARDS_JSON}...")
    with open(CARDS_JSON, 'r') as f:
        cards = json.load(f)

    print(f"Found {len(cards)} cards")
    print(f"Downloading images to {OUTPUT_DIR}/\n")

    # Track statistics
    successful = 0
    failed = 0
    skipped = 0

    # Create URL mapping file
    url_mapping = []

    for i, card in enumerate(cards, 1):
        card_name = card.get('trait', 'Unknown')

        # Skip cards not in game
        if card.get('in_game', 'yes').lower() != 'yes':
            skipped += 1
            continue

        print(f"[{i}/{len(cards)}] {card_name}")

        # Construct URL
        page_url = get_card_image_url(card_name)
        url_mapping.append({
            "card": card_name,
            "url": page_url
        })

        # Check if already downloaded
        safe_name = slugify(card_name)
        existing_files = [
            f"{safe_name}.png",
            f"{safe_name}.jpg",
            f"{safe_name}.webp"
        ]

        already_exists = any(
            os.path.exists(os.path.join(OUTPUT_DIR, fname))
            for fname in existing_files
        )

        if already_exists:
            print(f"  ⏭️  Already downloaded")
            successful += 1
            continue

        # Attempt download
        result = download_image_from_page(card_name, page_url)

        if result:
            successful += 1
            # Update card data with image filename
            card['image_file'] = result
        else:
            failed += 1

        # Be polite - don't hammer the server
        time.sleep(0.5)  # 500ms delay between requests

    # Save updated card data with image filenames
    output_json = "doomlings_cards_with_images.json"
    with open(output_json, 'w') as f:
        json.dump(cards, f, indent=2, ensure_ascii=False)

    # Save URL mapping
    with open("card_urls.json", 'w') as f:
        json.dump(url_mapping, f, indent=2, ensure_ascii=False)

    # Print summary
    print("\n" + "="*50)
    print("DOWNLOAD SUMMARY")
    print("="*50)
    print(f"Total cards: {len(cards)}")
    print(f"✅ Successful: {successful}")
    print(f"❌ Failed: {failed}")
    print(f"⏭️  Skipped (not in game): {skipped}")
    print(f"\nImages saved to: {OUTPUT_DIR}/")
    print(f"Updated card data: {output_json}")
    print(f"URL mapping saved to: card_urls.json")

if __name__ == "__main__":
    main()
