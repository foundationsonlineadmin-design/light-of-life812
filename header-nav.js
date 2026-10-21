(() => {
  const isHindi = document.documentElement.lang === 'hi';
  const language = new URLSearchParams(location.search).get('lang') || (() => { try { return localStorage.getItem('lol-discovery-language-v1'); } catch { return ''; } })() || (isHindi ? 'hi' : 'en');
  const footerHindi = language === 'hi';
  const footerNav = document.createElement('nav');
  footerNav.className = 'bottom-nav app-footer-nav';
  footerNav.setAttribute('aria-label', footerHindi ? 'मुख्य नेविगेशन' : 'Main navigation');
  const appShell = document.querySelector('.app-shell') || document.body;
  const siteFooter = appShell.querySelector('.site-footer');
  appShell.insertBefore(footerNav, siteFooter || null);

  const homeLink = document.querySelector('.brand');
  if (homeLink) {
    homeLink.classList.add('footer-home-link');
    homeLink.href = `home.html?lang=${language}`;
    homeLink.setAttribute('aria-label', footerHindi ? 'मुखपृष्ठ' : 'Home');
    homeLink.innerHTML = `<span class="brand-mark" aria-hidden="true">✦</span><span class="footer-nav-label">${footerHindi ? 'होम' : 'Home'}</span>`;
    footerNav.append(homeLink);
    homeLink.closest('.header-home-nav')?.remove();
  }
  const topbar = document.querySelector('.topbar');
  if (topbar && !topbar.children.length) topbar.remove();
  if (topbar) {
    let topActions = topbar.querySelector('.top-actions');
    if (!topActions) {
      topActions = document.createElement('div');
      topActions.className = 'top-actions';
      topbar.append(topActions);
    }
    if (!topActions.querySelector('.tracking-shortcut')) {
      const progressLink = document.createElement('a');
      progressLink.className = 'icon-btn tracking-shortcut';
      progressLink.href = `index.html?lang=${language}#progress`;
      progressLink.setAttribute('aria-label', footerHindi ? 'समूह की प्रगति' : 'Group progress');
      progressLink.title = footerHindi ? 'समूह की प्रगति' : 'Group progress';
      const progressIcon = document.createElement('img');
      progressIcon.src = 'assets/group-button.png';
      progressIcon.alt = '';
      progressIcon.setAttribute('aria-hidden', 'true');
      progressLink.append(progressIcon);
      topActions.insertBefore(progressLink, topActions.querySelector('#share-btn'));
    }
  }
  const backControl = document.querySelector('.back-shortcut') || document.createElement('button');
  backControl.type = 'button';
  backControl.classList.add('back-shortcut', 'footer-back-button');
  backControl.setAttribute('aria-label', footerHindi ? 'वापस जाएँ' : 'Go back');
  backControl.title = footerHindi ? 'वापस जाएँ' : 'Go back';
  backControl.innerHTML = `<span aria-hidden="true">←</span><span class="footer-nav-label">${footerHindi ? 'वापस' : 'Back'}</span>`;
  footerNav.insertBefore(backControl, homeLink || footerNav.firstChild);

  const lessonsFallback = document.createElement('a');
  lessonsFallback.className = 'footer-lessons-button';
  lessonsFallback.href = `language.html?lang=${language}`;
  lessonsFallback.setAttribute('aria-label', footerHindi ? 'पाठ खोलें' : 'Open lessons');
  lessonsFallback.innerHTML = `<span aria-hidden="true">☷</span><span class="footer-nav-label">${footerHindi ? 'पाठ' : 'Lessons'}</span>`;
  footerNav.append(lessonsFallback);
  const moveLessonsButton = () => {
    const drawerToggle = document.querySelector('.drawer-toggle');
    if (!drawerToggle || drawerToggle.parentElement === footerNav) return false;
    drawerToggle.classList.add('footer-lessons-button');
    drawerToggle.innerHTML = `<span aria-hidden="true">☷</span><span class="footer-nav-label">${footerHindi ? 'पाठ' : 'Lessons'}</span>`;
    lessonsFallback.replaceWith(drawerToggle);
    return true;
  };
  const pageName = location.pathname.split('/').pop();
  if (['lesson.html', 'language.html'].includes(pageName)) {
    if (!moveLessonsButton()) {
      const observer = new MutationObserver(() => { if (moveLessonsButton()) observer.disconnect(); });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  } else {
    const globalDrawer = document.createElement('aside');
    globalDrawer.className = 'lesson-drawer';
    globalDrawer.id = 'global-lesson-drawer';
    globalDrawer.setAttribute('aria-label', footerHindi ? 'पाठ चयन' : 'Lesson selection');
    const closeButtonLabel = footerHindi ? 'पाठ सूची बंद करें' : 'Close lesson list';
    const listTitle = footerHindi ? 'पाठ' : 'Lessons';
    const catalog = window.catalog?.[language];
    const completed = Object.keys(window.progressStore?.activeGroup?.()?.completed || {});
    const icons = {
      'jesus-story': 'assets/lesson-images/hand-gospel-medium-small.png',
      'lesson-20-part-2': 'assets/lesson-images/20-2-abiding-hand-medium-small.png',
      'lesson-23-part-2': 'assets/lesson-images/testimony.png',
      'lesson-27-part-2': 'assets/lesson-images/map-pin.png',
      'church-essentials': 'assets/lesson-images/church-essentials.png',
      'co-workers-study': 'assets/lesson-images/lesson-34.png',
      'four-fields-plan': 'assets/lesson-images/lesson-29.png'
    };
    const rows = (catalog?.lessons || []).map(item => {
      const isDone = completed.includes(`${language}:${item.id}`);
      const number = item.number === 'Intro' ? '' : `${item.number}. `;
      let marker = icons[item.id]
        ? `<img class="lesson-thumb" src="${icons[item.id]}" alt="" aria-hidden="true">`
        : item.id === 'what-next'
          ? '<svg class="lesson-next-icon" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21"/><path d="M11 24h25m-10-10 10 10-10 10"/></svg>'
          : item.id === 'jesus-film'
            ? '<svg class="lesson-play-icon" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21"/><path d="M20 15.5 34 24l-14 8.5z"/></svg>'
            : item.number === 'Intro' || ['what-next','church-essentials','co-workers-study','four-fields-plan'].includes(item.id)
              ? '<span class="lesson-number lesson-star" aria-hidden="true">✦</span>'
              : `<img class="lesson-thumb" src="assets/lesson-images/lesson-${String(parseInt(item.number,10)).padStart(2,'0')}${parseInt(item.number,10)<=15?'-transparent':''}.png" alt="" aria-hidden="true">`;
      return `<a href="lesson.html?lang=${language}&id=${encodeURIComponent(item.id)}" class="${isDone?'is-done':''}">${marker}<span class="${footerHindi?'hindi':''}">${number?`<span class="lesson-title-number">${number}</span>`:''}${item.title}</span>${isDone?'<span class="lesson-completion" aria-label="Completed">✓</span>':''}</a>`;
    }).join('');
    globalDrawer.innerHTML = `<div class="drawer-head"><strong>${listTitle}</strong><button type="button" aria-label="${closeButtonLabel}">×</button></div><nav>${rows}</nav>`;
    const globalScrim = document.createElement('div');
    globalScrim.className = 'drawer-scrim';
    globalScrim.id = 'global-lesson-drawer-scrim';
    appShell.append(globalDrawer, globalScrim);
    const drawerButton = document.createElement('button');
    drawerButton.type = 'button';
    drawerButton.className = 'drawer-toggle footer-lessons-button';
    drawerButton.setAttribute('aria-expanded', 'false');
    drawerButton.setAttribute('aria-controls', globalDrawer.id);
    drawerButton.setAttribute('aria-label', footerHindi ? 'पाठ खोलें' : 'Open lessons');
    drawerButton.innerHTML = `<span aria-hidden="true">☷</span><span class="footer-nav-label">${footerHindi ? 'पाठ' : 'Lessons'}</span>`;
    lessonsFallback.replaceWith(drawerButton);
    const setDrawerOpen = open => {
      globalDrawer.classList.toggle('open', open);
      globalScrim.classList.toggle('visible', open);
      drawerButton.setAttribute('aria-expanded', String(open));
    };
    drawerButton.addEventListener('click', () => setDrawerOpen(!globalDrawer.classList.contains('open')));
    globalScrim.addEventListener('click', () => setDrawerOpen(false));
    globalDrawer.querySelector('.drawer-head button').addEventListener('click', () => setDrawerOpen(false));
  }
  const qrButton = document.querySelector('.qr-code-shortcut');
  {
    const labels = language === 'hi'
      ? [['jesus-story', ''], ['lesson-20-part-2', '20.2'], ['lesson-23-part-2', '23.2'], ['lesson-27-part-2', '27.2'], ['church-essentials', '']]
      : [['jesus-story', ''], ['lesson-20-part-2', '20.2'], ['lesson-23-part-2', '23.2'], ['lesson-27-part-2', '27.2'], ['church-essentials', '']];
    const lessons = window.catalog?.[language]?.lessons || [];
    const shortcut = document.createElement('div');
    shortcut.className = 'lesson-shortcut';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'icon-btn lesson-shortcut-toggle';
    button.innerHTML = `<img src="assets/book-button.png" alt="" aria-hidden="true"><span class="footer-nav-label">${footerHindi ? 'बाइबल' : 'Bible'}</span>`;
    button.setAttribute('aria-label', language === 'hi' ? 'बाइबल मेनू खोलें' : 'Open Bible menu');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-haspopup', 'dialog');
    const menu = document.createElement('aside');
    menu.className = 'lesson-drawer book-drawer';
    menu.id = 'book-menu-drawer';
    menu.setAttribute('aria-label', language === 'hi' ? 'बाइबल मेनू' : 'Bible menu');
    const drawerHeading = document.createElement('div');
    drawerHeading.className = 'drawer-head';
    const drawerTitle = document.createElement('strong');
    drawerTitle.textContent = language === 'hi' ? 'बाइबल' : 'Bible';
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.textContent = '×';
    closeButton.setAttribute('aria-label', language === 'hi' ? 'बाइबल मेनू बंद करें' : 'Close Bible menu');
    drawerHeading.append(drawerTitle, closeButton);
    const menuLinks = document.createElement('nav');
    menuLinks.setAttribute('aria-label', language === 'hi' ? 'पुस्तक विकल्प' : 'Book options');
    const bibleLink = document.createElement('a');
    bibleLink.href = `bible.html?lang=${language}`;
    bibleLink.classList.add('has-lesson-thumb');
    const bibleIcon = document.createElement('img');
    bibleIcon.className = 'lesson-thumb';
    bibleIcon.src = 'assets/book-button.png';
    bibleIcon.alt = '';
    bibleIcon.setAttribute('aria-hidden', 'true');
    const bibleLabel = document.createElement('span');
    bibleLabel.textContent = language === 'hi' ? 'पूरी बाइबल पढ़ें' : 'Read the whole Bible';
    bibleLink.append(bibleIcon, bibleLabel);
    menuLinks.append(bibleLink);
    for (const [id, number] of labels) {
      const lesson = lessons.find(item => item.id === id);
      if (!lesson) continue;
      const link = document.createElement('a');
      link.href = `lesson.html?lang=${language}&id=${encodeURIComponent(id)}`;
      if (id === 'jesus-story' || id === 'lesson-20-part-2' || id === 'lesson-23-part-2' || id === 'lesson-27-part-2' || id === 'church-essentials') {
        link.classList.add('has-lesson-thumb');
        const image = document.createElement('img');
        image.className = 'lesson-thumb';
        image.src = id === 'jesus-story'
          ? 'assets/lesson-images/hand-gospel-medium-small.png'
          : id === 'lesson-20-part-2'
            ? 'assets/lesson-images/20-2-abiding-hand-medium-small.png'
            : id === 'lesson-23-part-2'
              ? 'assets/lesson-images/testimony.png'
              : id === 'lesson-27-part-2'
                ? 'assets/lesson-images/map-pin.png'
                : 'assets/lesson-images/church-essentials.png';
        image.alt = '';
        image.setAttribute('aria-hidden', 'true');
        link.append(image);
      }
      const title = document.createElement('span');
      title.textContent = `${number ? `${number} · ` : ''}${lesson.title}`;
      link.append(title);
      menuLinks.append(link);
    }
    const platform = [navigator.userAgentData?.platform, navigator.platform, navigator.userAgent].filter(Boolean).join(' ');
    const isIOS = /iPhone|iPad|iPod/i.test(platform) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/i.test(platform);
    const youVersionLink = document.createElement('a');
    youVersionLink.classList.add('has-lesson-thumb');
    const youVersionIcon = document.createElement('img');
    youVersionIcon.className = 'lesson-thumb';
    youVersionIcon.src = 'assets/book-button.png';
    youVersionIcon.alt = '';
    youVersionIcon.setAttribute('aria-hidden', 'true');
    const youVersionLabel = document.createElement('span');
    if (isIOS) {
      youVersionLink.href = 'https://apps.apple.com/app/bible/id282935706';
      youVersionLabel.textContent = language === 'hi' ? 'YouVersion बाइबल ऐप डाउनलोड करें' : 'Get the YouVersion Bible App';
    } else if (isAndroid) {
      youVersionLink.href = 'https://play.google.com/store/apps/details?id=com.sirma.mobile.bible.android';
      youVersionLabel.textContent = language === 'hi' ? 'YouVersion बाइबल ऐप डाउनलोड करें' : 'Get the YouVersion Bible App';
    } else {
      youVersionLink.href = 'https://www.bible.com/';
      youVersionLabel.textContent = language === 'hi' ? 'YouVersion बाइबल ऑनलाइन खोलें' : 'Open YouVersion Bible online';
    }
    youVersionLink.append(youVersionIcon, youVersionLabel);
    if (isIOS || isAndroid) menuLinks.append(youVersionLink);
    menu.append(drawerHeading, menuLinks);
    button.setAttribute('aria-controls', menu.id);
    const menuScrim = document.createElement('div');
    menuScrim.className = 'drawer-scrim book-drawer-scrim';
    menuScrim.id = 'book-menu-drawer-scrim';
    appShell.append(menu, menuScrim);
    shortcut.append(button);
    footerNav.insertBefore(shortcut, footerNav.querySelector('.footer-lessons-button'));
    const setBookMenuOpen = open => {
      button.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('open', open);
      menuScrim.classList.toggle('visible', open);
    };
    button.addEventListener('click', () => {
      setBookMenuOpen(button.getAttribute('aria-expanded') !== 'true');
    });
    menuScrim.addEventListener('click', () => setBookMenuOpen(false));
    closeButton.addEventListener('click', () => setBookMenuOpen(false));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        setBookMenuOpen(false);
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
  const languageShortcut = document.querySelector('.language-shortcut');
  if (languageShortcut) {
    const currentPage = location.pathname.split('/').pop();
    let returnTo = `${currentPage}${location.search}${location.hash}`;
    if (currentPage === 'index.html' && location.hash === '#language') {
      returnTo = new URLSearchParams(location.search).get('return') || '';
    }
    const languagePicker = new URL('index.html', location.href);
    languagePicker.searchParams.set('lang', language);
    if (returnTo) languagePicker.searchParams.set('return', returnTo);
    languagePicker.hash = 'language';
    languageShortcut.href = `${languagePicker.pathname}${languagePicker.search}${languagePicker.hash}`;
  }
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
      'bible.html': `language.html?lang=${language}`,
      'language.html': `home.html?lang=${language}`,
      'hindi-video-downloads.html': 'language.html?lang=hi',
      'home.html': 'index.html',
      'index.html': `home.html?lang=${language}`
    };
    location.href = destinations[page] || 'index.html';
  });
})();
