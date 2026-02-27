import { useState, useRef, useEffect, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { Scene } from './components/Scene'
import type { ToolObjectRef } from './components/ToolObject'
import * as THREE from 'three'
import './App.css'

const INITIAL_POS = new THREE.Vector3(600, 20, 300)
const NUDGE_STEP = 10

function App() {
  const [rotationY, setRotationY] = useState(0)
  const [position, setPosition] = useState<THREE.Vector3>(INITIAL_POS.clone())
  const [isValid, setIsValid] = useState(true)
  const [clampMode, setClampMode] = useState(false)
  const [showBounds, setShowBounds] = useState(false)
  const toolRef = useRef<ToolObjectRef>(null)

  const handleRotate = useCallback(() => {
    setRotationY((prev) => (prev + Math.PI / 2) % (Math.PI * 2))
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return
      if (e.key === 'r' || e.key === 'R') {
        handleRotate()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        toolRef.current?.nudge(0, -NUDGE_STEP)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        toolRef.current?.nudge(0, NUDGE_STEP)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        toolRef.current?.nudge(-NUDGE_STEP, 0)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        toolRef.current?.nudge(NUDGE_STEP, 0)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleRotate])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas
        camera={{ position: [800, 600, 800], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Scene
          ref={toolRef}
          rotationY={rotationY}
          clampMode={clampMode}
          showBounds={showBounds}
          onPositionChange={(pos) => setPosition(pos.clone())}
          onValidationChange={setIsValid}
        />
      </Canvas>
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '12px 16px',
          borderRadius: 8,
          fontFamily: 'monospace',
          fontSize: 14,
        }}
      >
        <div>Position: {Math.round(position.x)}, {Math.round(position.z)}</div>
        <div>Status: {isValid ? 'Valid' : 'Invalid'}</div>
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button onClick={handleRotate} style={{ padding: '6px 12px', cursor: 'pointer' }}>
            Rotate 90° (R)
          </button>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={clampMode}
              onChange={(e) => setClampMode(e.target.checked)}
            />
            Clamp to safe zone
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showBounds}
              onChange={(e) => setShowBounds(e.target.checked)}
            />
            Show bounds
          </label>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
          Arrows: nudge
        </div>
      </div>
    </div>
  )
}

export default App
