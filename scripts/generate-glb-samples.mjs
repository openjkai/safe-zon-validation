#!/usr/bin/env node
/**
 * Generates sample GLB files for the Safe Zone Validation demo.
 * Includes simple primitives and complex tool-like models for client demos.
 * Run: node scripts/generate-glb-samples.mjs
 * Output: public/models/*.glb
 */
import '@lyleunderwood/filereader-polyfill'
import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MODELS_DIR = join(__dirname, '..', 'public', 'models')
const GREEN = 0x22c55e

function createBoxScene(w, h, d) {
  const scene = new THREE.Scene()
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color: GREEN })
  )
  scene.add(mesh)
  return scene
}

function createCylinderScene(radius, height) {
  const scene = new THREE.Scene()
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, height, 24),
    new THREE.MeshStandardMaterial({ color: GREEN })
  )
  scene.add(mesh)
  return scene
}

/**
 * CNC spindle / milling head style: base plate + column + spindle housing.
 * Visually impressive for manufacturing demos.
 */
function createCncSpindleScene() {
  const group = new THREE.Group()
  const mat = new THREE.MeshStandardMaterial({ color: GREEN })

  // Base plate 120×15×80 mm
  const base = new THREE.Mesh(new THREE.BoxGeometry(120, 15, 80), mat)
  base.position.y = 7.5
  group.add(base)

  // Column (cylinder) r=22, h=55
  const column = new THREE.Mesh(new THREE.CylinderGeometry(22, 22, 55, 24), mat)
  column.position.y = 15 + 27.5
  group.add(column)

  // Spindle housing (box on top)
  const housing = new THREE.Mesh(new THREE.BoxGeometry(55, 45, 55), mat)
  housing.position.y = 15 + 55 + 22.5
  group.add(housing)

  // Small tool holder (cylinder)
  const toolHolder = new THREE.Mesh(new THREE.CylinderGeometry(12, 12, 25, 16), mat)
  toolHolder.position.y = 15 + 55 + 45 + 12.5
  group.add(toolHolder)

  const scene = new THREE.Scene()
  scene.add(group)
  return scene
}

/**
 * L-shaped fixture: horizontal arm + vertical post.
 * Common in jigs and workholding.
 */
function createLFixtureScene() {
  const group = new THREE.Group()
  const mat = new THREE.MeshStandardMaterial({ color: GREEN })

  // Horizontal arm 100×35×45
  const arm = new THREE.Mesh(new THREE.BoxGeometry(100, 35, 45), mat)
  arm.position.set(0, 17.5, 0)
  group.add(arm)

  // Vertical post 45×65×40 at one end
  const post = new THREE.Mesh(new THREE.BoxGeometry(45, 65, 40), mat)
  post.position.set(55, 35 + 32.5, 0)
  group.add(post)

  // Reinforcing gusset (small triangle-like wedge)
  const gusset = new THREE.Mesh(new THREE.BoxGeometry(20, 25, 45), mat)
  gusset.position.set(32.5, 35 + 12.5, 0)
  gusset.rotation.z = -0.4
  group.add(gusset)

  const scene = new THREE.Scene()
  scene.add(group)
  return scene
}

/**
 * Stepped fixture plate: tiered blocks suggesting a vise or clamp base.
 */
function createSteppedFixtureScene() {
  const group = new THREE.Group()
  const mat = new THREE.MeshStandardMaterial({ color: GREEN })

  // Bottom tier 140×25×75
  const tier1 = new THREE.Mesh(new THREE.BoxGeometry(140, 25, 75), mat)
  tier1.position.y = 12.5
  group.add(tier1)

  // Middle tier 100×30×55
  const tier2 = new THREE.Mesh(new THREE.BoxGeometry(100, 30, 55), mat)
  tier2.position.y = 25 + 15
  group.add(tier2)

  // Top tier 65×35×35
  const tier3 = new THREE.Mesh(new THREE.BoxGeometry(65, 35, 35), mat)
  tier3.position.y = 25 + 30 + 17.5
  group.add(tier3)

  const scene = new THREE.Scene()
  scene.add(group)
  return scene
}

/**
 * Drill-press / Z-axis style: column, arm, head.
 * Very recognizable industrial form.
 */
function createDrillPressScene() {
  const group = new THREE.Group()
  const mat = new THREE.MeshStandardMaterial({ color: GREEN })

  // Base 100×20×70
  const base = new THREE.Mesh(new THREE.BoxGeometry(100, 20, 70), mat)
  base.position.y = 10
  group.add(base)

  // Column 25×80×25 (rectangular)
  const column = new THREE.Mesh(new THREE.BoxGeometry(25, 80, 25), mat)
  column.position.y = 20 + 40
  group.add(column)

  // Horizontal arm 120×25×30
  const arm = new THREE.Mesh(new THREE.BoxGeometry(120, 25, 30), mat)
  arm.position.y = 20 + 80 + 12.5
  group.add(arm)

  // Spindle head (cylinder)
  const head = new THREE.Mesh(new THREE.CylinderGeometry(20, 25, 40, 20), mat)
  head.position.y = 20 + 80 + 25 + 20
  group.add(head)

  const scene = new THREE.Scene()
  scene.add(group)
  return scene
}

async function exportGLB(scene, filepath) {
  const exporter = new GLTFExporter()
  const buffer = await exporter.parseAsync(scene, { binary: true })
  writeFileSync(filepath, Buffer.from(buffer))
  console.log(`  Wrote ${filepath}`)
}

async function main() {
  console.log('Generating sample GLB files...\n')

  // Simple primitives
  await exportGLB(createBoxScene(120, 40, 60), join(MODELS_DIR, 'box.glb'))
  await exportGLB(createCylinderScene(40, 45), join(MODELS_DIR, 'cylinder.glb'))

  // Complex tool-like models
  await exportGLB(createCncSpindleScene(), join(MODELS_DIR, 'cnc-spindle.glb'))
  await exportGLB(createLFixtureScene(), join(MODELS_DIR, 'l-fixture.glb'))
  await exportGLB(createSteppedFixtureScene(), join(MODELS_DIR, 'stepped-fixture.glb'))
  await exportGLB(createDrillPressScene(), join(MODELS_DIR, 'drill-press.glb'))

  console.log('\nDone. Wire glbPath and size in src/constants/tools.ts')
}

main().catch(console.error)
