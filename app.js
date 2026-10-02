(() => {
  'use strict';
  const dialog = document.querySelector('#app-install-dialog');
  const buttons = document.querySelectorAll('[data-install-app]');
  const nativeButton = document.querySelector('#native-install');
  const feedback = document.querySelector('#install-feedback');
  const offline = document.querySelector('#offline-status');
  let deferredPrompt = null;
  const standalone = window.matchMedia('(display-mode: standalone)');
  function markInstalled() {
    deferredPrompt = null;
    nativeButton.hidden = true;
    buttons.forEach(button => { button.textContent = '앱 실행 중'; button.disabled = true; });
    feedback.textContent = '홈 화면에 설치한 하이눈정보통신 앱을 사용하고 있습니다.';
  }
  function connectionStatus() { offline.hidden = navigator.onLine; }
  connectionStatus();
  window.addEventListener('online', connectionStatus);
  window.addEventListener('offline', connectionStatus);
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    nativeButton.hidden = false;
  });
  buttons.forEach(button => button.addEventListener('click', () => {
    feedback.textContent = '';
    nativeButton.hidden = !deferredPrompt;
    dialog.showModal();
  }));
  document.querySelector('#close-install-dialog').addEventListener('click', () => dialog.close());
  nativeButton.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    const prompt = deferredPrompt;
    deferredPrompt = null;
    nativeButton.hidden = true;
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      feedback.textContent = choice.outcome === 'accepted' ? '설치를 요청했습니다. 설치가 끝나면 홈 화면 또는 앱 목록에서 실행하세요.' : '설치를 취소했습니다. 나중에 다시 설치할 수 있습니다.';
    } catch (error) {
      feedback.textContent = '브라우저 메뉴의 앱 설치 또는 홈 화면에 추가를 이용해 주세요.';
    }
  });
  window.addEventListener('appinstalled', markInstalled);
  if (standalone.matches || navigator.standalone === true) markInstalled();
  if ('serviceWorker' in navigator && window.isSecureContext) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js', {updateViaCache: 'none'}).then(registration => {
        const storageStatus = document.querySelector('#offline-storage');
        navigator.serviceWorker.ready.then(() => {
          storageStatus.textContent = '회사소개와 주요 사진의 오프라인 저장이 완료되었습니다.';
        }).catch(() => {});
        const updateBox = document.querySelector('#app-update');
        const updateButton = document.querySelector('#apply-app-update');
        function offerUpdate() { if (registration.waiting && navigator.serviceWorker.controller) updateBox.hidden = false; }
        offerUpdate();
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          if (worker) worker.addEventListener('statechange', () => { if (worker.state === 'installed') offerUpdate(); });
        });
        updateButton.addEventListener('click', () => {
          if (registration.waiting) registration.waiting.postMessage({type: 'SKIP_WAITING'});
        });
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!updateBox.hidden && !refreshing) { refreshing = true; window.location.reload(); }
        });
      }).catch(() => { /* Installation guide and website remain usable. */ });
    });
  }
})();