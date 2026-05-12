<template>
  <div class="account-view">
    <div class="auth-card">
      <div class="auth-header">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <h2>{{ isLogin ? "تسجيل الدخول" : "إنشاء حساب" }}</h2>
        <p>{{ isLogin ? "مرحباً بعودتك" : "انضم إلينا اليوم" }}</p>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div v-if="error" class="error-message" role="alert">
          {{ errorMessage }}
        </div>

        <div v-if="!isLogin" class="form-group">
          <label for="name">الاسم</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            :class="{ 'has-error': errors.name }"
            placeholder="أدخل اسمك"
            autocomplete="name"
          />
          <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
        </div>

        <div class="form-group">
          <label for="email">البريد الإلكتروني</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            :class="{ 'has-error': errors.email }"
            placeholder="example@email.com"
            autocomplete="email"
          />
          <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password">كلمة المرور</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            :class="{ 'has-error': errors.password }"
            placeholder="••••••••"
            autocomplete="current-password"
          />
          <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
        </div>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          <span v-if="isLoading" class="spinner"></span>
          <span v-else>{{ isLogin ? "دخول" : "إنشاء حساب" }}</span>
        </button>
      </form>

      <div class="auth-footer">
        <button @click="toggleMode" class="toggle-btn">
          {{ isLogin ? "ليس لديك حساب؟ إنشاء جديد" : "لديك حساب؟ تسجيل الدخول" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { getAuthErrorMessage } from "@/constants/ERROR_MESSAGES";
import { useToast } from "@/composables/useToast";

export default {
  name: "AccountView",
  setup() {
    const store = useStore();
    const router = useRouter();
    const toast = useToast();

    const isLogin = ref(true);
    const isLoading = computed(() => store.getters["auth/isAuthLoading"]);
    const error = computed(() => store.getters["auth/authError"]);
    const isAdmin = computed(() => store.getters["auth/isUserAdmin"]);
    const isAuthenticated = computed(() => store.getters["auth/isAuthenticated"]);

    const form = ref({
      name: "",
      email: "",
      password: ""
    });

    const errors = ref({
      name: "",
      email: "",
      password: ""
    });

    const errorMessage = computed(() => {
      if (!error.value) return "";
      return getAuthErrorMessage(error.value);
    });

    const toggleMode = () => {
      isLogin.value = !isLogin.value;
      store.dispatch("auth/clearError");
      clearForm();
    };

    const clearForm = () => {
      form.value = { name: "", email: "", password: "" };
      errors.value = { name: "", email: "", password: "" };
    };

    const validate = () => {
      let isValid = true;
      errors.value = { name: "", email: "", password: "" };

      if (!isLogin.value && !form.value.name.trim()) {
        errors.value.name = "الاسم مطلوب";
        isValid = false;
      }

      if (!form.value.email.trim()) {
        errors.value.email = "البريد الإلكتروني مطلوب";
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
        errors.value.email = "البريد الإلكتروني غير صالح";
        isValid = false;
      }

      if (!form.value.password) {
        errors.value.password = "كلمة المرور مطلوبة";
        isValid = false;
      } else if (form.value.password.length < 6) {
        errors.value.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
        isValid = false;
      }

      return isValid;
    };

    const handleSubmit = async () => {
      if (!validate()) return;

      try {
        if (isLogin.value) {
          await store.dispatch("auth/login", {
            email: form.value.email,
            password: form.value.password
          });

          if (store.getters["auth/isUserAdmin"]) {
            router.push("/dashboard");
          } else {
            toast.success("تم تسجيل الدخول بنجاح");
            router.push("/");
          }
        } else {
          await store.dispatch("auth/signup", {
            email: form.value.email,
            password: form.value.password,
            name: form.value.name
          });

          if (store.getters["auth/isUserAdmin"]) {
            router.push("/dashboard");
          } else {
            toast.success("تم إنشاء الحساب بنجاح");
            router.push("/");
          }
        }
      } catch (err) {
        // Error already handled by store
      }
    };

    watch(isAuthenticated, (val) => {
      if (!val) return;
      router.push(isAdmin.value ? "/dashboard" : "/");
    });

    return {
      isLogin,
      isLoading,
      error,
      errorMessage,
      form,
      errors,
      toggleMode,
      handleSubmit
    };
  }
};
</script>

<style scoped>
.account-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  padding: var(--space-lg);
}

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
  font-weight: 600;
  color: var(--text-primary);
}

.form-group input {
  padding: var(--space-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
  background: var(--asphalt-base);
  color: var(--text-primary);
  font-size: var(--text-base);
  transition: border-color var(--duration-fast) var(--ease-out);
}

.form-group input::placeholder {
  color: var(--text-secondary);
  opacity: 0.6;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.form-group input.has-error {
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
  font-weight: 600;
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
</style>
