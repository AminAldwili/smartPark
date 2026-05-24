import { createI18n } from "vue-i18n";
import ar from "./locales/ar.json";
import en from "./locales/en.json";

const savedLocale = typeof localStorage !== "undefined"
  ? localStorage.getItem("locale")
  : null;

export default createI18n({
  legacy: false,
  locale: savedLocale || "ar",
  fallbackLocale: "ar",
  messages: { ar, en }
});
