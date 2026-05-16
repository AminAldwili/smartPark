<template>
  <div
    class="parking-spot"
    :data-spot-id="spotId"
    ref="spotRef"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div
      class="spot-card"
      :class="[statusClass, { 'is-hovered': isHover || isTapped, 'is-active': isActive }]"
      role="button"
      tabindex="0"
      :aria-pressed="status === 'occupied'"
      :aria-label="`موقف ${spotId} - ${statusLabel}`"
      @click="onClick"
      @touchstart.passive="onTouchStart"
      @touchend="isTapped = false"
      @touchcancel="isTapped = false"
      @keydown.enter="onClick"
      @keydown.space.prevent="onClick"
    >
      <div class="spot-inner">
        <span class="spot-id">{{ spotId }}</span>
        <span class="spot-state">{{ statusLabel }}</span>
      </div>
      <div class="spot-indicator">
        <div class="indicator-glow"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from "vue";
import {
  SPOT_STATUS,
  SPOT_LABELS,
  SPOT_CLASSES
} from "@/constants";
import { useTooltip } from "@/composables/useTooltip";

const props = defineProps({
  /**
   * Unique identifier for the parking spot
   * @type {string|number}
   */
  spotId: { type: [String, Number], required: true },

  /**
   * Current status of the spot
   * 0 = Free/Available (green)
   * 1 = Occupied (red)
   * 2 = Reserved (orange)
   * 3 = Maintenance (gray)
   * @type {number}
   * @default SPOT_STATUS.FREE
   */
  status: {
    type: Number,
    default: SPOT_STATUS.FREE,
    validator: (v) => Object.values(SPOT_STATUS).includes(v),
  },

  /**
   * Whether this spot is currently active/selected
   * @type {boolean}
   * @default false
   */
  isActive: { type: Boolean, default: false },

  /**
   * Position as percentage within the floor
   * @type {{x: number, y: number}}
   * @default {x: 0, y: 0}
   */
  position: { type: Object, default: () => ({ x: 0, y: 0 }) },
});

/**
 * Emitted when the spot is clicked
 * @event spot-click
 * @property {string|number} spotId - The spot's unique ID
 * @property {object} position - The spot's position {x, y}
 */
const emit = defineEmits(["spot-click"]);

/**
 * Tracks hover state for tooltip display
 * @type {import('vue').Ref<boolean>}
 */
const isHover = ref(false);

/**
 * Tracks touch state for mobile devices
 * @type {import('vue').Ref<boolean>}
 */
const isTapped = ref(false);
const spotRef = ref(null);
const { showTooltip, clearTooltip, activeTooltip } = useTooltip();

/**
 * Computed CSS class based on spot status
 * @type {import('vue').ComputedRef<string>}
 */
const statusClass = computed(() => {
  return SPOT_CLASSES[props.status] || SPOT_CLASSES[SPOT_STATUS.FREE];
});

/**
 * Human-readable status label (Arabic)
 * @type {import('vue').ComputedRef<string>}
 */
const statusLabel = computed(() => {
  return SPOT_LABELS[props.status] || SPOT_LABELS[SPOT_STATUS.FREE];
});

function handleMouseEnter() {
  isHover.value = true;
  const el = spotRef.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  showTooltip(
    props.spotId,
    rect.left + rect.width / 2,
    rect.bottom,
    statusLabel.value
  );
}

function handleMouseLeave() {
  isHover.value = false;
}

/**
 * Click handler - emits spot-click event
 * @returns {void}
 */
function onClick() {
  emit("spot-click", {
    spotId: props.spotId,
    position: props.position,
  });
}

function onTouchStart() {
  isTapped.value = true;
  const el = spotRef.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  showTooltip(props.spotId, rect.left + rect.width / 2, rect.bottom, statusLabel.value);
}

onUnmounted(() => {
  if (activeTooltip.value?.spotId === props.spotId) {
    clearTooltip();
  }
});
</script>

<style scoped>
.parking-spot {
  position: relative;
  display: inline-block;
  z-index: 10;
  overflow: visible;
}

