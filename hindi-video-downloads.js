(() => {
  const CACHE_NAME = 'light-of-life-hindi-video-downloads-v1';
  const VIDEO_COUNT = 15;
  const videos = Array.from({ length: VIDEO_COUNT }, (_, index) => {
    const number = index + 1;
    const filename = `Hindi${String(number).padStart(2, '0')}-fast.mp4`;
    return {
      number,
      filename,
      url: `https://hindi-files.lightoflife812.com/${filename}`
    };
  });
  const objectUrls = new Map();

  function openCache() {
    if (!('caches' in window)) throw new Error('Cache Storage is unavailable');
    return caches.open(CACHE_NAME);
  }

  function downloadIconMarkup() {
    return '<svg class="video-download-symbol" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5M4 17v4h16v-4"/></svg>';
  }

  function downloadButtonMarkup(label, removing = false) {
    return `<span class="video-download-button-content">${removing ? '<span class="video-remove-symbol" aria-hidden="true">×</span>' : downloadIconMarkup()}<span>${label}</span></span>`;
  }

  function setDownloadButton(button, label, removing = false) {
    button.innerHTML = downloadButtonMarkup(label, removing);
    button.classList.toggle('is-remove-download', removing);
  }

  async function getDownloadedNumbers(cache) {
    const downloaded = new Set();
    await Promise.all(videos.map(async video => {
      if (await cache.match(video.url)) downloaded.add(video.number);
    }));
    return downloaded;
  }

  async function createLocalVideoUrl(number) {
    const video = videos.find(item => item.number === Number(number));
    if (!video) return '';
    if (objectUrls.has(video.number)) return objectUrls.get(video.number);
    try {
      const cache = await openCache();
      const response = await cache.match(video.url);
      if (!response || !response.ok) return '';
      const receivedBlob = await response.blob();
      const blob = receivedBlob.type.startsWith('video/') ? receivedBlob : new Blob([receivedBlob], { type: 'video/mp4' });
      if (!blob.size) return '';
      const objectUrl = URL.createObjectURL(blob);
      objectUrls.set(video.number, objectUrl);
      return objectUrl;
    } catch {
      return '';
    }
  }

  function individualDownloadMarkup(number) {
    return `<div class="hindi-video-download-manager lesson-video-download" data-individual-video-download data-video-number="${number}"><button class="secondary-btn hindi" type="button" data-individual-video-button>${downloadButtonMarkup('वीडियो डाउनलोड करें')}</button><progress max="100" value="0" data-individual-video-progress hidden></progress><p class="hindi" role="status" aria-live="polite" data-individual-video-status></p></div>`;
  }

  function initIndividualDownloadButtons(root = document) {
    root.querySelectorAll('[data-individual-video-download]').forEach(manager => {
      if (manager.dataset.initialized === 'true') return;
      manager.dataset.initialized = 'true';
      const number = Number(manager.dataset.videoNumber);
      const video = videos.find(item => item.number === number);
      const button = manager.querySelector('[data-individual-video-button]');
      const progress = manager.querySelector('[data-individual-video-progress]');
      const status = manager.querySelector('[data-individual-video-status]');
      const frame = manager.parentElement.querySelector(`.video-frame[data-youtube-video-id]`);
      const paintState = async (message = '') => {
        try {
          const cache = await openCache();
          const downloaded = !!(video && await cache.match(video.url));
          button.disabled = false;
          setDownloadButton(button, downloaded ? 'डाउनलोड किया गया वीडियो हटाएँ' : 'वीडियो डाउनलोड करें', downloaded);
          if (message) status.textContent = message;
          else status.textContent = downloaded ? 'यह वीडियो इस डिवाइस पर उपलब्ध है।' : '';
        } catch {
          button.disabled = true;
          status.textContent = 'इस ब्राउज़र में ऑफ़लाइन वीडियो संग्रह उपलब्ध नहीं है।';
        }
      };

      button.addEventListener('click', async () => {
        if (button.disabled || !video) return;
        button.disabled = true;
        let cache;
        try {
          cache = await openCache();
          const existing = await cache.match(video.url);
          if (existing) {
            if (!window.confirm(`क्या आप पाठ ${number} का डाउनलोड किया गया वीडियो हटाना चाहते हैं?`)) {
              button.disabled = false;
              return;
            }
            progress.hidden = true;
            if (frame) showYoutubeFallback(frame);
            await cache.delete(video.url);
            const objectUrl = objectUrls.get(number);
            if (objectUrl) URL.revokeObjectURL(objectUrl);
            objectUrls.delete(number);
            await paintState('डाउनलोड किया गया वीडियो हटा दिया गया है।');
            return;
          }

          progress.hidden = false;
          progress.value = 0;
          status.textContent = 'वीडियो डाउनलोड हो रहा है…';
          const response = await fetch(video.url, { mode: 'cors', credentials: 'omit' });
          if (!response.ok || response.type === 'opaque') throw new Error(`HTTP ${response.status || 'response unavailable'}`);
          const contentLength = Number(response.headers.get('content-length')) || 0;
          if (!contentLength) progress.removeAttribute('value');
          let cacheError = null;
          const writeResponse = cache.put(video.url, response.clone()).catch(error => { cacheError = error; });
          if (response.body) {
            const reader = response.body.getReader();
            let received = 0;
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              received += value.byteLength;
              if (contentLength) progress.value = Math.min(received / contentLength, 1) * 100;
            }
          }
          await writeResponse;
          if (cacheError) throw cacheError;
          progress.value = 100;
          if (frame) await showLocalVideo(frame, number);
          await paintState('वीडियो इस डिवाइस पर डाउनलोड हो गया है।');
        } catch (error) {
          console.warn(`Hindi lesson video ${number} was not cached.`, error);
          progress.hidden = true;
          await paintState('डाउनलोड नहीं हो सका। इंटरनेट, डिवाइस की जगह और R2 CORS सेटिंग जाँचें।');
        }
      });

      paintState();
    });
  }

  async function showLocalVideo(frame, number) {
    const src = await createLocalVideoUrl(number);
    if (!src) return;
    const player = document.createElement('video');
    player.controls = true;
    player.playsInline = true;
    player.preload = 'metadata';
    player.src = src;
    player.setAttribute('aria-label', `पाठ ${number} — स्थानीय वीडियो`);
    frame.replaceChildren(player);
  }

  function showYoutubeFallback(frame) {
    const videoId = frame.dataset.youtubeVideoId;
    if (!videoId) return;
    const player = document.createElement('iframe');
    player.src = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}`;
    player.title = frame.dataset.youtubeTitle || 'Hindi lesson video';
    player.loading = 'lazy';
    player.referrerPolicy = 'strict-origin-when-cross-origin';
    player.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    player.allowFullscreen = true;
    frame.replaceChildren(player);
  }

  function initDownloadManager() {
    const manager = document.querySelector('#hindi-video-download-manager');
    if (!manager) return;
    const button = manager.querySelector('#hindi-video-download-button');
    const progress = manager.querySelector('#hindi-video-download-progress');
    const status = manager.querySelector('#hindi-video-download-status');
    let cacheAvailable = true;

    const paintState = async (message = '') => {
      try {
        const cache = await openCache();
        const downloaded = await getDownloadedNumbers(cache);
        const count = downloaded.size;
        button.disabled = false;
        const removeAll = count === VIDEO_COUNT;
        setDownloadButton(button, removeAll
          ? 'डाउनलोड किए गए वीडियो हटाएँ'
          : count
            ? `बाकी वीडियो डाउनलोड करें (${count}/${VIDEO_COUNT})`
            : 'वीडियो डाउनलोड करें (1–15)', removeAll);
        if (message) status.textContent = message;
        else status.textContent = count === VIDEO_COUNT
          ? 'सभी 15 वीडियो इस डिवाइस पर उपलब्ध हैं।'
          : count
            ? `${VIDEO_COUNT} में से ${count} वीडियो इस डिवाइस पर उपलब्ध हैं।`
            : '';
      } catch {
        cacheAvailable = false;
        button.disabled = true;
        status.textContent = 'इस ब्राउज़र में ऑफ़लाइन वीडियो संग्रह उपलब्ध नहीं है।';
      }
    };

    button.addEventListener('click', async () => {
      if (button.disabled) return;
      button.disabled = true;
      let cache;
      try {
        cache = await openCache();
        const downloaded = await getDownloadedNumbers(cache);
        if (downloaded.size === VIDEO_COUNT) {
          if (!window.confirm('क्या आप इस डिवाइस से डाउनलोड किए गए सभी 15 वीडियो हटाना चाहते हैं?')) {
            button.disabled = false;
            return;
          }
          progress.hidden = true;
          for (const video of videos) {
            await cache.delete(video.url);
            const objectUrl = objectUrls.get(video.number);
            if (objectUrl) URL.revokeObjectURL(objectUrl);
            objectUrls.delete(video.number);
          }
          await paintState('डाउनलोड किए गए वीडियो हटा दिए गए हैं।');
          return;
        }

        progress.hidden = false;
        progress.max = VIDEO_COUNT * 100;
        progress.value = downloaded.size * 100;
        let finishedCount = downloaded.size;
        const failed = [];

        for (const video of videos) {
          if (downloaded.has(video.number)) continue;
          setDownloadButton(button, `वीडियो ${video.number}/${VIDEO_COUNT} डाउनलोड हो रहा है…`);
          status.textContent = `${video.number}/${VIDEO_COUNT} वीडियो डाउनलोड हो रहा है…`;
          progress.value = finishedCount * 100;

          try {
            const response = await fetch(video.url, { mode: 'cors', credentials: 'omit' });
            if (!response.ok || response.type === 'opaque') {
              throw new Error(`HTTP ${response.status || 'response unavailable'}`);
            }

            const contentLength = Number(response.headers.get('content-length')) || 0;
            if (contentLength) progress.value = finishedCount * 100 + 1;
            else progress.removeAttribute('value');

            let cacheError = null;
            const writeResponse = cache.put(video.url, response.clone()).catch(error => {
              cacheError = error;
            });
            if (response.body) {
              const reader = response.body.getReader();
              let received = 0;
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                received += value.byteLength;
                if (contentLength) {
                  const percent = Math.min(received / contentLength, 1) * 100;
                  progress.value = finishedCount * 100 + percent;
                }
              }
            }
            await writeResponse;
            if (cacheError) throw cacheError;
            downloaded.add(video.number);
            finishedCount += 1;
            progress.value = finishedCount * 100;
          } catch (error) {
            console.warn(`Hindi lesson video ${video.number} was not cached.`, error);
            failed.push(video.number);
          }
        }

        progress.value = downloaded.size * 100;
        if (failed.length) {
          await paintState(`कुछ वीडियो डाउनलोड नहीं हुए (${failed.join(', ')}). इंटरनेट, डिवाइस की जगह और R2 CORS सेटिंग जाँचकर फिर प्रयास करें।`);
        } else {
          progress.hidden = true;
          await paintState('सभी 15 वीडियो इस डिवाइस पर डाउनलोड हो गए हैं।');
        }
      } catch (error) {
        console.warn('Hindi lesson video downloads could not be started.', error);
        progress.hidden = true;
        await paintState('डाउनलोड शुरू नहीं हो सके। इंटरनेट, डिवाइस की जगह और R2 CORS सेटिंग जाँचें।');
      } finally {
        if (cacheAvailable) button.disabled = false;
      }
    });

    paintState();
  }

  window.hindiVideoDownloads = {
    initDownloadManager,
    createLocalVideoUrl,
    downloadButtonMarkup,
    individualDownloadMarkup,
    initIndividualDownloadButtons
  };
})();
