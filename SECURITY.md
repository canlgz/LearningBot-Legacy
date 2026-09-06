# 公開或部署前的安全檢查

本庫是已去識別化的教學快照。原始私人專案曾包含下列資料，絕不可複製進公開資料庫：

- LINE Channel access token 與通知 token
- LINE 使用者 ID
- Google Drive 資料夾與檔案 ID
- 正式部署網址與正式試算表資料

目前原始碼改以 Script Properties 讀取設定。請只使用自己建立的測試 Channel 與測試試算表；
不要將本快照部署到原始正式試算表，也不要將 LINE webhook 指向歷史部署。
