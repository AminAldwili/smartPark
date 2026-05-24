<template>
  <Teleport to="body">
    <TransitionGroup name="toast" tag="div" class="toast-container">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast', `toast--${toast.type}`]"
        role="alert"
      >
        <div class="toast__icon">
          <svg v-if="toast.type === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12" />
          </svg>
          <svg v-else-if="toast.type === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <span class="toast__message">{{ toast.message }}</span>
        <button @click="removeToast(toast.id)" class="toast__close" :aria-label="$t('toast.closeAria')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup>
import { useToast } from "@/composables/useToast";
const { toasts, removeToast } = useToast();
</script>

<style>
.toast-container {
  position: fixed;
  bottom: var(--space-lg);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column-reverse;
  gap: var(--space-sm);
  z-index: 9999;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-md);
  background: var(--asphalt-light);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-lg);
  pointer-events: auto;
  min-width: 280px;
  max-width: 400px;
}

.toast--success {
  border-color: var(--status-success);
}

.toast--success .toast__icon {
  color: var(--status-success);
}

.toast--error {
  border-color: var(--status-error);
}

.toast--error .toast__icon {
  color: var(--status-error);
}

.toast--info .toast__icon {
  color: var(--accent-primary);
}

.toast__icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
}

.toast__icon svg {
  width: 100%;
  height: 100%;
}

.toast__message {
  flex: 1;
  font-size: var(--text-sm);
  color: var(--text-primary);
  text-align: right;
}

.toast__close {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-out);
}

.toast__close:hover {
  color: var(--text-primary);
}

.toast__close svg {
  width: 100%;
  height: 100%;
}

.toast-enter-active,
.toast-leave-active {
  transition: all var(--duration-normal) var(--ease-out);
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform var(--duration-normal) var(--ease-out);
}
</style>
