# Firebase 設定指南 — Google 登入與 Firestore 雲端儲存

本指南帶您一步步建立 Firebase 專案、啟用 Google 登入、建立 Firestore 資料庫，並把設定填入本專案對應檔案。完成後網頁即可使用 Google 帳號登入並儲存學生進度到雲端。

---

## Part A：建立 Firebase 專案（5 分鐘）

### 1. 進入 Firebase Console
- 開啟 https://console.firebase.google.com
- 用 Google 帳號登入

### 2. 新增專案
1. 點 **「建立專案」**（或 NEW PROJECT）
2. 填入專案名稱，例如 `math-platform`
3. Google Analytics 可選擇「停用」
4. 等待建立完成，按 **「繼續」** 進入專案

---

## Part B：新增 Web 應用程式（2 分鐘）

1. 在專案總覽頁面中段，點平台圖示的 **`</>`（Web）**
2. 輸入應用程式名稱，例如 `Math Web App`
3. **不要勾選**「設定 Firebase Hosting」
4. 按 **「註冊應用程式」**
5. 出現一段 `firebaseConfig` 物件，內容類似：

   ```js
   const firebaseConfig = {
     apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
     authDomain: "math-platform-xxxxx.firebaseapp.com",
     projectId: "math-platform-xxxxx",
     storageBucket: "math-platform-xxxxx.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef1234567890"
   };
   ```
6. **將此段設定貼到 `config/firebase-config.js`**（替換 `YOUR_API_KEY` 等欄位）
   - 或直接複製 `config/firebase-config.example.js` → `firebase-config.js` 再編輯
7. 按「繼續至 Console」

---

## Part C：啟用 Google 登入（2 分鐘）

1. 左側側欄 → **「Authentication」**
2. 點 **「Get Started」**（從未設定過時）
3. 上方分頁 → **「Sign-in method」**
4. 找 **「Google」** → 點進去 → 開啟 **「啟用 (Enable)」** 開關
5. 填入 **公開名稱**（學生會在 Google 授權彈窗看到，例如「小歐數學學園」）
6. **支援電子郵件**：選擇您的專案 email
7. 按 **「儲存」**

---

## Part D：新增授權網域（1 分鐘）

GitHub Pages 預設網域必須加入授權清單，否則 Google 登入會被擋。

1. Authentication → **「Settings」** → **「Authorized domains」** 分頁
2. 按 **「Add domain」**
3. 加入：`clive520.github.io` （您的 GitHub Pages 網域）
4. （開發用）確認 `localhost` 已在清單中（Firebase 預設有）

---

## Part E：建立 Firestore 資料庫（3 分鐘）

1. 左側側欄 → **「Firestore Database」**
2. 點 **「建立資料庫」**（Create Database）
3. 選 **「production mode」** （正式模式）或 **「test mode」**（測試模式，30 天內允許所有讀寫，方便快速驗證）
4. 選個離您最近的區域，例如 `asia-east1`（台灣）
5. 按 **「啟用」**
6. 等待建立完成

---

## Part F：設定 Firestore 安全性規則（1 分鐘）

1. 在 Firestore Database → **「Rules」** 分頁
2. 將預設規則改為：

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // 學生只能讀寫自己的進度資料
       match /students/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       // 教師讀取（若要讓老師查學生）：暫不開放，由您自行放寬
     }
   }
   ```
3. 按 **「發布」**（Publish）

---

## Part G：填入設定到專案（1 分鐘）

把 Part B 拿到的 `firebaseConfig` 物件填入：

```
config/firebase-config.js
```

範例（記得替換成您的真實設定）：

```js
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyXXXXXX...XXXX",
  authDomain: "math-platform-xxxxxxx.firebaseapp.com",
  projectId: "math-platform-xxxxxxx",
  storageBucket: "math-platform-xxxxxxx.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:yyyyyyyyyyyy"
};

window.SSO_CONFIG = {
  USE_CUSTOM_SSO: false,
  ssoLoginUrl: "", ssoTokenName: "sso_token", ssoVerifyUrl: ""
};
```

`config/firebase-config.js` 已在 `.gitignore` 中，不會被推到 GitHub，設定值不會外洩。

---

## Part H：測試（2 分鐘）

### 本機測試
```powershell
python -m http.server 8080
# 瀏覽 http://localhost:8080/
```

1. 開啟首頁，會看到「Google 登入」按鈕
2. 點按 → 跳出 Google 授權彈窗 → 選帳號 → 同意
3. 自動回到學習地圖，右上角看到您的頭像與名稱
4. 開始看教學卡片、做測驗 → 進度會即時寫入 Firestore

### 雲端測試
- 推送到 GitHub → GitHub Pages 自動部署
- 連到 https://clive520.github.io/private-middle-school-math-practice/ 即可登入
- （記得已完成 Part D 加入此網域到授權清單！）

### 驗證 Firestore 是否有資料
1. 回到 Firebase Console → Firestore Database → **「Data」** 分頁
2. 應該看到 `students/{您的 uid}` 文件，內含 xp、streak、units、quizzes 欄位

---

## 排解疑難

| 症狀 | 原因 | 解法 |
|------|------|------|
| 點 Google 登入無反應 | 未加網域到 authorized domains | Part D 重做 |
| 彈窗顯示「此應用程式沒有驗證」 | OAuth 同意畫面測試模式 | 自己測試時可忽略；上線前申請驗證 |
| Console 出現 `auth/unauthorized-domain` | 網域未加入授權 | 重做 Part D |
| Firestore 寫入失敗 | 安全性規則太嚴 | Part F 確認規則正確 |
| 看不到您的頭像 | Google 帳號無設定 | 不影響功能；可手動改用 placeholder |

完成 Part A ~ G 後，把 `firebase-config.js` 的內容貼給我（或確認已上線），我會立刻驗證並協助排除問題！