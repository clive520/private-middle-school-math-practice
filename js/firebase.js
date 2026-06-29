/* ============================================================
   firebase.js — Firebase v10 modular SDK 整合
   - Google 登入
   - Firestore 學生進度雲端同步
   - 自有 SSO 預留介面（尚未實作）
   - 未設定 apiKey 時自動進入「本機示範模式」
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth, GoogleAuthProvider,
  signInWithPopup, signInWithRedirect, getRedirectResult,
  signOut as fbSignOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore, doc, setDoc, getDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ===== 內部狀態 =====
let _app = null, _auth = null, _db = null;
let _mode = "demo"; // "cloud" or "demo"
let _provider = null;
let _onAuthCb = null;

// ===== 初始化 =====
async function initFirebase() {
  const cfg = window.FIREBASE_CONFIG || {};
  const isConfigured = cfg && cfg.apiKey && cfg.apiKey !== "YOUR_API_KEY";

  if (!isConfigured) {
    console.info("[Firebase] 未偵測到 firebase-config.js，進入本機示範模式。");
    _mode = "demo";
    // 立即觸發「未登入」狀態，讓 app 進入登入畫面
    if (_onAuthCb) setTimeout(() => _onAuthCb(null), 0);
    return;
  }

  try {
    _app = initializeApp(cfg);
    _auth = getAuth(_app);
    _db  = getFirestore(_app);
    _provider = new GoogleAuthProvider();
    _provider.setCustomParameters({ prompt: "select_account" });
    _mode = "cloud";

    // 處理 redirect 回來結果（行動裝置備援）
    try {
      const result = await getRedirectResult(_auth);
      if (result && result.user) console.info("[Firebase] redirect 登入:", result.user.displayName);
    } catch (e) { /* 無 redirect 結果，忽略 */ }

    // 註冊全域監聽
    onAuthStateChanged(_auth, (user) => {
      if (_onAuthCb) _onAuthCb(user ? wrapUser(user) : null);
    });

    console.info("[Firebase] 已連線雲端模式。");
  } catch (err) {
    console.error("[Firebase] 初始化失敗，回退本機模式:", err);
    _mode = "demo";
    if (_onAuthCb) setTimeout(() => _onAuthCb(null), 0);
  }
}

// 包裝 user 物件以與 demo 模式一致
function wrapUser(user) {
  return {
    uid: user.uid,
    displayName: user.displayName || "同學",
    email: user.email || "",
    photoURL: user.photoURL || null,
    isDemo: false,
  };
}

// ===== Google 登入 =====
async function googleSignIn() {
  if (_mode === "demo") {
    // 示範模式：回傳一個假 user
    return {
      uid: "demo-" + Math.random().toString(36).slice(2, 8),
      displayName: "示範同學",
      email: "demo@local",
      photoURL: null,
      isDemo: true,
    };
  }
  // 雲端模式：優先 popup，行動裝置自動退回 redirect
  try {
    const result = await signInWithPopup(_auth, _provider);
    return wrapUser(result.user);
  } catch (err) {
    if (err.code === "auth/popup-blocked" || err.code === "auth/cancelled-popup-request") {
      console.info("[Firebase] popup 被擋，改用 redirect");
      await signInWithRedirect(_auth, _provider);
      return null;
    }
    throw err;
  }
}

// ===== 登出 =====
async function signOut() {
  if (_mode === "cloud" && _auth) {
    await fbSignOut(_auth);
  }
}

// ===== 註冊狀態監聽 =====
function onAuthChange(callback) {
  _onAuthCb = callback;
  // demo 模式直接以未登入呼叫一次
  if (_mode === "demo") setTimeout(() => callback(null), 0);
}

// ===== Firestore CRUD =====
async function loadStudentData(uid) {
  if (_mode !== "cloud") return null;
  try {
    const ref = doc(_db, "students", uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    console.warn("[Firestore] 讀取失敗:", err);
    return null;
  }
}

async function saveStudentData(uid, data) {
  if (_mode !== "cloud") return;
  try {
    const ref = doc(_db, "students", uid);
    await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.warn("[Firestore] 寫入失敗:", err);
  }
}

// ===== 預留自有 SSO 介面（下階段實作） =====
async function ssoSignIn() {
  const cfg = window.SSO_CONFIG || {};
  if (!cfg.USE_CUSTOM_SSO) {
    alert("尚未啟用自有 SSO。未來將由後端核發 Firebase Custom Token 並自動登入。");
    return null;
  }
  // TODO: 下一階段串接
}

async function handleSsoCallback() {
  // TODO: 下一階段實作
}

// ===== 公開 API =====
window.Firebase = {
  initFirebase,
  googleSignIn, ssoSignIn, handleSsoCallback,
  signOut,
  onAuthChange,
  loadStudentData, saveStudentData,
  fbMode: () => _mode,
};