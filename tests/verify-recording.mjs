import assert from 'node:assert/strict';
import {harness,run,C1,C2,C3,ADMIN} from './verify-identity.mjs';

const OTHER='U11111111111111111111111111111111';
let seq=0;
function event(text,opts={}){
  const id=opts.id||'m-'+(++seq);
  return {type:'message',webhookEventId:'evt-'+id,timestamp:1789354800000,source:{type:'group',groupId:opts.chat||C1,userId:opts.user||ADMIN},replyToken:opts.noReply?undefined:'r-'+id,message:opts.message||{type:'text',id,text}};
}
function send(c,...events){return c.doPost({parameter:{key:'test-webhook-key'},postData:{contents:JSON.stringify({events})}});}
function setup(){const h=harness();h.context.initializeReadableNames();return h;}
function fakeDownload(c){c.getFileDatas=()=>({getBlob:()=>({name:'',getContentType:()=> 'image/jpeg',setName(name){this.name=name;return this;}})});}
function postback(data,user=ADMIN,chat=C1){return {type:'postback',source:{type:'group',groupId:chat,userId:user},replyToken:'postback-'+(++seq),postback:{data:JSON.stringify(data)}};}

run('recognized commands are excluded; ordinary text, links, # and literal formulas are preserved',()=>{
  const {context:c,one}=setup();
  for(const cmd of ['//系統','//轉訊','//廣播','//檔案','//瀏覽','//我是','//我是新暱稱','//取消','備份','//備份'])send(c,event(cmd));
  assert.equal(one.getRange(6,1).getValue(),2);
  const texts=['一般訊息','https://example.org/a#b','今天要備份照片','#普通標籤','2#5','// not a known bot command','=SUM(1,2)'];
  for(const text of texts)send(c,event(text));
  assert.deepEqual(one.getRange(11,10,texts.length,1).getValues().flat(),texts);
  assert.equal(one.getRange(6,1).getValue(),2+texts.length);
  assert.ok(one.getRange(11,12).getValue());
  assert.equal(JSON.parse(one.getRange(11,14).getValue()).source.groupId,C1);
});

run('new group has a complete schema without templet and routes all writes to its own folder',()=>{
  const {context:c,ss,template,one,files}=setup();
  ss.sheets=ss.sheets.filter(s=>s!==template);
  fakeDownload(c);
  send(c,event('新群組第一筆',{chat:C3}));
  const sheet=c.botSheet_(C3);
  assert.equal(sheet.getRange(9,10).getValue(),'新群組第一筆');
  assert.equal(sheet.getRange(1,12).getValue(),'MessageId');
  assert.equal(sheet.getRange(6,1).getValue(),1);
  assert.equal(one.getRange(6,1).getValue(),2);
  send(c,event('',{chat:C3,message:{id:'new-group-image',type:'image'}}));
  const saved=files.get(sheet.getRange(10,11).getValue());
  assert.equal(saved.folder.id,sheet.getRange(4,1).getValue());
  assert.equal(sheet.getRange(6,1).getValue(),2);
});

run('content rows ignore long member lists; member metadata is preserved',()=>{
  const {context:c,one}=setup();one.getRange(50,3).setValue(OTHER);
  send(c,event('應寫入第十一列'));
  assert.equal(one.getRange(11,10).getValue(),'應寫入第十一列');
  assert.equal(one.getRange(50,3).getValue(),OTHER);
  assert.equal(c.botLastContentRow_(one),11);
});

run('search and page inputs belong only to the initiating chat/user and are not content',()=>{
  const {context:c,one,two}=setup();let search;
  c.carouselInfobySearch=(_r,chat,text,page)=>{search={chat,text,page};};
  send(c,postback({id:7,thpage:-2,thsheet:C1}));
  send(c,event('其他人的正常內容',{user:OTHER}));
  send(c,event('同一人在另一群組的內容',{chat:C2}));
  send(c,event('搜尋字串'));
  assert.equal(one.getRange(6,1).getValue(),3);assert.equal(two.getRange(6,1).getValue(),3);
  assert.equal(search.text,'搜尋字串');assert.equal(search.chat,C1);
  assert.equal(one.getRange(1,1).getValue(),'');
  send(c,postback({id:8,thpage:-1,wholepage:10,thsheet:C1,serStr:'原搜尋'}));
  send(c,event('3'));
  assert.equal(search.page,3);assert.equal(search.text,'原搜尋');
  assert.equal(one.getRange(6,1).getValue(),3);
});

run('timing input does not depend on a logged //轉訊 row',()=>{
  const {context:c,one,two}=setup();
  send(c,event('//轉訊'));
  send(c,event('2#0',{user:OTHER}));
  assert.equal(one.getRange(11,10).getValue(),'2#0');
  send(c,event('3#0'));
  assert.equal(two.getRange(5,1).getValue(),0);
  assert.equal(one.getRange(6,1).getValue(),3);
});

