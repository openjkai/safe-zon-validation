import { useRef, useCallback, useEffect } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'

const DRAG_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
const INTERSECTION = new THREE.Vector3()

export type ClampFn = (pos: THREE.Vector3) => THREE.Vector3

export interface UseDragOnPlaneOptions {
  meshRef: React.RefObject<THREE.Mesh | null>
  fixedY?: number
  onPositionChange?: (pos: THREE.Vector3) => void
  clampPosition?: ClampFn
}

export function useDragOnPlane({
  meshRef,
  fixedY = 20,
  onPositionChange,
  clampPosition,
}: UseDragOnPlaneOptions) {
  const { camera, gl } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const pointer = useRef(new THREE.Vector2())
  const isDragging = useRef(false)
  const onPositionChangeRef = useRef(onPositionChange)
  const clampPositionRef = useRef(clampPosition)
  onPositionChangeRef.current = onPositionChange
  clampPositionRef.current = clampPosition

  const getIntersection = useCallback(
    (clientX: number, clientY: number): THREE.Vector3 | null => {
      const rect = gl.domElement.getBoundingClientRect()
      pointer.current.x = ((clientX - rect.left) / rect.width) * 2 - 1
      pointer.current.y = -((clientY - rect.top) / rect.height) * 2 + 1
      raycaster.current.setFromCamera(pointer.current, camera)
      if (raycaster.current.ray.intersectPlane(DRAG_PLANE, INTERSECTION)) {
        return INTERSECTION.clone()
      }
      return null
    },
    [camera, gl]
  )

  const handlePointerDown = useCallback(
    (e: { stopPropagation: () => void; pointerId: number }) => {
      e.stopPropagation()
      isDragging.current = true
      gl.domElement.setPointerCapture(e.pointerId)
    },
    [gl]
  )

  useEffect(() => {
    const el = gl.domElement
    const onMove = (e: PointerEvent) => {
      if (!isDragging.current || !meshRef.current) return
      let pt = getIntersection(e.clientX, e.clientY)
      if (pt) {
        if (clampPositionRef.current) {
          pt = clampPositionRef.current(pt)
        }
        meshRef.current.position.x = pt.x
        meshRef.current.position.z = pt.z
        meshRef.current.position.y = fixedY
      }
    }
    const onUp = (e: PointerEvent) => {
      if (isDragging.current) {
        isDragging.current = false
        el.releasePointerCapture(e.pointerId)
        if (meshRef.current) {
          let pos = meshRef.current.position.clone()
          if (clampPositionRef.current) {
            pos = clampPositionRef.current(pos)
            meshRef.current.position.copy(pos)
          }
          onPositionChangeRef.current?.(pos)
        }
      }
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
    }
  }, [gl, meshRef, fixedY, getIntersection, clampPosition])

  return { handlePointerDown }
}
