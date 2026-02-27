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
import { TOOL_SIZE, TOOL_FIXED_Y, INITIAL_POSITION } from '../constants'
import { COLORS, MATERIALS } from '../constants'
import { vec3ToObj, objToVec3 } from '../lib/vector'

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

function notifyValidationIfChanged(
  valid: boolean,
  lastValidRef: React.MutableRefObject<boolean>,
  onValidationChange?: (v: boolean) => void
): boolean {
  if (lastValidRef.current === valid) return false
  lastValidRef.current = valid
  onValidationChange?.(valid)
  return true
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
      const valid = isWithinSafeZone(vec3ToObj(pos), TOOL_SIZE, rotationY)
      setIsValid(valid)
      notifyValidationIfChanged(valid, lastValidRef, onValidationChange)
    },
    [rotationY, onPositionChange, onValidationChange]
  )

  const clampPosition = useMemo(
    () =>
      clampMode
        ? (pos: THREE.Vector3) => objToVec3(clampToSafeZone(vec3ToObj(pos), TOOL_SIZE, rotationY))
        : undefined,
    [clampMode, rotationY]
  )

  const { handlePointerDown } = useDragOnPlane({
    meshRef,
    fixedY: TOOL_FIXED_Y,
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
        const final = clampPosition ? clampPosition(tentative) : tentative
        meshRef.current.position.copy(final)
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
    const valid = isWithinSafeZone(vec3ToObj(pos), TOOL_SIZE, rotationY)
    if (notifyValidationIfChanged(valid, lastValidRef, onValidationChange)) {
      setIsValid(valid)
      onPositionChange?.(pos.clone())
    }
  })

  const color = isValid ? COLORS.TOOL_VALID : COLORS.TOOL_INVALID
  const emissive = isValid ? '#000000' : COLORS.TOOL_EMISSIVE_INVALID
  const emissiveIntensity = isValid ? 0 : MATERIALS.TOOL.emissiveIntensityInvalid

  return (
    <group>
      <mesh ref={meshRef} rotation={[0, rotationY, 0]} castShadow onPointerDown={handlePointerDown}>
        <boxGeometry args={[TOOL_SIZE.w, TOOL_SIZE.h, TOOL_SIZE.d]} />
        <meshStandardMaterial
          color={color}
          metalness={MATERIALS.TOOL.metalness}
          roughness={MATERIALS.TOOL.roughness}
          emissive={emissive}
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
    const h = new THREE.BoxHelper(mesh, COLORS.BOUNDS_HELPER)
    setHelper(h)
    return () => {
      h.dispose()
      setHelper(null)
    }
  }, [meshRef])

  useFrame(() => {
    if (helper && meshRef.current) helper.setFromObject(meshRef.current)
  })

  if (!helper) return null
  return <primitive object={helper} />
}
