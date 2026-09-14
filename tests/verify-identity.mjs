import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src');
const sources = Object.fromEntries(fs.readdirSync(directory).filter(n=>n.endsWith('.js')).map(n=>[n,fs.readFileSync(path.join(directory,n),'utf8')]));
for (const [name,source] of Object.entries(sources)) {
  new vm.Script(source,{filename:name});
  assert.doesNotMatch(source,/notify-api\.line\.me|\bnotify_CHANNEL_ACCESS_TOKEN\b/);
  if (name!=='sheetIdentity.js') assert.doesNotMatch(source,/\.getSheetByName\(/,name);
}
const C1='C11111111111111111111111111111111';
const C2='C22222222222222222222222222222222';
const C3='C33333333333333333333333333333333';
const ADMIN='Uaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
let assertions = 0;

function harness(options={}) {
  const props=options.emptyConfig?{}:{LINE_CHANNEL_ACCESS_TOKEN:'mock-token',ADMINISTRATOR_LINE_USER_ID:ADMIN,LEARNING_CENTER_CHAT_ID:'',DESTINATION_FOLDER_ID:'mock-root',WEBHOOK_KEY:'test-webhook-key',BOT_INITIALIZED_SPREADSHEET_ID:'test-sheet'}, folders=new Map(), files=new Map(), requests=[], logs=[], installed=[];
  let ss, nextId=100, lockHeld=false;
  class Range {
    constructor(sheet,row,col,rows=1,cols=1) { Object.assign(this,{sheet,row,col,rows,cols}); if(row<1 || rows<1 || row+rows-1>sheet.maxRows) throw Error('Range outside grid'); }
    getValue(){return this.sheet.cells[`${this.row},${this.col}`]??'';}
    getValues(){return Array.from({length:this.rows},(_,r)=>Array.from({length:this.cols},(_,c)=>this.sheet.cells[`${this.row+r},${this.col+c}`]??''));}
    setValue(value){this.sheet.cells[`${this.row},${this.col}`]=value;return this;}
    setValues(values){values.forEach((row,r)=>row.forEach((v,c)=>{this.sheet.cells[`${this.row+r},${this.col+c}`]=v;}));return this;}
    setRichTextValue(value){return this.setValue(value.text);}
    setNumberFormat(){return this;} setFontFamily(){return this;} setFontSize(){return this;}
    setVerticalAlignment(){return this;} setHorizontalAlignment(){return this;} setFontWeight(){return this;}
    setWrap(){return this;} setBorder(){return this;} setBackground(){return this;}
    getRow(){return this.row;}
    getLastRow(){return this.row+this.rows-1;}
    getColumn(){return this.col;}
    getSheet(){return this.sheet;}
    createTextFinder(text){return {findAll:()=>{const found=[];this.getValues().forEach((row,r)=>row.forEach((v,c)=>{if(String(v).includes(text))found.push(new Range(this.sheet,this.row+r,this.col+c));}));return found;}};}
  }
  class Sheet {
    constructor(name,id,cells={}){Object.assign(this,{name,id,cells,maxRows:1000});}
    getMaxRows(){return this.maxRows;} getMaxColumns(){return this.maxColumns||26;}
    insertRowsAfter(_r,n){this.maxRows+=n;return this;}
    insertColumnsAfter(_c,n){this.maxColumns=this.getMaxColumns()+n;return this;}
    setColumnWidth(){return this;} setRowHeight(){return this;} setFrozenRows(){return this;}
    getSheetId(){return this.id;}
    getName(){return this.name;}
    setName(name){if(ss.sheets.some(s=>s!==this&&s.name.toLowerCase()===name.toLowerCase()))throw Error('Duplicate name');this.name=name;return this;}
    getRange(...args){return new Range(this,...args);}
    getLastRow(){return Math.max(1,...Object.keys(this.cells).filter(k=>this.cells[k]!=='').map(k=>Number(k.split(',')[0])));}
    getIndex(){return ss.sheets.indexOf(this)+1;}
    appendRow(values){const row=this.getLastRow()+1;values.forEach((v,c)=>{if(v!==undefined)this.cells[`${row},${c+1}`]=v;});return this;}
  }
  function iterator(values){let index=0;return {hasNext:()=>index<values.length,next:()=>values[index++]};}
  function addFile(folder,name){
    const file={id:'file-'+(++nextId),name,folder,trashed:false,getSharingAccess(){return this.access||'ANYONE_WITH_LINK';},getUrl(){return 'https://drive.google.com/file/d/'+this.id+'/view';},getId(){return this.id;},getName(){return this.name;},isTrashed(){return this.trashed;},getParents(){return iterator([this.folder]);},getDownloadUrl(){return 'https://drive.google.com/download/'+this.id;}};
    files.set(file.id,file);return file;
  }
  function addFolder(id,name){const folder={id,name,fail:false,trashed:false,getSharingAccess(){return this.access||'ANYONE_WITH_LINK';},getUrl(){return 'https://drive.google.com/file/d/'+this.id+'/view';},getId(){return this.id;},getName(){return this.name;},isTrashed(){return this.trashed;},setName(name){if(this.fail)throw Error('Drive denied');this.name=name;return this;},createFolder(name){return addFolder('folder-'+(++nextId),name);},createFile(blob){if(this.fail)throw Error('Drive upload denied');return addFile(this,blob.name);},getFilesByName(name){return iterator([...files.values()].filter(f=>f.folder===this&&f.name===name&&!f.trashed));}};folders.set(id,folder);return folder;}
  ss={sheets:[],getId:()=> 'test-sheet',getSheets(){return this.sheets;},getSheetByName(name){return this.sheets.find(s=>s.name===name)||null;},getSheetById(id){return this.sheets.find(s=>s.id===id)||null;},insertSheet(name,index){assert.equal(index,this.sheets.length);const sheet=new Sheet(name,++nextId,{});this.sheets.push(sheet);return sheet;},getUrl:()=> 'https://docs.google.com/spreadsheets/d/test-sheet/edit'};
  const template=new Sheet('templet',0,{'1,3':'所有userid','1,7':'nicknameII','1,9':'type','3,1':'','4,1':'','5,1':0,'6,1':0,'7,1':'--','8,1':'--','9,1':''});
  const data=(label,folder)=>({...template.cells,'2,1':ADMIN,'3,1':label,'4,1':folder,'5,1':-1,'6,1':2,'2,3':ADMIN,'2,4':'既有使用者','9,6':ADMIN,'9,7':'既有使用者','9,8':'2026-09-14T08:00:00.000Z','9,9':'text','9,10':'搜尋原有資料','9,11':'{}','10,6':ADMIN,'10,7':'既有使用者','10,8':'2026-09-14T08:01:00.000Z','10,9':'text','10,10':'第二筆','10,11':'{}'});
  const one=new Sheet(C1,124477800,data('媒體產業研究','folder-one'));
  const two=new Sheet(C2,962843819,data('自主學習研究進度','folder-two'));
  ss.sheets.push(template,one,two);
  addFolder('folder-one',C1);addFolder('folder-two',C2);
  const context=vm.createContext({console:{log:(...a)=>logs.push(a),error:(...a)=>logs.push(a)},DriveApp:{Access:{ANYONE:'ANYONE',ANYONE_WITH_LINK:'ANYONE_WITH_LINK',PRIVATE:'PRIVATE'},createFolder(name){return addFolder('root-'+(++nextId),name);},getFileById(id){if(!files.has(id))throw Error('File not found');return files.get(id);},getFolderById(id){if(!folders.has(id))throw Error('Folder not found');return folders.get(id);}},SpreadsheetApp:{getActiveSpreadsheet:()=>options.standalone?null:ss,openById(id){if(id!==ss.getId())throw Error('Unknown spreadsheet');return ss;},create(){return ss;},flush(){},newRichTextValue(){const b={setText(text){this.text=text;return this;},build(){return {text:this.text};}};return b;}},PropertiesService:{getScriptProperties:()=>({getProperties:()=>({...props}),getProperty:key=>props[key]??null,setProperty(key,value){props[key]=value;},deleteProperty(key){delete props[key];}})},LockService:{getScriptLock:()=>({waitLock(){assert.equal(lockHeld,false,'No nested locks');lockHeld=true;},releaseLock(){lockHeld=false;}})},ScriptApp:{EventType:{ON_EDIT:'EDIT',ON_CHANGE:'CHANGE'},getProjectTriggers:()=>installed,newTrigger(name){let type,spreadsheet;const b={forSpreadsheet(s){spreadsheet=s;return b;},onEdit(){type='EDIT';return b;},onChange(){type='CHANGE';return b;},create(){const t={getHandlerFunction:()=>name,getEventType:()=>type,getTriggerSourceId:()=>spreadsheet.getId()};installed.push(t);return t;}};return b;}},ContentService:{createTextOutput:text=>text},UrlFetchApp:{fetch:(url,options)=>{const payload=JSON.parse(options.payload||'{}');requests.push({url,payload});return{getResponseCode:()=>200,getContentText:()=> '{}' };}},Utilities:{getUuid:()=> 'test-random-'+(++nextId)},Logger:{log(){}}});
  for (const [name,source] of Object.entries(sources)) vm.runInContext(source,context,{filename:name});
  context.learnBot_CHANNEL_ACCESS_TOKEN='mock-token';
  if(context.destinationFolderID)addFolder(context.destinationFolderID,'root');
  context.getPushNum=()=>0;
  context.getUsername=()=>'(未設定)';context.onClass=()=> '課堂進行中';
  return {context,ss,one,two,template,props,folders,files,addFile,requests,logs,installed,Sheet};
}

function run(name,fn){fn();assertions++;console.log('PASS: '+name);}

run('register + migration preserves IDs, log data, template, A4 and ordering',()=>{
  const {context:c,one,two,template,folders,ss}=harness();
  const before=JSON.stringify(ss.sheets.map(s=>s.cells));
  c.registerReadableNames();
  assert.equal(one.name,C1);assert.equal(folders.get('folder-one').name,C1);
  assert.equal(JSON.stringify(ss.sheets.map(s=>s.cells)),before);
  c.initializeReadableNames();
  assert.equal(one.name,'媒體產業研究');assert.equal(two.name,'自主學習研究進度');
  assert.equal(folders.get('folder-one').name,one.name);
  assert.equal(folders.get('folder-two').name,two.name);
  assert.equal(JSON.stringify(ss.sheets.map(s=>s.cells)),before);
  assert.equal(template.name,'templet');assert.equal(c.botSheet_(C1),one);assert.equal(c.botSheet_(C2),two);
  c.botRegistryCache_=null;assert.equal(c.botSheet_(C1),one,'Mapping survives a new execution');
});

run('renamed sheets without a registry are never guessed from another installation',()=>{
  const {context:c,one,two,ss}=harness();
  one.setName('手動改名');two.setName('另一張表');
  assert.equal(c.botSheet_(C1),null);
  assert.equal(c.botManagedSheets_().length,0);
  assert.equal(ss.sheets.length,3);
});

run('manual tab rename synchronizes folder/A3, write/search use fixed ID',()=>{
  const {context:c,one,folders,ss}=harness();c.initializeReadableNames();
  one.setName('新名稱 / 可手動管理'.replace('/','／'));
  c.backupBotNameChanged({source:ss,changeType:'OTHER'});
  assert.equal(one.getRange(3,1).getValue(),one.name);assert.equal(folders.get('folder-one').name,one.name);
  c.writetoSheet(C1,11,10,'新增後可搜尋');c.writetoSheet(C1,11,9,'text');
  assert.equal(one.getRange(11,10).getValue(),'新增後可搜尋');
  let found;
  c.show_searchResult=(_r,id,text,results)=>{found={id,text,rows:results.map(r=>r.getRow())};};
  c.carouselInfobySearch('mock-reply',C1,'新增後',1);
  assert.equal(found.id,C1);assert.deepEqual([...found.rows],[11]);
  c.carouselInfobySearch('mock-reply',C1,'搜尋原有',1);assert.deepEqual([...found.rows],[9]);
  c.carouselInfobySearch('mock-reply',one.name,'搜尋原有',1);assert.equal(found.id,C1);
});

run('manual A3 + //取名 equivalent handles duplicate/invalid names and stable IDs',()=>{
  const {context:c,one,two,folders,ss}=harness();c.initializeReadableNames();
  one.getRange(3,1).setValue('新/A3:*名稱');
  c.backupBotNameEdited({source:ss,range:one.getRange(3,1)});
  assert.equal(one.name,'新 A3 名稱');assert.equal(folders.get('folder-one').name,one.name);
  c.writetoSheet(C2,3,1,one.name);assert.equal(two.name,'新 A3 名稱 (2)');
  assert.equal(two.getRange(3,1).getValue(),two.name);assert.equal(c.botSheet_(C2),two);
  c.writetoSheet(C1,3,1,'templet');assert.notEqual(one.name,'templet');
  c.writetoSheet(C1,3,1,'長'.repeat(120));assert.ok(one.name.length<=100);
});

run('new group builds schema once, uses readable name, appends without shifting old tabs',()=>{
  const {context:c,one,two,template,ss,folders}=harness();c.initializeReadableNames();
  const before=JSON.stringify(template.cells);
  const newSheet=c.checkSheetExist(C3,ADMIN);
  assert.equal(ss.sheets.length,4);assert.equal(one.getIndex(),2);assert.equal(two.getIndex(),3);
  assert.equal(newSheet.name,'新群組');assert.equal(newSheet.getRange(2,1).getValue(),ADMIN);
  assert.equal(newSheet.getRange(6,1).getValue(),0);assert.equal(newSheet.getRange(9,10).getValue(),'');
  assert.equal(folders.get(newSheet.getRange(4,1).getValue()).name,newSheet.name);
  assert.equal(c.checkSheetExist(C3,ADMIN),newSheet);assert.equal(ss.sheets.length,4);
  assert.equal(JSON.stringify(template.cells),before);
});

run('text webhook after rename appends into the same sheet without creating duplicates',()=>{
  const {context:c,one,ss}=harness();c.initializeReadableNames();
  const count=one.getRange(6,1).getValue();
  c.doPost({parameter:{key:'test-webhook-key'},postData:{contents:JSON.stringify({events:[{type:'message',source:{type:'group',groupId:C1,userId:ADMIN},timestamp:1789354800000,replyToken:'mock',message:{id:'id-regression',type:'text',text:'新訊息 identity regression'}}]})}});
  assert.equal(ss.sheets.length,3);assert.equal(one.getRange(11,10).getValue(),'新訊息 identity regression');
  assert.equal(one.getRange(6,1).getValue(),count+1);
});

run('file upload path still reads A4 via raw chat ID after tab/folder rename',()=>{
  const {context:c,one,folders}=harness();c.initializeReadableNames();
  assert.equal(c.readSheettoValue(C1,c.uploadFolder_rNum,c.host_cNum),'folder-one');
  assert.equal(c.GoogleDrive.getFolderById(c.readSheettoValue(C1,4,1)),folders.get('folder-one'));
  assert.equal(one.getRange(9,10).getValue(),'搜尋原有資料');
});

run('system/timing cards carry stable chat IDs; broadcast pushes to LINE ID not label',()=>{
  const {context:c,one,two,ss,requests}=harness();c.initializeReadableNames();
  const text=JSON.stringify(c.fileList_detailed(0,C1));
  assert.ok(text.includes(C1));assert.ok(text.includes(C2));
  const system=JSON.stringify(c.fileList_detailed(1,C1));assert.ok(system.includes(C1));
  assert.equal(c.botCallbackChat_({chatId:C1},2),C1);
  assert.equal(c.botCallbackChat_({},1),C1);
  // New callbacks remain correct after a user reorders tabs.
  ss.sheets.splice(1,2,two,one);assert.equal(c.botCallbackChat_({chatId:C1},1),C1);
  c.sendBroadCast(C1,C2,8,9,'mock-reply');
  const broadcast=requests.filter(r=>r.payload.to===C2).at(-1);
  assert.equal(broadcast.payload.messages[0].text,'搜尋原有資料');
  assert.ok(requests.every(r=>!r.payload.to||/^[UCR][0-9a-f]{32}$/i.test(r.payload.to)));
  assert.equal(c.botBroadcastChat_(C2),C2);
});

run('search at bottom of grid and empty template do not exceed grid bounds',()=>{
  const {context:c,one}=harness();c.initializeReadableNames();
  one.maxRows=10;c.show_searchResult=()=>{};c.carouselInfobySearch('mock',C1,'資料',1);
  Object.keys(one.cells).filter(k=>Number(k.split(',')[0])>=9).forEach(k=>delete one.cells[k]);
  assert.doesNotThrow(()=>c.carouselInfobySearch('mock',C1,'無資料',1));
});

run('Drive failure is retryable; no data loss or ID drift',()=>{
  const {context:c,one,folders,ss}=harness();c.initializeReadableNames();
  const folder=folders.get('folder-one');folder.fail=true;one.setName('手動新名');
  assert.throws(()=>c.backupBotNameChanged({source:ss,changeType:'OTHER'}),/Drive denied/);
  assert.equal(c.botSheet_(C1),one);assert.equal(one.getRange(9,10).getValue(),'搜尋原有資料');
  folder.fail=false;c.syncReadableNames();assert.equal(folder.name,'手動新名');
  assert.equal(one.getRange(3,1).getValue(),'手動新名');
});

run('missing registered sheet / changed A4 fail closed without creating replacement',()=>{
  const {context:c,ss,one,folders}=harness();c.initializeReadableNames();
  one.getRange(4,1).setValue('folder-two');
  assert.throws(()=>c.botRename_(C1,'錯誤目標'),/A4/);
  assert.equal(folders.get('folder-two').name,'自主學習研究進度');
  ss.sheets=ss.sheets.filter(s=>s!==one);
  assert.throws(()=>c.checkSheetExist(C1,ADMIN),/missing/);assert.equal(ss.sheets.length,2);
});

run('install name-sync triggers idempotently without deleting reminder triggers',()=>{
  const {context:c,installed}=harness();c.initializeReadableNames();
  c.installReadableNameSync();c.installReadableNameSync();assert.equal(installed.length,2);
});

console.log(`PASS: ${assertions} identity/name regression scenarios; ${Object.keys(sources).length} files parse. All Google/LINE operations mocked; no external messages or test data written.`);

export {harness,run,C1,C2,C3,ADMIN};

