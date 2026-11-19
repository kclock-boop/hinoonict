// Storage adapter: replace this boundary when authenticated database access is connected.
// No credentials or remote endpoint are used in this browser-only release.
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./construction-core.js'));else root.ConstructionStore=factory(root.ConstructionCore);})(typeof globalThis!=='undefined'?globalThis:this,function(core){
 'use strict';const demo=typeof window!=='undefined'&&window.HighnoonDemo?.active;const KEY=demo?window.HighnoonDemo.constructionKey:'highnoon-construction-v1';const storage=()=>demo?sessionStorage:localStorage;
 function check(items){if(!Array.isArray(items)||items.length>500)throw Error('공사는 최대 500건까지 저장할 수 있습니다.');const ids=new Set();items.forEach(item=>{const error=core.validate(item);if(error)throw Error(error);if(typeof item.id!=='string'||!item.id||item.id.length>100||ids.has(item.id))throw Error('공사 식별정보를 확인해 주세요.');ids.add(item.id);});return items;}
 async function list(){let text=storage().getItem(KEY);if(!text&&demo){const initial={schema:1,items:window.HighnoonDemo.examples()};text=JSON.stringify(initial);storage().setItem(KEY,text);}if(!text)return [];const stored=JSON.parse(text);if(stored.schema!==1)throw Error('저장 형식을 확인해 주세요.');return check(stored.items);}
 async function replace(items){check(items);storage().setItem(KEY,JSON.stringify({schema:1,items}));return items;}
 async function upsert(item){const items=await list();const i=items.findIndex(x=>x.id===item.id);if(i<0)items.push(item);else items[i]=item;return replace(items);}
 async function remove(id){return replace((await list()).filter(x=>x.id!==id));}
 return {list,upsert,remove,replace,check,mode:demo?'demo':'local'};
});