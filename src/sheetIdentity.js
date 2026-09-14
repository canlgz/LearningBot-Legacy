// Sheet titles are labels, never LINE destinations. A4 remains the Drive folder ID.
// Registry keys include the spreadsheet ID so a copied workbook cannot reuse live mappings.
var botRegistryCache_;

// No installation-specific migration IDs are distributed to students.
function botPreservedChatId_(sheet) { return ""; }

function botRegistryPrefix_() {
  return 'backupBot.sheet.v1.' + SpreadSheet.getId() + '.';
}

function botRegistry_() {
  if (!botRegistryCache_) {
    botRegistryCache_ = {};
    var prefix = botRegistryPrefix_();
    var props = PropertiesService.getScriptProperties().getProperties();
    Object.keys(props).forEach(function(key) {
      if (key.indexOf(prefix) !== 0) return;
      var chatId = key.slice(prefix.length);
      var record = JSON.parse(props[key]);
      if (!botIsChatId_(chatId) || !Number.isInteger(record.sheetId)) {
        throw new Error('Invalid backupBot sheet registry.');
      }
      botRegistryCache_[chatId] = record;
    });
  }
  return botRegistryCache_;
}

function botIsChatId_(value) {
  return typeof value === 'string' && /^[UCR][0-9a-f]{32}$/i.test(value);
}

function botSaveRecord_(chatId, record) {
  PropertiesService.getScriptProperties().setProperty(botRegistryPrefix_() + chatId, JSON.stringify(record));
  botRegistry_()[chatId] = record;
}

function botChatId_(sheet) {
  if (!sheet) throw new Error('The requested sheet no longer exists.');
  var registry = botRegistry_();
  var matches = Object.keys(registry).filter(function(id) {
    return registry[id].sheetId === sheet.getSheetId();
  });
  if (matches.length > 1) throw new Error('Multiple LINE chats point to the same sheet.');
  if (matches.length === 1) return matches[0];
  return botPreservedChatId_(sheet) || (botIsChatId_(sheet.getName()) ? sheet.getName() : '');
}

// All legacy raw-ID callbacks and new callbacks resolve to the same native sheet ID.
function botSheet_(reference) {
  var ref = String(reference == null ? '' : reference);
  var registry = botRegistry_();
  if (registry[ref]) {
    var mapped = SpreadSheet.getSheetById(registry[ref].sheetId);
    if (!mapped) throw new Error('Registered sheet is missing; refusing to create a replacement: ' + ref);
    return mapped;
  }
  if (botIsChatId_(ref)) {
    var preserved = SpreadSheet.getSheets().filter(function(s) { return botPreservedChatId_(s) === ref; });
    if (preserved.length === 1) return preserved[0];
  }
  var sheet = SpreadSheet.getSheetByName(ref);
  if (sheet && botIsChatId_(ref)) {
    var owner = botChatId_(sheet);
    if (owner !== ref) throw new Error('Sheet title conflicts with another LINE chat ID.');
  }
  return sheet;
}

function botRequireChat_(reference) {
  // Existing code also sends to configured chats that have no log sheet yet.
  if (botIsChatId_(reference)) return reference;
  var id = botChatId_(botSheet_(reference));
  if (!id) throw new Error('A sheet label cannot be used as a LINE recipient.');
  return id;
}

function botManagedSheets_() {
  return SpreadSheet.getSheets().filter(function(sheet) {
    return !!botChatId_(sheet);
  });
}

function botCallbackChat_(data, legacyIndex) {
  if (data.chatId) {
    var sheet = botSheet_(data.chatId);
    if (!sheet) throw new Error('The callback refers to a missing chat.');
    return botChatId_(sheet);
  }
  return botChatId_(SpreadSheet.getSheets()[legacyIndex]);
}

function botBroadcastChat_(reference) {
  var ref = String(reference).trim();
  if (botIsChatId_(ref)) return botRequireChat_(ref);
  // Older cards use the one-based sheet position. Preserve them without changing tab order.
  if (!/^\d+$/.test(ref)) throw new Error('Invalid broadcast destination.');
  var chatId = botChatId_(SpreadSheet.getSheets()[Number(ref) - 1]);
  if (!chatId) throw new Error('Broadcast destination is not a managed chat.');
  return chatId;
}

