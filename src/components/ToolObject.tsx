import { useRef, useState, useCallback, useLayoutEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { isWithinSafeZone } from '../validation/validation'
import { useDragOnPlane } from '../hooks/useDragOnPlane'

const TOOL_SIZE = { w: 120, d: 60, h: 40 }
const FIXED_Y = TOOL_SIZE.h / 2

const INITIAL_POSITION: [number, number, number] = [600, FIXED_Y, 300]

export interface ToolObjectProps {
  rotationY: number
  onPositionChange?: (pos: THREE.Vector3) => void
  onValidationChange?: (valid: boolean) => void
}

export function ToolObject({ rotationY, onPositionChange, onValidationChange }: ToolObjectProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [isValid, setIsValid] = useState(true)
  const lastValidRef = useRef(true)

  const handlePositionChange = useCallback(
    (pos: THREE.Vector3) => {
      onPositionChange?.(pos)
      const valid = isWithinSafeZone({ x: pos.x, y: pos.y, z: pos.z }, TOOL_SIZE, rotationY)
      setIsValid(valid)
      if (lastValidRef.current !== valid) {
        lastValidRef.current = valid
        onValidationChange?.(valid)
      }
    },
    [rotationY, onPositionChange, onValidationChange]
  )

  const { handlePointerDown } = useDragOnPlane({
    meshRef,
    fixedY: FIXED_Y,
    onPositionChange: handlePositionChange,
  })

  useLayoutEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...INITIAL_POSITION)
      meshRef.current.rotation.y = rotationY
    }
  }, [])

  useLayoutEffect(() => {
    meshRef.current!.rotation.y = rotationY
  }, [rotationY])

  useFrame(() => {
    if (!meshRef.current) return
    const pos = meshRef.current.position
    const valid = isWithinSafeZone({ x: pos.x, y: pos.y, z: pos.z }, TOOL_SIZE, rotationY)
    if (lastValidRef.current !== valid) {
      lastValidRef.current = valid
      setIsValid(valid)
      onValidationChange?.(valid)
      onPositionChange?.(pos.clone())
    }
  })

  const color = isValid ? '#4ade80' : '#ef4444'

  return (
    <mesh
      ref={meshRef}
      rotation={[0, rotationY, 0]}
      onPointerDown={handlePointerDown}
    >
      <boxGeometry args={[TOOL_SIZE.w, TOOL_SIZE.h, TOOL_SIZE.d]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}
