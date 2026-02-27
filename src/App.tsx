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
  const [showBounds, setShowBounds] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const toolRef = useRef<ToolObjectRef>(null)

  const handleRotate = useCallback(() => {
    setRotationY((prev) => (prev + Math.PI / 2) % (Math.PI * 2))
  }, [])

  const handlePositionChange = useCallback((pos: THREE.Vector3) => {
    setPosition(pos.clone())
  }, [])

  const handleValidationChange = useCallback((valid: boolean) => setIsValid(valid), [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return
      const target = e.target as HTMLElement | null
      if (target?.matches('input, textarea, [contenteditable="true"]')) return
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
    <div className="demo-root">
      <div className="canvas-wrapper" data-dragging={isDragging || undefined}>
        <Canvas
          camera={{ position: [800, 600, 800], fov: 45 }}
          style={{ width: '100%', height: '100%' }}
          gl={{ antialias: true }}
        >
          <Scene
            ref={toolRef}
            rotationY={rotationY}
            clampMode={clampMode}
            showBounds={showBounds || !isValid}
            onPositionChange={handlePositionChange}
            onValidationChange={handleValidationChange}
            onDragChange={setIsDragging}
          />
        </Canvas>
      </div>
      <aside
        className="demo-overlay"
        role="region"
        aria-label="Safe zone validation controls and status"
      >
        <h1>Safe Zone Validation</h1>
        <p className="subtitle">
          Drag the tool within the safe zone. Rotate to see footprint update.
        </p>
        <div className="legend">
          <span className="legend-item">
            <span className="legend-dot legend-dot--safe" /> Green inset = 10mm safe zone
          </span>
          <span className="legend-item">
            <span className="legend-dot legend-dot--invalid" /> Red tool = invalid placement
          </span>
        </div>
        {!isValid && (
          <div className="invalid-banner" role="alert">
            Outside safe zone
          </div>
        )}
        <div className="data-row">
          <span className="data-label">Position</span>
          <span className="data-value">
            X: {Math.round(position.x)} · Z: {Math.round(position.z)}
          </span>
        </div>
        <div className="data-row">
          <span className="data-label">Status</span>
          <span className={`status-pill ${isValid ? 'valid' : 'invalid'}`} role="status">
            {isValid ? 'Valid' : 'Invalid'}
          </span>
        </div>
        <div className="controls">
          <div className="control-group">
            <span className="control-label" id="validation-mode-label">
              Validation mode
            </span>
            <div className="segmented-control" role="group" aria-labelledby="validation-mode-label">
              <button
                type="button"
                className={`segmented-option ${!clampMode ? 'segmented-option--active' : ''}`}
                onClick={() => setClampMode(false)}
                aria-pressed={!clampMode}
              >
                Reject
              </button>
              <button
                type="button"
                className={`segmented-option ${clampMode ? 'segmented-option--active' : ''}`}
                onClick={() => setClampMode(true)}
                aria-pressed={clampMode}
              >
                Clamp
              </button>
            </div>
            <span className="control-hint">
              {clampMode
                ? 'Invalid positions auto-correct to nearest valid'
                : 'Invalid positions stay put; you must fix manually'}
            </span>
          </div>
          <button onClick={handleRotate} aria-label="Rotate tool 90 degrees">
            Rotate 90° (R)
          </button>
          <label>
            <input
              type="checkbox"
              checked={showBounds}
              onChange={(e) => setShowBounds(e.target.checked)}
              aria-describedby="bounds-desc"
            />
            <span id="bounds-desc">Show footprint bounds (auto when invalid)</span>
          </label>
        </div>
        <div className="shortcuts">
          <strong>Shortcuts:</strong> <kbd>R</kbd> rotate · <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd>{' '}
          <kbd>→</kbd> nudge
        </div>
      </aside>
    </div>
  )
}

export default App
