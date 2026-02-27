import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Scene } from './components/Scene'
import * as THREE from 'three'
import './App.css'

const INITIAL_POS = new THREE.Vector3(600, 20, 300)

function App() {
  const [rotationY, setRotationY] = useState(0)
  const [position, setPosition] = useState<THREE.Vector3>(INITIAL_POS.clone())
  const [isValid, setIsValid] = useState(true)

  const handleRotate = () => {
    setRotationY((prev) => (prev + Math.PI / 2) % (Math.PI * 2))
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas
        camera={{ position: [800, 600, 800], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Scene
          rotationY={rotationY}
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
        <button
          onClick={handleRotate}
          style={{
            marginTop: 8,
            padding: '6px 12px',
            cursor: 'pointer',
          }}
        >
          Rotate 90°
        </button>
      </div>
    </div>
  )
}

export default App
