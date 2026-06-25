<template>
  <div class="about">
    <div class="about-card">
      <div class="info-board">
        <div class="board-header">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>{{ $t('about.badge') }}</span>
        </div>
        <div class="board-content">
          <h2>{{ $t('about.heading') }}</h2>
          <p>{{ $t('about.description') }}</p>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-chip">
          <span class="stat-chip__value">{{ $t('about.statsSpotsValue') }}</span>
          <span class="stat-chip__label">{{ $t('about.statsSpots') }}</span>
        </div>
        <div class="stat-chip">
          <span class="stat-chip__value">{{ $t('about.statsFloorsValue') }}</span>
          <span class="stat-chip__label">{{ $t('about.statsFloors') }}</span>
        </div>
        <div class="stat-chip">
          <span class="stat-chip__value">{{ $t('about.statsGatesValue') }}</span>
          <span class="stat-chip__label">{{ $t('about.statsGates') }}</span>
        </div>
      </div>

      <div class="tech-section">
        <h3 class="tech-section__title">{{ $t('about.techTitle') }}</h3>
        <div class="tech-grid">
          <div class="tech-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            <span class="tech-item__label">{{ $t('about.techFrontend') }}</span>
            <span class="tech-item__desc">{{ $t('about.techFrontendDesc') }}</span>
          </div>
          <div class="tech-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            </svg>
            <span class="tech-item__label">{{ $t('about.techBackend') }}</span>
            <span class="tech-item__desc">{{ $t('about.techBackendDesc') }}</span>
          </div>
          <div class="tech-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span class="tech-item__label">{{ $t('about.techAdmin') }}</span>
            <span class="tech-item__desc">{{ $t('about.techAdminDesc') }}</span>
          </div>
          <div class="tech-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span class="tech-item__label">{{ $t('about.techBrowser') }}</span>
            <span class="tech-item__desc">{{ $t('about.techBrowserDesc') }}</span>
          </div>
          <div class="tech-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <path d="M9 9h6v6H9z" />
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2M6 2v2M18 2v2M6 20v2M18 20v2M2 6h2M2 18h2M20 6h2M20 18h2" />
            </svg>
            <span class="tech-item__label">{{ $t('about.techHardware') }}</span>
            <span class="tech-item__desc">{{ $t('about.techHardwareDesc') }}</span>
          </div>
        </div>
      </div>

      <div class="features-grid">
        <div class="feature-item">
          <div class="feature-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
          </div>
          <h4>{{ $t('about.featurePath') }}</h4>
          <p>{{ $t('about.featurePathDesc') }}</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon">
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
          <h4>{{ $t('about.featureManagement') }}</h4>
          <p>{{ $t('about.featureManagementDesc') }}</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon">
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
          <h4>{{ $t('about.featureMultiFloor') }}</h4>
          <p>{{ $t('about.featureMultiFloorDesc') }}</p>
        </div>
      </div>

      <div class="app-download-section">
        <div class="app-download-card">
          <div class="app-download-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>
          <h3>{{ $t('about.appTitle') }}</h3>
          <p>{{ $t('about.appDesc') }}</p>
          <a :href="appDownloadUrl" class="download-btn" download>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {{ $t('about.appDownloadBtn') }}
          </a>
        </div>
      </div>

      <div class="about-footer">
        <span class="version-badge">{{ $t('about.version') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const appDownloadUrl = computed(() => "./ParkSmart.apk");
</script>

<style scoped>
.about {
  padding: var(--space-sm) 0 var(--space-lg);
}

.about-card {
  padding: var(--space-2xl);
  border-radius: var(--radius-xl);
  background: var(--asphalt-base);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-xl);
}

.info-board {
  position: relative;
  padding: var(--space-xl);
  border-radius: var(--radius-md);
  background: var(--asphalt-light);
  border: 1px solid var(--aisle-border);
  margin-bottom: var(--space-lg);
}

.info-board::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 4px;
  background: linear-gradient(
    90deg,
    var(--accent-primary),
    var(--accent-secondary),
    var(--accent-primary)
  );
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.board-header {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  margin-bottom: var(--space-sm);
  padding: var(--space-2xs) var(--space-sm);
  border-radius: 999px;
  background: var(--accent-glow);
  color: var(--accent-primary);
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.board-header svg {
  width: var(--icon-xs);
  height: var(--icon-xs);
}

.board-content h2 {
  margin: 0 0 var(--space-sm);
  font-size: clamp(1.1rem, 2vw, 1.4rem);
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.4;
}

.board-content p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.8;
  font-size: var(--text-sm);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-md);
}

