import { useState, useRef, useEffect, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { Scene } from './components/Scene'
import type { ToolObjectRef } from './components/ToolObject'
import { Kbd, Button, SegmentedControl, StatusBadge, Compass } from './components/ui'
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
            isDragging={isDragging}
            onPositionChange={handlePositionChange}
            onValidationChange={handleValidationChange}
            onDragChange={setIsDragging}
          />
        </Canvas>
      </div>
      <aside
        className="absolute top-6 left-6 max-w-[440px] w-[min(440px,calc(100vw-6rem))] max-h-[calc(100vh-3rem)] min-h-[420px] p-7 overflow-y-auto font-sans text-base text-foreground bg-background/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl"
        role="region"
        aria-label="Safe zone validation controls and status"
      >
        <h1 className="m-0 mb-3 text-2xl font-semibold tracking-tight">Safe Zone Validation</h1>

        <div className="mt-7 mb-7 rounded-lg overflow-hidden border border-border bg-muted/50" role="status">
          <button
            type="button"
            className="flex items-center justify-between w-full px-5 py-4 text-sm font-semibold uppercase tracking-wider text-primary bg-transparent border-none cursor-pointer transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 rounded-t-lg"
            onClick={() => setGuideExpanded((e) => !e)}
            aria-expanded={guideExpanded}
            aria-controls="guide-steps"
          >
            <span>What to do first</span>
            <span className="text-xs opacity-70" aria-hidden>
              {guideExpanded ? '▼' : '▶'}
            </span>
          </button>
          <ol
            id="guide-steps"
            className={`m-0 pl-6 pr-5 pb-5 pt-2 text-base leading-relaxed text-foreground overflow-hidden transition-all duration-250 ease-out ${
              guideExpanded ? 'max-h-[280px] opacity-100' : 'max-h-0 pt-0 pb-0 pr-5 opacity-0'
            }`}
          >
            <li className="mb-2 last:mb-0">
              <strong>Drag</strong> the green tool onto the workspace — keep it inside the green rectangle
            </li>
            <li className="mb-2 last:mb-0">
              <strong>Orbit</strong> the camera (click + drag) to inspect from different angles
            </li>
            <li className="mb-2 last:mb-0">
              Press <Kbd>R</Kbd> to <strong>rotate</strong> the tool 90° and see how its footprint changes
            </li>
            <li className="mb-2 last:mb-0">
              Use <Kbd>↑</Kbd><Kbd>↓</Kbd><Kbd>←</Kbd><Kbd>→</Kbd> to <strong>nudge</strong> the tool
            </li>
          </ol>
        </div>

        <p className="m-0 mb-4 text-sm text-muted-foreground leading-snug">
          Keep the tool inside the green safe zone. Red = invalid placement.
        </p>
        <div className="flex flex-col gap-2 mb-5 text-sm text-muted-foreground">
          <span className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" /> Green rectangle = {SAFE_ZONE_MARGIN}mm safe zone
          </span>
          <span className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" /> Red tool = outside safe zone
          </span>
        </div>
        {!isValid && (
          <div
            className="mb-5 px-4 py-3 text-sm font-semibold text-destructive-foreground bg-destructive/40 border border-destructive/50 rounded-lg flex items-center gap-3 animate-pulse motion-reduce:animate-none"
            role="alert"
          >
            <span aria-hidden className="text-base">⚠</span>
            Move the tool inside the green zone
          </div>
        )}
        <div className="p-4 rounded-lg bg-card border border-border mb-6">
          <div className="flex items-center gap-4 mb-3">
            <span className="text-sm text-muted-foreground min-w-[72px]">Position</span>
            <span className="font-mono text-sm">
              X: {Math.round(position.x)} · Z: {Math.round(position.z)}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground min-w-[72px]">Status</span>
            <StatusBadge valid={isValid} />
          </div>
        </div>
        <div className="flex flex-col gap-5">
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
          <div className="flex gap-3">
            <Button onClick={handleRotate} aria-label="Rotate tool 90 degrees">
              Rotate 90° (R)
            </Button>
            <Button variant="secondary" onClick={handleReset} aria-label="Reset tool to center">
              Reset
            </Button>
          </div>
          <label className="flex items-center gap-3 cursor-pointer text-sm text-foreground py-1">
            <input
              type="checkbox"
              checked={showBounds}
              onChange={(e) => setShowBounds(e.target.checked)}
              aria-describedby="bounds-desc"
              className="w-4 h-4 accent-primary cursor-pointer rounded"
            />
            <span id="bounds-desc">Show footprint bounds (auto when invalid)</span>
          </label>
        </div>
        <div className="mt-6 pt-5 border-t-2 border-border rounded-lg bg-muted/60 p-4">
          <p className="text-sm font-semibold text-foreground mb-2">Keyboard shortcuts</p>
          <div className="flex flex-wrap items-center gap-2 text-base">
            <span className="flex items-center gap-1.5">
              <Kbd>R</Kbd>
              <span className="text-muted-foreground">rotate</span>
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="flex items-center gap-1.5">
              <Kbd>↑</Kbd><Kbd>↓</Kbd><Kbd>←</Kbd><Kbd>→</Kbd>
              <span className="text-muted-foreground">nudge tool</span>
            </span>
          </div>
        </div>
      </aside>
      <Compass />
    </div>
  )
}

export default App
