let deferredInstall = null;
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredInstall = event;
  const button = document.querySelector('#install-btn');
  if (button) button.hidden = false;
});

document.querySelector('#install-btn')?.addEventListener('click', async () => {
  if (!deferredInstall) return;
  deferredInstall.prompt();
  await deferredInstall.userChoice;
  deferredInstall = null;
  document.querySelector('#install-btn').hidden = true;
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
