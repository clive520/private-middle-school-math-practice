/* ============================================================
   lessons-data.js — 七大單元教學卡片內容
   第一階段完成: 單元 01 數與運算、單元 05 幾何
   其他單元保留外殼，俟確認風格後再補齊
   ============================================================ */

window.LESSONS = {
  "01": {
    id: "01",
    title: "數與運算",
    emoji: "🔢",
    color: "#667eea",
    intro: "分數、小數、四則運算、估算與數列規律。本單元佔約 25%，是基礎中的基礎！",
    cards: [
      {
        type: "concept", title: "認識分數與小數",
        blocks: [
          { kind: "text", text: "分數和其實都可以互相轉換，是同一個數的不同寫法。" },
          { kind: "list", items: [
            "<b>分數</b>：用「分子／分母」表示，例如 3/4",
            "<b>小數</b>：用小數點表示，例如 0.75",
            "<b>互換方法</b>：分數 → 用計算機除；小數 → 寫成分子 100 的分數"
          ]},
          { kind: "callout", type: "tip", text: "多練幾個常見值：1/2=0.5、1/4=0.25、3/4=0.75、1/5=0.2" }
        ]
      },
      {
        type: "formula", title: "四則運算順序",
        blocks: [
          { kind: "text", text: "遇到一個綜合算式時，記得口訣：" },
          { kind: "list", items: [
            "① <b>括號</b>最優先（先算小括號，再算中括號）",
            "② <b>先乘除</b>後加減",
            "③ <b>由左至右</b>計算"
          ]},
          { kind: "formula", text: "12 + 3 × (4 - 1) = 12 + 3 × 3 = 12 + 9 = 21" }
        ]
      },
      {
        type: "example", title: "範例：分數加減",
        blocks: [
          { kind: "text", text: "計算：3/5 + 0.25 = ？" },
          { kind: "steps", steps: [
            "把兩個數統一格式。3/5 = 0.6（或把 0.25 化成分數 = 1/4）",
            "0.6 + 0.25 = 0.85",
            "驗算：0.85 = 85/100 = 17/20 ✓"
          ]}
        ]
      },
      {
        type: "formula", title: "估算技巧",
        blocks: [
          { kind: "text", text: "估算 = 把複雜的數四捨五入到接近、好算的數。" },
          { kind: "list", items: [
            "5.97 × 3.04 ≈ 6 × 3 = 18",
            "12.83 + 4.27 ≈ 13 + 4 = 17",
            "多用在「最接近哪個數」「大約多少」的題型"
          ]},
          { kind: "callout", type: "tip", text: "估算時不要把四捨五入的位數設太細，否則就失去估算的意義了。" }
        ]
      },
      {
        type: "example", title: "範例：總和公式",
        blocks: [
          { kind: "text", text: "計算：1 + 2 + 3 + … + 100 = ？" },
          { kind: "steps", steps: [
            "使用「梯形公式」：(上底 + 下底) × 高 ÷ 2",
            "上底 = 1，下底 = 100，高 = 100",
            "(1 + 100) × 100 ÷ 2 = 101 × 50 = 5050",
            "記住：「1+2+…+n = n(n+1)/2」"
          ]},
          { kind: "callout", type: "info", text: "這個公式在私中考題很常見，可快速計算連續整數和、等差數列和。" }
        ]
      },
      {
        type: "interactive", title: "互動練習：分數 ↔ 小數轉換機",
        blocks: [
          { kind: "text", text: "輸入任意分數（分子、分母），立即看到對應的小數值！也可以反過來輸入小數看分數。" },
          { kind: "interactive", widget: "fraction-converter" }
        ]
      },
      {
        type: "warning", title: "常見錯誤提醒",
        blocks: [
          { kind: "list", items: [
            "✗ 看到 0.5 + 0.5 就忘記也要算，結果漏算 → 養成一步一步寫的習慣",
            "✗ 分數加法直接分子加分子、分母加分母（3/4 + 1/2 = 4/6 ✗）",
            "    正解：先通分 3/4 + 2/4 = 5/4",
            "✗ 忘記運算順序（先做了加法再做乘法）"
          ]},
          { kind: "callout", type: "warning", text: "看到題目先掃一眼，找出括號、乘除位置；再開始一步一步算。" }
        ]
      }
    ]
  },

  "05": {
    id: "05",
    title: "幾何",
    emoji: "📐",
    color: "#26a69a",
    intro: "面積、體積、周長、角度、圖形性質。本單元佔約 15%，圖形題常見選擇題！",
    cards: [
      {
        type: "concept", title: "平面圖形總複習",
        blocks: [
          { kind: "text", text: "幾何考試最常見的圖形性質記一次就會：" },
          { kind: "list", items: [
            "<b>正方形</b>：4 邊等長、4 角皆 90°",
            "<b>長方形</b>：對邊相等、4 角皆 90°",
            "<b>三角形</b>：內角和為 180°；可分等腰、等邊、直角三角形",
            "<b>平行四邊形</b>：對邊平行且相等",
            "<b>梯形</b>：只有一組對邊平行",
            "<b>圓形</b>：到圓心等距的點集合"
          ]}
        ]
      },
      {
        type: "formula", title: "面積、周長、體積公式卡",
        blocks: [
          { kind: "text", text: "以下公式務必背熟！" },
          { kind: "list", items: [
            "<b>正方形面積</b> = 邊長²",
            "<b>長方形面積</b> = 長 × 寬",
            "<b>三角形面積</b> = 底 × 高 ÷ 2",
            "<b>圓面積</b> = π × r²（r 是半徑）",
            "<b>圓周長</b> = 2 × π × r",
            "<b>正方體體積</b> = 邊長³",
            "<b>長方體體積</b> = 長 × 寬 × 高"
          ]},
          { kind: "callout", type: "tip", text: "口訣：面積是「佔地大小」、周長是「走一圈長度」、體積是「裝水多寡」。" }
        ]
      },
      {
        type: "concept", title: "角度：補角、餘角、三角形內角和",
        blocks: [
          { kind: "list", items: [
            "<b>三角形內角和 = 180°</b>（永遠記住！）",
            "<b>補角</b>：兩角相加 = 180°",
            "<b>餘角</b>：兩角相加 = 90°",
            "<b>直角</b> = 90°，<b>平角</b> = 180°，<b>周角</b> = 360°"
          ]},
          { kind: "callout", type: "info", text: "若已知三角形中的兩個角，第三角 = 180° − 兩角和。" }
        ]
      },
      {
        type: "example", title: "範例：正方形基本計算",
        blocks: [
          { kind: "text", text: "正方形邊長 6 公分，面積和周長各是多少？" },
          { kind: "steps", steps: [
            "面積 = 6 × 6 = 36 平方公分",
            "周長 = 6 × 4 = 24 公分"
          ]}
        ]
      },
      {
        type: "example", title: "範例：勾股數快速解題",
        blocks: [
          { kind: "text", text: "長方形長 15 公分、寬 8 公分，求對角線長度。" },
          { kind: "steps", steps: [
            "用畢氏定理（勾股定理）：直角三角形斜邊² = 兩股² 和",
            "對角線²= 15² + 8² = 225 + 64 = 289",
            "對角線 = √289 = 17 公分",
            "背起來！常考勾股數：3-4-5、5-12-13、8-15-17"
          ]},
          { kind: "callout", type: "tip", text: "考試看到長 8、寬 15 的長方形，直接答 17 即可，背起來省時！" }
        ]
      },
      {
        type: "interactive", title: "互動模擬：圓面積即時呈現",
        blocks: [
          { kind: "text", text: "拖拉滑桿改變圓的半徑，看面積與周長的變化！也可切換 π 值（3.14 或精確）。" },
          { kind: "interactive", widget: "circle-area" }
        ]
      },
      {
        type: "interactive", title: "互動練習：勾股數探索",
        blocks: [
          { kind: "text", text: "輸入直角三角形的兩股長度，立即計算斜邊！順便認識常見勾股數。" },
          { kind: "interactive", widget: "pythagorean" }
        ]
      },
      {
        type: "example", title: "範例：長方體變正方體問題",
        blocks: [
          { kind: "text", text: "一個長方體，長減 3 公分後變成正方體，體積減少 192 立方公分。求原長方體體積。" },
          { kind: "steps", steps: [
            "設正方體邊長為 a",
            "減少的體積是被切掉的那一塊，體積 = 截面積 × 切去長度",
            "截面積 = a × a = a²",
            "3 × a² = 192 → a² = 64 → a = 8",
            "原長方體：長 8+3=11，寬 8，高 8",
            "原體積 = 11 × 8 × 8 = 704 立方公分"
          ]},
          { kind: "callout", type: "warning", text: "重點：讀清楚題目「長切短3cm」，被切掉部分的橫切面是正方形邊 a × a。" }
        ]
      },
      {
        type: "warning", title: "幾何常見錯誤",
        blocks: [
          { kind: "list", items: [
            "✗ 把「直徑」當「半徑」帶入圓面積公式 → 面積會變 4 倍大",
            "    正解：公式 A = π × r²，r 是<b>半徑</b>",
            "✗ 算三角形面積忘記除以 2",
            "✗ 算周長時漏掉其中一邊",
            "✗ 單位沒寫或單位不一致"
          ]},
          { kind: "callout", type: "warning", text: "幾何計算後，永遠遠檢查「單位」與「面vs 體積量綱」。" }
        ]
      }
    ]
  },

  /* --- 以下單元保留待補齊 --- */
  "02": { id: "02", title: "因數與倍數", emoji: "🔟", color: "#ff7043",
    intro: "質因數分解、GCD/LCM、整除判斷。本單元佔約 15%。", cards: [], comingSoon: true },
  "03": { id: "03", title: "比率與百分率", emoji: "📊", color: "#ab47bc",
    intro: "比例、百分比、折扣、濃度、統計圖。本單元佔約 15%。", cards: [], comingSoon: true },
  "04": { id: "04", title: "代數", emoji: "✖️", color: "#5c6bc0",
    intro: "簡易方程式、未知數求解、代數式化簡。本單元佔約 15%。", cards: [], comingSoon: true },
  "06": { id: "06", title: "速率", emoji: "🚗", color: "#ec407a",
    intro: "速率公式、平均速率、相遇/追趕問題。本單元佔約 10%。", cards: [], comingSoon: true },
  "07": { id: "07", title: "機統與規律", emoji: "🎲", color: "#26c6da",
    intro: "機率、統計圖表、數列與圖形規律。本單元佔約 5%。", cards: [], comingSoon: true },
};