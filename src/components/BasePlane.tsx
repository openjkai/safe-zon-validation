import { useMemo } from 'react'
import * as THREE from 'three'
import {
  WORKSPACE_WIDTH,
  WORKSPACE_DEPTH,
  getSafeZoneBounds,
} from '../validation/validation'

export function BasePlane() {
  const bounds = getSafeZoneBounds()

  const safeZoneLineGeometry = useMemo(() => {
    const offsetX = WORKSPACE_WIDTH / 2
    const offsetZ = WORKSPACE_DEPTH / 2
    const pts: THREE.Vector3[] = [
      new THREE.Vector3(bounds.minX - offsetX, 0.5, bounds.minZ - offsetZ),
      new THREE.Vector3(bounds.maxX - offsetX, 0.5, bounds.minZ - offsetZ),
      new THREE.Vector3(bounds.maxX - offsetX, 0.5, bounds.maxZ - offsetZ),
      new THREE.Vector3(bounds.minX - offsetX, 0.5, bounds.maxZ - offsetZ),
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
  }, [])

  return (
    <group position={[WORKSPACE_WIDTH / 2, 0, WORKSPACE_DEPTH / 2]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[WORKSPACE_WIDTH, WORKSPACE_DEPTH]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
      <lineSegments geometry={safeZoneLineGeometry}>
        <lineBasicMaterial color="#22c55e" />
      </lineSegments>
    </group>
  )
}
