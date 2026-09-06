function getFileMenu(reply_token,logsheetname){
  var header = {
    'Content-Type': 'application/json; charset=UTF-8',
    'Authorization': 'Bearer ' + learnBot_CHANNEL_ACCESS_TOKEN,
  }
  all=[]
  
  var myData1=JSON.stringify({'id':4,'fid':1,'thsheet':logsheetname});
  var myData2=JSON.stringify({'id':4,'fid':2,'thsheet':logsheetname});
  var myData3=JSON.stringify({'id':4,'fid':3,'thsheet':logsheetname});
  var myData4=JSON.stringify({'id':4,'fid':4,'thsheet':logsheetname});
  
filelist_bu={
    "type": "flex",
    "altText": "（即時訊息）",
    "contents":{
  "type": "bubble",
  "size": "kilo",
  "header": {
    "type": "box",
    "layout": "vertical",
    "contents": [
      {
        "type": "text",
        "text": "選擇檔案格式",
        "size": "lg",
        "align": "center"
      }
    ]
  },
  "hero": {
    "type": "box",
    "layout": "vertical",
    "contents": [
      {
        "type": "text",
        "text": "選擇檔案類型以瀏覽上傳檔案",
        "size": "md",
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
        "text": "圖檔",
        "align": "center",
        "action": {
          "type": "postback",
          "label": "action",
          "data": `${myData1}`,
          "displayText": "取出圖檔..."
        },
        "color": "#990000"
      },
      {
        "type": "text",
        "text": "音訊",
        "align": "center",
        "action": {
          "type": "postback",
          "label": "action",
          "data": `${myData2}`,
          "displayText": "取出音訊..."
        },
        "color": "#009900"
      },
      {
        "type": "text",
        "text": "影片",
        "align": "center",
        "action": {
          "type": "postback",
          "label": "action",
          "data": `${myData3}`,
          "displayText": "取出影片..."
        },
        "color": "#000099"
      },
      {
        "type": "text",
        "text": "其他附件(PDF, WORD..)",
        "align": "center",
        "action": {
          "type": "postback",
          "label": "action",
          "data": `${myData4}`,
          "displayText": "取出其他附件..."
        }
      }
    ]
  }
}
  }


/*
  filelist_bu={
    "type": "template",
    "altText": "選擇檔案格式",
    "template": {
      "type": "buttons",
      "imageAspectRatio": "rectangle",
      "imageSize": "cover",
      "imageBackgroundColor": "#FFFFFF",
      "title": "選擇檔案格式",
      "text": "選擇附件類型以瀏覽上傳檔案。",
      "actions": [
        {
          "type": "postback",
          "label": "圖檔",
          "data": `${myData1}`,
        "displayText": "取出圖檔.."
        }, {
        "type": "postback",
        "label": "音訊",
        "data": `${myData2}`,
        "displayText": "取出音訊.."
        
        },{
        "type": "postback",
        "label": "影片",
        "data": `${myData3}`,
        "displayText": "取出影片.."
        
        },{
        "type": "postback",
        "label": "其他附件(PDF, WORD..)",
        "data": `${myData4}`,
        "displayText": "取出ＰＤＦ或其他.."
        
        }
      ]
    }
  }
  */

  all.push(filelist_bu)
  
  var payload = {
    'replyToken': reply_token,
    'messages' :   all
    
  }
  
  var options = {
    'headers': header,
    'method': 'post',
    'payload': JSON.stringify(payload),
    'muteHttpExceptions':true
  }
  
  UrlFetchApp.fetch(line_reply_url , options);
}



