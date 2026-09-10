var GoogleDrive = DriveApp;

function doPost(e) { 
  if (!e || !e.postData || !e.postData.contents) {
    return ContentService.createTextOutput("OK");
  }

  var userData;
  try {
    userData = JSON.parse(e.postData.contents);
  } catch (error) {
    console.error(error);
    return ContentService.createTextOutput("OK");
  }

  if (!userData || !Array.isArray(userData.events) || userData.events.length === 0) {
    return ContentService.createTextOutput("OK");
  }

  var myeventsth = userData.events[0];
  var events_type=myeventsth.type;
  if (events_type==="postback"){
    var myDataa=JSON.parse(myeventsth.postback.data)
    var myid=parseInt(myDataa.id)
    var reply_token=myeventsth.replyToken
    switch (myid){
      case 1:
        var sheetIndex= parseInt(myDataa.sheetIndex)
        
        carouselInfobyPage(reply_token,1,SpreadSheet.getSheets()[sheetIndex-1].getName())
        //browsing_flexing(sheetIndex,reply_token)
        break;
      case 2:
        var mydataRow= myDataa.dataRow
        
        var mysheetName=myDataa.sheetName
        
        retriveFile(mysheetName,mydataRow,reply_token)
        break;    
        
        
      case 3:
        var sheets = SpreadSheet.getSheets();
        var sheetIndex= parseInt(myDataa.i);
        
        var mysheetName=sheets[sheetIndex].getName();
        var mymonitorTime=parseInt(myDataa.m);
        var myroomLable=readSheettoValue(mysheetName,roomNameLable_rNum,host_cNum);
         
        switch (mymonitorTime){
          case 0:
            myValue="更改"+myroomLable+'，為即時同步轉訊。'
            DeleteTrigger(mysheetName);
            break;
          case -1:
            myValue="更改"+myroomLable+'，為暫停同步轉訊。'
            DeleteTrigger(mysheetName);
            break;
          case 120:
            myValue="更改"+myroomLable+'，為每2小時轉訊。'
            CreatTrigger(mysheetName,mymonitorTime)
            break;
          case 360:
            myValue="更改"+myroomLable+'，為每6小時轉訊。'
            CreatTrigger(mysheetName,mymonitorTime)
            break;
          case 720:
            myValue="更改"+myroomLable+'，為每12小時轉訊。'
            CreatTrigger(mysheetName,mymonitorTime)
            break;
          case 1440:
            myValue="更改"+myroomLable+'，為每1日轉訊。'
            CreatTrigger(mysheetName,mymonitorTime)
            break;
            
         
        }
        writetoSheet(mysheetName,monitorTime_rNum,host_cNum, mymonitorTime);
        reply_mode=2
        return reply_message(mysheetName,"","",mymonitorTime,reply_token,reply_mode,myValue);
        break;
        
      case 4:
        var fid= myDataa.fid
        var logsheetname = myDataa.thsheet
        getbrowsing(fid,reply_token,logsheetname)
        break;    
        
      case 7:

        var chat_type = myeventsth.source.type;
        switch(chat_type)
        {
          case 'user':
            var logsheetname=myeventsth.source.userId;
            break;
          case 'room':
            var logsheetname=myeventsth.source.roomId;
            break;
          case 'group':
            var logsheetname=myeventsth.source.groupId;
            break;
        }
        var thlogsheetname = myDataa.thsheet
        tpage=parseInt(myDataa.thpage);
        
         if (tpage==-1){
           var wholepage=parseInt(myDataa.wholepage);
           writetoSheet(logsheetname,1,1,`${wholepage}️,${thlogsheetname}`)
           short_reply(reply_token,["輸入頁碼？"]);
         }else if (tpage==-2){
           writetoSheet(logsheetname,1,1,`-1,${thlogsheetname}`)
           short_reply(reply_token,["輸入搜尋字串？"]);
         }else{
           writetoSheet(logsheetname,1,1,"")
           return carouselInfobyPage(reply_token,tpage,thlogsheetname)
         }

       
        
        //changeThePage(USERID,tpage)
        
        
        break;
        
    case 8:

        var chat_type = myeventsth.source.type;
        switch(chat_type)
        {
          case 'user':
            var logsheetname=myeventsth.source.userId;
            break;
          case 'room':
            var logsheetname=myeventsth.source.roomId;
            break;
          case 'group':
            var logsheetname=myeventsth.source.groupId;
            break;
        }
        var thlogsheetname = myDataa.thsheet
        tpage=parseInt(myDataa.thpage);
        
        serStr=myDataa.serStr
         if (tpage==-1){
           var wholepage=parseInt(myDataa.wholepage);
           writetoSheet(logsheetname,1,1,`${wholepage}️,${thlogsheetname}`)
           short_reply(reply_token,["輸入頁碼？"]);
         }else{
           writetoSheet(logsheetname,1,1,"")
           //return show_searchResult(reply_token,2,thlogsheetname,serStr)
           return carouselInfobySearch(reply_token,thlogsheetname,serStr,tpage)
         }

       
        
        //changeThePage(USERID,tpage)
        
        
        break;
        
    }
  }
  // Postback events have no `message` object. Their actions were handled above.
  if (events_type === "postback") {
    return ContentService.createTextOutput("OK");
  }

  var eventsNum = userData.events.length
  
  
  for (k=0;k<eventsNum;k++){
    var writeSheetData=[];
    var eventsth = userData.events[k];
    // Ignore non-message events such as follow, unfollow, join, and leave.
    if (!eventsth || !eventsth.message) {
      continue;
    }
    var reply_token = eventsth.replyToken;
    var user_id = eventsth.source.userId;
    var events_message= eventsth.message;
    var reply_mes_type = events_message.type;
    
   
    
    var chat_type = eventsth.source.type;
    switch(chat_type)
    {
      case 'user':
        var logsheetname=eventsth.source.userId;
        break;
      case 'room':
        var logsheetname=eventsth.source.roomId;
        break;
      case 'group':
        var logsheetname=eventsth.source.groupId;
        break;
    }
    checkSheetExist(logsheetname,user_id)
    
    var reply_mes_content;
    var command_str='';
    switch(reply_mes_type)
    {
      case 'text': 
        reply_mes_content=eventsth.message.text;
        var command_str=reply_mes_content.slice(0, 4);

         checkJumppage(logsheetname,reply_token,reply_mes_content)

        break;
      case 'image':
        reply_mes_content=eventsth.message.id;
        break;
      case 'video':
        reply_mes_content=eventsth.message.id;
        break;
      case 'file':
        reply_mes_content=eventsth.message.fileName;
        break;
      case 'audio':
        reply_mes_content=eventsth.message.id;
        var audio_duration = eventsth.message.duration;
        break;
      case 'sticker':
        reply_mes_content='某個貼圖🚕👋👀🌼'//eventsth.message.stickerId;
        break;
      case 'location':
        reply_mes_content=eventsth.message.address;
        break;
    }
    
    writeSheetData[sentMess_cNum-1]=0;
    
    var newDate = new Date(eventsth.timestamp);
    newDate.setHours(newDate.getHours()+8);
    
    writeSheetData[useridII_cNum-1]=user_id;
    
    var nickname=findname(logsheetname,user_id);
    if (nickname===""){
      var  nickname=getUsername(user_id);
     // grapGhost(logsheetname,nickname,user_id)
      w=rowOf(logsheetname,useridI_cNum);
      writetoSheet(logsheetname,w+1,useridI_cNum, user_id);
      writetoSheet(logsheetname,w+1,nicknameI_cNum, nickname);
    }else if (nickname==="(未設定)"){
      
      temp= getUsername(user_id);
      //grapGhost(logsheetname,temp,user_id)
      
      if (temp!="(未加入好友)"){
        
        w=rowOf(logsheetname,useridI_cNum);
        writetoSheet(logsheetname,w,useridI_cNum, user_id);
        writetoSheet(logsheetname,w,nicknameI_cNum, temp);
        
      }
      
    }
    
    var host_id= readSheettoValue(logsheetname,host_rNum,host_cNum);
    writeSheetData[nicknameII_cNum-1]=nickname;
    var mes_timestamp = newDate.toISOString();
    writeSheetData[time_cNum-1]=mes_timestamp;
    writeSheetData[type_cNum-1]=reply_mes_type;
    writeSheetData[replyContent_cNum-1]=reply_mes_content;
    writeSheetData[paraContent_cNum-1]=e.postData.contents;
    var  monitorTime=parseInt(readSheettoValue(logsheetname,monitorTime_rNum,host_cNum))
    
    
    
    if (reply_mes_type==="text" | reply_mes_type==="sticker" | reply_mes_type==="location"){
      if (reply_mes_type==="sticker" | reply_mes_type==="location"){
        writeSheetData[paraContent_cNum-1]=JSON.stringify(events_message);
      }
      
      var res=tell_to_LearnBot(logsheetname,host_id,user_id,monitorTime,nickname,reply_mes_type,reply_mes_content,mes_timestamp)
      
      writeSheetData[sentMess_cNum-1]=res;
      SpreadSheet.getSheetByName(logsheetname).appendRow(writeSheetData);
      
      count=parseInt(readSheettoValue(logsheetname,dataCount_rNum,1))
      count++;
      writetoSheet(logsheetname,dataCount_rNum,host_cNum, count)
      
      
      
    }else{
      tell_to_LearnBot(logsheetname,host_id,user_id,monitorTime,nickname,reply_mes_type,reply_mes_content,mes_timestamp)
      
      
    }
    
    if (typeof reply_token === 'undefined'){
      return;}
    
    
    
    
   var broadCast_strat_row=SpreadSheet.getSheetByName(logsheetname).getLastRow();
    
    if  (reply_mes_type === "text") { 
      
      if (reply_mes_content.includes(helper)){
        
        reply_mode=1;
        return reply_message(logsheetname,host_id,user_id,monitorTime,reply_token,reply_mode,nickname);
        
      } //if (reply_mes_content.includes(helper)){
      
      
      if (commandline.includes(command_str) | command_str.includes("#")){
        str="//轉訊"
        
        if (command_str.includes("#")){  //&  confirm_previous_opr("//轉訊")
          
          if (user_id===administrator_id){
            //wait_info()
            if (confirm_previous_opr("//轉訊",logsheetname)){
              temp=reply_mes_content.slice(reply_mes_content.indexOf("#")+1,reply_mes_content.length);
              sheetIndex=parseInt(reply_mes_content.slice(0,reply_mes_content.indexOf("#")))
              
              var logsheetname=SpreadSheet.getSheets()[sheetIndex-1].getName()
              
              roomLable=readSheettoValue(logsheetname,roomNameLable_rNum,host_cNum);
              monitorTime=parseInt(temp);
              if (!monitorTime & temp===""){
                monitorTime=-1
              }
              if (monitorTime===0){
                myValue= "更改"+roomLable+"，為即時轉訊模式"
                
                DeleteTrigger(logsheetname);
              }else if (monitorTime>0){
                rt=[1,5,10,15,30]
                if (monitorTime>=30){ 
                  monitorTime=30
                }else if (monitorTime>=15 & monitorTime<30){
                  monitorTime=15
                }else if  (monitorTime>=10 & monitorTime<15){
                  monitorTime=10
                }else if  (monitorTime>=5 & monitorTime<10){
                  monitorTime=5
                }else if  (monitorTime>=1 & monitorTime<5){
                  monitorTime=1
                }
                DeleteTrigger(logsheetname);
                myValue="更改"+roomLable+'，為每'+monitorTime+'分鐘轉訊'
                
                CreatTrigger(logsheetname,monitorTime)
              }else if (monitorTime<0){
                monitorTime=-1
                DeleteTrigger(logsheetname);
                myValue="更改"+roomLable+'，為暫停同步轉訊'
              }
              reply_mode=2
              writetoSheet(logsheetname,monitorTime_rNum,host_cNum, monitorTime);
              return reply_message(logsheetname,host_id,user_id,monitorTime,reply_token,reply_mode,myValue);
            }
            
          }else{
            myValue="你無權限設時"
            reply_mode=2
            
            return reply_message(logsheetname,host_id,user_id,monitorTime,reply_token,reply_mode,myValue);
            
          }
          break
        } else {// if (command_str.includes("#")){
          if (command_str==="//我叫"){command_str="//我是"}
          switch(command_str)
          {
            case "//我是":
              if (reply_mes_content==="//我是" | reply_mes_content==="//我叫"){
                
                reply_mode=2
                str="✏️如果你沒有加入『"+helper+"』為好友，可設定你在這裡的暱稱，讓機器人認識你。"+"\n--------------\n目前你的暱稱是:"+nickname+"\n➡️請鍵入//我是+你的暱稱。"
                return reply_message(logsheetname,host_id,user_id,monitorTime,reply_token,reply_mode,str)
                
                break;
              }
              
              
              newuserName=reply_mes_content.slice(4,reply_mes_content.length)
              if (newuserName.length<=1){break;}
              myValue="你已經更改暱稱為："+newuserName+"。";
              
              writetoSheet(logsheetname,changeName(logsheetname,user_id),nicknameI_cNum, newuserName);
              
              reply_mode=2
               return reply_message(logsheetname,host_id,user_id,monitorTime,reply_token,reply_mode,myValue);
              
              break;
              
              
              
            case "//轉訊":
              
              if (user_id===administrator_id){
                wait_info(logsheetname)
                
                mode=0
                str=fileList_detailed(mode, logsheetname) //蒐集所有檔案夾資訊, mode=0=簡化,1=細節
                reply_mode=4
                return reply_message(logsheetname,host_id,user_id,monitorTime,reply_token,reply_mode,str)
                
              }else{
                myValue="你無權限設定轉訊模式"
                reply_mode=2
                
                return reply_message(logsheetname,host_id,user_id,monitorTime,reply_token,reply_mode,myValue);
              }
              
              break;
              
            case "//設時":
              
              break;
            case "//取名":
              if (reply_mes_content==="//取名"){
                
                reply_mode=2
                roomLable=readSheettoValue(logsheetname,roomNameLable_rNum,host_cNum);
                str="✏️替這的地方取個名稱，讓"+helper+"機器人掌握。"+"\n--------------\n目前這裏是："+roomLable+"\n➡️請鍵入//取名+群組名稱。"
                return reply_message(logsheetname,host_id,user_id,monitorTime,reply_token,reply_mode,str)
                
                break;
              }
              
              if (admin_check(host_id,user_id)){ //user_id===administrator_id){
                temp=reply_mes_content.slice(4,reply_mes_content.length);
                if (temp.length<=1){break;}
                reply_mode=2
                newRoomName=roomIcon[getRoomRandom()]+temp
                myValue='這裏取名為'+newRoomName+"。"
                writetoSheet(logsheetname,roomNameLable_rNum,host_cNum, newRoomName);
                return reply_message(logsheetname,host_id,user_id,monitorTime,reply_token,reply_mode,myValue);
              }else{
                myValue="你無權限取名"
                reply_mode=2
                return reply_message(logsheetname,host_id,user_id,monitorTime,reply_token,reply_mode,myValue);
              }
              break;
            case "//回憶":
              reply_mode=2
              myValue="瀏覽之前留言(施工中🤣)"
              return reply_message(logsheetname,host_id,user_id,monitorTime,reply_token,reply_mode,myValue)
              break;
              
            case "//回覆":
              
              
              break;
              
            case "//系統":
              
              if (user_id===administrator_id){      
                wait_info(logsheetname)
                reply_mode=3
                mode=1
                str=fileList_detailed(mode, logsheetname) // //蒐集所有檔案夾資訊, mode=0=簡化,1=細節, 2=廣播使用
                return reply_message(logsheetname,host_id,user_id,monitorTime,reply_token,reply_mode,str)
                
              }else{
                reply_mode=2
                str="你無權限觀看"
                return  reply_message(logsheetname,host_id,user_id,monitorTime,reply_token,reply_mode,str)
              }
              
              
              break;
              
            case "//戳戳":
              
              if (reply_mes_content==="//戳戳"){
                
                reply_mode=2
                str="✏️戳戳即時短訊，可直接與"+helper+"機器人的管理中心聯繫。"+"\n--------------\n"+"➡️請鍵入//戳戳+你的短訊內容。"
                return reply_message(logsheetname,host_id,user_id,monitorTime,reply_token,reply_mode,str)
                
                break;
              }
              
              
              short_msg=reply_mes_content.slice(4,reply_mes_content.length)
              
              re_msg=""
              roomLable=readSheettoValue(logsheetname,roomNameLable_rNum,host_cNum);
              re_msg=re_msg+("一則戳戳來自⬇️\n"+roomLable+"\n")
              re_msg=re_msg+("💁🏻="+nickname+"\n--------------------\n")
              re_msg=re_msg+("📜=（"+short_msg+"）")
              res=learningBotSys_notify(re_msg)
              if (res===1){
                
                str=["完成😀",nickname+"剛戳了"+short_msg.length+"個字。"] //最多五則
              }else{
                str=[nickname+" 沒有戳成🥴","請再試一次。"] //最多五則
              }
              return short_reply(reply_token,str);
              
              break;
              
            case "//瀏覽":
              
             // np=1
              //writetoSheet(logsheetname,9,1, np);
              return carouselInfo(reply_token,1,logsheetname)
          
          
          break
              
            case "//廣播":
              if (user_id===administrator_id){
                
                str="" 
               
                reply_mode=5 //5是廣播
                return reply_message(logsheetname,host_id,user_id,monitorTime,reply_token,reply_mode,str)
                
              }else{
                myValue="你無權使用廣播功能。"
                reply_mode=2
                
                return reply_message(logsheetname,host_id,user_id,monitorTime,reply_token,reply_mode,myValue);
              }
              break;
              
            case "//蒐集":
              
              temp=reply_mes_content.slice(reply_mes_content.indexOf("➡️")+1,reply_mes_content.length);
              writetoSheet(logsheetname,broadCast_strart_rNum,host_cNum, broadCast_strat_row)
              writetoSheet(logsheetname,broadCast_strart_rNum+1,host_cNum, "--")
              reply_mode=5.1
              
              str="✏️一次廣播可同步送出最多五則訊息，透過"+helper+"機器人廣播給指定群組。"+"\n--------------\n"+"✏️廣播至"+temp.slice(0,temp.indexOf("#"))+"(💾="+temp.slice(temp.indexOf("#")+1, temp.length)+")"+"\n ➡️請開始輸入廣播訊息，完成後按下送出訊息。"
              return reply_message(logsheetname,host_id,user_id,monitorTime,reply_token,reply_mode,str)
              
              
              break;
              
            case "//檢視":
              temp=readSheettoValue(logsheetname,broadCast_strart_rNum,host_cNum);
              if (temp==="--"){
                myValue="沒有蒐集到廣播訊息"
                reply_mode=2
                
                return reply_message(logsheetname,host_id,user_id,monitorTime,reply_token,reply_mode,myValue);
                
              }
              
              end_row=broadCast_strat_row;
              broadCast_summary(logsheetname,end_row,reply_token);
              
              break;
              
            case "//傳送":
              temp=readSheettoValue(logsheetname,broadCast_strart_rNum+1,host_cNum);
              if (temp==="--"){
                myValue="沒有蒐集到廣播訊息"
                reply_mode=2
                
                return reply_message(logsheetname,host_id,user_id,monitorTime,reply_token,reply_mode,myValue);
                
              }
              writetoSheet(logsheetname,broadCast_strart_rNum+1,host_cNum, "--")
              start_Row=parseInt(temp.slice(temp.indexOf("#")+1,temp.indexOf("-")))
              end_Row=parseInt(temp.slice(temp.indexOf("-")+1,temp.length))
               
              gid=parseInt(temp.slice(0,temp.indexOf("#")))
              broadCast_id=SpreadSheet.getSheets()[gid-1].getName()
               
               sendBroadCast(logsheetname,broadCast_id,start_Row,end_Row,reply_token);
               
               break;
              
              
            case "//取消":
               writetoSheet(logsheetname,broadCast_strart_rNum,host_cNum, "--")
               writetoSheet(logsheetname,broadCast_strart_rNum+1,host_cNum, "--")
               str=["已取消廣播。"]
               return short_reply(reply_token,str);
              break;
              
            case "//檔案":
              
              
              //getFileMenu(reply_token,logsheetname)
               return carouselInfobyPage(reply_token,1,logsheetname)
              break;
              
          }
        }
        
      } //if (commandline.icludes(command_str)){
      
      if (nickname==='(未加入好友)'){
        myValue='(🤔我還不認識你？)';
        nickname="(未設定)"
        w=rowOf(logsheetname,useridI_cNum);
        writetoSheet(logsheetname,w,useridI_cNum, user_id);
        writetoSheet(logsheetname,w,nicknameI_cNum, nickname);
        reply_mode=1
        reply_message(logsheetname,host_id,user_id,monitorTime,reply_token, reply_mode,myValue);
      } //if (nickname==='(unknow)')
      
    } else if  (reply_mes_type != "text") { 

      if (reply_mes_type != "sticker" & reply_mes_type != "location"){
        var fileID = userData.events[k].message.id;
        var getFetchData=getFileDatas(learnBot_CHANNEL_ACCESS_TOKEN, fileID)
        if (getFetchData==-1){
           return short_reply(reply_token,["❌備份失敗，請稍後再試"]) 

        }
        var upload_files = GoogleDrive.createFile(getFetchData);
        var fileExtension = upload_files.getName().split(".");
        if (userData.events[k].message.type != "file") {
          temp="";
          if (reply_mes_type === "audio") {temp=audio_duration.toString()+"_"} 
          var GoogleDriveFileName = temp+fileID + "." + fileExtension[fileExtension.length - 1];
        
        }
        else {
          var GoogleDriveFileName = userData.events[k].message.fileName;
        }
        
        if (reply_mes_type==="file" | reply_mes_type==="image" | reply_mes_type==="audio"| reply_mes_type==="video"){
          s1="已備份"+nickname+"上傳的檔案。"
          
          s3="("+GoogleDriveFileName+")"
          
          str=[]
          
          str.push(s1)
          
          str.push(s3)
          short_reply(reply_token,str)
        }
        
        newUploadFolder_id=readSheettoValue(logsheetname,uploadFolder_rNum,host_cNum);
        upload_files.makeCopy(GoogleDriveFileName, GoogleDrive.getFolderById(newUploadFolder_id));
        dlURL = upload_files.getDownloadUrl();
        uploadFileID= upload_files.getId()
        writeSheetData[paraContent_cNum-1]=uploadFileID;
        writeSheetData[replyContent_cNum-1]=GoogleDriveFileName;
        GoogleDrive.removeFile(upload_files);
        var res=send_file_to_LearnBot(monitorTime,user_id,reply_mes_type,GoogleDriveFileName);
        
        writeSheetData[sentMess_cNum-1]=res;
        SpreadSheet.getSheetByName(logsheetname).appendRow(writeSheetData);
        
        if (readSheettoValue(logsheetname,broadCast_strart_rNum,host_cNum)!="--"){
          learningBotSys_notify("1 file uploaded.\n"+"("+GoogleDriveFileName+")", logsheetname)
        };
        
        count=parseInt(readSheettoValue(logsheetname,dataCount_rNum,1))
        count++;
        writetoSheet(logsheetname,dataCount_rNum,host_cNum, count)
        
      }else{
        send_file_to_LearnBot(monitorTime,user_id,reply_mes_type,writeSheetData[paraContent_cNum-1]); //傳送貼圖
        
      }
     
      
      
    } // if  (reply_mes_type != "text") {
    
    var myclass=onClass()
    if (myclass!="課堂進行中"){
      reply_mode=2
      return reply_message(logsheetname,host_id,user_id,monitorTime,reply_token,reply_mode,myclass);
    }else{
      count=parseInt(readSheettoValue(logsheetname,dataCount_rNum,1))
      if (count % 100 ===0){
        reply_mode=2
        str="資料累計第"+count+"則"
        return reply_message(logsheetname,host_id,user_id,monitorTime,reply_token,reply_mode,str);
      }
    }
    
  
  
  }//for

  return ContentService.createTextOutput("OK");
}

