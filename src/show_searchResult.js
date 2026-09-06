function dss(){
  var carousel_sheet=SpreadSheet.getSheetByName(learningBotCenter_id)
  var lastRow=carousel_sheet.getLastRow()
  var baseLine=9
  var search_range = carousel_sheet.getRange(baseLine,7,lastRow,4)
  var oo = search_range.createTextFinder('檔案').findAll()

  var pp=[]

  for (i=0;i<oo.length;i++){
t=[]
t.push(oo[i].getRow())
t.push(oo[i].getColumn())
pp.push(t)

  }
  //var pp=[oo]
var d=JSON.stringify({'id':8,'thpage':2,'thsheet':'ddd','serStr':'ede','serList':pp})
eed=JSON.parse(d).serList
Logger.log(d)
Logger.log(eed[2])
Logger.log(eed.length)
}

function show_searchResult(reply_token,thlogsheetname,search_str,search_result_list,nowpage){
 

  var carousel_sheet=SpreadSheet.getSheetByName(thlogsheetname)
  var baseLine=1
  
  
  var lastRow=search_result_list.length
  
  var itemC=12
  
  var wholepage = Math.ceil((lastRow-(baseLine-1)) / itemC)
  
  var Ith=lastRow-((nowpage-1)*itemC)
  
  var ori={
    "type": "flex",
    "altText": "（即時訊息）",
    "contents":{
      "type": "carousel",
      "contents": [
        ///夾在這裡
      ]
    }
  }
  
  var lastItem=Ith-itemC+1
  var Iroom=carousel_sheet.getRange(roomNameLable_rNum,host_cNum).getValue()
  if (lastItem<baseLine){lastItem=baseLine}
  while(Ith>=(lastItem)){
    
    var rowIth=search_result_list[Ith-1].getRow()
    var Itime=carousel_sheet.getRange(rowIth,time_cNum).getValue()
    var Iuser=carousel_sheet.getRange(rowIth,nicknameII_cNum).getValue()
    var Iopinions=carousel_sheet.getRange(rowIth,replyContent_cNum).getValue()
    var Ipara=carousel_sheet.getRange(rowIth,paraContent_cNum).getValue()
    var Itype=carousel_sheet.getRange(rowIth,type_cNum).getValue()
    
    
    var bulletin_time=new Date(Itime);
    
    bulletin_time.setHours(bulletin_time.getHours());
    var etime_minTimeString =
        bulletin_time.getUTCFullYear() + "年" +
          ("0" + (bulletin_time.getUTCMonth()+1)).slice(-2) + "月" +
            ("0" + bulletin_time.getUTCDate()).slice(-2) + "日"+
              ("0" + bulletin_time.getUTCHours()).slice(-2) + "時" +
                ("0" +bulletin_time.getUTCMinutes()).slice(-2)+"分" +
                  ("0" +bulletin_time.getUTCSeconds()).slice(-2)+"秒";
    if (Itime===""){
      etime_minTimeString="?";
    }
    
    
    var uniMess={
      "type": "bubble",
      "size": "micro",
      "header": {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "text",
            "text": `No.${rowIth-(baseLine-1)}️`
          },
          {
          "type": "box",
          "layout": "vertical",
          "contents": [
          {
          "type": "box",
          "layout": "vertical",
          "contents": [
          {
          "type": "filler"
          }
        ],
        "backgroundColor": "#009900",
        "height": "3px"
      }
      ],
      "backgroundColor": "#9FD8E36E",
      "height": "6px",
      "margin": "sm"
    },{
      "type": "text",
        "text": `👉🏻${Iroom}️`
    },
      {
        "type": "text",
          "text": `${Iuser}寫下️`
      },
        {
          "type": "text",
            "text": `📜${Itype}️`
        }
    ],
      "backgroundColor": "#cce6ff",
        "paddingTop": "19px",
          "paddingAll": "12px",
            "paddingBottom": "16px"
  },
    "body": {
      "type": "box",
        "layout": "vertical",
          "contents": [
            {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                {
                  "type": "text",
                  "text": `${Iopinions}️`,
                "color": "#8C8C8C",
                "size": "sm",
                "wrap": true,
                "maxLines": 8
                }
              ],
              "flex": 1
            }
          ],
            "spacing": "md",
              "paddingAll": "12px"
    },
      "footer": {
        "type": "box",
          "layout": "vertical",
            "contents": [
              {
                "type": "text",
                "text": `${etime_minTimeString}️`,
              "size": "xxs",
              "wrap":true
              }
            ],
              "backgroundColor": "#ffffcc"
      },
        "styles": {
          "footer": {
            "separator": false
          }
        }
}


if (Itype!="text"){
  var regM={
    "type": "text",
    "contents": [
      {
        "type": "span",
        "text": "(下載連結)"
      }
    ],
    "action": {
      "type": "postback",
      "label": "action",
      "data": JSON.stringify({'id':2,'sheetName':thlogsheetname,'dataRow':rowIth}),
      "displayText": `下載${Iopinions}..️`
  },
      "color": "#990000",
        "wrap": true,
          //"maxLines": 3,
          "size": "sm"
}
uniMess.body.contents.push({
        "type": "image",
        "url": getThumbnailURL(Ipara),
        "margin": "none",
        "size": "full",
        //"backgroundColor": "#999999"
      })
uniMess.body.contents.push(regM)
}

