/** Camera settings */
export const CAMERA_POSITION = [800, 600, 800] as const
export const CAMERA_FOV = 45

/** OrbitControls target (center of scene, same Y as plane) */
export const ORBIT_TARGET = [600, 0, 300] as const

/** OrbitControls polar angle limits (radians) */
export const ORBIT_MIN_POLAR_ANGLE = 0.15
export const ORBIT_MAX_POLAR_ANGLE = Math.PI / 2 + 0.4
export const ORBIT_DAMPING_FACTOR = 0.05

/** Lighting */
export const AMBIENT_LIGHT_INTENSITY = 0.5
export const HEMISPHERE_LIGHT: [string, string, number] = ['#ffffff', '#64748b', 0.6]
export const HEMISPHERE_LIGHT_POSITION = [0, 400, 0] as const
export const MAIN_LIGHT_POSITION = [800, 600, 800] as const
export const MAIN_LIGHT_INTENSITY = 1.2
export const FILL_LIGHT_POSITION = [-400, 200, -400] as const
export const FILL_LIGHT_INTENSITY = 0.5
export const BOTTOM_LIGHT_POSITION = [0, -300, 400] as const
export const BOTTOM_LIGHT_INTENSITY = 0.3

/** Shadow */
export const SHADOW_MAP_SIZE = 2048
export const SHADOW_CAMERA_FAR = 2000
export const SHADOW_CAMERA_BOUNDS = 700

/** Grid */
export const GRID_CELL_SIZE = 60
export const GRID_CELL_THICKNESS = 0.5
export const GRID_SECTION_SIZE = 300
export const GRID_SECTION_THICKNESS = 1
export const GRID_OFFSET_Y = 0.1
export const GRID_FADE_FACTOR = 0.8
export const GRID_FADE_STRENGTH = 1

/** Safe zone line (local Y for line geometry) */
export const SAFE_ZONE_LINE_Y = 0.5

/** Plane rotation (horizontal) */
export const PLANE_ROTATION_X = -Math.PI / 2