function checkJumppage(logsheetname,reply_token,reply_mes_content){
  str=readSheettoValue(logsheetname,1,1)
  if (str==""){return}
  var array = str.split(",");
  var num1=parseInt(array[0])
  var where=array[1]
  if (num1!=-1){
    var num2=parseInt(reply_mes_content)
    
    if (num1>num2){num1=num2}
    
    writetoSheet(logsheetname,1,1,"")
    carouselInfobyPage(reply_token,num1,where)
    exit;
  }else{
     writetoSheet(logsheetname,1,1,"")
    carouselInfobySearch(reply_token,where,reply_mes_content)
    exit;
   
  }


  }

function wait_info(targetId){
  return learningBotSys_notify("稍待..", targetId)
}

function learningBotSys_notify(str, targetId){
  var header = {
    'Content-Type': 'application/json; charset=UTF-8',
    'Authorization': 'Bearer ' + learnBot_CHANNEL_ACCESS_TOKEN,
  };

  var payload = {
    'to': targetId || administrator_id,
    'messages': ProcMsg('text', '', '📺' + str)
  };

  var response = UrlFetchApp.fetch(line_push_url, {
    'headers': header,
    'method': 'post',
    'payload': JSON.stringify(payload),
    'muteHttpExceptions': true
  });

  return response.getResponseCode() === 200 ? 1 : 2;
}



