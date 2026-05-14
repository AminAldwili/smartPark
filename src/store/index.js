import { createStore } from "vuex";
import { database, ref, onValue, set, update } from "../firebase/config";
import { SPOT_STATUS, FIREBASE_PATHS } from "../constants";
import auth from "./modules/auth";

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
function parseFloor(data, floorPath, defaultSpots, target) {
  if (data[floorPath]) {
    Object.keys(defaultSpots).forEach(spot => {
      const spotData = data[floorPath][spot];
      target[spot] = (spotData && spotData.status !== undefined)
        ? spotData.status
        : SPOT_STATUS.FREE;
    });
  }
}

/**
 * Parses Firebase snapshot data into floor spot objects.
 * @param {DataSnapshot} snapshot - Firebase data snapshot
 * @returns {{bottomFloor: Object, topFloor: Object, manualGates: Object}} Parsed spot data
 */
function parseFirebaseData(snapshot) {
  const data = snapshot.val();

  const bottomFloor = {};
  const topFloor = {};
  const manualGates = { emergency: 0, entry: 0, exit: 0 };

  if (data) {
    parseFloor(data, FIREBASE_PATHS.FLOOR_1, FIREBASE_FLOOR1_SPOTS, bottomFloor);
    parseFloor(data, FIREBASE_PATHS.FLOOR_2, FIREBASE_FLOOR2_SPOTS, bottomFloor);
    parseFloor(data, FIREBASE_PATHS.FLOOR_3, FIREBASE_FLOOR3_SPOTS, topFloor);

    if (data.Manual) {
      manualGates.emergency = Number(data.Manual.emergency_open) || 0;
      manualGates.entry = Number(data.Manual.entry_open) || 0;
      manualGates.exit = Number(data.Manual.exit_open) || 0;
    }
  }

  return { bottomFloor, topFloor, manualGates };
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
    gateState: { emergency: 0, entry: 0, exit: 0 },
    theme: getInitialTheme(),
    firebaseInitialized: false
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
    isFirebaseInitialized: (state) => state.firebaseInitialized
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

    /**
     * Sets Firebase initialization flag
     * @param {Object} state - Store state
     * @param {boolean} value - Initialization status
     */
    SET_FIREBASE_INITIALIZED(state, value) {
      state.firebaseInitialized = value;
    },

    /**
     * Updates gate state from Firebase Manual/ node
     * @param {Object} state - Store state
     * @param {Object} gates - {emergency, entry, exit}
     */
    SET_GATE_STATE(state, gates) {
      state.gateState = { ...gates };
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
      const garageRef = ref(database, FIREBASE_PATHS.GARAGE_ROOT);

      onValue(garageRef, (snapshot) => {
        const { bottomFloor, topFloor, manualGates } = parseFirebaseData(snapshot);
        commit("SET_SPOTS", { bottomFloor, topFloor });
        commit("SET_GATE_STATE", manualGates);
        commit("SET_FIREBASE_INITIALIZED", true);
      });
    },

    /**
     * Toggles between dark and light theme
     * @param {Object} param - {commit, state} Vuex context
     */
    toggleTheme({ commit, state }) {
      const newTheme = state.theme === "dark" ? "light" : "dark";
      commit("SET_THEME", newTheme);
    },

    /**
     * Sets specific theme
     * @param {Object} param - {commit} Vuex context
     * @param {string} theme - Theme name
     */
    setTheme({ commit }, theme) {
      commit("SET_THEME", theme);
    },

    /**
     * Initializes theme from system preference
     * @param {Object} param - {commit, dispatch} Vuex context
     */
    initTheme({ commit, dispatch }) {
      const theme = getInitialTheme();
      commit("SET_THEME", theme);
      if (typeof window !== "undefined" && window.matchMedia) {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        mediaQuery.addEventListener("change", (e) => {
          dispatch("setTheme", e.matches ? "dark" : "light");
        });
      }
    },

    /**
     * Toggles a single gate value in Firebase.
     * @param {Object} param - {commit} Vuex context
     * @param {Object} payload - {field: string, value: number}
     */
    toggleGate(_, { field, value }) {
      const gateRef = ref(database, `${FIREBASE_PATHS.GARAGE_ROOT}/${FIREBASE_PATHS.MANUAL}/${field}`);
      return set(gateRef, value);
    },

    /**
     * Toggles emergency mode — opens or closes all gates.
     * @param {Object} param - {commit} Vuex context
     * @param {number} value - 1 to activate, 0 to deactivate
     */
    toggleEmergency(_, value) {
      const manualRef = ref(database, `${FIREBASE_PATHS.GARAGE_ROOT}/${FIREBASE_PATHS.MANUAL}`);
      return update(manualRef, {
        emergency_open: value,
        entry_open: value,
        exit_open: value
      });
    }
  },
  modules: { auth }
});