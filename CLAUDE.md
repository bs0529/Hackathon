# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a hackathon project for an ocean ecosystem simulation fishing game built with React and Vite. The game focuses on ocean cleanup and marine ecosystem restoration through an interactive fishing mechanic where players catch marine life and trash, making choices about conservation vs. economic gain.

**Project Goal:** Educational game demonstrating the impact of human actions on marine ecosystems. Players clean polluted oceans through fishing mechanics, with pollution levels dynamically affecting which species appear.

## Common Commands

### Development
```bash
npm run dev          # Start development server with Vite
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Data Generation
```bash
node generate_fish_data.js   # Regenerate fishData.js from JSON sources in meis_data/
```

This script reads marine species data from `meis_data/*.json` files and generates `src/fishData.js` with 2D image paths from `public/assets/images/`.

## Architecture

### Core Game Architecture

**Single-Page React App (`src/App.jsx`):**
- All game logic in one component using React hooks
- Game phases: `ready` → `fishing` → `catching` → (success/fail) → `ready`
- Real-time fishing line animation using `requestAnimationFrame`

**Game States:**
- `ready`: Initial state, waiting for player to cast
- `fishing`: Line cast, waiting for bite (random delay 500-2000ms)
- `catching`: Timing minigame with moving bar and green/red zones

**Key Mechanics:**
- **Timing Minigame:** Click/space to stop moving bar in colored zones (green=15pts, red=30pts)
- **Gauge System:** Reach 100% to catch fish, 3 failures = game over
- **Random Fish Selection:** On success, randomly selects from `fishData` array

### Data Architecture

**Fish Data Source (`src/fishData.js`):**
- Generated from `meis_data/` JSON files containing marine species info from Korean Ministry of Oceans and Fisheries
- Each fish has: `name`, `model` (3D GLB path), `image2d` (2D sticker), `description`, `ovrHbttNm` (habitat)
- ~70+ marine species including fish, crabs, sea turtles, whales, corals, seagrass

**Asset Structure:**
```
public/
  assets/
    models/        # 3D GLB files (201701.glb, etc.)
    images/        # 2D stickers (sticker_*.png)
  fisherman.png    # Player sprite
  fs.png           # Bobber/fallback image
```

### Animation System

**Fishing Line (`updateLinePosition`):**
- SVG line element tracking rod tip to bobber position
- Uses `requestAnimationFrame` for smooth 60fps updates
- Rod tip position: 40% viewport width, 35% viewport height
- Minimizes layout thrashing by caching window dimensions

**State-Based Animations:**
- `rodAnimation`: 'success'/'fail' visual feedback (150ms duration)
- `catchAnimation`: Fish pulling animation on successful catch
- `isCasting`: Cast animation before fishing begins
- CSS classes trigger keyframe animations in `App.css`

## Important Implementation Details

### Korean Character Handling
The `generate_fish_data.js` script handles NFD/NFC normalization for Korean filenames on macOS to correctly match image files.

### Fallback Strategy
When fish selection fails or data is missing, the game falls back to a default whale (202201.glb) to prevent crashes.

### Input Handling
Both keyboard (spacebar) and mouse clicks are supported for all game interactions. The game prevents casting during result screens.

### Auto-Reset
Result screens automatically reset to ready state after 3 seconds, but players can manually restart immediately.

## Development Notes

- This is a Vite-based React app using the Rolldown Vite fork (`rolldown-vite@7.2.5`)
- The game is designed for educational use at aquariums, museums, and environmental campaigns
- Future features mentioned in README: pollution levels, aquarium system, fish letters (AI-generated), strategic choices (sell/release/transfer)
