(() => {
 'use strict';
 const params=new URLSearchParams(location.search);
 if(params.get('demo')!=='1')return;
 const day=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 function date(offset){const d=new Date(day()+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+offset);return d.toISOString().slice(0,10);}
 const constructionKey='highnoon-demo-construction-v1';
 function examples(){return [
  ['001','초고속','ordered',1,'시연용 작업장 A'],['002','전용','in_progress',1,'시연용 작업장 B'],['003','무선','postponed',1,'시연용 작업장 C'],
  ['004','초고속','in_progress',0,'시연용 작업장 D'],['005','전용','ordered',0,'시연용 작업장 E'],['006','무선','ordered',0,'시연용 작업장 F'],
  ['007','초고속','in_progress',-3,'시연용 작업장 G'],['008','전용','completed',0,'시연용 작업장 H']
 ].map(([id,category,stage,end,address])=>({id:'demo-project-'+id,name:'DEMO-HN-'+id,category,stage,start:date(-5),end:date(end),completedAt:stage==='completed'?date(0):'',address:address+' (실제 주소 아님)',assignee:'',client:'',notes:stage==='postponed'?'예시: 작업 협의로 임시 연기. 기존 마감일 유지.':'시연용 예시 공사입니다.',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}));}
 window.HighnoonDemo={active:true,constructionKey,examples,day};
 try{if(sessionStorage.getItem('highnoon-demo-day')!==day()){sessionStorage.removeItem(constructionKey);sessionStorage.setItem('highnoon-demo-day',day());}}catch{}
 const style=document.createElement('link');style.rel='stylesheet';style.href='demo-runtime.css?v=20261119-14';document.head.append(style);
 function demoLink(href){const url=new URL(href,location.href);if(url.origin!==location.origin||!['http:','https:','file:'].includes(url.protocol))return null;if(url.pathname.endsWith('/demo.html'))return null;url.searchParams.set('demo','1');if(!url.searchParams.has('demo_alert')&&params.get('demo_alert'))url.searchParams.set('demo_alert',params.get('demo_alert'));return url.href;}
 document.addEventListener('click',event=>{
  if(event.target.closest('#native-install')){event.preventDefault();event.stopImmediatePropagation();const toast=document.querySelector('#demo-toast');if(toast){toast.hidden=false;toast.textContent='시연에서는 설치 안내만 제공합니다. 실제 앱 설치는 실제 홈페이지에서 진행하세요.';}return;}
  const link=event.target.closest('a[href]');if(!link)return;
  const href=link.getAttribute('href');
  if(/^(mailto:|tel:)/i.test(href)){event.preventDefault();const toast=document.querySelector('#demo-toast');if(toast){toast.hidden=false;toast.textContent='시연 모드입니다. 실제 전화·이메일 전송 연결은 실행하지 않습니다.';}return;}
  if(link.hasAttribute('download')||href.startsWith('blob:')||href.startsWith('#')||link.hasAttribute('data-demo-exit'))return;
  const target=demoLink(href);if(target)link.href=target;
 },true);
 document.addEventListener('DOMContentLoaded',()=>{
  const banner=document.createElement('div');banner.className='demo-mode-banner';banner.innerHTML='<strong>시연 모드 · 예시 데이터</strong><span>실제 공사·보고서 자료와 분리됩니다.</span><a href="demo.html" target="_top">전체 시연으로</a>';
  document.body.prepend(banner);const toast=document.createElement('p');toast.id='demo-toast';toast.className='demo-toast';toast.setAttribute('role','status');toast.hidden=true;document.body.append(toast);
  const localNote=document.querySelector('.local-note');if(localNote)localNote.innerHTML='<strong>시연 전용 저장소</strong><span>예시 8건을 사용합니다. 수정·삭제·백업 불러오기는 실제 등록 자료에 영향을 주지 않습니다.</span>';
  const reportForm=document.querySelector('#report-form');
  if(reportForm){const values={author:'시연 작업자',team:'시연용 현장팀',site:'시연용 A지점',location:'2층 통신실 (예시)',occurredAt:day()+'T09:00',category:'네트워크 · LAN',equipment:'시연용 네트워크 스위치',severity:'높음',status:'복구완료',symptoms:'예시: 일부 사무실에서 네트워크 연결이 끊기는 현상이 발생했습니다.',impact:'예시: 사무실 PC 5대의 업무 연결 중단',cause:'예시: 통신 케이블 접속 상태 불량 확인',actions:'09:10 케이블 접속 상태 점검\n09:30 케이블 재접속 및 교체\n10:00 연결 시험 후 정상 동작 확인',restoredAt:day()+'T10:00',followup:'예시: 다음 근무일 연결 상태 재점검'};for(const [name,value]of Object.entries(values)){const el=reportForm.elements[name];if(el)el.value=value;}reportForm.dispatchEvent(new Event('change',{bubbles:true}));const note=document.querySelector('.storage-note');if(note)note.textContent='시연용 보고서가 입력되어 있습니다. 내용을 수정하거나 사진을 첨부하고 보고서 확인을 눌러보세요. 실제 임시저장과 별도로 보관됩니다.';}
  const ethics=document.querySelector('#report-title');if(ethics){ethics.value='[시연 예시] 협력 업무 관련 사실 확인 요청';document.querySelector('#report-details').value='실제 신고가 아닌 시연용 예시입니다. 업무 중 확인한 사실을 정리하고 메일 본문을 준비하는 흐름을 보여줍니다.';}
 });
})();