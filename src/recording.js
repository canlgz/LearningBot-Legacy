// Content rows and transient bot operations are separate. Existing rows are never purged.
function botInteractionKey_(chatId, userId, category) {
  return 'backupBot.operation.v1.' + SpreadSheet.getId() + '.' + chatId + '.' + (userId || 'unknown') + '.' + category;
}

function botGetOperation_(chatId, userId, category) {
  var key = botInteractionKey_(chatId, userId, category);
  var raw = PropertiesService.getScriptProperties().getProperty(key);
  if (!raw) return null;
  var state = JSON.parse(raw);
  if (state.expires < Date.now()) {
    PropertiesService.getScriptProperties().deleteProperty(key);
    return null;
  }
  return state;
}

function botSetOperation_(chatId, userId, category, state) {
  var key = botInteractionKey_(chatId, userId, category);
  if (!state) return PropertiesService.getScriptProperties().deleteProperty(key);
  state.expires = Date.now() + 30 * 60 * 1000;
  PropertiesService.getScriptProperties().setProperty(key, JSON.stringify(state));
}

function botCommandKind_(chatId, userId, text) {
  var value = String(text || '').trim();
  if (value === helper || value === '//' + helper) return 'help';
  var command = value.slice(0, 4);
  if (commandline.indexOf(command) !== -1) return command;
  var state = botGetOperation_(chatId, userId, 'input');
  if (state && state.kind === 'timing' && /^\d+#(?:-1|\d+)?$/.test(value)) return 'timing';
  return '';
}

function botHandleInput_(chatId, userId, replyToken, text) {
  var state = botGetOperation_(chatId, userId, 'input');
  if (!state || state.kind === 'timing') return false;
  if (botCommandKind_(chatId, userId, text)) {
    botSetOperation_(chatId, userId, 'input', null);
    return false;
  }
  if (state.kind === 'page') {
    if (!/^\d+$/.test(String(text).trim()) || Number(text) < 1) {
      short_reply(replyToken, ['請輸入有效的頁碼，或輸入其他 bot 指令取消。']);
      return true;
    }
    botSetOperation_(chatId, userId, 'input', null);
    if (state.search !== undefined) carouselInfobySearch(replyToken, state.target, state.search, Math.min(Number(text), state.pages));
    else carouselInfobyPage(replyToken, Math.min(Number(text), state.pages), state.target);
    return true;
  }
  if (state.kind === 'search') {
    botSetOperation_(chatId, userId, 'input', null);
    carouselInfobySearch(replyToken, state.target, String(text));
    return true;
  }
  return false;
}

function botIsUpload_(type) { return ['file', 'image', 'audio', 'video'].indexOf(type) !== -1; }

function botPlainCell_(range, value) {
  // Rich text prevents a user's text beginning with '=' from becoming a formula.
  range.setRichTextValue(SpreadsheetApp.newRichTextValue().setText(String(value == null ? '' : value)).build());
}

function botEnsureRecordColumns_(sheet) {
  var headers = ['MessageId', '備份狀態', '原始事件'];
  if (sheet.getMaxColumns() < 14) sheet.insertColumnsAfter(sheet.getMaxColumns(), 14 - sheet.getMaxColumns());
  var existing = sheet.getRange(1, 12, 1, 3).getValues()[0];
  for (var i = 0; i < headers.length; i++) {
    if (existing[i] && existing[i] !== headers[i]) throw new Error('Record metadata columns L:N are occupied.');
    if (!existing[i]) sheet.getRange(1, 12 + i).setValue(headers[i]);
  }
}

function botRefreshCount_(sheet) {
  var last = sheet.getLastRow();
  var count = last < 9 ? 0 : sheet.getRange(9, 9, last - 8, 1).getValues().filter(function(row) { return row[0] !== ''; }).length;
  sheet.getRange(6, 1).setValue(count);
  return count;
}

function botLastContentRow_(sheet) {
  var last = sheet.getLastRow();
  if (last < 9) return 8;
  var types = sheet.getRange(9, 9, last - 8, 1).getValues();
  for (var i = types.length - 1; i >= 0; i--) if (types[i][0] !== '') return i + 9;
  return 8;
}

function botAppendContent_(chatId, data, event) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = botSheet_(chatId);
    botEnsureRecordColumns_(sheet);
    var messageId = String(event.message.id || event.webhookEventId || '');
    if (!messageId) throw new Error('A message ID is required to record content safely.');
    var last = sheet.getLastRow();
    var ids = last < 9 ? [] : sheet.getRange(9, 12, last - 8, 1).getValues();
    var offset = ids.findIndex(function(row) { return String(row[0]) === messageId; });
    var row = offset < 0 ? botLastContentRow_(sheet) + 1 : offset + 9;
    var previousStatus = offset < 0 ? '' : String(sheet.getRange(row, 13).getValue());
    if (previousStatus === '已記錄' || previousStatus === '已備份') {
      botRefreshCount_(sheet);
      return {row: row, duplicate: true, ready: true};
    }
    if (row > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), Math.max(100, row - sheet.getMaxRows()));
    // On retry, retain a file ID that was saved before an interrupted final commit.
    var savedFileId = offset >= 0 && botIsUpload_(event.message.type) ? sheet.getRange(row, 11).getValue() : '';
    var values = [];
    for (var col = 5; col <= 11; col++) values.push(data[col - 1] == null ? '' : data[col - 1]);
    values.push(messageId, '處理中', JSON.stringify({webhookEventId: event.webhookEventId || '', timestamp: event.timestamp, source: event.source, message: event.message}));
    // Do not run any user-provided string as a formula, even during the initial write.
    var safe = values.map(function(value) { return typeof value === 'string' && value[0] === '=' ? '' : value; });
    sheet.getRange(row, 5, 1, safe.length).setNumberFormat('@').setValues([safe]);
    [6, 7, 10, 11, 12, 14].forEach(function(col) { botPlainCell_(sheet.getRange(row, col), values[col - 5]); });
    if (savedFileId) botPlainCell_(sheet.getRange(row, 11), savedFileId);
    var status = botIsUpload_(event.message.type) ? '處理中' : '已記錄';
    sheet.getRange(row, 13).setValue(status);
    botRefreshCount_(sheet);
    botCollectBroadcastRow_(chatId, event.source.userId, row);
    return {row: row, duplicate: false, ready: status === '已記錄'};
  } finally {
    SpreadsheetApp.flush();
    lock.releaseLock();
  }
}

