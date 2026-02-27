# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-02-27

### Added

- Safe zone validation with 10 mm margin
- Draggable tool with plane-raycast interaction
- Reject and Clamp validation modes
- 90° rotation (R key) with footprint updates
- Arrow key nudge (↑↓←→)
- Collapsible "What to do first" guide
- Compass in upper-right that rotates with camera orbit
- OrbitControls disabled while dragging (fixes camera drift)
- Shadcn-style dark theme with Tailwind CSS v4
- Constants, lib, utils structure (DRY refactor)
- UI components: Kbd, Button, SegmentedControl, StatusBadge, Compass
- Build pipeline: format → format:check → lint → tsc → vite build
- `npm run release` script for version bumping
- CHANGELOG.md

### Changed

- Removed redundant `node_modules` from ESLint `globalIgnores`
- Migrated overlay styling to Tailwind utilities
- Centralized magic numbers in constants modules
- Enlarged guide panel and shortcuts visibility
