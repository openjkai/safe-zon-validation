import * as THREE from 'three'
import type { Position3D } from '../types'

/** Convert THREE.Vector3 to plain Position3D */
export function vec3ToObj(v: THREE.Vector3): Position3D {
  return { x: v.x, y: v.y, z: v.z }
}

/** Convert Position3D to THREE.Vector3 */
export function objToVec3(o: Position3D): THREE.Vector3 {
  return new THREE.Vector3(o.x, o.y, o.z)
}
