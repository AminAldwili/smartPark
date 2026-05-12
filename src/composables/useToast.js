import { ref } from "vue";

let toastId = 0;
const toasts = ref([]);

export function useToast() {
  const addToast = (message, type = "info", duration = 3000) => {
    const id = ++toastId;
    toasts.value.push({ id, message, type });

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }

    return id;
  };

  const removeToast = (id) => {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  };

  const success = (message, duration) => addToast(message, "success", duration);
  const error = (message, duration) => addToast(message, "error", duration);
  const info = (message, duration) => addToast(message, "info", duration);

  return { toasts, addToast, removeToast, success, error, info };
}