.spot-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-radius: var(--radius-md);
  cursor: pointer;
  user-select: none;

  /* CSS-only responsive sizing */
  width: clamp(64px, 28vw, 130px);
  height: clamp(42px, 16.24vw, 75px);

  transition:
    transform var(--duration-normal) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out);
}

.spot-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.spot-id {
  font-size: clamp(0.9rem, 2.5vw, 1.1rem);
  font-weight: 700;
  letter-spacing: 0.02em;
  transition: transform var(--duration-normal) var(--ease-out);
}

.spot-state {
  font-size: clamp(0.65rem, 1.8vw, 0.75rem);
  font-weight: 600;
  opacity: 0.85;
  transition: opacity var(--duration-normal) var(--ease-out);
}

.spot-indicator {
  position: absolute;
  bottom: clamp(4px, 1vw, 6px);
  right: clamp(4px, 1vw, 6px);
  width: clamp(8px, 2vw, 10px);
  height: clamp(8px, 2vw, 10px);
  border-radius: 50%;
  transition: all var(--duration-normal) var(--ease-out);
}

.indicator-glow {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  opacity: 0;
  transition: all var(--duration-normal) var(--ease-out);
}

.spot-card:hover .spot-id,
.spot-card:focus-visible .spot-id {
  transform: scale(1.05);
}

.spot-card:hover .spot-state,
.spot-card:focus-visible .spot-state {
  opacity: 1;
}

.spot-card:focus-visible {
  outline: none;
}

.spot-card:focus-visible::after {
  content: "";
  position: absolute;
  inset: -3px;
  border-radius: calc(var(--radius-md) + 3px);
  border: 2px solid var(--focus-ring);
  box-shadow: 0 0 16px var(--focus-ring);
}

@keyframes focus-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.is-free {
  --status-color: var(--spot-free);
  --status-bg-dark: #059669;
  --status-border: rgba(16, 185, 129, 0.3);
  --status-indicator: rgba(16, 185, 129, 0.6);
  --status-glow: rgba(16, 185, 129, 0.4);
  --status-glow-strong: rgba(16, 185, 129, 0.8);
  --status-light-shadow: 0 4px 16px rgba(5, 150, 105, 0.15), 0 2px 4px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6);
  --status-light-hover-shadow: 0 12px 32px rgba(5, 150, 105, 0.2), 0 4px 8px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.is-occupied {
  --status-color: var(--spot-occupied);
  --status-bg-dark: #dc2626;
  --status-border: rgba(239, 68, 68, 0.3);
  --status-indicator: rgba(239, 68, 68, 0.6);
  --status-glow: rgba(239, 68, 68, 0.4);
  --status-glow-strong: rgba(239, 68, 68, 0.8);
  --status-light-shadow: 0 4px 16px rgba(220, 38, 38, 0.12), 0 2px 4px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.6);
  --status-light-hover-shadow: 0 12px 32px rgba(220, 38, 38, 0.18), 0 4px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.is-reserved {
  --status-color: var(--spot-reserved);
  --status-bg-dark: #f97316;
  --status-border: rgba(249, 115, 22, 0.3);
  --status-indicator: rgba(249, 115, 22, 0.6);
  --status-glow: rgba(249, 115, 22, 0.4);
  --status-glow-strong: rgba(249, 115, 22, 0.8);
  --status-light-shadow: 0 4px 16px rgba(249, 115, 22, 0.15), 0 2px 4px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6);
  --status-light-hover-shadow: 0 12px 32px rgba(249, 115, 22, 0.2), 0 4px 8px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.is-maintenance {
  --status-color: var(--spot-maintenance);
  --status-bg-dark: #6b7280;
  --status-border: rgba(107, 114, 128, 0.3);
  --status-indicator: rgba(107, 114, 128, 0.6);
  --status-glow: rgba(107, 114, 128, 0.4);
  --status-glow-strong: rgba(107, 114, 128, 0.8);
  --status-light-shadow: 0 4px 16px rgba(107, 114, 128, 0.12), 0 2px 4px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.6);
  --status-light-hover-shadow: 0 12px 32px rgba(107, 114, 128, 0.18), 0 4px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

