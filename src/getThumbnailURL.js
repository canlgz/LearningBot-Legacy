
function getThumbnailURL(fileId) {
 // Example: var fileId = 'your-Drive-file-ID';
  var url="https://www.googleapis.com/drive/v2/files/"+fileId
  try{
  var tkn = ScriptApp.getOAuthToken();//Get the OAuth token
  options = {};
  options.headers = {Authorization: 'Bearer ' + tkn}
  options.muteHttpExceptions = true;
  //Logger.log('url-> ' + tkn);

rtrnObj = UrlFetchApp.fetch(url,options)

  if (rtrnObj.getResponseCode() !== 200) { 
       var thumbnailURL="https://i.imgur.com/09DFChO.png"
    }else{
      rtrnObj2=JSON.parse(rtrnObj)
      var thumbnailURL=rtrnObj2.thumbnailLink
  if (!thumbnailURL){var thumbnailURL="https://i.imgur.com/09DFChO.png"}

  }
//Logger.log(thumbnailURL)
//return thumbnailURL

  }catch(e){
  var thumbnailURL="https://i.imgur.com/09DFChO.png"
}
//Logger.log("URL->"+thumbnailURL)
//Logger.log(rtrnObj)
return thumbnailURL

};

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
