import { useMemo, memo } from 'react'
import * as THREE from 'three'
import { Grid } from '@react-three/drei'
import { WORKSPACE_WIDTH, WORKSPACE_DEPTH, getSafeZoneBounds } from '../validation/validation'

export const BasePlane = memo(function BasePlane() {
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
  }, [bounds.minX, bounds.maxX, bounds.minZ, bounds.maxZ])

  return (
    <group position={[WORKSPACE_WIDTH / 2, 0, WORKSPACE_DEPTH / 2]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[WORKSPACE_WIDTH, WORKSPACE_DEPTH]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.05} roughness={0.9} />
      </mesh>
      <Grid
        args={[WORKSPACE_WIDTH, WORKSPACE_DEPTH]}
        position={[0, 0.1, 0]}
        cellSize={60}
        cellThickness={0.5}
        cellColor="#cbd5e1"
        sectionSize={300}
        sectionThickness={1}
        sectionColor="#94a3b8"
        fadeDistance={WORKSPACE_WIDTH * 0.8}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={false}
      />
      <lineSegments geometry={safeZoneLineGeometry}>
        <lineBasicMaterial color="#22c55e" />
      </lineSegments>
    </group>
  )
})
