/** Three.js / WebGL colors (hex or CSS) for scene materials */
export const COLORS = {
  TOOL_VALID: '#4ade80',
  TOOL_INVALID: '#dc2626',
  TOOL_EMISSIVE_INVALID: '#7f1d1d',
  SAFE_ZONE_LINE: '#22c55e',
  PLANE_SURFACE: '#f8fafc',
  GRID_CELL: '#cbd5e1',
  GRID_SECTION: '#94a3b8',
  BOUNDS_HELPER: 0x666666,
} as const

/** Material properties for scene objects */
export const MATERIALS = {
  TOOL: { metalness: 0.3, roughness: 0.4, emissiveIntensityInvalid: 0.35 },
  PLANE: { metalness: 0.05, roughness: 0.9 },
} as const
