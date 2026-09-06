function broadCast_detailed(th_logsheetnam,rth,d_timeStamp,d_nickname,d_type,d_content,dataCount,bbb){
  
  //完整一筆（開頭）
  if (rth!=0){
    rth=rth-8 //dataCount-bbb
    
    if (d_type==="text"){
      var myC="#000000"
      var myData=" "
      var mydisText=" "
      }else{
        var myC="#000099"
        var myData=JSON.stringify({'id':2,'sheetName':th_logsheetnam,'dataRow':rth+8});
        var mydisText="取回:\n ("+`${d_content}`+")"
      }
    
    record_list=[
      
      
      {
        "type": "box",
        "layout": "vertical",
        "contents": [
          
          {
            "type": "text",
            "text": `${rth}`, //第幾筆
          "size": "sm",
          "color": "#000000",
          "align": "center"
          
          }
        ],
        "width": "20%",
        "backgroundColor": "#00000030"
      }
      
      ,{
        "type": "separator",
        "color": "#000000"
      }
      ,{
        "type": "box",
        "layout": "horizontal",
        "contents": [
          {
            "type": "text",
            "align": "center",
            "text": `${d_timeStamp}`, //時間戳記
          "size": "xs"
          }
        ],
        "backgroundColor": "#00000010"
      }
      ,{
        "type": "separator",
        "color": "#000000"
      }
      ,{
        "type": "box",
        "layout": "horizontal",
        "contents": [
          {
            "type": "text",
            "text": `${d_nickname}`, //姓名
          "align": "center"
          },
          {
          "type": "separator",
          "color": "#000000"
          },
          {
          "type": "text",
          "text": `${d_type}`,  //訊息格式
          "align": "center"
          }
        ]
      }
      ,
      {
        "type": "separator",
        "color": "#000000"
      }
      /*{
      "type": "text",
      "text": `${d_content}`, //訊息內容
      "wrap": true,
      "maxLines": 3,
      "size": "sm"
      }*/
      ,{
        "type": "text",
        "contents": [
          {
            "type": "span",
            "text": `${d_content}`
          }
        ],
        "action": {
          "type": "postback",
          "label": "action",
          "data": `${myData}`,
        "displayText": mydisText
      },
      "color": myC,
      "wrap": true,
      "maxLines": 3,
      "size": "sm"
      }
      ,{
      "type": "separator",
      "color": "#000000"
      },
      {
      "type": "separator",
      "margin": "md"
      }
      
    ]
    
    //完整一筆（結尾）
    
  }else{
    record_list=[
      {
        "type": "box",
        "layout": "vertical",
        "contents": [
          
          {
            "type": "text",
            "text": "0", //第幾筆
            "size": "sm",
            "color": "#000000",
            "align": "center"
            
          }
        ],
        "width": "20%",
        "backgroundColor": "#00000030"
      }
      
      ,{
        "type": "separator",
        "color": "#000000"
      }
      ,{
        "type": "box",
        "layout": "horizontal",
        "contents": [
          {
            "type": "text",
            "align": "center",
            "text": "（無資料）", //時間戳記
            "size": "xs"
          }
        ],
        "backgroundColor": "#00000010"
      }
    ]
  }
  return record_list
}
var GoogleDrive = DriveApp;

