import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  verifyBeforeUpdateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp, collection, getDocs } from "firebase/firestore";
import { auth, firestore } from "../../firebase/config";

const FIRESTORE_COLLECTION = "users";

let authUnsubscribe = null;

const state = () => ({
  user: null,
  userDoc: null,
  isAdmin: false,
  isLoading: false,
  isUpdatingProfile: false,
  error: null,
  users: [],
  isUsersLoading: false,
  usersError: null
});

const getters = {
  currentUser: (state) => state.user,
  isAuthenticated: (state) => !!state.user,
  isUserAdmin: (state) => state.isAdmin,
  isAuthLoading: (state) => state.isLoading,
  isUpdatingProfile: (state) => state.isUpdatingProfile,
  authError: (state) => state.error,
  userDisplayName: (state) => state.user?.displayName || state.userDoc?.name || "",
  userEmail: (state) => state.user?.email || state.userDoc?.email || "",
  userEmailVerified: (state) => state.user?.emailVerified || false,
  allUsers: (state) => state.users,
  isUsersLoading: (state) => state.isUsersLoading,
  usersError: (state) => state.usersError
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
  SET_UPDATING_PROFILE(state, value) {
    state.isUpdatingProfile = value;
  },
  CLEAR_USER(state) {
    state.user = null;
    state.userDoc = null;
    state.isAdmin = false;
    state.isUpdatingProfile = false;
    state.error = null;
  },
  SET_USERS(state, users) {
    state.users = users;
  },
  SET_USERS_LOADING(state, value) {
    state.isUsersLoading = value;
  },
  SET_USERS_ERROR(state, error) {
    state.usersError = error;
  },
  UPDATE_USER(state, { uid, updates }) {
    const idx = state.users.findIndex(u => u.uid === uid);
    if (idx !== -1) {
      state.users[idx] = { ...state.users[idx], ...updates };
    }
  }
};

const actions = {
  async signup({ commit, dispatch }, { email, password, name }) {
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

      dispatch("sendVerificationEmail").catch((err) =>
        console.error("Failed to send verification email:", err)
      );

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
    if (!auth) {
      commit("SET_LOADING", false);
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      authUnsubscribe = onAuthStateChanged(auth, async (user) => {
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

  stopAuthListener() {
    if (authUnsubscribe) {
      authUnsubscribe();
      authUnsubscribe = null;
    }
  },

  clearError({ commit }) {
    commit("SET_ERROR", null);
  },

  async sendVerificationEmail() {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await sendEmailVerification(user);
    } catch (error) {
      console.error("sendVerificationEmail error:", error);
      throw error;
    }
  },

  async updateProfileName({ commit, state }, { name }) {
    const user = auth.currentUser;
    if (!user) return;

    commit("SET_UPDATING_PROFILE", true);
    commit("SET_ERROR", null);

    try {
      await updateProfile(user, { displayName: name });
      await updateDoc(doc(firestore, FIRESTORE_COLLECTION, state.user.uid), { name });

      const updatedDoc = { ...state.userDoc, name };
      commit("SET_USER_DOC", updatedDoc);
      commit("SET_UPDATING_PROFILE", false);
    } catch (error) {
      commit("SET_UPDATING_PROFILE", false);
      commit("SET_ERROR", error.code);
      console.error("updateProfileName error:", error);
      throw error;
    }
  },

  async updateProfileEmail({ commit, state }, { newEmail, password }) {
    const user = auth.currentUser;
    if (!user || !user.email) return;

    commit("SET_UPDATING_PROFILE", true);
    commit("SET_ERROR", null);

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      await verifyBeforeUpdateEmail(user, newEmail);
      await updateDoc(doc(firestore, FIRESTORE_COLLECTION, state.user.uid), { email: newEmail });

      commit("SET_UPDATING_PROFILE", false);
    } catch (error) {
      commit("SET_UPDATING_PROFILE", false);
      commit("SET_ERROR", error.code);
      console.error("updateProfileEmail error:", error);
      throw error;
    }
  },

  async updateProfilePassword({ commit }, { currentPassword, newPassword }) {
    const user = auth.currentUser;
    if (!user || !user.email) return;

    commit("SET_UPDATING_PROFILE", true);
    commit("SET_ERROR", null);

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      commit("SET_UPDATING_PROFILE", false);
    } catch (error) {
      commit("SET_UPDATING_PROFILE", false);
      commit("SET_ERROR", error.code);
      console.error("updateProfilePassword error:", error);
      throw error;
    }
  },

  async deleteAccount({ commit }, { password }) {
    const user = auth.currentUser;
    if (!user || !user.email) return;

    commit("SET_UPDATING_PROFILE", true);
    commit("SET_ERROR", null);

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      await deleteDoc(doc(firestore, FIRESTORE_COLLECTION, user.uid));
      await deleteUser(user);

      commit("CLEAR_USER");
    } catch (error) {
      commit("SET_UPDATING_PROFILE", false);
      commit("SET_ERROR", error.code);
      console.error("deleteAccount error:", error);
      throw error;
    }
  },

  async fetchUsers({ commit }) {
    commit("SET_USERS_LOADING", true);
    commit("SET_USERS_ERROR", null);

    try {
      const querySnapshot = await getDocs(collection(firestore, FIRESTORE_COLLECTION));
      const users = querySnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data()
      }));
      commit("SET_USERS", users);
      commit("SET_USERS_LOADING", false);
      return users;
    } catch (err) {
      commit("SET_USERS_ERROR", "errors.dataLoadError");
      commit("SET_USERS_LOADING", false);
      console.error("Error fetching users:", err);
      throw err;
    }
  },

  async toggleAdmin({ commit }, { user, isAdmin }) {
    try {
      await updateDoc(doc(firestore, FIRESTORE_COLLECTION, user.uid), { isAdmin });
      commit("SET_USERS_ERROR", null);
      commit("UPDATE_USER", { uid: user.uid, updates: { isAdmin } });
    } catch (err) {
      commit("SET_USERS_ERROR", "errors.permissionUpdateError");
      console.error("Error updating admin status:", err);
      throw err;
    }
  }
};


export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
