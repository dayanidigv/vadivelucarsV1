#!/bin/bash

# Script to find and move the downloaded 3D model

echo "🔍 Searching for downloaded GLB file..."
echo ""

# Search in common download locations
SEARCH_PATHS=(
    ~/Downloads
    ~/Desktop
    /Users/daya/Downloads
    /Users/daya/Desktop
)

TARGET_DIR="/Users/daya/Daya/UI/dad/frontend/public/models"
TARGET_FILE="$TARGET_DIR/car-model.glb"

# Create target directory
mkdir -p "$TARGET_DIR"

# Search for GLB files
for path in "${SEARCH_PATHS[@]}"; do
    if [ -d "$path" ]; then
        echo "Searching in: $path"
        find "$path" -maxdepth 2 -name "*.glb" -o -name "*.gltf" 2>/dev/null | while read file; do
            echo "  Found: $file"
            filesize=$(du -h "$file" | cut -f1)
            echo "  Size: $filesize"
            echo ""
        done
    fi
done

echo "---"
echo "TARGET LOCATION: $TARGET_FILE"
echo ""
echo "📋 To move your file, run one of these commands:"
echo ""
echo "# If your file is in Downloads:"
echo "mv ~/Downloads/YOUR_FILE_NAME.glb \"$TARGET_FILE\""
echo ""
echo "# Or drag and drop the file to: $TARGET_DIR"
echo "# Then rename it to: car-model.glb"
