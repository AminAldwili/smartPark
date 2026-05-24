import { ref, onUnmounted, watch } from "vue";
import { useI18n } from "vue-i18n";

const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

export function useTimeAgo(timestamp) {
  const { t } = useI18n();
  const timeAgo = ref("");

  let timer = null;

  function formatAgo(diff) {
    if (diff < 5 * SEC) return t("timeAgo.justNow");
    if (diff < MIN) return `${Math.floor(diff / SEC)}${t("timeAgo.seconds")}`;
    if (diff < HOUR) return `${Math.floor(diff / MIN)}${t("timeAgo.minutes")}`;
    if (diff < DAY) return `${Math.floor(diff / HOUR)}${t("timeAgo.hours")}`;
    return `${Math.floor(diff / DAY)}${t("timeAgo.days")}`;
  }

  function update() {
    if (timestamp.value == null) {
      timeAgo.value = "";
      return;
    }
    const diff = Date.now() - timestamp.value;
    timeAgo.value = diff >= 0 ? formatAgo(diff) : t("timeAgo.justNow");
  }

  function startTimer() {
    if (timer) return;
    timer = setInterval(update, 30 * SEC);
  }

  function stopTimer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  watch(timestamp, (val) => {
    if (val != null) {
      update();
      startTimer();
    } else {
      timeAgo.value = "";
      stopTimer();
    }
  }, { immediate: true });

  onUnmounted(stopTimer);

  return { timeAgo };
}