function learningBot_notify(result){
  var detail;
  try {
    detail = JSON.parse(result).message || result;
  } catch (error) {
    detail = result;
  }

  return learningBotSys_notify(
    '💔無法即時轉訊💔\n系統回覆➤' + detail + '\n轉訊次數➤已有' + getPushNum() + '次。'
  );
}

function short_reply(reply_token,myValue){
  var header = {
    'Content-Type': 'application/json; charset=UTF-8',
    'Authorization': 'Bearer ' + learnBot_CHANNEL_ACCESS_TOKEN,
  }
  
  var payload = {
    'replyToken': reply_token,
    'messages' :   plainMsg(myValue)
    
  }
  
  var options = {
    'headers': header,
    'method': 'post',
    'payload': JSON.stringify(payload),
    'muteHttpExceptions':true
  }
  
  UrlFetchApp.fetch(line_reply_url , options);
  
  }

function reply_message(mylogsheetname,host_id,user_id,monitorTime,reply_token,reply_mode,myValue){
  var header = {
    'Content-Type': 'application/json; charset=UTF-8',
    'Authorization': 'Bearer ' + learnBot_CHANNEL_ACCESS_TOKEN,
  }
  switch (reply_mode){
    case 1: //1=選單
      
      var payload = {
        'replyToken': reply_token,
        'messages' : menu_flexing(mylogsheetname,host_id,user_id,monitorTime,myValue)
      }
      break;
      
    case 2://2=系統訊息
      
      var payload = {
        'replyToken': reply_token,
        'messages' : feedback_flexing(myValue)
      }
      break;
      
    case 3://3=//檔案清單
       memo_option=[]
      memo_option.push("以上是所有檔案資訊"); //放置提示語，最多四句
      var payload = {
        'replyToken': reply_token,
        'messages' : fileList_flexing(myValue,plainMsg(memo_option)) 
      }
      break;
      
    case 4://4=設定轉訊模式
      
      memo_option=[]
     // memo_option.push(m1)
      memo_option.push("請點選轉訊模式?")
      memo_option.push("或手動輸入💾#⌛？️")
      //memo_option=["請點選轉訊模式?","或手動輸入💾#⌛？️"]; //放置提示語，最多四句
      var payload = {
        'replyToken': reply_token,
        'messages' : fileList_flexing(myValue,plainMsg(memo_option)) 
      }
      break;
      
    case 5://5=廣播模式
      m1="已♺︎轉訊="+getPushNum()+"次"
      memo_option=["各群組最近留言彙整如下⬇️"]
     memo_option.push(m1)
      memo_option.push("請選擇👉🏻在哪廣播?")
      //memo_option=["各群組最近留言彙整如下⬇️","請選擇👉🏻在哪廣播?"]; //放置提示語，最多四句
      var payload = {
        'replyToken': reply_token,
        'messages' : broadCast_flexing(plainMsg(memo_option), mylogsheetname)
      }
      break;
      
    case 5.1://廣播模式的回覆reply
      temp1=feedback_flexing(myValue)
      
      
      bu={
        "type": "flex",
        "altText": "（即時訊息）",
        "contents": {
          "type": "bubble",
          "size": "nano",
          "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "button",
                "action": {
                  "type": "message",
                  "label": "送出訊息",
                  "text": "//檢視廣播訊息"
                },
                "height": "sm"
              }
            ]
          },
          "styles": {
            "body": {
              "backgroundColor": "#99990060"
            }
          }
        }}
      
      temp1.push(bu)
      
      var payload = {
        'replyToken': reply_token,
        'messages' : temp1
      }
      break;
      
    case 6://6=瀏覽模式
      
     // memo_option=["各群組最近留言彙整如下⬇️","請選擇👉🏻在哪廣播?"]; //放置提示語，最多四句
      var payload = {
        'replyToken': reply_token,
        'messages' : broadCast_flexing(plainMsg(memo_option)) 
      }
      break;
      
      
    case 7://7=純文字訊息
      
      var payload = {
        'replyToken': reply_token,
        'messages' :  plainMsg(myValue)  //最多五句
      }
      break;
      
  }
  
  var options = {
    'headers': header,
    'method': 'post',
    'payload': JSON.stringify(payload)
  }
  
  UrlFetchApp.fetch(line_reply_url , options);
  
}