function sendBroadCast(logsheetname,broadCast_id,start_Row,end_Row,reply_token){
  var allMsg=[]
  for (var i=start_Row+1;i<=end_Row;i++){
    var mes_type=readSheettoValue(logsheetname,i,type_cNum)
    var retMsg;
    switch(mes_type)
    {
      case 'text':
        var replyContent=readSheettoValue(logsheetname,i,replyContent_cNum)
        retMsg = {
          'type': mes_type,
          'text': replyContent
        };
        break;
        
      case 'file':
        var fileName=readSheettoValue(logsheetname,i,replyContent_cNum)
        
        var dlURL= GoogleDrive.getFilesByName(fileName).next().getDownloadUrl();
        
        retMsg={
          "type": "flex",
          "altText": "（連結檔案）",
          "contents": {
            "type": "bubble",
            "hero": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": "點選下載",
                  "align": "center"
                }
              ]
            },
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": fileName,
                  "action": {
                    "type": "uri",
                    "label": "action",
                    "uri": dlURL
                  },
                  "color": "#000099",
                  "wrap": true
                }
              ]
            },
            "styles": {
              "hero": {
                "backgroundColor": "#50505060"
              }
            }
          }
        }
        
        break;
        
      case 'image':
        var fileName=readSheettoValue(logsheetname,i,replyContent_cNum)
        var filepara=readSheettoValue(logsheetname,i,paraContent_cNum)
        var dlURL= GoogleDrive.getFilesByName(fileName).next().getDownloadUrl();
        retMsg = {
          'type': mes_type,
          'originalContentUrl': dlURL,
          'previewImageUrl': getThumbnailURL(filepara) //"https://i1.wp.com/120.127.161.35/gzliaoroot/wp-content/uploads/2018/09/cropped-IMG_0019-e1538468935142-2.jpg?zoom=2&fit=169%2C162"
        };
        break;
        
      case 'video':
        var fileName=readSheettoValue(logsheetname,i,replyContent_cNum)
        var filepara=readSheettoValue(logsheetname,i,paraContent_cNum)
        var dlURL= GoogleDrive.getFilesByName(fileName).next().getDownloadUrl();
        
        retMsg = {
          "type": mes_type,
          "originalContentUrl": dlURL ,
          "previewImageUrl": getThumbnailURL(filepara) // Public edition: use a file ID from your own Drive.
        };
        break;
        
      case 'audio':
        
        var fileName=readSheettoValue(logsheetname,i,replyContent_cNum)
        var dlURL= GoogleDrive.getFilesByName(fileName).next().getDownloadUrl();
        var  audio_duration=fileName.slice(0,fileName.indexOf("_"))
        retMsg = {
          "type": mes_type,
          "originalContentUrl": dlURL,
          "duration": audio_duration    
        };
        break;
        
      case 'sticker':
        var fileName=readSheettoValue(logsheetname,i,paraContent_cNum)
        retMsg = JSON.parse(fileName);
        break;
      case 'location':
        var fileName=readSheettoValue(logsheetname,i,paraContent_cNum)
        var myLink=JSON.parse(fileName);
        myLink.title="座標位置：";
        
        retMsg = myLink;
        break;
        
        
    }
    
    allMsg.push(retMsg);
    
  }
  var header = {
    'Content-Type': 'application/json; charset=UTF-8',
    'Authorization': 'Bearer ' + learnBot_CHANNEL_ACCESS_TOKEN,
  }
  
  var payload = {
    'to': broadCast_id,
    'messages' :  allMsg
    
  }
  
  var options = {
    'headers': header,
    'method': 'get',
    'payload': JSON.stringify(payload),
    'muteHttpExceptions':true
  }
  
  var response= UrlFetchApp.fetch(line_push_url , options);
  var result=response.getContentText()
  
  if (result==="{}"){
    str=["已完成送出。"]
    short_reply(reply_token,str);
    
    
  }else{
    
    str=["送出過久，廣播失敗。"]
    short_reply(reply_token,str);
  }
}


function broadCast_summary(logsheetname,end_row,reply_token){
  var sheet_th = SpreadSheet.getSheetByName(logsheetname);
  var start_row=parseInt(readSheettoValue(logsheetname,broadCast_strart_rNum,host_cNum))
  temp=readSheettoValue(logsheetname,start_row,replyContent_cNum)
  temp1=temp.slice(temp.indexOf("➡️")+1,temp.length);
  roomLable=temp1.slice(0,temp1.indexOf("#"));
  sheetIndex=parseInt(temp1.slice(temp1.indexOf("#")+1, temp1.length))
  temp2="廣播至"+roomLable+"(💾="+sheetIndex+")?"
  
  
  Brange=end_row-start_row-1
  if (Brange>=5){Brange=5}
  all=["確認將廣播的訊息？"]
  //all.push(temp2)
  //temp=.slice(reply_mes_content.indexOf("➡️")+1,reply_mes_content.length);
  check_str=""
  for (var i=start_row+1;i<=start_row+Brange;i++){
    replyContent_temp=readSheettoValue(logsheetname,i,replyContent_cNum)
    type_temp=readSheettoValue(logsheetname,i,type_cNum)
    //para_temp=readSheettoValue(logsheetname,i,paraContent_cNum)
    if (type_temp==="text"){
      check_str=check_str+"✏️1句("+replyContent_temp+")\n"
    }else{
      check_str=check_str+"📌1個"+type_temp+"格式\n"
      
    }
    
    
  }
  check_str=check_str.substring(0, check_str.length-1)
  all.push(check_str)
  writetoSheet(logsheetname,broadCast_strart_rNum,host_cNum, "--")
  if (check_str===""){
    all=["取消廣播"]
    writetoSheet(logsheetname,broadCast_strart_rNum+1,host_cNum, "--")
    short_reply(reply_token,all)
  }else{
    writetoSheet(logsheetname,broadCast_strart_rNum+1,host_cNum, sheetIndex+"#"+start_row+"-"+parseInt(start_row+Brange))
    confirm_broadCast(reply_token,all,temp2)
  }
  //writetoSheet(logsheetname,broadCast_strart_rNum,host_cNum, "--")
}

function confirm_broadCast(reply_token,myValue,temp2){
  var header = {
    'Content-Type': 'application/json; charset=UTF-8',
    'Authorization': 'Bearer ' + learnBot_CHANNEL_ACCESS_TOKEN,
  }
  temp1=plainMsg(myValue);
  confirm_bu={
    "type": "template",
    "altText": "確認廣播訊息？",
    "template": {
      "type": "confirm",
      "text": temp2,
      "actions": [
        {
          "type": "message",
          "label": "確定",
          "text": "//傳送廣播訊息"
        },
        {
          "type": "message",
          "label": "取消",
          "text": "//取消廣播"
        }
      ]
    }
  }
  temp1.push(confirm_bu)
  var payload = {
    'replyToken': reply_token,
    'messages' :   temp1
    
  }
  
  var options = {
    'headers': header,
    'method': 'post',
    'payload': JSON.stringify(payload),
    'muteHttpExceptions':true
  }
  
  UrlFetchApp.fetch(line_reply_url , options);
}

