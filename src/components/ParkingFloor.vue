<template>
  <div ref="container" class="floor-container" role="region">
    <div
      class="aisle-line"
      :style="{ left: aisleXPercent + '%' }"
      aria-hidden="true"
    >
      <div ref="aisleSurface" class="aisle-surface">
        <div class="aisle-center-line"></div>
      </div>
    </div>
    <div class="spots-wrapper">
      <div class="group-labels">
        <div
          v-for="g in groupList"
          :key="g.section"
          class="group-label"
          :style="{ left: g.x + '%' }"
        >
          <span class="section-letter">{{ g.section }}</span>
        </div>
      </div>
      <div
        v-for="spot in spots"
        :key="spot.id"
        class="spot-wrapper"
        :style="{ left: spot.x + '%', top: spot.y + '%' }"
        :ref="(el) => setSpotRef(spot.id, el)"
      >
        <ParkingSpot
          :spot-id="spot.id"
          :status="spot.status"
          :is-active="activeSpotId === spot.id"
          :position="{ x: spot.x, y: spot.y }"
          @spot-click="onSpotClick"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import ParkingSpot from "@/components/ParkingSpot.vue";
import {
  AISLE_X_PERCENT,
  FLOOR_CONFIG,
  SPOT_STATUS
} from "@/constants";

/**
 * Single floor component containing parking spots.
 * Displays a grid of spots with a central aisle.
 *
 * @component
 * @example
 * <ParkingFloor :floor="1" :aisle-x-percent="50" />
 */
const props = defineProps({
  /**
   * Floor number identifier
   * @type {string|number}
   * @default 1
   */
  floor: { type: [String, Number], default: 1 },

  /**
   * Array of spot objects (from Vuex store)
   * If not provided, generates default spots
   * @type {Array|null}
   */
  spotsProp: { type: Array, default: null },

  /**
   * Position of central aisle as percentage (50 = middle)
   * @type {number}
   * @default AISLE_X_PERCENT
   */
  aisleXPercent: { type: Number, default: AISLE_X_PERCENT },

  /**
   * Currently active/selected spot ID
   * @type {string|null}
   */
  activeSpotId: { type: String, default: null },
});

/**
 * Events emitted by this component
 * @event request-path - Called when a spot is clicked, emits path data
 */
const emit = defineEmits(["request-path"]);

/**
 * Reference to floor container element
 * @type {import('vue').Ref<HTMLElement|null>}
 */
const container = ref(null);

/**
 * Array of spots on this floor
 * @type {import('vue').Ref<Array>}
 */
const spots = ref([]);

/**
 * Map of spot element references by ID
 * @type {import('vue').Ref<Object>}
 */
const spotRefs = ref({});

/**
 * List of section groups (A, B, or C)
 * Used to display section labels
 * @type {import('vue').ComputedRef<Array>}
 */
const groupList = computed(() => {
  const map = {};
  spots.value.forEach((s) => {
    if (!s || !s.section) return;
    if (!map[s.section]) map[s.section] = { section: s.section, x: s.x };
  });
  return Object.values(map);
});

/**
 * Sets a reference to a spot element.
 * Used to calculate click positions.
 * @param {string} id - Spot ID
 * @param {HTMLElement|null} el - DOM element
 * @returns {void}
 */
function setSpotRef(id, el) {
  if (el) {
    spotRefs.value[id] = el;
  } else {
    delete spotRefs.value[id];
  }
}

/**
 * Generates default spot layout when spotsProp is not provided.
 * Creates a 5x3 grid with sections A/B for floor 1, C for floor 2.
 * @returns {Array} Array of spot configuration objects
 */
function generateDefaultSpots() {
  const { SPOTS_PER_ROW, ROWS_PER_FLOOR } = FLOOR_CONFIG;
  const cols = SPOTS_PER_ROW;
  const rows = ROWS_PER_FLOOR;
  const arr = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const index = r * cols + c;
      const id = `${props.floor}-${index + 1}`;
      const x = (c + 0.5) * (100 / cols);
      const y = (r + 0.5) * (100 / rows);

      let section = "C";
      if (Number(props.floor) === 1) {
        section = index < SPOTS_PER_ROW ? "A" : "B";
      }

      arr.push({
        id,
        section,
        status: Math.random() > 0.5 ? SPOT_STATUS.OCCUPIED : SPOT_STATUS.FREE,
        x,
        y,
      });
    }
  }

  return arr;
}