function botRegisterSheet_(chatId, sheet) {
  var registry = botRegistry_();
  if (!botIsChatId_(chatId)) throw new Error('Invalid LINE chat ID.');
  if (registry[chatId] && registry[chatId].sheetId !== sheet.getSheetId()) {
    throw new Error('Refusing to overwrite an existing chat mapping.');
  }
  var existingOwner = botChatId_(sheet);
  if (existingOwner && existingOwner !== chatId) throw new Error('Sheet already belongs to another chat.');
  var folderId = String(sheet.getRange(4, 1).getValue()).trim();
  if (!folderId) throw new Error('A4 has no Drive folder ID: ' + sheet.getName());
  var record = registry[chatId] || {
    sheetId: sheet.getSheetId(), folderId: folderId,
    originalName: sheet.getName(), lastName: '', pendingName: ''
  };
  if (record.folderId !== folderId) throw new Error('A4 differs from the registered folder ID.');
  Object.keys(registry).forEach(function(otherId) {
    if (otherId !== chatId && registry[otherId].folderId === folderId) {
      throw new Error('Two chats must not share the same registered folder.');
    }
  });
  botSaveRecord_(chatId, record);
  return record;
}

function botUniqueName_(label, sheet) {
  var base = String(label == null ? '' : label).trim().replace(/[\[\]:*?\/\\\x00-\x1f]/g, ' ').replace(/\s+/g, ' ');
  if (!base) base = '未命名群組';
  base = base.slice(0, 90);
  // A user label must never impersonate a raw LINE ID or the template.
  if (botIsChatId_(base) || base.toLowerCase() === 'templet') base = '群組 ' + base;
  var candidate = base;
  var suffix = 2;
  while (SpreadSheet.getSheets().some(function(other) {
    return (!sheet || other.getSheetId() !== sheet.getSheetId()) && other.getName().toLowerCase() === candidate.toLowerCase();
  })) {
    candidate = base + ' (' + suffix++ + ')';
  }
  return candidate;
}

// Caller holds the script lock. Folder failure leaves the mapping valid and retryable.
function botSyncNameUnlocked_(chatId, requestedName) {
  var sheet = botSheet_(chatId);
  var record = botRegistry_()[chatId];
  if (!record) throw new Error('Register the sheet before changing its label.');
  if (String(sheet.getRange(4, 1).getValue()).trim() !== record.folderId) {
    throw new Error('A4 was changed; folder synchronization stopped to protect the original folder.');
  }
  var title = sheet.getName();
  var a3 = String(sheet.getRange(3, 1).getValue()).trim();
  var desired = requestedName;
  if (desired == null) {
    if (record.lastName && title !== record.lastName) desired = title;
    else if (a3 && a3 !== record.lastName) desired = a3;
    else desired = record.pendingName || record.lastName || (botIsChatId_(title) ? a3 : title);
  }
  desired = botUniqueName_(desired, sheet);
  var folder = DriveApp.getFolderById(record.folderId);
  if (folder.isTrashed()) throw new Error('The registered Drive folder is in the trash.');
  record.pendingName = desired;
  botSaveRecord_(chatId, record);
  // Rename only. Do not move, recreate, delete, or alter sharing of folders/files.
  if (folder.getName() !== desired) folder.setName(desired);
  if (sheet.getName() !== desired) sheet.setName(desired);
  if (String(sheet.getRange(3, 1).getValue()) !== desired) sheet.getRange(3, 1).setValue(desired);
  record.lastName = desired;
  record.pendingName = '';
  botSaveRecord_(chatId, record);
  return desired;
}

function botRename_(chatId, label) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    botRegistryCache_ = null;
    return botSyncNameUnlocked_(botRequireChat_(chatId), label);
  } finally {
    SpreadsheetApp.flush();
    lock.releaseLock();
  }
}

function botEnsureSheet_(chatId, userId) {
  var existing = botSheet_(chatId);
  if (existing && botRegistry_()[chatId] && !botRegistry_()[chatId].creating) return existing;
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    botRegistryCache_ = null;
    existing = botSheet_(chatId);
    if (existing) {
      if (botRegistry_()[chatId] && botRegistry_()[chatId].creating) {
        return botFinishNewSheet_(chatId, existing, botRegistry_()[chatId]);
      }
      botRegisterSheet_(chatId, existing);
      return existing;
    }
    if (!botIsChatId_(chatId)) throw new Error('Cannot create a sheet without a LINE chat ID.');
    var label = chatId === administrator_id ? '📺Dashboard®️' :
      chatId === learningBotCenter_id ? '📺learningBotCenter®️' : '新群組';
    label = botUniqueName_(label, null);
    // Append so existing legacy numeric buttons are not shifted by a new chat.
    var newSheet = botCreateGroupSheet_(chatId);
    newSheet.getRange(2, 1).setValue(userId || '');
    newSheet.getRange(3, 1).setValue(label);
    if (chatId === administrator_id || chatId === learningBotCenter_id) newSheet.getRange(5, 1).setValue(-1);
    var record = {sheetId: newSheet.getSheetId(), folderId: '', originalName: chatId,
      lastName: '', pendingName: label, creating: true};
    botSaveRecord_(chatId, record);
    return botFinishNewSheet_(chatId, newSheet, record);
  } finally {
    SpreadsheetApp.flush();
    lock.releaseLock();
  }
}

