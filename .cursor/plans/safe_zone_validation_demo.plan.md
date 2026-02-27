---
name: Safe Zone Validation Demo
overview: "Build a React Three Fiber proof-of-concept demo for safe-zone validation: a draggable 3D box on a base plane with a 10mm margin, footprint-based validation, rotation support, and performant interaction using refs."
todos: []
isProject: false
---

# Safe Zone Validation Demo — Implementation Plan

## Tech Stack

- **Vite** + **React** + **TypeScript**
- **@react-three/fiber** — React renderer for Three.js
- **@react-three/drei** — OrbitControls, helpers
- **three** — Core 3D library

---

## Project Structure

```
demo/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── App.css
│   ├── components/
│   │   ├── Scene.tsx          # Canvas + lights + camera
│   │   ├── BasePlane.tsx      # Workspace + safe zone outline
│   │   └── ToolObject.tsx     # Draggable box + validation feedback
│   ├── hooks/
│   │   └── useDragOnPlane.ts  # Plane-raycast drag, refs-based
│   ├── validation/
│   │   └── validation.ts      # Safe zone logic, footprint math
│   └── types.ts               # Shared types (workspace, footprint)
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 1. Bootstrap and Dependencies

- Run `npm create vite@latest . -- --template react-ts`
- Install: `three @react-three/fiber @react-three/drei`
- Ensure TypeScript and Vite config are correct for JSX

---

## 2. Validation Layer (`validation.ts`)

Core logic, mm-aware and GLB-ready.

| Constant / Function                               | Purpose                                                                                                                |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `WORKSPACE_WIDTH`, `WORKSPACE_DEPTH`              | 1200, 600 (mm)                                                                                                         |
| `SAFE_ZONE_MARGIN`                                | 10 (mm)                                                                                                                |
| `getSafeZoneBounds()`                             | Returns `{ minX, maxX, minZ, maxZ }` inset by 10mm                                                                     |
| `getFootprintForRotation(rotationY, size)`        | Given Y rotation in radians and `{ w, d, h }`, returns projected footprint `{ halfW, halfD }` (swaps w/d on 90° steps) |
| `isWithinSafeZone(position, footprint, rotation)` | Checks min/max X and Z of object bounds vs safe zone; returns `boolean`                                                |

**Logic:** Object bounds are `[pos.x ± halfW, pos.z ± halfD]`; valid if `minX >= safeMinX`, `maxX <= safeMaxX`, same for Z.

---

## 3. Base Plane (`BasePlane.tsx`)

- **Plane geometry:** 1200 × 600 on XZ (Y up).
- **Material:** Simple `meshStandardMaterial` (e.g. light gray).
- **Safe zone visual:** `LineSegments` drawing the inner rectangle outline.
- **Position:** Centered; safe zone is an inner rect from (10, 0, 10) to (1190, 0, 590).

---

## 4. Drag Hook (`useDragOnPlane.ts`)

- Use `useRef` for mesh position; avoid React state during drag.
- Raycasting on ground plane; pointer events with capture.
- State sync on pointer release via `onPositionChange`.

---

## 5. Tool Object (`ToolObject.tsx`)

- Box 120×40×60 mm, validation-driven material color.
- Refs-based; `onPositionChange` / `onValidationChange` callbacks.

---

## 6–10. Scene, App, Rotation, Nice-to-Haves, README

*(See original sections — all implemented.)*

---

## 11. UI/UX Polish (First Impression)

- **Overlay:** Clear visual hierarchy, modern typography, subtle backdrop blur, refined spacing.
- **Purpose at a glance:** Demo title/subtitle so users immediately understand what they're seeing.
- **Status badge:** Pill-style valid/invalid with color + icon for instant scanning.
- **Keyboard shortcuts:** Always visible, grouped; reduce cognitive load.
- **Accessibility:** ARIA labels, focus states, semantic HTML.
- **Micro-interactions:** Cursor changes on draggable, subtle hover on controls.

---

## 12. 3D Scene Quality

- **Base plane:** Grid or subtle texture to convey scale; softer material.
- **Lighting:** Rim light for depth; slightly warmer ambient for a polished look.
- **Tool material:** Metallic/roughness for more realistic appearance; smooth transitions on validation color change.
- **Safe zone:** More prominent outline (e.g. Line2 from drei for thickness) or fill for clarity.

---

## 13. Performance

- **Canvas:** Lazy load / `frameloop="demand"` where appropriate; `gl={{ antialias: true }}` for quality.
- **Memoization:** `React.memo` on Scene children; stable callbacks.
- **Event handling:** Passive listeners where possible; avoid work in hot paths.
- **Dispose:** Ensure geometries/materials disposed when components unmount.

---

## 14. Code Quality & Purpose

- **Purpose clarity:** Comments and structure that make the demo's intent obvious.
- **Consistency:** Unified color tokens, shared constants.
- **Type safety:** No `any`; proper event typing.

---

## Success Criteria Checklist

- Draggable box on base plane
- 10mm margin visible and validated
- Invalid state when footprint crosses margin
- Rotation preserves correct validation
- Logic suitable for future GLB integration (Box3, same validation)
- Polished UI/UX that makes a strong first impression
- Performant interaction and rendering
