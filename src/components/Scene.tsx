import { forwardRef } from 'react'
import { OrbitControls } from '@react-three/drei'
import { BasePlane } from './BasePlane'
import { ToolObject, type ToolObjectRef } from './ToolObject'
import * as THREE from 'three'

export interface SceneProps {
  rotationY: number
  clampMode?: boolean
  showBounds?: boolean
  onPositionChange?: (pos: THREE.Vector3) => void
  onValidationChange?: (valid: boolean) => void
  onDragChange?: (dragging: boolean) => void
}

export const Scene = forwardRef<ToolObjectRef, SceneProps>(function Scene(
  {
    rotationY,
    clampMode = false,
    showBounds = false,
    onPositionChange,
    onValidationChange,
    onDragChange,
  },
  ref
) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <hemisphereLight
        args={['#ffffff', '#64748b', 0.6]}
        position={[0, 400, 0]}
      />
      <directionalLight
        position={[800, 600, 800]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={2000}
        shadow-camera-left={-700}
        shadow-camera-right={700}
        shadow-camera-top={700}
        shadow-camera-bottom={-700}
      />
      <directionalLight position={[-400, 200, -400]} intensity={0.5} />
      <directionalLight position={[0, -300, 400]} intensity={0.3} />
      <OrbitControls
        target={[600, 0, 300]}
        minPolarAngle={0.15}
        maxPolarAngle={Math.PI / 2 + 0.4}
        enableDamping
        dampingFactor={0.05}
      />
      <BasePlane />
      <ToolObject
        ref={ref}
        rotationY={rotationY}
        clampMode={clampMode}
        showBounds={showBounds}
        onPositionChange={onPositionChange}
        onValidationChange={onValidationChange}
        onDragChange={onDragChange}
      />
    </>
  )
})
