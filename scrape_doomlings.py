import os
import json
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

BASE_URL = "https://www.doomlings.com"
COMPENDIUM_URL = "https://www.doomlings.com/pages/compendium"

# Output folders
IMAGE_DIR = "doomlings_images"
DATA_FILE = "doomlings_cards.json"

os.makedirs(IMAGE_DIR, exist_ok=True)

def get_soup(url):
    r = requests.get(url)
    r.raise_for_status()
    return BeautifulSoup(r.text, "html.parser")

print("Fetching compendium page...")
main_soup = get_soup(COMPENDIUM_URL)

# The card boxes are dynamically loaded,
# but they appear in HTML under <a href="/products/...">
card_links = []

for a in main_soup.find_all("a", href=True):
    href = a["href"]
    if "/products/" in href and "classic" in href.lower():
        # Filter only base game cards
        card_links.append(urljoin(BASE_URL, href))

# Remove duplicates
card_links = list(dict.fromkeys(card_links))

print(f"Found {len(card_links)} base game card pages.")

cards = []

def download_image(url, name):
    filename = name.replace(" ", "_").lower() + ".jpg"
    filepath = os.path.join(IMAGE_DIR, filename)

    try:
        img_data = requests.get(url).content
        with open(filepath, "wb") as f:
            f.write(img_data)
        return filename
    except:
        return None


for link in card_links:
    print("Scraping:", link)
    soup = get_soup(link)

    # Try to extract card name
    name_tag = soup.find("h1")
    name = name_tag.text.strip() if name_tag else "Unknown"

    # Extract image
    img_tag = soup.find("img", {"src": True})
    img_url = None
    if img_tag:
        img_url = urljoin(BASE_URL, img_tag["src"])

    saved_image_name = None
    if img_url:
        print("  Downloading image...")
        saved_image_name = download_image(img_url, name)

    # Extract card info blocks
    info = {"Name": name}

    detail_blocks = soup.find_all("div", class_="rte")
    card_text = []

    for block in detail_blocks:
        text = block.get_text("\n").strip()
        if text:
            card_text.append(text)

    info["Text"] = "\n\n".join(card_text)
    info["Image"] = saved_image_name

    cards.append(info)

# Save JSON
with open(DATA_FILE, "w", encoding="utf8") as f:
    json.dump(cards, f, indent=2, ensure_ascii=False)

print(f"\nDone! Saved {len(cards)} cards.")
print(f"Images saved to: {IMAGE_DIR}/")
print(f"Metadata saved to: {DATA_FILE}")
