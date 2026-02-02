#!/bin/bash

# Image Optimization Script for Vadivelu Cars Landing Page
# Uses macOS native sips tool to convert PNG/JPG to WebP
# Run: chmod +x scripts/optimize-images.sh && ./scripts/optimize-images.sh

set -e

echo "🎨 Vadivelu Cars - Image Optimization"
echo "====================================="
echo ""

# Check if webp support is available (requires libwebp)
if ! command -v cwebp &> /dev/null; then
    echo "⚠️  cwebp not found, installing libwebp..."
    if command -v brew &> /dev/null; then
        brew install webp
    else
        echo "❌ Homebrew not found. Please install libwebp manually."
        exit 1
    fi
fi

# Create output directory
OUTPUT_DIR="public/assets/images/optimized"
mkdir -p "$OUTPUT_DIR"

echo "📁 Output directory: $OUTPUT_DIR"
echo ""

# Initialize counters
TOTAL_ORIGINAL=0
TOTAL_OPTIMIZED=0
FILE_COUNT=0

# Function to convert image to WebP
optimize_image() {
    local input_file="$1"
    local base_name=$(basename "$input_file")
    local name_no_ext="${base_name%.*}"
    local ext="${base_name##*.}"
    
    # Sanitize filename
    local sanitized_name=$(echo "$name_no_ext" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//')
    
    # Determine output name based on file type
    if [[ "$base_name" =~ (Pattern|Background|texture|Animated) ]]; then
        output_name="bg-${sanitized_name}.webp"
        quality=80
    else
        output_name="icon-${sanitized_name}.webp"
        quality=85
    fi
    
    local output_file="$OUTPUT_DIR/$output_name"
    
    # Get original size
    local original_size=$(stat -f%z "$input_file")
    TOTAL_ORIGINAL=$((TOTAL_ORIGINAL + original_size))
    
    # Convert to WebP
    cwebp -q $quality "$input_file" -o "$output_file" 2>/dev/null
    
    # Get optimized size
    local optimized_size=$(stat -f%z "$output_file")
    TOTAL_OPTIMIZED=$((TOTAL_OPTIMIZED + optimized_size))
    
    # Calculate savings
    local savings=$(( (original_size - optimized_size) * 100 / original_size ))
    
    echo "✅ $base_name → $output_name"
    echo "   $(numfmt --to=iec --suffix=B $original_size) → $(numfmt --to=iec --suffix=B $optimized_size) ($savings% smaller)"
    
    FILE_COUNT=$((FILE_COUNT + 1))
}

echo "📊 Processing images from public/assets/images/AI/"
echo ""

# Process all PNG and JPG files in AI directory
find public/assets/images/AI -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" \) | while read -r file; do
    optimize_image "$file"
done

echo ""
echo "✨ Optimization Complete!"
echo "========================"
echo ""

# Summary
TOTAL_SAVINGS=$(( (TOTAL_ORIGINAL - TOTAL_OPTIMIZED) * 100 / TOTAL_ORIGINAL ))

echo "📊 Summary:"
echo "  Files processed:  $FILE_COUNT"
echo "  Original size:    $(numfmt --to=iec --suffix=B $TOTAL_ORIGINAL)"
echo "  Optimized size:   $(numfmt --to=iec --suffix=B $TOTAL_OPTIMIZED)"
echo "  Total savings:    $TOTAL_SAVINGS%"
echo ""
echo "🚀 Next Steps:"
echo "  1. Check optimized images: open $OUTPUT_DIR"
echo "  2. Update image paths in components to use .webp files"
echo "  3. Add <picture> tags with PNG fallback for older browsers"
echo ""
