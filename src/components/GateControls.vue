<template>
  <div class="gate-controls">
    <div class="gate-controls__header">
      <svg class="gate-controls__header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="1" y="3" width="22" height="18" rx="2" />
        <line x1="1" y1="9" x2="23" y2="9" />
        <line x1="7" y1="9" x2="7" y2="21" />
        <line x1="17" y1="9" x2="17" y2="21" />
        <path d="M7 15h10" />
        <path d="M7 18h10" />
      </svg>
      <div>
        <h3>التحكم في البوابات</h3>
        <p>فتح وإغلاق بوابات الدخول والخروج</p>
      </div>
    </div>

    <div class="gate-controls__list">
      <!-- Emergency toggle -->
      <div class="gate-controls__row is-emergency">
        <div class="gate-controls__info">
          <span class="gate-controls__label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            وضع الطوارئ
          </span>
          <span class="gate-controls__desc">فتح جميع البوابات في حالات الطوارئ</span>
        </div>
        <button
          class="gate-controls__switch"
          :class="{ 'is-active': gateState.emergency }"
          role="switch"
          :aria-checked="!!gateState.emergency"
          :aria-label="'وضع الطوارئ'"
          @click="handleEmergencyToggle"
        >
          <span class="gate-controls__knob"></span>
        </button>
      </div>

      <!-- Entry gate toggle -->
      <div class="gate-controls__row" :class="{ 'is-disabled': gateState.emergency }">
        <div class="gate-controls__info">
          <span class="gate-controls__label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            بوابة الدخول
          </span>
          <span class="gate-controls__desc">التحكم في بوابة دخول المركبات</span>
        </div>
        <button
          class="gate-controls__switch"
          :class="{ 'is-active': gateState.entry }"
          role="switch"
          :aria-checked="!!gateState.entry"
          :aria-label="'بوابة الدخول'"
          :disabled="!!gateState.emergency"
          @click="handleToggle('entry_open', gateState.entry ? 0 : 1)"
        >
          <span class="gate-controls__knob"></span>
        </button>
      </div>

      <!-- Exit gate toggle -->
      <div class="gate-controls__row" :class="{ 'is-disabled': gateState.emergency }">
        <div class="gate-controls__info">
          <span class="gate-controls__label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            بوابة الخروج
          </span>
          <span class="gate-controls__desc">التحكم في بوابة خروج المركبات</span>
        </div>
        <button
          class="gate-controls__switch"
          :class="{ 'is-active': gateState.exit }"
          role="switch"
          :aria-checked="!!gateState.exit"
          :aria-label="'بوابة الخروج'"
          :disabled="!!gateState.emergency"
          @click="handleToggle('exit_open', gateState.exit ? 0 : 1)"
        >
          <span class="gate-controls__knob"></span>
        </button>
      </div>
    </div>

    <!-- Emergency confirmation modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showConfirm" class="gate-controls__overlay" @click.self="cancelConfirm">
          <div class="gate-controls__modal" role="alertdialog" aria-labelledby="confirm-title">
            <div class="gate-controls__modal-icon" :class="confirmAction === 'activate' ? 'is-danger' : 'is-info'">
              <svg v-if="confirmAction === 'activate'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <h4 id="confirm-title">
              {{ confirmAction === 'activate' ? 'تفعيل وضع الطوارئ' : 'إلغاء وضع الطوارئ' }}
            </h4>
            <p>
              {{ confirmAction === 'activate'
                ? 'سيتم تفعيل وضع الطوارئ. هل أنت متأكد؟'
                : 'سيتم إلغاء وضع الطوارئ. هل أنت متأكد؟'
              }}
            </p>
            <div class="gate-controls__modal-actions">
              <button class="gate-controls__btn gate-controls__btn--cancel" @click="cancelConfirm">
                إلغاء
              </button>
              <button
                class="gate-controls__btn"
                :class="confirmAction === 'activate' ? 'gate-controls__btn--danger' : 'gate-controls__btn--confirm'"
                @click="confirmEmergency"
              >
                {{ confirmAction === 'activate' ? 'تفعيل' : 'إلغاء الوضع' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import { useToast } from "@/composables/useToast";

const GATE_LABELS = {
  entry_open: { on: "تم فتح بوابة الدخول", off: "تم إغلاق بوابة الدخول" },
  exit_open: { on: "تم فتح بوابة الخروج", off: "تم إغلاق بوابة الخروج" }
};

const store = useStore();
const toast = useToast();
const showConfirm = ref(false);
const confirmAction = ref("");

const gateState = computed(() => store.getters.getGateState);

async function handleToggle(field, value) {
  try {
    await store.dispatch("toggleGate", { field, value });
    const label = GATE_LABELS[field];
    if (label) {
      toast.success(value ? label.on : label.off);
    }
  } catch (err) {
    console.error("Gate toggle error:", err);
    toast.error("فشل في تنفيذ العملية. الرجاء المحاولة مرة أخرى");
  }
}

function handleEmergencyToggle() {
  const newValue = gateState.value.emergency ? 0 : 1;
  confirmAction.value = newValue === 1 ? "activate" : "deactivate";
  showConfirm.value = true;
}

async function confirmEmergency() {
  const value = confirmAction.value === "activate" ? 1 : 0;
  try {
    await store.dispatch("toggleEmergency", value);
    toast.success(
      value
        ? "تم تفعيل وضع الطوارئ"
        : "تم إلغاء وضع الطوارئ"
    );
    showConfirm.value = false;
    confirmAction.value = "";
  } catch (err) {
    console.error("Emergency toggle error:", err);
    toast.error("فشل في تنفيذ العملية. الرجاء المحاولة مرة أخرى");
  }
}

function cancelConfirm() {
  showConfirm.value = false;
  confirmAction.value = "";
}
</script>

<style scoped>
.gate-controls {
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  background: var(--glass-bg);
  backdrop-filter: var(--blur-md);
  border: 1px solid var(--glass-border);
}

.gate-controls__header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid var(--glass-border);
}

.gate-controls__header-icon {
  width: var(--icon-md);
  height: var(--icon-md);
  color: var(--accent-primary);
  flex-shrink: 0;
}

.gate-controls__header h3 {
  margin: 0 0 var(--space-2xs);
  font-size: var(--text-md);
  font-weight: 700;
  color: var(--text-primary);
}

.gate-controls__header p {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.gate-controls__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.gate-controls__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid transparent;
  transition: all var(--duration-normal) var(--ease-out);
}

.gate-controls__row:hover {
  border-color: var(--glass-border);
}

.gate-controls__row.is-emergency {
  background: rgba(239, 68, 68, 0.06);
  border-color: rgba(239, 68, 68, 0.15);
}

.gate-controls__row.is-emergency:hover {
  border-color: rgba(239, 68, 68, 0.3);
}

.gate-controls__row.is-disabled {
  opacity: 0.5;
  pointer-events: none;
}

.gate-controls__info {
  display: flex;
  flex-direction: column;
  gap: var(--space-2xs);
}

.gate-controls__label {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.gate-controls__label svg {
  width: var(--icon-xs);
  height: var(--icon-xs);
  color: var(--accent-primary);
}

.is-emergency .gate-controls__label svg {
  color: var(--status-error);
}

.gate-controls__desc {
  font-size: var(--text-2xs);
  color: var(--text-secondary);
}

/* ---- Toggle Switch ---- */
.gate-controls__switch {
  position: relative;
  width: clamp(44px, 8vw, 56px);
  height: clamp(24px, 4vw, 30px);
  padding: 0;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  flex-shrink: 0;
  transition: background var(--duration-normal) var(--ease-out);
}

.gate-controls__switch:hover {
  background: rgba(255, 255, 255, 0.15);
}

.gate-controls__switch:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 3px;
}

.gate-controls__switch.is-active {
  background: var(--accent-primary);
}

.gate-controls__row.is-emergency .gate-controls__switch.is-active {
  background: var(--status-error);
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.4);
}

