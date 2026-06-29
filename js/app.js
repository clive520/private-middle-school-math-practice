/* ============================================================
   app.js — 主程式：SPA 路由、畫面切換、UI 渲染、互動綁定
   ============================================================ */

(function () {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const S = window.Store;
  const F = window.Firebase;
  const L = window.LESSONS;
  const Q = window.QUIZ_DATA;
  const I = window.Interactions;

  // ===== 路由狀態 =====
  let currentUnitId = null;
  let currentCardIdx = 0;
  let quizState = null; // { unitId, queue, idx, score, wrongs }

  // ===== 啟動 =====
  async function boot() {
    figwheel();
    await F.initFirebase();
    S.setFbModeFn(F.fbMode);
    // 處理 SSO 回呼
    await F.handleSsoCallback();
    // 監聽 auth
    F.onAuthChange(handleAuthState);
    bindGlobalEvents();
  }

  function figwheel() {
    // 歡迎動畫 1.5 秒後顯示登入
    setTimeout(() => showScreen("auth"), 1500);
  }

  // ===== 螢幕切換 =====
  function showScreen(name, payload = {}) {
    $$(".screen").forEach(s => s.classList.remove("active"));
    const screen = $("#screen-" + name);
    if (screen) screen.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (name === "auth") renderAuth();
    if (name === "home") renderHome();
    if (name === "lesson") renderLesson(payload.unitId);
    if (name === "quiz") startQuiz(payload.unitId);
    if (name === "result") renderResult(payload);
    if (name === "dashboard") renderDashboard();
    if (name === "wrongbank") renderWrongBank();
    updateHeader();
  }

  async function handleAuthState(user) {
    if (user) {
      await S.setUser(user);
      showToast(`歡迎回來，${user.displayName || "同學"}！`, "ok");
      showScreen("home");
    } else {
      showScreen("auth");
    }
  }

  // ===== 認證畫面 =====
  function renderAuth() {
    const btnGoogle = $("#btn-google-signin");
    const btnSso = $("#btn-sso-signin");
    btnGoogle.onclick = async () => {
      try {
        const user = await F.googleSignIn();
        if (user) handleAuthState(user);
      } catch (err) {
        showToast("登入失敗：" + (err.message || err), "error");
      }
    };
    btnSso.onclick = async () => {
      try {
        await F.ssoSignIn();
      } catch (err) {
        showToast("SSO 登入失敗：" + (err.message || err), "error");
      }
    };
  }

  // ===== 首頁學習地圖 =====
  function renderHome() {
    const state = S.getState();
    const grid = $("#unit-grid");
    grid.innerHTML = "";
    // 排序依 id
    const unitIds = Object.keys(L);
    // 解鎖邏輯：第一個永遠解鎖；前一個看完教學後才解鎖下一個
    let prevCompleted = true;
    unitIds.forEach((uid) => {
      const unit = L[uid];
      const quiz = state.quizzes[uid] || {};
      const uStat = state.units[uid] || {};
      const unlocked = prevCompleted;
      prevCompleted = uStat.completed;

      const card = document.createElement("div");
      card.className = "unit-card" + (unlocked ? "" : " locked");
      card.style.setProperty("--unit-color", unit.color);
      const cardProg = unit.cards.length > 0
        ? Math.round((uStat.viewedCards / unit.cards.length) * 100) : 0;
      const quizScore = quiz.bestScore != null ? quiz.bestScore : "—";
      card.innerHTML = `
        ${!unlocked ? '<div class="lock"><div>🔒</div><div>看完上一單元即可解鎖</div></div>' : ""}
        <div class="unit-emoji">${unit.emoji}</div>
        <div class="unit-title">${unit.title}</div>
        <div class="unit-intro">${unit.intro}</div>
        ${unit.comingSoon ? '<div class="coming-soon">📌 第二階段製作中</div>' : ''}
        <div class="mini-progress">
          <div class="mini-track"><div class="mini-fill" style="width:${cardProg}%"></div></div>
          <span class="mini-label">教學 ${cardProg}%</span>
        </div>
        <div class="unit-footer">
          <span class="unit-badge ${uStat.completed ? 'done' : ''}">📚 ${uStat.completed ? '完成' : cardProg+'%'}</span>
          <span class="unit-badge ${quizScore !== '—' ? 'done' : ''}">✏️ ${quizScore}</span>
        </div>`;
      if (unlocked && !unit.comingSoon) card.onclick = () => showScreen("lesson", { unitId: uid });
      grid.appendChild(card);
    });
  }

  // ===== 教學卡片瀏覽 =====
  function renderLesson(unitId) {
    const unit = L[unitId];
    if (!unit || unit.comingSoon) { showScreen("home"); return; }
    currentUnitId = unitId;
    currentCardIdx = Math.min(currentCardIdx, unit.cards.length - 1);
    if (currentCardIdx < 0) currentCardIdx = 0;

    const card = unit.cards[currentCardIdx];
    const state = S.getState();
    const uStat = state.units[unitId] || {};
    const hasViewed = uStat.viewedCards > currentCardIdx;

    $("#lesson-title").textContent = `${unit.emoji} ${unit.title}`;
    $("#lesson-progress-text").textContent = `第 ${currentCardIdx + 1} / ${unit.cards.length} 張`;
    $("#lesson-progress-bar").style.width = ((currentCardIdx + 1) / unit.cards.length * 100) + "%";

    const content = $("#lesson-content");
    content.innerHTML = "";
    const cardEl = document.createElement("div");
    cardEl.className = "study-card type-" + card.type;
    cardEl.innerHTML = `
      <div class="card-tag tag-${card.type}">${tagLabel(card.type)}</div>
      <h3 class="card-title">${card.title}</h3>
      <div class="card-body"></div>`;
    const body = cardEl.querySelector(".card-body");
    card.blocks.forEach((b) => renderBlock(body, b));
    content.appendChild(cardEl);

    // 漸入動畫
    requestAnimationFrame(() => cardEl.classList.add("show"));

    // 按鈕顯示邏輯
    $("#btn-prev").style.display = currentCardIdx > 0 ? "" : "none";
    const isLast = currentCardIdx === unit.cards.length - 1;
    $("#btn-next-card").style.display = isLast ? "none" : "";
    const allDone = uStat.viewedCards >= unit.cards.length;
    $("#btn-start-quiz").style.display = (isLast || allDone) ? "" : "none";

    // 記錄「已看過」
    if (!hasViewed) S.markCardViewed(unitId, unit.cards.length);
  }

  function tagLabel(type) {
    return { concept: "概念", formula: "公式", example: "範例", interactive: "🎮 互動", warning: "⚠️ 易錯" }[type] || type;
  }

  function renderBlock(parent, block) {
    let el;
    switch (block.kind) {
      case "text":
        el = document.createElement("div");
        el.className = "block-text";
        el.innerHTML = block.text;
        parent.appendChild(el);
        break;
      case "list":
        el = document.createElement("ul");
        el.className = "block-list";
        block.items.forEach(it => {
          const li = document.createElement("li");
          li.innerHTML = it;
          el.appendChild(li);
        });
        parent.appendChild(el);
        break;
      case "formula":
        el = document.createElement("div");
        el.className = "block-formula";
        el.innerHTML = block.text;
        parent.appendChild(el);
        break;
      case "callout":
        el = document.createElement("div");
        el.className = "block-callout callout-" + (block.type || "info");
        el.innerHTML = block.text;
        parent.appendChild(el);
        break;
      case "steps":
        el = document.createElement("div");
        el.className = "block-steps";
        el.dataset.idx = "0";
        el.innerHTML = `<div class="step-text"></div><button class="mini-btn primary step-next">下一步 ▶</button>`;
        const stepText = el.querySelector(".step-text");
        const stepNextBtn = el.querySelector(".step-next");
        stepText.textContent = "按「下一步」開始逐步看解答";
        stepNextBtn.onclick = () => {
          let idx = parseInt(el.dataset.idx);
          if (idx < block.steps.length) {
            stepText.innerHTML = block.steps.map((s, i) =>
              i <= idx ? `<div class='step-line'>${i+1}. ${s}</div>` : "").join("");
            idx++; el.dataset.idx = idx;
            if (idx >= block.steps.length) stepNextBtn.textContent = "✓ 完成";
          }
        };
        parent.appendChild(el);
        break;
      case "interactive":
        el = document.createElement("div");
        el.className = "block-interactive";
        el.innerHTML = `<div class="loading-interactive">載入互動元件中…</div>`;
        parent.appendChild(el);
        if (I[block.widget]) {
          try { I[block.widget](el); }
          catch (err) { el.innerHTML = `<div class="err">互動元件載入失敗：${err}</div>`; }
        } else {
          el.innerHTML = `<div class="err">找不到互動元件：${block.widget}</div>`;
        }
        break;
    }
  }

  function nextCard() {
    const unit = L[currentUnitId];
    if (currentCardIdx < unit.cards.length - 1) {
      currentCardIdx++;
      renderLesson(currentUnitId);
    }
  }
  function prevCard() {
    if (currentCardIdx > 0) {
      currentCardIdx--;
      renderLesson(currentUnitId);
    }
  }

  // ===== 測驗流程 =====
  function startQuiz(unitId) {
    const u = Q[unitId];
    if (!u || u.comingSoon || u.questions.easy.length === 0) { showScreen("lesson", { unitId }); return; }
    const queue = [];
    ["easy", "medium", "hard"].forEach(diff => {
      u.questions[diff].forEach((q, idx) => {
        queue.push({ diff, qIdx: idx, q, diffLabel: { easy: "簡易", medium: "中等", hard: "難" }[diff] });
      });
    });
    quizState = { unitId, queue, idx: 0, score: 0, correct: 0, wrong: [], selections: [] };
    renderQuestion();
  }

  function renderQuestion() {
    if (!quizState) return;
    if (quizState.idx >= quizState.queue.length) {
      finishQuiz(); return;
    }
    const item = quizState.queue[quizState.idx];
    const q = item.q;
    $("#quiz-title").textContent = `${L[quizState.unitId].emoji} ${L[quizState.unitId].title} 測驗`;
    $("#quiz-progress-text").textContent = `第 ${quizState.idx + 1} / ${quizState.queue.length} 題`;
    $("#quiz-progress-bar").style.width = ((quizState.idx) / quizState.queue.length * 100) + "%";
    $("#quiz-badge").className = `q-badge quiz-badge ${item.diff}`;
    $("#quiz-badge").textContent = item.diffLabel;
    $("#quiz-question").textContent = q.q;

    const optsDiv = $("#quiz-options");
    optsDiv.innerHTML = "";
    q.options.forEach((opt, i) => {
      const o = document.createElement("div");
      o.className = "option";
      o.textContent = opt;
      o.onclick = () => selectQuizOption(i, o);
      optsDiv.appendChild(o);
    });

    $("#quiz-feedback").className = "";
    $("#btn-quiz-check").style.display = "";
    $("#btn-quiz-check").disabled = true;
    $("#btn-quiz-next").style.display = "none";
  }

  let quizSelected = null;
  function selectQuizOption(i, el) {
    if (quizState.answered) return;
    $$("#quiz-options .option").forEach(o => o.classList.remove("selected"));
    el.classList.add("selected");
    quizSelected = i;
    $("#btn-quiz-check").disabled = false;
  }

  function checkQuiz() {
    if (quizSelected === null) return;
    quizState.answered = true;
    const item = quizState.queue[quizState.idx];
    const q = item.q;
    const correct = quizSelected === q.answer;
    const opts = $$("#quiz-options .option");
    opts.forEach((o, i) => {
      o.style.cursor = "default";
      if (i === q.answer) o.classList.add("correct");
      else if (i === quizSelected && !correct) o.classList.add("wrong");
    });
    if (correct) { quizState.correct++; quizState.score += { easy: 10, medium: 20, hard: 30 }[item.diff]; }
    else quizState.wrong.push({ unitId: quizState.unitId, qId: quizState.idx, wrongAnswer: quizSelected });

    // 連勝
    if (correct) {
      const streak = (S.getState().streak || 0) + 1;
      if (streak >= 3) showStreakToast(streak);
    }

    const fb = $("#quiz-feedback");
    fb.className = "feedback show " + (correct ? "correct" : "wrong");
    fb.innerHTML = `${correct ? "<h3>答對了！讚！</h3>" : "<h3>差一點！再加油！</h3>"}<div class="explanation"><b>詳解：</b>\n${q.explanation}</div>`;
    $("#btn-quiz-check").style.display = "none";
    $("#btn-quiz-next").style.display = "";
  }

  async function finishQuiz() {
    const totalScore = 9 * 30 + 9 * 20 + 9 * 10; // 假設上限 = 270
    // 計算總分上限：本測驗 9 題
    let maxScore = 0;
    quizState.queue.forEach(it => maxScore += { easy: 10, medium: 20, hard: 30 }[it.diff]);
    const percent = Math.round(quizState.score / maxScore * 100);
    await S.recordQuiz(quizState.unitId, percent, quizState.wrong);
    showScreen("result", {
      unitId: quizState.unitId,
      score: quizState.score,
      maxScore,
      percent,
      correct: quizState.correct,
      total: quizState.queue.length,
      wrong: quizState.wrong
    });
  }

  // ===== 結果畫面 =====
  function renderResult(p) {
    const unit = L[p.unitId];
    $("#result-emoji").textContent = p.percent >= 80 ? "🎉" : p.percent >= 50 ? "💪" : "📚";
    $("#result-title").textContent = `${unit.emoji} ${unit.title} 測驗結果`;
    $("#result-score").textContent = p.percent;
    $("#result-score-text").textContent = p.percent + " 分";
    let msg = "";
    if (p.percent === 100) msg = "完美！你是數學小天才！💯";
    else if (p.percent >= 80) msg = "太棒了！基礎很扎實！🌟";
    else if (p.percent >= 60) msg = "還不錯！再複習一次會更好！加油！";
    else if (p.percent >= 40) msg = "繼續努力！錯題本是好朋友！";
    else msg = "別灰心！多看一次教學卡片再試試！💪";
    $("#result-msg").textContent = msg;
    $("#result-detail-correct").textContent = p.correct;
    $("#result-detail-wrong").textContent = p.total - p.correct;
    $("#result-detail-total").textContent = p.total;
    const wrongList = $("#result-wrong-list");
    if (p.wrong.length === 0) {
      wrongList.innerHTML = "<li>沒有錯題，太讚了！</li>";
    } else {
      wrongList.innerHTML = p.wrong.map(w => {
        const qInfo = Q[p.unitId];
        const allQs = ["easy","medium","hard"].flatMap(d => qInfo.questions[d]);
        const q = allQs[w.qId];
        return `<li><b>第 ${w.qId + 1} 題：</b>${q ? q.q : "（題目不存在）"}<br>正確答案：<span class="ok">${q ? q.options[q.answer] : ""}</span></li>`;
      }).join("");
    }
  }

  // ===== 進度儀表板 =====
  function renderDashboard() {
    const state = S.getState();
    $("#dash-name").textContent = state.name;
    $("#dash-xp").textContent = state.xp;
    $("#dash-streak").textContent = state.streak;
    $("#dash-correct").textContent = Object.values(state.quizzes || {}).reduce((s, q) => s + (q.attempts || 0), 0);
    // 徽章
    const badgeBox = $("#dash-badges");
    badgeBox.innerHTML = "";
    S.BADGES.forEach(b => {
      const earned = state.badges.includes(b.id);
      const el = document.createElement("div");
      el.className = "badge-item" + (earned ? " earned" : "");
      el.innerHTML = `<div class="badge-emoji">${b.icon}</div><div class="badge-name">${b.title}</div><div class="badge-desc">${b.desc}</div>`;
      el.title = earned ? b.desc : `未解鎖：${b.desc}`;
      badgeBox.appendChild(el);
    });
    // 各單元成績歷史
    const scoreList = $("#dash-scores");
    scoreList.innerHTML = "";
    Object.keys(L).forEach(uid => {
      const unit = L[uid];
      const q = state.quizzes[uid];
      const history = q && q.history ? q.history : [];
      if (history.length === 0) {
        const row = document.createElement("div"); row.className = "score-row";
        row.innerHTML = `<span>${unit.emoji} ${unit.title}</span><span class="muted">尚未測驗</span>`;
        scoreList.appendChild(row); return;
      }
      const best = q.bestScore || 0;
      const last = history[history.length - 1];
      const spark = history.map(h => `<div class="spark-bar" style="height:${h.score}%" title="${h.score}分"></div>`).join("");
      const row = document.createElement("div"); row.className = "score-row";
      row.innerHTML = `
        <div class="score-info">
          <div class="score-unit">${unit.emoji} ${unit.title}</div>
          <div class="score-meta">最佳：<b>${best}分</b> ｜ 最近：${new Date(last.date).toLocaleDateString("zh-TW")}</div>
        </div>
        <div class="spark-bars">${spark}</div>`;
      scoreList.appendChild(row);
    });
  }

  // ===== 錯題本 =====
  function renderWrongBank() {
    const state = S.getState();
    const list = $("#wrongbank-list");
    if (state.wrongBank.length === 0) {
      list.innerHTML = "<div class='empty'>🎉 你還沒有錯題！保持下去！</div>";
      return;
    }
    list.innerHTML = "";
    state.wrongBank.forEach((wq, idx) => {
      const unit = L[wq.unitId];
      const allQs = ["easy","medium","hard"].flatMap(d => (Q[wq.unitId].questions[d] || []));
      const q = allQs[wq.qId];
      if (!q) return;
      const el = document.createElement("div");
      el.className = "wrong-item";
      el.innerHTML = `
        <div class="wrong-unit">${unit.emoji} ${unit.title} ｜ 第 ${wq.qId + 1} 題</div>
        <div class="wrong-q">${q.q}</div>
        <div class="wrong-ans">正確：<b class="ok">${q.options[q.answer]}</b></div>
        <div class="wrong-exp">${q.explanation}</div>
        <button class="mini-btn warn" data-idx="${idx}">已複習，移除</button>`;
      list.appendChild(el);
    });
    list.querySelectorAll("button[data-idx]").forEach(btn => {
      btn.onclick = async () => {
        const idx = parseInt(btn.dataset.idx);
        const wq = state.wrongBank[idx];
        await S.reviewWrongQuestion(wq.unitId, wq.qId);
        renderWrongBank();
        showToast("已從錯題本移除 👍", "ok");
      };
    });
  }

  // ===== 通用 UI =====
  let toastTimer = null;
  function showToast(msg, type = "info") {
    const t = $("#toast");
    t.textContent = msg;
    t.className = "toast show " + type;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.className = "toast"; }, 2500);
  }

  function showStreakToast(streak) {
    const t = $("#streak-toast");
    t.innerHTML = `🔥 <b>連勝 ${streak} 題！</b>`;
    t.className = "streak-toast show";
    setTimeout(() => t.className = "streak-toast", 1800);
  }

  function updateHeader() {
    const state = S.getState();
    $("#header-xp").textContent = state.xp || 0;
    $("#header-streak").textContent = state.streak || 0;
    const avatar = $("#header-avatar");
    if (state.photoURL) {
      avatar.innerHTML = `<img src="${state.photoURL}" alt="">`;
    } else {
      avatar.textContent = (state.name || "?").slice(0, 1);
    }
  }

  // ===== 全域事件綁定 =====
  function bindGlobalEvents() {
    $("#btn-prev").onclick = prevCard;
    $("#btn-next-card").onclick = nextCard;
    $("#btn-start-quiz").onclick = () => showScreen("quiz", { unitId: currentUnitId });
    $("#btn-quiz-check").onclick = checkQuiz;
    $("#btn-quiz-next").onclick = () => {
      quizState.answered = false;
      quizSelected = null;
      quizState.idx++;
      renderQuestion();
    };
    $("#btn-result-home").onclick = () => showScreen("home");
    $("#btn-result-retry").onclick = () => showScreen("quiz", { unitId: quizState.unitId });
    $("#btn-result-wrong").onclick = () => showScreen("wrongbank");

    $("#nav-home").onclick = () => showScreen("home");
    $("#nav-dashboard").onclick = () => showScreen("dashboard");
    $("#nav-wrong").onclick = () => showScreen("wrongbank");
    $("#btn-logout").onclick = async () => {
      await F.signOut();
      localStorage.removeItem("math-platform-state-v1");
      location.reload();
    };
  }

  // 啟動：等待 window.Firebase 與 DOM 都就緒再啟動
  function startWhenReady() {
    if (window.Firebase && window.Store && window.LESSONS && window.QUIZ_DATA && window.Interactions) {
      boot();
    } else {
      setTimeout(startWhenReady, 50);
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startWhenReady);
  } else {
    startWhenReady();
  }
})();