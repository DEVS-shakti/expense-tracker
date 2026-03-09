export const getFriendlyAuthError = (firebaseError, fallbackMessage) => {
  const code = firebaseError?.code;

  switch (code) {
    case "auth/unauthorized-domain":
      return "This domain is not authorized in Firebase Auth. Add it in Firebase Console > Authentication > Settings > Authorized domains.";
    case "auth/popup-blocked":
      return "Popup was blocked by your browser. Allow popups for this site and try again.";
    case "auth/popup-closed-by-user":
      return "Google sign-in popup was closed before completing sign-in.";
    case "auth/operation-not-allowed":
      return "Google sign-in is not enabled in Firebase Authentication providers.";
    case "auth/invalid-credential":
      return "Google sign-in credentials are invalid. Check Firebase provider configuration.";
    case "auth/network-request-failed":
      return "Network error while contacting Firebase. Check connection and try again.";
    default:
      return fallbackMessage;
  }
};
