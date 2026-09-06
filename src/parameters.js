
/**
 * Public teaching edition: private values live in Script Properties, never in
 * source control. Copy `CONFIG.example.md` into your own Script Properties.
 */
function requiredProperty_(name) {
  var value = PropertiesService.getScriptProperties().getProperty(name);
  if (!value) {
    throw new Error('Missing Script Property: ' + name);
  }
  return value;
}

var notify_CHANNEL_ACCESS_TOKEN = requiredProperty_('LINE_NOTIFY_TOKEN');
var learnBot_CHANNEL_ACCESS_TOKEN = requiredProperty_('LINE_CHANNEL_ACCESS_TOKEN');
var destinationFolderID = requiredProperty_('DESTINATION_FOLDER_ID');
var learningBotCenter_id = requiredProperty_('LEARNING_CENTER_SHEET_NAME');
var administrator_id = requiredProperty_('ADMINISTRATOR_LINE_USER_ID');
var defaultThumbnailFileId = requiredProperty_('DEFAULT_THUMBNAIL_FILE_ID');


var logsheetname;
var line_reply_url = 'https://api.line.me/v2/bot/message/reply';
var line_push_url = 'https://api.line.me/v2/bot/message/push';
var line_notify_url="https://notify-api.line.me/api/notify"
var line_profile_url = 'https://api.line.me/v2/profile';
var events_message;
var helper='備份';
var helpIconurl="https://cdn.iconscout.com/icon/free/png-256/learning-95-1108404.png"
var user;
var SpreadSheet = SpreadsheetApp.getActiveSpreadsheet();
var commandline=["//我是","//我叫","//廣播","//取名","//系統","//轉訊","//戳戳","//蒐集","//檢視","//取消","//傳送","//檔案","//瀏覽"];
var host_cNum=1;
var roomIcon=["⛺️","🏠","🏘","🏕","⛰","⛩","🛕","🕍","🕌","🕋"]
var host_rNum=2;
var roomNameLable_rNum=3;
var uploadFolder_rNum =4;
var monitorTime_rNum=5;
var dataCount_rNum=6
var broadCast_strart_rNum=7;
var trigger_cNum=2;
var trigger_rNum=2;
var useridI_cNum=3;
var nicknameI_cNum=4;
var sentMess_cNum=5;
var useridII_cNum=6;
var nicknameII_cNum=7;
var time_cNum=8;
var type_cNum=9;
var replyContent_cNum=10;
var paraContent_cNum=11;
var GoogleDrive = DriveApp;
var newUploadFolder_id;
var audio_duration
var monitorTime
var user_id
var host_id
var broadCast_strat_row
