(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ConstructionCore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const stages={ordered:'작업지시',postponed:'연기(임시)',in_progress:'진행',completed:'완료'};
 const categories=['초고속','광','무선','기타'];
 const normalizeCategory=value=>value==='전용'?'광':value;
 function today(){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
 function dateNumber(text){if(!/^\d{4}-\d{2}-\d{2}$/.test(text||''))return NaN;const time=Date.parse(text+'T00:00:00Z');return Number.isFinite(time)&&new Date(time).toISOString().slice(0,10)===text?time:NaN;}
 function days(from,to){return Math.round((dateNumber(to)-dateNumber(from))/86400000);}
 function indicator(item,base=today()){
  if(item.stage==='completed'){const late=days(item.end,item.completedAt);return late>0?{kind:'overdue',label:'지연 완료',detail:late+'일 초과 완료'}:{kind:'done',label:'기간 내 완료',detail:'완료일 '+item.completedAt};}
  const left=days(base,item.end);
  if(left<0)return {kind:'overdue',label:'기한 경과',detail:Math.abs(left)+'일 지연'};
  if(left===0)return {kind:'urgent',label:'오늘 마감',detail:'D-DAY'};
  if(left===1)return {kind:'urgent',label:'1일 전',detail:'D-1'};
  if(left===2)return {kind:'soon',label:'2일 전',detail:'D-2'};
  return {kind:'normal',label:'기간 내',detail:'D-'+left};
 }
 function validate(item){
  if(!item||typeof item!=='object')return '공사 정보를 확인해 주세요.';
  if(typeof item.name!=='string'||!item.name.trim()||item.name.length>150)return '공사번호를 150자 이내로 입력해 주세요.';
  if(!categories.includes(normalizeCategory(item.category))||!Object.hasOwn(stages,item.stage))return '공사 구분과 상태를 선택해 주세요.';
  if(!Number.isFinite(dateNumber(item.start))||!Number.isFinite(dateNumber(item.end)))return '시작일과 마감일을 확인해 주세요.';
  if(days(item.start,item.end)<0)return '마감일은 시작일보다 빠를 수 없습니다.';
  if(item.stage==='completed'&&(!Number.isFinite(dateNumber(item.completedAt))||days(item.start,item.completedAt)<0))return '완료일을 입력해 주세요. 시작일보다 빠를 수 없습니다.';
  for(const [key,max] of [['assignee',80],['client',150],['notes',3000]])if(typeof item[key]!=='string'||item[key].length>max)return '담당자·발주처·메모의 입력 길이를 확인해 주세요.';
  if(item.address!==undefined&&(typeof item.address!=='string'||item.address.length>300))return '작업장 주소를 300자 이내로 입력해 주세요.';
  return '';
 }
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function summary(items,base=today()){return {total:items.length,active:items.filter(x=>x.stage!=='completed').length,completed:items.filter(x=>x.stage==='completed').length,overdue:items.filter(x=>x.stage!=='completed'&&indicator(x,base).kind==='overdue').length,dueTomorrow:items.filter(x=>x.stage!=='completed'&&days(base,x.end)===1).length,dueToday:items.filter(x=>x.stage!=='completed'&&days(base,x.end)===0).length,dueInTwoDays:items.filter(x=>x.stage!=='completed'&&days(base,x.end)===2).length,urgent:items.filter(x=>x.stage!=='completed'&&['urgent','soon'].includes(indicator(x,base).kind)).length};}
 return {stages,categories,normalizeCategory,today,dateNumber,days,indicator,validate,summary,escape};
});