/* Shared status styles — applies to all status classes */
.is-free,
.is-occupied,
.is-reserved,
.is-maintenance {
  color: #fff;
  background: linear-gradient(145deg, var(--status-color), var(--status-bg-dark));
  box-shadow:
    var(--shadow-sm),
    0 0 0 1px var(--status-border),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.is-free .spot-indicator,
.is-occupied .spot-indicator,
.is-reserved .spot-indicator,
.is-maintenance .spot-indicator {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 8px var(--status-indicator);
}

.is-free .indicator-glow,
.is-occupied .indicator-glow,
.is-reserved .indicator-glow,
.is-maintenance .indicator-glow {
  background: var(--status-color);
}

.is-free:hover,
.is-free:focus-visible,
.is-free.is-hovered,
.is-occupied:hover,
.is-occupied:focus-visible,
.is-occupied.is-hovered,
.is-reserved:hover,
.is-reserved:focus-visible,
.is-reserved.is-hovered,
.is-maintenance:hover,
.is-maintenance:focus-visible,
.is-maintenance.is-hovered {
  transform: translateY(-4px) scale(1.02);
  box-shadow:
    var(--shadow-lg),
    0 0 20px var(--status-glow),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

.is-free:hover .spot-indicator,
.is-free:focus-visible .spot-indicator,
.is-occupied:hover .spot-indicator,
.is-occupied:focus-visible .spot-indicator,
.is-reserved:hover .spot-indicator,
.is-reserved:focus-visible .spot-indicator,
.is-maintenance:hover .spot-indicator,
.is-maintenance:focus-visible .spot-indicator {
  box-shadow: 0 0 16px var(--status-glow-strong);
}

.is-free:hover .indicator-glow,
.is-free:focus-visible .indicator-glow,
.is-occupied:hover .indicator-glow,
.is-occupied:focus-visible .indicator-glow,
.is-reserved:hover .indicator-glow,
.is-reserved:focus-visible .indicator-glow,
.is-maintenance:hover .indicator-glow,
.is-maintenance:focus-visible .indicator-glow {
  animation: indicator-blink 1s ease-in-out infinite;
}

@keyframes indicator-blink {
  0%,
  100% {
    opacity: 0;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(2);
  }
}

/* Light mode — shared rules */
:root.light .is-free,
:root.light .is-occupied,
:root.light .is-reserved,
:root.light .is-maintenance {
  box-shadow: var(--status-light-shadow);
}

:root.light .is-free:hover,
:root.light .is-free:focus-visible,
:root.light .is-free.is-hovered,
:root.light .is-occupied:hover,
:root.light .is-occupied:focus-visible,
:root.light .is-occupied.is-hovered,
:root.light .is-reserved:hover,
:root.light .is-reserved:focus-visible,
:root.light .is-reserved.is-hovered,
:root.light .is-maintenance:hover,
:root.light .is-maintenance:focus-visible,
:root.light .is-maintenance.is-hovered {
  box-shadow: var(--status-light-hover-shadow);
}

.spot-card.is-active {
  animation: spot-active-pulse 1.5s ease-in-out infinite;
  box-shadow:
    0 0 20px rgba(14, 165, 233, 0.6),
    0 0 40px rgba(14, 165, 233, 0.3);
}

.spot-card.is-active::after {
  content: "";
  position: absolute;
  inset: -4px;
  border-radius: calc(var(--radius-md) + 4px);
  border: 2px solid var(--accent-primary);
  animation: spot-active-ring 1.5s ease-in-out infinite;
}

@keyframes spot-active-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes spot-active-ring {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@media (prefers-reduced-motion: reduce) {
  .spot-card {
    transition: none;
  }
  .is-active {
    animation: none;
  }
  .is-active::after {
    animation: none;
  }
  .is-free:hover .indicator-glow,
  .is-occupied:hover .indicator-glow,
  .is-reserved:hover .indicator-glow,
  .is-maintenance:hover .indicator-glow {
    animation: none;
  }
}
</style>
