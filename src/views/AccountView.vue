<template>
  <div class="account-view">
    <!-- Login / Signup -->
    <div v-if="!showProfile" class="auth-card">
      <div class="auth-header">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <h2>{{ isLogin ? $t('auth.loginTitle') : $t('auth.signupTitle') }}</h2>
        <p>{{ isLogin ? $t('auth.loginSubtitle') : $t('auth.signupSubtitle') }}</p>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div v-if="error" class="error-message" role="alert">
          {{ errorMessage }}
        </div>

        <div v-if="!isLogin" class="form-group">
          <label for="name">{{ $t('auth.nameLabel') }}</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            :class="{ 'has-error': errors.name }"
            :placeholder="$t('auth.namePlaceholder')"
            autocomplete="name"
          />
          <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
        </div>

        <div class="form-group">
          <label for="email">{{ $t('auth.emailLabel') }}</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            :class="{ 'has-error': errors.email }"
            :placeholder="$t('auth.emailPlaceholder')"
            autocomplete="email"
          />
          <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password">{{ $t('auth.passwordLabel') }}</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            :class="{ 'has-error': errors.password }"
            :placeholder="$t('auth.passwordPlaceholder')"
            autocomplete="current-password"
          />
          <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
        </div>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          <span v-if="isLoading" class="spinner"></span>
          <span v-else>{{ isLogin ? $t('auth.loginBtn') : $t('auth.signupBtn') }}</span>
        </button>
      </form>

      <div class="auth-footer">
        <button @click="toggleMode" class="toggle-btn">
          {{ isLogin ? $t('auth.toggleLogin') : $t('auth.toggleSignup') }}
        </button>
      </div>
    </div>

    <!-- Profile -->
    <div v-else class="profile-card">
      <!-- Verification banner -->
      <div v-if="!isEmailVerified" class="verification-banner" role="alert">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9,12 11,14 15,10" />
        </svg>
        <span>{{ $t('auth.verifyBanner') }}</span>
        <button
          :disabled="isSendingVerification"
          class="resend-btn"
          @click="resendVerification"
        >
          {{ isSendingVerification ? $t('auth.verifySending') : $t('auth.verifyResend') }}
        </button>
      </div>

      <!-- Profile header -->
      <div class="profile-header">
        <div class="profile-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div class="profile-info">
          <h2>{{ displayName || $t('auth.profileName', { name: '' }).trim() || $t('auth.profileName', { name: '' }) }}</h2>
          <p>{{ userEmail }}</p>
          <span v-if="isAdmin" class="admin-badge">{{ $t('auth.badgeAdmin') }}</span>
          <span v-if="!isEmailVerified" class="unverified-badge">{{ $t('auth.badgeUnverified') }}</span>
        </div>
      </div>

      <!-- Error message -->
      <div v-if="profileError" class="error-message" role="alert">
        {{ profileErrorMessage }}
      </div>

      <!-- Edit name -->
      <div class="profile-section">
        <h3 class="section-title">{{ $t('auth.editName') }}</h3>
        <div class="input-row">
          <input
            v-model="nameInput"
            type="text"
            class="profile-input"
            :placeholder="$t('auth.editNamePlaceholder')"
            :disabled="isUpdatingProfile"
          />
          <button
            class="save-btn"
            :disabled="isUpdatingProfile || !nameInput.trim() || nameInput === displayName"
            @click="saveName"
          >
            <span v-if="isUpdatingProfile" class="spinner-sm"></span>
            <span v-else>{{ $t('auth.save') }}</span>
          </button>
        </div>
      </div>

      <!-- Edit email -->
      <div class="profile-section">
        <h3 class="section-title">{{ $t('auth.editEmail') }}</h3>
        <div class="input-row">
          <input
            v-model="emailInput"
            type="email"
            class="profile-input"
            :placeholder="$t('auth.editEmailPlaceholder')"
            :disabled="isUpdatingProfile"
          />
        </div>
        <div class="input-row">
          <input
            v-model="emailPassword"
            type="password"
            class="profile-input"
            :placeholder="$t('auth.confirmPassword')"
            :disabled="isUpdatingProfile"
          />
          <button
            class="save-btn"
            :disabled="isUpdatingProfile || !emailInput.trim() || !emailPassword"
            @click="saveEmail"
          >
            <span v-if="isUpdatingProfile" class="spinner-sm"></span>
            <span v-else>{{ $t('auth.save') }}</span>
          </button>
        </div>
        <p class="section-hint">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          {{ $t('auth.emailHint') }}
        </p>
      </div>

      <!-- Change password -->
      <div class="profile-section">
        <h3 class="section-title">{{ $t('auth.changePassword') }}</h3>
        <div class="input-group">
          <input
            v-model="passwordCurrent"
            type="password"
            class="profile-input"
            :placeholder="$t('auth.currentPassword')"
            :disabled="isUpdatingProfile"
          />
          <input
            v-model="passwordNew"
            type="password"
            class="profile-input"
            :placeholder="$t('auth.newPassword')"
            :disabled="isUpdatingProfile"
          />
          <input
            v-model="passwordConfirm"
            type="password"
            class="profile-input"
            :class="{ 'has-error': passwordError }"
            :placeholder="$t('auth.confirmNewPassword')"
            :disabled="isUpdatingProfile"
          />
          <span v-if="passwordError" class="field-error">{{ passwordError }}</span>
          <button
            class="save-btn"
            :disabled="isUpdatingProfile || !passwordCurrent || !passwordNew || !passwordConfirm"
            @click="savePassword"
          >
            <span v-if="isUpdatingProfile" class="spinner-sm"></span>
            <span v-else>{{ $t('auth.updatePassword') }}</span>
          </button>
        </div>
      </div>

      <!-- Delete account -->
      <div class="profile-section is-danger">
        <h3 class="section-title">{{ $t('auth.deleteAccount') }}</h3>
        <p class="section-desc">{{ $t('auth.deleteWarning') }}</p>
        <button class="delete-btn" @click="openDeleteModal">{{ $t('auth.deleteBtn') }}</button>
      </div>

      <!-- Logout -->
      <button class="logout-btn" @click="handleLogout">{{ $t('auth.logout') }}</button>
    </div>

    <!-- Delete confirmation modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showDeleteModal" class="modal-overlay" @click.self="cancelDelete">
          <div class="modal-card" role="alertdialog" aria-labelledby="delete-title">
            <div class="modal-icon is-danger">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h4 id="delete-title">{{ $t('auth.modalDeleteTitle') }}</h4>
            <p>{{ $t('auth.modalDeleteDesc') }}</p>
            <div class="modal-input-row">
              <input
                v-model="deletePassword"
                type="password"
                class="profile-input"
                :placeholder="$t('auth.modalDeletePlaceholder')"
                :disabled="isUpdatingProfile"
                @keydown.enter="confirmDelete"
              />
            </div>
            <div v-if="deleteError" class="field-error" style="text-align:center;margin-bottom:var(--space-md)">
              {{ deleteError }}
            </div>
            <div class="modal-actions">
              <button class="modal-btn modal-btn--cancel" @click="cancelDelete">{{ $t('auth.modalCancel') }}</button>
              <button
                class="modal-btn modal-btn--danger"
                :disabled="isUpdatingProfile || !deletePassword"
                @click="confirmDelete"
              >
                <span v-if="isUpdatingProfile" class="spinner-sm"></span>
                <span v-else>{{ $t('auth.modalConfirmDelete') }}</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { getAuthErrorMessageKey } from "@/constants/ERROR_MESSAGES";
