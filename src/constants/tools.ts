import type { FootprintSize } from '../types'
import { WORKSPACE_WIDTH, WORKSPACE_DEPTH } from './workspace'

export type ToolGeometry = 'box' | 'cylinder' | 'custom'

export interface ToolPreset {
  id: string
  label: string
  /** Optional GLB path (e.g. /models/box.glb). When set, loads GLB instead of primitive. */
  glbPath?: string
  /** Dimensions in mm (w × d × h). For cylinder, w = d = diameter. */
  size: FootprintSize
  geometry: ToolGeometry
}

export const TOOL_PRESETS: ToolPreset[] = [
  {
    id: 'box-default',
    label: 'Box (default)',
    size: { w: 120, d: 60, h: 40 },
    geometry: 'box',
  },
  {
    id: 'box-small',
    label: 'Box small',
    size: { w: 60, d: 60, h: 30 },
    geometry: 'box',
  },
  {
    id: 'box-large',
    label: 'Box large',
    size: { w: 180, d: 90, h: 50 },
    geometry: 'box',
  },
  {
    id: 'cylinder',
    label: 'Cylinder',
    size: { w: 80, d: 80, h: 45 },
    geometry: 'cylinder',
  },
  {
    id: 'cnc-spindle',
    label: 'CNC Spindle',
    glbPath: '/models/cnc-spindle.glb',
    size: { w: 120, d: 80, h: 140 },
    geometry: 'custom',
  },
  {
    id: 'l-fixture',
    label: 'L-Fixture',
    glbPath: '/models/l-fixture.glb',
    size: { w: 130, d: 45, h: 100 },
    geometry: 'custom',
  },
  {
    id: 'stepped-fixture',
    label: 'Stepped Fixture',
    glbPath: '/models/stepped-fixture.glb',
    size: { w: 140, d: 75, h: 90 },
    geometry: 'custom',
  },
  {
    id: 'drill-press',
    label: 'Drill Press',
    glbPath: '/models/drill-press.glb',
    size: { w: 120, d: 70, h: 165 },
    geometry: 'custom',
  },
]

export function getInitialPosition(size: FootprintSize): [number, number, number] {
  return [WORKSPACE_WIDTH / 2, size.h / 2, WORKSPACE_DEPTH / 2]
}
