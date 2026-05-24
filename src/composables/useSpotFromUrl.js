import { computed } from "vue";
import { useRoute } from "vue-router";
import { getFloorFromSpotId } from "@/constants";

export function useSpotFromUrl() {
  const route = useRoute();

  const slotParam = computed(() => {
    const slot = route.query.slot;
    return slot || null;
  });

  const cleanSpotId = computed(() => {
    if (!slotParam.value) return null;
    return slotParam.value.split(" ")[0];
  });

  const targetFloor = computed(() => {
    if (!cleanSpotId.value) return null;
    return getFloorFromSpotId(cleanSpotId.value);
  });

  const hasSlotParam = computed(() => !!slotParam.value);

  const isQrScan = computed(() => route.query.scan === '1');

  return {
    slotParam,
    cleanSpotId,
    targetFloor,
    hasSlotParam,
    isQrScan
  };
}