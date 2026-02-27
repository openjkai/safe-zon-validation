import { useRef, useCallback, useEffect } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'

const DRAG_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
const INTERSECTION = new THREE.Vector3()

export interface UseDragOnPlaneOptions {
  meshRef: React.RefObject<THREE.Mesh | null>
  fixedY?: number
  onPositionChange?: (pos: THREE.Vector3) => void
}

export function useDragOnPlane({
  meshRef,
  fixedY = 20,
  onPositionChange,
}: UseDragOnPlaneOptions) {
  const { camera, gl } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const pointer = useRef(new THREE.Vector2())
  const isDragging = useRef(false)
  const onPositionChangeRef = useRef(onPositionChange)
  onPositionChangeRef.current = onPositionChange

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
      const pt = getIntersection(e.clientX, e.clientY)
      if (pt) {
        meshRef.current.position.x = pt.x
        meshRef.current.position.z = pt.z
        meshRef.current.position.y = fixedY
      }
    }
    const onUp = (e: PointerEvent) => {
      if (isDragging.current) {
        isDragging.current = false
        el.releasePointerCapture(e.pointerId)
        if (meshRef.current && onPositionChangeRef.current) {
          onPositionChangeRef.current(meshRef.current.position.clone())
        }
      }
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
    }
  }, [gl, meshRef, fixedY, getIntersection])

  return { handlePointerDown }
}