ori.contents.contents.push(uniMess)

Ith--
  
}
var prepage=nowpage-1
var nextpage=nowpage+1

if (prepage<1){
  prepage=1
}
if (nextpage>wholepage){
  nextpage=wholepage
}


var pageMenu={
  "type": "flex",
  "altText": "（即時訊息）",
  "contents":{
    "type": "bubble",
    "size": "mega",
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
            "type": "text",
            "text": `👉搜尋"${search_str}"(共${search_result_list.length}筆)`,
            "size":"lg"
            
            }, {
          "type": "separator",
          "color": "#990000"
          },
        {
          "type": "box",
          "layout": "horizontal",
          "contents": [
            {
              "type": "text",
              "text": "pre.",
              "action": {
                "type": "postback",
                "label": "action",
                "data": JSON.stringify({'id':8,'thpage':prepage,'thsheet':thlogsheetname,'serStr':search_str}),
                "displayText": `至第${prepage}頁️`
            }
            },
            {
            "type": "box",
            "layout": "horizontal",
            "contents": [
            /*
            pageMenu.contents.body.contents[0].contents[1].contents.push(kk)
            {
            "type": "text",
            "text": "1",
            "action": {
            "type": "postback",
            "label": "action",
            "data": JSON.stringify({'id':7,'thpage':-1}),
            
            }
            }
            */
            
          ],
          "width": "70%",
          
        },
        {
          "type": "text",
          "text": "next",
          "align": "end",
          "action": {
            "type": "postback",
            "label": "action",
            "data": JSON.stringify({'id':8,'thpage':nextpage,'thsheet':thlogsheetname,'serStr':search_str}),
            "displayText": `至第${nextpage}頁️`
        }
        }
      ]
    },
    {
    "type": "separator",
    "color": "#990000"
    },
    
  {
  "type": "box",
  "layout": "horizontal",
  "contents": [
  {
  "type": "text",
  "text": "first",
  "align": "start",
  "action": {
  "type": "postback",
  "label": "action",
  "data": JSON.stringify({'id':8,'thpage':1,'thsheet':thlogsheetname,'serStr':search_str}),
    "displayText": "至第一頁"
}
},
  {
    "type": "text",
      "text": "all","align": "start",
        "action": {
          "type": "postback",
            "label": "action",
              "data": JSON.stringify({'id':7,'thpage':1,'wholepage':wholepage,'thsheet':thlogsheetname}),
                "displayText": "瀏覽全部."
        }
  },
{
      "type": "text",
        "text": "search","align": "end",
        "action": {
          "type": "postback",
            "label": "action",
              "data": JSON.stringify({'id':7,'thpage':-2,'thsheet':thlogsheetname}),
                "displayText": "重新搜尋."
        }
    }
    ,
      {
        "type": "text",
          "text": "last",
            "align": "end",
              "action": {
                "type": "postback",
                  "label": "action",
                    "data": JSON.stringify({'id':8,'thpage':wholepage,'thsheet':thlogsheetname,'serStr':search_str}),
                      "displayText": "至最後一頁"
              }
      }
]
}
]
}
}}


var ratio = wholepage/7
if (ratio<=1){
  var th_s=1
  var th_e=wholepage
  }else
  {
    if ((nowpage-3)>=1){
      var th_s=nowpage-3
    }else{
      var th_s=1
      }
    var th_e=th_s+6
    if (th_e>wholepage){
      var th_s=wholepage-6
      var th_e=wholepage
      }
  }


for (var th=th_s;th<=th_e;th++){
  str1=""
  str2=""
  if (th_s>1 && th==th_s){str1=".."}
  if (th_e<wholepage && th==th_e){str2=".."}
  if (th==nowpage){
    ccolor="#990000"
    wweight="bold"
  }else{
    ccolor="#000000"
    wweight="regular"
  }
  
  kk={"type": "text",
      "text": `${str1}${th}${str2}`,
        "align": "center",
          "action": {
            "type": "postback",
              "label": "action",
                "data": JSON.stringify({'id':8,'thpage':`${th}`,'thsheet':thlogsheetname,'serStr':search_str}),
                  "displayText": `至第${th}頁️`
          }, "color": `${ccolor}`,
            "weight": `${wweight}`,"wrap":true
}

pageMenu.contents.body.contents[2].contents[1].contents.push(kk)
}


myValue=plainMsg([`${Iroom}\n👉🏻第${nowpage}頁(共${wholepage}頁)：️`])
myValue.push(ori)
//myValue.push(plainMsg([`搜尋👉${search_str}，共${search_result_list.length}筆`])[0])

myValue.push(pageMenu)
var header = {
  'Content-Type': 'application/json; charset=UTF-8',
  'Authorization': 'Bearer ' + learnBot_CHANNEL_ACCESS_TOKEN}

var payload = {
  'replyToken': reply_token,
  'messages' : myValue
}

var options = {
  'headers': header,
  'method': 'post',
  'payload': JSON.stringify(payload)
}

UrlFetchApp.fetch(line_reply_url , options); 
 
}
