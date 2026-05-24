import { createStore } from "vuex";
import { database, ref, onValue, set, serverTimestamp } from "../firebase/config";
import { SPOT_STATUS, FIREBASE_PATHS, GATE_STATE } from "../constants";
import { getFirebasePathFromSpotId } from "../constants";
import i18n from "../i18n";
import auth from "./modules/auth";

/**
 * Module-level reference to the prefers-color-scheme MediaQueryList.
 * Used to attach/detach the system theme change listener.
 * @type {MediaQueryList|null}
 */
let _systemMedia = null;

/**
 * Stored dispatch reference for system theme change handler.
 * Set during initTheme, avoids circular dependency.
 * @type {Function|null}
 */
let _dispatch = null;

/**
 * Handles system theme changes when in "system" mode.
 * @param {MediaQueryListEvent} e
 */
function _onSystemThemeChange(e) {
  if (_dispatch) {
    _dispatch("setTheme", e.matches ? "dark" : "light");
  }
}

/**
 * Attaches the prefers-color-scheme change listener.
 * @param {Function} dispatch - Vuex dispatch
 */
function attachSystemListener(dispatch) {
  if (typeof window === "undefined" || !window.matchMedia) return;
  detachSystemListener();
  _dispatch = dispatch;
  _systemMedia = window.matchMedia("(prefers-color-scheme: dark)");
  _systemMedia.addEventListener("change", _onSystemThemeChange);
}

/**
 * Detaches the prefers-color-scheme change listener.
 */
function detachSystemListener() {
  if (_systemMedia) {
    _systemMedia.removeEventListener("change", _onSystemThemeChange);
    _systemMedia = null;
  }
  _dispatch = null;
}

/**
 * Default spot data for Floor 1 (Section A)
 * @type {Object}
 */
const FIREBASE_FLOOR1_SPOTS = {
  A1: SPOT_STATUS.FREE,
  A2: SPOT_STATUS.FREE,
  A3: SPOT_STATUS.FREE,
  A4: SPOT_STATUS.FREE,
  A5: SPOT_STATUS.MAINTENANCE
};

/**
 * Default spot data for Floor 2 (Section B)
 * @type {Object}
 */
const FIREBASE_FLOOR2_SPOTS = {
  B1: SPOT_STATUS.FREE,
  B2: SPOT_STATUS.FREE,
  B3: SPOT_STATUS.FREE,
  B4: SPOT_STATUS.FREE,
  B5: SPOT_STATUS.FREE
};

/**
 * Default spot data for Floor 3 (Section C - upper floor)
 * @type {Object}
 */
const FIREBASE_FLOOR3_SPOTS = {
  C1: SPOT_STATUS.FREE,
  C2: SPOT_STATUS.FREE,
  C3: SPOT_STATUS.FREE,
  C4: SPOT_STATUS.FREE,
  C5: SPOT_STATUS.FREE
};

/**
 * Gets initial theme based on system preference.
 * @returns {"dark"|"light"} Theme name
 */
function getInitialTheme() {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "dark";
}

/**
 * Parses a single floor's data from Firebase snapshot.
 * @param {Object} data - Raw Firebase data
 * @param {string} floorPath - Firebase path key for the floor
 * @param {Object} defaultSpots - Default spot configuration
 * @param {Object} target - Target object to populate
 * @returns {void}
 */
function parseFloor(data, floorPath, defaultSpots, target, metaTarget) {
  if (data[floorPath]) {
    Object.keys(defaultSpots).forEach(spot => {
      const spotData = data[floorPath][spot];
      target[spot] = (spotData && spotData.status !== undefined)
        ? spotData.status
        : SPOT_STATUS.FREE;
      metaTarget[spot] = { updatedAt: spotData?.updatedAt ?? null };
    });
  }
}

/**
 * Parses Firebase snapshot data into floor spot objects.
 * @param {DataSnapshot} snapshot - Firebase data snapshot
 * @returns {{bottomFloor: Object, topFloor: Object}} Parsed spot data
 */
function parseFirebaseData(snapshot) {
  const data = snapshot.val();

  const bottomFloor = {};
  const topFloor = {};
  const meta = { floor1: {}, floor2: {}, floor3: {} };

  if (data) {
    parseFloor(data, FIREBASE_PATHS.FLOOR_1, FIREBASE_FLOOR1_SPOTS, bottomFloor, meta.floor1);
    parseFloor(data, FIREBASE_PATHS.FLOOR_2, FIREBASE_FLOOR2_SPOTS, bottomFloor, meta.floor2);
    parseFloor(data, FIREBASE_PATHS.FLOOR_3, FIREBASE_FLOOR3_SPOTS, topFloor, meta.floor3);
  }

  return { bottomFloor, topFloor, meta };
}

