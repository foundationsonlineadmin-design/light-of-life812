let deferredInstall = null;
let installAttemptInFlight = false;
let installCompleted = false;
let installConfirmationTimer = null;

function installMessages() {
  const hindi = new URLSearchParams(location.search).get('lang') === 'hi' || document.documentElement.lang === 'hi';
  return hindi
    ? { installing: 'इंस्टॉल हो रहा है…', installed: 'इंस्टॉल हो गया · होम स्क्रीन पर देखें', unconfirmed: 'होम स्क्रीन पर ऐप देखें', download: 'ऐप डाउनलोड करें' }
    : { installing: 'Installing…', installed: 'Installed · find it on your home screen', unconfirmed: 'Check your home screen for the app', download: 'Download App' };
}

function setInstallButtonState(state) {
  const messages = installMessages();
  const buttons = [...document.querySelectorAll('#install-float-btn, #install-guide-btn')];
  for (const button of buttons) {
    if (!button.dataset.installLabel) {
      button.dataset.installLabel = button.textContent.replace(/↓/g, '').trim() || messages.download;
    }
    const indicator = document.createElement('span');
    indicator.className = 'install-status-icon';
    indicator.setAttribute('aria-hidden', 'true');
    let label = button.dataset.installLabel;
    button.classList.remove('install-in-progress', 'install-complete', 'install-unconfirmed');
    button.disabled = false;
    if (state === 'installing') {
      button.classList.add('install-in-progress');
      indicator.textContent = '';
      label = messages.installing;
      button.disabled = true;
    } else if (state === 'installed') {
      button.classList.add('install-complete');
      indicator.textContent = '✓';
      label = messages.installed;
      button.disabled = true;
    } else if (state === 'unconfirmed') {
      button.classList.add('install-unconfirmed');
      label = messages.unconfirmed;
    } else {
      indicator.textContent = '↓';
    }
    const labelElement = document.createElement('span');
    labelElement.className = 'install-label';
    labelElement.textContent = label;
    button.replaceChildren(indicator, labelElement);
    button.setAttribute('aria-live', 'polite');
    button.setAttribute('aria-label', label);
  }
}

function installPlatform() {
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  if (/Macintosh|Mac OS X/i.test(ua)) return 'mac';
  if (/Windows/i.test(ua)) return 'windows';
  return 'other';
}

function openInstallGuidance() {
  const guide = document.querySelector('#install-instructions');
  if (!guide) {
    const lang = new URLSearchParams(location.search).get('lang') === 'hi' ? 'hi' : 'en';
    location.href = `home.html?lang=${lang}#install-instructions`;
    return;
  }
  const platform = installPlatform();
  const details = [...guide.querySelectorAll('[data-install-platform]')];
  const target = details.find(item => item.dataset.installPlatform === platform) || details.find(item => item.dataset.installPlatform === 'other');
  for (const item of details) item.open = item === target;
  guide.scrollIntoView({ behavior: 'smooth', block: 'start' });
  target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function startInstallFlow() {
  if (installAttemptInFlight) return;
  if (deferredInstall) {
    const prompt = deferredInstall;
    deferredInstall = null;
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice?.outcome === 'accepted') {
        if (installCompleted) return;
        installAttemptInFlight = true;
        setInstallButtonState('installing');
        clearTimeout(installConfirmationTimer);
        installConfirmationTimer = setTimeout(() => {
          if (!installAttemptInFlight) return;
          installAttemptInFlight = false;
          setInstallButtonState('unconfirmed');
        }, 30000);
      }
    } catch {
      openInstallGuidance();
    }
    return;
  }
  openInstallGuidance();
}

window.openInstallGuidance = openInstallGuidance;
window.startInstallFlow = startInstallFlow;

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredInstall = event;
});

window.addEventListener('appinstalled', () => {
  installCompleted = true;
  deferredInstall = null;
  installAttemptInFlight = false;
  clearTimeout(installConfirmationTimer);
  setInstallButtonState('installed');
});

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  let registration = null;
  let updateCheckInFlight = false;

  async function refreshServiceWorker() {
    if (!registration || document.visibilityState === 'hidden' || updateCheckInFlight) return;
    updateCheckInFlight = true;
    try {
      await registration.update();
    } catch {
      // Keep the current app available when the network is offline.
    } finally {
      updateCheckInFlight = false;
    }
  }

  window.addEventListener('load', async () => {
    try {
      registration = await navigator.serviceWorker.register('./service-worker.js', { updateViaCache: 'none' });
      await refreshServiceWorker();
    } catch {
      // Service worker registration is optional when the app is offline.
    }
  });

  // Check after navigation, browser back/forward restoration, or returning to the app.
  window.addEventListener('pageshow', refreshServiceWorker);
  window.addEventListener('hashchange', refreshServiceWorker);
  window.addEventListener('popstate', refreshServiceWorker);
  window.addEventListener('focus', refreshServiceWorker);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refreshServiceWorker();
  });
}
