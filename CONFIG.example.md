# Script Properties 設定範例

請在 Apps Script 編輯器中開啟「**專案設定 → 指令碼屬性**」，建立下列鍵值。所有值都必須來自
**你自己的** LINE Channel 與 Google Drive；不可寫進 `.js` 檔或提交到 Git。

| 鍵 | 要填入的值 |
| --- | --- |
| `LINE_CHANNEL_ACCESS_TOKEN` | 自己 LINE Messaging API Channel 的 access token |
| `LINE_NOTIFY_TOKEN` | 歷史相容用的選填項目。課堂沙盒可留空；提醒／通知程式會記錄並略過。 |
| `DESTINATION_FOLDER_ID` | 儲存上傳檔案的 Google Drive 資料夾 ID |
| `LEARNING_CENTER_SHEET_NAME` | 作為學習中心的工作表名稱 |
| `ADMINISTRATOR_LINE_USER_ID` | 可執行管理指令的 LINE 使用者 ID |
| `DEFAULT_THUMBNAIL_FILE_ID` | 選填：作為預設縮圖的 Drive 圖片檔案 ID |

本程式刻意以 `SpreadsheetApp.getActiveSpreadsheet()` 取得目前試算表，因此它是綁定在
試算表上的 Apps Script 專案。
