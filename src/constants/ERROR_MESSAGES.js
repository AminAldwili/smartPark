export const AUTH_ERROR_KEYS = {
  "auth/email-already-in-use": "errors.emailInUse",
  "auth/invalid-email": "errors.invalidEmail",
  "auth/operation-not-allowed": "errors.operationNotAllowed",
  "auth/too-many-requests": "errors.tooManyRequests",
  "auth/user-disabled": "errors.userDisabled",
  "auth/user-not-found": "errors.userNotFound",
  "auth/wrong-password": "errors.wrongPassword",
  "auth/weak-password": "errors.weakPassword",
  "auth/invalid-credential": "errors.invalidCredential",
  "auth/network-request-failed": "errors.networkError",
  "auth/cancelled-popup-request": "errors.cancelledPopup",
  "auth/popup-blocked-by-browser": "errors.popupBlocked",
  "auth/requires-recent-login": "errors.requiresRecentLogin"
};

export const getAuthErrorMessageKey = (errorCode) => {
  return AUTH_ERROR_KEYS[errorCode] || "errors.unknown";
};
