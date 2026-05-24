<template>
  <div class="home-view">
    <section class="hero-card">
      <div class="road-markings left">
        <span v-for="i in 5" :key="i" class="dash"></span>
      </div>

      <div class="hero-content">
        <div class="hero-badge">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h1v2c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2h1c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z"
            />
          </svg>
          <span>{{ $t('home.badge') }}</span>
        </div>
        <h2>{{ $t('home.heading') }}</h2>
        <p>{{ $t('home.description') }}</p>
      </div>

      <div class="hero-stats" :aria-label="$t('home.statsAria')">
        <div class="stat-chip">
          <div class="stat-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
          </div>
          <strong>2</strong>
          <span>{{ $t('home.statFloors') }}</span>
        </div>
        <div class="stat-chip">
          <div class="stat-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
            </svg>
          </div>
          <strong>15</strong>
          <span>{{ $t('home.statSpots') }}</span>
        </div>
        <div class="stat-chip accent">
          <div class="stat-icon pulse">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
          </div>
          <strong>{{ $t('home.statPath') }}</strong>
          <span>{{ $t('home.statPathLabel') }}</span>
        </div>
      </div>

      <div class="road-markings right">
        <span v-for="i in 5" :key="i" class="dash"></span>
      </div>
    </section>

    <ParkingFloors ref="floors" />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useSpotFromUrl } from "@/composables/useSpotFromUrl";
import ParkingFloors from "@/components/ParkingFloors.vue";

const { cleanSpotId, hasSlotParam } = useSpotFromUrl();
const floors = ref(null);

onMounted(() => {
  nextTick(() => {
    if (hasSlotParam.value && cleanSpotId.value) {
      setTimeout(() => {
        const floorsComponent = floors.value;
        if (floorsComponent?.scrollToSpot) {
          floorsComponent.scrollToSpot(cleanSpotId.value);
        }
      }, 1000);
    } else {
      const el = floors.value?.$el;
      if (el && el.scrollIntoView) {
        el.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }
  });
});
</script>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hero-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: clamp(16px, 3vw, 24px);
  padding: max(
      clamp(20px, 4vw, 40px),
      env(safe-area-inset-top),
      env(safe-area-inset-bottom)
    )
    max(
      clamp(20px, 4vw, 40px),
      env(safe-area-inset-right),
      env(safe-area-inset-left)
    );
  border-radius: clamp(16px, 3vw, 24px);
  background: linear-gradient(
    135deg,
    var(--asphalt-base) 0%,
    var(--asphalt-light) 100%
  );
  border: 1px solid var(--glass-border);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

.hero-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 60px,
    rgba(14, 165, 233, 0.01) 60px,
    rgba(14, 165, 233, 0.01) 61px
  );
  pointer-events: none;
}

.hero-content {
  flex: 1;
  max-width: 600px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
  padding: var(--space-xs) var(--space-md);
  border-radius: 999px;
  background: var(--accent-glow);
  border: 1px solid var(--aisle-border);
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--accent-primary);
}

.hero-badge svg {
  width: 16px;
  height: 16px;
}

.hero-content h2 {
  margin: 0 0 clamp(8px, 1.5vw, 12px);
  font-size: clamp(1.2rem, 3vw, 2.2rem);
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
}

.hero-content p {
  margin: 0;
  font-size: clamp(0.85rem, 2vw, 1rem);
  line-height: clamp(1.5, 2.5vw, 1.8);
  color: var(--text-secondary);
}

.hero-stats {
  display: flex;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.stat-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(4px, 1vw, 6px);
  min-width: max(80px, 20%);
  padding: clamp(12px, 2.5vw, 20px);
  border-radius: var(--radius-lg);
  background: var(--asphalt-dark);
  border: 1px solid var(--glass-border);
  text-align: center;
  transition:
    transform var(--duration-normal) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out),
    border-color var(--duration-normal) var(--ease-out);
}

.stat-chip:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: var(--aisle-border);
}

.stat-icon {
  width: var(--icon-sm);
  height: var(--icon-sm);
  color: var(--accent-primary);
}

.stat-icon svg {
  width: 100%;
  height: 100%;
}

.stat-icon.pulse {
  animation: pulse-icon 2s ease-in-out infinite;
}

@keyframes pulse-icon {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(0.95);
  }
}

.stat-chip strong {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--text-primary);
}

.stat-chip span {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.stat-chip.accent {
  background: var(--accent-glow);
  border-color: var(--aisle-border);
}

.stat-chip.accent .stat-icon {
  color: var(--accent-primary);
}

.stat-chip.accent strong {
  color: var(--accent-primary);
}

.road-markings {
  position: absolute;
  top: 0;
  bottom: 0;
  width: var(--icon-md);
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  opacity: 0.3;
}

.road-markings.left {
  left: 0;
}

.road-markings.right {
  right: 0;
}

.road-markings .dash {
  width: var(--space-2xs);
  height: clamp(20px, 4vw, 30px);
  background: var(--accent-primary);
  border-radius: var(--space-2xs);
  opacity: 0.5;
}

@media (max-width: 768px) {
  .hero-card {
    flex-direction: column;
    gap: var(--space-md);
  }

  .hero-stats {
    flex-direction: row;
    width: 100%;
    justify-content: center;
  }

  .road-markings {
    display: none;
  }
}

@media (max-width: 480px) {
  .hero-stats {
    gap: var(--space-sm);
  }
}

@media (prefers-reduced-motion: reduce) {
  .stat-icon.pulse {
    animation: none;
  }
}
</style>
