/* ============================================================
   Firebase 設定檔
   ------------------------------------------------------------
   注意：Firebase Web App 的設定值是公開的（與 AWS/Azure 的 secret
   key 不同），它們只是識別用戶端應用程式的 ID，不是機密。
   安全是靠 Firestore Security Rules 與 Firebase App Check 來保障。
   完整說明見
   https://firebase.google.com/docs/projects/api-keys
   ============================================================ */
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyDOPSC0aR9P0HCn1LeUqJ2p3EGeu7Kzbdw",
  authDomain: "math-platform-clive.firebaseapp.com",
  projectId: "math-platform-clive",
  storageBucket: "math-platform-clive.firebasestorage.app",
  messagingSenderId: "988107913601",
  appId: "1:988107913601:web:7547902922ddfe9f2e9080"
};

/* ============================================================
   自有 SSO 系統設定（下階段實作，暫保持關閉）
   ============================================================ */
window.SSO_CONFIG = {
  USE_CUSTOM_SSO: false,
  ssoLoginUrl: "",
  ssoTokenName: "sso_token",
  ssoVerifyUrl: ""
};