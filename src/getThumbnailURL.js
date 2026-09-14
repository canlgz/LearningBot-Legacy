
function botDefaultThumbnail_() { return 'https://i.imgur.com/09DFChO.png'; }

function getThumbnailURL(fileId) {
  if (!fileId) fileId=defaultThumbnailFileId;
  if (!fileId) return botDefaultThumbnail_();
  try {
    var response=UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(fileId)+'?fields=thumbnailLink',{
      headers:{Authorization:'Bearer '+ScriptApp.getOAuthToken()},muteHttpExceptions:true
    });
    return response.getResponseCode()===200 ? (JSON.parse(response.getContentText()).thumbnailLink||botDefaultThumbnail_()) : botDefaultThumbnail_();
  } catch(error) { return botDefaultThumbnail_(); }
}

// Never publish student media automatically. A private file remains an authenticated link.
function botStoredMediaMessage_(file,type,duration) {
  var access=file.getSharingAccess();
  var publicRead=access===DriveApp.Access.ANYONE || access===DriveApp.Access.ANYONE_WITH_LINK;
  if (!publicRead) return {type:'text',text:'已備份：'+file.getName()+'\n此檔案受 Google Drive 權限保護，請使用獲授權的帳號開啟：\n'+file.getUrl()};
  var message={type:type,originalContentUrl:file.getDownloadUrl()};
  if (type==='audio') {
    var ms=Number(duration);
    if (!Number.isFinite(ms)||ms<=0) throw new Error('音訊長度無效，無法建立音訊訊息。');
    message.duration=ms;
  } else message.previewImageUrl=getThumbnailURL(file.getId());
  return message;
}

function getContentsOfTxtFile_(po) {
try{
  var i,options,rtrnObj,selfLink,tkn,url;
  /*
    PASSED IN PARAMETERS
    po.id - the file id of the text file to get
  */
  
  selfLink = 'https://www.googleapis.com/drive/v3/files/' + po.id;
  url = selfLink + '?alt=media';//using alt=media returns the file content instead of the metadata resource

  tkn = ScriptApp.getOAuthToken();//Get the OAuth token

  options = {};
  options.headers = {Authorization: 'Bearer ' + tkn}
  options.muteHttpExceptions = true;

  for (i=1;i<3;i++) {//Only loop twice because sometimes there will legitimately not be a file
  try{
    rtrnObj = UrlFetchApp.fetch(url,options);//Make an external request to get the file content
    break;//If successful break out of the loop
  } catch(e) {
    if (i!==2) {Utilities.sleep(i*1500);}
    if (i>=2) {
      console.log('ERROR getting file content: ' + e + "Stack: " + e.stack)
    }
  };
  }
  
  if (!rtrnObj) {
    return false;
  }
  
  if (rtrnObj.getResponseCode() !== 200) { 
    return false;
  }
  return rtrnObj.getContentText();
}catch(e){
  console.error('Error ' + e)
}
}