/**
 * Vuex Store for parking application.
 * Manages spot data, theme, and Firebase sync.
 * @type {import('vuex').Store}
 */
export default createStore({
  /**
   * Application state
   * @type {Object}
   */
  state: {
    spots: {
      floor1: { ...FIREBASE_FLOOR1_SPOTS, ...FIREBASE_FLOOR2_SPOTS },
      floor2: { ...FIREBASE_FLOOR3_SPOTS }
    },
    gateState: { emergency: GATE_STATE.CLOSED, entry: GATE_STATE.CLOSED, exit: GATE_STATE.CLOSED },
    theme: getInitialTheme(),
    firebaseInitialized: false,
    firebaseError: false,
    isUpdatingSpot: false,
    themeMode: "system",
    spotMeta: { floor1: {}, floor2: {}, floor3: {} },
    lastUpdated: null,
    locale: typeof localStorage !== "undefined" ? (localStorage.getItem("locale") || "ar") : "ar"
  },

  /**
   * State getters
   * @type {Object}
   */
  getters: {
    /** All spots object */
    getSpots: (state) => state.spots,

    /** Floor 1 spots (A & B sections) */
    getFloor1Spots: (state) => state.spots.floor1,

    /** Floor 2 spots (C section) */
    getFloor2Spots: (state) => state.spots.floor2,

    /**
     * Get single spot status
     * @param {Object} state - Store state
     * @returns {Function} Getter function
     */
    getSpotStatus: (state) => (floor, spot) => {
      return state.spots[floor]?.[spot] ?? SPOT_STATUS.FREE;
    },

    /** Gate state from Manual/ node */
    getGateState: (state) => state.gateState,

    /** Whether dark theme is active */
    isDark: (state) => state.theme === "dark",

    /** Current theme value */
    currentTheme: (state) => state.theme,

    /** Whether Firebase is connected */
    isFirebaseInitialized: (state) => state.firebaseInitialized,

    /** Whether Firebase initialization failed */
    hasFirebaseError: (state) => state.firebaseError,

    /** Whether a spot status update is in progress */
    isUpdatingSpot: (state) => state.isUpdatingSpot,

    /** Current theme mode: "system" | "dark" | "light" */
    themeMode: (state) => state.themeMode,

    /** Per-spot metadata (updatedAt timestamps) */
    getSpotMeta: (state) => state.spotMeta,

    /** Global last updated timestamp */
    getLastUpdated: (state) => state.lastUpdated,

    /** Current locale */
    currentLocale: (state) => state.locale,

    /**
     * Get elapsed duration for a spot in milliseconds.
     * Returns null if no updatedAt available.
     */
    getSpotDuration: (state) => (floorIndex, spotId) => {
      const meta = state.spotMeta[`floor${floorIndex}`]?.[spotId];
      if (!meta?.updatedAt) return null;
      return Date.now() - meta.updatedAt;
    }
  },

  /**
   * State mutations
   * @type {Object}
   */
  mutations: {
    /**
     * Updates spot data from Firebase
     * @param {Object} state - Store state
     * @param {Object} payload - {bottomFloor, topFloor}
     */
    SET_SPOTS(state, { bottomFloor, topFloor }) {
      state.spots.floor1 = { ...FIREBASE_FLOOR1_SPOTS, ...FIREBASE_FLOOR2_SPOTS, ...bottomFloor };
      state.spots.floor2 = { ...FIREBASE_FLOOR3_SPOTS, ...topFloor };
    },

    /**
     * Sets theme
     * @param {Object} state - Store state
     * @param {string} theme - Theme name
     */
    SET_THEME(state, theme) {
      state.theme = theme;
    },

    SET_THEME_MODE(state, mode) {
      state.themeMode = mode;
    },

    /**
     * Sets Firebase initialization flag
     * @param {Object} state - Store state
     * @param {boolean} value - Initialization status
     */
    SET_FIREBASE_INITIALIZED(state, value) {
      state.firebaseInitialized = value;
    },

    SET_FIREBASE_ERROR(state, value) {
      state.firebaseError = value;
    },

    /**
     * Updates gate state from Firebase Manual/ node
     * @param {Object} state - Store state
     * @param {Object} gates - {emergency, entry, exit}
     */
    SET_GATE_STATE(state, gates) {
      state.gateState = { ...gates };
    },

    SET_UPDATING_SPOT(state, value) {
      state.isUpdatingSpot = value;
    },

    SET_SPOT_META(state, meta) {
      state.spotMeta = { ...meta };
    },

    SET_LAST_UPDATED(state, timestamp) {
      state.lastUpdated = timestamp;
    },

    SET_LOCALE(state, locale) {
      state.locale = locale;
    }
  },

  /**
   * State actions
   * @type {Object}
   */
  actions: {
    /**
     * Initializes Firebase listener for spot data
     * @param {Object} param - {commit} Vuex context
     */
    initSpots({ commit }) {
      if (!database) {
        return;
      }

      const garageRef = ref(database, FIREBASE_PATHS.GARAGE_ROOT);

      onValue(garageRef, (snapshot) => {
        const { bottomFloor, topFloor, meta } = parseFirebaseData(snapshot);
        commit("SET_SPOTS", { bottomFloor, topFloor });
        commit("SET_SPOT_META", meta);
        let lastUpdated = null;
        Object.values(meta).forEach(floor => {
          Object.values(floor).forEach(spot => {
            if (spot.updatedAt && (!lastUpdated || spot.updatedAt > lastUpdated)) {
              lastUpdated = spot.updatedAt;
            }
          });
        });
        commit("SET_LAST_UPDATED", lastUpdated);
        commit("SET_FIREBASE_INITIALIZED", true);
      });

      const manualRef = ref(database, FIREBASE_PATHS.MANUAL);
      onValue(manualRef, (snapshot) => {
        const data = snapshot.val();
        commit("SET_GATE_STATE", {
          emergency: Number(data?.emergency_open) || 0,
          entry: Number(data?.entry_open) || 0,
          exit: Number(data?.exit_open) || 0
        });
      });
    },

    /**
     * Cycles theme mode: system → dark → light → system.
     * In "system" mode, follows prefers-color-scheme.
     * In "dark"/"light", forces theme and disables system listener.
     * @param {Object} param - {commit, state, dispatch} Vuex context
     */
    toggleTheme({ commit, state, dispatch }) {
      const MODE_CYCLE = { system: "dark", dark: "light", light: "system" };
      const nextMode = MODE_CYCLE[state.themeMode] || "system";
      commit("SET_THEME_MODE", nextMode);

      if (nextMode === "system") {
        attachSystemListener(dispatch);
        const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        commit("SET_THEME", systemDark ? "dark" : "light");
      } else {
        detachSystemListener();
        commit("SET_THEME", nextMode);
      }
    },

    /**
     * Sets specific theme (used by system listener).
     * @param {Object} param - {commit} Vuex context
     * @param {string} theme - Theme name
     */
    setTheme({ commit }, theme) {
      commit("SET_THEME", theme);
    },

    /**
     * Initializes theme from system preference.
     * Starts in "system" mode.
     * @param {Object} param - {commit, dispatch} Vuex context
     */
    initTheme({ commit, dispatch }) {
      const theme = getInitialTheme();
      commit("SET_THEME", theme);
      commit("SET_THEME_MODE", "system");
      attachSystemListener(dispatch);
    },

    /**
     * Toggles a single gate value in Firebase.
     * @param {Object} param - {commit} Vuex context
     * @param {Object} payload - {field: string, value: number}
     */
    toggleGate(_, { field, value }) {
      const gateRef = ref(database, `${FIREBASE_PATHS.MANUAL}/${field}`);
      return set(gateRef, value);
    },

    /**
     * Toggles emergency mode — opens or closes all gates.
     * @param {Object} param - {commit} Vuex context
     * @param {number} value - 1 to activate, 0 to deactivate
     */
    toggleEmergency(_, value) {
      const emergencyRef = ref(database, `${FIREBASE_PATHS.MANUAL}/emergency_open`);
      return set(emergencyRef, value);
    },

    /**
     * Updates a single spot's status in Firebase.
     * Derives Firebase floor path from spot ID prefix (A→Floor1, B→Floor2, C→Floor3).
     * @param {Object} param - {commit} Vuex context
     * @param {Object} payload - { spotId: string, status: number }
     * @returns {Promise} Firebase set promise
     */
    updateSpotStatus({ commit }, { spotId, status }) {
      if (!Object.values(SPOT_STATUS).includes(status)) {
        return Promise.reject(new Error(`Invalid status: ${status}`));
      }

      const firebaseFloor = getFirebasePathFromSpotId(spotId);
      if (!firebaseFloor) {
        return Promise.reject(new Error(`Unknown spot prefix: ${spotId.charAt(0)}`));
      }

      commit("SET_UPDATING_SPOT", true);

      const spotRef = ref(
        database,
        `${FIREBASE_PATHS.GARAGE_ROOT}/${firebaseFloor}/${spotId}`
      );

      return set(spotRef, { status, updatedAt: serverTimestamp() })
        .then(() => {
          commit("SET_UPDATING_SPOT", false);
        })
        .catch((error) => {
          commit("SET_UPDATING_SPOT", false);
          console.error("updateSpotStatus error:", error);
          throw error;
        });
    },

    setLocale({ commit }, locale) {
      commit("SET_LOCALE", locale);
      localStorage.setItem("locale", locale);
      i18n.global.locale.value = locale;
    }
  },
  modules: { auth }
});