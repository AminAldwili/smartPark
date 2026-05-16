<template>
  <div class="parking-floors" ref="container">
    <PathDrawer :active-path="activePath" :container-size="containerSize" />
    <div class="parking-shell">
      <div class="section-heading">
        <div>
          <span class="eyebrow">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
              <line x1="8" y1="2" x2="8" y2="18" />
              <line x1="16" y1="6" x2="16" y2="22" />
            </svg>
            Interactive Layout
          </span>
          <h3>خريطة المواقف</h3>
        </div>
        <p>
          اختر أي موقف لترى مسارًا مرئيًا يبدأ من مرجع الدور الأول في أسفل
          المنتصف وينتهي عند الموقف المحدد.
        </p>
      </div>

      <div class="floors-container">
        <section class="floor-box" ref="secondFloorBox">
          <div class="floor-header">
            <div class="floor-sign">
              <span class="floor-level">2</span>
            </div>
            <div class="floor-info">
              <h3 class="floor-title">الدور 2</h3>
              <p class="floor-subtitle">
                المسار يصل لأي موقف في هذا الدور أيضًا
              </p>
            </div>
          </div>
          <ParkingFloor
            :floor="2"
            :spots-prop="floor2Spots"
            :aisle-x-percent="aisleXPercent"
            :active-spot-id="activeSpotId"
            @request-path="handleRequestPath"
          />
        </section>

        <div
          class="ramp-connector"
          :class="{ 'ramp-active': activePath && activePath.targetFloor === 2 }"
          ref="rampConnector"
        >
          <div class="ramp-wrapper">
            <div class="ramp-track">
              <div class="ramp-edge left"></div>
              <div class="ramp-edge right"></div>
              <div class="ramp-lane-mark top"></div>
              <div class="ramp-lane-mark bottom"></div>
              <div class="ramp-center-line"></div>
              <div class="ramp-arrows-layer">
                <svg
                  class="ramp-arrow-svg"
                  viewBox="0 0 40 60"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    <linearGradient
                      id="arrowGrad"
                      x1="0%"
                      y1="100%"
                      x2="0%"
                      y2="0%"
                    >
                      <stop
                        offset="0%"
                        stop-color="#f59e0b"
                        stop-opacity="0.4"
                      />
                      <stop
                        offset="100%"
                        stop-color="#f59e0b"
                        stop-opacity="1"
                      />
                    </linearGradient>
                  </defs>
                  <path
                    d="M20 55 L20 15 M20 15 L8 30 M20 15 L32 30"
                    stroke="url(#arrowGrad)"
                    stroke-width="4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    fill="none"
                  />
                </svg>
              </div>
            </div>
            <div class="ramp-sign">
              <div class="sign-badge">
                <span class="sign-level">2</span>
              </div>
              <span class="sign-text">الدور</span>
            </div>
          </div>
        </div>

        <section class="floor-box first-floor-box" ref="firstFloorBox">
          <div class="floor-header">
            <div class="floor-sign">
              <span class="floor-level">1</span>
            </div>
            <div class="floor-info">
              <h3 class="floor-title">الدور 1</h3>
              <p class="floor-subtitle">
                المدخل المرجعي للمسار موجود أسفل المنتصف
              </p>
            </div>
            </div>
          <div class="route-origin-anchor" aria-hidden="true"></div>
          <ParkingFloor
            :floor="1"
            :spots-prop="floor1Spots"
            :aisle-x-percent="aisleXPercent"
            :active-spot-id="activeSpotId"
            @request-path="handleRequestPath"
          />
        </section>
      </div>
    </div>
    <div class="entry-point-container">
      <div class="route-origin-pill">
        <span class="route-origin-dot"></span>
        نقطة الدخول
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useStore } from "vuex";
import ParkingFloor from "@/components/ParkingFloor.vue";
import PathDrawer from "@/components/PathDrawer.vue";
import {
  AISLE_X_PERCENT,
  FLOOR_CONFIG,
  PATH_TIMEOUT_MS,
  SPOT_STATUS,
  SPOT_SCROLL_DELAY_MS,
  SPOT_STATUS_CHECK_DELAY_MS,
  getFloorFromSpotId
} from "@/constants";
import { useResizeObserver } from "@/composables/useElementSize";

