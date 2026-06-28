/* ============================================================
   firebase.js — Firebase 初始化、雙認證、Firestore 存取
   第一階段：Google 登入；自有 SSO 預留抽象介面
   ============================================================ */

let _firebase = {
  app: null, auth: null, db: null, ready: false, mode: "demo",
};

// 嘗試初始化 Firebase
async function initFirebase() {
  try {
    if (typeof window.FIREBASE_CONFIG === "undefined" ||
        window.FIREBASE_CONFIG.apiKey === "YOUR_API_KEY") {
      console.info("[Firebase] 未設定 apiKey，進入本機示範模式。");
      _firebase.mode = "demo";
      return;
    }
    // 動態載入 Firebase SDK（採用 CDN ES module 模式）
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
    const { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } =
      await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");
    const { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } =
      await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");

    const app = initializeApp(window.FIREBASE_CONFIG);
    const auth = getAuth(app);
    const db = getFirestore(app);
    _firebase = { app, auth, db, ready: true, mode: "cloud",
      GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
      doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs };
    console.info("[Firebase] 已連接雲端。");
  } catch (err) {
    console.warn("[Firebase] 初始化失敗，使用本機示範模式：", err);
    _firebase.mode = "demo";
  }
}

// ===== Google 登入 =====
async function googleSignIn() {
  if (_firebase.mode === "demo") {
    return { uid: "demo-user", displayName: "示範同學", email: "demo@local", photoURL: null, isDemo: true };
  }
  const provider = new _firebase.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await _firebase.signInWithPopup(_firebase.auth, provider);
  return result.user;
}

// ===== 自有 SSO 登入（抽象介面，需自行實作後端） =====
// 流程：
// 1. 將使用者導向 SSO_CONFIG.ssoLoginUrl
// 2. SSO 認證後回到本頁，URL 帶 ?sso_token=xxx
// 3. 呼叫 ssoVerifyUrl 用 token 換 Firebase custom token
// 4. 用 signInWithCustomToken 完成登入
async function ssoSignIn() {
  const cfg = window.SSO_CONFIG || {};
  if (!cfg.USE_CUSTOM_SSO) {
    alert("尚未啟用自有 SSO 系統。請在 config/firebase-config.js 中將 USE_CUSTOM_SSO 設為 true 並填入端點。");
    return null;
  }
  if (cfg.ssoLoginUrl) {
    window.location.href = cfg.ssoLoginUrl;
    return null;
  }
  // SSO 回來後的處理（實際實作需於後端串接）
  alert("自有 SSO 功能已啟用但尚未完成串接，請參考 firebase-config.js 註解完成實作。");
  return null;
}

// 處理從 SSO 回來後的 query string
async function handleSsoCallback() {
  const cfg = window.SSO_CONFIG || {};
  if (!cfg.USE_CUSTOM_SSO || !cfg.ssoTokenName) return;
  const params = new URLSearchParams(window.location.search);
  const token = params.get(cfg.ssoTokenName);
  if (!token) return;
  if (cfg.ssoVerifyUrl) {
    try {
      const res = await fetch(cfg.ssoVerifyUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
      const { customToken, displayName, uid } = await res.json();
      const { signInWithCustomToken } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");
      await signInWithCustomToken(_firebase.auth, customToken);
      history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      console.error("[SSO] 驗證失敗:", err);
    }
  }
}

// ===== 登出 =====
async function signOut() {
  if (_firebase.mode === "cloud") {
    await _firebase.signOut(_firebase.auth);
  }
}

// ===== Firestore：學生進度 CRUD =====
async function loadStudentData(uid) {
  if (_firebase.mode !== "cloud") return null;
  try {
    const ref = _firebase.doc(_firebase.db, "students", uid);
    const snap = await _firebase.getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    console.warn("[Firestore] 讀取失敗:", err);
    return null;
  }
}

async function saveStudentData(uid, data) {
  if (_firebase.mode !== "cloud") return;
  try {
    const ref = _firebase.doc(_firebase.db, "students", uid);
    await _firebase.setDoc(ref, data, { merge: true });
  } catch (err) {
    console.warn("[Firestore] 寫入失敗:", err);
  }
}

// ===== 監聽登入狀態 =====
function onAuthChange(callback) {
  if (_firebase.mode === "cloud" && _firebase.onAuthStateChanged) {
    _firebase.onAuthStateChanged(_firebase.auth, callback);
  } else {
    // demo 模式：直接給一個匿名狀態
    setTimeout(() => callback(null), 100);
  }
}

function fbMode() { return _firebase.mode; }

window.Firebase = {
  initFirebase, googleSignIn, ssoSignIn, handleSsoCallback,
  signOut, loadStudentData, saveStudentData, onAuthChange, fbMode
};