import { useToast } from "@/composables/useToast";

const store = useStore();
const router = useRouter();
const { t } = useI18n();
const toast = useToast();

const isLogin = ref(true);
const form = ref({ name: "", email: "", password: "" });
const errors = ref({ name: "", email: "", password: "" });

const nameInput = ref("");
const emailInput = ref("");
const emailPassword = ref("");
const passwordCurrent = ref("");
const passwordNew = ref("");
const passwordConfirm = ref("");
const passwordError = ref("");
const deletePassword = ref("");
const deleteError = ref("");
const showDeleteModal = ref(false);
const isSendingVerification = ref(false);

const isLoading = computed(() => store.getters["auth/isAuthLoading"]);
const isUpdatingProfile = computed(() => store.getters["auth/isUpdatingProfile"]);
const isAuthenticated = computed(() => store.getters["auth/isAuthenticated"]);
const isAdmin = computed(() => store.getters["auth/isUserAdmin"]);
const error = computed(() => store.getters["auth/authError"]);
const displayName = computed(() => store.getters["auth/userDisplayName"]);
const userEmail = computed(() => store.getters["auth/userEmail"]);
const isEmailVerified = computed(() => store.getters["auth/userEmailVerified"]);
const profileError = computed(() => store.getters["auth/authError"]);

