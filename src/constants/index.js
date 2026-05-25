/**
 * Application Constants
 * Centralized configuration values for the Parking System
 * Avoids magic numbers scattered across components
 */

// ============================================================================
// Path Navigation
// ============================================================================

/** Time in ms before path auto-clears */
export const PATH_TIMEOUT_MS = 5000

/** Center aisle position as percentage (50 = middle) */
export const AISLE_X_PERCENT = 50

/** Delay in ms for spot scroll-into-view animation */
export const SPOT_SCROLL_DELAY_MS = 1000

/** Delay in ms for spot status check after activation */
export const SPOT_STATUS_CHECK_DELAY_MS = 500

/** Max time in ms before a reserved spot auto-reverts to free (2 minutes) */
export const QR_PATH_TIMEOUT_MS = 120000

// ============================================================================
// Tooltip
// ============================================================================

/** Auto-dismiss timeout in ms for tooltip */
export const TOOLTIP_AUTO_DISMISS_MS = 5000

// ============================================================================
// Spot Dimensions (pixels)
// ============================================================================

export const SPOT_DEFAULT_WIDTH = 130
export const SPOT_DEFAULT_HEIGHT = 75

/** Minimum spot size for responsive scaling */
export const SPOT_MIN_WIDTH = 64
export const SPOT_MIN_HEIGHT = 42

/** Maximum spot size for responsive scaling */
export const SPOT_MAX_WIDTH = 130
export const SPOT_MAX_HEIGHT = 75

// ============================================================================
// Spot Status Codes
// ============================================================================

export const SPOT_STATUS = {
  FREE: 0,
  OCCUPIED: 1,
  RESERVED: 2,
  MAINTENANCE: 3
}

/** Status label i18n key mapping */
export const SPOT_LABEL_KEYS = {
  [SPOT_STATUS.FREE]: 'spot.free',
  [SPOT_STATUS.OCCUPIED]: 'spot.occupied',
  [SPOT_STATUS.RESERVED]: 'spot.reserved',
  [SPOT_STATUS.MAINTENANCE]: 'spot.maintenance'
}

/** Status CSS class mapping */
export const SPOT_CLASSES = {
  [SPOT_STATUS.FREE]: 'is-free',
  [SPOT_STATUS.OCCUPIED]: 'is-occupied',
  [SPOT_STATUS.RESERVED]: 'is-reserved',
  [SPOT_STATUS.MAINTENANCE]: 'is-maintenance'
}

// ============================================================================
// Colors
// ============================================================================

export const COLORS = {
  // Path gradient
  PATH_GRADIENT_START: '#f59e0b',
  PATH_GRADIENT_END: '#fbbf24',

  // Path glow
  PATH_GLOW_COLOR: 'rgba(245, 158, 11, 0.7)',
  PATH_END_GLOW: 'rgba(251, 191, 36, 0.7)',

  // Node colors
  NODE_START: '#f59e0b',
  NODE_END: '#fbbf24',
  NODE_STROKE: 'rgba(255, 255, 255, 0.8)'
}

// ============================================================================
// Responsive Breakpoints
// ============================================================================

export const BREAKPOINTS = {
  MOBILE: 480,
  TABLET: 768,
  DESKTOP: 1024
}

// ============================================================================
// Animation Durations (ms)
// ============================================================================

export const ANIMATION = {
  FADE_IN: 400,
  RAMP_FADE_IN: 300,
  POP_IN: 300,
  TOOLTIP: 200,
  SPOT_PULSE: 1500,
  REDUCED: 0
}

// ============================================================================
// Floor Configuration
// ============================================================================

export const FLOOR_CONFIG = {
  SPOTS_PER_ROW: 5,
  ROWS_PER_FLOOR: 3,

  /** Section names per floor */
  FLOOR_1_SECTIONS: ['A', 'B'],
  FLOOR_2_SECTIONS: ['C']
}

// ============================================================================
// Firebase Keys
// ============================================================================

export const FIREBASE_PATHS = {
  GARAGE_ROOT: 'Garage',
  MANUAL: 'Manual',
  FLOOR_1: 'Floor1',
  FLOOR_2: 'Floor2',
  FLOOR_3: 'Floor3'
}

/** Gate state values */
export const GATE_STATE = {
  CLOSED: 0,
  OPEN: 1
}

/**
 * Maps spot ID prefix to Firebase floor path.
 * A → Floor1, B → Floor2, C → Floor3
 * @param {string} spotId - Spot identifier (e.g. "A1", "B3", "C5")
 * @returns {string|null} Firebase floor path, or null if unrecognized
 */
export function getFirebasePathFromSpotId(spotId) {
  const prefix = spotId.charAt(0).toUpperCase()
  const MAP = {
    A: FIREBASE_PATHS.FLOOR_1,
    B: FIREBASE_PATHS.FLOOR_2,
    C: FIREBASE_PATHS.FLOOR_3
  }
  return MAP[prefix] || null
}

// ============================================================================
// Spot Utilities
// ============================================================================

/**
 * Determines which floor a spot belongs to based on its ID prefix.
 * @param {string} spotId - Spot identifier (e.g. "A1", "B3", "C5")
 * @returns {number|null} Floor number (1 or 2), or null if unrecognized
 */
export function getFloorFromSpotId(spotId) {
  const prefix = spotId.charAt(0).toUpperCase();
  if (prefix === "A" || prefix === "B") return 1;
  if (prefix === "C") return 2;
  return null;
}
