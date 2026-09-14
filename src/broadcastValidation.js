// Read-only message-schema validation. This endpoint does NOT send a message.
function validateBroadcastMenu() {
  var messages = broadCast_flexing(plainMsg(['各群組最近留言彙整如下⬇️','廣播選單格式驗證','請選擇👉🏻在哪廣播?']), administrator_id, true);
  var current = botValidateBroadcastMessages_(messages);
  var numericBefore, numericAfter;
  if (messages[1] && messages[1].contents && messages[1].contents.contents.length) {
    // Reproduce the numeric-label defect only in a local payload copy, never in a sheet.
    var regression = JSON.parse(JSON.stringify(messages));
    regression[1].contents.contents[0].header.contents[0].text = 914;
    numericBefore = botValidateBroadcastMessages_(regression);
    regression[1].contents.contents[0].header.contents[0].text = botMenuText_(914);
    numericAfter = botValidateBroadcastMessages_(regression);
  }
  var result = {status:current.status, current:current, numericBefore:numericBefore, numericAfter:numericAfter, sentMessages:0, changedSheetData:false};
  console.log(JSON.stringify(result));
  return result;
}

function botValidateBroadcastMessages_(messages) {
  var response = UrlFetchApp.fetch('https://api.line.me/v2/bot/message/validate/reply', {
    method:'post', contentType:'application/json',
    headers:{Authorization:'Bearer ' + learnBot_CHANNEL_ACCESS_TOKEN},
    payload:JSON.stringify({messages:messages}), muteHttpExceptions:true
  });
  return {status:response.getResponseCode(), response:response.getContentText()};
}

// Read-only checks for message quota and the current pending broadcast payload.
// Never retries, resets a draft, sends a message, or changes sheet data.
function inspectLineDelivery() {
  function query(path, messages) {
    var options = {method:messages ? 'post':'get', headers:{Authorization:'Bearer '+learnBot_CHANNEL_ACCESS_TOKEN}, muteHttpExceptions:true};
    if (messages) { options.contentType='application/json'; options.payload=JSON.stringify({messages:messages}); }
    var response=UrlFetchApp.fetch('https://api.line.me/v2/bot/message/'+path,options);
    return {status:response.getResponseCode(),response:response.getContentText()};
  }
  var result={quota:query('quota'),consumption:query('quota/consumption'),drafts:[],sentMessages:0,changedSheetData:false};
  var prefix='backupBot.operation.v1.'+SpreadSheet.getId()+'.';
  var properties=PropertiesService.getScriptProperties().getProperties();
  Object.keys(properties).filter(function(key){return key.indexOf(prefix)===0 && /\.broadcast$/.test(key);}).forEach(function(key){
    var chatId=key.slice(prefix.length).split('.')[0];
    var state=JSON.parse(properties[key]);
    if (!state.rows || !state.rows.length || !botIsChatId_(chatId)) return;
    var draft={sourceName:botSheet_(chatId).getName(),targetName:botSheet_(state.target).getName(),status:state.status,rowCount:state.rows.length};
    try {
      var messages=botBuildBroadcastMessages_(chatId,0,0,state.rows);
      draft.validation=query('validate/push',messages);
      draft.messageTypes=messages.map(function(message){return message.type;});
    } catch(error) {draft.error=String(error.message||error);}
    result.drafts.push(draft);
  });
  result.recentMedia=[];
  var source=botSheet_(learningBotCenter_id);
  if (source) {
    var last=botLastContentRow_(source);
    for (var row=last; row>=Math.max(9,last-20) && result.recentMedia.length<4; row--) {
      var type=String(source.getRange(row,9).getValue());
      if (['image','sticker','video','audio','file'].indexOf(type)===-1) continue;
      var item={row:row,type:type};
      try {
        var message=botBuildBroadcastMessages_(learningBotCenter_id,0,0,[row])[0];
        item.validation=query('validate/push',[message]);
        if (type==='sticker') item.sticker={packageId:message.packageId,stickerId:message.stickerId,
          storedHasQuoteToken:!!JSON.parse(readSheettoValue(learningBotCenter_id,row,paraContent_cNum)).quoteToken,
          outboundHasQuoteToken:!!message.quoteToken};
        if (type==='image') {
          // Inspect anonymous accessibility without changing Drive sharing settings.
          item.mediaAccess=['originalContentUrl','previewImageUrl'].map(function(field){
            var response=UrlFetchApp.fetch(message[field],{muteHttpExceptions:true,followRedirects:true});
            var headers=response.getAllHeaders();
            return {field:field,status:response.getResponseCode(),contentType:headers['Content-Type']||headers['content-type']||'',bytes:response.getBlob().getBytes().length};
          });
        }
      }
      catch(error) {item.error=String(error.message||error);}
      result.recentMedia.push(item);
    }
  }
  console.log(JSON.stringify(result));
  return result;
}

// Manual read-only audit. No content is logged and no LINE messages are sent.
function inspectForwarding() {
  var summaries=SpreadSheet.getSheets().filter(function(sheet){return !!botChatId_(sheet);}).map(function(sheet){
    var last=botLastContentRow_(sheet), recent=[];
    for (var row=last;row>=Math.max(9,last-4);row--) {
      var values=sheet.getRange(row,5,1,9).getValues()[0];
      recent.push({row:row,type:values[4],authorIsAdministrator:values[1]===administrator_id,forwardingStatus:values[0],backupStatus:values[8],time:String(values[3])});
    }
    return {name:sheet.getName(),monitorTime:sheet.getRange(5,1).getValue(),recent:recent};
  });
  var result={sheets:summaries,sentMessages:0,changedSheetData:false};
  console.log(JSON.stringify(result));
  return result;
}
