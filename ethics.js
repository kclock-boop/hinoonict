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