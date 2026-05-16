<template>
  <div class="dashboard-stats">
    <div class="dashboard-stats__header">
      <svg class="dashboard-stats__header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        <path d="M21 3v6h-6" />
        <path d="M12 7v5l3 3" />
      </svg>
      <div>
        <h3>إحصائيات عامة</h3>
        <p>نظرة عامة على المواقف</p>
      </div>
    </div>

    <div class="dashboard-stats__grid">
      <div class="dashboard-stats__card">
        <div class="dashboard-stats__label">نسبة الإشغال</div>
        <div class="dashboard-stats__value" :class="occupancyClass">{{ occupancyPercent }}%</div>
        <div class="dashboard-stats__bar">
          <div class="dashboard-stats__bar-fill" :style="{ width: occupancyPercent + '%' }"></div>
        </div>
        <div class="dashboard-stats__sub">{{ occupiedCount }} / {{ totalCount }} مشغولة</div>
      </div>

      <div class="dashboard-stats__card">
        <div class="dashboard-stats__label">آخر تحديث</div>
        <div class="dashboard-stats__value">{{ timeAgo || '—' }}</div>
        <div class="dashboard-stats__sub">{{ formattedTimestamp }}</div>
      </div>

      <div class="dashboard-stats__card">
        <div class="dashboard-stats__label">البوابات</div>
        <div class="dashboard-stats__value">
          <span class="dashboard-stats__gate-count">{{ openGates }}</span>
          <span class="dashboard-stats__gate-sep">/</span>
          <span class="dashboard-stats__gate-total">{{ totalGates }}</span>
        </div>
        <div class="dashboard-stats__sub">{{ openGates === totalGates ? 'جميع البوابات مفتوحة' : openGates === 0 ? 'جميع البوابات مغلقة' : `${openGates} بوابة مفتوحة` }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import { useTimeAgo } from "@/composables/useTimeAgo";
import { SPOT_STATUS } from "@/constants";

const store = useStore();

const spots = computed(() => store.getters.getSpots);
const lastUpdated = computed(() => store.getters.getLastUpdated);
const gateState = computed(() => store.getters.getGateState);

const allSpots = computed(() => ({
  ...spots.value.floor1,
  ...spots.value.floor2
}));

const totalCount = computed(() => Object.keys(allSpots.value).length);

const occupiedCount = computed(() =>
  Object.values(allSpots.value).filter(s => s === SPOT_STATUS.OCCUPIED).length
);

const occupancyPercent = computed(() => {
  if (totalCount.value === 0) return 0;
  return Math.round((occupiedCount.value / totalCount.value) * 100);
});

const occupancyClass = computed(() => {
  if (occupancyPercent.value >= 80) return "is-high";
  if (occupancyPercent.value >= 50) return "is-medium";
  return "is-low";
});

const { timeAgo } = useTimeAgo(lastUpdated);

const formattedTimestamp = computed(() => {
  if (!lastUpdated.value) return "";
  const d = new Date(lastUpdated.value);
  return d.toLocaleString("ar-SA");
});

const totalGates = 3;
const openGates = computed(() => {
  let count = 0;
  if (gateState.value.emergency) count++;
  if (gateState.value.entry) count++;
  if (gateState.value.exit) count++;
  return count;
});
</script>

<style scoped>
.dashboard-stats {
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  background: var(--glass-bg);
  backdrop-filter: var(--blur-md);
  border: 1px solid var(--glass-border);
}

.dashboard-stats__header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid var(--glass-border);
}

.dashboard-stats__header-icon {
  width: var(--icon-md);
  height: var(--icon-md);
  color: var(--accent-primary);
  flex-shrink: 0;
}

.dashboard-stats__header h3 {
  margin: 0 0 var(--space-2xs);
  font-size: var(--text-md);
  font-weight: 700;
  color: var(--text-primary);
}

.dashboard-stats__header p {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.dashboard-stats__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
}

.dashboard-stats__card {
  padding: var(--space-md);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.dashboard-stats__label {
  font-size: var(--text-2xs);
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dashboard-stats__value {
  font-size: var(--text-xl);
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.1;
  display: flex;
  align-items: baseline;
  gap: var(--space-xs);
}

.dashboard-stats__value.is-high {
  color: var(--status-error);
}

.dashboard-stats__value.is-medium {
  color: var(--accent-gold);
}

.dashboard-stats__value.is-low {
  color: var(--status-success);
}

.dashboard-stats__bar {
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.dashboard-stats__bar-fill {
  height: 100%;
  border-radius: 2px;
  background: var(--accent-primary);
  transition: width var(--duration-normal) var(--ease-out);
}

.dashboard-stats__sub {
  font-size: var(--text-2xs);
  color: var(--text-tertiary);
}

.dashboard-stats__gate-count {
  font-size: var(--text-xl);
  font-weight: 800;
  color: var(--status-success);
}

.dashboard-stats__gate-total {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-tertiary);
}

.dashboard-stats__gate-sep {
  font-size: var(--text-lg);
  color: var(--text-tertiary);
}

@media (max-width: 768px) {
  .dashboard-stats__grid {
    grid-template-columns: 1fr;
  }

  .dashboard-stats {
    padding: var(--space-md);
  }
}
</style>
