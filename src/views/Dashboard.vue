<template>
  <div class="dashboard-view">
    <div class="dashboard-header">
      <div class="header-content">
        <h2>لوحة التحكم</h2>
        <p>إدارة المستخدمين وصلاحياتهم</p>
      </div>
      <div class="header-actions">
        <button @click="goToMain" class="back-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9,22 9,12 15,12 15,22" />
          </svg>
          الرئيسية
        </button>
        <button @click="handleLogout" class="logout-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16,17 21,12 16,7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          تسجيل الخروج
        </button>
      </div>
    </div>

    <GateControls />
    <UserDataGrid />
  </div>
</template>

<script>
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import UserDataGrid from "@/components/UserDataGrid.vue";
import GateControls from "@/components/GateControls.vue";

export default {
  name: "DashboardView",
  components: { UserDataGrid, GateControls },
  setup() {
    const store = useStore();
    const router = useRouter();

    const handleLogout = async () => {
      await store.dispatch("auth/logout");
      router.push("/account");
    };

    const goToMain = () => {
      router.push("/");
    };

    return { handleLogout, goToMain };
  }
};
</script>

<style scoped>
.dashboard-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-lg);
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  background: var(--glass-bg);
  backdrop-filter: var(--blur-md);
  border: 1px solid var(--glass-border);
}

.header-content h2 {
  margin: 0 0 var(--space-xs);
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--text-primary);
}

.header-content p {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.header-actions {
  display: flex;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.back-btn,
.logout-btn {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
  background: var(--asphalt-base);
  color: var(--text-primary);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.back-btn:hover,
.logout-btn:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.back-btn svg,
.logout-btn svg {
  width: 18px;
  height: 18px;
}

.logout-btn:hover {
  border-color: var(--status-error);
  color: var(--status-error);
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
  }

  .back-btn,
  .logout-btn {
    flex: 1;
  }
}
</style>
