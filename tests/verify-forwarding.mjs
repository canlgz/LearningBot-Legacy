import assert from 'node:assert/strict';
import {harness,run,C1,C2,ADMIN} from './verify-identity.mjs';

const OTHER='U11111111111111111111111111111111';
let sequence=0;
function fixture() {
  const h=harness(),c=h.context;c.initializeReadableNames();
  h.one.getRange(5,1).setValue(0);
  c.UrlFetchApp.fetch=(url,options)=>{
    h.requests.push({url,payload:JSON.parse(options.payload||'{}')});
    return {getResponseCode:()=>200,getContentText:()=>JSON.stringify({sentMessages:[{id:'accepted',quoteToken:'response-quote'}]})};
  };
  return h;
}
function event(text,user=ADMIN,chat=C1,message) {
  const id='forward-'+(++sequence);
  return {type:'message',webhookEventId:'evt-'+id,timestamp:1789354800000,source:chat===user?{type:'user',userId:user}:{type:'group',groupId:chat,userId:user},replyToken:'r-'+id,message:message||{type:'text',id,text}};
}
function send(c,e){return c.doPost({parameter:{key:'test-webhook-key'},postData:{contents:JSON.stringify({events:[e]})}});}
function pushes(h){return h.requests.filter(r=>r.payload.to===ADMIN);}
function fakeDownload(c){c.getFileDatas=()=>({getBlob:()=>({name:'',getContentType:()=> 'image/jpeg',setName(name){this.name=name;return this;}})});}

run('administrator messages in another group produce the original private reminder card',()=>{
  const h=fixture();send(h.context,event('測試0914的一般訊息'));
  assert.equal(pushes(h).length,1);
  assert.equal(pushes(h)[0].payload.messages[0].type,'flex');
  const card=JSON.stringify(pushes(h)[0].payload.messages);
  assert.match(card,/媒體產業研究/);assert.match(card,/測試0914的一般訊息/);assert.match(card,/既有使用者/);
  assert.equal(h.one.getRange(11,5).getValue(),1);assert.equal(h.one.getRange(11,10).getValue(),'測試0914的一般訊息');
});

run('other members still trigger the same private reminder',()=>{
  const h=fixture();send(h.context,event('其他成員訊息',OTHER));
  assert.equal(pushes(h).length,1);assert.equal(h.one.getRange(11,5).getValue(),1);
});

run('HTTP 200 with sentMessages is success and creates no false error notification',()=>{
  const h=fixture();send(h.context,event('新格式回應'));
  assert.equal(pushes(h).length,1);assert.doesNotMatch(JSON.stringify(pushes(h)),/無法即時转訊|無法即時轉訊|response-quote/);
  assert.equal(h.one.getRange(11,5).getValue(),1);
});

run('//我是 sends a reminder and updates the nickname without logging a command row',()=>{
  const h=fixture();send(h.context,event('//我是新暱稱',OTHER));
  assert.equal(pushes(h).length,1);assert.match(JSON.stringify(pushes(h)),/\/\/我是新暱稱/);
  assert.equal(h.one.getRange(6,1).getValue(),2);assert.equal(h.one.getRange(11,9).getValue(),'');
});

run('administrator private conversation does not echo itself back',()=>{
  const h=fixture(),c=h.context;const self=c.checkSheetExist(ADMIN,ADMIN);self.getRange(5,1).setValue(0);
  send(c,event('私人對話',ADMIN,ADMIN));assert.equal(pushes(h).length,0);
  assert.equal(self.getRange(9,10).getValue(),'私人對話');
});

run('paused and scheduled groups keep their settings and do not immediately push',()=>{
  for(const mode of [-1,120]) {
    const h=fixture();h.one.getRange(5,1).setValue(mode);send(h.context,event('不要強制啟動轉訊'));
    assert.equal(pushes(h).length,0);assert.equal(h.one.getRange(5,1).getValue(),mode);assert.equal(h.one.getRange(11,5).getValue(),0);
  }
});

run('successful upload sends both the source reminder card and attachment after commit',()=>{
  const h=fixture(),c=h.context;fakeDownload(c);
  const original=c.tell_to_LearnBot;
  c.tell_to_LearnBot=(...args)=>{assert.equal(h.one.getRange(11,13).getValue(),'已備份');assert.ok(h.files.has(h.one.getRange(11,11).getValue()));return original(...args);};
  send(c,event('',ADMIN,C1,{id:'forward-image',type:'image'}));
  assert.deepEqual(pushes(h).map(r=>r.payload.messages[0].type),['flex','image']);
  assert.match(JSON.stringify(pushes(h)[0]),/forward-image.jpg/);assert.equal(h.one.getRange(11,5).getValue(),1);
});

run('failed upload remains recorded without a misleading successful forwarding card',()=>{
  const h=fixture();fakeDownload(h.context);h.folders.get('folder-one').fail=true;
  assert.throws(()=>send(h.context,event('',ADMIN,C1,{id:'forward-fail',type:'image'})),/could not finish/);
  assert.equal(pushes(h).length,0);assert.match(h.one.getRange(11,13).getValue(),/備份失敗/);
});

run('forwarded sticker is accompanied by source metadata and does not carry the source quote',()=>{
  const h=fixture();send(h.context,event('',ADMIN,C1,{id:'forward-sticker',type:'sticker',packageId:'11537',stickerId:'52002745',quoteToken:'source-only'}));
  assert.deepEqual(pushes(h).map(r=>r.payload.messages[0].type),['flex','sticker']);
  assert.equal(pushes(h)[1].payload.messages[0].quoteToken,undefined);assert.match(h.one.getRange(11,11).getValue(),/source-only/);
  assert.equal(h.one.getRange(11,5).getValue(),1);
});

run('failed source card is not overwritten as success when attachment delivery succeeds',()=>{
  const h=fixture();h.context.tell_to_LearnBot=()=>2;
  send(h.context,event('',ADMIN,C1,{id:'partial-sticker',type:'sticker',packageId:'1',stickerId:'1'}));
  assert.equal(pushes(h).length,1);assert.equal(h.one.getRange(11,5).getValue(),2);
});

run('no reply token still forwards and a redelivered content event does not push twice',()=>{
  const h=fixture(),e=event('只用 Push');delete e.replyToken;
  send(h.context,e);send(h.context,e);assert.equal(pushes(h).length,1);assert.equal(h.one.getRange(6,1).getValue(),3);
});

run('numeric group labels are rendered as strings in forwarding cards',()=>{
  const h=fixture();h.one.getRange(3,1).setValue(914);send(h.context,event('數字群名'));
  const fields=pushes(h)[0].payload.messages[0].contents.body.contents.filter(x=>x.type==='text');
  assert.ok(fields.every(x=>typeof x.text==='string'));assert.ok(fields.some(x=>x.text==='914'));
});

run('real HTTP failures keep their content and are marked as forwarding failures',()=>{
  const h=fixture();h.context.learningBot_notify=()=>{};
  h.context.UrlFetchApp.fetch=(url,options)=>{h.requests.push({url,payload:JSON.parse(options.payload||'{}')});return {getResponseCode:()=>429,getContentText:()=>'{"message":"You have reached your monthly limit."}'};};
  send(h.context,event('必須保存'));assert.equal(h.one.getRange(11,10).getValue(),'必須保存');assert.equal(h.one.getRange(11,5).getValue(),2);
});

console.log('PASS: 13 additional forwarding regression scenarios; no external messages.');