function getbrowsing(serId,reply_token,logsheetname){
  
  
  var wishlist_sheet=SpreadSheet.getSheetByName(logsheetname)
  
  
  switch(serId){
    case 1:
      serItem="image"
      serItemstr="圖檔"
      break;
      
    case 2:
      serItem="audio"
      serItemstr="音訊"
      break;
      
    case 3:
      serItem="video"
      serItemstr="影片"
      break;
    case 4:
      serItem="file"
      serItemstr="PDF或其他附件"
      break;
      
  }
  
  a="搜尋檔案結果："
  b="格式📎："+serItemstr
  myValue=[]
  myValue.push(a)
  myValue.push(b)
  var all=plainMsg(myValue)
  
  var textFinder = wishlist_sheet.createTextFinder(serItem).findAll();
  
  if (textFinder.length===0){
    a="沒有"+serItemstr+"檔案。"
    str=[]
    str.push(a)
    return short_reply(reply_token,str);
    
  }else{
    var qq=false;
    for (var i=0;i<textFinder.length;i++){
      
      th_c=textFinder[i].getColumn()
      
      if (th_c===type_cNum){
        qq=true
        break;}
      
    }
    if (qq===false){
      a="沒有"+serItemstr+"檔案。"
      str=[]
      str.push(a)
      return short_reply(reply_token,str);
    }
    
  }
  
  var ori={
    "type": "flex",
    "altText": "（即時訊息）",
    "contents":{
      "type": "carousel",
      "contents": [
        
      ]
    }
  }
  
  var format={
    "type": "bubble",
    "size": "kilo",
    "header": {
      "type": "box",
      "layout": "horizontal",
      "contents": [
        {
          "type": "text",
          "text": serItemstr,
          "weight": "regular",
          "align": "center",
          "size": "lg",
          "wrap": true
        }
      ],
      "backgroundColor": "#FFD700"
    },
    "hero": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "text",
          "text": "page",//format.hero.contents[0].text
          "align": "center",
          "color": "#000000"
        }
      ],
      "backgroundColor": "#FFFFE0"
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
    "styles": {
      "header": {
        "separator": true,
        "separatorColor": "#000000",
      },
      "hero": {
        "separator": true,
        "separatorColor": "#000000",
        
      },
      "body": {
        "backgroundColor": "#FFE4B5",
        "separatorColor": "#000000",
        "separator": true
      }
    },
    
    
  }
  
  var lineCount=7
  var pageNo=1
  for (i=0;i<textFinder.length;i++){
    th_r=textFinder[i].getRow();
    th_c=textFinder[i].getColumn()
    if (th_c!=type_cNum){continue;}
    timeth=wishlist_sheet.getRange(th_r,time_cNum).getValue();
    wishth=wishlist_sheet.getRange(th_r,replyContent_cNum).getValue().toString();
    nickname=wishlist_sheet.getRange(th_r,nicknameII_cNum).getValue();
    myData=JSON.stringify({'id':2,'sheetName':logsheetname,'dataRow':th_r});
    mydisText="取回:\n ("+`${wishth}`+")"
    tt=new Date(timeth);
    tt.setHours(tt.getHours())
    var minTimeString =
        
        ("0" + (tt.getUTCMonth()+1)).slice(-2) + "/" +
          ("0" + tt.getUTCDate()).slice(-2) +"\n"+
            //("0" + (tt.getUTCFullYear())).slice(-2)+ "\n"+
              ("0" + tt.getUTCHours()).slice(-2) + ":" +
                ("0" + tt.getUTCMinutes()).slice(-2) 
                  //("0" + tt.getUTCSeconds()).slice(-2) 
                  temp={
                    
                    "type": "box",
                    "layout": "horizontal",
                    "contents": [
                      {
                        "type": "text",
                        "text": minTimeString,"size": "sm",
                        "wrap": true
                      },
                      {
                        "type": "separator",
                        "color": "#DC143C"
                      },
                      {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [
                          
                      {
                        "type": "text",
                        "text": `👨‍🦲${nickname}`,
                        "wrap": true,
                         "size": "lg","color":"#990000"
                      },
                          {
                            "type": "text",
                          "text":`📎${wishth}`,
                            "wrap": true,
                            "maxLines": 4,
                            "align": "start",
                            "gravity": "center","color":"#000099"
                          }
                        ],
                          "action": {
                          "type": "postback",
                          "label": "action",
                          "data": `${myData}`,
                          "displayText": mydisText
                          },
                        "width": "80%"
                         
                      }
                    ],"margin": "md"
                    
                  };
    
    
    format.hero.contents[0].text="第"+pageNo+"頁";
    format.body.contents.push(temp)
    
    if ( format.body.contents.length % lineCount === 0){
      pageNo++
        ori.contents.contents.push(format)
        var format={
          "type": "bubble",
          "size": "kilo",
          "header": {
            "type": "box",
            "layout": "horizontal",
            "contents": [
              {
                "type": "text",
                "text": serItemstr,
                "weight": "regular",
                "align": "center",
                "size": "lg",
                "wrap": true
              }
            ],
            "backgroundColor": "#FFD700"
          },
          "hero": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "text",
                "text": "page",
                "align": "center",
                "color": "#000000"
              }
            ],
            "backgroundColor": "#FFFFE0"
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
          "styles": {
            "header": {
              "separator": true,
              "separatorColor": "#000000",
            },
            "hero": {
              "separator": true,
              "separatorColor": "#000000",
            },
            "body": {
              "backgroundColor": "#FFE4B5",
              "separatorColor": "#191970",
              "separator": true
            }
          },
          
          
        }
        }
    
    
  }
  if ( format.body.contents.length % lineCount != 0){ori.contents.contents.push(format)};
  all.push(ori)
  
  
  var header = {
    'Content-Type': 'application/json; charset=UTF-8',
    'Authorization': 'Bearer ' + learnBot_CHANNEL_ACCESS_TOKEN,
  }
  
  
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



