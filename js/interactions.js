/* ============================================================
   interactions.js — 互動元件：分數換算、圓面積動畫、畢氏定理
   每個 widget 公開一個 render(container) 函式
   ============================================================ */

const Interactions = {

  /* -------- 分數↔小數轉換機 -------- */
  "fraction-converter": (container) => {
    container.innerHTML = `
      <div class="widget">
        <div class="widget-row">
          <label>分子：</label>
          <input type="number" id="fc-num" value="3" min="0">
          <span class="frac-bar">／</span>
          <label>分母：</label>
          <input type="number" id="fc-den" value="4" min="1">
        </div>
        <div class="widget-bar">
          <button class="mini-btn primary" id="fc-calc">換算 ▶</button>
        </div>
        <div class="widget-result" id="fc-out">輸入數字後按換算</div>
        <div class="widget-hint">常見值：1/2=0.5、1/4=0.25、3/4=0.75、1/3≈0.333…</div>
      </div>`;
    const calc = () => {
      const n = parseFloat(container.querySelector("#fc-num").value);
      const d = parseFloat(container.querySelector("#fc-den").value);
      if (isNaN(n) || isNaN(d) || d === 0) {
        container.querySelector("#fc-out").textContent = "請輸入有效數字（分母不為 0）";
        return;
      }
      const dec = n / d;
      const percent = (dec * 100).toFixed(2);
      container.querySelector("#fc-out").innerHTML =
        `<div class="result-big">${n}/${d} = <b>${dec}</b></div>
         <div class="result-sub">≈ ${dec.toFixed(6)}（小數）</div>
         <div class="result-sub">= ${percent}%（百分率）</div>`;
    };
    container.querySelector("#fc-calc").onclick = calc;
    container.querySelector("#fc-num").addEventListener("input", calc);
    container.querySelector("#fc-den").addEventListener("input", calc);
    calc();
  },

  /* -------- 圓面積動畫器 -------- */
  "circle-area": (container) => {
    container.innerHTML = `
      <div class="widget circle-widget">
        <div class="circle-vis">
          <svg viewBox="0 0 240 240" width="220" height="220">
            <defs>
              <radialGradient id="cg" cx="40%" cy="40%" r="65%">
                <stop offset="0%" stop-color="#fff59d"/>
                <stop offset="100%" stop-color="#26a69a"/>
              </radialGradient>
            </defs>
            <circle cx="120" cy="120" r="${100}" fill="url(#cg)" stroke="#00796b" stroke-width="3" id="circ-vis"/>
            <line x1="120" y1="120" x2="220" y2="120" stroke="#fff" stroke-width="3" id="radius-line"/>
            <circle cx="120" cy="120" r="4" fill="#fff"/>
            <text x="170" y="115" font-size="14" fill="#fff" id="r-label">r = 5</text>
          </svg>
        </div>
        <div class="circle-controls">
          <label>半徑 r：<span id="ca-r-val" class="num-highlight">5</span> 公分</label>
          <input type="range" min="1" max="20" value="5" id="ca-r">
          <div class="pi-toggle">
            <label><input type="radio" name="ca-pi" value="3.14" checked> π = 3.14</label>
            <label><input type="radio" name="ca-pi" value="3.14159"> 精確 π</label>
          </div>
          <div class="circle-formula">
            <div>面積 A = π × r² = <span id="ca-area" class="num-highlight">78.5</span> cm²</div>
            <div>周長 C = 2 × π × r = <span id="ca-circ" class="num-highlight">31.4</span> cm</div>
            <div>直徑 D = 2r = <span id="ca-dia" class="num-highlight">10</span> cm</div>
          </div>
        </div>
      </div>`;
    const rInput = container.querySelector("#ca-r");
    const update = () => {
      const r = parseFloat(rInput.value);
      const pi = parseFloat(container.querySelector('input[name="ca-pi"]:checked').value);
      container.querySelector("#ca-r-val").textContent = r;
      container.querySelector("#ca-area").textContent = (pi * r * r).toFixed(2);
      container.querySelector("#ca-circ").textContent = (2 * pi * r).toFixed(2);
      container.querySelector("#ca-dia").textContent = 2 * r;
      // SVG 半徑 (scale 1..20 → 5..100)
      const svgR = (r / 20) * 100 + 5;
      container.querySelector("#circ-vis").setAttribute("r", svgR);
      container.querySelector("#radius-line").setAttribute("x2", 120 + svgR);
      container.querySelector("#r-label").setAttribute("x", 120 + svgR * 0.5);
      container.querySelector("#r-label").textContent = "r = " + r;
    };
    rInput.addEventListener("input", update);
    container.querySelectorAll('input[name="ca-pi"]').forEach(el => el.addEventListener("change", update));
    update();
  },

  /* -------- 畢氏定理探索器 -------- */
  "pythagorean": (container) => {
    container.innerHTML = `
      <div class="widget pyth-widget">
        <svg viewBox="0 0 280 200" width="280" height="200">
          <polygon points="40,160 220,160 40,40" fill="rgba(92,107,192,0.25)" stroke="#5c6bc0" stroke-width="2"/>
          <rect x="40" y="160" width="180" height="20" fill="#ff7043" opacity="0.5"/>
          <rect x="20" y="40" width="20" height="120" fill="#26a69a" opacity="0.5"/>
          <rect x="40" y="20" width="127" height="127" fill="#ffca28" opacity="0.3" transform="rotate(45,40,160) translate(-26,0)"/>
          <text x="120" y="180" fill="#fff" font-size="13" text-anchor="middle" id="lbl-b">b = 8</text>
          <text x="35" y="100" fill="#fff" font-size="13" text-anchor="middle" id="lbl-a" transform="rotate(-90 35 100)">a = 15</text>
          <text x="130" y="90" fill="#fff" font-size="13" text-anchor="middle" id="lbl-c">c = 17</text>
          <text x="55" y="175" fill="#fff" font-size="20">∟</text>
        </svg>
        <div class="pyth-controls">
          <label>a 股：<input type="number" id="py-a" value="15" min="1"></label>
          <label>b 股：<input type="number" id="py-b" value="8" min="1"></label>
          <div class="result-big">斜邊 c = <span id="py-c" class="num-highlight">17</span></div>
          <div class="result-sub" id="py-note"></div>
        </div>
      </div>`;
    const known = { "3,4": 5, "4,3": 5, "5,12": 13, "12,5": 13, "8,15": 17, "15,8": 17, "7,24": 25, "24,7": 25 };
    const update = () => {
      const a = parseFloat(container.querySelector("#py-a").value);
      const b = parseFloat(container.querySelector("#py-b").value);
      if (isNaN(a) || isNaN(b) || a <= 0 || b <= 0) return;
      const c = Math.sqrt(a*a + b*b);
      const cRound = Math.round(c);
      const isTriple = (cRound*cRound === a*a + b*b);
      container.querySelector("#py-c").textContent = isTriple ? cRound : c.toFixed(3);
      container.querySelector("#lbl-a").textContent = "a = " + a;
      container.querySelector("#lbl-b").textContent = "b = " + b;
      container.querySelector("#lbl-c").textContent = "c = " + (isTriple ? cRound : c.toFixed(2));
      container.querySelector("#py-note").innerHTML =
        isTriple
          ? `<span class="ok">完美！${a}-${b}-${cRound} 是知名的勾股數組合 👍</span>`
          : `<span class="warn">c = √(${a}²+${b}²) = √${a*a+b*b} ≈ ${c.toFixed(3)}（非整數）</span>`;
    };
    container.querySelector("#py-a").addEventListener("input", update);
    container.querySelector("#py-b").addEventListener("input", update);
    update();
  },
};

window.Interactions = Interactions;