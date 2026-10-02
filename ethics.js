(() => {
 'use strict';
 const tabs = [...document.querySelectorAll('[role="tab"]')];
 function selectTab(name, focus = false) {
  const selected = document.querySelector('#tab-' + name);
  if (!selected) return;
  tabs.forEach(tab => {
   const active = tab === selected;
   tab.setAttribute('aria-selected', String(active));
   tab.tabIndex = active ? 0 : -1;
   document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
  });
  history.replaceState(null, '', '#' + name);
  if (focus) selected.focus();
 }
 tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(tab.id.slice(4)));
  tab.addEventListener('keydown', event => {
   let next;
   if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
   if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
   if (event.key === 'Home') next = 0;
   if (event.key === 'End') next = tabs.length - 1;
   if (next !== undefined) { event.preventDefault(); selectTab(tabs[next].id.slice(4), true); }
  });
 });
 document.querySelectorAll('[data-open-tab]').forEach(button => button.addEventListener('click', () => selectTab(button.dataset.openTab, true)));
 selectTab(location.hash.slice(1) || 'guide');
 window.addEventListener('hashchange', () => selectTab(location.hash.slice(1) || 'guide'));
 if ('serviceWorker' in navigator && window.isSecureContext) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js', {updateViaCache:'none'}).catch(() => {}));
 }
})();
// Mail preparation only. Sending happens in the visitor's mail application.
(() => {
 const recipient = 'highnoon0377@naver.com';
 document.querySelectorAll('.ethics-form').forEach(form => {
  form.querySelector('[type=submit]').disabled = false;
  const prepared = form.querySelector('.mail-prepared');
  const preview = form.querySelector('.mail-preview');
  const status = form.querySelector('.mail-status');
  const mailLink = form.querySelector('.mail-open');
  let draft = '';
  let subject = '';
  form.addEventListener('input', () => { prepared.hidden = true; draft = ''; mailLink.removeAttribute('href'); });
  form.addEventListener('submit', event => {
   event.preventDefault();
   if (!form.reportValidity()) return;
   const values = new FormData(form);
   const field = key => String(values.get(key) || '').trim();
   if (!field('details') || !field('title')) { status.textContent = '제목과 내용을 입력해 주세요.'; prepared.hidden = false; return; }
   const inquiry = form.dataset.kind === 'inquiry';
   subject = (inquiry ? '[처리상황 문의] ' : '[비윤리 신고] ') + field('title');
   draft = ['하이눈정보통신 ' + (inquiry ? '처리상황 문의' : '비윤리 신고'), '',
    '제목: ' + field('title'), (inquiry ? '신고 메일 전송일: ' : '발생일: ') + (field('date') || '미기재'),
    ...(inquiry ? [] : ['발생 장소: ' + (field('place') || '미기재')]),
    '회신 연락처: ' + (field('reply') || '발신 이메일로 회신 요청'), '',
    (inquiry ? '문의 내용:' : '신고 내용:'), field('details')].join('\n');
   preview.textContent = draft;
   const url = 'mailto:' + recipient + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(draft);
   mailLink.href = url.length <= 1900 ? url : 'mailto:' + recipient + '?subject=' + encodeURIComponent(subject);
   status.textContent = url.length <= 1900 ? '메일이 준비되었습니다. 메일 앱에서 받는 주소와 내용을 확인하고 전송하세요.' : '내용이 길어 메일에는 제목만 넣었습니다. 아래 내용을 복사해 메일 본문에 붙여넣고 전송하세요.';
   prepared.hidden = false;
  });
  form.querySelector('[data-copy]').addEventListener('click', async () => {
   if (!draft) return;
   try { await navigator.clipboard.writeText(draft); status.textContent = '내용을 복사했습니다. 메일 본문에 붙여넣어 주세요.'; }
   catch (error) { status.textContent = '자동 복사가 지원되지 않습니다. 미리보기 내용을 직접 선택해 복사하거나 파일로 저장해 주세요.'; }
  });
  form.querySelector('[data-download]').addEventListener('click', () => {
   if (!draft) return;
   const url = URL.createObjectURL(new Blob(['\ufeff' + draft], {type:'text/plain;charset=utf-8'}));
   const link = document.createElement('a');
   link.href = url; link.download = form.dataset.kind === 'inquiry' ? '하이눈_처리상황문의.txt' : '하이눈_비윤리신고.txt';
   document.body.appendChild(link); link.click(); link.remove();
   setTimeout(() => URL.revokeObjectURL(url), 1000);
   status.textContent = '작성한 내용을 파일로 저장했습니다. 저장한 파일에는 입력한 정보가 포함됩니다.';
  });
 });
})();
