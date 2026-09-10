# 安裝 LearningBot / backupBot 課堂沙盒

> **適用範圍：** 本流程用來研究一個歷史 LINE + Google Apps Script 原型。請使用全新的
> LINE Channel、試算表與 Drive 資料夾；不可連回原正式 webhook、試算表或 Drive。

## 開始前

你需要：可建立 Google 試算表與 Apps Script 專案的 Google 帳號、LINE Developers 帳號、
新的 Messaging API Channel，以及（建議使用）Node.js 18+ 與 Git。也請準備一個測試用 LINE
帳號來和 Bot 對話。

```text
LINE 使用者 → LINE Messaging API → GAS doPost(e)
             → 綁定試算表 + Drive 資料夾 → LINE 回覆／Flex Message
```

## 1. 建立私人的測試 Drive 資料夾

1. 在 Google Drive 建立一個資料夾，例如 `LearningBot uploads`。
2. 開啟該資料夾，複製網址中 `/folders/` 後的 ID；稍後填為
   `DESTINATION_FOLDER_ID`。這個值屬於私人設定。

試算表會在第 3 節由 `clasp` 一次建立，避免模板建立在錯誤的試算表中。

## 2. 建立 LINE Messaging API Channel

1. 登入 [LINE Developers Console](https://developers.line.biz/console/)。
2. 建立新的 Provider（若尚未有測試用 Provider）。
3. 在其中建立 **Messaging API** Channel。
4. 到 Channel 的 **Messaging API** 頁面產生 channel access token；請優先使用 LINE
   當下提供的 token 類型，並保存到私人位置。
5. 測試期間請關閉自動回覆與加入好友歡迎訊息，避免產生重複回覆。

不可把 token 寫進 Git、試算表儲存格、截圖或聊天室。

## 3. 將原始碼放入綁定式 Apps Script

建議使用 `clasp`，可讓學生以相同方式建立自己的沙盒：

```bash
git clone https://github.com/canlgz/LearningBot-Legacy.git
cd LearningBot-Legacy
npm install --global @google/clasp
clasp login
clasp create --type sheets --title "LearningBot Sandbox" --rootDir src
clasp push
clasp open-script
```

`clasp create --type sheets` 會建立**唯一一份** `LearningBot Sandbox` 試算表，並將 Apps
Script 綁定到它。請開啟該指令輸出中的試算表連結，依照
[SHEET_TEMPLATE.md](SHEET_TEMPLATE.md) 在這一份試算表建立 `templet`、`Triggers` 與
`Learning Center` 工作表及其控制列。`templet` 的拼字與前八列的資料都不可省略；它是 Bot
第一次收到 LINE 訊息時複製新對話工作表的依據。

回到 Apps Script 編輯器，確認左側檔案清單已出現 `main.js`、`parameters.js` 與
`appsscript.json`；若 `clasp push` 尚未成功，先不要往下設定 LINE webhook。

在 Apps Script 編輯器開啟「**專案設定 → 指令碼屬性**」，新增以下值：

| 屬性 | 沙盒應填入的值 |
| --- | --- |
| `LINE_CHANNEL_ACCESS_TOKEN` | 步驟 2 產生、僅供測試的 token |
| `DESTINATION_FOLDER_ID` | 步驟 1 的測試 Drive 資料夾 ID |
| `LEARNING_CENTER_SHEET_NAME` | `Learning Center` |
| `ADMINISTRATOR_LINE_USER_ID` | 初次測試可填任意非空白文字；第一位私訊使用者會成為該工作表的主持人 |
| `DEFAULT_THUMBNAIL_FILE_ID` | 選填；可留白以使用程式內的備用縮圖 |
| `LINE_NOTIFY_TOKEN` | 選填；一般安裝可留白。僅保留給舊式排程提醒程式使用。 |

第一次執行時，Apps Script 會要求試算表、Drive 與外部請求權限。請確認是在自己的測試專案中
才授權。

## 4. 部署為網頁應用程式

1. 在 Apps Script 點選「**部署 → 新增部署作業**」。
2. 類型選「**網頁應用程式**」。
3. 「執行身分」選「**我**」。
4. 存取權選可讓未登入使用者呼叫的公開選項（通常是「**所有人**」）。LINE webhook 伺服器
   無法登入你的 Google 帳號。
5. 完成授權後部署，複製結尾為 `/exec` 的網址。

新的部署可能產生新的 `/exec` 網址；發生時也要更新 LINE webhook。

## 5. 將 LINE webhook 接到 GAS

1. 回到 LINE Developers 的 **Messaging API** 設定頁。
2. 將 GAS 的 `/exec` 網址貼到 **Webhook URL**。
3. 開啟 **Use webhook**。
4. 按下 **Verify**。成功代表 LINE 能連到 GAS；不表示所有歷史功能都已可用。
5. 將測試 Bot 加為好友，傳送一則簡短文字。

第一則訊息應建立一張以 LINE 對話 ID 命名的工作表，並在 `LearningBot uploads` 建立子資料夾。

## 6. 課堂冒煙測試

依序測試：

1. 傳送「你好」，確認出現新的工作表。
2. 傳送短文字，確認第 9 列後開始新增紀錄。
3. 傳送圖片或檔案，確認 Drive 子資料夾與新紀錄。
4. 傳送 `//檔案`，觀察歷史版 Flex Message 瀏覽流程。
5. 傳送 `//我是測試者`，觀察早期暱稱指令模式。

## 疑難排解

| 現象 | 可能原因 | 檢查方式 |
| --- | --- | --- |
| LINE Verify 失敗 | GAS 存取權非公開，或貼錯網址 | 重新部署網頁應用程式，使用正確 `/exec` 網址。 |
| 出現 `Missing Script Property` | 必填屬性遺漏或拼字不同 | 逐字核對第 3 步的屬性名稱。 |
| 第一則訊息未建立工作表 | 缺少 `templet` 或 Drive 權限有誤 | 確認工作表名稱完全是 `templet`，以及資料夾 ID 正確。 |
| 試算表有資料但 LINE 未回覆 | LINE token 無效或已過期 | 在 LINE Developers 重新產生 token，只更新指令碼屬性。 |
| 舊式排程提醒沒有作用 | 未設定 LINE Notify | 這是課堂沙盒的預期行為。一般訊息與管理通知在第 287 版已改用 Messaging API push。 |
| 無法建立部署 | 舊專案版本數過多 | 新建的學生沙盒通常不會發生；不可為了課堂練習去刪原始封存專案版本。 |

## 歷史限制

- 此原始碼早於目前的安全與維護慣例，尤其未實作 LINE webhook 簽章驗證。
- 某些 Drive 與 LINE 行為已隨服務演進而改變。
- 舊式排程提醒仍使用 LINE Notify；一般訊息與管理通知已在第 287 版改用 LINE Messaging API push。
- 沙盒中不可使用學生身分或真實學習紀錄。

若要安裝目前維護中的版本，請改用
[WriteToLearn 學生安裝資料庫](https://github.com/canlgz/WriteToLearn-Student-Setup)。