function plainMsg(myValue){
  re=[]
  
  for (i=0;i<myValue.length;i++){
    
    if (i===4 & myValue.length>=6){
      temp="(資料過多，後面無法顯示...)"
      retMsg = {
        'type': 'text',
        'text': myValue[i]+"(資料過多，後面無法顯示...)",
        /*"sender": {
        "name": "SysInfo",
        "iconUrl": helpIconurl
        }*/
        
      };
      re.push(retMsg)
      break
    }else{
      retMsg = {
        'type': 'text',
        'text': myValue[i],
        /*
        "sender": {
        "name": "SysInfo",
        "iconUrl": helpIconurl
        }*/
      };
      re.push(retMsg)
      
      
    }
  }
  
  
  
  return re
}

function getUsername(userId) {
  var url = 'https://api.line.me/v2/bot/profile/' + userId;
  var response = UrlFetchApp.fetch(url, {
    'headers': {
      'Authorization': 'Bearer ' + learnBot_CHANNEL_ACCESS_TOKEN,
    },
    'muteHttpExceptions':true
  });
  var gotName="(未加入好友)"
  var  gotName=JSON.parse(response.getContentText()).displayName
  if (!gotName){gotName="(未加入好友)"}
  
  return(gotName);
}


function getPushNum() {
  var url = 'https://api.line.me/v2/bot/message/quota/consumption';
  var response = UrlFetchApp.fetch(url, {
    'headers': {
      'Authorization': 'Bearer ' + learnBot_CHANNEL_ACCESS_TOKEN,
    },
    'muteHttpExceptions':true
  });
  var gotName="(未加入好友)"
  var  gotName=parseInt(JSON.parse(response.getContentText()).totalUsage)
  if (!gotName & gotName!=0){gotName="(未加入好友)"}
  return(gotName);
}

function onClass(mo){
  
  var classB=new Date("2023/02/01 12:00:00")
  var classE=new Date("2030/12/31 12:00:00")
  
  nowT=new Date()
  
  if (nowT<classB){
    ss="尚未開始課堂。"
  }else if (nowT>classE){
    ss="課堂已經結束。"
  }else{
    ss="課堂進行中"
  }
  
  return ss
}



