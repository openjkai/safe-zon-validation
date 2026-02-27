#!/usr/bin/env node
/**
 * Release script: bumps package.json version and updates CHANGELOG.md
 *
 * Usage:
 *   node scripts/release.js [patch|minor|major]
 *   npm run release -- patch
 *   npm run release -- minor
 *   npm run release -- major
 *
 * Default: patch
 */

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const type = process.argv[2] || 'patch'
if (!['patch', 'minor', 'major'].includes(type)) {
  console.error('Usage: node scripts/release.js [patch|minor|major]')
  process.exit(1)
}

// Read package.json
const pkgPath = join(root, 'package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))

const [major, minor, patch] = pkg.version.split('.').map(Number)
let newVersion
switch (type) {
  case 'major':
    newVersion = `${major + 1}.0.0`
    break
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`
    break
  default:
    newVersion = `${major}.${minor}.${patch + 1}`
}

// Update package.json
const oldVersion = pkg.version
pkg.version = newVersion
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
console.log(`Updated package.json: ${oldVersion} -> ${newVersion}`)

// Update CHANGELOG.md
const changelogPath = join(root, 'CHANGELOG.md')
let changelog = readFileSync(changelogPath, 'utf-8')

const today = new Date().toISOString().slice(0, 10)

// Replace [Unreleased] section with new version (keep previous version block)
const unreleasedRegex = /## \[Unreleased\]\n\n(## \[\d+\.\d+\.\d+\] - \d{4}-\d{2}-\d{2}\n)/s
const match = changelog.match(unreleasedRegex)

if (match) {
  changelog = changelog.replace(
    unreleasedRegex,
    `## [Unreleased]

## [${newVersion}] - ${today}

${match[1]}`
  )
} else {
  changelog = changelog.replace(
    '## [Unreleased]\n',
    `## [Unreleased]\n\n## [${newVersion}] - ${today}\n\n### Changed\n\n- Bump version to ${newVersion}\n\n`
  )
}

writeFileSync(changelogPath, changelog)
console.log(`Updated CHANGELOG.md: added [${newVersion}] - ${today}`)

console.log(`\nReleased version ${newVersion} (${type})`)
console.log(
  'Run `git add . && git commit -m "chore: release v' +
    newVersion +
    '" && git tag v' +
    newVersion +
    '` to commit and tag.'
)
