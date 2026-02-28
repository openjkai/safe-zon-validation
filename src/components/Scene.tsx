import { forwardRef } from 'react'
import { OrbitControls } from '@react-three/drei'
import { BasePlane } from './BasePlane'
import { ToolObject, type ToolObjectRef } from './ToolObject'
import { CameraAngleReporter } from './CameraAngleReporter'
import type { ToolPreset } from '../constants/tools'
import * as THREE from 'three'
import {
  AMBIENT_LIGHT_INTENSITY,
  HEMISPHERE_LIGHT,
  HEMISPHERE_LIGHT_POSITION,
  MAIN_LIGHT_POSITION,
  MAIN_LIGHT_INTENSITY,
  FILL_LIGHT_POSITION,
  FILL_LIGHT_INTENSITY,
  BOTTOM_LIGHT_POSITION,
  BOTTOM_LIGHT_INTENSITY,
  ORBIT_TARGET,
  ORBIT_MIN_POLAR_ANGLE,
  ORBIT_MAX_POLAR_ANGLE,
  ORBIT_DAMPING_FACTOR,
  SHADOW_MAP_SIZE,
  SHADOW_CAMERA_FAR,
  SHADOW_CAMERA_BOUNDS,
} from '../constants/scene'

export interface SceneProps {
  toolPreset: ToolPreset
  rotationY: number
  clampMode?: boolean
  showBounds?: boolean
  isDragging?: boolean
  onCameraAzimuthChange?: (azimuth: number) => void
  onPositionChange?: (pos: THREE.Vector3) => void
  onValidationChange?: (valid: boolean) => void
  onDragChange?: (dragging: boolean) => void
}

export const Scene = forwardRef<ToolObjectRef, SceneProps>(function Scene(
  {
    toolPreset,
    rotationY,
    clampMode = false,
    showBounds = false,
    isDragging = false,
    onCameraAzimuthChange,
    onPositionChange,
    onValidationChange,
    onDragChange,
  },
  ref
) {
  return (
    <>
      <ambientLight intensity={AMBIENT_LIGHT_INTENSITY} />
      <hemisphereLight args={HEMISPHERE_LIGHT} position={[...HEMISPHERE_LIGHT_POSITION]} />
      <directionalLight
        position={[...MAIN_LIGHT_POSITION]}
        intensity={MAIN_LIGHT_INTENSITY}
        castShadow
        shadow-mapSize-width={SHADOW_MAP_SIZE}
        shadow-mapSize-height={SHADOW_MAP_SIZE}
        shadow-camera-far={SHADOW_CAMERA_FAR}
        shadow-camera-left={-SHADOW_CAMERA_BOUNDS}
        shadow-camera-right={SHADOW_CAMERA_BOUNDS}
        shadow-camera-top={SHADOW_CAMERA_BOUNDS}
        shadow-camera-bottom={-SHADOW_CAMERA_BOUNDS}
      />
      <directionalLight position={[...FILL_LIGHT_POSITION]} intensity={FILL_LIGHT_INTENSITY} />
      <directionalLight position={[...BOTTOM_LIGHT_POSITION]} intensity={BOTTOM_LIGHT_INTENSITY} />
      {onCameraAzimuthChange && <CameraAngleReporter onAzimuthChange={onCameraAzimuthChange} />}
      <OrbitControls
        enabled={!isDragging}
        target={[...ORBIT_TARGET]}
        minPolarAngle={ORBIT_MIN_POLAR_ANGLE}
        maxPolarAngle={ORBIT_MAX_POLAR_ANGLE}
        enableDamping
        dampingFactor={ORBIT_DAMPING_FACTOR}
      />
      <BasePlane />
      <ToolObject
        ref={ref}
        toolPreset={toolPreset}
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
