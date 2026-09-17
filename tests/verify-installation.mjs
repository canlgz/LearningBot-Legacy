import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {harness,run,C1,C2,ADMIN} from './verify-identity.mjs';

function fresh(standalone=false){
  const h=harness({emptyConfig:true,standalone});
  h.ss.sheets=[new h.Sheet('工作表1',10,{})];h.folders.clear();
  h.props.LINE_CHANNEL_ACCESS_TOKEN='student-token';h.props.ADMINISTRATOR_LINE_USER_ID=ADMIN;
  h.context.learnBot_CHANNEL_ACCESS_TOKEN='student-token';h.context.administrator_id=ADMIN;
  h.context.learningBotCenter_id=ADMIN;h.context.destinationFolderID='';
  return h;
}
function webhook(h,text,id='student-message',chat=C1){return {parameter:{key:h.props.WEBHOOK_KEY},postData:{contents:JSON.stringify({events:[{type:'message',timestamp:1789354800000,source:{type:'group',groupId:chat,userId:ADMIN},replyToken:'reply-'+id,message:{type:'text',id,text}}]})}};}

run('fresh bound installation creates its own root and admin sheet without a template',()=>{
  const h=fresh();const r=h.context.initializeBot();
  assert.equal(r.ready,true);assert.equal(h.ss.sheets.length,2);assert.equal(h.ss.sheets[0].name,'工作表1');
  assert.equal(h.props.SPREADSHEET_ID,'test-sheet');assert.ok(h.props.DESTINATION_FOLDER_ID);
  const admin=h.context.botSheet_(ADMIN);assert.equal(admin.getRange(1,14).getValue(),'原始事件');assert.equal(admin.getRange(6,1).getValue(),0);
  assert.equal(h.installed.length,2);assert.ok(h.props.WEBHOOK_KEY);
  assert.ok(h.requests.every(r=>r.url==='https://api.line.me/v2/bot/info'));
});

run('standalone installation creates the workbook and resolves it on later executions',()=>{
  const h=fresh(true);assert.equal(h.context.SpreadSheet,null);h.context.initializeBot();
  vm.runInContext(fs.readFileSync(new URL('../src/parameters.js',import.meta.url),'utf8'),h.context);
  assert.equal(h.context.SpreadSheet,h.ss);h.context.doPost(webhook(h,'第一次群組訊息'));
  assert.equal(h.context.botSheet_(C1).getRange(9,10).getValue(),'第一次群組訊息');
});

run('repeated initialization preserves rows, root, folder identities, key and triggers',()=>{
  const h=fresh();h.context.initializeBot();h.context.doPost(webhook(h,'不能重設'));
  const before=JSON.stringify(h.ss.sheets.map(s=>s.cells)),root=h.props.DESTINATION_FOLDER_ID,key=h.props.WEBHOOK_KEY,folders=h.folders.size;
  h.context.initializeBot();assert.equal(JSON.stringify(h.ss.sheets.map(s=>s.cells)),before);
  assert.equal(h.props.DESTINATION_FOLDER_ID,root);assert.equal(h.folders.size,folders);assert.equal(h.props.WEBHOOK_KEY,key);assert.equal(h.installed.length,2);
});

run('missing or placeholder administrator is rejected before creating resources',()=>{
  const h=fresh();h.context.administrator_id='填任意文字';
  assert.throws(()=>h.context.initializeBot(),/Your user ID/);assert.equal(h.folders.size,0);assert.equal(h.ss.sheets.length,1);
});

run('invalid LINE token is rejected without creating student resources',()=>{
  const h=fresh();h.context.UrlFetchApp.fetch=()=>({getResponseCode:()=>401});
  assert.throws(()=>h.context.initializeBot(),/HTTP 401/);assert.equal(h.folders.size,0);assert.equal(h.props.BOT_INITIALIZED_SPREADSHEET_ID,undefined);
});

run('a workbook copied with another workbook ID fails closed',()=>{
  const h=fresh();h.props.SPREADSHEET_ID='some-other-workbook';
  assert.throws(()=>h.context.initializeBot(),/不同/);assert.equal(h.folders.size,0);
});

run('webhook without the secret cannot create sheets, write rows or send messages',()=>{
  const h=fresh();h.context.initializeBot();h.requests.length=0;
  const e=webhook(h,'不可信請求');delete e.parameter;
  assert.equal(h.context.doPost(e),'Unauthorized');assert.equal(h.ss.sheets.length,2);assert.equal(h.requests.length,0);
  e.parameter={key:'wrong'};assert.equal(h.context.doPost(e),'Unauthorized');assert.equal(h.ss.sheets.length,2);
});

run('browser installation check distinguishes an accessible initialized webhook from a wrong key',()=>{
  const h=fresh(),c=h.context;c.initializeBot();
  assert.match(c.doGet({parameter:{key:h.props.WEBHOOK_KEY}}),/webhook is reachable/);
  assert.match(c.doGet({parameter:{key:'wrong'}}),/missing or invalid/);
});