function confirm_previous_opr(myValue,logsheetname){
  sheet=SpreadSheet.getSheetByName(logsheetname)
  
  opr=readSheettoValue(logsheetname,sheet.getLastRow()-1,replyContent_cNum)
  
  if (opr===myValue){
    return true
    
  }else{
    
    
    return false
    
    
  }
}

function rowOf(mylogsheetname,cNum){
  var sheet=SpreadSheet.getSheetByName(mylogsheetname)
  var column = sheet.getRange(1,cNum,sheet.getLastRow()).getValues();
  var wri_row_num=column.valueOf().toString().split(",").indexOf("");
  return(wri_row_num);
}

function changeName(mylogsheetname,myUserId){
  sheet=SpreadSheet.getSheetByName(mylogsheetname)
  column = sheet.getRange(1,useridI_cNum,sheet.getLastRow()).getValues();
  
  for (var i = 0; i < column.length; i++){
    if (column[i][0] === myUserId) {
      foundIndex = parseInt(i);
      return(foundIndex+1)
      break;
    }
  }
}

function admin_check(host_id,user_id){
  if (user_id===host_id | user_id===administrator_id){
    return true;
  }else{
    return false
    
  }
  // readSheettoValue(logsheetname,host_rNum,host_cNum)
}


function findname(mylogsheetname,myUserId){
  
  var sheet=SpreadSheet.getSheetByName(mylogsheetname)
  var column = sheet.getRange(1,useridI_cNum,sheet.getLastRow()).getValues();
  var foundIndex;
  for (var i = 0; i < column.length; i++){
    var myfindname="";
    if (column[i][0] === myUserId) {
      foundIndex = parseInt(i);
      //myfindname=sheet.getRange(foundIndex+1,nicknameI_cNum).getValues()[0];
      myfindname =  readSheettoValue(mylogsheetname,foundIndex+1,nicknameI_cNum).toString()
      break;
    }else if (column[i][0] === ""){
      break;
    }
  }
  return (myfindname);
}

function writetoSheet(mylogsheetname,myrang_r,myrang_c, myvalue){
  SpreadSheet.getSheetByName(mylogsheetname).getRange(myrang_r,myrang_c).setValue(myvalue);
  
}

function readSheettoValue(mylogsheetname,myrang_r,myrang_c){
  return(SpreadSheet.getSheetByName(mylogsheetname).getRange(myrang_r,myrang_c).getValue());
}


function checkSheetExist(logsheetname,user_id) {
  
  var sheetExist = SpreadSheet.getSheetByName(logsheetname);
  if (!sheetExist) {
    var templateSheet = SpreadSheet.getSheetByName('templet');
    var newS = SpreadSheet.insertSheet(1, {template: templateSheet});
    SpreadSheet.renameActiveSheet(logsheetname);
    SpreadSheet.setActiveSheet(newS) 
    var newfolder = GoogleDrive.getFolderById(destinationFolderID).createFolder(logsheetname);
    var newUploadFolder_id = newfolder.getId();
    writetoSheet(logsheetname,uploadFolder_rNum,host_cNum, newUploadFolder_id)
    tempRoomName=roomIcon[getRoomRandom()]+logsheetname.slice(0, 5)
    if (logsheetname===administrator_id){
      tempRoomName="📺Dashboard®️"
      writetoSheet(logsheetname,monitorTime_rNum,host_cNum, -1)
    }
    if (logsheetname===learningBotCenter_id){
      tempRoomName="📺learningBotCenter®️"
      writetoSheet(logsheetname,monitorTime_rNum,host_cNum, -1)
    }
    writetoSheet(logsheetname,roomNameLable_rNum,host_cNum, tempRoomName)
    writetoSheet(logsheetname,host_rNum,host_cNum, user_id)
  }
}


function getRoomRandom(){
  max=roomIcon.length
  k=parseInt(Math.floor(Math.random()*(max)));
  return k
  
};