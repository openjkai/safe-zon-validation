import { useState, useRef, useEffect, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { Scene } from './components/Scene'
import type { ToolObjectRef } from './components/ToolObject'
import { Kbd, Button, SegmentedControl, StatusBadge, Compass } from './components/ui'
import * as THREE from 'three'
import {
  NUDGE_STEP,
  QUARTER_TURN,
  TAU,
  SAFE_ZONE_MARGIN,
  TOOL_PRESETS,
  getInitialPosition,
} from './constants'
import type { ToolPreset } from './constants/tools'
import { CAMERA_POSITION, CAMERA_FOV } from './constants/scene'
import { isTypingTarget } from './utils/keyboard'

const VALIDATION_MODE_OPTIONS: { value: boolean; label: string }[] = [
  { value: false, label: 'Reject' },
  { value: true, label: 'Clamp' },
]

function App() {
  const [toolPreset, setToolPreset] = useState<ToolPreset>(TOOL_PRESETS[0])
  const [rotationY, setRotationY] = useState(0)
  const [position, setPosition] = useState<THREE.Vector3>(() => {
    const ip = getInitialPosition(TOOL_PRESETS[0].size)
    return new THREE.Vector3(...ip)
  })
  const [isValid, setIsValid] = useState(true)
  const [clampMode, setClampMode] = useState(false)
  const [showBounds, setShowBounds] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [guideExpanded, setGuideExpanded] = useState(true)
  const [cameraAzimuth, setCameraAzimuth] = useState(0)
  const toolRef = useRef<ToolObjectRef>(null)

  const handleRotate = useCallback(() => {
    setRotationY((prev) => (prev + QUARTER_TURN) % TAU)
  }, [])

  const handlePositionChange = useCallback((pos: THREE.Vector3) => {
    setPosition(pos.clone())
  }, [])

  const handleValidationChange = useCallback((valid: boolean) => setIsValid(valid), [])

  const handleToolPresetChange = useCallback((preset: ToolPreset) => {
    setToolPreset(preset)
    const ip = getInitialPosition(preset.size)
    setPosition(new THREE.Vector3(...ip))
    toolRef.current?.reset()
  }, [])

  const handleReset = useCallback(() => {
    setRotationY(0)
    const ip = getInitialPosition(toolPreset.size)
    setPosition(new THREE.Vector3(...ip))
    toolRef.current?.reset()
  }, [toolPreset])

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
            toolPreset={toolPreset}
            rotationY={rotationY}
            clampMode={clampMode}
            showBounds={showBounds || !isValid}
            isDragging={isDragging}
            onCameraAzimuthChange={setCameraAzimuth}
            onPositionChange={handlePositionChange}
            onValidationChange={handleValidationChange}
            onDragChange={setIsDragging}
          />
        </Canvas>
      </div>
      <aside
        className="absolute top-6 left-6 max-w-[380px] w-[min(380px,calc(100vw-5rem))] max-h-[calc(100vh-3rem)] px-4 py-3 overflow-y-auto overflow-x-hidden scroll-smooth panel-scroll font-sans text-sm text-foreground bg-background/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl"
        role="region"
        aria-label="Safe zone validation controls and status"
      >
        <h1 className="m-0 mb-1.5 text-lg font-semibold tracking-tight">Safe Zone Validation</h1>

        <div
          className="mt-3 mb-3 rounded-lg overflow-hidden border border-border bg-muted/50 px-3 py-0.5"
          role="status"
        >
          <button
            type="button"
            className="flex items-center justify-between w-full px-4 py-3 text-xs font-semibold uppercase tracking-wider text-primary bg-transparent border-none cursor-pointer transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 rounded-t-lg"
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
            className={`m-0 pl-5 pr-3 pb-4 pt-1.5 text-sm leading-relaxed text-foreground overflow-y-auto overflow-x-visible transition-all duration-200 ease-out panel-scroll ${
              guideExpanded
                ? 'max-h-[220px] opacity-100'
                : 'max-h-0 pt-0 pb-0 pr-0 opacity-0 overflow-hidden'
            }`}
          >
            <li className="mb-1.5 last:mb-0">
              <strong>Drag</strong> the green tool onto the workspace — keep it inside the green
              rectangle
            </li>
            <li className="mb-1.5 last:mb-0">
              <strong>Orbit</strong> the camera (click + drag) to inspect from different angles
            </li>
            <li className="mb-1.5 last:mb-0">
              Press <Kbd>R</Kbd> to <strong>rotate</strong> the tool 90° and see how its footprint
              changes
            </li>
            <li className="mb-1.5 last:mb-0">
              Use <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              <Kbd>←</Kbd>
              <Kbd>→</Kbd> to <strong>nudge</strong> the tool
            </li>
            <li className="mb-1.5 last:mb-0">
              <strong>Switch</strong> sample tools from the dropdown to test different shapes and
              sizes
            </li>
          </ol>
        </div>

        <p className="m-0 mb-2 text-sm text-muted-foreground leading-snug">
          Keep the tool inside the green safe zone. Red = invalid placement.
        </p>
        <div className="flex flex-col gap-1 mb-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" /> Green rectangle ={' '}
            {SAFE_ZONE_MARGIN}mm safe zone
          </span>
          <span className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" /> Red tool = outside
            safe zone
          </span>
        </div>
        {!isValid && (
          <div
            className="mb-3 px-3 py-2 text-sm font-semibold text-destructive-foreground bg-destructive/40 border border-destructive/50 rounded-lg flex items-center gap-2 animate-pulse motion-reduce:animate-none"
            role="alert"
          >
            <span aria-hidden className="text-base">
              ⚠
            </span>
            Move the tool inside the green zone
          </div>
        )}
        <div className="p-3 rounded-lg bg-card border border-border mb-3">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs text-muted-foreground min-w-[56px]">Position</span>
            <span className="font-mono text-xs">
              X: {Math.round(position.x)} · Z: {Math.round(position.z)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground min-w-[56px]">Status</span>
            <StatusBadge valid={isValid} />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="tool-preset" className="text-xs text-muted-foreground font-medium">
              Sample tool
            </label>
            <select
              id="tool-preset"
              value={toolPreset.id}
              onChange={(e) => {
                const preset = TOOL_PRESETS.find((p) => p.id === e.target.value)
                if (preset) handleToolPresetChange(preset)
              }}
              className="w-full px-3 py-2 text-xs font-medium rounded-lg bg-muted border border-border text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              aria-label="Select sample tool model"
            >
              {TOOL_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} ({p.size.w}×{p.size.d}×{p.size.h}mm)
                </option>
              ))}
            </select>
          </div>
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
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleRotate} aria-label="Rotate tool 90 degrees">
              Rotate 90° (R)
            </Button>
            <Button variant="secondary" onClick={handleReset} aria-label="Reset tool to center">
              Reset
            </Button>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-xs text-foreground py-0.5">
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
        <div className="mt-3 pt-3 border border-muted-foreground/25 rounded-lg bg-muted/60 px-3 py-2 min-w-0">
          <p className="text-xs font-semibold text-foreground mb-1.5">Keyboard shortcuts</p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <span className="flex items-center gap-1 shrink-0">
              <Kbd>R</Kbd>
              <span className="text-muted-foreground">rotate</span>
            </span>
            <span className="text-muted-foreground shrink-0">·</span>
            <span className="flex items-center gap-1 shrink-0">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              <Kbd>←</Kbd>
              <Kbd>→</Kbd>
              <span className="text-muted-foreground">nudge</span>
            </span>
          </div>
        </div>
      </aside>
      <Compass azimuth={cameraAzimuth} />
    </div>
  )
}

export default App
