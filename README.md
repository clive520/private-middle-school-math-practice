# 🦉 小歐數學學園 — 國小升私中數學互動學習平台

七大必考題型 × 分級範例 × 互動模擬 × 遊戲化學習 × 雲端進度儲存

## 功能特色

- 🎯 **學習路徑**：學生須先看完單元教學卡片，才解鎖該單元測驗
- 📚 **互動教學卡片**：分數轉換機、圓面積動畫、畢氏定理探索器等互動元件
- ✏️ **分級測驗**：簡易 → 中等 → 難，即時回饋與詳解
- 🎮 **遊戲化**：XP 經驗值、徽章系統、連勝動畫、單元解鎖機制
- 📊 **進度儀表板**：累積 XP、成績歷史折線圖、徽章牆
- 📝 **錯題本**：自動收集測驗錯題，可隨時複習與移除
- 🔐 **雙認證系統**：Google 帳號登入 ＋ 預留自有 SSO 系統串接
- 🗄️ **雲端儲存**：Firebase Firestore（未設定時自動以本機示範模式運作）

## 一鍵預覽（不需設定）

直接打開 `index.html` 即可進入本機示範模式，所有功能都可體驗，資料存在瀏覽器 localStorage。
> 備註：建議以本地伺服器開啟以避免瀏覽器對 ES module 的限制
> ```
> python -m http.server 8080
> # 瀏覽 http://localhost:8080/
> ```

## 啟用 Firebase 雲端儲存

📖 **完整設定指南**：請參考 [`docs/FIREBASE_SETUP.md`](docs/FIREBASE_SETUP.md)（含 Firebase Console 逐步操作、Google 登入啟用、Firestore 規則設定）

快速步驟：

1. 至 [Firebase Console](https://console.firebase.google.com) 建立專案
2. 新增 Web 應用程式，取得下列設定值：`apiKey`、`authDomain`、`projectId`、`storageBucket`、`messagingSenderId`、`appId`
3. 在 Authentication → Sign-in method 啟用 **Google** 登入
4. 在 Authentication → Settings → Authorized domains 加入 `clive520.github.io`
5. 建立 **Firestore Database**（設定安全性規則）
6. 將 `config/firebase-config.example.js` 複製為 `config/firebase-config.js` 並填入真實設定
   ```
   cp config/firebase-config.example.js config/firebase-config.js
   # 編輯 firebase-config.js 填入設定
   ```
7. 重整頁面即可使用 Google 登入與雲端同步

## 啟用自有 SSO 系統

`config/firebase-config.js` 中的 `SSO_CONFIG` 區塊為自有 SSO 系統的抽象介面：

```js
window.SSO_CONFIG = {
  USE_CUSTOM_SSO: true,
  ssoLoginUrl: "https://sso.example.com/login",  // 登入端點
  ssoTokenName: "sso_token",                       // 接回 query key
  ssoVerifyUrl: "https://api.example.com/verify"   // 後端驗證端點（回傳 Firebase custom token）
};
```

後端驗證端點需回傳 JSON：`{ customToken: "...", displayName: "...", uid: "..." }`，前端會自動使用 `signInWithCustomToken` 完成登入。

## 專案結構

```.
├── index.html                      # SPA 入口
├── css/styles.css                  # 主題、佈局、動畫
├── config/
│   ├── firebase-config.example.js  # Firebase 設定範本
│   └── firebase-config.js          # 真實設定 (gitignore，需自行建立)
├── docs/
│   └── FIREBASE_SETUP.md           # Firebase Console 逐步設定指南
├── js/
│   ├── firebase.js                 # Firebase v10 (ES module): Google 登入、Firestore CRUD
│   ├── store.js                    # 狀態管理 + localStorage 與雲端同步
│   ├── lessons-data.js             # 七大單元教學卡片內容
│   ├── quiz-data.js                # 測驗題庫與詳解
│   ├── interactions.js             # 互動元件（圓面積、畢氏定理、分數轉換）
│   └── app.js                      # 主程式：路由、畫面渲染、事件綁定
├── 私中考試/                        # 原始 PDF 模擬試題與 Word/PPT 攻略
└── README.md
```

## 當前完成進度

✅ 平台骨架、登入畫面、首頁學習地圖、進度儀表板、錯題本
✅ **單元 01 數與運算**：8 張教學卡片（含分數轉換互動器）＋ 9 題測驗
✅ **單元 05 幾何**：9 張教學卡片（含圓面積動畫、畢氏定理探索）＋ 9 題測驗
✅ XP、徽章、連勝、錯題收集、雲端同步
✅ 響應式設計（手機/平板/桌機可用）

🚧 **第二階段（待補齊）**：
- 單元 02 因數與倍數
- 單元 03 比率與百分率
- 單元 04 代數
- 單元 06 速率
- 單元 07 機統與規律
- 每日挑戰與頭像客製化
- 自有 SSO 後端實作範例

## 授權

教學內容整理自歷年私中入學考試與模擬試題，平台程式碼歡迎自由使用與改作。