const showProfile = computed(() => isAuthenticated.value && !isLoading.value);

const errorMessage = computed(() => {
  if (!error.value) return "";
  return t(getAuthErrorMessageKey(error.value));
});

const profileErrorMessage = computed(() => {
  if (!profileError.value) return "";
  return t(getAuthErrorMessageKey(profileError.value));
});

watch(showProfile, (val) => {
  if (val) {
    nameInput.value = displayName.value;
    emailInput.value = userEmail.value;
  }
});

function toggleMode() {
  isLogin.value = !isLogin.value;
  store.dispatch("auth/clearError");
  clearForm();
}

function clearForm() {
  form.value = { name: "", email: "", password: "" };
  errors.value = { name: "", email: "", password: "" };
}

function validate() {
  let isValid = true;
  errors.value = { name: "", email: "", password: "" };

  if (!isLogin.value && !form.value.name.trim()) {
    errors.value.name = t("auth.validatorNameRequired");
    isValid = false;
  }

  if (!form.value.email.trim()) {
    errors.value.email = t("auth.validatorEmailRequired");
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = t("auth.validatorEmailInvalid");
    isValid = false;
  }

  if (!form.value.password) {
    errors.value.password = t("auth.validatorPasswordRequired");
    isValid = false;
  } else if (form.value.password.length < 6) {
    errors.value.password = t("auth.validatorPasswordMin");
    isValid = false;
  }

  return isValid;
}

function redirectIfAdmin() {
  if (store.getters["auth/isUserAdmin"]) {
    router.push("/dashboard");
  }
}

async function handleLogin() {
  await store.dispatch("auth/login", {
    email: form.value.email,
    password: form.value.password
  });
  redirectIfAdmin();
  if (!store.getters["auth/isUserAdmin"]) {
    toast.success(t("auth.toastLoginSuccess"));
  }
}

async function handleSignup() {
  await store.dispatch("auth/signup", {
    email: form.value.email,
    password: form.value.password,
    name: form.value.name
  });
  redirectIfAdmin();
  if (!store.getters["auth/isUserAdmin"]) {
    toast.success(t("auth.toastSignupSuccess"));
  }
}

async function handleSubmit() {
  if (!validate()) return;
  if (isLogin.value) {
    await handleLogin();
  } else {
    await handleSignup();
  }
}

async function saveName() {
  const name = nameInput.value.trim();
  if (!name || name === displayName.value) return;

  try {
    await store.dispatch("auth/updateProfileName", { name });
    toast.success(t("auth.toastNameUpdated"));
  } catch (err) {
    toast.error(t("auth.toastNameFailed"));
  }
}

async function saveEmail() {
  const newEmail = emailInput.value.trim();
  if (!newEmail || !emailPassword.value) return;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    toast.error(t("auth.toastEmailInvalid"));
    return;
  }

  try {
    await store.dispatch("auth/updateProfileEmail", {
      newEmail,
      password: emailPassword.value
    });
    emailPassword.value = "";
    toast.success(t("auth.toastEmailUpdated"));
  } catch (err) {
    toast.error(t("auth.toastEmailFailed"));
  }
}

async function savePassword() {
  passwordError.value = "";

  if (!passwordCurrent.value || !passwordNew.value || !passwordConfirm.value) return;
  if (passwordNew.value.length < 6) {
    passwordError.value = t("auth.validatorPasswordMin");
    return;
  }
  if (passwordNew.value !== passwordConfirm.value) {
    passwordError.value = t("auth.validatorPasswordMatch");
    return;
  }

  try {
    await store.dispatch("auth/updateProfilePassword", {
      currentPassword: passwordCurrent.value,
      newPassword: passwordNew.value
    });
    passwordCurrent.value = "";
    passwordNew.value = "";
    passwordConfirm.value = "";
    toast.success(t("auth.toastPasswordUpdated"));
  } catch (err) {
    toast.error(t("auth.toastPasswordFailed"));
  }
}

