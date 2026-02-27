import { useState, useRef, useEffect, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { Scene } from './components/Scene'
import type { ToolObjectRef } from './components/ToolObject'
import * as THREE from 'three'

const INITIAL_POS = new THREE.Vector3(600, 20, 300)
const NUDGE_STEP = 10

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
    setRotationY((prev) => (prev + Math.PI / 2) % (Math.PI * 2))
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
    <div className="w-full h-screen relative overflow-hidden">
      <div
        className="w-full h-full cursor-grab data-[dragging]:cursor-grabbing"
        data-dragging={isDragging || undefined}
      >
        <Canvas
          camera={{ position: [800, 600, 800], fov: 45 }}
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
              Press <kbd>R</kbd> to <strong>rotate</strong> the tool 90° and see how its footprint changes
            </li>
            <li>
              Use <kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd> to <strong>nudge</strong> the tool
            </li>
          </ol>
        </div>

        <p className="m-0 mb-3 text-xs text-overlay-muted leading-snug">
          Keep the tool inside the green safe zone. Red = invalid placement.
        </p>
        <div className="flex flex-col gap-1.5 mb-3 text-[11px] text-overlay-muted">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" /> Green rectangle = 10mm safe zone
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
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-current ${
                isValid ? 'bg-status-valid-bg text-status-valid-text' : 'bg-status-invalid-bg text-status-invalid-text'
              }`}
              role="status"
            >
              {isValid ? 'Valid' : 'Invalid'}
            </span>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-overlay-muted" id="validation-mode-label">
              Validation mode
            </span>
            <div className="flex rounded-lg bg-slate-400/10 p-0.5" role="group" aria-labelledby="validation-mode-label">
              <button
                type="button"
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md border-none cursor-pointer transition-all ${
                  !clampMode ? 'text-overlay-text bg-slate-400/20' : 'text-overlay-muted bg-transparent hover:text-overlay-text'
                }`}
                onClick={() => setClampMode(false)}
                aria-pressed={!clampMode}
              >
                Reject
              </button>
              <button
                type="button"
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md border-none cursor-pointer transition-all ${
                  clampMode ? 'text-overlay-text bg-slate-400/20' : 'text-overlay-muted bg-transparent hover:text-overlay-text'
                }`}
                onClick={() => setClampMode(true)}
                aria-pressed={clampMode}
              >
                Clamp
              </button>
            </div>
            <span className="text-[11px] text-overlay-muted leading-snug">
              {clampMode
                ? 'Invalid positions auto-correct to nearest valid'
                : 'Invalid positions stay put; you must fix manually'}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRotate}
              aria-label="Rotate tool 90 degrees"
              className="flex-1 px-3.5 py-2.5 text-sm font-medium text-overlay-text bg-slate-400/15 border border-[rgba(148,163,184,0.15)] rounded-lg cursor-pointer transition-all hover:bg-slate-400/25 hover:border-slate-400/30 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            >
              Rotate 90° (R)
            </button>
            <button
              onClick={handleReset}
              aria-label="Reset tool to center"
              className="flex-1 px-3.5 py-2.5 text-sm font-medium text-overlay-text bg-slate-400/10 border border-slate-400/20 rounded-lg cursor-pointer transition-all hover:bg-slate-400/25 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            >
              Reset
            </button>
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
          <strong>Shortcuts:</strong> <kbd className="inline-block px-1.5 py-0.5 mx-0.5 font-mono text-[10px] bg-slate-400/15 rounded">R</kbd> rotate ·{' '}
          <kbd className="inline-block px-1.5 py-0.5 mx-0.5 font-mono text-[10px] bg-slate-400/15 rounded">↑</kbd>{' '}
          <kbd className="inline-block px-1.5 py-0.5 mx-0.5 font-mono text-[10px] bg-slate-400/15 rounded">↓</kbd>{' '}
          <kbd className="inline-block px-1.5 py-0.5 mx-0.5 font-mono text-[10px] bg-slate-400/15 rounded">←</kbd>{' '}
          <kbd className="inline-block px-1.5 py-0.5 mx-0.5 font-mono text-[10px] bg-slate-400/15 rounded">→</kbd> nudge
        </div>
      </aside>
    </div>
  )
}

export default App
