(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./vendor/xlsx-0.20.3.full.min.js'),require('./construction-core.js'));else root.ConstructionExcel=factory(root.XLSX,root.ConstructionCore);})(typeof globalThis!=='undefined'?globalThis:this,function(X,C){
 'use strict';
 const aliases={name:['공사번호','작업번호','공사명'],category:['공사구분','설비구분','공사종류'],start:['시작일','요청일','공사시작일','착공일'],end:['마감일','종료예정일','준공예정일','공사종료일','종료일'],completedAt:['실제완료일','완료일','실작업일','작업완료일'],stage:['진행상태','공사상태','상태'],address:['작업장주소','현장주소','공사주소','주소'],notes:['비고','메모','작업지시연기사유메모'],assignee:['담당자','담당팀'],client:['발주처','발주처현장']};
 const norm=v=>String(v??'').normalize('NFKC').replace(/[\s*_()（）\[\]{}:：·/\\-]/g,'').toLowerCase();
 const key=v=>String(v??'').normalize('NFKC').trim().toLocaleLowerCase();
 function text(cell){if(!cell||cell.v===undefined||cell.v===null)return '';if(cell.t==='e')throw Error('엑셀 오류 셀이 있습니다.');return String(cell.t==='n'&&cell.w!==undefined?cell.w:cell.v).trim();}
 function date(cell,date1904=false,optional=false){
  if(!cell||cell.v===undefined||cell.v===null||cell.v===''){if(cell?.f)throw Error('수식 결과가 저장되지 않았습니다. Excel에서 계산 후 저장해 주세요.');if(optional)return '';throw Error('날짜가 비어 있습니다.');}
  if(cell.t==='e')throw Error('날짜에 엑셀 오류가 있습니다.');
  const value=cell.v;let output='';
  if(typeof value==='number'){
   if(value===0&&optional&&!date1904)return '';
   if(!Number.isFinite(value)||value<(date1904?0:1)||value>2958465)throw Error('올바른 날짜를 확인해 주세요.');
   const d=X.SSF.parse_date_code(value,{date1904});if(d)output=String(d.y).padStart(4,'0')+'-'+String(d.m).padStart(2,'0')+'-'+String(d.d).padStart(2,'0');
  }else if(value instanceof Date){if(Number.isNaN(value.getTime()))throw Error('날짜를 확인해 주세요.');output=value.toISOString().slice(0,10);}
  else{const v=String(value).trim();if(optional&&['-','미기재','미완료'].includes(v))return '';let m=v.match(/^(\d{4})[-./년]\s*(\d{1,2})[-./월]\s*(\d{1,2})(?:일)?(?:[ T]\d{1,2}:\d{2}(?::\d{2}(?:\.\d+)?)?)?\s*$/);if(!m)m=v.match(/^(\d{4})(\d{2})(\d{2})$/);if(m)output=m[1]+'-'+m[2].padStart(2,'0')+'-'+m[3].padStart(2,'0');}
  if(!Number.isFinite(C.dateNumber(output)))throw Error('날짜를 YYYY-MM-DD 형식으로 확인해 주세요.');return output;
 }
 function read(buffer){if(!X)throw Error('엑셀 읽기 기능을 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.');return X.read(buffer,{type:'array',cellDates:false,cellFormula:true,cellHTML:false,cellNF:true,cellText:true,bookVBA:false,sheetRows:1002});}
 function parse(workbook,sheetName){
  const ws=workbook.Sheets[sheetName];if(!ws||!ws['!ref'])throw Error('선택한 시트에 자료가 없습니다.');const range=X.utils.decode_range(ws['!ref']);if(ws['!fullref']&&X.utils.decode_range(ws['!fullref']).e.r>range.e.r)throw Error('시트가 너무 큽니다. 공사 자료를 500건 이하로 나누어 주세요.');if(range.e.c>199)throw Error('열이 너무 많습니다. 공사 자료 열만 남겨 선택해 주세요.');
  const get=(r,c)=>c===undefined?undefined:ws[X.utils.encode_cell({r,c})];let headerRow=-1,columns={};
  for(let r=range.s.r;r<=Math.min(range.e.r,range.s.r+29);r++){
   const found={};for(let c=range.s.c;c<=range.e.c;c++){const label=norm(text(get(r,c)));if(!label)continue;for(const [field,list]of Object.entries(aliases)){if(list.some(a=>norm(a)===label)){if(found[field]!==undefined)found[field]=-1;else found[field]=c;}}}
   if(found.name!==undefined&&found.start!==undefined&&found.end!==undefined){if(Object.values(found).some(v=>v===-1))throw Error('동일한 항목의 열이 여러 개입니다. 중복된 제목을 정리해 주세요.');headerRow=r;columns=found;break;}
  }
  if(headerRow<0)throw Error('공사번호, 요청일(또는 시작일), 종료예정일(또는 마감일) 제목을 찾지 못했습니다.');
  const date1904=!!workbook.Workbook?.WBProps?.date1904,rows=[];let formula=false;
  for(let r=headerRow+1;r<=range.e.r;r++){
   const row={row:r+1,item:null,error:'',provided:Object.keys(columns),warnings:[]};
   try{
    const cells=Object.fromEntries(Object.entries(columns).map(([f,c])=>[f,get(r,c)]));if(Object.values(cells).every(c=>!c||c.v===undefined||c.v===null||c.v===''))continue;
    formula=formula||Object.values(cells).some(c=>!!c?.f);
    for(const cell of Object.values(cells))if(cell?.f&&(cell.v===undefined||cell.v===null||cell.v===''))throw Error('수식 결과가 저장되지 않았습니다. Excel에서 계산 후 저장해 주세요.');
    const name=text(cells.name);if(!name)throw Error('공사번호가 비어 있습니다.');
    let category=text(cells.category);if(!category){category=C.categories.find(c=>c!=='기타'&&c!=='광'&&name.includes(c))||'기타';row.warnings.push('공사 구분 추정: '+category);}
    if(!C.categories.includes(category))throw Error('지원하지 않는 공사 구분: '+category);
    const start=date(cells.start,date1904),end=date(cells.end,date1904),completedAt=date(cells.completedAt,date1904,true),rawStage=text(cells.stage),stageText=norm(rawStage);let stage='ordered';
    if(completedAt)stage='completed';
    else if(['완료','기한내완료','기간내완료','지연완료','기한초과완료'].includes(stageText))throw Error('완료 상태이지만 실작업일(완료일)이 비어 있습니다.');
    else if(['진행','진행중','작업중','공사중'].includes(stageText))stage='in_progress';
    else if(['연기','연기임시','보류','임시연기'].includes(stageText))stage='postponed';
    else if(stageText&&!['작업지시','대기','미완료','정상','기한도래','기한초과','지연'].includes(stageText))throw Error('진행 상태를 확인해 주세요: '+rawStage);
    const item={name,category,start,end,stage,completedAt,address:text(cells.address),notes:text(cells.notes),assignee:text(cells.assignee),client:text(cells.client)};const error=C.validate(item);if(error)throw Error(error);row.item=item;
   }catch(error){row.error=error.message;}
   rows.push(row);if(rows.length>500)throw Error('한 번에 500건까지 불러올 수 있습니다.');
  }
  if(!rows.length)throw Error('공사 자료가 없습니다.');
  const numbers=new Map();for(const row of rows){if(!row.item)continue;const n=key(row.item.name);numbers.set(n,(numbers.get(n)||0)+1);}for(const row of rows)if(row.item&&numbers.get(key(row.item.name))>1)row.error='엑셀 안에 동일한 공사번호가 여러 번 있습니다.';
  return {sheetName,headerRow:headerRow+1,columns,rows,formula};
 }
 function plan(parsed,existing,policy='add'){
  if(!['add','update'].includes(policy))throw Error('반영 방식을 확인해 주세요.');const byKey=new Map();for(const item of existing){const k=key(item.name);if(!byKey.has(k))byKey.set(k,[]);byKey.get(k).push(item);}
  const merged=existing.map(x=>({...x})),entries=[],counts={add:0,update:0,skip:0,error:0};
  for(const row of parsed.rows){const entry={...row,action:'error',message:row.error||'',next:null};if(row.error||!row.item){counts.error++;entries.push(entry);continue;}
   const matches=byKey.get(key(row.item.name))||[];if(matches.length>1){entry.message='기존 목록에 같은 공사번호가 여러 건입니다. 먼저 중복을 정리해 주세요.';counts.error++;entries.push(entry);continue;}
   const old=matches[0];if(old&&policy==='add'){entry.action='skip';entry.message='기존 공사 유지';counts.skip++;entries.push(entry);continue;}
   const now=new Date().toISOString();let next;
   if(old){next={...old};for(const field of ['name','category','start','end','stage','completedAt'])next[field]=row.item[field];for(const field of ['address','notes','assignee','client'])if(row.provided.includes(field)&&row.item[field])next[field]=row.item[field];
    const error=C.validate(next);if(error){entry.message=error;counts.error++;entries.push(entry);continue;}
    const fields=['name','category','start','end','stage','completedAt','address','notes','assignee','client'];if(fields.every(f=>(old[f]||'')===(next[f]||''))){entry.action='skip';entry.message='변경 없음';counts.skip++;entries.push(entry);continue;}
    next.updatedAt=now;entry.action='update';entry.message=old.stage==='completed'&&next.stage!=='completed'?'완료 → '+C.stages[next.stage]+' 변경':C.stages[old.stage]+' → '+C.stages[next.stage];merged[merged.findIndex(x=>x.id===old.id)]=next;counts.update++;
   }else{next={...row.item,id:globalThis.crypto.randomUUID(),createdAt:now,updatedAt:now};entry.action='add';entry.message='신규 공사 추가';merged.push(next);counts.add++;}
   entry.next=next;entries.push(entry);
  }
  return {entries,counts,merged,capacityError:merged.length>500?'반영 후 공사가 500건을 초과합니다.':''};
 }
 return {read,parse,plan,date,key};
});