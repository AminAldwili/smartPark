import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import i18n from "./i18n";
import { checkConnection } from "./firebase/config";

const app = createApp(App);

app.use(store).use(router).use(i18n);

store.dispatch("initSpots").catch(() => {});
store.dispatch("auth/initAuthListener").catch(() => {});

checkConnection().then((ok) => {
  store.commit("SET_FIREBASE_ERROR", !ok);
});

app.mount("#app");
