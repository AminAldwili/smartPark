<template>
  <div class="user-datagrid">
    <div class="datagrid-header">
      <div class="search-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('userGrid.searchPlaceholder')"
        />
      </div>
      <div class="user-count">
        {{ $t('userGrid.userCount', { count: filteredUsers.length }) }}
      </div>
    </div>

    <div class="datagrid-container">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ $t('userGrid.loading') }}</p>
      </div>

      <div v-else-if="error" class="error-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
        <p>{{ $t(error) }}</p>
        <button @click="fetchUsers" class="retry-btn">{{ $t('userGrid.retry') }}</button>
      </div>

      <div v-else-if="filteredUsers.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <p v-if="searchQuery">{{ $t('userGrid.emptySearch') }}</p>
        <p v-else>{{ $t('userGrid.emptyUsers') }}</p>
      </div>

      <table v-else class="users-table">
        <thead>
          <tr>
            <th>{{ $t('userGrid.headerName') }}</th>
            <th>{{ $t('userGrid.headerEmail') }}</th>
            <th>{{ $t('userGrid.headerAdmin') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.uid">
            <td class="user-name">{{ user.name || "—" }}</td>
            <td class="user-email">{{ user.email }}</td>
            <td class="user-admin">
              <label class="checkbox-wrapper">
                <input
                  type="checkbox"
                  :checked="user.isAdmin"
                  :disabled="user.uid === currentUserId"
                  @change="toggleAdmin(user, $event)"
                />
                <span class="checkbox-custom"></span>
              </label>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import { useToast } from "@/composables/useToast";

const store = useStore();
const { t } = useI18n();
const toast = useToast();

const searchQuery = ref("");

const currentUserId = computed(() => store.getters["auth/currentUser"]?.uid);
const users = computed(() => store.getters["auth/allUsers"]);
const isLoading = computed(() => store.getters["auth/isUsersLoading"]);
const error = computed(() => store.getters["auth/usersError"]);

const filteredUsers = computed(() => {
  if (!searchQuery.value.trim()) return users.value;

  const query = searchQuery.value.toLowerCase().trim();
  return users.value.filter(
    (user) =>
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
  );
});

async function fetchUsers() {
  try {
    await store.dispatch("auth/fetchUsers");
    toast.success(t("userGrid.toastLoaded"));
  } catch {
    toast.error(t("userGrid.toastError"));
  }
}

async function toggleAdmin(user, event) {
  const newIsAdmin = event.target.checked;

  try {
    await store.dispatch("auth/toggleAdmin", { user, isAdmin: newIsAdmin });
    toast.success(t("userGrid.toastPermissionUpdated"));
  } catch {
    event.target.checked = !newIsAdmin;
    toast.error(t("userGrid.toastPermissionFailed"));
  }
}

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.user-datagrid {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.datagrid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-md);
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-box svg {
  position: absolute;
  inset-inline-start: var(--space-md);
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: var(--text-secondary);
}

.search-box input {
  width: 100%;
  padding: var(--space-md);
  padding-inline-start: 44px;
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
  background: var(--asphalt-base);
  color: var(--text-primary);
  font-size: var(--text-base);
  transition: border-color var(--duration-fast) var(--ease-out);
}

.search-box input::placeholder {
  color: var(--text-secondary);
  opacity: 0.7;
}

.search-box input:focus {
  border-color: var(--accent-primary);
}

.search-box input:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

.user-count {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  padding: var(--space-sm) var(--space-md);
  background: var(--asphalt-base);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
}

.datagrid-container {
  border-radius: var(--radius-lg);
  background: var(--glass-bg);
  backdrop-filter: var(--blur-md);
  border: 1px solid var(--glass-border);
  overflow: hidden;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  padding: calc(var(--space-xl) * 2);
  min-height: 200px;
  text-align: center;
}

.loading-state svg,
.error-state svg,
.empty-state svg {
  width: 48px;
  height: 48px;
  color: var(--text-secondary);
}

.error-state svg {
  color: var(--status-error);
}

.loading-state p,
.error-state p,
.empty-state p {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--glass-border);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.retry-btn {
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-md);
  border: 1px solid var(--accent-primary);
  background: transparent;
  color: var(--accent-primary);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.retry-btn:hover {
  background: var(--accent-primary);
  color: var(--asphalt-base);
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  padding: var(--space-md);
  text-align: right;
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--text-secondary);
  background: var(--asphalt-dark);
  border-bottom: 1px solid var(--glass-border);
}

.users-table td {
  padding: var(--space-md);
  font-size: var(--text-base);
  color: var(--text-primary);
  border-bottom: 1px solid var(--glass-border);
}

.users-table tr:last-child td {
  border-bottom: none;
}

.users-table tr:hover td {
  background: var(--asphalt-base);
}

.user-name {
  font-weight: 700;
}

.user-email {
  color: var(--text-secondary);
}

.checkbox-wrapper {
  position: relative;
  display: inline-flex;
  cursor: pointer;
}

.checkbox-wrapper input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-custom {
  width: 22px;
  height: 22px;
  border-radius: var(--radius-sm);
  border: 2px solid var(--glass-border);
  background: var(--asphalt-base);
  transition: all var(--duration-fast) var(--ease-out);
}

.checkbox-wrapper input:checked + .checkbox-custom {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
}

.checkbox-wrapper input:checked + .checkbox-custom::after {
  content: "";
  position: absolute;
  inset-inline-start: 7px;
  inset-block-start: 3px;
  width: 6px;
  height: 10px;
  border: solid var(--asphalt-base);
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-wrapper input:focus-visible + .checkbox-custom {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

.checkbox-wrapper input:disabled + .checkbox-custom {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .datagrid-header {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    max-width: none;
  }

  .users-table {
    display: block;
    overflow-x: auto;
  }
}
</style>
