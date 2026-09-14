// The old templet layout is defined as code. This function only initializes NEW sheets.
function botCreateGroupSheet_(chatId) {
  var sheet = SpreadSheet.insertSheet(chatId, SpreadSheet.getSheets().length);
  var rows = sheet.getMaxRows();
  var headers = ['', '觸發器id', '所有userid', '暱稱狀態', '轉訊狀態0,1', 'useridII', 'nicknameII', 'time', 'type', 'ReplyContent', 'ParameterContent', 'MessageId', '備份狀態', '原始事件'];
  if (sheet.getMaxColumns() < headers.length) sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
  sheet.getRange(1, 1, rows, 14).setFontFamily('Arial').setFontSize(10).setVerticalAlignment('middle');
  sheet.getRange(1, 1, 1, 14).setValues([headers]).setFontWeight('bold').setWrap(true).setHorizontalAlignment('center');
  sheet.getRange(1, 1, 1, 11).setBorder(true, true, true, true, true, true);
  sheet.getRange(2, 2, rows - 1, 1).setBackground('#d0e0e3');
  sheet.getRange(1, 3, rows, 2).setBackground('#fce5cd');
  sheet.getRange(1, 5, rows, 1).setBackground('#ffff00');
  sheet.getRange(1, 2).setBackground('#a2c4c9');
  ['#ff9900','#00ff00','#ffe599','#b4a7d6','#ff0000','#00ffff','#d9d9d9','#d9d9d9'].forEach(function(color, index) {
    sheet.getRange(index + 1, 1).setBackground(color);
  });
  sheet.getRange(5, 1, 4, 1).setValues([[0], [0], ['--'], ['--']]);
  sheet.getRange(2, 3, rows - 1, 1).setNumberFormat('@');
  sheet.getRange(9, 6, rows - 8, 9).setNumberFormat('@');
  [190,120,180,130,75,180,130,180,95,420,260,180,180,300].forEach(function(width, i) { sheet.setColumnWidth(i + 1, width); });
  sheet.setRowHeight(1, 42);
  sheet.setFrozenRows(1);
  return sheet;
}

// Read-only preflight: no old rows, sheet names or metadata are changed.
function previewRecordingReadiness() {
  var result = botManagedSheets_().map(function(sheet) {
    var chatId = botChatId_(sheet);
    var folder = botContentFolder_(chatId);
    var last = botLastContentRow_(sheet);
    return {chatId:chatId, sheetId:sheet.getSheetId(), name:sheet.getName(),
      folderId:folder.getId(), folderName:folder.getName(),
      lastContentRow:last, count:sheet.getRange(6,1).getValue(),
      recordHeaders:sheet.getRange(1,12,1,3).getValues()[0]};
  });
  console.log(JSON.stringify(result));
  return result;
}

// Native Sheets integration check, isolated from all production data and LINE.
// Its newly-created test spreadsheet is moved to Trash in finally, not deleted permanently.
function verifyGeneratedSchema() {
  var original = SpreadSheet;
  var test = SpreadsheetApp.create('backupBot_自動版型驗證_' + new Date().toISOString());
  var result;
  try {
    SpreadSheet = test;
    var sheet = botCreateGroupSheet_('schema-test');
    if (sheet.getRange(1,10).getValue() !== 'ReplyContent' || sheet.getRange(1,14).getValue() !== '原始事件') throw new Error('Schema headers differ.');
    if (sheet.getRange(6,1).getValue() !== 0 || botLastContentRow_(sheet) !== 8) throw new Error('New schema is not empty.');
    botPlainCell_(sheet.getRange(9,10), '=SUM(1,2)');
    SpreadsheetApp.flush();
    if (sheet.getRange(9,10).getValue() !== '=SUM(1,2)' || sheet.getRange(9,10).getFormula() !== '') throw new Error('Literal text was interpreted as a formula.');
    result = {schema:'PASS', literalText:'PASS', productionDataChanged:false, testSpreadsheetId:test.getId()};
  } finally {
    SpreadSheet = original;
    DriveApp.getFileById(test.getId()).setTrashed(true);
  }
  console.log(JSON.stringify(result));
  return result;
}
