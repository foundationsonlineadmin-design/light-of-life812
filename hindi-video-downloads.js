(() => {
  const CACHE_NAME = 'light-of-life-hindi-video-downloads-v4';
  const VIDEO_COUNT = 15;
  const videos = Array.from({ length: VIDEO_COUNT }, (_, index) => {
    const number = index + 1;
    const filename = `JKJ-${String(number).padStart(2, '0')}.mp4`;
    return {
      lessonId: `lesson-${number}`,
      number,
      filename,
      url: `https://files.lightoflife812.com/JKJ-Hindi/${filename}`
    };
  });
  const individualVideos = [
    ...videos,
    ...[
      ['lesson-16', '16', 'JKJ-16.mp4'],
      ['lesson-17', '17', 'JKJ-17.mp4'],
      ['lesson-18', '18', 'JKJ-18.mp4'],
      ['lesson-19', '19', 'JKJ-19.mp4'],
      ['lesson-20', '20', 'JKJ-20-1.mp4'],
      ['lesson-20-part-2', '20.2', 'JKJ-20-2.mp4']
    ].map(([lessonId, number, filename]) => ({
      lessonId,
      number,
      filename,
      url: `https://files.lightoflife812.com/JKJ-Hindi/${filename}`
    }))
  ];
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

  function downloadFailureMessage(error, filename = 'वीडियो') {
    const errorName = error?.name || '';
    const message = error?.message || '';
    const status = message.match(/HTTP (\d{3})/)?.[1];
    if (errorName === 'QuotaExceededError') return 'डिवाइस में वीडियो सहेजने के लिए पर्याप्त जगह नहीं है। जगह खाली करके फिर प्रयास करें।';
    if (status === '404') return `R2 में ${filename} नहीं मिली (HTTP 404)। फ़ाइल का नाम और फ़ोल्डर जाँचें।`;
    if (status === '403') return `R2 ने ${filename} तक पहुँच रोक दी (HTTP 403)। सार्वजनिक पहुँच जाँचें।`;
    if (status) return `${filename} डाउनलोड नहीं हुई (HTTP ${status})।`;
    if (error?.downloadStage === 'cache-write') return `${filename} इंटरनेट से आ गई, लेकिन ब्राउज़र उसे डिवाइस पर सहेज नहीं सका${errorName ? ` (${errorName})` : ''}${message ? `: ${message}` : ''}। डिवाइस की उपलब्ध जगह जाँचें।`;
    if (error?.downloadStage === 'response-read') return `${filename} का डाउनलोड बीच में रुक गया${errorName ? ` (${errorName})` : ''}${message ? `: ${message}` : ''}। कनेक्शन स्थिर होने पर फिर प्रयास करें।`;
    if (error?.downloadStage === 'fetch' && errorName === 'TypeError') return `R2 से ${filename} का अनुरोध पूरा नहीं हुआ। नेटवर्क, DNS और ऐप के CORS origin की जाँच करें।`;
    if (errorName === 'TypeError') return 'वीडियो नहीं मिल सका। इंटरनेट कनेक्शन और R2 CORS अनुमति जाँचें।';
    return `वीडियो सहेजने में त्रुटि${errorName ? ` (${errorName})` : ''}${message ? `: ${message}` : ''}`;
  }

  function withDownloadStage(error, stage) {
    const wrapped = new Error(error?.message || String(error));
    wrapped.name = error?.name || 'Error';
    wrapped.downloadStage = stage;
    return wrapped;
  }

  function formatStorage(bytes) {
    return `${(bytes / 1e9).toFixed(2)} GB`;
  }

  async function checkStorageForVideos(missingVideos) {
    if (!navigator.storage?.estimate || !missingVideos.length || missingVideos.some(video => !video.size)) return null;
    try {
      const { quota, usage = 0 } = await navigator.storage.estimate();
      if (!quota) return null;
      const available = Math.max(0, quota - usage);
      const needed = missingVideos.reduce((total, video) => total + video.size, 0) * 1.05;
      if (available < needed) {
        return `इन ${missingVideos.length} वीडियो के लिए लगभग ${formatStorage(needed)} जगह चाहिए, लेकिन ब्राउज़र में लगभग ${formatStorage(available)} जगह उपलब्ध है। कुछ वीडियो हटाएँ या कम वीडियो डाउनलोड करें।`;
      }
    } catch {
      // Storage estimates are advisory; let the download attempt provide the actual error.
    }
    return null;
  }

  async function getDownloadedNumbers(cache) {
    const downloaded = new Set();
    await Promise.all(videos.map(async video => {
      if (await cache.match(video.url)) downloaded.add(video.number);
    }));
    return downloaded;
  }

  function findIndividualVideo(lessonId) {
    return individualVideos.find(item => item.lessonId === String(lessonId));
  }

  async function createLocalVideoUrl(lessonId) {
    const video = findIndividualVideo(lessonId);
    if (!video) return '';
    if (objectUrls.has(video.lessonId)) return objectUrls.get(video.lessonId);
    try {
      const cache = await openCache();
      const response = await cache.match(video.url);
      if (!response || !response.ok) return '';
      const receivedBlob = await response.blob();
      const blob = receivedBlob.type.startsWith('video/') ? receivedBlob : new Blob([receivedBlob], { type: 'video/mp4' });
      if (!blob.size) return '';
      const objectUrl = URL.createObjectURL(blob);
      objectUrls.set(video.lessonId, objectUrl);
      return objectUrl;
    } catch {
      return '';
    }
  }

  function individualDownloadMarkup(lessonId) {
    const video = findIndividualVideo(lessonId);
    if (!video) return '';
    return `<div class="hindi-video-download-manager lesson-video-download" data-individual-video-download data-video-lesson-id="${video.lessonId}"><button class="secondary-btn hindi" type="button" data-individual-video-button>${downloadButtonMarkup('वीडियो डाउनलोड करें')}</button><progress max="100" value="0" data-individual-video-progress hidden></progress><p class="hindi" role="status" aria-live="polite" data-individual-video-status></p></div>`;
  }

  function addDirectDownloadLink(status, url, label) {
    const link = document.createElement('a');
    link.className = 'video-direct-download-link';
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = url.split('/').pop();
    link.textContent = label;
    status.append(document.createElement('br'), link);
  }

  function initIndividualDownloadButtons(root = document) {
    root.querySelectorAll('[data-individual-video-download]').forEach(manager => {
      if (manager.dataset.initialized === 'true') return;
      manager.dataset.initialized = 'true';
      const video = findIndividualVideo(manager.dataset.videoLessonId);
      const number = video?.number || '';
      const button = manager.querySelector('[data-individual-video-button]');
      const progress = manager.querySelector('[data-individual-video-progress]');
      const status = manager.querySelector('[data-individual-video-status]');
      const frame = manager.parentElement.querySelector(`.video-frame[data-youtube-video-id]`);
      const paintState = async (message = '', directDownload = false) => {
        try {
          const cache = await openCache();
          const downloaded = !!(video && await cache.match(video.url));
          button.disabled = false;
          setDownloadButton(button, downloaded ? 'डाउनलोड किया गया वीडियो हटाएँ' : 'वीडियो डाउनलोड करें', downloaded);
          if (message) {
            status.textContent = message;
            if (directDownload) addDirectDownloadLink(status, video.url, 'ऐप के बाहर सीधे डाउनलोड करें ↗');
          }
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
        let failureStage = 'fetch';
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
            const objectUrl = objectUrls.get(video.lessonId);
            if (objectUrl) URL.revokeObjectURL(objectUrl);
            objectUrls.delete(video.lessonId);
            await paintState('डाउनलोड किया गया वीडियो हटा दिया गया है।');
            return;
          }

          progress.hidden = false;
          progress.value = 0;
          status.textContent = 'वीडियो डाउनलोड हो रहा है…';
          const response = await fetch(video.url, { mode: 'cors', credentials: 'omit', cache: 'no-store' });
          if (!response.ok || response.type === 'opaque') throw new Error(`HTTP ${response.status || 'response unavailable'}`);
          const contentLength = Number(response.headers.get('content-length')) || 0;
          if (!contentLength) progress.removeAttribute('value');
          let cacheError = null;
          const writeResponse = cache.put(video.url, response.clone()).catch(error => { cacheError = error; });
          if (response.body) {
            const reader = response.body.getReader();
            let received = 0;
            failureStage = 'response-read';
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              received += value.byteLength;
              if (contentLength) progress.value = Math.min(received / contentLength, 1) * 100;
            }
          }
          failureStage = 'cache-write';
          await writeResponse;
          if (cacheError) throw withDownloadStage(cacheError, 'cache-write');
          progress.value = 100;
          if (frame) await showLocalVideo(frame, video.lessonId);
          await paintState('वीडियो इस डिवाइस पर डाउनलोड हो गया है।');
        } catch (error) {
          console.warn(`Hindi lesson video ${number} was not cached.`, error);
          progress.hidden = true;
          await paintState(downloadFailureMessage(withDownloadStage(error, error?.downloadStage || failureStage), video.filename), true);
        }
      });

      paintState();
    });
  }

  async function showLocalVideo(frame, lessonId) {
    const src = await createLocalVideoUrl(lessonId);
    if (!src) return;
    const video = findIndividualVideo(lessonId);
    const player = document.createElement('video');
    player.controls = true;
    player.playsInline = true;
    player.preload = 'metadata';
    player.src = src;
    player.setAttribute('aria-label', `पाठ ${video?.number || ''} — स्थानीय वीडियो`);
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

  function initDirectDownloadPage() {
    const list = document.querySelector('#direct-video-download-list');
    if (!list) return;
    list.innerHTML = videos.map(video => `<li><span>पाठ ${video.number}</span><a href="${video.url}" target="_blank" rel="noopener noreferrer" download="${video.filename}">वीडियो डाउनलोड करें <span aria-hidden="true">↗</span></a></li>`).join('');
  }

  function initDownloadManager() {
    const manager = document.querySelector('#hindi-video-download-manager');
    if (!manager) return;
    const button = manager.querySelector('#hindi-video-download-button');
    const progress = manager.querySelector('#hindi-video-download-progress');
    const status = manager.querySelector('#hindi-video-download-status');
    let cacheAvailable = true;

    const paintState = async (message = '', directDownload = false) => {
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
        if (message) {
          status.textContent = message;
          if (directDownload) {
            const link = document.createElement('a');
            link.className = 'video-direct-download-link';
            link.href = 'hindi-video-downloads.html?lang=hi';
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = 'वीडियो ऐप के बाहर डाउनलोड करें ↗';
            status.append(document.createElement('br'), link);
          }
        } else status.textContent = count === VIDEO_COUNT
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
            const objectUrl = objectUrls.get(video.lessonId);
            if (objectUrl) URL.revokeObjectURL(objectUrl);
            objectUrls.delete(video.lessonId);
          }
          await paintState('डाउनलोड किए गए वीडियो हटा दिए गए हैं।');
          return;
        }

        const missingVideos = videos.filter(video => !downloaded.has(video.number));
        const storageWarning = await checkStorageForVideos(missingVideos);
        if (storageWarning) {
          progress.hidden = true;
          await paintState(storageWarning);
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

          let failureStage = 'fetch';
          try {
            const response = await fetch(video.url, { mode: 'cors', credentials: 'omit', cache: 'no-store' });
            if (!response.ok || response.type === 'opaque') {
              throw new Error(`HTTP ${response.status || 'response unavailable'}`);
            }

            const contentLength = Number(response.headers.get('content-length')) || 0;
            if (contentLength) progress.value = finishedCount * 100 + 1;
            else progress.removeAttribute('value');

            let cacheError = null;
            const writeResponse = cache.put(video.url, response.clone()).catch(error => {
              cacheError = withDownloadStage(error, 'cache-write');
            });
            if (response.body) {
              const reader = response.body.getReader();
              let received = 0;
              failureStage = 'response-read';
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
            failureStage = 'cache-write';
            await writeResponse;
            if (cacheError) throw cacheError;
            downloaded.add(video.number);
            finishedCount += 1;
            progress.value = finishedCount * 100;
          } catch (error) {
            console.warn(`Hindi lesson video ${video.number} was not cached.`, error);
            const stageError = withDownloadStage(error, error?.downloadStage || failureStage);
            failed.push({ number: video.number, error: stageError, filename: video.filename });
          }
        }

        progress.value = downloaded.size * 100;
        if (failed.length) {
          const numbers = failed.map(item => item.number).join(', ');
          const reason = downloadFailureMessage(failed[0].error, failed[0].filename);
          await paintState(`कुछ वीडियो डाउनलोड नहीं हुए (${numbers}). ${reason}`, true);
        } else {
          progress.hidden = true;
          await paintState('सभी 15 वीडियो इस डिवाइस पर डाउनलोड हो गए हैं।');
        }
      } catch (error) {
        console.warn('Hindi lesson video downloads could not be started.', error);
        progress.hidden = true;
        await paintState(downloadFailureMessage(error));
      } finally {
        if (cacheAvailable) button.disabled = false;
      }
    });

    paintState();
  }

  window.hindiVideoDownloads = {
    hasVideo: lessonId => !!findIndividualVideo(lessonId),
    initDownloadManager,
    createLocalVideoUrl,
    downloadButtonMarkup,
    individualDownloadMarkup,
    initIndividualDownloadButtons,
    initDirectDownloadPage
  };
  initDirectDownloadPage();
})();
