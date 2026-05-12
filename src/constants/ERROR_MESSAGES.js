export const AUTH_ERROR_MESSAGES = {
  "auth/email-already-in-use": "هذا البريد الإلكتروني مسجل بالفعل",
  "auth/invalid-email": "البريد الإلكتروني غير صالح",
  "auth/operation-not-allowed": "هذا النوع من الدخول غير مسموح",
  "auth/too-many-requests": "محاولات كثيرة جدا، حاول لاحقاً",
  "auth/user-disabled": "هذا الحساب معطل",
  "auth/user-not-found": "لا يوجد حساب بهذا البريد الإلكتروني",
  "auth/wrong-password": "كلمة المرور غير صحيحة",
  "auth/weak-password": "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
  "auth/invalid-credential": "بيانات الدخول غير صحيحة",
  "auth/network-request-failed": "خطأ في الاتصال بالإنترنت",
  "auth/cancelled-popup-request": "تم إلغاء الطلب",
  "auth/popup-blocked-by-browser": "المتصفح حظر النافذة المنبثقة",
  "auth/requires-recent-login": "يتطلب تسجيل دخول حديث"
};

export const getAuthErrorMessage = (errorCode) => {
  return AUTH_ERROR_MESSAGES[errorCode] || "حدث خطأ غير معروف، حاول مرة أخرى";
};