.feature-item {
  padding: var(--space-xl);
  border-radius: var(--radius-md);
  background: var(--asphalt-dark);
  border: 1px solid var(--glass-border);
  text-align: center;
  transition: all var(--duration-normal) var(--ease-out);
}

.feature-item:hover {
  transform: translateY(-4px);
  border-color: var(--aisle-border);
  box-shadow: var(--shadow-md);
}

.feature-icon {
  width: var(--icon-xl);
  height: var(--icon-xl);
  margin: 0 auto var(--space-sm);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  background: var(--accent-glow);
  color: var(--accent-primary);
}

.feature-icon svg {
  width: 100%;
  height: 100%;
}

.feature-item h4 {
  margin: 0 0 var(--space-2xs);
  font-size: var(--text-md);
  font-weight: 700;
  color: var(--text-primary);
}

.feature-item p {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

.app-download-section {
  margin-top: var(--space-lg);
}

.app-download-card {
  padding: var(--space-xl);
  border-radius: var(--radius-md);
  background: var(--asphalt-dark);
  border: 1px solid var(--glass-border);
  text-align: center;
  transition: all var(--duration-normal) var(--ease-out);
}

.app-download-card:hover {
  border-color: var(--aisle-border);
  box-shadow: var(--shadow-md);
}

.app-download-icon {
  width: var(--icon-lg);
  height: var(--icon-lg);
  margin: 0 auto var(--space-sm);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  background: var(--accent-glow);
  color: var(--accent-primary);
}

.app-download-icon svg {
  width: 100%;
  height: 100%;
}

.app-download-card h3 {
  margin: 0 0 var(--space-2xs);
  font-size: var(--text-md);
  font-weight: 700;
  color: var(--text-primary);
}

.app-download-card p {
  margin: 0 0 var(--space-lg);
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

.download-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-xl);
  border-radius: var(--radius-md);
  border: none;
  background: var(--accent-primary);
  color: white;
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all var(--duration-fast) var(--ease-out);
}

.download-btn svg {
  width: var(--icon-sm);
  height: var(--icon-sm);
}

.download-btn:hover {
  background: var(--accent-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.download-btn:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

@media (max-width: 768px) {
  .about-card {
    padding: var(--space-xl);
  }

  .info-board {
    padding: var(--space-lg);
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .tech-grid {
    grid-template-columns: 1fr;
  }

  .download-btn {
    width: 100%;
    justify-content: center;
  }
}

.stats-row {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
  margin: var(--space-lg) 0;
}

.stat-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2xs);
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-md);
  background: var(--asphalt-dark);
  border: 1px solid var(--glass-border);
  min-width: 100px;
}

.stat-chip__value {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--accent-primary);
  line-height: 1;
}

.stat-chip__label {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.tech-section {
  margin-bottom: var(--space-lg);
}

.tech-section__title {
  margin: 0 0 var(--space-md);
  font-size: var(--text-md);
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--space-md);
}

.tech-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-lg);
  border-radius: var(--radius-md);
  background: var(--asphalt-dark);
  border: 1px solid var(--glass-border);
  text-align: center;
}

.tech-item svg {
  width: var(--icon-md);
  height: var(--icon-md);
  color: var(--accent-primary);
}

.tech-item__label {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--text-primary);
}

.tech-item__desc {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  line-height: 1.5;
}

.about-footer {
  display: flex;
  justify-content: center;
  margin-top: var(--space-lg);
  padding-top: var(--space-md);
  border-top: 1px solid var(--glass-border);
}

.version-badge {
  font-size: var(--text-2xs);
  color: var(--text-tertiary);
  padding: var(--space-2xs) var(--space-sm);
  border-radius: var(--radius-sm);
  background: var(--asphalt-dark);
  border: 1px solid var(--glass-border);
}
</style>