function botFileReady_(sheet, row) {
  if (sheet.getMaxColumns() < 13 || sheet.getRange(1, 13).getValue() !== '備份狀態') return true;
  var status = sheet.getRange(row, 13).getValue();
  return !status || status === '已備份' || status === '已記錄';
}

function botStoredFile_(chatId, row) {
  var sheet = botSheet_(chatId);
  if (!botFileReady_(sheet, row)) throw new Error('這個檔案尚未備份成功，請重新上傳。');
  var registeredFolder = botContentFolder_(chatId);
  var folderId = registeredFolder.getId();
  var fileId = String(sheet.getRange(row, 11).getValue());
  if (fileId) {
    try {
      var file = DriveApp.getFileById(fileId);
      var parents = file.getParents();
      while (parents.hasNext()) if (parents.next().getId() === folderId && !file.isTrashed()) return file;
    } catch (error) { /* Legacy records may point at the old temporary file. */ }
  }
  if (sheet.getMaxColumns() >= 13 && sheet.getRange(row, 13).getValue() === '已備份') {
    throw new Error('找不到這筆紀錄對應的檔案，請檢查資料夾權限。');
  }
  // Compatibility for historical rows: search only their own folder, never all Drive files.
  var candidates = registeredFolder.getFilesByName(String(sheet.getRange(row, 10).getValue()));
  if (!candidates.hasNext()) throw new Error('對應資料夾中沒有這個檔案。');
  var candidate = candidates.next();
  if (candidates.hasNext()) throw new Error('舊紀錄有多個同名檔案，無法安全判定下載目標。');
  return candidate;
}

function botContentFolder_(chatId) {
  var sheet = botSheet_(chatId);
  var id = String(sheet.getRange(4, 1).getValue());
  var record = botRegistry_()[botChatId_(sheet)];
  if (!record || !id || id !== record.folderId) throw new Error('A4 與已登記的資料夾不符，已停止上傳以避免寫錯位置。');
  var folder = DriveApp.getFolderById(id);
  if (folder.isTrashed()) throw new Error('Backup folder is in the trash.');
  return folder;
}

function botSaveUpload_(chatId, row, event) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  var sheet;
  try {
    sheet = botSheet_(chatId);
    var folder = botContentFolder_(chatId);
    var alreadySaved = sheet.getRange(row, 11).getValue();
    if (alreadySaved) {
      var restored = DriveApp.getFileById(String(alreadySaved));
      var parents = restored.getParents(), validParent = false;
      while (parents.hasNext()) if (parents.next().getId() === String(sheet.getRange(4, 1).getValue())) validParent = true;
      if (!validParent || restored.isTrashed()) throw new Error('Saved upload is outside its registered folder.');
      sheet.getRange(row, 13).setValue('已備份');
      return {file: restored, duplicate: true};
    }
    var response = getFileDatas(learnBot_CHANNEL_ACCESS_TOKEN, event.message.id);
    if (response === -1) throw new Error('LINE 檔案下載失敗');
    var blob = response.getBlob();
    var mime = String(blob.getContentType()).split(';')[0];
    var extension = {'image/jpeg':'jpg','image/png':'png','image/gif':'gif','image/webp':'webp','video/mp4':'mp4','audio/mp4':'m4a','audio/mpeg':'mp3','audio/aac':'aac'}[mime] || 'bin';
    var name = event.message.type === 'file' ? event.message.fileName :
      (event.message.type === 'audio' ? String(event.message.duration || 0) + '_' : '') + event.message.id + '.' + extension;
    blob.setName(name);
    var saved = folder.createFile(blob);
    botPlainCell_(sheet.getRange(row, 11), saved.getId());
    botPlainCell_(sheet.getRange(row, 10), name);
    sheet.getRange(row, 13).setValue('已備份');
    return {file: saved, duplicate: false};
  } catch (error) {
    if (sheet) sheet.getRange(row, 13).setValue('備份失敗：' + String(error.message || error).slice(0, 160));
    throw error;
  } finally {
    SpreadsheetApp.flush();
    lock.releaseLock();
  }
}

