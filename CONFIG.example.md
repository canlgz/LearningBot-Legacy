# 學生自己的 Script Properties

在 Apps Script → 專案設定 → 指令碼屬性設定。**不要把值寫在原始碼、Git、表單或截圖裡。**

## 首次安裝只需手填兩項

| 屬性 | 值 |
| --- | --- |
| LINE_CHANNEL_ACCESS_TOKEN | 自己的 Messaging API Channel access token |
| ADMINISTRATOR_LINE_USER_ID | 同一 Provider 下、你的 LINE Developers「Your user ID」，格式 U 加 32 位十六進位字元 |

不能填暱稱、電子郵件、Channel ID 或任意非空字串；也不會把第一位陌生來訊者升為管理員。

## 選填

| 屬性 | 未填時／用途 |
| --- | --- |
| DESTINATION_FOLDER_ID | 初始化自動建立私人根資料夾；若指定，只能使用你有權寫入的自己的資料夾 |
| SPREADSHEET_ID | 綁定式使用自己的綁定試算表；獨立專案未填會建立新試算表 |
| LEARNING_CENTER_CHAT_ID | 預設使用管理員私訊作為操作中心；可指定自己的 LINE 群組／聊天室 ID，不能填頁籤名稱 |
| DEFAULT_THUMBNAIL_FILE_ID | 選填自己的縮圖檔案；未填使用一般備用圖示 |

`LINE_NOTIFY_TOKEN` 與 `LEARNING_CENTER_SHEET_NAME` 已不使用。不要複製別人的 Script Properties。

## initializeBot 自動產生，請勿任意修改

- `SPREADSHEET_ID`、`DESTINATION_FOLDER_ID`：學生自己的資源。
- `WEBHOOK_KEY`：私人 webhook 密鑰；部署網址應接 `?key=這個值`。不會印在初始化記錄中。
- `BOT_INITIALIZED_SPREADSHEET_ID`：初始化完成標記。
- `backupBot.sheet.v1.*`：固定 ID 與工作表／資料夾對照。
- `backupBot.operation.v1.*`：暫存操作狀態，與內容列分開。

若更換試算表或複製專案，請使用全新設定重新初始化；不可沿用另一份表的 ID 對照。
