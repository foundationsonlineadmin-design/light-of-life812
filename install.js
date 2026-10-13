let deferredInstall = null;

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
  if (deferredInstall) {
    const prompt = deferredInstall;
    deferredInstall = null;
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
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
  deferredInstall = null;
});

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  let registration = null;
  let lastUpdateCheck = 0;
  let updateCheckInFlight = false;

  async function refreshServiceWorker() {
    if (!registration || document.visibilityState === 'hidden' || updateCheckInFlight) return;
    if (Date.now() - lastUpdateCheck < 30_000) return;
    lastUpdateCheck = Date.now();
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
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refreshServiceWorker();
  });
}