function botBeginBroadcast_(chatId, userId, text, replyToken) {
  if (userId !== administrator_id) return short_reply(replyToken, ['你無權使用廣播功能。']);
  var target = botBroadcastChat_(String(text).slice(String(text).lastIndexOf('#') + 1));
  if (!botSheet_(target)) throw new Error('Broadcast target sheet is missing.');
  botSetOperation_(chatId, userId, 'broadcast', {target: target, rows: [], status: 'collecting'});
  return reply_message(chatId, '', userId, -1, replyToken, 5.1,
    '請輸入要廣播至「' + readSheettoValue(target, 3, 1) + '」的內容，最多五則。完成後按「檢視」。');
}

function botCollectBroadcastRow_(chatId, userId, row) {
  var state = botGetOperation_(chatId, userId, 'broadcast');
  if (!state || state.status !== 'collecting' || state.rows.length >= 5 || state.rows.indexOf(row) !== -1) return;
  state.rows.push(row);
  botSetOperation_(chatId, userId, 'broadcast', state);
}

function botPreviewBroadcast_(chatId, userId, replyToken) {
  var state = botGetOperation_(chatId, userId, 'broadcast');
  if (userId !== administrator_id || !state || !state.rows.length) return short_reply(replyToken, ['沒有蒐集到廣播訊息。']);
  if (state.status === 'sending') return short_reply(replyToken, ['這次廣播已送出或仍在處理，請勿重複傳送。']);
  var sheet = botSheet_(chatId);
  if (state.rows.some(function(row) { return !botFileReady_(sheet, row); })) return short_reply(replyToken, ['有檔案尚未備份成功，請取消這次廣播並重新上傳。']);
  var summary = state.rows.map(function(row) {
    return readSheettoValue(chatId, row, 9) + '：' + String(readSheettoValue(chatId, row, 10)).slice(0, 300);
  }).join('\n');
  state.status = 'ready';
  botSetOperation_(chatId, userId, 'broadcast', state);
  return confirm_broadCast(replyToken, ['確認將廣播的訊息？', summary], '廣播至「' + readSheettoValue(state.target, 3, 1) + '」？');
}

function botSendBroadcast_(chatId, userId, replyToken) {
  var state = botGetOperation_(chatId, userId, 'broadcast');
  if (userId !== administrator_id || !state || state.status !== 'ready') return short_reply(replyToken, ['請先檢視並確認廣播內容。']);
  state.status = 'sending';
  botSetOperation_(chatId, userId, 'broadcast', state);
  var sent = sendBroadCast(chatId, state.target, 0, 0, replyToken, state.rows);
  if (sent === true) botSetOperation_(chatId, userId, 'broadcast', null);
  else if (sent === false) {
    state.status = 'failed';
    botSetOperation_(chatId, userId, 'broadcast', state);
  }
  return sent;
}

// Every event gets its own handler call; an early reply cannot discard later events.
function doPost(e) {
  // Apps Script does not expose LINE's signature header. This secret URL is
  // defense in depth, NOT a replacement for HMAC validation in production.
  if (!botAcceptWebhook_(e)) return ContentService.createTextOutput('Unauthorized');
  botAssertReady_();
  var envelope;
  try { envelope = JSON.parse(e && e.postData && e.postData.contents || '{}'); }
  catch (error) { return ContentService.createTextOutput('OK'); }
  if (!Array.isArray(envelope.events)) return ContentService.createTextOutput('OK');
  var failures = 0;
  for (var eventIndex = 0; eventIndex < envelope.events.length; eventIndex++) {
    var event = envelope.events[eventIndex];
    try {
      botHandleEvent_({postData: {contents: JSON.stringify({destination: envelope.destination, events: [event]})}});
    } catch (error) {
      failures++;
      console.error('backupBot event failed: ' + String(event && (event.webhookEventId || event.message && event.message.id) || 'unknown') + ': ' + String(error.message || error));
    }
  }
  if (failures) throw new Error('backupBot could not finish ' + failures + ' event(s).');
  return ContentService.createTextOutput('OK');
}

// A browser-only installation check. LINE itself uses doPost.
function doGet(e) {
  if (!botAcceptWebhook_(e)) return ContentService.createTextOutput('Webhook key missing or invalid.');
  try {
    botAssertReady_();
    return ContentService.createTextOutput('LearningBot webhook is reachable. You may now use LINE Verify.');
  } catch (error) {
    return ContentService.createTextOutput('LearningBot is not initialized. Run initializeBot first.');
  }
}
