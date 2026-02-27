import { OrbitControls } from '@react-three/drei'
import { BasePlane } from './BasePlane'
import { ToolObject } from './ToolObject'
import * as THREE from 'three'

export interface SceneProps {
  rotationY: number
  onPositionChange?: (pos: THREE.Vector3) => void
  onValidationChange?: (valid: boolean) => void
}

export function Scene({ rotationY, onPositionChange, onValidationChange }: SceneProps) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[800, 600, 800]} intensity={1} />
      <OrbitControls target={[600, 0, 300]} />
      <BasePlane />
      <ToolObject
        rotationY={rotationY}
        onPositionChange={onPositionChange}
        onValidationChange={onValidationChange}
      />
    </>
  )
}
