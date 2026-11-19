(() => {
 'use strict';
 const steps=[
 {id:'home',title:'기업소개 · 첫 화면',description:'회사 소개와 KT 협력사 안내, 주요 사업과 연혁을 둘러봅니다. 화면 안의 회사소개 메뉴도 눌러보세요.',url:'index.html?demo=1&demo_alert=off#main'},
 {id:'business',title:'사업분야 · 주요실적',description:'네트워크·영상·방송·전화설비와 유지보수 사업을 확인하고 아래의 주요 수행 사례까지 살펴봅니다.',url:'index.html?demo=1&demo_alert=off#business'},
 {id:'field',title:'현장사진',description:'현장 작업자 사진과 설명을 확인합니다. 아래로 내려 회사연혁과 문의 안내도 볼 수 있습니다.',url:'index.html?demo=1&demo_alert=off#fieldwork'},
 {id:'projects',title:'중요공사기간관리',description:'예시 8건을 보드·목록으로 살펴보세요. 공사 등록·수정·완료 처리, 날짜 필터, 백업·인쇄를 직접 시연할 수 있습니다.',url:'construction.html?demo=1'},
 {id:'alerts',title:'마감 1일 전 팝업',description:'접속 즉시 내일 마감인 예시 3건이 팝업에 표시됩니다. 깜빡임, 닫기와 ‘마감 알림 확인’으로 다시 열기를 확인하세요.',url:'index.html?demo=1&demo_alert=on#main'},
 {id:'incident',title:'장애발생 보고서',description:'예시가 입력되어 있습니다. 사진을 추가한 뒤 ‘보고서 확인하기’에서 파일 저장·인쇄/PDF와 임시저장을 보여주세요.',url:'incident.html?demo=1'},
 {id:'ethics',title:'비윤리 신고 · 문의',description:'신고·보상 안내와 처리결과 확인 탭을 둘러보고 예시 신고 메일을 준비해 보세요. 실제 메일·전화 연결은 차단됩니다.',url:'ethics.html?demo=1#report'},
 {id:'app',title:'휴대폰 · 앱 설치 안내',description:'휴대폰 화면으로 바꾸어 하단 빠른 메뉴와 기기별 앱 설치 안내를 보여주세요. 실제 앱 설치는 실제 홈페이지에서 진행합니다.',url:'index.html?demo=1&demo_alert=off#app'}
 ];
 const frame=document.querySelector('#demo-frame'),nav=document.querySelector('#tour-steps');let selected=0;
 nav.innerHTML=steps.map((step,i)=>'<button type="button" data-step="'+i+'"><span>'+String(i+1).padStart(2,'0')+'</span>'+step.title+'</button>').join('');
 function show(index){selected=Math.max(0,Math.min(steps.length-1,index));const step=steps[selected];nav.querySelectorAll('button').forEach((button,i)=>{if(i===selected)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});document.querySelector('#step-counter').textContent='STEP '+String(selected+1).padStart(2,'0')+' / '+String(steps.length).padStart(2,'0');document.querySelector('#step-title').textContent=step.title;document.querySelector('#step-description').textContent=step.description;document.querySelector('#previous-step').disabled=selected===0;document.querySelector('#next-step').disabled=selected===steps.length-1;document.querySelector('#open-demo-tab').href=step.url;document.querySelector('#frame-loading').hidden=false;frame.src=step.url;history.replaceState(null,'','#'+step.id);const active=nav.querySelector('[aria-current=step]');if(active&&nav.scrollWidth>nav.clientWidth){nav.scrollLeft=Math.max(0,active.offsetLeft-nav.offsetLeft-12);}}
 nav.addEventListener('click',event=>{const button=event.target.closest('[data-step]');if(button)show(Number(button.dataset.step));});
 document.querySelector('#previous-step').addEventListener('click',()=>show(selected-1));document.querySelector('#next-step').addEventListener('click',()=>show(selected+1));
 function phone(enabled){frame.classList.toggle('phone',enabled);document.querySelector('#phone-preview').setAttribute('aria-pressed',String(enabled));document.querySelector('#desktop-preview').setAttribute('aria-pressed',String(!enabled));}
 document.querySelector('#desktop-preview').addEventListener('click',()=>phone(false));document.querySelector('#phone-preview').addEventListener('click',()=>phone(true));frame.addEventListener('load',()=>{document.querySelector('#frame-loading').hidden=true;});
 document.querySelector('#reset-demo').addEventListener('click',async()=>{if(!confirm('시연용 공사와 보고서 예시만 초기화할까요? 실제 등록 자료는 변경하지 않습니다.'))return;sessionStorage.removeItem('highnoon-demo-construction-v1');sessionStorage.removeItem('highnoon-demo-day');try{await new Promise(resolve=>{const req=indexedDB.deleteDatabase('highnoon-incident-demo-drafts');req.onsuccess=req.onerror=req.onblocked=()=>resolve();});}catch{}show(0);});
 const initial=steps.findIndex(step=>step.id===location.hash.slice(1));show(initial<0?0:initial);
 window.addEventListener('hashchange',()=>{const index=steps.findIndex(step=>step.id===location.hash.slice(1));if(index>=0&&index!==selected)show(index);});
 if('serviceWorker' in navigator&&window.isSecureContext)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).catch(()=>{}));
})();