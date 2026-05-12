import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, firestore } from "../../firebase/config";

const FIRESTORE_COLLECTION = "users";

const state = () => ({
  user: null,
  userDoc: null,
  isAdmin: false,
  isLoading: false,
  error: null
});

const getters = {
  currentUser: (state) => state.user,
  isAuthenticated: (state) => !!state.user,
  isUserAdmin: (state) => state.isAdmin,
  isAuthLoading: (state) => state.isLoading,
  authError: (state) => state.error,
  userDisplayName: (state) => state.user?.displayName || state.userDoc?.name || "",
  userEmail: (state) => state.user?.email || state.userDoc?.email || ""
};

const mutations = {
  SET_USER(state, user) {
    state.user = user;
  },
  SET_USER_DOC(state, doc) {
    state.userDoc = doc;
  },
  SET_IS_ADMIN(state, value) {
    state.isAdmin = value;
  },
  SET_LOADING(state, value) {
    state.isLoading = value;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
  CLEAR_USER(state) {
    state.user = null;
    state.userDoc = null;
    state.isAdmin = false;
    state.error = null;
  }
};

const actions = {
  async signup({ commit }, { email, password, name }) {
    commit("SET_ERROR", null);
    commit("SET_LOADING", true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(userCredential.user, { displayName: name });

      const userDoc = {
        uid: userCredential.user.uid,
        name,
        email,
        isAdmin: false,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(firestore, FIRESTORE_COLLECTION, userCredential.user.uid), userDoc);

      commit("SET_USER", userCredential.user);
      commit("SET_USER_DOC", userDoc);
      commit("SET_IS_ADMIN", false);
      commit("SET_LOADING", false);

      return userCredential.user;
    } catch (error) {
      commit("SET_ERROR", error.code);
      commit("SET_LOADING", false);
      console.error("Signup error:", error.code);
      throw error;
    }
  },

  async login({ commit, dispatch }, { email, password }) {
    commit("SET_ERROR", null);
    commit("SET_LOADING", true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      commit("SET_USER", userCredential.user);
      await dispatch("fetchUserDoc");
      commit("SET_LOADING", false);
      return userCredential.user;
    } catch (error) {
      commit("SET_ERROR", error.code);
      commit("SET_LOADING", false);
      console.error("Login error:", error.code);
      throw error;
    }
  },

  async logout({ commit }) {
    try {
      await signOut(auth);
      commit("CLEAR_USER");
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  async fetchUserDoc({ commit, state }) {
    if (!state.user) return;

    try {
      const docSnap = await getDoc(doc(firestore, FIRESTORE_COLLECTION, state.user.uid));
      if (docSnap.exists()) {
        const userData = docSnap.data();
        commit("SET_USER_DOC", userData);
        commit("SET_IS_ADMIN", userData.isAdmin || false);
      }
    } catch (error) {
      console.error("Error fetching user doc:", error);
    }
  },

  async initAuthListener({ commit, dispatch }) {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          commit("SET_USER", user);
          await dispatch("fetchUserDoc");
          commit("SET_LOADING", false);
          resolve(user);
        } else {
          commit("CLEAR_USER");
          commit("SET_LOADING", false);
          resolve(null);
        }
      });
    });
  },

  clearError({ commit }) {
    commit("SET_ERROR", null);
  }
};


export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