async function resendVerification() {
  isSendingVerification.value = true;
  try {
    await store.dispatch("auth/sendVerificationEmail");
    toast.success(t("auth.toastVerificationSent"));
  } catch (err) {
    toast.error(t("auth.toastVerificationFailed"));
  }
  isSendingVerification.value = false;
}

function openDeleteModal() {
  deletePassword.value = "";
  deleteError.value = "";
  showDeleteModal.value = true;
}

function cancelDelete() {
  showDeleteModal.value = false;
  deletePassword.value = "";
  deleteError.value = "";
}

async function confirmDelete() {
  if (!deletePassword.value) return;
  deleteError.value = "";

  try {
    await store.dispatch("auth/deleteAccount", { password: deletePassword.value });
    toast.success(t("auth.toastAccountDeleted"));
    showDeleteModal.value = false;
    router.push("/");
  } catch (err) {
    deleteError.value = t(getAuthErrorMessageKey(store.getters["auth/authError"]));
  }
}

async function handleLogout() {
  await store.dispatch("auth/logout");
  router.push("/account");
}
</script>

<style scoped>
.account-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  padding: var(--space-lg);
}

/* ========== Auth Card (unchanged) ========== */
.auth-card {
  width: 100%;
  max-width: 420px;
  padding: clamp(24px, 5vw, 40px);
  border-radius: var(--radius-xl);
  background: var(--glass-bg);
  backdrop-filter: var(--blur-md);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-xl);
}

.auth-header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.auth-header svg {
  width: 48px;
  height: 48px;
  color: var(--accent-primary);
  margin-bottom: var(--space-md);
}

.auth-header h2 {
  margin: 0 0 var(--space-xs);
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--text-primary);
}

.auth-header p {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.form-group label {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--text-primary);
}

.form-group input,
.profile-input {
  padding: var(--space-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
  background: var(--asphalt-base);
  color: var(--text-primary);
  font-size: var(--text-base);
  transition: border-color var(--duration-fast) var(--ease-out);
}

.form-group input::placeholder,
.profile-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.6;
}

.form-group input:focus,
.profile-input:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.form-group input.has-error,
.profile-input.has-error {
  border-color: var(--status-error);
}

.field-error {
  font-size: var(--text-xs);
  color: var(--status-error);
}

.error-message {
  padding: var(--space-md);
  border-radius: var(--radius-md);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--status-error);
  color: var(--status-error);
  font-size: var(--text-sm);
  text-align: center;
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  width: 100%;
  padding: var(--space-md);
  border-radius: var(--radius-md);
  border: none;
  background: var(--accent-primary);
  color: var(--asphalt-base);
  font-size: var(--text-base);
  font-weight: 500;
  cursor: pointer;
  transition: transform var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top-color: var(--asphalt-base);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner-sm {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: var(--asphalt-base);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.auth-footer {
  margin-top: var(--space-xl);
  text-align: center;
}

.toggle-btn {
  background: none;
  border: none;
  color: var(--accent-primary);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-out);
}

.toggle-btn:hover {
  color: var(--accent-secondary);
}

/* ========== Profile Card ========== */
.profile-card {
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

/* Verification banner */
.verification-banner {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: var(--accent-gold);
  font-size: var(--text-sm);
  flex-wrap: wrap;
}

.verification-banner svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.resend-btn {
  background: none;
  border: none;
  color: var(--accent-gold-light);
  font-size: var(--text-xs);
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}

.resend-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Header */
.profile-header {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-xl);
  border-radius: var(--radius-lg);
  background: var(--glass-bg);
  backdrop-filter: var(--blur-md);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-lg);
}

.profile-avatar {
  width: clamp(56px, 12vw, 72px);
  height: clamp(56px, 12vw, 72px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--accent-glow);
  border: 2px solid var(--aisle-border);
  color: var(--accent-primary);
  flex-shrink: 0;
}