run('correct secret without initialization cannot write data',()=>{
  const h=fresh();h.props.WEBHOOK_KEY='configured-key';
  assert.throws(()=>h.context.doPost(webhook(h,'尚未初始化')),/initializeBot/);assert.equal(h.ss.sheets.length,1);
});

run('LINE verification empty events is accepted only after initialization',()=>{
  const h=fresh();h.context.initializeBot();h.requests.length=0;
  assert.equal(h.context.doPost({parameter:{key:h.props.WEBHOOK_KEY},postData:{contents:'{"events":[]}'}}),'OK');
  assert.equal(h.requests.length,0);assert.equal(h.ss.sheets.length,2);
});

run('two new groups, identical readable labels, edits, search and writes stay isolated',()=>{
  const h=fresh(),c=h.context;c.initializeBot();
  c.doPost(webhook(h,'第一組','a',C1));c.doPost(webhook(h,'第二組','b',C2));
  c.botRename_(C1,'共同名稱');c.botRename_(C2,'共同名稱');
  const one=c.botSheet_(C1),two=c.botSheet_(C2),id=one.getSheetId(),folder=one.getRange(4,1).getValue();
  assert.notEqual(one.name,two.name);assert.notEqual(folder,two.getRange(4,1).getValue());
  one.setName('手動改名');c.backupBotNameChanged({source:h.ss,changeType:'OTHER'});
  c.doPost(webhook(h,'改名後仍正確','c',C1));assert.equal(c.botSheet_(C1).getSheetId(),id);assert.equal(one.getRange(10,10).getValue(),'改名後仍正確');
  assert.equal(h.folders.get(folder).name,one.name);assert.equal(one.getRange(3,1).getValue(),one.name);
  let found;c.show_searchResult=(_token,chat,text,rows)=>{found={chat,rows:rows.map(r=>r.getRow())};};c.carouselInfobySearch('query',C1,'改名後');
  assert.equal(found.chat,C1);assert.deepEqual([...found.rows],[10]);assert.equal(two.getRange(9,10).getValue(),'第二組');
});

run('new private upload stays private and forwarding returns an authenticated link',()=>{
  const h=fresh(),c=h.context;c.initializeBot();c.doPost(webhook(h,'hello'));h.requests.length=0;
  const group=c.botSheet_(C1),folder=h.folders.get(group.getRange(4,1).getValue()),create=folder.createFile;
  folder.createFile=function(blob){const file=create.call(this,blob);file.access='PRIVATE';return file;};
  c.getFileDatas=()=>({getBlob:()=>({name:'',getContentType:()=> 'image/jpeg',setName(name){this.name=name;return this;}})});
  const e=webhook(h,'');e.postData.contents=JSON.stringify({events:[{type:'message',timestamp:1789354800000,source:{type:'group',groupId:C1,userId:ADMIN},replyToken:'photo-reply',message:{type:'image',id:'private-photo'}}]});
  c.doPost(e);const file=h.files.get(group.getRange(10,11).getValue());assert.equal(file.access,'PRIVATE');
  const pushed=h.requests.filter(r=>r.payload.to===ADMIN).map(r=>r.payload.messages[0]);assert.equal(pushed[1].type,'text');assert.match(pushed[1].text,/權限保護/);
  const broadcast=c.botBuildBroadcastMessages_(C1,0,0,[10]);assert.equal(broadcast[0].type,'text');assert.ok(broadcast[0].text.includes(file.getUrl()));
});

run('explicitly public media retains inline rendering and numeric audio duration',()=>{
  const h=fresh();h.context.initializeBot();const file=h.addFile(h.folders.get(h.props.DESTINATION_FOLDER_ID),'1200_clip.m4a');file.access='ANYONE_WITH_LINK';
  const msg=h.context.botStoredMediaMessage_(file,'audio','1200');assert.equal(msg.type,'audio');assert.equal(msg.duration,1200);
  assert.throws(()=>h.context.botStoredMediaMessage_(file,'audio','bad'),/音訊長度/);
});

run('failure creating a group folder can be retried without duplicate sheets',()=>{
  const h=fresh();h.context.initializeBot();const root=h.folders.get(h.props.DESTINATION_FOLDER_ID),create=root.createFolder;
  root.createFolder=()=>{throw Error('Drive permission failure');};
  assert.throws(()=>h.context.doPost(webhook(h,'first')),/could not finish/);const count=h.ss.sheets.length;
  root.createFolder=create;h.context.doPost(webhook(h,'first'));assert.equal(h.ss.sheets.length,count);assert.equal(h.context.botSheet_(C1).getRange(9,10).getValue(),'first');
});

console.log('PASS: 13 clean-installation scenarios, isolated mocks; no student account or LINE deployment performed.');