/**
 * Calculates center position of clicked spot and emits path request.
 * @param {Object} payload - {spotId, position}
 * @returns {void}
 */
function onSpotClick(payload) {
  const floorRect = container.value?.getBoundingClientRect();
  let spotCenter = null;
  if (floorRect) {
    const spotEl = spotRefs.value[payload.spotId];
    if (spotEl) {
      const spotRect = spotEl.getBoundingClientRect();
      spotCenter = {
        x: spotRect.left - floorRect.left + spotRect.width / 2,
        y: spotRect.top - floorRect.top + spotRect.height / 2,
      };
    } else if (payload.position) {
      spotCenter = {
        x: (payload.position.x / 100) * floorRect.width,
        y: (payload.position.y / 100) * floorRect.height,
      };
    }
  }
  emit("request-path", {
    floor: props.floor,
    spotCenter,
    aisleXPercent: props.aisleXPercent,
    floorRect,
  });
}

onMounted(() => {
  updateSpots();
});

/**
 * Watches for spot prop changes (e.g., when Firebase data arrives after mount).
 * Updates the local spots ref so the template re-renders.
 */
watch(
  () => props.spotsProp,
  (newVal) => {
    updateSpots(newVal);
  },
);

function updateSpots(propVal) {
  const source = propVal ?? props.spotsProp;
  if (source && source.length) {
    spots.value = source;
  } else {
    spots.value = generateDefaultSpots();
  }
}
</script>

<style scoped>
.floor-container {
  position: relative;
  width: 100%;
  min-height: clamp(400px, 80vh, 520px);
  overflow: hidden;
  padding: clamp(44px, 10vw, 56px) var(--space-lg) var(--space-lg);
  background: var(--asphalt-dark);
}

.floor-container::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.04;
  pointer-events: none;
  z-index: 1;
  mix-blend-mode: overlay;
}

.floor-container::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.02) 0%,
    transparent 30%,
    transparent 70%,
    rgba(0, 0, 0, 0.06) 100%
  );
  pointer-events: none;
  z-index: 2;
}

.spots-wrapper {
  position: absolute;
  inset: clamp(44px, 10vw, 56px) 0 var(--space-lg);
}

.spot-wrapper {
  position: absolute;
  transform: translate(-50%, -50%);
  padding: var(--space-lg) var(--space-md);
}

.aisle-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: clamp(50px, 10vw, 70px);
  transform: translateX(-50%);
  z-index: 0;
  display: flex;
  justify-content: center;
  pointer-events: none;
}

.aisle-surface {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    180deg,
    var(--aisle-dark),
    var(--asphalt-lighter)
  );
  border-inline: 1px solid var(--aisle-border);
}

.aisle-center-line {
  position: absolute;
  top: 0;
  left: 50%;
  width: 2px;
  height: 100%;
  transform: translateX(-50%);
  background: linear-gradient(
    to bottom,
    transparent 0%,
    var(--aisle-line) 20%,
    var(--aisle-line) 80%,
    transparent 100%
  );
}

.group-labels {
  position: absolute;
  inset: 0 0 auto 0;
  pointer-events: none;
  z-index: 5;
}

.group-label {
  position: absolute;
  top: var(--space-xs);
  transform: translateX(-50%);
  min-width: clamp(30px, 8vw, 36px);
  text-align: center;
  background: var(--accent-gold);
  color: #000;
  padding: var(--space-2xs) var(--space-xs);
  border-radius: var(--radius-sm);
  font-weight: 800;
  font-size: var(--text-sm);
  box-shadow:
    0 4px 20px var(--accent-gold-glow),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transition:
    transform var(--duration-normal) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out);
}

.group-label:hover {
  transform: translateX(-50%) scale(1.1);
  box-shadow:
    0 6px 28px var(--accent-gold-glow),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.section-letter {
  font-weight: 700;
}

@media (max-width: 768px) {
  .aisle-line {
    width: clamp(40px, 8vw, 70px);
  }
}
</style>