.profile-avatar svg {
  width: 55%;
  height: 55%;
}

.profile-info {
  flex: 1;
  min-width: 0;
}

.profile-info h2 {
  margin: 0 0 var(--space-2xs);
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--text-primary);
}

.profile-info p {
  margin: 0 0 var(--space-xs);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.admin-badge,
.unverified-badge {
  display: inline-block;
  padding: 2px var(--space-sm);
  border-radius: 999px;
  font-size: var(--text-2xs);
  font-weight: 700;
}

.admin-badge {
  background: var(--accent-glow);
  color: var(--accent-primary);
  border: 1px solid var(--aisle-border);
}

.unverified-badge {
  background: rgba(245, 158, 11, 0.1);
  color: var(--accent-gold);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

/* Sections */
.profile-section {
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  background: var(--glass-bg);
  backdrop-filter: var(--blur-md);
  border: 1px solid var(--glass-border);
}

.section-title {
  margin: 0 0 var(--space-md);
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--text-primary);
}

.input-row {
  display: flex;
  gap: var(--space-sm);
}

.input-row .profile-input {
  flex: 1;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.save-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-md);
  border: none;
  background: var(--accent-primary);
  color: var(--asphalt-base);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: transform var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.section-hint {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin: var(--space-sm) 0 0;
  font-size: var(--text-2xs);
  color: var(--text-tertiary);
}

.section-hint svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

/* Danger zone */
.profile-section.is-danger {
  border-color: rgba(239, 68, 68, 0.2);
  background: rgba(239, 68, 68, 0.04);
}

.profile-section.is-danger .section-title {
  color: var(--status-error);
}

.section-desc {
  margin: 0 0 var(--space-md);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.delete-btn {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-md);
  border: 1px solid var(--status-error);
  background: transparent;
  color: var(--status-error);
  font-size: var(--text-sm);
  font-weight: 700;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.delete-btn:hover {
  background: var(--status-error);
  color: #fff;
}

/* Logout */
.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  width: 100%;
  padding: var(--space-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.logout-btn:hover {
  color: var(--status-error);
  border-color: var(--status-error);
}

/* ========== Modal ========== */
.modal-overlay {
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

.modal-card {
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

.modal-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(48px, 10vw, 64px);
  height: clamp(48px, 10vw, 64px);
  margin: 0 auto var(--space-lg);
  border-radius: 50%;
}

.modal-icon svg {
  width: 50%;
  height: 50%;
}

.modal-icon.is-danger {
  background: rgba(239, 68, 68, 0.15);
  color: var(--status-error);
}

.modal-card h4 {
  margin: 0 0 var(--space-sm);
  font-size: var(--text-md);
  font-weight: 700;
  color: var(--text-primary);
}

.modal-card p {
  margin: 0 0 var(--space-lg);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.6;
}

.modal-input-row {
  margin-bottom: var(--space-md);
}

.modal-input-row .profile-input {
  width: 100%;
}

.modal-actions {
  display: flex;
  gap: var(--space-md);
}

.modal-btn {
  flex: 1;
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.modal-btn:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

.modal-btn--cancel {
  background: transparent;
  color: var(--text-secondary);
}

.modal-btn--cancel:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.modal-btn--danger {
  background: var(--status-error);
  color: white;
  border-color: var(--status-error);
}

.modal-btn--danger:hover:not(:disabled) {
  background: var(--status-error);
  filter: brightness(1.1);
}

.modal-btn--danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal transition */
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

.modal-fade-enter-active .modal-card {
  transition: transform var(--duration-slow) var(--ease-spring);
}

.modal-fade-leave-active .modal-card {
  transition: transform var(--duration-normal) var(--ease-out);
}

.modal-fade-enter-from .modal-card,
.modal-fade-leave-to .modal-card {
  transform: scale(0.9);
}

/* ========== Responsive ========== */
@media (max-width: 768px) {
  .profile-card {
    max-width: 100%;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .input-row {
    flex-direction: column;
  }

  .save-btn {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .submit-btn,
  .save-btn,
  .delete-btn,
  .modal-card,
  .modal-overlay {
    transition: none;
  }

  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: none;
  }
}
</style>
