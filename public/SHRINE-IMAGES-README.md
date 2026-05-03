# Shrine Images Guide

This guide explains how to create and add the 3-piece shrine frame images for the Merit Gacha application.

## Required Images

You need to create 3 PNG images with transparent backgrounds:

### 1. `shrine-top.png` (Roof)
- **Purpose**: The decorative roof/top of the shrine
- **Recommended size**: 800px wide × 200px tall
- **Design**: Traditional Thai shrine roof with ornate details
- **Transparency**: Background should be transparent
- **Usage**: Displayed once at the top with `bg-contain bg-bottom`

### 2. `shrine-mid.png` (Pillars/Body)
- **Purpose**: The repeating middle section with pillars
- **Recommended size**: 800px wide × 100-200px tall (will repeat vertically)
- **Design**: 
  - Two decorative pillars on the left and right edges
  - Center area should be transparent or minimal
  - The pattern should tile seamlessly when repeated vertically
- **Transparency**: Center area transparent to show form content
- **Usage**: Repeats vertically with `bg-repeat-y bg-contain`
- **Important**: Leave 80-120px of horizontal space in the center for form content

### 3. `shrine-base.png` (Base/Foundation)
- **Purpose**: The decorative base/foundation of the shrine
- **Recommended size**: 800px wide × 150px tall
- **Design**: Traditional Thai shrine base with ornate details
- **Transparency**: Background should be transparent
- **Usage**: Displayed once at the bottom with `bg-contain bg-top`

## Design Tips

### Color Palette
- Gold/Yellow accents: `#EAB308`, `#F59E0B`
- Dark wood tones: `#78350F`, `#92400E`
- Red accents: `#DC2626`, `#B91C1C`
- Use gradients for depth

### Style Guidelines
- Traditional Thai architecture elements
- Ornate decorative patterns
- Symmetrical design
- Gold leaf effects
- Carved wood textures

### Technical Requirements
- **Format**: PNG with transparency
- **Color mode**: RGBA
- **Resolution**: At least 800px wide for desktop
- **File size**: Keep under 500KB each for performance
- **Seamless tiling**: The middle piece must tile perfectly

## Placement

Place all three images in the `public` folder:
```
merit-gacha/
  public/
    shrine-top.png
    shrine-mid.png
    shrine-base.png
```

## Testing

After adding the images:
1. Start the development server: `npm run dev`
2. Navigate to `/shrine`
3. Check that:
   - The roof appears at the top
   - The pillars repeat seamlessly as the form expands
   - The base appears at the bottom
   - Form content is visible between the pillars

## Fallback

If you don't have custom images yet, the form will still work with the current styling. The shrine frame is an enhancement that adds visual appeal.

## Creating Placeholder Images

For testing, you can create simple placeholder images:

### Using Figma/Photoshop:
1. Create a new 800×200px canvas with transparent background
2. Draw two rectangles on left and right edges (pillars)
3. Add decorative elements
4. Export as PNG with transparency

### Using AI Image Generators:
Prompt example: "Traditional Thai shrine architectural element, ornate gold and red decorations, transparent background, top view, PNG"

## Example Structure

```
┌─────────────────────────┐
│   shrine-top.png        │ ← Roof (fixed height)
├─────────────────────────┤
│ │                     │ │
│ │   Form Content      │ │ ← shrine-mid.png (repeats)
│ │   - Textbox         │ │
│ │   - Image Upload    │ │
│ │   - Submit Button   │ │
│ │                     │ │
├─────────────────────────┤
│   shrine-base.png       │ ← Base (fixed height)
└─────────────────────────┘
```

## Need Help?

If you need help creating these images, consider:
- Hiring a designer on Fiverr or Upwork
- Using Midjourney or DALL-E for AI-generated images
- Finding free Thai architectural elements on sites like Freepik
- Commissioning a Thai artist for authentic designs