/**
 * Main parking layout component.
 * Combines two floors with a connecting ramp and path navigation.
 *
 * @component
 * @example
 * <ParkingFloors />
 */
const store = useStore();

/**
 * Floor 1 spots from Vuex store
 * @type {import('vue').ComputedRef<Object>}
 */
const floor1SpotsFromStore = computed(() => store.getters.getFloor1Spots);

/**
 * Floor 2 spots from Vuex store
 * @type {import('vue').ComputedRef<Object>}
 */
const floor2SpotsFromStore = computed(() => store.getters.getFloor2Spots);

/**
 * Builds evenly-spaced Y positions for spots.
 * @param {number} count - Number of positions
 * @returns {number[]} Array of percentage positions
 */
function buildYPositions(count) {
  return Array.from(
    { length: count },
    (_, idx) => ((idx + 1) / (count + 1)) * 100,
  ).reverse();
}

const aisleXPercent = AISLE_X_PERCENT;

const yPositions = buildYPositions(FLOOR_CONFIG.SPOTS_PER_ROW);

/**
 * Reactive spots array for floor 1 (A & B sections)
 * @type {import('vue').Reactive<Array>}
 */
const floor1Spots = ref([]);
const floor2Spots = ref([]);

function buildSpotArray(spotsMap, mapper) {
  return Object.keys(spotsMap).map((spotId) => {
    const idx = parseInt(spotId.replace(spotId.charAt(0), "")) - 1;
    return { id: spotId, y: yPositions[idx], status: spotsMap[spotId] ?? SPOT_STATUS.FREE, ...mapper(spotId) };
  });
}

function updateSpotsFromStore() {
  floor1Spots.value = buildSpotArray(floor1SpotsFromStore.value, (spotId) => ({
    section: spotId.charAt(0),
    x: spotId.charAt(0) === "A" ? 75 : 25
  }));
  floor2Spots.value = buildSpotArray(floor2SpotsFromStore.value, () => ({
    section: "C",
    x: 75
  }));
}

watch(
  () => [floor1SpotsFromStore.value, floor2SpotsFromStore.value],
  () => { updateSpotsFromStore(); },
  { immediate: true }
);

/**
 * Main container element reference
 * @type {import('vue').Ref<HTMLElement|null>}
 */
const container = ref(null);

/**
 * Ramp connector element reference
 * @type {import('vue').Ref<HTMLElement|null>}
 */
const rampConnector = ref(null);

/**
 * Floor 1 container reference
 * @type {import('vue').Ref<HTMLElement|null>}
 */
const firstFloorBox = ref(null);

/**
 * Floor 2 container reference
 * @type {import('vue').Ref<HTMLElement|null>}
 */
const secondFloorBox = ref(null);

/**
 * Container dimensions for path calculation
 * @type {import('vue').Ref<{width: number, height: number}>}
 */
const containerSize = ref({ width: 0, height: 0 });

/**
 * Active path data for PathDrawer
 * @type {import('vue').Ref<Object|null>}
 */
const activePath = ref(null);

/**
 * Ramp element bounding rect
 * @type {import('vue').Ref<DOMRect|null>}
 */
const rampRect = ref(null);

/**
 * Timer reference for path auto-clear
 * @type {import('vue').Ref<number|null>}
 */
const clearTimer = ref(null);

/**
 * Currently active/selected spot ID
 * @type {import('vue').Ref<string|null>}
 */
const activeSpotId = ref(null);

watch(activeSpotId, (newSpotId) => {
  if (!newSpotId) return;

  setTimeout(() => {
    const floor = getFloorFromSpotId(newSpotId);
    const spots = floor === 2 ? floor2Spots : floor1Spots;
    const spotData = spots.find(s => s.id === newSpotId);

    if (spotData && spotData.status !== SPOT_STATUS.RESERVED) {
      activeSpotId.value = null;
      if (clearTimer.value) {
        clearTimeout(clearTimer.value);
        clearTimer.value = null;
      }
      activePath.value = null;
    }
  }, SPOT_STATUS_CHECK_DELAY_MS);
});

function getSpotCenterInFloor(floorElement, spotId) {
  const spotWrapper = floorElement.querySelector(`[data-spot-id="${spotId}"]`);
  if (!spotWrapper) return null;
  const spotCard = spotWrapper.querySelector('.spot-card');
  if (!spotCard) return null;

  const floorRect = floorElement.getBoundingClientRect();
  const spotRect = spotCard.getBoundingClientRect();

  return {
    x: spotRect.left - floorRect.left + spotRect.width / 2,
    y: spotRect.top - floorRect.top + spotRect.height / 2,
  };
}

