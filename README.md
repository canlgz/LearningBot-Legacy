# LearningBot / backupBot：記寫歷程記錄的原始構想

這是一份經過**去識別化處理的早期實作快照**。LearningBot 後來曾命名為
`backupBot`。它提出的原始問題是：如何讓日常對話中的文字、檔案與課堂互動，留下可保存、
可取回、可回看的記寫軌跡。

本庫用於程式閱讀與課程討論，呈現這個原始構想如何以 LINE、Google 試算表與 Google Drive
落實；**不是**可直接投入正式環境的 Bot。
它也不是安裝 WriteToLearn 或 ConsciousnessBot 的前置條件。

## 為什麼建立這個資料庫？

LearningBot 以 LINE 作為個人學習檔案庫的入口：接收訊息與檔案、將資料存入綁定的
Google 試算表與 Google 雲端硬碟，並透過 LINE 選單與 Flex Message 輪播卡片，讓學習者
瀏覽、搜尋及取回自己的紀錄。

建議先閱讀[原始構想與後續發展](docs/EVOLUTION.md)，再開啟原始碼；若要建立課堂用沙盒，請依照
[詳細安裝流程](docs/INSTALL.md)操作。

若要理解原始構想如何在 WriteToLearn 中擴展為完整的記寫系統，請閱讀
[LearningBot、WriteToLearn 與 ConsciousnessBot 的關係說明](docs/LEARNING_TOOLS_COMPARISON.md)。

## 重要安全提醒

原始專案曾含有實際憑證與識別資料，本庫已經移除。此處**不包含**可用的正式 token、
webhook、試算表、Drive 資料夾或學生資料。

請勿將憑證寫入原始碼。請參閱[設定範例](CONFIG.example.md)與[資安說明](SECURITY.md)。

## 原始碼結構

早期 Apps Script 原始碼放在 [`src`](src) 中，盡量保留原本的檔案結構，讓學生能追查一個
真實的 GAS / LINE Bot 原型：

```text
src/
├── main.js                 LINE webhook 與訊息路由
├── parameters.js           Script Properties 與試算表欄位常數
├── defined function.js     共用輔助函式
├── menu.js                 選單、瀏覽、廣播與檔案取回
├── carouselInfo.js         分頁 Flex 輪播卡片
├── show_searchResult.js    搜尋結果輪播卡片
├── triggers.js             定時提醒
└── getThumbnailURL.js      Google Drive 輔助函式
```

## 課堂使用方式

請將本庫與 WriteToLearn 一起閱讀，討論一個緊密耦合的實驗性 Bot，如何逐漸演變為較可重現、
可維護的學習系統。若學生要安裝目前維護中的 WriteToLearn，請使用另一份
[學生安裝資料庫](https://github.com/canlgz/WriteToLearn-Student-Setup)。

## 來源與授權

Copyright © Guanze Liao。本庫保留歷史專案作為教育比較用途；引用或再利用內容時請保留作者標示。
