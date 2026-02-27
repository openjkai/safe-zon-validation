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
}

export const Scene = forwardRef<ToolObjectRef, SceneProps>(function Scene(
  {
    rotationY,
    clampMode = false,
    showBounds = false,
    onPositionChange,
    onValidationChange,
  },
  ref
) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[800, 600, 800]} intensity={1} />
      <OrbitControls target={[600, 0, 300]} />
      <BasePlane />
      <ToolObject
        ref={ref}
        rotationY={rotationY}
        clampMode={clampMode}
        showBounds={showBounds}
        onPositionChange={onPositionChange}
        onValidationChange={onValidationChange}
      />
    </>
  )
})