function scrollToSpot(spotId) {
  if (!spotId) return;
  activeSpotId.value = spotId;

  const targetFloor = getFloorFromSpotId(spotId);

  nextTick(() => {
    const floorBox = targetFloor === 1 ? firstFloorBox.value : secondFloorBox.value;
    if (floorBox) {
      floorBox.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    setTimeout(() => {
      const floorElement = targetFloor === 1 ? firstFloorBox.value : secondFloorBox.value;
      if (!floorElement) return;

      const spotCenter = getSpotCenterInFloor(floorElement, spotId);
      if (!spotCenter) return;

      handleRequestPath({
        floor: targetFloor,
        floorRect: floorElement.getBoundingClientRect(),
        spotCenter,
        aisleXPercent
      });
    }, SPOT_SCROLL_DELAY_MS);
  });
}

defineExpose({ scrollToSpot });

function updateContainerSize() {
  nextTick(() => {
    const el = container.value;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    containerSize.value = { width: rect.width, height: rect.height };
  });
}

function updateRampRect() {
  nextTick(() => {
    const ramp = rampConnector.value;
    if (ramp) {
      rampRect.value = ramp.getBoundingClientRect();
    }
  });
}

function clearPathTimeout() {
  if (clearTimer.value) clearTimeout(clearTimer.value);
  clearTimer.value = setTimeout(() => {
    activePath.value = null;
    clearTimer.value = null;
  }, PATH_TIMEOUT_MS);
}

function computePathCoords(payload, containerRect, floorRectData) {
  return {
    start: {
      x: floorRectData.left - containerRect.left + (aisleXPercent / 100) * floorRectData.width,
      y: floorRectData.bottom - containerRect.top - 18,
    },
    end: {
      x: payload.floorRect.left - containerRect.left + payload.spotCenter.x,
      y: payload.floorRect.top - containerRect.top + payload.spotCenter.y,
    }
  };
}

function handleRequestPath(payload) {
  if (!containerSize.value.width || !containerSize.value.height) {
    updateContainerSize();
  }

  const containerRect = container.value?.getBoundingClientRect();
  const floorRectData = firstFloorBox.value?.getBoundingClientRect();
  updateRampRect();

  if (!containerRect || !floorRectData || !payload.floorRect || !payload.spotCenter) return;

  const { start, end } = computePathCoords(payload, containerRect, floorRectData);

  activePath.value = {
    start,
    end,
    aisleXPercent: payload.aisleXPercent,
    targetFloor: payload.floor,
    rampRect: rampRect.value,
    containerRect,
  };

  clearPathTimeout();
}

onMounted(() => {
  nextTick(() => {
    updateContainerSize();
    updateRampRect();
  });
});

useResizeObserver(container, () => {
  updateContainerSize();
  updateRampRect();
});

onUnmounted(() => {
  if (clearTimer.value) clearTimeout(clearTimer.value);
});
</script>

<style scoped>
.parking-floors {
  width: 100%;
  position: relative;
}

.parking-shell {
  position: relative;
  padding: max(clamp(12px, 4vw, 28px), env(safe-area-inset-top))
    max(
      clamp(12px, 4vw, 28px),
      env(safe-area-inset-right),
      env(safe-area-inset-left)
    )
    max(clamp(12px, 4vw, 28px), env(safe-area-inset-bottom));
  border-radius: clamp(14px, 4vw, 28px);
  background: var(--asphalt-base);
  border: 1px solid var(--glass-border);
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.parking-shell::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 40px,
    rgba(255, 255, 255, 0.01) 40px,
    rgba(255, 255, 255, 0.01) 41px
  );
  pointer-events: none;
}

.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: clamp(8px, 2vw, 16px);
  margin-bottom: clamp(16px, 3vw, 24px);
  padding-bottom: clamp(12px, 3vw, 20px);
  border-bottom: 1px dashed var(--aisle-border);
}

.section-heading h3 {
  margin: var(--space-xs) 0 0;
  font-size: clamp(1.3rem, 2vw, 1.8rem);
  font-weight: 700;
  color: var(--text-primary);
}

