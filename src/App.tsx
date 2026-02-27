import { useState, useRef, useEffect, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { Scene } from './components/Scene'
import type { ToolObjectRef } from './components/ToolObject'
import { Kbd, Button, SegmentedControl, StatusBadge } from './components/ui'
import * as THREE from 'three'
import {
  INITIAL_POSITION,
  NUDGE_STEP,
  QUARTER_TURN,
  TAU,
  SAFE_ZONE_MARGIN,
} from './constants'
import { CAMERA_POSITION, CAMERA_FOV } from './constants/scene'
import { isTypingTarget } from './utils/keyboard'

const INITIAL_POS = new THREE.Vector3(...INITIAL_POSITION)

const VALIDATION_MODE_OPTIONS: { value: boolean; label: string }[] = [
  { value: false, label: 'Reject' },
  { value: true, label: 'Clamp' },
]

function App() {
  const [rotationY, setRotationY] = useState(0)
  const [position, setPosition] = useState<THREE.Vector3>(INITIAL_POS.clone())
  const [isValid, setIsValid] = useState(true)
  const [clampMode, setClampMode] = useState(false)
  const [showBounds, setShowBounds] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [guideExpanded, setGuideExpanded] = useState(true)
  const toolRef = useRef<ToolObjectRef>(null)

  const handleRotate = useCallback(() => {
    setRotationY((prev) => (prev + QUARTER_TURN) % TAU)
  }, [])

  const handlePositionChange = useCallback((pos: THREE.Vector3) => {
    setPosition(pos.clone())
  }, [])

  const handleValidationChange = useCallback((valid: boolean) => setIsValid(valid), [])

  const handleReset = useCallback(() => {
    setRotationY(0)
    setPosition(INITIAL_POS.clone())
    toolRef.current?.reset()
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return
      if (isTypingTarget(e.target as HTMLElement | null)) return
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
    <div className="w-full h-screen relative overflow-hidden">
      <div
        className="w-full h-full cursor-grab data-[dragging]:cursor-grabbing"
        data-dragging={isDragging || undefined}
      >
        <Canvas
          camera={{ position: [...CAMERA_POSITION], fov: CAMERA_FOV }}
          style={{ width: '100%', height: '100%' }}
          gl={{ antialias: true }}
          shadows
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
        className="absolute top-5 left-5 max-w-[320px] max-h-[calc(100vh-2.5rem)] p-5 overflow-y-auto font-sans text-sm text-overlay-text bg-[rgba(15,23,42,0.85)] backdrop-blur-xl border border-[rgba(148,163,184,0.15)] rounded-xl shadow-xl"
        role="region"
        aria-label="Safe zone validation controls and status"
      >
        <h1 className="m-0 mb-1 text-lg font-semibold tracking-tight">Safe Zone Validation</h1>

        <div className="my-3 mb-4 rounded-lg overflow-hidden bg-accent/10 border border-accent/25" role="status">
          <button
            type="button"
            className="flex items-center justify-between w-full px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider text-accent bg-transparent border-none cursor-pointer transition-colors hover:bg-accent/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-[-2px]"
            onClick={() => setGuideExpanded((e) => !e)}
            aria-expanded={guideExpanded}
            aria-controls="guide-steps"
          >
            <span>What to do first</span>
            <span className="text-[10px] opacity-80" aria-hidden>
              {guideExpanded ? '▼' : '▶'}
            </span>
          </button>
          <ol
            id="guide-steps"
            className={`m-0 pl-4 pb-3 text-xs leading-relaxed text-overlay-text overflow-hidden transition-all duration-250 ease-out ${
              guideExpanded ? 'max-h-[200px] opacity-100' : 'max-h-0 pt-0 pb-0 opacity-0'
            }`}
          >
            <li>
              <strong>Drag</strong> the green tool onto the workspace — keep it inside the green rectangle
            </li>
            <li>
              <strong>Orbit</strong> the camera (click + drag) to inspect from different angles
            </li>
            <li>
              Press <Kbd>R</Kbd> to <strong>rotate</strong> the tool 90° and see how its footprint changes
            </li>
            <li>
              Use <Kbd>↑</Kbd><Kbd>↓</Kbd><Kbd>←</Kbd><Kbd>→</Kbd> to <strong>nudge</strong> the tool
            </li>
          </ol>
        </div>

        <p className="m-0 mb-3 text-xs text-overlay-muted leading-snug">
          Keep the tool inside the green safe zone. Red = invalid placement.
        </p>
        <div className="flex flex-col gap-1.5 mb-3 text-[11px] text-overlay-muted">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" /> Green rectangle = {SAFE_ZONE_MARGIN}mm safe zone
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" /> Red tool = outside safe zone
          </span>
        </div>
        {!isValid && (
          <div
            className="mb-3 px-3.5 py-2.5 text-sm font-semibold text-red-50 bg-red-500/45 border border-red-400/50 rounded-lg flex items-center gap-2 animate-pulse motion-reduce:animate-none"
            role="alert"
          >
            <span aria-hidden>⚠</span>
            Move the tool inside the green zone
          </div>
        )}
        <div className="p-3.5 rounded-lg bg-slate-400/10 mb-3">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs text-overlay-muted min-w-[60px]">Position</span>
            <span className="font-mono text-sm">
              X: {Math.round(position.x)} · Z: {Math.round(position.z)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-overlay-muted min-w-[60px]">Status</span>
            <StatusBadge valid={isValid} />
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          <SegmentedControl
            options={VALIDATION_MODE_OPTIONS}
            value={clampMode}
            onChange={setClampMode}
            label="Validation mode"
            labelId="validation-mode-label"
            hint={
              clampMode
                ? 'Invalid positions auto-correct to nearest valid'
                : 'Invalid positions stay put; you must fix manually'
            }
          />
          <div className="flex gap-2">
            <Button onClick={handleRotate} aria-label="Rotate tool 90 degrees">
              Rotate 90° (R)
            </Button>
            <Button variant="secondary" onClick={handleReset} aria-label="Reset tool to center">
              Reset
            </Button>
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer text-sm text-overlay-text">
            <input
              type="checkbox"
              checked={showBounds}
              onChange={(e) => setShowBounds(e.target.checked)}
              aria-describedby="bounds-desc"
              className="w-4 h-4 accent-accent cursor-pointer"
            />
            <span id="bounds-desc">Show footprint bounds (auto when invalid)</span>
          </label>
        </div>
        <div className="mt-4 pt-3 border-t border-[rgba(148,163,184,0.15)] text-[11px] text-overlay-muted leading-relaxed">
          <strong>Shortcuts:</strong> <Kbd>R</Kbd> rotate · <Kbd>↑</Kbd> <Kbd>↓</Kbd> <Kbd>←</Kbd> <Kbd>→</Kbd> nudge
        </div>
      </aside>
    </div>
  )
}

export default App