function  browsing_flexing(sheetIndex,reply_token){
  q=["留言彙整如下："]
  var all=plainMsg(q)
  var sheets = SpreadSheet.getSheets();
  
  var ori={
    "type": "flex",
    "altText": "（即時訊息）",
    "contents":{
      "type": "carousel",
      "contents": [
        
      ]
    }
  }
  
  var shth=sheetIndex-1
  var th_logsheetnam=sheets[shth].getName()
  var id_temp=readSheettoValue(th_logsheetnam,trigger_rNum,trigger_cNum)
  var sheet_th_lastRow=sheets[shth].getLastRow()
  var roomNameLable=readSheettoValue(th_logsheetnam,roomNameLable_rNum,host_cNum)
  learningBotSys_notify("讀取💾="+sheetIndex+roomNameLable)
  var dataCount=readSheettoValue(th_logsheetnam,dataCount_rNum,host_cNum)
  var showNum=3
  
  var i=dataCount;
  var pageNo=1
  while(i>0){
    var th= {
      "type": "bubble",
      "size": "kilo",
      "header": {
        "type": "box",
        "layout": "horizontal",
        "contents": [
          {
            "type": "text",
            "text": roomNameLable,
            "weight": "regular",
            "align": "center",
            "size": "lg",
            "wrap": true
          }
        ]
      },
      "hero": {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "text",
            "text": "💾="+sheetIndex+"(第"+pageNo+"頁)",
            "align": "center",
            "color": "#000000"
          }
        ],
        "backgroundColor": "#10101050"
      },
      "body": {
        "type": "box",
        "layout": "vertical",
        "contents": [
          
          //here
          /*
          {
          "type": "text",
          "text": "000", //第幾筆
          "size": "sm",
          "color": "#000000",
          "align": "center"
          
          }
          */
          //here
        ],
        "backgroundColor": "#00000010"
      },
      
      
    }
    for (var bbb=0;bbb<=showNum;bbb++){
      var rth=sheet_th_lastRow-bbb
      
      var d_timeStamp=readSheettoValue(th_logsheetnam,rth,time_cNum)
      var d_nickname=readSheettoValue(th_logsheetnam,rth,nicknameII_cNum)
      var d_type=readSheettoValue(th_logsheetnam,rth,type_cNum)
      var d_content=readSheettoValue(th_logsheetnam,rth,replyContent_cNum)
      if (d_timeStamp===""){rth=0}
      
      
        var d_list=broadCast_detailed(th_logsheetnam,rth,d_timeStamp,d_nickname,d_type,d_content,dataCount,bbb)
        
        
        for (var j=0;j<d_list.length;j++){
          th.body.contents.push(d_list[j])
        }
        i--;
      
    }
    sheet_th_lastRow=sheet_th_lastRow-(showNum+1)
    bubble_num= ori.contents.contents.length
    
    if (bubble_num>=10){
      learningBotSys_notify("超過10頁。")
      i=0;
    }else{
      ori.contents.contents.push(th)
      pageNo++
    }
  }
  
  learningBotSys_notify("共有"+ori.contents.contents.length+"頁")
  
  all.push(ori)
  
  var header = {
    'Content-Type': 'application/json; charset=UTF-8',
    'Authorization': 'Bearer ' + learnBot_CHANNEL_ACCESS_TOKEN,
  }
  
  
  //memo_option=["各群組最近留言彙整如下⬇️","請選擇👉🏻在哪廣播?"]; //放置提示語，最多四句
  var payload = {
    'replyToken': reply_token,
    'messages' :  all
  }
  
  
  var options = {
    'headers': header,
    'method': 'post',
    'payload': JSON.stringify(payload)
  }
  
  UrlFetchApp.fetch(line_reply_url , options);   
}
function wsw(){
// Historical scratch helper. Use a file ID from your own Drive when experimenting.
  var dlURL= GoogleDrive.getFilesByName("13214003366598.jpg").next().getDownloadUrl() 
  
  Logger.log(dlURL)

}


