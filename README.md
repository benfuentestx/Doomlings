# Doomlings Card Database

This repository contains card data and instructions for the Doomlings card game.

## Contents

### Documentation
- **`DOOMLINGS_INSTRUCTIONS.md`** - Game rules and how to play
- **`ANDROID_DOWNLOAD_GUIDE.md`** - 📱 Step-by-step guide for downloading card images on Android
- **`README.md`** - This file

### Card Data
- **`doomlings_cards.json`** - Complete database of 337 cards with attributes
- **`card_image_urls.txt`** - List of all 337 card page URLs

### Download Scripts
- **`download_card_images.py`** - Automated script to download all card images
- **`download_cards_from_github.py`** - Script to download card data from GitHub
- **`browser_download_solution.html`** - Browser-based bookmarklet and tools
- **`scrape_doomlings.py`** - Reference web scraping script (requires direct web access)

## Card Data

The card database includes **337 cards** from multiple editions:

### By Game Edition
- **Classic**: 113 cards
- **Overlush**: 141 cards
- **Dinolings Expansion**: 17 cards
- **Mythlings Expansion**: 18 cards
- **Techlings Expansion**: 20 cards
- **Special Edition**: 18 cards
- **Multi-Color**: 10 cards

### By Color
- Colorless: 70 cards
- Purple: 64 cards
- Red: 61 cards
- Green: 60 cards
- Blue: 58 cards
- Multi-color combinations: 24 cards

### Card Attributes

Each card in the JSON includes:
- `trait` - Card name
- `color` - Card color(s)
- `face` - Point value
- `game` - Edition (Classic, Overlush, etc.)
- `n_cards` - Quantity in deck
- `in_game` - Whether card is active ("yes"/"no")
- Various effect properties (dominant, action, persistent, attachment, etc.)

## Card Artwork

### 📱 **Android Users: See [ANDROID_DOWNLOAD_GUIDE.md](ANDROID_DOWNLOAD_GUIDE.md) for step-by-step instructions!**

The card artwork is **not currently included** in this repository due to:
1. Access restrictions on the official Doomlings website (403 Forbidden errors in automated environments)
2. Copyright considerations
3. Network/proxy limitations

### Download Solutions Available

**Multiple options are provided** to download all 337 card images:

1. **`download_card_images.py`** - Automated Python script (works in Termux on Android)
2. **`browser_download_solution.html`** - Browser-based bookmarklet and tools
3. **`card_image_urls.txt`** - List of all 337 card page URLs

**→ Android users**: See **[ANDROID_DOWNLOAD_GUIDE.md](ANDROID_DOWNLOAD_GUIDE.md)** for detailed instructions

**→ Desktop users**: Run `python download_card_images.py` in an unrestricted environment

### Other Options for Obtaining Card Images

If you have access to Tabletop Simulator, you can extract card images from the official mods:

1. **Tabletop Simulator Workshop Mods**:
   - [Doomlings (Original)](https://steamcommunity.com/sharedfiles/filedetails/?id=2788896584)
   - [Doomlings 2.0 (All Expansions)](https://steamcommunity.com/sharedfiles/filedetails/?id=3151925153)

2. **Extraction Process**:
   - Subscribe to the mod in Steam Workshop
   - Load the mod in Tabletop Simulator
   - Images are downloaded to: `Documents/My Games/Tabletop Simulator/Images/`

3. **Manual Download**:
   - Visit the [Official Doomlings Compendium](https://www.doomlings.com/pages/compendium)
   - Right-click and save individual card images
   - Note: This is time-consuming for 337 cards

### Future Improvements

If you're able to run the extraction in an unrestricted environment:
- The `scrape_doomlings.py` script can be modified to work
- Images should be saved to `doomlings_images/` directory
- Consider adding image file paths to the JSON data structure

## Data Source

Card data sourced from the [DoomPy GitHub repository](https://github.com/azabicki/DoomPy) by azabicki, which maintains card data for the Doomlings Live-Scoring application.

## Official Resources

- **Official Website**: https://www.doomlings.com/
- **Compendium**: https://www.doomlings.com/pages/compendium
- **How to Play**: https://www.doomlings.com/pages/how-to-play
- **FAQ**: https://www.doomlings.com/pages/faq

## License

This repository contains game data for reference purposes. Doomlings is a trademark of its creators (Justus and Andrew Meyer). Card data is compiled from open source and publicly available information.
