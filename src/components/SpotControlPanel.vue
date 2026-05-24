<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import { SPOT_STATUS, SPOT_LABEL_KEYS, SPOT_CLASSES, getFloorFromSpotId } from "@/constants";
import { useToast } from "@/composables/useToast";

const { t } = useI18n();

const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

function formatDuration(ms) {
  if (ms == null || ms < 0) return "";
  if (ms < MIN) return "<1" + t("spotControl.durationMin");
  const days = Math.floor(ms / DAY);
  const hours = Math.floor((ms % DAY) / HOUR);
  const minutes = Math.floor((ms % HOUR) / MIN);
  if (days > 0) return days >= 2 ? `${days}${t("spotControl.durationDay")}` : hours > 0 ? `${days}${t("spotControl.durationDay")} ${hours}${t("spotControl.durationHour")}` : `${days}${t("spotControl.durationDay")}`;
  if (hours > 0) return minutes > 0 ? `${hours}${t("spotControl.durationHour")} ${minutes}${t("spotControl.durationMin")}` : `${hours}${t("spotControl.durationHour")}`;
  return `${minutes}${t("spotControl.durationMin")}`;
}

function formatDurationPrecise(ms) {
  if (ms == null || ms < 0) return "";
  const days = Math.floor(ms / DAY);
  const hours = Math.floor((ms % DAY) / HOUR);
  const minutes = Math.floor((ms % HOUR) / MIN);
  const seconds = Math.floor((ms % MIN) / SEC);
  const parts = [];
  if (days > 0) parts.push(`${days}${t("spotControl.durationDay")}`);
  if (hours > 0) parts.push(`${hours}${t("spotControl.durationHour")}`);
  if (minutes > 0) parts.push(`${minutes}${t("spotControl.durationMin")}`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}${t("spotControl.durationSec")}`);
  return parts.join(" ");
}

const store = useStore();
const toast = useToast();

const SECTIONS = {
  A: { label: "A", spots: ["A1", "A2", "A3", "A4", "A5"] },
  B: { label: "B", spots: ["B1", "B2", "B3", "B4", "B5"] },
  C: { label: "C", spots: ["C1", "C2", "C3", "C4", "C5"] }
};

const FLOORS = computed(() => [
  {
    label: t("floor.floor1Title"),
    sections: ["A", "B"]
  },
  {
    label: t("floor.floor2Title"),
    sections: ["C"]
  }
]);

const floor1Spots = computed(() => store.getters.getFloor1Spots);
const floor2Spots = computed(() => store.getters.getFloor2Spots);
const isUpdating = computed(() => store.getters.isUpdatingSpot);
const spotMeta = computed(() => store.getters.getSpotMeta);

const statusOptions = computed(() =>
  [SPOT_STATUS.FREE, SPOT_STATUS.OCCUPIED, SPOT_STATUS.RESERVED, SPOT_STATUS.MAINTENANCE].map(value => ({
    value,
    label: t(SPOT_LABEL_KEYS[value]),
    cls: SPOT_CLASSES[value]
  }))
);

const popover = ref({
  visible: false,
  spotId: null,
  currentStatus: null,
  top: 0,
  left: 0
});

const cardRefs = ref({});

function getStatus(spotId) {
  const prefix = spotId.charAt(0);
  const spots = prefix === "C" ? floor2Spots.value : floor1Spots.value;
  return spots[spotId] ?? SPOT_STATUS.FREE;
}

function getDuration(spotId) {
  const floorIndex = getFloorFromSpotId(spotId);
  if (!floorIndex) return null;
  const meta = spotMeta.value[`floor${floorIndex}`]?.[spotId];
  if (!meta?.updatedAt) return null;
  return Date.now() - meta.updatedAt;
}

function setCardRef(spotId, el) {
  if (el) {
    cardRefs.value[spotId] = el;
  }
}

function openPopover(spotId) {
  const el = cardRefs.value[spotId];
  if (!el) return;

  const rect = el.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  const popoverHeight = 200;

  let top;
  if (spaceBelow >= popoverHeight + 8) {
    top = rect.bottom + 8;
  } else {
    top = rect.top - popoverHeight - 8;
  }

  const left = Math.max(
    8,
    Math.min(
      rect.left + rect.width / 2 - 100,
      window.innerWidth - 208
    )
  );

  popover.value = {
    visible: true,
    spotId,
    currentStatus: getStatus(spotId),
    top,
    left
  };
}

function closePopover() {
  popover.value.visible = false;
  popover.value.spotId = null;
}

async function changeStatus(status) {
  const spotId = popover.value.spotId;
  if (!spotId || isUpdating.value) return;

  try {
    await store.dispatch("updateSpotStatus", {
      spotId,
      status
    });
    toast.success(t("spotControl.toastSuccess", { id: spotId, status: t(SPOT_LABEL_KEYS[status]) }));
    closePopover();
  } catch (err) {
    toast.error(t("spotControl.toastError"));
  }
}

function onClickOutside(e) {
  if (!popover.value.visible) return;
  const popoverEl = document.querySelector(".spot-control__popover");
  const triggerEl = cardRefs.value[popover.value.spotId];
  if (popoverEl && !popoverEl.contains(e.target) && triggerEl && !triggerEl.contains(e.target)) {
    closePopover();
  }
}

function onKeydown(e) {
  if (e.key === "Escape" && popover.value.visible) {
    closePopover();
  }
}

let scrollRaf = null;
function onScroll() {
  if (!popover.value.visible) return;
  if (scrollRaf) return;
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = null;
    const el = cardRefs.value[popover.value.spotId];
    if (el) {
      openPopover(popover.value.spotId);
    }
  });
}

onMounted(() => {
  document.addEventListener("click", onClickOutside);
  document.addEventListener("keydown", onKeydown);
  window.addEventListener("scroll", onScroll, true);
});

onUnmounted(() => {
  document.removeEventListener("click", onClickOutside);
  document.removeEventListener("keydown", onKeydown);
  window.removeEventListener("scroll", onScroll, true);
});
</script>

<template>
  <div class="spot-control">
    <div class="spot-control__header">
      <svg
        class="spot-control__header-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
        <circle cx="7" cy="10" r="0.5" fill="currentColor" />
        <circle cx="17" cy="10" r="0.5" fill="currentColor" />
        <circle cx="7" cy="16" r="0.5" fill="currentColor" />
        <circle cx="17" cy="16" r="0.5" fill="currentColor" />
      </svg>
      <div>
        <h3>{{ $t('spotControl.heading') }}</h3>
        <p>{{ $t('spotControl.description') }}</p>
      </div>
    </div>

    <div class="spot-control__floors">
      <div v-for="floor in FLOORS" :key="floor.label" class="spot-control__floor">
        <div class="spot-control__floor-label">{{ floor.label }}</div>

        <div v-for="sectionKey in floor.sections" :key="sectionKey" class="spot-control__row">
          <div class="spot-control__section-letter">{{ SECTIONS[sectionKey].label }}</div>
          <div class="spot-control__spots">
            <div
              v-for="spotId in SECTIONS[sectionKey].spots"
              :key="spotId"
              :ref="(el) => setCardRef(spotId, el)"
              class="spot-control__card"
              :class="[
                SPOT_CLASSES[getStatus(spotId)],
                { 'is-selected': popover.visible && popover.spotId === spotId },
                { 'has-duration': getStatus(spotId) === SPOT_STATUS.OCCUPIED && getDuration(spotId) != null }
              ]"
              role="button"
              tabindex="0"
              :aria-label="getStatus(spotId) === SPOT_STATUS.OCCUPIED && getDuration(spotId) != null ? $t('spotControl.cardAriaDuration', { id: spotId, status: $t(SPOT_LABEL_KEYS[getStatus(spotId)]), duration: formatDurationPrecise(getDuration(spotId)) }) : $t('spotControl.cardAria', { id: spotId, status: $t(SPOT_LABEL_KEYS[getStatus(spotId)]) })"
              :title="getStatus(spotId) === SPOT_STATUS.OCCUPIED && getDuration(spotId) != null ? $t('spotControl.cardTitleDuration', { duration: formatDurationPrecise(getDuration(spotId)) }) : ''"
              @click="openPopover(spotId)"
              @keydown.enter="openPopover(spotId)"
              @keydown.space.prevent="openPopover(spotId)"
            >
              <span class="spot-control__card-id">{{ spotId }}</span>
              <span class="spot-control__card-dot"></span>
              <span v-if="getStatus(spotId) === SPOT_STATUS.OCCUPIED && getDuration(spotId) != null" class="spot-control__duration-badge">{{ formatDuration(getDuration(spotId)) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="popover-fade">
        <div
          v-if="popover.visible"
          class="spot-control__popover"
          :style="{ top: popover.top + 'px', left: popover.left + 'px' }"
          role="dialog"
          :aria-label="$t('spotControl.popoverAria')"
        >
          <div class="spot-control__popover-header">
            <span class="spot-control__popover-spot">{{ popover.spotId }}</span>
            <span class="spot-control__popover-current">
              {{ $t('spotControl.currentStatus', { status: $t(SPOT_LABEL_KEYS[popover.currentStatus]) }) }}
            </span>
          </div>
          <div class="spot-control__popover-grid">
            <button
              v-for="st in statusOptions"
              :key="st.value"
              class="spot-control__status-btn"
              :class="[
                st.cls,
                { 'is-active': popover.currentStatus === st.value }
              ]"
              :disabled="isUpdating"
              @click="changeStatus(st.value)"
            >
              <span v-if="isUpdating && popover.currentStatus !== st.value" class="spinner-ring"></span>
              <template v-else>{{ st.label }}</template>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.spot-control {
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  background: var(--glass-bg);
  backdrop-filter: var(--blur-md);
  border: 1px solid var(--glass-border);
}

.spot-control__header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid var(--glass-border);
}

.spot-control__header-icon {
  width: var(--icon-md);
  height: var(--icon-md);
  color: var(--accent-primary);
  flex-shrink: 0;
}

.spot-control__header h3 {
  margin: 0 0 var(--space-2xs);
  font-size: var(--text-md);
  font-weight: 700;
  color: var(--text-primary);
}

.spot-control__header p {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.spot-control__floors {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.spot-control__floor-label {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-xs);
  border-bottom: 1px solid var(--glass-border);
}

.spot-control__row {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-sm);
}

.spot-control__section-letter {
  width: clamp(28px, 5vw, 36px);
  height: clamp(28px, 5vw, 36px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: var(--asphalt-dark);
  border: 1px solid var(--glass-border);
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--accent-primary);
  flex-shrink: 0;
}

.spot-control__spots {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

/* ---- Spot Card ---- */
.spot-control__card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: clamp(72px, 12vw, 100px);
  height: clamp(46px, 7vw, 60px);
  border-radius: var(--radius-sm);
  cursor: pointer;
  user-select: none;
  color: #fff;
  font-weight: 700;
  transition:
    transform var(--duration-normal) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out);
  border: 2px solid transparent;
}

.spot-control__card:focus-visible {
  outline: none;
}

.spot-control__card:focus-visible::after {
  content: "";
  position: absolute;
  inset: -3px;
  border-radius: calc(var(--radius-sm) + 2px);
  border: 2px solid var(--focus-ring);
  box-shadow: 0 0 12px var(--focus-ring);
}

.spot-control__card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.spot-control__card.is-selected {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px var(--accent-glow), var(--shadow-md);
  transform: translateY(-2px);
}

.spot-control__card-id {
  font-size: clamp(0.8rem, 2vw, 0.95rem);
  letter-spacing: 0.02em;
  transition: transform var(--duration-normal) var(--ease-out);
}

.spot-control__card:hover .spot-control__card-id {
  transform: scale(1.08);
}

.spot-control__card-dot {
  width: clamp(6px, 1.5vw, 8px);
  height: clamp(6px, 1.5vw, 8px);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.3);
}

.spot-control__duration-badge {
  position: absolute;
  inset-block-end: var(--space-2xs);
  inset-inline-end: var(--space-xs);
  font-size: clamp(0.5rem, 1.2vw, 0.6rem);
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(0, 0, 0, 0.35);
  padding: 0 var(--space-2xs);
  border-radius: var(--radius-sm);
  line-height: 1.4;
  letter-spacing: 0.02em;
}

/* ---- Status Colors ---- */
.spot-control__card.is-free {
  background: linear-gradient(145deg, var(--spot-free), #059669);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.spot-control__card.is-free:hover {
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
}

.spot-control__card.is-occupied {
  background: linear-gradient(145deg, var(--spot-occupied), #dc2626);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.spot-control__card.is-occupied:hover {
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.35);
}

.spot-control__card.is-reserved {
  background: linear-gradient(145deg, var(--spot-reserved), #ea580c);
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.spot-control__card.is-reserved:hover {
  box-shadow: 0 6px 20px rgba(249, 115, 22, 0.35);
}

.spot-control__card.is-maintenance {
  background: linear-gradient(145deg, var(--spot-maintenance), #4b5563);
  box-shadow: 0 2px 8px rgba(107, 114, 128, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.spot-control__card.is-maintenance:hover {
  box-shadow: 0 6px 20px rgba(107, 114, 128, 0.35);
}

/* ---- Popover ---- */
.spot-control__popover {
  position: fixed;
  z-index: 900;
  width: 200px;
  padding: var(--space-md);
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  backdrop-filter: var(--blur-lg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-xl);
}

.spot-control__popover-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--glass-border);
}

.spot-control__popover-spot {
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--text-primary);
}

.spot-control__popover-current {
  font-size: var(--text-2xs);
  color: var(--text-secondary);
}

.spot-control__popover-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-sm);
}

.spot-control__status-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-sm) var(--space-xs);
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  font-size: var(--text-2xs);
  font-weight: 500;
  cursor: pointer;
  color: #fff;
  transition:
    transform var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out),
    opacity var(--duration-fast) var(--ease-out);
  min-height: 36px;
}

.spot-control__status-btn:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

.spot-control__status-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.spot-control__status-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spot-control__status-btn.is-free {
  background: var(--spot-free);
}

.spot-control__status-btn.is-free:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.spot-control__status-btn.is-occupied {
  background: var(--spot-occupied);
}

.spot-control__status-btn.is-occupied:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.spot-control__status-btn.is-reserved {
  background: var(--spot-reserved);
}

.spot-control__status-btn.is-reserved:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.spot-control__status-btn.is-maintenance {
  background: var(--spot-maintenance);
}

.spot-control__status-btn.is-maintenance:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.4);
}

.spot-control__status-btn.is-active {
  border-color: #fff;
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.3);
}

/* ---- Spinner ---- */
.spinner-ring {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin-ring 0.6s linear infinite;
}

@keyframes spin-ring {
  to {
    transform: rotate(360deg);
  }
}

/* ---- Popover Transition ---- */
.popover-fade-enter-active {
  transition: opacity var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-spring);
}

.popover-fade-leave-active {
  transition: opacity var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-out);
}

.popover-fade-enter-from,
.popover-fade-leave-to {
  opacity: 0;
  transform: translateY(4px) scale(0.96);
}

/* ---- Responsive ---- */
@media (max-width: 768px) {
  .spot-control {
    padding: var(--space-md);
  }

  .spot-control__row {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }

  .spot-control__spots {
    width: 100%;
    justify-content: center;
  }

  .spot-control__popover {
    width: 180px;
  }
}

@media (max-width: 480px) {
  .spot-control__card {
    width: clamp(60px, 14vw, 80px);
    height: clamp(40px, 9vw, 52px);
  }

  .spot-control__spots {
    gap: var(--space-2xs);
  }
}

@media (prefers-reduced-motion: reduce) {
  .spot-control__card,
  .spot-control__status-btn,
  .spot-control__popover {
    transition: none;
  }

  .popover-fade-enter-active,
  .popover-fade-leave-active {
    transition: none;
  }
}
</style>
