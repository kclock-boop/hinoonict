(() => {
 'use strict';
 const dialog=document.querySelector('#deadline-alert');
 if(!dialog||typeof ConstructionCore==='undefined'||typeof ConstructionStore==='undefined')return;
 const C=ConstructionCore,S=ConstructionStore,E=C.escape;
 let dismissed=false,pending=false,opened=false,refreshToken=0;
 function dueTomorrow(items,day=C.today()){
  return items.filter(item=>item.stage!=='completed'&&C.days(day,item.end)===1).sort((a,b)=>a.name.localeCompare(b.name,'ko'));
 }
 function closeAlert(){dismissed=true;pending=false;dialog.close();}
 document.querySelector('#close-deadline-alert').addEventListener('click',closeAlert);
 document.querySelector('#acknowledge-deadline-alert').addEventListener('click',closeAlert);
 dialog.addEventListener('cancel',event=>{event.preventDefault();closeAlert();});
 dialog.addEventListener('close',()=>{opened=false;});
 async function refresh(){
  const token=++refreshToken;
  try{
   const items=dueTomorrow(await S.list());
   if(token!==refreshToken)return;
   if(!items.length){pending=false;if(dialog.open)dialog.close();return;}
   if(dismissed&&!dialog.open)return;
   document.querySelector('#deadline-alert-count').textContent='마감 1일 전 공사 '+items.length+'건';
   document.querySelector('#deadline-alert-list').innerHTML=items.map(item=>'<li class="deadline-alert-item"><div class="deadline-alert-item-top"><span>'+E(item.category)+' · '+E(C.stages[item.stage])+'</span><span class="deadline-alert-due">D-1 · 내일 마감</span></div><h3>공사번호 '+E(item.name)+'</h3><p>공사기간: '+E(item.start)+' ~ '+E(item.end)+'</p><p>작업장 주소: '+E(item.address||'미기재')+'</p></li>').join('');
   if(dialog.open)return;
   if([...document.querySelectorAll('dialog[open]')].some(other=>other!==dialog)){pending=true;return;}
   pending=false;opened=true;dialog.showModal();
  }catch{pending=false;}
 }
 // Wait for another modal (e.g. app installation) to close rather than stacking dialogs.
 document.addEventListener('close',event=>{if(event.target!==dialog&&pending&&!dismissed)refresh();},true);
 window.addEventListener('storage',()=>{if(!dismissed||opened)refresh();});
 window.addEventListener('pageshow',event=>{if(event.persisted){dismissed=false;refresh();}});
 refresh();
})();