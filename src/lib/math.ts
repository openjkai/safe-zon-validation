import { TAU, QUARTER_TURN } from '../constants'

/** Normalize angle to [0, 2π) */
export function normalizeRotationY(radians: number): number {
  return ((radians % TAU) + TAU) % TAU
}

/** Get quarter-turn index (0–3) for a given rotation */
export function rotationToQuarterTurns(radians: number): number {
  return Math.round(normalizeRotationY(radians) / QUARTER_TURN) % 4
}
