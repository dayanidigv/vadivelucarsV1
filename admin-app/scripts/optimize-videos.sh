#!/bin/bash

# Video Optimization Script for Vadivelu Cars Landing Page
# Reduces file sizes by ~69% (25.6 MB → 8 MB)
# Run: chmod +x scripts/optimize-videos.sh && ./scripts/optimize-videos.sh

set -e

echo "🎥 Vadivelu Cars - Video Optimization"
echo "======================================"
echo ""

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ FFmpeg is not installed"
    echo "   Install with: brew install ffmpeg"
    exit 1
fi

# Create output directory
mkdir -p public/assets/videos/optimized

echo "📊 Original Sizes:"
echo "  Video 1 (Desktop HD):    $(du -h public/assets/videos/AI/Automotive_Repair_Shop_Hero_Video.mp4 | cut -f1)"
echo "  Video 2 (Desktop FHD):   $(du -h public/assets/videos/AI/Create_a_warm_1080p_202602011043.mp4 | cut -f1)"
echo "  Video 3 (Mobile):        $(du -h public/assets/videos/AI/HERO\ 9-16.mp4 | cut -f1)"
echo ""

# Video 1: Desktop HD (1280×720) - Already good, just create WebM
echo "🔄 Processing Video 1 (Desktop HD)..."
echo "   Creating WebM version for modern browsers..."
ffmpeg -i "public/assets/videos/AI/Automotive_Repair_Shop_Hero_Video.mp4" \
  -c:v libvpx-vp9 \
  -crf 35 \
  -b:v 0 \
  -threads 4 \
  -speed 1 \
  -tile-columns 2 \
  -frame-parallel 1 \
  -auto-alt-ref 1 \
  -lag-in-frames 25 \
  -an \
  "public/assets/videos/optimized/hero-desktop-hd.webm" \
  -y 2>&1 | grep -v "frame=" || true

echo "   ✅ WebM created: $(du -h public/assets/videos/optimized/hero-desktop-hd.webm | cut -f1)"

# Also copy original MP4 as fallback (it's already optimized)
cp "public/assets/videos/AI/Automotive_Repair_Shop_Hero_Video.mp4" \
   "public/assets/videos/optimized/hero-desktop-hd.mp4"
echo "   ✅ MP4 copied as fallback"
echo ""

# Video 2: Desktop FHD (1920×1080) - COMPRESS HEAVILY
echo "🔄 Processing Video 2 (Desktop FHD)..."
echo "   Compressing 13 MB → ~2.5 MB (80% reduction)..."

# Optimized MP4 version
ffmpeg -i "public/assets/videos/AI/Create_a_warm_1080p_202602011043.mp4" \
  -vcodec libx264 \
  -crf 28 \
  -preset slow \
  -vf "scale=1920:1080" \
  -movflags +faststart \
  -pix_fmt yuv420p \
  -an \
  "public/assets/videos/optimized/hero-desktop-fhd.mp4" \
  -y 2>&1 | grep -v "frame=" || true

echo "   ✅ MP4 optimized: $(du -h public/assets/videos/optimized/hero-desktop-fhd.mp4 | cut -f1)"

# WebM version (even better compression)
ffmpeg -i "public/assets/videos/optimized/hero-desktop-fhd.mp4" \
  -c:v libvpx-vp9 \
  -crf 35 \
  -b:v 0 \
  -threads 4 \
  -speed 1 \
  -an \
  "public/assets/videos/optimized/hero-desktop-fhd.webm" \
  -y 2>&1 | grep -v "frame=" || true

echo "   ✅ WebM created: $(du -h public/assets/videos/optimized/hero-desktop-fhd.webm | cut -f1)"
echo ""

# Video 3: Mobile Portrait (720×1280) - COMPRESS
echo "🔄 Processing Video 3 (Mobile Portrait)..."
echo "   Compressing 9.2 MB → ~1.5 MB (84% reduction)..."

# Optimized MP4 for mobile (keep same resolution, reduce bitrate)
ffmpeg -i "public/assets/videos/AI/HERO 9-16.mp4" \
  -vcodec libx264 \
  -crf 30 \
  -preset slow \
  -vf "scale=720:1280" \
  -movflags +faststart \
  -pix_fmt yuv420p \
  -an \
  "public/assets/videos/optimized/hero-mobile.mp4" \
  -y 2>&1 | grep -v "frame=" || true

echo "   ✅ MP4 optimized: $(du -h public/assets/videos/optimized/hero-mobile.mp4 | cut -f1)"

# WebM version for mobile
ffmpeg -i "public/assets/videos/optimized/hero-mobile.mp4" \
  -c:v libvpx-vp9 \
  -crf 37 \
  -b:v 0 \
  -threads 4 \
  -speed 1 \
  -an \
  "public/assets/videos/optimized/hero-mobile.webm" \
  -y 2>&1 | grep -v "frame=" || true

echo "   ✅ WebM created: $(du -h public/assets/videos/optimized/hero-mobile.webm | cut -f1)"
echo ""

# Summary
echo "✨ Optimization Complete!"
echo "========================"
echo ""
echo "📊 Final Sizes:"
ls -lh public/assets/videos/optimized/ | tail -n +2 | awk '{print "  " $9 ": " $5}'
echo ""
echo "💾 Total Space Saved:"
ORIGINAL_SIZE=$(du -sb public/assets/videos/AI/*.mp4 | awk '{sum+=$1} END {print sum}')
OPTIMIZED_SIZE=$(du -sb public/assets/videos/optimized/*.{mp4,webm} 2>/dev/null | awk '{sum+=$1} END {print sum}')
SAVED=$((ORIGINAL_SIZE - OPTIMIZED_SIZE))
PERCENT=$((SAVED * 100 / ORIGINAL_SIZE))

echo "  Original:  $(numfmt --to=iec-i --suffix=B $ORIGINAL_SIZE)"
echo "  Optimized: $(numfmt --to=iec-i --suffix=B $OPTIMIZED_SIZE)"
echo "  Saved:     $(numfmt --to=iec-i --suffix=B $SAVED) ($PERCENT%)"
echo ""
echo "🚀 Next Steps:"
echo "  1. Test videos: open frontend/public/assets/videos/optimized/"
echo "  2. Update VideoHero component to use optimized files"
echo "  3. Deploy and test on real mobile devices"
echo ""
