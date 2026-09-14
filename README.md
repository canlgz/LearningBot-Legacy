# LearningBot / backupBot：學生自建教學沙盒

以 LINE 記錄文字、連結與附件，保存於**學生自己的 Google 試算表及 Drive**，支援瀏覽、搜尋、廣播與轉訊。

## 從這裡開始

1. [學生安裝流程](docs/INSTALL.md)：不需要老師的試算表、不需要手工製作 `templet`。
2. [Script Properties 設定](CONFIG.example.md)：憑證只放在自己的 Apps Script。
3. [安裝後驗收清單](docs/TESTING.md)：確認自己的 LINE／Google 環境正常。

2026-09-14 教學版整合了可讀頁籤、程式產生版型、指令與內容分離、廣播貼圖修正及管理員群組轉訊。
這不是老師正式專案的直接匯出；已移除正式 token、固定群組／試算表／資料夾 ID 與私人遷移清單。

## 安裝後的行為

- `initializeBot` 建立自己的資源。空白獨立 Apps Script 會建立試算表；綁定式專案則使用自己的綁定試算表。
- 不用建立 `templet`、`Triggers` 或 `Learning Center` 頁籤。第一則群組訊息會自動建立完整格式及獨立子資料夾。
- 頁籤、A3 和 Drive 子資料夾名稱同步；程式以固定 LINE ID → sheetId / folderId 對應，不以可讀名稱猜測收件者。
- 一般文字、連結、貼圖資料和附件會記錄；已識別的指令、搜尋字串和頁碼操作不新增內容列。原有歷史列不刪除。
- 新群組預設即時轉訊至管理員私訊，包含管理員本人在群組發出的訊息；管理員與 bot 的私聊不回送給自己。請先取得測試群組成員同意。
- 私人附件預設以受 Drive 權限保護的連結傳送，不自動公開。已由擁有者設成公開可讀的媒體可直接顯示。
- 學生自行部署。更新程式後需手動更新既有部署版本，通常不必更換 Webhook URL。

## 安全界線

這仍是**教學沙盒，不是已完成安全認證的正式課務系統**。請使用假資料。
直接 GAS webhook 不能依本程式驗證 LINE 的原始簽章；本版增加私人 Webhook key 防止只知道部署 ID 的人直接寫入，但它不等於簽章驗證。
涉及真實學生身分、成績或敏感內容時，需先使用能驗證簽章的前端服務並審查授權。請閱讀 [SECURITY.md](SECURITY.md)。

## 原始碼

`src/` 的 13 個 JavaScript 檔上傳至 GAS 後是伺服端腳本：

| 檔案 | 用途 |
| --- | --- |
| setup.js、parameters.js | 初始化、私人設定與 webhook 入口檢查 |
| sheetIdentity.js、sheetSchema.js | 固定身分對應、可讀名稱、自動版型 |
| recording.js、main.js | 內容紀錄、事件處理、指令及轉訊 |
| menu.js | 選單、廣播、取回附件 |
| carouselInfo.js、show_searchResult.js | 瀏覽與搜尋 |
| defined function.js、getThumbnailURL.js | 輔助函式、媒體及縮圖 |
| triggers.js、broadcastValidation.js | 定時提醒與手動診斷 |

`src/appsscript.json` 是 GAS manifest；`tests/` 只在本機或 GitHub Actions 執行，不上傳 GAS。

## 開發與驗證

Node.js 20+，不需安裝 npm 套件：

```bash
npm test
```

測試使用隔離的 Google／LINE 模擬服務，不會發真實訊息。真實驗收範圍見 [TESTING.md](docs/TESTING.md)。

## 原始構想與後續發展

保留早期「以日常對話留下可回看記寫歷程」的教育脈絡：
[原始構想與發展](docs/EVOLUTION.md)、
[與 WriteToLearn／ConsciousnessBot 的關係](docs/LEARNING_TOOLS_COMPARISON.md)。
本庫不必作為其他系統的安裝前置條件。

Copyright © Guanze Liao。教育比較及再利用時請保留作者標示。
