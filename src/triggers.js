


function DeleteTrigger(mylogsheetname){
  //getScriptId() 
  var deleteId=readSheettoValue(mylogsheetname,trigger_rNum,trigger_cNum)
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getUniqueId()===deleteId){
      writetoSheet(mylogsheetname,trigger_rNum,trigger_cNum, "")
      ScriptApp.deleteTrigger(triggers[i]);
    }
    
  }
  
}

function CreatTrigger(mylogsheetname,mymonitorTime){
  DeleteTrigger(mylogsheetname)
  
  if (mymonitorTime>=1 & mymonitorTime<=30){
    var setedTrigger=ScriptApp.newTrigger("show_memory")
    .timeBased()
    .everyMinutes(mymonitorTime)
    .create();
    var myTriggerId=setedTrigger.getUniqueId();
  } else if (mymonitorTime>=120 & mymonitorTime<=720){
    var setedTrigger=ScriptApp.newTrigger("show_memory")
    .timeBased()
    .everyHours(mymonitorTime/60)
    .create();
    var myTriggerId=setedTrigger.getUniqueId();
  } else if (mymonitorTime===1440){
    var setedTrigger=ScriptApp.newTrigger("show_memory")
    .timeBased()
    .atHour(12)//12是12-13pm
    .everyDays(1)
    .create();
    var myTriggerId=setedTrigger.getUniqueId();
    
    
  }
  
  
  
  writetoSheet(mylogsheetname,trigger_rNum,trigger_cNum, myTriggerId)
  
}

function findTriggerId(myTriggerId){
  var triggersheet=SpreadSheet.getSheetByName("Triggers")
  var column = triggersheet.getRange(1,1,triggersheet.getLastRow()).getValues();
  var triIndex;
  for (var i = 0; i < column.length; i++){
    var activeSheetId="";
    if (column[i][0] === myTriggerId) {
      triIndex = parseInt(i);
      activeSheetId =  readSheettoValue("Triggers",triIndex+1,2).toString()
      break;
    }else if (column[i][0] === ""){
      break;
    }
  }
  return(activeSheetId)
}


function show_memory(param){
  if (!notify_CHANNEL_ACCESS_TOKEN) {
    console.log('LINE Notify is not configured; skipped historical reminder.');
    return;
  }
  var active_id=param.triggerUid
  var sheets = SpreadSheet.getSheets();
  var  triTime = new Date();
  for (var i=0; i<sheets.length;i++){
    var id_temp=readSheettoValue(sheets[i].getName(),trigger_rNum,trigger_cNum)
    
    if (id_temp===active_id){
      var active_sheet=sheets[i].getName()
      var sheetIndex=sheets[i].getIndex()
      var roomNameLable=readSheettoValue(sheets[i].getName(),roomNameLable_rNum,host_cNum)
      var monitorTime=  readSheettoValue(sheets[i].getName(),monitorTime_rNum,host_cNum)
      la=sheets[i].getLastRow();
      var nnick=readSheettoValue(sheets[i].getName(),la,nicknameII_cNum)
      var ttype=readSheettoValue(sheets[i].getName(),la,type_cNum)
      var rreply=readSheettoValue(sheets[i].getName(),la,replyContent_cNum)
      var theLastTime= readSheettoValue(sheets[i].getName(),la,time_cNum)
      // triTime.setHours(triTime.getHours()+8);
      var nowtriTime=triTime.toISOString()
      //  triTime.setMinutes(triTime.getMinutes()+monitorTime);
      // var nexttriTime=triTime.toISOString()
      
      break;
    }
  }
  
  
  var time0 = new Date(theLastTime)
  
  
  var TimeString =
      ("0" + time0.getUTCHours()).slice(-2) + ":" +
        ("0" + time0.getUTCMinutes()).slice(-2) +
          "("+ time0.getUTCFullYear() + "-" +
            ("0" + (time0.getUTCMonth()+1)).slice(-2) + "-" +
              ("0" + time0.getUTCDate()).slice(-2) + ")";
  
  
  
  
  time0.setHours(time0.getHours()-8)
  
  
  var time1=new Date()
  var milliseconds = (time1-time0)
  
  hr = 0
  min = 0
  sec = 0 
  day = 0
  while (milliseconds >= 1000) {
    milliseconds = (milliseconds - 1000)
    sec = sec + 1
    if (sec >= 60) {min = min + 1};
    if (sec == 60) {sec = 0};
    if (min >= 60) {hr = hr + 1};
    if (min == 60) {min = 0};
    if (hr >= 24) {
      hr = (hr - 24)
      day = day + 1
    }
  }
  m1="";
  h1="";
  d1="";
  
  if (day!=0){d1=day+"日"};
  if (hr!=0){h1=hr+"時"};
  
  m1=d1+h1+min+"分";
  
  //mess=time1
  
  mess = "\n"+roomNameLable+
    "(💾="+sheetIndex+")"+
      "\n💁🏻="+nnick+
        "\n📌=["+ttype+"]"+
          "\n📎=("+rreply+")"+
            "\n ⏰="+TimeString+
              "\n👉🏻已有"+m1+"沒有更新。";
  
  UrlFetchApp.fetch('https://notify-api.line.me/api/notify', {
    'headers': {
      'Authorization': 'Bearer ' + notify_CHANNEL_ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': {
      'message':mess,
      
    }
  });
  
  
}
