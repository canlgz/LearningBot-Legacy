# 教學沙盒安全界線

本 repo 不包含作者或學生的真實憑證、LINE 身分、Drive 檔案或資料。
token、管理員 ID、自己的資源 ID、Webhook key 只存於各自 Apps Script 的 Script Properties。
所有共用 Apps Script 專案的編輯者可能存取這些設定；不要把含憑證的專案提供陌生人共同編輯。

## Webhook 驗證限制

直接 Apps Script 的事件物件沒有本程式可用的 LINE 原始簽章驗證流程。
本版要求 /exec?key=私人密鑰，錯誤或缺少 key 的請求不處理；它是額外防護，**不等於 LINE HMAC 簽章驗證**。
完整 webhook URL 若洩漏，攻擊者仍可能偽造事件。立即更換 WEBHOOK_KEY 並同步 LINE URL。
正式系統必須使用能讀取原始 request body 與 x-line-signature 的服務，依 LINE 官方方式驗證後才處理。

[LINE 簽章驗證](https://developers.line.biz/en/docs/messaging-api/verify-webhook-signature/)
／[GAS webhook 事件參數](https://developers.google.com/apps-script/guides/web)。

## 使用範圍

- 只用假資料、自己的測試 LINE 帳號與測試群組。
- 加入 bot 前取得成員同意；本程式會記錄訊息，啟用即時轉訊會通知管理員。
- 原型的瀏覽及取回權限不是完整的多租戶授權系統，不能拿來保存真實學生身分、成績、健康或其他敏感資訊。
- 管理员 ID 必須人工設定；程式不信任「第一位陌生來訊者即管理員」。
- 學校 Workspace 政策與權限限制不得繞過。

## 附件

不自動公開資料夾或檔案。私人媒體使用受 Drive 授權保護的連結。
若自行設「知道連結的任何人」可讀，持有連結的人可能讀取，不代表只限 LINE 群組成員。公開媒體轉發仍受 LINE 格式、大小、額度及 Drive 下載限制。
不支援的付費／創作者貼圖不能靠去除 quoteToken 突破平台限制。

## 發布前

- 不提交 .clasp.json、.clasprc.json、憑證、表格匯出或完整 webhook URL。
- 執行 npm test 與原始碼檢查；不可將正式環境檔案整份直接覆蓋本庫。
- 發現洩漏時，先撤銷或輪替憑證；只刪 Git 最新內容不足以移除歷史秘密。
- 更新後保留自己的備份，手動更新部署，再做實际送達驗收。