.gate-controls__switch:active {
  transform: scale(0.95);
}

.gate-controls__knob {
  position: absolute;
  top: 3px;
  left: 3px;
  height: calc(100% - 6px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: left var(--duration-normal) var(--ease-spring);
}

.gate-controls__switch.is-active .gate-controls__knob {
  left: auto;
  right: 3px;
}

/* ---- Confirmation Modal ---- */
.gate-controls__overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  padding: var(--space-lg);
}

.gate-controls__modal {
  width: 100%;
  max-width: 400px;
  padding: var(--space-xl);
  border-radius: var(--radius-lg);
  background: var(--glass-bg);
  backdrop-filter: var(--blur-lg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-xl);
  text-align: center;
}

.gate-controls__modal-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(48px, 10vw, 64px);
  height: clamp(48px, 10vw, 64px);
  margin: 0 auto var(--space-lg);
  border-radius: 50%;
}

.gate-controls__modal-icon svg {
  width: 50%;
  height: 50%;
}

.gate-controls__modal-icon.is-danger {
  background: rgba(239, 68, 68, 0.15);
  color: var(--status-error);
}

.gate-controls__modal-icon.is-info {
  background: rgba(14, 165, 233, 0.15);
  color: var(--accent-primary);
}

.gate-controls__modal h4 {
  margin: 0 0 var(--space-sm);
  font-size: var(--text-md);
  font-weight: 700;
  color: var(--text-primary);
}

.gate-controls__modal p {
  margin: 0 0 var(--space-xl);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.6;
}

.gate-controls__modal-actions {
  display: flex;
  gap: var(--space-md);
}

.gate-controls__btn {
  flex: 1;
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.gate-controls__btn:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

.gate-controls__btn--cancel {
  background: transparent;
  color: var(--text-secondary);
}

.gate-controls__btn--cancel:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.gate-controls__btn--danger {
  background: var(--status-error);
  color: white;
  border-color: var(--status-error);
}

.gate-controls__btn--danger:hover {
  background: #dc2626;
}

.gate-controls__btn--confirm {
  background: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
}

.gate-controls__btn--confirm:hover {
  background: var(--accent-dark);
}

/* ---- Modal Transitions ---- */
.modal-fade-enter-active {
  transition: opacity var(--duration-slow) var(--ease-out);
}

.modal-fade-leave-active {
  transition: opacity var(--duration-normal) var(--ease-out);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .gate-controls__modal {
  transition: transform var(--duration-slow) var(--ease-spring);
}

.modal-fade-leave-active .gate-controls__modal {
  transition: transform var(--duration-normal) var(--ease-out);
}

.modal-fade-enter-from .gate-controls__modal,
.modal-fade-leave-to .gate-controls__modal {
  transform: scale(0.9);
}

/* ---- Responsive ---- */
@media (max-width: 768px) {
  .gate-controls {
    padding: var(--space-md);
  }

  .gate-controls__row {
    flex-direction: row;
    padding: var(--space-sm);
  }

  .gate-controls__switch {
    min-width: 44px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .gate-controls__switch,
  .gate-controls__knob,
  .gate-controls__modal,
  .gate-controls__overlay {
    transition: none;
  }

  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: none;
  }
}
</style>
