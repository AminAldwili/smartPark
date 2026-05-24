<template>
  <Teleport to="body">
    <Transition name="tooltip-fade">
      <div
        v-if="activeTooltip"
        class="global-tooltip"
        :style="{
          position: 'fixed',
          left: `${activeTooltip.x}px`,
          top: `${activeTooltip.y + 12}px`,
          transform: 'translateX(-50%)',
        }"
      >
        {{ activeTooltip.text }}
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";
import { useTooltip } from "@/composables/useTooltip";

const { activeTooltip, clearTooltip } = useTooltip();

onMounted(() => {
  window.addEventListener("scroll", clearTooltip, true);
});

onUnmounted(() => {
  window.removeEventListener("scroll", clearTooltip, true);
});
</script>

<style>
/* Global scope - not scoped, since teleported to body */
.global-tooltip {
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-sm);
  background: var(--asphalt-dark);
  color: var(--road-white);
  font-size: var(--text-xs);
  font-weight: 500;
  white-space: nowrap;
  z-index: 9999;
  pointer-events: none;
  box-shadow: var(--shadow-md);
  will-change: transform;
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}
</style>
