import type { FootprintSize } from '../types'

/** Workspace dimensions in mm */
export const WORKSPACE_WIDTH = 1200
export const WORKSPACE_DEPTH = 600

/** Safe zone inset from all edges in mm */
export const SAFE_ZONE_MARGIN = 10

/** Tool placeholder dimensions (w × d × h) in mm */
export const TOOL_SIZE: FootprintSize = { w: 120, d: 60, h: 40 }

/** Fixed Y for tool (half height above plane) */
export const TOOL_FIXED_Y = TOOL_SIZE.h / 2

/** Initial tool position [x, y, z] centered on workspace */
export const INITIAL_POSITION: [number, number, number] = [
  WORKSPACE_WIDTH / 2,
  TOOL_FIXED_Y,
  WORKSPACE_DEPTH / 2,
]
