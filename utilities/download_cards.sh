#!/bin/bash
# Script to download card images from the Doomlings compendium

# Create output directory
mkdir -p "images/cards"

# Extract and download each card
echo "Extracting card data from HTML..."
grep -oP '<img alt="[^"]+" src="https://cdn\.prod\.website-files\.com/[^"]+" width="100" class="card-main">' docs/card_image_html_download.txt | \
while IFS= read -r line; do
    # Extract card name
    card_name=$(echo "$line" | sed -n 's/.*<img alt="\([^"]*\)".*/\1/p')

    # Extract URL
    url=$(echo "$line" | sed -n 's/.*src="\([^"]*\)".*/\1/p')

    # Create filename
    filename="images/cards/${card_name}.png"

    # Check if file already exists
    if [ -f "$filename" ]; then
        echo "⏭️  SKIP: $card_name (already exists)"
    else
        echo "📥 Downloading: $card_name"
        echo "   URL: $url"

        # Download with curl
        if curl -s -o "$filename" "$url"; then
            echo "   ✅ Saved to: $filename"
        else
            echo "   ❌ ERROR: Failed to download"
        fi
    fi
    echo ""
done

echo "============================================"
echo "Download complete!"
echo "============================================"
