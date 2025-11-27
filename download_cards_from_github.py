import json
import requests
import pandas as pd
from io import BytesIO

# GitHub raw file URL for the DoomPy cards Excel file
GITHUB_CARDS_URL = "https://raw.githubusercontent.com/azabicki/DoomPy/main/doompy/files/cards.xlsx"

# Output file
DATA_FILE = "doomlings_cards.json"

print("Downloading card data from GitHub...")
try:
    response = requests.get(GITHUB_CARDS_URL)
    response.raise_for_status()

    print("Parsing Excel file...")
    # Read Excel file from bytes
    excel_data = pd.read_excel(BytesIO(response.content))

    # Convert to list of dictionaries
    cards = excel_data.to_dict('records')

    # Clean up NaN values
    for card in cards:
        for key, value in card.items():
            if pd.isna(value):
                card[key] = None

    print(f"Found {len(cards)} cards in the dataset.")

    # Save to JSON
    with open(DATA_FILE, "w", encoding="utf8") as f:
        json.dump(cards, f, indent=2, ensure_ascii=False)

    print(f"\nSuccess! Saved {len(cards)} cards to {DATA_FILE}")

    # Print a sample card
    if cards:
        print("\nSample card:")
        print(json.dumps(cards[0], indent=2))

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
