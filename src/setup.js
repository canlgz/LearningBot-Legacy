/** Student-owned installation. Never copies an author's spreadsheet or template. */
function botValidateSettings_() {
  if (!learnBot_CHANNEL_ACCESS_TOKEN) throw new Error('請設定 LINE_CHANNEL_ACCESS_TOKEN。');
  if (!/^U[0-9a-f]{32}$/i.test(administrator_id)) throw new Error('ADMINISTRATOR_LINE_USER_ID 必須是 LINE Developers 顯示的 Your user ID，不能填暱稱或任意文字。');
  if (learningBotCenter_id && !botIsChatId_(learningBotCenter_id)) throw new Error('LEARNING_CENTER_CHAT_ID 必須是 LINE 對話 ID，不是工作表名稱；初次安裝請留白。');
  var configured=optionalProperty_('SPREADSHEET_ID');
  if (SpreadSheet && configured && configured!==SpreadSheet.getId()) throw new Error('綁定試算表與 SPREADSHEET_ID 不同。請勿沿用別人或複本的設定。');
}

function initializeBot() {
  botValidateSettings_();
  // Validate credentials before creating student resources. Never log the token.
  var info=UrlFetchApp.fetch('https://api.line.me/v2/bot/info',{
    headers:{Authorization:'Bearer '+learnBot_CHANNEL_ACCESS_TOKEN},muteHttpExceptions:true
  });
  if (info.getResponseCode()!==200) throw new Error('LINE token 檢查失敗（HTTP '+info.getResponseCode()+'），尚未建立資源。');
  var lock=LockService.getScriptLock();lock.waitLock(20000);
  try {
    var props=PropertiesService.getScriptProperties();
    if (!SpreadSheet) {
      var existing=props.getProperty('SPREADSHEET_ID');
      SpreadSheet=existing ? SpreadsheetApp.openById(existing) : SpreadsheetApp.create('LearningBot Sandbox');
    }
    props.setProperty('SPREADSHEET_ID',SpreadSheet.getId());
    destinationFolderID=props.getProperty('DESTINATION_FOLDER_ID') || '';
    var root=destinationFolderID ? DriveApp.getFolderById(destinationFolderID) : DriveApp.createFolder('LearningBot uploads');
    if (root.isTrashed()) throw new Error('上傳根資料夾已在垃圾桶，請修正設定。');
    destinationFolderID=root.getId();props.setProperty('DESTINATION_FOLDER_ID',destinationFolderID);
    if (!props.getProperty('WEBHOOK_KEY')) props.setProperty('WEBHOOK_KEY',Utilities.getUuid()+Utilities.getUuid());
  } finally { lock.releaseLock(); }
  // Idempotent; a failure can be retried without erasing existing rows or folders.
  botEnsureSheet_(administrator_id,administrator_id);
  if (learningBotCenter_id!==administrator_id) botEnsureSheet_(learningBotCenter_id,administrator_id);
  installReadableNameSync();
  PropertiesService.getScriptProperties().setProperty('BOT_INITIALIZED_SPREADSHEET_ID',SpreadSheet.getId());
  var result={ready:true,spreadsheetUrl:SpreadSheet.getUrl(),sentMessages:0,
    next:'請手動部署，Webhook URL 使用 /exec?key=指令碼屬性 WEBHOOK_KEY 的值。不要公開這個網址。'};
  console.log(JSON.stringify(result));return result;
}

function botAssertReady_() {
  botValidateSettings_();
  if (!SpreadSheet || !destinationFolderID || optionalProperty_('BOT_INITIALIZED_SPREADSHEET_ID')!==SpreadSheet.getId()) {
    throw new Error('請先在自己的 Apps Script 專案執行 initializeBot，完成授權與初始化。');
  }
}

function botAcceptWebhook_(e) {
  var key=optionalProperty_('WEBHOOK_KEY');
  return !!key && !!e && !!e.parameter && e.parameter.key===key;
}
