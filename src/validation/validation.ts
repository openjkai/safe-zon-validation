import type { FootprintSize, SafeZoneBounds } from '../types'

/** Workspace dimensions in mm */
export const WORKSPACE_WIDTH = 1200
export const WORKSPACE_DEPTH = 600

/** Safe zone inset from all edges in mm */
export const SAFE_ZONE_MARGIN = 10

/**
 * Returns the valid placement bounds (inner rectangle inset by margin).
 */
export function getSafeZoneBounds(): SafeZoneBounds {
  return {
    minX: SAFE_ZONE_MARGIN,
    maxX: WORKSPACE_WIDTH - SAFE_ZONE_MARGIN,
    minZ: SAFE_ZONE_MARGIN,
    maxZ: WORKSPACE_DEPTH - SAFE_ZONE_MARGIN,
  }
}

/**
 * Given Y rotation (radians) and object size, returns projected footprint half-extents on XZ plane.
 * At 90° steps, width and depth are swapped.
 */
export function getFootprintForRotation(
  rotationY: number,
  size: FootprintSize
): { halfW: number; halfD: number } {
  const { w, d } = size
  const norm = ((rotationY % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
  const quarterTurns = Math.round(norm / (Math.PI / 2)) % 4
  const evenSwap = quarterTurns === 0 || quarterTurns === 2
  return {
    halfW: (evenSwap ? w : d) / 2,
    halfD: (evenSwap ? d : w) / 2,
  }
}

/**
 * Checks whether the object's footprint (bounds) remains inside the safe zone.
 * Uses position (center) and footprint half-extents.
 */
export function isWithinSafeZone(
  position: { x: number; y: number; z: number },
  size: FootprintSize,
  rotationY: number
): boolean {
  const bounds = getSafeZoneBounds()
  const { halfW, halfD } = getFootprintForRotation(rotationY, size)

  const minX = position.x - halfW
  const maxX = position.x + halfW
  const minZ = position.z - halfD
  const maxZ = position.z + halfD

  return (
    minX >= bounds.minX &&
    maxX <= bounds.maxX &&
    minZ >= bounds.minZ &&
    maxZ <= bounds.maxZ
  )
}