function tell_to_LearnBot(mylogsheetname,host_id,user_id,monitorTime,nickname,reply_mes_type,reply_mes_content,mytime){
  if (monitorTime!=0){return(0);}
  if (user_id===administrator_id){return(1)}
  // myValue="⏰"+mytime+"\n💁🏻"+nickname+"\n📌["+reply_mes_type+']\n🧷('+reply_mes_content+")"
  
  var header = {
    'Content-Type': 'application/json; charset=UTF-8',
    'Authorization': 'Bearer ' + learnBot_CHANNEL_ACCESS_TOKEN,
  }
  
  var payload = {
    'to': administrator_id,
    'messages' : mess_flexing(mylogsheetname,mytime,nickname,reply_mes_type,reply_mes_content)//ProcMsg("text",myValue)
  }
  
  var options = {
    'headers': header,
    'method': 'post',
    'payload': JSON.stringify(payload),
    'muteHttpExceptions':true
  }
  
  
  var response=UrlFetchApp.fetch(line_push_url , options);
  
  var result=response.getContentText()
  
  if (result==="{}"){
    return(1)
  }else{
    learningBot_notify(result)
    return(2)
  }
  
  
  
}



function send_file_to_LearnBot(monitorTime,user_id,mes_type,fileName){
  if (monitorTime!=0){return 0 ;}
  if (user_id===administrator_id){return(1)}
  
  audio_duration=""
  if (mes_type!="sticker" & mes_type!="location"){
    var dlURL= GoogleDrive.getFilesByName(fileName).next().getDownloadUrl();
    //await  dlURL;
    if (mes_type==="audio"){
      var  audio_duration=fileName.slice(0,fileName.indexOf("_"))
      }
    
  }else{
    var dlURL =fileName;
  }
  
  var header = {
    'Content-Type': 'application/json; charset=UTF-8',
    'Authorization': 'Bearer ' + learnBot_CHANNEL_ACCESS_TOKEN,
  }
  
  var payload = {
    'to': administrator_id,
    'messages' : ProcMsg(mes_type,fileName,dlURL,audio_duration)
  }
  
  var options = {
    'headers': header,
    'method': 'post',
    'payload': JSON.stringify(payload),
    'muteHttpExceptions':true
  }
  
  var response= UrlFetchApp.fetch(line_push_url , options);
  var result=response.getContentText()
  
  if (result==="{}"){
    
    return(1)
    
  }else{
    learningBot_notify(result)
    return(2)
    
  }
  
}

function SSS(){
DriveApp.createFile('New Text File', 'Hello, world!');




}

function getFileDatas(learnBot_CHANNEL_ACCESS_TOKEN, fileID){
  
  var url = "https://api-data.line.me/v2/bot/message/" + fileID + "/content";
 
   var response= UrlFetchApp.fetch(url, {
    'headers': {
      'Authorization': 'Bearer ' + learnBot_CHANNEL_ACCESS_TOKEN,
    },
    'method': 'get',
    'muteHttpExceptions':true
  })
 
 var result=response.getResponseCode()
 
 if (result==200){
    return  response
 } else{
   return -1

 }




  }