function botFinishNewSheet_(chatId, sheet, record) {
  var label = record.pendingName || String(sheet.getRange(3, 1).getValue()) || '新群組';
  if (!record.folderId) {
    var folder = DriveApp.getFolderById(destinationFolderID).createFolder(label);
    record.folderId = folder.getId();
    botSaveRecord_(chatId, record);
  }
  var currentFolder = String(sheet.getRange(4, 1).getValue()).trim();
  if (currentFolder && currentFolder !== record.folderId) throw new Error('New sheet folder changed during initialization.');
  sheet.getRange(4, 1).setValue(record.folderId);
  botSyncNameUnlocked_(chatId, label);
  record.creating = false;
  botSaveRecord_(chatId, record);
  return sheet;
}

// Read-only preview. Run and inspect before initializeReadableNames.
function previewReadableNames() {
  var seenFolders = {};
  var preview = botManagedSheets_().map(function(sheet) {
    var chatId = botChatId_(sheet);
    var folderId = String(sheet.getRange(4, 1).getValue()).trim();
    if (!folderId || seenFolders[folderId]) throw new Error('Missing or shared folder mapping; manual review required.');
    seenFolders[folderId] = true;
    var folder = DriveApp.getFolderById(folderId);
    if (folder.isTrashed()) throw new Error('Folder is in the trash.');
    return {chatId: chatId, sheetId: sheet.getSheetId(), sheetName: sheet.getName(),
      A3: sheet.getRange(3, 1).getValue(), folderId: folderId, folderName: folder.getName(),
      lastRow: sheet.getLastRow(), count: sheet.getRange(6, 1).getValue()};
  });
  console.log(JSON.stringify(preview));
  return preview;
}

// Register IDs only. Safe to run while the old deployment is still serving requests.
function registerReadableNames() {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    botRegistryCache_ = null;
    var preview = previewReadableNames();
    preview.forEach(function(item) { botRegisterSheet_(item.chatId, SpreadSheet.getSheetById(item.sheetId)); });
    console.log('Registered ' + preview.length + ' sheets. No names or cells changed.');
  } finally { lock.releaseLock(); }
}

// Run only AFTER updating the existing deployment to the identity-aware version.
function initializeReadableNames() {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    botRegistryCache_ = null;
    var preview = previewReadableNames();
    preview.forEach(function(item) { botRegisterSheet_(item.chatId, SpreadSheet.getSheetById(item.sheetId)); });
    preview.forEach(function(item) { botSyncNameUnlocked_(item.chatId); });
    previewReadableNames();
  } finally {
    SpreadsheetApp.flush();
    lock.releaseLock();
  }
}

// Installable triggers run with the owner's Drive authorization, unlike simple onEdit.
// No messages are sent. Edits outside A3 and ordinary row changes do no work.
function backupBotNameEdited(event) {
  if (!event || !event.range || !event.source || event.source.getId() !== SpreadSheet.getId()) return;
  var range = event.range;
  if (range.getRow() > 3 || range.getLastRow() < 3 || range.getColumn() > 1) return;
  var chatId = botChatId_(range.getSheet());
  if (chatId && botRegistry_()[chatId]) botRename_(chatId, range.getSheet().getRange(3, 1).getValue());
}

function backupBotNameChanged(event) {
  if (!event || !event.source || event.source.getId() !== SpreadSheet.getId()) return;
  if (event.changeType !== 'OTHER') return;
  syncReadableNames();
}

function syncReadableNames() {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    botRegistryCache_ = null;
    var registry = botRegistry_();
    Object.keys(registry).forEach(function(chatId) {
      var sheet = botSheet_(chatId);
      var record = registry[chatId];
      if (sheet.getName() !== record.lastName || String(sheet.getRange(3, 1).getValue()).trim() !== record.lastName || record.pendingName) {
        botSyncNameUnlocked_(chatId);
      }
    });
  } finally {
    SpreadsheetApp.flush();
    lock.releaseLock();
  }
}

function installReadableNameSync() {
  var triggers = ScriptApp.getProjectTriggers();
  [
    {name: 'backupBotNameEdited', type: ScriptApp.EventType.ON_EDIT},
    {name: 'backupBotNameChanged', type: ScriptApp.EventType.ON_CHANGE}
  ].forEach(function(spec) {
    var exists = triggers.some(function(trigger) {
      return trigger.getHandlerFunction() === spec.name && trigger.getEventType() === spec.type && trigger.getTriggerSourceId() === SpreadSheet.getId();
    });
    if (!exists) {
      var builder = ScriptApp.newTrigger(spec.name).forSpreadsheet(SpreadSheet);
      if (spec.type === ScriptApp.EventType.ON_EDIT) builder.onEdit().create();
      else builder.onChange().create();
    }
  });
  console.log('Name synchronization installed. Existing reminder triggers were not changed.');
}
