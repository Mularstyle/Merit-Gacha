# Easter Egg Feature: Shrine Mode

## Overview
The application now has two UI modes for the prayer form:
1. **Normal Mode** (default) - Simple, clean layout
2. **Shrine Mode** (Easter egg) - 3-piece shrine frame with traditional Thai aesthetic

## How to Use

### Activating Shrine Mode
1. Navigate to the **History page** (`/history`)
2. Look for the **🏛️ เปิดศาล** button in the top-right corner
3. Click the button to enable Shrine Mode
4. You'll be redirected to the Shrine page with the frame enabled

### Deactivating Shrine Mode
1. Go back to the **History page**
2. Click the **🏛️ ปิดศาล** button
3. The mode will switch back to normal

## Technical Details

### State Persistence
- Shrine mode preference is saved in `localStorage` with key `'shrineMode'`
- The setting persists across page reloads and browser sessions
- Users can toggle between modes at any time

### Files Modified
1. **`app/(protected)/shrine/ShrineClient.tsx`**
   - Added `shrineMode` state with localStorage integration
   - Conditional rendering for normal vs shrine mode
   - Both modes share the same form logic

2. **`app/(protected)/history/page.tsx`**
   - Added EasterEggButton component to header

3. **`app/(protected)/history/EasterEggButton.tsx`** (new)
   - Client component for toggling shrine mode
   - Handles localStorage updates
   - Navigates to shrine page after toggle

### Tunable CSS Variables (Shrine Mode)
The shrine frame can be fine-tuned using CSS custom properties in `ShrineClient.tsx`:

```typescript
'--shrine-top-width': '91.9%',      // Width of roof image
'--shrine-mid-width': '79.5%',      // Width of pillar section
'--shrine-base-width': '100%',      // Width of base image
'--shrine-top-margin': '0.15%',     // Left margin for roof
'--shrine-mid-margin': '-0.11%',    // Left margin for pillars
'--shrine-base-margin': '-0.5%',    // Left margin for base
'--shrine-mid-bg-position': '0%',   // Background position for pillars
'--form-max-width-mobile': '180px', // Form width on mobile
'--form-max-width-desktop': '270px',// Form width on desktop
'--form-padding-mobile': '1rem',    // Form padding on mobile
'--form-padding-desktop': '2rem',   // Form padding on desktop
```

## User Experience
- Default experience remains clean and simple
- Power users can discover the shrine mode feature
- The toggle button is visible but not intrusive
- Mode preference is remembered for convenience