.section-heading p {
  margin: 0;
  max-width: 440px;
  line-height: 1.7;
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--accent-primary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.eyebrow svg {
  width: 14px;
  height: 14px;
}

.floors-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.floor-box {
  position: relative;
  border: 1px solid var(--aisle-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  background: var(--asphalt-light);
  box-shadow: var(--shadow-md);
}

.floor-box::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 100px,
      rgba(14, 165, 233, 0.01) 100px,
      rgba(14, 165, 233, 0.01) 101px
    ),
    linear-gradient(
      180deg,
      rgba(14, 165, 233, 0.03) 0%,
      transparent 30%,
      transparent 70%,
      rgba(0, 0, 0, 0.08) 100%
    );
  pointer-events: none;
  z-index: 1;
}

.floor-header {
  display: flex;
  align-items: center;
  gap: clamp(10px, 2vw, 16px);
  padding: clamp(10px, 2vw, 16px) clamp(12px, 3vw, 20px) clamp(8px, 2vw, 12px);
  background: rgba(0, 0, 0, 0.12);
  border-bottom: 1px solid var(--aisle-border);
}

.floor-sign {
  width: var(--icon-md);
  height: var(--icon-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    var(--accent-primary),
    var(--accent-light)
  );
  border-radius: var(--radius-md);
  box-shadow:
    var(--shadow-glow),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

.floor-level {
  font-size: var(--text-xl);
  font-weight: 700;
  color: #fff;
}

.floor-info {
  flex: 1;
}

.floor-title {
  margin: 0;
  font-size: var(--text-md);
  font-weight: 700;
  color: var(--text-primary);
}

.floor-subtitle {
  margin: var(--space-2xs) 0 0;
  color: var(--text-tertiary);
  font-size: var(--text-sm);
}

.route-origin-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  border-radius: 999px;
  background: var(--accent-gold-glow);
  border: 1px solid var(--accent-gold);
  color: var(--accent-gold);
  font-size: var(--text-sm);
  font-weight: 600;
}

.route-origin-dot {
  width: var(--space-xs);
  height: var(--space-xs);
  border-radius: 50%;
  background: var(--accent-gold);
  box-shadow:
    0 0 8px var(--accent-gold),
    0 0 0 3px var(--accent-gold-glow);
  animation: ambient-pulse 2s ease-in-out infinite;
}

@keyframes ambient-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
    box-shadow:
      0 0 8px var(--accent-gold),
      0 0 0 3px var(--accent-gold-glow);
  }
  50% {
    opacity: 0.7;
    transform: scale(0.9);
    box-shadow:
      0 0 4px var(--accent-gold),
      0 0 0 5px var(--accent-gold-glow);
  }
}

.route-origin-anchor {
  position: absolute;
  bottom: var(--space-sm);
  left: 50%;
  width: clamp(18px, 4vw, 22px);
  height: clamp(18px, 4vw, 22px);
  border: 3px solid rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  transform: translateX(-50%);
  background: linear-gradient(
    135deg,
    var(--accent-gold),
    var(--accent-gold-light)
  );
  box-shadow:
    0 0 0 6px var(--accent-gold-glow),
    0 0 20px var(--accent-gold-glow);
  z-index: 10;
  animation: anchor-glow 3s ease-in-out infinite;
}

@keyframes anchor-glow {
  0%,
  100% {
    box-shadow:
      0 0 0 6px var(--accent-gold-glow),
      0 0 15px var(--accent-gold-glow);
  }
  50% {
    box-shadow:
      0 0 0 8px var(--accent-gold-glow),
      0 0 25px var(--accent-gold);
  }
}

