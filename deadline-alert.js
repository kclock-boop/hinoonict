(() => {
 'use strict';
 const dialog=document.querySelector('#deadline-alert');
 if(!dialog||typeof ConstructionCore==='undefined'||typeof ConstructionStore==='undefined')return;
 const C=ConstructionCore,S=ConstructionStore,E=C.escape,status=document.querySelector('#deadline-alert-status');
 let dismissed=false,pending=false,opened=false,refreshToken=0;
 function setStatus(text,error=false){if(!status)return;status.textContent=text;status.classList.toggle('error',error);}
 function dueTomorrow(items,day=C.today()){return items.filter(item=>item.stage!=='completed'&&C.days(day,item.end)===1).sort((a,b)=>a.name.localeCompare(b.name,'ko'));}
 function closeAlert(){dismissed=true;pending=false;dialog.close();setStatus('마감 하루 전 알림을 확인했습니다. 다시 보려면 ‘마감 알림 확인’을 누르세요.');}
 document.querySelector('#close-deadline-alert').addEventListener('click',closeAlert);
 document.querySelector('#acknowledge-deadline-alert').addEventListener('click',closeAlert);
 dialog.addEventListener('cancel',event=>{event.preventDefault();closeAlert();});
 dialog.addEventListener('close',()=>{opened=false;});
 const manual=document.querySelector('#check-deadline-alert');if(manual)manual.addEventListener('click',()=>{dismissed=false;refresh(true);});
 async function refresh(force=false){
  const token=++refreshToken;
  try{
   const day=C.today(),all=await S.list();
   const items=dueTomorrow(all,day),today=all.filter(x=>x.stage!=='completed'&&C.days(day,x.end)===0).length,twoDays=all.filter(x=>x.stage!=='completed'&&C.days(day,x.end)===2).length;
   if(token!==refreshToken)return;
   setStatus('알림 기준일 '+day+' (한국) · 마감 1일 전 '+items.length+'건 · 당일 '+today+'건 · 2일 전 '+twoDays+'건. 팝업은 1일 전 공사만 표시합니다.');
   if(!items.length){pending=false;if(dialog.open)dialog.close();return;}
   if(dismissed&&!dialog.open)return;
   if(window.HighnoonDemo?.active&&new URLSearchParams(location.search).get('demo_alert')==='off'&&!force&&!dialog.open)return;
   document.querySelector('#deadline-alert-count').textContent='마감 1일 전 공사 '+items.length+'건';
   document.querySelector('#deadline-alert-list').innerHTML=items.map(item=>'<li class="deadline-alert-item"><div class="deadline-alert-item-top"><span>'+E(item.category)+' · '+E(C.stages[item.stage])+'</span><span class="deadline-alert-due">D-1 · 내일 마감</span></div><h3>공사번호 '+E(item.name)+'</h3><p>공사기간: '+E(item.start)+' ~ '+E(item.end)+'</p><p>작업장 주소: '+E(item.address||'미기재')+'</p></li>').join('');
   if(dialog.open)return;
   if([...document.querySelectorAll('dialog[open]')].some(other=>other!==dialog)){pending=true;setStatus('마감 1일 전 공사 '+items.length+'건이 있습니다. 현재 열려 있는 다른 안내를 닫으면 마감 알림이 표시됩니다.');return;}
   pending=false;
   if(typeof dialog.showModal!=='function'){setStatus('마감 1일 전 공사 '+items.length+'건이 있습니다. 이 브라우저에서 팝업을 표시하지 못했습니다. 공사관리 화면에서 확인해 주세요.',true);return;}
   dialog.showModal();opened=true;
  }catch{pending=false;setStatus('마감 알림을 확인하지 못했습니다. 공사관리 화면에서 저장 내용을 확인하고 다시 시도해 주세요.',true);}
 }
 document.addEventListener('close',event=>{if(event.target!==dialog&&pending&&!dismissed)refresh();},true);
 window.addEventListener('storage',()=>{if(!dismissed||opened)refresh();});
 window.addEventListener('pageshow',event=>{if(event.persisted)dismissed=false;if(!dismissed)refresh();});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!dismissed)refresh();});
 refresh();
})();