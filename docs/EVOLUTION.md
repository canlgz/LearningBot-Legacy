# LearningBot → WriteToLearn 的演進

## LearningBot / backupBot 做了什麼？

LearningBot 是一個以 LINE 為核心的個人學習紀錄與備份 Bot。使用者透過 LINE 傳送的訊息或
檔案，會被存進 Google 試算表與 Google 雲端硬碟；Bot 再以 LINE Flex Message 輪播卡片提供
瀏覽、搜尋、廣播與定時提醒。

```text
LINE 事件
  → doPost(e)
  → 指令／postback 路由
  ├─ 試算表：學習空間、紀錄與中繼資料
  ├─ Drive：上傳檔案與縮圖
  ├─ LINE reply / push API：選單與 Flex 輪播卡片
  └─ 定時觸發條件：提醒與通知
```

## 演進比較

| 面向 | LearningBot / backupBot | WriteToLearn |
| --- | --- | --- |
| 主要互動 | LINE 指令、postback 與 Flex Message | 在 LINE 中進行學習歷程書寫 |
| 儲存模型 | 一份綁定試算表加上 Drive 資料夾 | 結構化紀錄與檢索導向知識庫 |
| 設定方式 | 歷史上以原始碼全域常數保存 | 面向學生的安裝說明與明確設定流程 |
| 權限模型 | 試算表內儲存管理者／主持人 LINE ID | 明確的擁有者與首次啟用流程 |
| 取回資料 | 工作表瀏覽、分頁與關鍵字搜尋 | Drive 檢索與 RAG 導向設計 |
| 教學價值 | 呈現早期直接由事件寫入試算表的架構 | 呈現同一個學習紀錄理念如何發展為可維護工具 |

## 原始碼閱讀地圖

| 檔案 | 角色 |
| --- | --- |
| `main.js` | LINE webhook (`doPost`)、訊息路由與上傳處理 |
| `parameters.js` | 設定與試算表欄位常數 |
| `defined function.js` | 試算表輔助函式、空間建立、個人資料與共用回覆 |
| `menu.js` | Flex 選單、廣播、檔案瀏覽與取回 |
| `carouselInfo.js` / `show_searchResult.js` | 分頁輪播卡片與搜尋結果呈現 |
| `triggers.js` | 定時提醒與觸發條件生命週期 |
| `getThumbnailURL.js` | Drive 縮圖與內容輔助函式 |

## 討論題目

1. 對早期原型而言，試算表讓哪些事情變得容易？
2. 這個歷史設計中，哪些假設讓它難以安全分享？
3. 將憑證移到 Script Properties，如何改變維護模式？
4. LINE 事件路由中，哪些概念在 WriteToLearn 裡仍然延續？