function retriveFile(logsheetname,dataRow,reply_token){
  var allMsg=[]
  
  var mes_type=readSheettoValue(logsheetname,dataRow,type_cNum)
  var replyContent=readSheettoValue(logsheetname,dataRow,replyContent_cNum)
  str=["📎"+mes_type+"⬇️\n ("+replyContent+")"]
  memo=plainMsg(str)
  allMsg.push(memo[0]);
  
  var retMsg;
  switch(mes_type)
  {
      
    case 'file':
      var fileName=readSheettoValue(logsheetname,dataRow,replyContent_cNum)
      var thfileID=readSheettoValue(logsheetname,dataRow,paraContent_cNum)
      var dlURL= GoogleDrive.getFilesByName(fileName).next().getDownloadUrl();
      //var dlURL= GoogleDrive.getFileById(thfileID).getDownloadUrl();
      retMsg={
        "type": "flex",
        "altText": "（連結檔案）",
        "contents": {
          "type": "bubble",
          "size": "micro",
          "hero": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "text",
                "text": "點選下載",
                "align": "center"
              }
            ]
          },
          "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
        "type": "image",
        "url": getThumbnailURL(thfileID),
        "margin": "none",
        "size": "full",
        //"backgroundColor": "#999999"
      },
              {
                "type": "text",
                "text": fileName,
                "action": {
                  "type": "uri",
                  "label": "action",
                  "uri": dlURL
                },
                "color": "#000099",
                "wrap": true
              }
            ]
          },
          
          "styles": {
            "hero": {
              "backgroundColor": "#50505060"
            }
          }
        }
      }
      
      break;
      
    case 'image':
      var fileName=readSheettoValue(logsheetname,dataRow,replyContent_cNum)
      var filepara=readSheettoValue(logsheetname,dataRow,paraContent_cNum)
      var dlURL= GoogleDrive.getFilesByName(fileName).next().getDownloadUrl();
     //var dlURL= GoogleDrive.getFileById(filepara).getDownloadUrl();

      retMsg = {
        'type': mes_type,
        'originalContentUrl': dlURL,
        'previewImageUrl': getThumbnailURL(filepara)//dlURL,//"https://i1.wp.com/120.127.161.35/gzliaoroot/wp-content/uploads/2018/09/cropped-IMG_0019-e1538468935142-2.jpg?zoom=2&fit=169%2C162"
      };
      break;
      
    case 'video':
      var fileName=readSheettoValue(logsheetname,dataRow,replyContent_cNum)
      var filepara=readSheettoValue(logsheetname,dataRow,paraContent_cNum)
      var dlURL= GoogleDrive.getFilesByName(fileName).next().getDownloadUrl();
      //var dlURL= GoogleDrive.getFileById(filepara).getDownloadUrl();
      retMsg = {
        "type": mes_type,
        "originalContentUrl": dlURL ,
        "previewImageUrl": getThumbnailURL(filepara) // Public edition: use a file ID from your own Drive.
      };
      break;
      
    case 'audio':
      
      var fileName=readSheettoValue(logsheetname,dataRow,replyContent_cNum)
      //var filepara=readSheettoValue(logsheetname,dataRow,paraContent_cNum)
      var dlURL= GoogleDrive.getFilesByName(fileName).next().getDownloadUrl();
       //var dlURL= GoogleDrive.getFileById(filepara).getDownloadUrl();
       
      var  audio_duration=fileName.slice(0,fileName.indexOf("_"))
      retMsg = {
        "type": mes_type,
        "originalContentUrl": dlURL,
        "duration": audio_duration    
      };
      break;
      
    case 'sticker':
      var fileName=readSheettoValue(logsheetname,dataRow,paraContent_cNum)
      retMsg = JSON.parse(fileName);
      break;
    case 'location':
      var fileName=readSheettoValue(logsheetname,dataRow,paraContent_cNum)
      var myLink=JSON.parse(fileName);
      myLink.title="座標位置：";
      
      retMsg = myLink;
      break;
      
      
  }
  
  allMsg.push(retMsg);
  
  
  var header = {
    'Content-Type': 'application/json; charset=UTF-8',
    'Authorization': 'Bearer ' + learnBot_CHANNEL_ACCESS_TOKEN,
  }
  
  var payload = {
    'replyToken': reply_token,
    'messages' :  allMsg
    
  }
  
  var options = {
    'headers': header,
    'method': 'get',
    'payload': JSON.stringify(payload),
    'muteHttpExceptions':true
  }
  
  UrlFetchApp.fetch(line_reply_url , options);
  
  
}


function broadCast_flexing(memo_option){
  
  var sheets = SpreadSheet.getSheets();
  var all=[]
  var ori={
    "type": "flex",
    "altText": "（即時訊息）",
    "contents":{
      "type": "carousel",
      "contents": [
        
      ]
    }
  }
  
  
    all.push(memo_option[0])
 
  for (var i=1; i<sheets.length;i++){
    
    if (sheets[i].getName()===learningBotCenter_id | sheets[i].getName()===administrator_id){continue;}
    var th_logsheetnam=sheets[i].getName()
    var id_temp=readSheettoValue(th_logsheetnam,trigger_rNum,trigger_cNum)
    var sheetIndex=sheets[i].getIndex()
    var sheetId=sheets[i].getSheetId()
    var sheet_th_lastRow=sheets[i].getLastRow()
    var roomNameLable=readSheettoValue(th_logsheetnam,roomNameLable_rNum,host_cNum)
    learningBotSys_notify("讀取💾="+sheetIndex+roomNameLable)
    var dataCount=readSheettoValue(th_logsheetnam,dataCount_rNum,host_cNum)
    var showNum=2
    //if (showNum>dataCount){showNum=dataCount}
    var th= {
      "type": "bubble",
      "size": "kilo",
      "header": {
        "type": "box",
        "layout": "horizontal",
        "contents": [
          {
            "type": "text",
            "text": roomNameLable,
            "weight": "regular",
            "align": "center",
            "size": "lg",
            "wrap": true
          }
        ]
      },
      "hero": {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "text",
            "text": "💾="+sheetIndex,
            "align": "center",
            "color": "#000000"
          }
        ],
        "backgroundColor": "#10101050"
      },
      "body": {
        "type": "box",
        "layout": "vertical",
        "contents": [
          
          //here
          /*
          {
          "type": "text",
          "text": "000", //第幾筆
          "size": "sm",
          "color": "#000000",
          "align": "center"
          
          }*/
          
          //here
        ],
        "backgroundColor": "#00000010"
      },
      
      
      "footer": {
        "type": "box",
        "layout": "vertical",
        "spacing": "sm",
        "backgroundColor": "#30558050",
        "contents": [
          {
            "type": "button",
            "height": "sm",
            "action": {
              "type": "message",
              "label": "在這裡廣播📡",
              "text": "//蒐集廣播訊息 ➡️"+roomNameLable+"#"+sheetIndex
            },
            "style": "link"
          }
        ],
        "flex": 0
      }
    }
    
    for (var bbb=0;bbb<=showNum;bbb++){
      var rth=sheet_th_lastRow-bbb
      var d_timeStamp=readSheettoValue(th_logsheetnam,rth,time_cNum)
      var d_nickname=readSheettoValue(th_logsheetnam,rth,nicknameII_cNum)
      var d_type=readSheettoValue(th_logsheetnam,rth,type_cNum)
      var d_content=readSheettoValue(th_logsheetnam,rth,replyContent_cNum)
      if (d_timeStamp===""){rth=0}
      
      var d_list=broadCast_detailed(th_logsheetnam,rth,d_timeStamp,d_nickname,d_type,d_content,dataCount,bbb)
      for (var j=0;j<d_list.length;j++){
        th.body.contents.push(d_list[j])
      }
      
    }
    
    
    
    bubble_num= ori.contents.contents.length
    if (bubble_num>=10){
      learningBotSys_notify("檔案夾超過10個。")
      var i=sheets.length;
    }else{
      ori.contents.contents.push(th)
    }
    
    
  }
  all.push(ori)
  
  all.push(memo_option[1])
  all.push(memo_option[2])
  
  
  return(all)   
  
}

