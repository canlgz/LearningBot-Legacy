import assert from 'node:assert/strict';
import {harness,run,C1,C2,ADMIN} from './verify-identity.mjs';

function checkTextFields(value,path='messages') {
  if (!value || typeof value !== 'object') return;
  for (const [key,child] of Object.entries(value)) {
    if (key==='text') {
      assert.equal(typeof child,'string',path+'.text must be a string');
      assert.ok(child.length,path+'.text must not be empty');
    }
    checkTextFields(child,path+'.'+key);
  }
}

run('broadcast entry accepts a numeric A3 label without changing the stored value',()=>{
  const {context:c,one,requests}=harness();c.initializeReadableNames();
  one.getRange(3,1).setValue(914);
  c.doPost({parameter:{key:'test-webhook-key'},postData:{contents:JSON.stringify({events:[{type:'message',source:{type:'group',groupId:C1,userId:ADMIN},timestamp:1789354800000,replyToken:'broadcast-numeric',message:{type:'text',id:'command-numeric',text:'//廣播'}}]})}});
  const reply=requests.find(r=>r.payload.replyToken==='broadcast-numeric');
  assert.ok(reply,'The menu must be generated after progress messages');
  checkTextFields(reply.payload.messages);
  assert.equal(reply.payload.messages[1].contents.contents[0].header.contents[0].text,'914');
  assert.equal(one.getRange(3,1).getValue(),914,'Do not rewrite user data to fix presentation');
});

run('broadcast menu remains valid with empty group names and no content',()=>{
  const {context:c,one,two}=harness();c.initializeReadableNames();
  one.getRange(3,1).setValue('');two.getRange(3,1).setValue(false);
  for(const sheet of [one,two])Object.keys(sheet.cells).filter(k=>Number(k.split(',')[0])>=9).forEach(k=>delete sheet.cells[k]);
  const messages=c.broadCast_flexing(c.plainMsg(['最近留言','目前次數','請選擇']),C1,true);
  checkTextFields(messages);
  assert.equal(messages[1].contents.contents[0].header.contents[0].text,one.getName());
});

run('validation mode does not send any progress or real LINE messages',()=>{
  const {context:c,requests}=harness();c.initializeReadableNames();
  const result=c.validateBroadcastMenu();
  assert.equal(result.status,200);
  assert.equal(requests.length,3);
  for(const request of requests){
    assert.equal(request.url,'https://api.line.me/v2/bot/message/validate/reply');
    assert.ok(!request.payload.replyToken && !request.payload.to);
  }
  assert.equal(requests[1].payload.messages[1].contents.contents[0].header.contents[0].text,914);
  assert.equal(requests[2].payload.messages[1].contents.contents[0].header.contents[0].text,'914');
});

function deliveryFixture(status,body={},options={}) {
  const h=harness(),c=h.context;c.initializeReadableNames();
  c.botSetOperation_(C1,ADMIN,'broadcast',{target:C2,rows:[9],status:'ready'});
  const replies=[],pushes=[];
  c.short_reply=(_token,texts)=>{if(options.ackError)throw Error('Reply token expired');replies.push(...texts);};
  c.UrlFetchApp.fetch=(url,request)=>{
    assert.equal(url,c.line_push_url);pushes.push(JSON.parse(request.payload));
    if(options.networkError)throw Error('Network timeout');
    return {getResponseCode:()=>status,getContentText:()=>JSON.stringify(body)};
  };
  return {...h,replies,pushes};
}

run('successful broadcast clears its draft and never resends on a repeated confirmation',()=>{
  const {context:c,pushes,replies}=deliveryFixture(200);
  assert.equal(c.botSendBroadcast_(C1,ADMIN,'reply'),true);
  assert.equal(c.botGetOperation_(C1,ADMIN,'broadcast'),null);
  c.botSendBroadcast_(C1,ADMIN,'reply-again');
  assert.equal(pushes.length,1);assert.equal(replies[0],'已完成送出。');
});

run('successful push still clears its draft when the acknowledgement fails',()=>{
  const {context:c,pushes}=deliveryFixture(200,{}, {ackError:true});
  assert.equal(c.botSendBroadcast_(C1,ADMIN,'expired'),true);
  assert.equal(c.botGetOperation_(C1,ADMIN,'broadcast'),null);assert.equal(pushes.length,1);
});

