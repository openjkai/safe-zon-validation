# Safe Zone Validation Demo

A polished React Three Fiber proof-of-concept demonstrating **safe-zone validation** for a 3D placement tool. Designed to make a strong first impression with clear purpose, refined UI, and performant interaction.

## Purpose

This demo shows how to validate that a 3D tool stays within a safe margin of a workspace—useful for CNC, foam cutting, or any placement system where boundary compliance matters. The logic is built to extend to real GLB models with `THREE.Box3`-derived bounds.

## What It Demonstrates

- A rectangular base plane (1200×600 mm) with grid, representing a workspace/foam base
- One draggable tool placeholder (120×60×40 mm box) with metallic material
- A **10 mm safe zone** inset from all edges, shown as a green outline
- **Footprint-based validation**: the object turns red when any part of its bounds crosses the safe zone boundary
- **90° rotation support**: rotate the tool and validation updates correctly (footprint swaps width/depth)
- **Responsive drag interaction**: plane-raycast dragging with ref-based position updates
- **Polished overlay**: modern typography, status feedback, and keyboard shortcuts

## Tech Stack

- React + TypeScript
- Vite
- React Three Fiber (@react-three/fiber)
- Drei (@react-three/drei)
- Three.js

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Development Setup

### VS Code (Recommended)

This project includes workspace settings for format-on-save and ESLint:

1. Open the project in VS Code
2. When prompted, install the recommended extensions:
   - **ESLint** — Linting
   - **Prettier** — Code formatting
3. Format on save and ESLint auto-fix are enabled automatically

### Format & Lint

```bash
# Format all files
npm run format

# Check formatting without writing
npm run format:check

# Lint
npm run lint

# Lint and auto-fix
npm run lint:fix
```

## Current Assumptions

- **Units**: All dimensions are in mm (millimeters)
- **Placeholder geometry**: A box stands in for the eventual tool GLB
- **Single tool**: No collision between multiple tools
- **Axis-aligned footprint**: Validation uses AABB (axis-aligned bounding box) projected onto the base plane

## Extending for GLB Models

To replace the box with a real tool GLB:

1. Load the GLB with `useGLTF` (from Drei) or `GLTFLoader`
2. Replace the box mesh with `<primitive object={gltf.scene} />`
3. For bounds, use `new THREE.Box3().setFromObject(mesh)` in world space
4. Project the Box3 min/max onto the XZ plane to get footprint extents
5. Pass those extents into the same `isWithinSafeZone` logic (or add a variant that accepts `Box3` directly)

The `validation.ts` module is designed to be swapped or extended for GLB-based bounds. The functions `getFootprintForRotation` and `isWithinSafeZone` encode the core logic and can accept derived footprint data from `THREE.Box3`.

## Project Structure

```
src/
├── components/
│   ├── BasePlane.tsx    # Workspace plane + safe zone outline
│   ├── Scene.tsx        # Lights, controls, composition
│   └── ToolObject.tsx   # Draggable box + validation feedback
├── hooks/
│   └── useDragOnPlane.ts  # Raycast-based drag on XZ plane
├── validation/
│   └── validation.ts     # Safe zone bounds, footprint math, validation
├── types.ts
├── App.tsx
└── main.tsx
```

## License

MIT — see [LICENSE](LICENSE) for details.