function fileList_detailed(mode){
  myValue=""
  var sheets = SpreadSheet.getSheets();
  
  all=[]
 
  
  
  order=0
  for (var i=1; i<sheets.length;i++){
    if (sheets[i].getName()===learningBotCenter_id | sheets[i].getName()===administrator_id){continue;}
    var id_temp=readSheettoValue(sheets[i].getName(),trigger_rNum,trigger_cNum)
    order++
      var sheetIndex=sheets[i].getIndex();
    var sheetId=sheets[i].getSheetId();
    var roomNameLable=readSheettoValue(sheets[i].getName(),roomNameLable_rNum,host_cNum);
    var monitorTime=readSheettoValue(sheets[i].getName(),monitorTime_rNum,host_cNum);
    var dataCount=readSheettoValue(sheets[i].getName(),dataCount_rNum,host_cNum);
    var userNums=rowOf(sheets[i].getName(),useridI_cNum);
    learningBotSys_notify("讀取💾="+sheetIndex+roomNameLable);
    var timeStamp=readSheettoValue(sheets[i].getName(),sheets[i].getLastRow(),time_cNum)
    var d_type=readSheettoValue(sheets[i].getName(),sheets[i].getLastRow(),type_cNum)
    var d_content=readSheettoValue(sheets[i].getName(),sheets[i].getLastRow(),replyContent_cNum)
    if (monitorTime===0){
      str="即時轉訊"
      wordColor="#000099"
    }else if (monitorTime <0){
      str="暫停同步"
       wordColor="#990000"
    }else if (monitorTime>=1 & monitorTime<=30){
      str="每"+monitorTime+"分鐘"
      wordColor="#999999"
    }else if (monitorTime>=120 & monitorTime<=720){
      str="每"+monitorTime/60+"小時"
      wordColor="#999999"
    }else if (monitorTime===1440){
      str="每1日"
       wordColor="#999999"
    }
    
    switch(mode){
      case 0:
        kk3a=JSON.stringify({'id':3,'i':i,'m':-1});//暫停
        kk3b=JSON.stringify({'id':3,'i':i,'m':0});//即時
        kk3c=JSON.stringify({'id':3,'i':i,'m':120});//2時
        kk3d=JSON.stringify({'id':3,'i':i,'m':360});//6時
        kk3e=JSON.stringify({'id':3,'i':i,'m':720});//12時
        kk3f=JSON.stringify({'id':3,'i':i,'m':1440});//1日
       
        var format={
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "text",
              "text": "("+order+")"+roomNameLable ,//format.contents[0].text=
               "size": "lg"
            },
            {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                {
                  "type": "text",
                  "text": "💾="+sheetIndex //format.contents[1].contents[0].text=
                },
                {
                  "type": "text",
                  "text": "⌛️="+str,//format.contents[1].contents[1].text=
                  "color": wordColor
                }
              ]
            },
            {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                {
                  "type": "text",
                  "text": "暫停",
                  "action": {
                    "type": "postback",
                    "label": "action",
                    "data": kk3a,
                    "displayText": "設定💾="+sheetIndex+"("+roomNameLable+")"+"\n👉🏻為暫停同步轉訊。"
                  },"color": "#990000", "align": "center"
                }, {
                  "type": "separator",  "color": "#999999"
                },
                {
                  "type": "text",
                  "text": "即時",
                  "action": {
                    "type": "postback",
                    "label": "action",
                    "data": kk3b,
                    "displayText": "設定💾="+sheetIndex+"("+roomNameLable+")"+"\n👉🏻為即時同步轉訊。"
                  },"color": "#000099", "align": "center"
                }, {
                  "type": "separator",  "color": "#999999"
                },
                {
                  "type": "text",
                  "text": "2時",
                  "action": {
                    "type": "postback",
                    "label": "action",
                    "data": kk3c,
                    "displayText": "設定💾="+sheetIndex+"("+roomNameLable+")"+"\n👉🏻為每2小時轉訊。"
                  },"align": "center"
                },
                {
                  "type": "text",
                  "text": "6時",
                  "action": {
                    "type": "postback",
                    "label": "action",
                    "data": kk3d,
                    "displayText": "設定💾="+sheetIndex+"("+roomNameLable+")"+"\n👉🏻為每6小時轉訊。"
                  },"align": "center"
                },
                {
                  "type": "text",
                  "text": "12時",
                  "action": {
                    "type": "postback",
                    "label": "action",
                    "data": kk3e,
                    "displayText": "設定💾="+sheetIndex+"("+roomNameLable+")"+"\n👉🏻為每12小時轉訊。"
                  },"align": "center"
                },
                {
                  "type": "text",
                  "text": "1日",
                  "action": {
                    "type": "postback",
                    "label": "action",
                    "data": kk3f,
                    "displayText": "設定💾="+sheetIndex+"("+roomNameLable+")"+"\n👉🏻為每1日的12-13pm轉訊。"
                  },"align": "center"
                }
              ],
              "backgroundColor": "#00009930"
              
            } ,
            
          ],   "margin": "lg"
        };
        
         
        all.push(format)
        
        break;
        
        
      case 1:
            pa=JSON.stringify({'id':1,'sheetIndex':sheetIndex})
            var format={
            "type": "box",
            "layout": "vertical",
            "contents": [
            {
            "type": "text",
            "text": "("+order+")"+roomNameLable,
            "size": "lg"
            },
            {
            "type": "box",
            "layout": "horizontal",
            "contents": [
            {
            "type": "text",
            "text": "💾="+sheetIndex,
            "size": "sm"
            },
            {
            "type": "text",
            "text": "👤="+(userNums-1),
            "size": "sm"
            }
          ]
        },
            {
              "type": "box",
                "layout": "horizontal",
                  "contents": [
                    {
                      "type": "text",
                      "text": "🏷=️"+dataCount,
                      "size": "sm"
                    },
                    {
                      "type": "text",
                      "text": "⌛️="+str,
                      "color":wordColor,
                      "size": "sm"
                    }
                  ]
            },
              {
                "type": "box",
                  "layout": "horizontal",
                    "contents": [
                      {
                        "type": "text",
                        "text": "📌=️"+d_type,
                        "size": "sm"
                      },
                      {
                        "type": "text",
                        "text": "🧷="+d_content,
                        "size": "sm",
                        "maxLines": 3,
                        "wrap": true
                      }
                    ]
              },
                {
                  "type": "text",
                    "text": "時間戳記："+timeStamp,
                      "size": "xxs",
                       
                },
                  {
                    "type": "box",
                      "layout": "vertical",
                        "contents": [
                          {
                            "type": "text",
                            "text": "瀏覽近期留言",
                            "action": {
                              "type": "postback",
                              "label": "action",
                              "data": `${pa}`,
                            "displayText": "瀏覽💾="+`${sheetIndex}`
                          },
                          
                          "color": "#000099"
                          }
                        ],
                          "backgroundColor": "#00009930"
                  }
        ],   "margin": "lg"
    };
    
   
        all.push(format)
        break;
        
        
        
        
    }
  }
  
  
  if (mode===0){
    //"⌛=-1，為暫停同步轉訊。\n⌛=0，為即時轉訊。\n⌛=1,5,10,15,30，為依時間轉訊。"
        
    kk4={
    "type": "box",
    "layout": "vertical",
    "contents": [
      
     
      {
        "type": "text",
        "text": "目前已♺︎轉訊="+getPushNum()+"次",
         "margin": "sm",   "wrap": true
        
      },
      {
        "type": "text",
        "text": "⌛=-1，為暫停同步轉訊。",
         "margin": "sm"
      },
      {
        "type": "text",
        "text": "⌛=0，為即時轉訊。",
         "margin": "sm"
      },
      {
        "type": "text",
        "text": "⌛=1,5,10,15,30min轉訊。",
        "margin": "sm"
      }
    ],   "margin": "lg"
  }
    
    all.push(kk4)
   
    
  }else if (mode===1){
    kk04={
      "type": "box",
      "layout": "vertical",
      "contents": [
        
        {
          "type": "text",
          "text": "目前已♺︎轉訊="+getPushNum()+"次",
          "margin": "sm",   "wrap": true
          
        },
        
      ],   "margin": "lg"
        }
        all.push(kk04)
        
        
        };
        
  
  
  return all
}


