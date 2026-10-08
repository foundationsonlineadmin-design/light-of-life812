(() => {
  const isHindi = document.documentElement.lang === 'hi';
  const language = new URLSearchParams(location.search).get('lang') || (isHindi ? 'hi' : 'en');
  const qrButton = document.querySelector('.qr-code-shortcut');
  if (qrButton) {
    const labels = language === 'hi'
      ? [['lesson-20-part-2', '20.2'], ['lesson-23-part-2', '23.2'], ['lesson-27-part-2', '27.2'], ['church-essentials', '']]
      : [['lesson-20-part-2', '20.2'], ['lesson-23-part-2', '23.2'], ['lesson-27-part-2', '27.2'], ['church-essentials', '']];
    const lessons = window.catalog?.[language]?.lessons || [];
    const shortcut = document.createElement('div');
    shortcut.className = 'lesson-shortcut';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'icon-btn lesson-shortcut-toggle';
    button.textContent = '+';
    button.setAttribute('aria-label', language === 'hi' ? 'विशेष पाठ खोलें' : 'Open featured lessons');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-haspopup', 'true');
    const menu = document.createElement('nav');
    menu.className = 'lesson-shortcut-menu';
    menu.hidden = true;
    menu.setAttribute('aria-label', language === 'hi' ? 'विशेष पाठ' : 'Featured lessons');
    for (const [id, number] of labels) {
      const lesson = lessons.find(item => item.id === id);
      if (!lesson) continue;
      const link = document.createElement('a');
      link.href = `lesson.html?lang=${language}&id=${encodeURIComponent(id)}`;
      link.textContent = `${number ? `${number} · ` : ''}${lesson.title}`;
      menu.append(link);
    }
    shortcut.append(button, menu);
    qrButton.parentNode.insertBefore(shortcut, qrButton);
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      menu.hidden = !open;
    });
    document.addEventListener('click', event => {
      if (!shortcut.contains(event.target)) {
        button.setAttribute('aria-expanded', 'false');
        menu.hidden = true;
      }
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        button.setAttribute('aria-expanded', 'false');
        menu.hidden = true;
      }
    });
  }
  if (qrButton) {
    const dialog = document.createElement('dialog');
    dialog.id = 'qr-code-dialog';
    dialog.className = 'qr-code-dialog';
    dialog.setAttribute('aria-label', isHindi ? 'वेबसाइट का क्यूआर कोड' : 'Website QR code');
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'qr-code-close';
    close.textContent = '×';
    close.setAttribute('aria-label', isHindi ? 'क्यूआर कोड बंद करें' : 'Close QR code');
    const image = document.createElement('img');
    image.src = 'assets/lightoflife812-qr.png';
    image.alt = isHindi ? 'लाइट ऑफ लाइफ वेबसाइट खोलने के लिए क्यूआर कोड' : 'QR code linking to the Light of Life website';
    dialog.append(close, image);
    document.body.append(dialog);
    const closeDialog = () => { if (dialog.open) dialog.close(); };
    qrButton.setAttribute('aria-label', isHindi ? 'वेबसाइट का क्यूआर कोड दिखाएँ' : 'Show website QR code');
    qrButton.title = isHindi ? 'वेबसाइट का क्यूआर कोड' : 'Website QR code';
    qrButton.addEventListener('click', () => { dialog.showModal(); qrButton.setAttribute('aria-expanded', 'true'); });
    close.addEventListener('click', closeDialog);
    dialog.addEventListener('click', event => { if (event.target === dialog) closeDialog(); });
    dialog.addEventListener('close', () => qrButton.setAttribute('aria-expanded', 'false'));
  }
  const back = document.querySelector('.back-shortcut');
  if (!back) return;
  back.setAttribute('aria-label', isHindi ? 'वापस जाएँ' : 'Go back');
  back.title = isHindi ? 'वापस जाएँ' : 'Go back';
  document.querySelector('.language-shortcut')?.setAttribute('aria-label', isHindi ? 'भाषा चुनें' : 'Choose language');
  document.querySelector('.tracking-shortcut')?.setAttribute('aria-label', isHindi ? 'समूह की प्रगति' : 'Group progress');
  back.addEventListener('click', () => {
    if (history.length > 1) {
      history.back();
      return;
    }

    const page = location.pathname.split('/').pop();
    const destinations = {
      'lesson.html': `language.html?lang=${language}`,
      'language.html': `home.html?lang=${language}`,
      'home.html': 'index.html',
      'index.html': `home.html?lang=${language}`
    };
    location.href = destinations[page] || 'index.html';
  });
})();
