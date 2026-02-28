# Safe Zone Validation Demo

A polished React Three Fiber proof-of-concept demonstrating **safe-zone validation** for a 3D placement tool. Designed to make a strong first impression with clear purpose, refined UI, and performant interaction.

## Purpose

This demo shows how to validate that a 3D tool stays within a safe margin of a workspace—useful for CNC, foam cutting, or any placement system where boundary compliance matters. The logic is built to extend to real GLB models with `THREE.Box3`-derived bounds.

## Features

- **1200×600 mm workspace** with grid and 10 mm safe zone
- **Draggable tool** with footprint-based validation
- **Sample tools**: Box (default, small, large), Cylinder, and GLB-loaded variants
- **Validation modes**: Reject (manual fix) or Clamp (auto-correct)
- **90° rotation** (R key) with correct footprint updates
- **Arrow keys** (↑↓←→) to nudge the tool
- **Collapsible guide** with step-by-step instructions
- **Compass** in upper-right that rotates with camera orbit
- **OrbitControls disabled** while dragging so the camera stays fixed
- **Shadcn-style dark theme** with Tailwind CSS v4
- **Build pipeline**: format → format:check → lint → tsc → vite build

## Tech Stack

- React 19 + TypeScript
- Vite
- React Three Fiber (@react-three/fiber)
- Drei (@react-three/drei)
- Three.js
- Tailwind CSS v4
- ESLint, Prettier

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

| Command                | Description                                       |
| ---------------------- | ------------------------------------------------- |
| `npm run dev`          | Start dev server                                  |
| `npm run build`        | Format, lint, typecheck, and build for production |
| `npm run preview`      | Preview production build                          |
| `npm run format`       | Format code with Prettier                         |
| `npm run format:check` | Check formatting (no write)                       |
| `npm run lint`         | Run ESLint                                        |
| `npm run lint:fix`     | Run ESLint with auto-fix                          |
| `npm run release`      | Bump version and update changelog (see below)     |
| `npm run generate:glb` | Generate sample GLB files in `public/models/`     |

## Demo Flow (for Screen Recording)

1. **Start valid** — Object is green, inside the green safe zone
2. **Drag toward edge** — Tool turns red, bounds wireframe shows
3. **Rotate (R)** — Footprint updates; validation may flip valid ↔ invalid
4. **Switch sample tools** — Use the dropdown to try different shapes (box, cylinder) and GLB models
5. **Switch to Clamp mode** — Toggle from Reject to Clamp
6. **Drag again** — Position auto-corrects to nearest valid spot
7. **Reset** — Click Reset to return to center and repeat

## Development Setup

### VS Code (Recommended)

This project includes workspace settings for format-on-save and ESLint:

1. Open the project in VS Code
2. Install recommended extensions: ESLint, Prettier
3. Format on save and ESLint auto-fix are enabled automatically

## Current Assumptions

- **Units**: All dimensions are in mm (millimeters)
- **Placeholder geometry**: A box stands in for the eventual tool GLB
- **Single tool**: No collision between multiple tools
- **Axis-aligned footprint**: Validation uses AABB projected onto the base plane

## Sample GLB Models

The demo includes sample GLB models (box, cylinder) in `public/models/`. Regenerate them with:

```bash
npm run generate:glb
```

You can add your own GLB files to `public/models/` and wire them in `src/constants/tools.ts` by adding a preset with `glbPath: '/models/your-model.glb'` and the matching `size`.

## Project Structure

```
src/
├── constants/          # workspace, scene, colors, ui
├── lib/               # math, vector helpers
├── utils/             # keyboard (isTypingTarget)
├── validation/        # safe zone logic
├── hooks/             # useDragOnPlane
├── components/
│   ├── ui/            # Kbd, Button, SegmentedControl, StatusBadge, Compass
│   ├── CameraAngleReporter.tsx
│   ├── Scene.tsx
│   ├── BasePlane.tsx
│   └── ToolObject.tsx
├── App.tsx
└── main.tsx
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## License

MIT — see [LICENSE](LICENSE) for details.
