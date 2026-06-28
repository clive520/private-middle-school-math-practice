/* ============================================================
   Firebase 設定範本
   ------------------------------------------------------------
   使用前：
   1. 到 https://console.firebase.google.com 建立專案
   2. 新增 Web 應用程式，取得下方設定值
   3. 在 Authentication → Sign-in method 啟用「Google」
   4. 建立 Firestore Database（以 production mode 為佳）
   5. 將此檔複製為 firebase-config.js 並填入設定
   ============================================================ */
window.FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

/* ============================================================
   自有 SSO 系統設定
   ------------------------------------------------------------
   若有自有 SSO 認證系統，請填入下方設定：
     - ssoLoginUrl: 登入端點（學生會被導向此 URL 進行登入）
     - ssoTokenName: 從 query string / cookie 接收的 token 名稱
     - ssoVerifyUrl: 後端驗證 token 的端點（返回 Firebase custom token）
   若暫不使用，將 USE_CUSTOM_SSO 設為 false 即可只走 Google 登入。
   ============================================================ */
window.SSO_CONFIG = {
  USE_CUSTOM_SSO: false,           // 設為 true 啟用自有 SSO
  ssoLoginUrl: "",                 // 例如 https://sso.example.com/login
  ssoTokenName: "sso_token",       // 接收 token 的 query key
  ssoVerifyUrl: ""                 // 後端驗證端點，須回傳 Firebase custom token
};