run('rejected media reports the actual LINE error, preserves content, and requires explicit preview',()=>{
  const {context:c,one,replies,pushes}=deliveryFixture(400,{message:'Invalid messages',details:[{property:'messages[1].stickerId',message:'Invalid sticker id'}]});
  const before=JSON.stringify(one.cells);
  assert.equal(c.botSendBroadcast_(C1,ADMIN,'reply'),false);
  assert.equal(c.botGetOperation_(C1,ADMIN,'broadcast').status,'failed');
  assert.match(replies[0],/HTTP 400/);assert.match(replies[0],/stickerId: Invalid sticker id/);
  assert.doesNotMatch(replies[0],/送出過久/);assert.equal(JSON.stringify(one.cells),before);
  c.botSendBroadcast_(C1,ADMIN,'again');assert.equal(pushes.length,1);
});

run('rate limit errors remain identifiable without leaking credentials or URLs',()=>{
  const {context:c,replies,logs}=deliveryFixture(429,{message:'Too many requests mock-token https://example.test/private'});
  assert.equal(c.botSendBroadcast_(C1,ADMIN,'reply'),false);
  assert.match(replies[0],/HTTP 429/);assert.match(replies[0],/Too many requests/);
  assert.doesNotMatch(JSON.stringify([replies,logs]),/mock-token|example.test/);
});

run('unknown network outcome remains locked instead of retrying or claiming timeout failure',()=>{
  const {context:c,replies,pushes}=deliveryFixture(0,{}, {networkError:true});
  assert.equal(c.botSendBroadcast_(C1,ADMIN,'reply'),null);
  assert.equal(c.botGetOperation_(C1,ADMIN,'broadcast').status,'sending');
  assert.match(replies[0],/無法確認/);
  c.botSendBroadcast_(C1,ADMIN,'again');assert.equal(pushes.length,1);
});

run('server errors preserve an uncertain delivery outcome',()=>{
  const {context:c,replies}=deliveryFixture(500,{message:'Internal server error'});
  assert.equal(c.botSendBroadcast_(C1,ADMIN,'reply'),null);
  assert.equal(c.botGetOperation_(C1,ADMIN,'broadcast').status,'sending');
  assert.match(replies[0],/HTTP 500/);assert.match(replies[0],/勿立即重送/);
});

run('content assembly failure sends no push and leaves a recoverable draft',()=>{
  const {context:c,replies,pushes}=deliveryFixture(200);
  c.botBuildBroadcastMessages_=()=>{throw Error('Saved upload is outside its registered folder.');};
  assert.equal(c.botSendBroadcast_(C1,ADMIN,'reply'),false);
  assert.equal(pushes.length,0);assert.match(replies[0],/組合內容失敗/);
  assert.equal(c.botGetOperation_(C1,ADMIN,'broadcast').status,'failed');
});

run('cross-chat broadcast, forwarding, and retrieval do not reuse source-chat quote tokens',()=>{
  const {context:c,one,requests}=harness();c.initializeReadableNames();
  const raw=JSON.stringify({type:'sticker',id:'original-message-id',packageId:'11537',stickerId:'52002745',quoteToken:'source-chat-only',stickerResourceType:'ANIMATION',keywords:['hello']});
  one.getRange(9,9).setValue('sticker');one.getRange(9,11).setValue(raw);
  const expected={type:'sticker',packageId:'11537',stickerId:'52002745'};
  const built=c.botBuildBroadcastMessages_(C1,0,0,[9]);
  assert.deepEqual(JSON.parse(JSON.stringify(built[0])),expected);
  assert.deepEqual(JSON.parse(JSON.stringify(c.ProcMsg('sticker','',raw)[0])),expected);
  c.retriveFile(C1,9,'retrieval');
  assert.deepEqual(JSON.parse(JSON.stringify(requests.at(-1).payload.messages[1])),expected);
  assert.equal(one.getRange(9,11).getValue(),raw,'Raw backup must remain faithful to the received event');
});

run('legacy sticker rows without quote tokens keep the same sticker IDs',()=>{
  const {context:c}=harness();
  assert.deepEqual(JSON.parse(JSON.stringify(c.botOutgoingSticker_('{"type":"sticker","packageId":"1","stickerId":"1"}'))),{type:'sticker',packageId:'1',stickerId:'1'});
  assert.throws(()=>c.botOutgoingSticker_('{}'),/貼圖缺少/);
});

console.log('PASS: 12 additional broadcast payload/delivery regression scenarios.');