.ramp-connector {
  position: relative;
  height: clamp(70px, 12vw, 90px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.ramp-wrapper {
  position: relative;
  width: min(300px, 80%);
  height: clamp(48px, 10vw, 64px);
}

.ramp-track {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    var(--asphalt-base) 0%,
    var(--asphalt-light) 50%,
    var(--asphalt-base) 100%
  );
  border-radius: var(--radius-md);
  border: 2px solid var(--aisle-border);
  box-shadow:
    var(--shadow-md),
    inset 0 0 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.ramp-track::before {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 38px,
    var(--aisle-border) 38px,
    var(--aisle-border) 40px
  );
  opacity: 0.3;
}

.ramp-edge {
  position: absolute;
  top: 0;
  bottom: 0;
  width: var(--space-2xs);
  background: linear-gradient(
    180deg,
    transparent 0%,
    var(--aisle-border) 20%,
    var(--aisle-border) 80%,
    transparent 100%
  );
}

.ramp-edge.left {
  left: var(--space-sm);
}

.ramp-edge.right {
  right: var(--space-sm);
}

.ramp-center-line {
  position: absolute;
  top: 50%;
  left: clamp(24px, 6vw, 30px);
  right: clamp(24px, 6vw, 30px);
  height: clamp(3px, 0.8vw, 4px);
  transform: translateY(-50%);
  background: repeating-linear-gradient(
    90deg,
    var(--accent-primary) 0px,
    var(--accent-primary) 20px,
    transparent 20px,
    transparent 35px
  );
  opacity: 0.5;
  transition: opacity var(--duration-slow) var(--ease-out);
}

.ramp-lane-mark {
  position: absolute;
  left: clamp(24px, 6vw, 30px);
  right: clamp(24px, 6vw, 30px);
  height: 2px;
  background: var(--aisle-border);
  border-radius: 1px;
}

.ramp-lane-mark.top {
  top: clamp(14px, 4vw, 18px);
}

.ramp-lane-mark.bottom {
  bottom: clamp(14px, 4vw, 18px);
}

.ramp-arrows-layer {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
}

.ramp-arrow-svg {
  width: clamp(24px, 5vw, 30px);
  height: clamp(36px, 8vw, 45px);
}

.ramp-sign {
  position: absolute;
  top: calc(-1 * var(--space-md));
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2xs);
  z-index: 100;
}

.sign-badge {
  width: var(--icon-md);
  height: var(--icon-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    145deg,
    var(--accent-primary),
    var(--accent-light)
  );
  border-radius: var(--radius-sm);
  box-shadow:
    var(--shadow-glow),
    inset 0 2px 0 rgba(255, 255, 255, 0.25);
  transition: box-shadow var(--duration-slow) var(--ease-out);
}

.sign-level {
  font-size: var(--text-lg);
  font-weight: 700;
  color: #fff;
}

.sign-text {
  font-size: var(--text-2xs);
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.ramp-connector.ramp-active .ramp-track {
  border-color: var(--accent-gold);
  box-shadow:
    0 4px 20px var(--accent-gold-glow),
    inset 0 0 20px var(--accent-gold-glow);
  transition: all var(--duration-slow) var(--ease-out);
}

.ramp-connector.ramp-active .ramp-center-line {
  background: repeating-linear-gradient(
    90deg,
    var(--accent-gold) 0px,
    var(--accent-gold) 20px,
    transparent 20px,
    transparent 35px
  );
  opacity: 0.85;
  animation: dash-flow 1.2s linear infinite;
}

.ramp-connector.ramp-active .sign-badge {
  background: linear-gradient(
    145deg,
    var(--accent-gold),
    var(--accent-gold-light)
  );
  box-shadow:
    0 8px 40px var(--accent-gold-glow),
    inset 0 2px 0 rgba(255, 255, 255, 0.3);
  transition: box-shadow var(--duration-slow) var(--ease-out);
}

@keyframes dash-flow {
  to {
    background-position: 30px 0;
  }
}

.parking-floors > .path-drawer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 50;
}

@media (max-width: 768px) {
  .ramp-wrapper {
    width: min(260px, 85%);
  }

  .section-heading {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }

  .floor-header {
    flex-wrap: wrap;
    gap: var(--space-sm);
  }

  .route-origin-pill {
    align-self: flex-start;
  }
}

@media (max-width: 480px) {
  .floor-box {
    border-radius: var(--radius-lg);
    border-width: 1px;
  }

  .section-heading h3 {
    font-size: var(--text-lg);
  }
}

@media (max-width: 360px) {
  .ramp-wrapper {
    width: min(200px, 85vw);
  }
}

.entry-point-container {
  display: flex;
  justify-content: center;
  padding: var(--space-md) 0;
}

@media (prefers-reduced-motion: reduce) {
  .route-origin-dot {
    animation: none;
  }
  .route-origin-anchor {
    animation: none;
  }
  .ramp-connector.ramp-active .ramp-center-line {
    animation: none;
  }
}
</style>