function fileList_flexing(mymessage,memo_option){
  all=[]
  var ori={
      "type": "bubble",
      "body": {
        "type": "box",
        "layout": "vertical",
        "contents":  [
          /*
          {
            "type": "image",
            "url": helpIconurl,
            "align": "start",
            "size": "xs"
          },
          {
            "type": "separator",
            "color": "#000000",
            "margin": "xs"
          },
          {
            "type": "text",
            "text": "(🗂"+helper+"系統資訊)",
            "size": "xl"
            
          }
          */
          //here1
         
          
          
          //here2
          
        ]
      }
  };
  
 
  
  var bigori={
    "type": "flex",
    "altText": "（即時訊息）",
    "contents":{
      "type": "carousel",
      "contents": [
        
      ]
    }
  }
  
 //learningBotSys_notify("all.."+mymessage.length)
  
  for(i=0;i<mymessage.length;i++){
    
    
    ori.body.contents.push(mymessage[i])
   // learningBotSys_notify("mymessage.length.."+ ori.body.contents.length)
    if ( ori.body.contents.length % 3 === 0){
      bigori.contents.contents.push(ori);
      
      var ori={
        "type": "bubble",
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents":  [
            /*
            {
            "type": "image",
            "url": helpIconurl,
            "align": "start",
            "size": "xs"
            },
            {
            "type": "separator",
            "color": "#000000",
            "margin": "xs"
            },
            {
            "type": "text",
            "text": "(🗂"+helper+"系統資訊)",
            "size": "xl"
            
            }
            */
            //here1
            
            
            
            //here2
            
          ]
        }
      };
      
      
    }
    
    
   
   
  }
  
