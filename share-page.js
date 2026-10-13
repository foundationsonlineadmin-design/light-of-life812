(() => {
  const button = document.querySelector('#share-btn');
  if (!button) return;

  function getShareData() {
    const hindi = document.documentElement.lang === 'hi';
    const destination = location.href;
    const sharePage = new URL(hindi ? 'share-hi.html' : 'share-en.html', location.href);
    sharePage.searchParams.set('to', destination);
    return {
      title: document.title,
      text: hindi ? 'जीवन की ज्योति की बाइबल अध्ययन श्रृंखला देखें।' : 'Explore the Bible together, one discovery at a time.',
      url: sharePage.href,
      hindi
    };
  }

  window.getLocalizedShareUrl = () => getShareData().url;

  async function copyLink(url) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return true;
    }
    const field = document.createElement('textarea');
    field.value = url;
    field.setAttribute('readonly', '');
    field.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
    document.body.append(field);
    field.select();
    const copied = document.execCommand('copy');
    field.remove();
    return copied;
  }

  button.addEventListener('click', async () => {
    const shareData = getShareData();
    button.setAttribute('aria-label', shareData.hindi ? 'पेज साझा करें' : 'Share this page');
    try {
      if (navigator.share) {
        await navigator.share({title: shareData.title, text: shareData.text, url: shareData.url});
        return;
      }
      if (await copyLink(shareData.url)) {
        alert(shareData.hindi ? 'पेज का लिंक कॉपी हो गया।' : 'Page link copied.');
        return;
      }
    } catch (error) {
      if (error?.name === 'AbortError') return;
      try {
        if (await copyLink(shareData.url)) {
          alert(shareData.hindi ? 'पेज का लिंक कॉपी हो गया।' : 'Page link copied.');
          return;
        }
      } catch {}
    }
    prompt(shareData.hindi ? 'इस लिंक को कॉपी करें:' : 'Copy this page link:', shareData.url);
  });
})();
