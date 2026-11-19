// Browser-local edits with a one-time published schedule baseline.
// A future authenticated database adapter can replace this boundary.
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./construction-core.js'));else root.ConstructionStore=factory(root.ConstructionCore);})(typeof globalThis!=='undefined'?globalThis:this,function(core){
 'use strict';const KEY='highnoon-construction-v1',REVISION='2026-11-19-approved-8';
 function check(items){if(!Array.isArray(items)||items.length>500)throw Error('공사는 최대 500건까지 저장할 수 있습니다.');const ids=new Set();items.forEach(item=>{const error=core.validate(item);if(error)throw Error(error);if(typeof item.id!=='string'||!item.id||item.id.length>100||ids.has(item.id))throw Error('공사 식별정보를 확인해 주세요.');ids.add(item.id);});return items;}
 async function list(){
  const text=localStorage.getItem(KEY);
  if(text){const stored=JSON.parse(text);if(stored.schema!==1)throw Error('저장 형식을 확인해 주세요.');const items=check(stored.items);if(items.length||stored.initialRevision)return items;}
  // Only an uninitialized or older empty browser receives the published baseline.
  if(typeof window==='undefined')return [];
  const initial=window.HighnoonConstructionInitial;
  if(!initial||initial.revision!==REVISION)throw Error('공사 기본 자료를 불러오지 못했습니다.');
  const items=check(initial.items.map(item=>({...item})));
  localStorage.setItem(KEY,JSON.stringify({schema:1,initialRevision:REVISION,items}));
  return items;
 }
 async function replace(items){check(items);localStorage.setItem(KEY,JSON.stringify({schema:1,initialRevision:REVISION,items}));return items;}
 async function upsert(item){const items=await list();const i=items.findIndex(x=>x.id===item.id);if(i<0)items.push(item);else items[i]=item;return replace(items);}
 async function remove(id){return replace((await list()).filter(x=>x.id!==id));}
 return {list,upsert,remove,replace,check,mode:'local'};
});