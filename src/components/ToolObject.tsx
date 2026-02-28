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
import { useGLTF } from '@react-three/drei'
import { isWithinSafeZone, clampToSafeZone } from '../validation/validation'
import { useDragOnPlane } from '../hooks/useDragOnPlane'
import { getInitialPosition, getFixedY } from '../constants/tools'
import type { ToolPreset } from '../constants/tools'
import { COLORS, MATERIALS } from '../constants'
import { vec3ToObj, objToVec3 } from '../lib/vector'

export interface ToolObjectRef {
  nudge: (dx: number, dz: number) => void
  getPosition: () => THREE.Vector3
  reset: () => void
}

export interface ToolObjectProps {
  toolPreset: ToolPreset
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
    toolPreset,
    rotationY,
    clampMode = false,
    showBounds = false,
    onPositionChange,
    onValidationChange,
    onDragChange,
  },
  ref
) {
  const groupRef = useRef<THREE.Group>(null)
  const [isValid, setIsValid] = useState(true)
  const lastValidRef = useRef(true)
  const { size, geometry } = toolPreset
  const fixedY = getFixedY(toolPreset)
  const initialPos = useMemo(
    () => getInitialPosition(size, getFixedY(toolPreset)),
    [size, toolPreset]
  )

  const handlePositionChange = useCallback(
    (pos: THREE.Vector3) => {
      onPositionChange?.(pos)
      const valid = isWithinSafeZone(vec3ToObj(pos), size, rotationY)
      setIsValid(valid)
      notifyValidationIfChanged(valid, lastValidRef, onValidationChange)
    },
    [size, rotationY, onPositionChange, onValidationChange]
  )

  const clampPosition = useMemo(
    () =>
      clampMode
        ? (pos: THREE.Vector3) => objToVec3(clampToSafeZone(vec3ToObj(pos), size, rotationY))
        : undefined,
    [clampMode, rotationY, size]
  )

  const { handlePointerDown } = useDragOnPlane({
    meshRef: groupRef,
    fixedY,
    onPositionChange: handlePositionChange,
    clampPosition,
    onDragChange,
  })

  useImperativeHandle(
    ref,
    () => ({
      nudge(dx: number, dz: number) {
        if (!groupRef.current) return
        const tentative = groupRef.current.position.clone()
        tentative.x += dx
        tentative.z += dz
        const final = clampPosition ? clampPosition(tentative) : tentative
        groupRef.current.position.copy(final)
        handlePositionChange(groupRef.current.position.clone())
      },
      getPosition() {
        return groupRef.current?.position.clone() ?? new THREE.Vector3(...initialPos)
      },
      reset() {
        if (!groupRef.current) return
        groupRef.current.position.set(...initialPos)
        handlePositionChange(groupRef.current.position.clone())
      },
    }),
    [handlePositionChange, clampPosition, initialPos]
  )

  useLayoutEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(...initialPos)
      groupRef.current.rotation.y = rotationY
      onPositionChange?.(new THREE.Vector3(...initialPos))
    }
  }, [toolPreset.id, initialPos, rotationY, onPositionChange])

  useLayoutEffect(() => {
    if (groupRef.current) groupRef.current.rotation.y = rotationY
  }, [rotationY])

  useFrame(() => {
    if (!groupRef.current) return
    const pos = groupRef.current.position
    const valid = isWithinSafeZone(vec3ToObj(pos), size, rotationY)
    if (notifyValidationIfChanged(valid, lastValidRef, onValidationChange)) {
      setIsValid(valid)
      onPositionChange?.(pos.clone())
    }
  })

  const color = isValid ? COLORS.TOOL_VALID : COLORS.TOOL_INVALID
  const emissive = isValid ? '#000000' : COLORS.TOOL_EMISSIVE_INVALID
  const emissiveIntensity = isValid ? 0 : MATERIALS.TOOL.emissiveIntensityInvalid

  const materialProps = {
    color,
    metalness: MATERIALS.TOOL.metalness,
    roughness: MATERIALS.TOOL.roughness,
    emissive,
    emissiveIntensity,
  }

  const renderGeometry = () => {
    if (toolPreset.glbPath) {
      return (
        <ToolGLB
          glbPath={toolPreset.glbPath}
          materialProps={materialProps}
          onPointerDown={handlePointerDown}
        />
      )
    }
    if (geometry === 'cylinder') {
      const radius = size.w / 2
      return (
        <mesh castShadow onPointerDown={handlePointerDown} position={[0, 0, 0]}>
          <cylinderGeometry args={[radius, radius, size.h, 24]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      )
    }
    return (
      <mesh castShadow onPointerDown={handlePointerDown} position={[0, 0, 0]}>
        <boxGeometry args={[size.w, size.h, size.d]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
    )
  }

  return (
    <group ref={groupRef}>
      {renderGeometry()}
      {showBounds && <BoundsHelper objectRef={groupRef} />}
    </group>
  )
})

function ToolGLB({
  glbPath,
  materialProps,
  onPointerDown,
}: {
  glbPath: string
  materialProps: {
    color: string
    metalness: number
    roughness: number
    emissive: string
    emissiveIntensity: number
  }
  onPointerDown: (e: { stopPropagation: () => void; pointerId: number }) => void
}) {
  const { scene } = useGLTF(glbPath)
  const clone = useMemo(() => scene.clone(), [scene])
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: materialProps.color,
        metalness: materialProps.metalness,
        roughness: materialProps.roughness,
        emissive: materialProps.emissive,
        emissiveIntensity: materialProps.emissiveIntensity,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- create once
    []
  )

  useLayoutEffect(() => {
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = material
        child.castShadow = true
      }
    })
  }, [clone, material])

  useFrame(() => {
    material.color.set(materialProps.color)
    material.emissive.set(materialProps.emissive)
    material.emissiveIntensity = materialProps.emissiveIntensity
  })

  return (
    <group onPointerDown={onPointerDown}>
      <primitive object={clone} />
    </group>
  )
}

function BoundsHelper({ objectRef }: { objectRef: React.RefObject<THREE.Object3D | null> }) {
  const [helper, setHelper] = useState<THREE.BoxHelper | null>(null)

  useLayoutEffect(() => {
    const obj = objectRef.current
    if (!obj) return
    const h = new THREE.BoxHelper(obj, COLORS.BOUNDS_HELPER)
    setHelper(h)
    return () => {
      h.dispose()
      setHelper(null)
    }
  }, [objectRef])

  useFrame(() => {
    if (helper && objectRef.current) helper.setFromObject(objectRef.current)
  })

  if (!helper) return null
  return <primitive object={helper} />
}
