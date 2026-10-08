(() => {
  const button = document.querySelector('#share-btn');
  if (!button) return;
  const hindi = document.documentElement.lang === 'hi';
  const shareData = {
    title: document.title,
    text: hindi ? 'जीवन की ज्योति की बाइबल अध्ययन श्रृंखला देखें।' : 'Explore Light of Life and choose a language to begin.',
    url: location.href
  };

  async function copyLink() {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareData.url);
      return true;
    }
    const field = document.createElement('textarea');
    field.value = shareData.url;
    field.setAttribute('readonly', '');
    field.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
    document.body.append(field);
    field.select();
    const copied = document.execCommand('copy');
    field.remove();
    return copied;
  }

  button.setAttribute('aria-label', hindi ? 'पेज साझा करें' : 'Share this page');
  button.addEventListener('click', async () => {
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      if (await copyLink()) {
        alert(hindi ? 'पेज का लिंक कॉपी हो गया।' : 'Page link copied.');
        return;
      }
    } catch (error) {
      if (error?.name === 'AbortError') return;
      try {
        if (await copyLink()) {
          alert(hindi ? 'पेज का लिंक कॉपी हो गया।' : 'Page link copied.');
          return;
        }
      } catch {}
    }
    prompt(hindi ? 'इस लिंक को कॉपी करें:' : 'Copy this page link:', shareData.url);
  });
})();
