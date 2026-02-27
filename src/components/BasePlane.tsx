import { useMemo, useEffect, memo } from 'react'
import * as THREE from 'three'
import { Grid } from '@react-three/drei'
import { WORKSPACE_WIDTH, WORKSPACE_DEPTH, getSafeZoneBounds } from '../validation/validation'
import { COLORS, MATERIALS } from '../constants'
import {
  SAFE_ZONE_LINE_Y,
  GRID_OFFSET_Y,
  GRID_CELL_SIZE,
  GRID_CELL_THICKNESS,
  GRID_SECTION_SIZE,
  GRID_SECTION_THICKNESS,
  GRID_FADE_FACTOR,
  GRID_FADE_STRENGTH,
  PLANE_ROTATION_X,
} from '../constants/scene'

const HALF_WIDTH = WORKSPACE_WIDTH / 2
const HALF_DEPTH = WORKSPACE_DEPTH / 2

export const BasePlane = memo(function BasePlane() {
  const bounds = getSafeZoneBounds()

  const safeZoneLineGeometry = useMemo(() => {
    const pts: THREE.Vector3[] = [
      new THREE.Vector3(bounds.minX - HALF_WIDTH, SAFE_ZONE_LINE_Y, bounds.minZ - HALF_DEPTH),
      new THREE.Vector3(bounds.maxX - HALF_WIDTH, SAFE_ZONE_LINE_Y, bounds.minZ - HALF_DEPTH),
      new THREE.Vector3(bounds.maxX - HALF_WIDTH, SAFE_ZONE_LINE_Y, bounds.maxZ - HALF_DEPTH),
      new THREE.Vector3(bounds.minX - HALF_WIDTH, SAFE_ZONE_LINE_Y, bounds.maxZ - HALF_DEPTH),
    ]
    return new THREE.BufferGeometry().setFromPoints([
      pts[0],
      pts[1],
      pts[1],
      pts[2],
      pts[2],
      pts[3],
      pts[3],
      pts[0],
    ])
  }, [bounds.minX, bounds.maxX, bounds.minZ, bounds.maxZ])

  useEffect(() => {
    const g = safeZoneLineGeometry
    return () => g.dispose()
  }, [safeZoneLineGeometry])

  return (
    <group position={[HALF_WIDTH, 0, HALF_DEPTH]}>
      <mesh rotation={[PLANE_ROTATION_X, 0, 0]} receiveShadow>
        <planeGeometry args={[WORKSPACE_WIDTH, WORKSPACE_DEPTH]} />
        <meshStandardMaterial
          color={COLORS.PLANE_SURFACE}
          metalness={MATERIALS.PLANE.metalness}
          roughness={MATERIALS.PLANE.roughness}
          side={THREE.DoubleSide}
        />
      </mesh>
      <Grid
        args={[WORKSPACE_WIDTH, WORKSPACE_DEPTH]}
        position={[0, GRID_OFFSET_Y, 0]}
        cellSize={GRID_CELL_SIZE}
        cellThickness={GRID_CELL_THICKNESS}
        cellColor={COLORS.GRID_CELL}
        sectionSize={GRID_SECTION_SIZE}
        sectionThickness={GRID_SECTION_THICKNESS}
        sectionColor={COLORS.GRID_SECTION}
        fadeDistance={WORKSPACE_WIDTH * GRID_FADE_FACTOR}
        fadeStrength={GRID_FADE_STRENGTH}
        followCamera={false}
        infiniteGrid={false}
      />
      <lineSegments geometry={safeZoneLineGeometry}>
        <lineBasicMaterial color={COLORS.SAFE_ZONE_LINE} />
      </lineSegments>
    </group>
  )
})
