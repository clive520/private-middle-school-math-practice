/* ============================================================
   store.js — 前端狀態管理 + localStorage 暫存
   - 雲端未連線時自動以 localStorage 暫存
   - 雲端連上後可由 firebase.js 同步
   ============================================================ */

const STORE_KEY = "math-platform-state-v1";

// 預設學生狀態
function defaultState(uid = "demo-user", name = "示範同學") {
  return {
    uid,
    name,
    photoURL: null,
    xp: 0,
    streak: 0,
    lastLoginDate: null,
    badges: [],
    units: {
      "01": { viewedCards: 0, completed: false, timeSpentSec: 0, lastViewedAt: null },
      "02": { viewedCards: 0, completed: false, timeSpentSec: 0, lastViewedAt: null },
      "03": { viewedCards: 0, completed: false, timeSpentSec: 0, lastViewedAt: null },
      "04": { viewedCards: 0, completed: false, timeSpentSec: 0, lastViewedAt: null },
      "05": { viewedCards: 0, completed: false, timeSpentSec: 0, lastViewedAt: null },
      "06": { viewedCards: 0, completed: false, timeSpentSec: 0, lastViewedAt: null },
      "07": { viewedCards: 0, completed: false, timeSpentSec: 0, lastViewedAt: null },
    },
    quizzes: {}, // { "01": { attempts: 1, bestScore: 80, lastDate: "...", history: [{score, date}] } }
    wrongBank: [], // [ { unitId, qId, wrongAnswer, reviewedAt } ]
    dailyChallengeDone: null, // YYYY-MM-DD
    createdAt: Date.now(),
  };
}

let state = loadLocal();

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      return Object.assign(defaultState(), s); // 補齊新欄位
    }
  } catch (e) { console.warn("load state failed", e); }
  return defaultState();
}

function saveLocal() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch (e) { console.warn("save failed", e); }
}

async function persist() {
  saveLocal();
  // 雲端模式時也同步上去
  if (state.uid && fbMode() === "cloud") {
    await saveStudentData(state.uid, stripFunctions(state));
  }
}

// 移除無法序列化的內容
function stripFunctions(obj) { return JSON.parse(JSON.stringify(obj)); }

// ====== 公開 API ======
function getState() { return state; }

async function setUser(user) {
  // 若是新使用者（uid 不一樣），先嘗試從雲端載入進度
  if (user.uid && user.uid !== state.uid) {
    const cloudData = (window.Firebase && window.Firebase.fbMode() === "cloud")
      ? await window.Firebase.loadStudentData(user.uid) : null;
    if (cloudData) {
      // 用雲端資料覆蓋本地狀態（補齊缺少欄位）
      state = Object.assign(defaultState(user.uid, user.displayName || "同學"), cloudData, {
        uid: user.uid, name: user.displayName || user.name || "同學", photoURL: user.photoURL || null,
      });
    } else {
      // 全新帳號，重設狀態
      state = defaultState(user.uid, user.displayName || "同學");
      state.photoURL = user.photoURL || null;
    }
  } else {
    state.uid = user.uid;
    state.name = user.displayName || user.name || "同學";
    state.photoURL = user.photoURL || null;
  }
  // 更新最後登入日期
  const today = new Date().toISOString().slice(0, 10);
  state.lastLoginDate = today;
  await persist();
}

// 記錄一張卡片被看過
async function markCardViewed(unitId, totalCards) {
  const unit = state.units[unitId];
  if (!unit) return;
  unit.viewedCards = Math.min(totalCards, unit.viewedCards + 1);
  unit.lastViewedAt = Date.now();
  state.xp += 5;
  if (unit.viewedCards >= totalCards) unit.completed = true;
  await persist();
}

// 記錄學習停留時間
async function addStudyTime(unitId, seconds) {
  if (!state.units[unitId]) return;
  state.units[unitId].timeSpentSec += seconds;
  await persist();
}

// 記錄測驗成績
async function recordQuiz(unitId, score, totalScore, wrongQuestions = []) {
  if (!state.quizzes[unitId]) state.quizzes[unitId] = { attempts: 0, bestScore: 0, history: [] };
  const q = state.quizzes[unitId];
  q.attempts += 1;
  q.bestScore = Math.max(q.bestScore, score);
  q.lastDate = new Date().toISOString();
  q.history.push({ score, total: totalScore, date: q.lastDate });
  // 加 XP：答對幾題就 +10 分/題
  state.xp += score * 10;
  // 錯題加入錯題本
  wrongQuestions.forEach((wq) => {
    if (!state.wrongBank.find(x => x.unitId === wq.unitId && x.qId === wq.qId)) {
      state.wrongBank.push({ ...wq, reviewedAt: null });
    }
  });
  // 連勝 +1
  state.streak += 1;
  // 徽章檢查
  checkBadges();
  await persist();
}

// 從錯題本中移除已複習的
async function reviewWrongQuestion(unitId, qId) {
  state.wrongBank = state.wrongBank.filter(x => !(x.unitId === unitId && x.qId === qId));
  await persist();
}

// 標示今日挑戰完成
async function markDailyChallenge() {
  state.dailyChallengeDone = new Date().toISOString().slice(0, 10);
  state.xp += 50;
  await persist();
}

// ===== 徽章定義 =====
const BADGES = [
  { id: "first-lesson", icon: "📚", title: "初次啟程", desc: "完成第一張學習卡片", check: s => Object.values(s.units).some(u => u.viewedCards > 0) },
  { id: "first-quiz",   icon: "✏️", title: "初試身手", desc: "完成第一次測驗",       check: s => Object.values(s.quizzes || {}).some(q => q.attempts > 0) },
  { id: "perfect-quiz",icon: "🎯", title: "满分秀",  desc: "任一測驗拿满分",         check: s => Object.values(s.quizzes || {}).some(q => q.bestScore === 100) },
  { id: "score-500",   icon: "⭐", title: "勤學之星", desc: "累積 XP 達 500",          check: s => s.xp >= 500 },
  { id: "score-1000",  icon: "🏆", title: "學霸之路", desc: "累積 XP 達 1000",         check: s => s.xp >= 1000 },
  { id: "streak-3",    icon: "🔥", title: "連勝達人", desc: "連續答對 3 題",           check: s => s.streak >= 3 },
  { id: "all-units",   icon: "🎓", title: "通才之路", desc: "看完兩個示範單元全部卡片", check: s => ["01","05"].every(id => s.units[id] && s.units[id].completed) },
];

function checkBadges() {
  BADGES.forEach(b => {
    if (!state.badges.includes(b.id) && b.check(state)) {
      state.badges.push(b.id);
      showBadgeToast(b);
    }
  });
}

function showBadgeToast(badge) {
  const el = document.getElementById("badge-toast");
  if (!el) return;
  el.innerHTML = `
    <div class="badge-pop">
      <div class="badge-pop-icon">${badge.icon}</div>
      <div class="badge-pop-text">
        <div class="badge-pop-title">獲得徽章！</div>
        <div class="badge-pop-name">${badge.title}</div>
        <div class="badge-pop-desc">${badge.desc}</div>
      </div>
    </div>`;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 3000);
}

// 為 firebase.js 提供的雲端模式識別（避免循環依賴）
let _fbMode = () => "demo";
function setFbModeFn(fn) { _fbMode = fn; }
function fbMode() { return _fbMode(); }

window.Store = {
  getState, setUser, markCardViewed, addStudyTime, recordQuiz,
  reviewWrongQuestion, markDailyChallenge, checkBadges, BADGES,
  defaultState, persist, setFbModeFn
};