run('broadcast collects only author content rows, excludes operations and other users',()=>{
  const {context:c,one,requests}=setup();
  send(c,event('//蒐集➡️目標#'+C2));
  send(c,event('廣播 A'));
  send(c,event('不應廣播的另一位使用者',{user:OTHER}));
  send(c,event('廣播 B'));
  send(c,event('//檢視廣播訊息'));
  send(c,event('//傳送'));
  const push=requests.filter(r=>r.payload.to===C2).at(-1);
  assert.deepEqual(push.payload.messages.map(m=>m.text),['廣播 A','廣播 B']);
  assert.equal(one.getRange(6,1).getValue(),5);
  assert.equal(one.getRange(7,1).getValue(),'--');assert.equal(one.getRange(8,1).getValue(),'--');
  assert.equal(c.botGetOperation_(C1,ADMIN,'broadcast'),null,'Successful delivery must remove the draft');
  send(c,event('//傳送'));assert.equal(requests.filter(r=>r.payload.to===C2).length,1);
});

run('failed upload remains visible, retry uses same row and saved file ID, success follows commit',()=>{
  const {context:c,one,folders,files}=setup();fakeDownload(c);
  const upload=event('',{id:'upload-1',message:{id:'upload-1',type:'file',fileName:'report.pdf'}});
  folders.get('folder-one').fail=true;
  assert.throws(()=>send(c,upload),/could not finish/);
  assert.match(one.getRange(11,13).getValue(),/^備份失敗/);
  assert.equal(one.getRange(6,1).getValue(),3);assert.equal(one.getRange(11,11).getValue(),'');
  folders.get('folder-one').fail=false;
  const priorReply=c.short_reply;
  c.short_reply=(token,texts)=>{if(texts[0].startsWith('已備份')){
    assert.equal(one.getRange(11,13).getValue(),'已備份');
    assert.ok(files.has(one.getRange(11,11).getValue()));
  }return priorReply(token,texts);};
  send(c,upload);send(c,upload);
  assert.equal(files.size,1);assert.equal(one.getRange(6,1).getValue(),3);
  const saved=files.get(one.getRange(11,11).getValue());assert.equal(saved.folder.id,'folder-one');
  assert.equal(c.botStoredFile_(C1,11),saved);
});

run('no reply token still records text and saves uploads; duplicate messages are not counted twice',()=>{
  const {context:c,one,files,requests}=setup();fakeDownload(c);
  const text=event('無回覆 token 也要保留',{noReply:true});send(c,text);send(c,text);
  const photo=event('',{noReply:true,message:{type:'image',id:'no-reply-file'}});send(c,photo);send(c,photo);
  assert.equal(one.getRange(6,1).getValue(),4);assert.equal(files.size,1);
  assert.equal(requests.filter(r=>r.payload.replyToken).length,0);
});

run('same webhook processes later messages after a postback, command, or failed upload',()=>{
  const {context:c,one,folders}=setup();fakeDownload(c);
  send(c,postback({id:7,thpage:1,thsheet:C1}),event('//檔案'),event('批次第三則'));
  assert.equal(one.getRange(11,10).getValue(),'批次第三則');
  folders.get('folder-one').fail=true;
  assert.throws(()=>send(c,event('',{message:{id:'batch-fail',type:'image'}}),event('失敗後仍要記錄')),/could not finish/);
  assert.equal(one.getRange(13,10).getValue(),'失敗後仍要記錄');
  assert.equal(one.getRange(6,1).getValue(),5);
});

run('forwarding failure does not discard content',()=>{
  const {context:c,one}=setup();
  one.getRange(5,1).setValue(0);
  c.tell_to_LearnBot=()=>{throw Error('network unavailable');};
  send(c,event('必須保留的內容'));
  assert.equal(one.getRange(11,10).getValue(),'必須保留的內容');
  assert.equal(one.getRange(11,5).getValue(),2);
});

run('same-name files resolve only within the recorded group folder',()=>{
  const {context:c,one,two,folders,addFile}=setup();
  const first=addFile(folders.get('folder-one'),'same.pdf');
  const second=addFile(folders.get('folder-two'),'same.pdf');
  for(const sheet of [one,two]){sheet.getRange(11,9).setValue('file');sheet.getRange(11,10).setValue('same.pdf');}
  one.getRange(11,11).setValue(second.id); // Legacy wrong ID must not escape the group's folder.
  assert.equal(c.botStoredFile_(C1,11),first);assert.equal(c.botStoredFile_(C2,11),second);
});

run('sticker/location remain recorded and pending uploads are searchable without invalid thumbnails',()=>{
  const {context:c,one,folders,requests}=setup();fakeDownload(c);
  send(c,event('',{message:{id:'sticker-1',type:'sticker',packageId:'1',stickerId:'1'}}));
  send(c,event('',{message:{id:'loc-1',type:'location',latitude:25,longitude:121,address:'台北'}}));
  folders.get('folder-one').fail=true;
  assert.throws(()=>send(c,event('',{message:{id:'bad-file',type:'file',fileName:'failed.pdf'}})),/could not finish/);
  c.getThumbnailURL=()=>{throw Error('No thumbnail should be requested');};
  c.carouselInfobyPage('browse',1,C1);c.carouselInfobySearch('search',C1,'failed.pdf');
  const payloads=JSON.stringify(requests.filter(r=>['browse','search'].includes(r.payload.replyToken)));
  assert.ok(payloads.includes('備份失敗'));assert.ok(!payloads.includes('"type":"image"'));
  assert.equal(one.getRange(6,1).getValue(),5);
});

console.log('PASS: 12 additional content/command/upload scenarios, all offline; no external writes or LINE messages.');

