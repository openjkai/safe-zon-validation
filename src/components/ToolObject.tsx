/**
 * ToolObject — Draggable tool placeholder with safe-zone validation.
 *
 * Current: Box geometry as placeholder. Next step: replace with GLB via
 * <primitive object={gltf.scene} />, derive bounds with Box3.setFromObject(mesh),
 * and feed transformed footprint into the same validation logic.
 */
import {
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
  useMemo,
  useImperativeHandle,
  forwardRef,
} from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { isWithinSafeZone, clampToSafeZone } from '../validation/validation'
import { useDragOnPlane } from '../hooks/useDragOnPlane'

const TOOL_SIZE = { w: 120, d: 60, h: 40 }
const FIXED_Y = TOOL_SIZE.h / 2

const INITIAL_POSITION: [number, number, number] = [600, FIXED_Y, 300]

export interface ToolObjectRef {
  nudge: (dx: number, dz: number) => void
  getPosition: () => THREE.Vector3
  reset: () => void
}

export interface ToolObjectProps {
  rotationY: number
  clampMode?: boolean
  showBounds?: boolean
  onPositionChange?: (pos: THREE.Vector3) => void
  onValidationChange?: (valid: boolean) => void
  onDragChange?: (dragging: boolean) => void
}

export const ToolObject = forwardRef<ToolObjectRef, ToolObjectProps>(function ToolObject(
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

  const clampPosition = useMemo(
    () =>
      clampMode
        ? (pos: THREE.Vector3) => {
            const c = clampToSafeZone({ x: pos.x, y: pos.y, z: pos.z }, TOOL_SIZE, rotationY)
            return new THREE.Vector3(c.x, c.y, c.z)
          }
        : undefined,
    [clampMode, rotationY]
  )

  const { handlePointerDown } = useDragOnPlane({
    meshRef,
    fixedY: FIXED_Y,
    onPositionChange: handlePositionChange,
    clampPosition,
    onDragChange,
  })

  useImperativeHandle(
    ref,
    () => ({
      nudge(dx: number, dz: number) {
        if (!meshRef.current) return
        const tentative = meshRef.current.position.clone()
        tentative.x += dx
        tentative.z += dz
        if (clampPosition) {
          meshRef.current.position.copy(clampPosition(tentative))
        } else {
          meshRef.current.position.copy(tentative)
        }
        handlePositionChange(meshRef.current.position.clone())
      },
      getPosition() {
        return meshRef.current?.position.clone() ?? new THREE.Vector3(...INITIAL_POSITION)
      },
      reset() {
        if (!meshRef.current) return
        meshRef.current.position.set(...INITIAL_POSITION)
        handlePositionChange(meshRef.current.position.clone())
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- clampPosition captures rotationY; rotation from prop only
    [handlePositionChange, clampPosition]
  )

  useLayoutEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...INITIAL_POSITION)
      meshRef.current.rotation.y = rotationY
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, [])

  useLayoutEffect(() => {
    if (meshRef.current) meshRef.current.rotation.y = rotationY
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

  const color = isValid ? '#4ade80' : '#dc2626'
  const emissiveIntensity = isValid ? 0 : 0.35

  return (
    <group>
      <mesh ref={meshRef} rotation={[0, rotationY, 0]} castShadow onPointerDown={handlePointerDown}>
        <boxGeometry args={[TOOL_SIZE.w, TOOL_SIZE.h, TOOL_SIZE.d]} />
        <meshStandardMaterial
          color={color}
          metalness={0.3}
          roughness={0.4}
          emissive={isValid ? '#000000' : '#7f1d1d'}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
      {showBounds && <BoundsHelper meshRef={meshRef} />}
    </group>
  )
})

function BoundsHelper({ meshRef }: { meshRef: React.RefObject<THREE.Mesh | null> }) {
  const [helper, setHelper] = useState<THREE.BoxHelper | null>(null)

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const h = new THREE.BoxHelper(mesh, 0x666666)
    setHelper(h)
    return () => {
      h.dispose()
      setHelper(null)
    }
  }, [meshRef])

  useFrame(() => {
    if (helper && meshRef.current) {
      helper.setFromObject(meshRef.current)
    }
  })

  if (!helper) return null
  return <primitive object={helper} />
}