if ( ori.body.contents.length % 3 != 0){bigori.contents.contents.push(ori)};
  
  all.push(bigori)
  
  for(w=0;w<memo_option.length;w++){
    all.push(memo_option[w])
  }
  
  return(all)   
  
}


function menu_flexing(mylogsheetname,host_id,user_id,monitorTime,mynickname){
  if (mynickname==="(未加入好友)"){
    mynickname="😭你還不是我好友？"
  }
  if (mynickname==="(未設定)"){
    mynickname="我不知道你暱稱？"
  }
  temp="--"
  temp1="--"
  if (user_id===administrator_id){
    if (monitorTime===0){
      temp1= "目前♺="+getPushNum()+"次："
      temp="(即時轉訊模式)"
    }else if (monitorTime>0){
      temp1="目前♺="+getPushNum()+"次："
      temp='(每'+monitorTime+'分鐘)'
    }else if (monitorTime<0){
      
      temp1="目前♺="+getPushNum()+"次："
      temp='(暫停同步轉訊)'
    }
    
  }
  var roomNametemp=readSheettoValue(mylogsheetname,roomNameLable_rNum,host_cNum);
  
  ppp=[{
    "type": "flex",
    "altText": "（即時訊息）",
    "contents": {
      "type": "bubble",
      "body": {
        "type": "box",
        "layout": "vertical",
        "contents":  [
          {
            "type": "image",
            "url": helpIconurl,
            "align": "start",
            "size": "xs"
          },
          {
            "type": "separator",
            "color": "#000000",
            "margin": "xs"
          },
          {
            "type": "text",
            "text": `我是${helper}機器人，🤔有人呼叫我？`,
            "size": "md"
          },{
            "type": "separator",
            "color": "#000000"
          },{
            "type": "text",
            "text": mynickname,
            "size": "xl"
          },
          {
            "type": "separator",
            "color": "#000000"
          },
          {
            "type": "box",
            "layout": "horizontal",
            "contents": [
              {
                "type": "text",
                "text": "想要設定暱稱？",
                "size": "md"
              },
              {
                "type": "text",
                "text": "我要反應問題？",
                "size": "md"
              }
            ]
          },
          {
            "type": "box",
            "layout": "horizontal",
            "contents": [
              {
                "type": "text",
                "text": "//我是👤？",
                "color": "#000000"
              },
              {
                "type": "text",
                "text": "//戳戳📜？",
                "color": "#000000"
              }
            ]
          },{
            "type": "separator",
            "color": "#000000"
          },{
            "type": "box",
            "layout": "horizontal",
            "contents": [
              {
                "type": "text",
                "text": "標註群組名稱？",
                "size": "md"
              },
              {
                "type": "text",
                "text": "這裡是：",
                "size": "md"
              }
            ]
          },
          {
            "type": "box",
            "layout": "horizontal",
            "contents": [
              {
                "type": "text",
                "text": "//取名📝",
                "color": "#000000"
              },
              {
                "type": "text",
                "text": roomNametemp,
                "color": "#000000"
              }
            ]
          },{
            "type": "separator",
            "color": "#000000"
          },{
            "type": "box",
            "layout": "horizontal",
            "contents": [
              {
                "type": "text",
                "text": "設定多久轉訊？",
                "size": "md"
              },
              {
                "type": "text",
                "text": temp1,
                "size": "md"
              }
            ]
          },{
            "type": "box",
            "layout": "horizontal",
            "contents": [
              {
                "type": "text",
                "text": "//轉訊💾#⌛️",
                "color": "#000000"
              },
              {
                "type": "text",
                "text": temp,
                "color": "#000000"
              }
            ]
          },{  //開頭
            "type": "separator",
            "color": "#000000"
          },{
            "type": "box",
            "layout": "horizontal",
            "contents": [
              {
                "type": "text",
                "text": "群組內部傳訊？",
                "size": "md"
              },
              {
                "type": "text",
                "text": "顯示系統資訊？",
                "size": "md"
              }
            ]
          },
          {
            "type": "box",
            "layout": "horizontal",
            "contents": [
              {
                "type": "text",
                "text": "//廣播📡",
                "color": "#000000"
              },
              {
                "type": "text",
                "text": "//系統🗂",
                "color": "#000000"
              }
            ]
          },{  //開頭
            "type": "separator",
            "color": "#000000"
          },{
            "type": "box",
            "layout": "horizontal",
            "contents": [
              {
                "type": "text",
                "text": "瀏覽歷程/取回檔案",
                "size": "md",
                "wrap":true
              },
              {
                "type": "text",
                "text": "👉🏻//檔案📦",
                "size": "md", "color": "#990000",
                "wrap": true,
                 "action": {
              "type": "message",
              "label": "action",
              "text": "//檔案"
            }
              }
            ]
            
            
          } //結尾


          
          
        ]
      }
    }
  }]
  return ppp
}




