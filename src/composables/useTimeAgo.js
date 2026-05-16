import { ref, onUnmounted, watch } from "vue";

const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

function formatAgo(diff) {
  if (diff < 5 * SEC) return "الآن";
  if (diff < MIN) return `${Math.floor(diff / SEC)}ث`;
  if (diff < HOUR) return `${Math.floor(diff / MIN)}د`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}س`;
  return `${Math.floor(diff / DAY)}ي`;
}

export function useTimeAgo(timestamp) {
  const timeAgo = ref("");

  let timer = null;

  function update() {
    if (timestamp.value == null) {
      timeAgo.value = "";
      return;
    }
    const diff = Date.now() - timestamp.value;
    timeAgo.value = diff >= 0 ? formatAgo(diff) : "just now";
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
