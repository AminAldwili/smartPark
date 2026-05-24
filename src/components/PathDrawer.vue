<template>
  <div
    class="path-drawer"
    role="img"
    :aria-label="activePath ? $t('floor.pathAria') : ''"
    aria-live="polite"
    :style="{
      '--path-color-start': pathGradStart,
      '--path-color-end': pathGradEnd,
      '--node-start': nodeStart,
      '--node-end': nodeEnd,
      '--node-stroke': nodeStroke,
      '--path-glow': pathGlow,
      '--path-end-glow': pathEndGlow,
    }"
  >
    <svg
      v-if="activePath && containerSize.width && containerSize.height"
      :width="containerSize.width"
      :height="containerSize.height"
      :viewBox="`0 0 ${containerSize.width} ${containerSize.height}`"
      preserveAspectRatio="none"
      class="path-svg"
      :class="{ 'is-mobile': isMobile }"
    >
      <defs>
        <linearGradient id="routeGradient" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" :stop-color="pathGradStart" />
          <stop offset="100%" :stop-color="pathGradEnd" />
        </linearGradient>
        <linearGradient id="rampGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" :stop-color="pathGradEnd" />
          <stop offset="100%" :stop-color="pathGradStart" />
        </linearGradient>
        <filter id="pathGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="rampGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path
        v-if="activePath.targetFloor === 2"
        :d="rampPathD"
        :stroke-width="strokeWidthRamp"
        stroke="url(#rampGradient)"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
        class="ramp-path-line"
        filter="url(#rampGlow)"
      />

      <path
        :d="pathD"
        stroke="url(#routeGradient)"
        :stroke-width="strokeWidthMain"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
        class="path-line"
        filter="url(#pathGlow)"
      />

      <circle
        :cx="activePath.start.x"
        :cy="activePath.start.y"
        :r="nodeRadius"
        class="path-node start-node"
      />
      <circle
        :cx="activePath.end.x"
        :cy="activePath.end.y"
        :r="nodeRadiusEnd"
        class="path-node end-node"
      />
    </svg>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { BREAKPOINTS, COLORS } from "@/constants";

const props = defineProps({
  activePath: { type: Object, default: null },
  containerSize: { type: Object, default: () => ({ width: 0, height: 0 }) },
});

const windowWidth = ref(window.innerWidth);

const isMobile = computed(() => windowWidth.value < BREAKPOINTS.TABLET);
const isSmallMobile = computed(() => windowWidth.value < BREAKPOINTS.MOBILE);

const pathGradStart = COLORS.PATH_GRADIENT_START;
const pathGradEnd = COLORS.PATH_GRADIENT_END;
const nodeStart = COLORS.NODE_START;
const nodeEnd = COLORS.NODE_END;
const nodeStroke = COLORS.NODE_STROKE;
const pathGlow = COLORS.PATH_GLOW_COLOR;
const pathEndGlow = COLORS.PATH_END_GLOW;

const strokeWidthMain = computed(() => {
  if (isSmallMobile.value) return 4;
  if (isMobile.value) return 5;
  return 6;
});

const strokeWidthRamp = computed(() => {
  if (isSmallMobile.value) return 5;
  if (isMobile.value) return 6;
  return 8;
});

const nodeRadius = computed(() => {
  if (isSmallMobile.value) return 10;
  if (isMobile.value) return 11;
  return 12;
});

const nodeRadiusEnd = computed(() => {
  if (isSmallMobile.value) return 8;
  if (isMobile.value) return 9;
  return 10;
});

const pathD = computed(() => {
  if (!props.activePath) return "";
  const s = props.activePath.start;
  const e = props.activePath.end;
  return `M ${s.x} ${s.y} L ${s.x} ${e.y} L ${e.x} ${e.y}`;
});

const rampPathD = computed(() => {
  if (
    !props.activePath ||
    !props.activePath.rampRect ||
    !props.activePath.containerRect
  ) {
    return "";
  }

  const containerRect = props.activePath.containerRect;
  const rampRect = props.activePath.rampRect;

  const rampCenterX = rampRect.left - containerRect.left + rampRect.width / 2;
  const rampTop = rampRect.top - containerRect.top;
  const rampBottom = rampRect.bottom - containerRect.top;

  const start = props.activePath.start;

  const x1 = start.x;
  const y1 = start.y;
  const x2 = rampCenterX;
  const y2 = rampTop + 20;
  const x3 = rampCenterX;
  const y3 = rampBottom - 20;
  const x4 = start.x;
  const y4 = start.y + (start.y < y3 ? 60 : -60);

  return `M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4}`;
});

function handleResize() {
  windowWidth.value = window.innerWidth;
}

onMounted(() => {
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
.path-drawer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 50;
}

.path-svg {
  display: block;
  max-width: 100%;
}

.path-line {
  opacity: 0;
  animation: fade-in 400ms ease-out forwards;
  will-change: opacity;
}

.ramp-path-line {
  opacity: 0;
  animation: ramp-fade-in 300ms ease-out forwards;
  will-change: opacity;
}

@keyframes fade-in {
  to {
    opacity: 1;
  }
}

@keyframes ramp-fade-in {
  to {
    opacity: 0.9;
  }
}

.path-node {
  opacity: 0;
  transform-origin: center;
  transform: scale(0.5);
  animation: pop-in 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  will-change: transform, opacity;
}

.start-node {
  fill: var(--path-color-start);
  stroke: var(--node-stroke);
  stroke-width: 3;
  filter: drop-shadow(0 0 12px var(--path-glow));
  animation-delay: 200ms;
}

.end-node {
  fill: var(--path-color-end);
  stroke: var(--node-stroke);
  stroke-width: 3;
  filter: drop-shadow(0 0 10px var(--path-end-glow));
  animation-delay: 350ms;
}

@keyframes pop-in {
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .path-line,
  .ramp-path-line,
  .path-node {
    animation: none;
    opacity: 1;
    transform: scale(1);
  }
}

:root.light .start-node {
  stroke: rgba(0, 0, 0, 0.4);
  filter: drop-shadow(0 0 12px var(--path-glow));
}

:root.light .end-node {
  stroke: rgba(0, 0, 0, 0.4);
  filter: drop-shadow(0 0 10px var(--path-end-glow));
}
</style>