function feedback_flexing(feedback_message){
  ppp=[{
    "type": "flex",
    "altText": "（即時訊息）",
    "contents": {
      "type": "bubble",
      "body": {
        "type": "box",
        "layout": "vertical",
        "contents":  [
          {
            "type": "image",
            "url": helpIconurl,
            "align": "start",
            "size": "xs"
          },
          {
            "type": "separator",
            "color": "#000000",
            "margin": "xs"
          },
          {
            "type": "text",
            "text": "(💪"+helper+"系統訊息)",
            "size": "xl"
            
          },{
            "type": "separator",
            "color": "#000000"
          },{
            "type": "text",
            "text": feedback_message,
            "size": "md",
            "wrap": true
          }
        ]
      }
    }
  }]
  
  
  
  
  return ppp
  
}




function mess_flexing(mylogsheetname,mytime,nickname,reply_mes_type,reply_mes_content){
  roomLable=readSheettoValue(mylogsheetname,roomNameLable_rNum,host_cNum);
  sheetIndex=SpreadSheet.getSheetByName(mylogsheetname).getIndex()
  sheetId=SpreadSheet.getSheetByName(mylogsheetname).getSheetId()
  ppp=[{
    "type": "flex",
    "altText": "（即時訊息）",
    "contents": {
      "type": "bubble",
      "body": {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "text",
            "text": "♺︎第"+parseInt(getPushNum()+1)+"次轉訊。"
          },{
            "type": "separator"
          },{
            "type": "text",
            "text": roomLable
          },{
            "type": "text",
            "text": "🗄id="+sheetId+" 💾index="+sheetIndex
          },{
            "type": "separator"
          },{
            "type": "text",
            "text": "⏰"+mytime
          },{
            "type": "separator"
          },
          {
            "type": "text",
            "text": "💁🏻"+nickname
          },{
            "type": "separator"
          },
          {
            "type": "text",
            "text": '📌['+reply_mes_type+']'
          },{
            "type": "separator"
          },
          {
            "type": "text",
            "text": '\n🧷('+reply_mes_content+")",
            "wrap": true
          }
        ]
      }
    }
  }]
  return ppp
}


function ProcMsg(mes_type,fileName,myLink,audio_duration)
{
  var type = mes_type;
  var retMsg;
  
  switch(type)
  {
    case 'text':
      
      retMsg = {
        'type': type,
        'text': myLink
      };
      break;
      
    case 'file':
      
      retMsg = {
        "type": "flex",
        "altText": "（連結檔案）",
        "contents": {
          "type": "bubble",
          "hero": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "text",
                "text": "點選下載",
                "align": "center"
              }
            ],
            "action": {
              "type": "uri",
              "label": "action",
              "uri": "http://linecorp.com/"
            }
          },
          "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "text",
                "text": fileName,
                "action": {
                  "type": "uri",
                  "label": "action",
                  "uri": myLink
                },
                "color": "#000099",
                "wrap": true
              }
            ]
          },
          "styles": {
            "hero": {
              "backgroundColor": "#50505060"
            }
          }
        }
      }
      
      
      break;
      
    case 'image':
      retMsg = {
        'type': type,
        'originalContentUrl': myLink,
        'previewImageUrl': myLink
      };
      break;
      
    case 'video':
      retMsg = {
        "type": type,
        "originalContentUrl": myLink ,
                        "previewImageUrl": getThumbnailURL(defaultThumbnailFileId)
      };
      break;
      
    case 'audio':
      var audio_duration;
      retMsg = {
        "type": type,
        "originalContentUrl": myLink,
        "duration": audio_duration    
      };
      break;
    case 'sticker':
      retMsg = JSON.parse(myLink);
      break;
    case 'location':
      myLink=JSON.parse(myLink);
      myLink.title="座標位置：";
      
      retMsg = myLink;
      break;
      
  }
  
  return [retMsg];
}

function getFileData(learnBot_CHANNEL_ACCESS_TOKEN, fileID){
  var url = "https://api.line.me/v2/bot/message/" + fileID + "/content";
  
  return UrlFetchApp.fetch(url, {
    'headers': {
      'Authorization': 'Bearer ' + learnBot_CHANNEL_ACCESS_TOKEN,
    },
    'method': 'get',
  });}
