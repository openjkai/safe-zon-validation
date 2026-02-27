import { useFrame } from '@react-three/fiber'
import { useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { ORBIT_TARGET } from '../constants/scene'

const TARGET = { x: ORBIT_TARGET[0], y: ORBIT_TARGET[1], z: ORBIT_TARGET[2] }
const THRESHOLD = 0.02

export function CameraAngleReporter({
  onAzimuthChange,
}: {
  onAzimuthChange: (azimuth: number) => void
}) {
  const { camera } = useThree()
  const lastAzimuth = useRef<number | null>(null)

  useFrame(() => {
    const dx = camera.position.x - TARGET.x
    const dz = camera.position.z - TARGET.z
    const azimuth = Math.atan2(dx, dz)
    if (lastAzimuth.current === null || Math.abs(azimuth - lastAzimuth.current) > THRESHOLD) {
      lastAzimuth.current = azimuth
      onAzimuthChange(azimuth)
    }
  })

  return null
}
