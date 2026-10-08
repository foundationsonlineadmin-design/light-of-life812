const app = document.querySelector('#app');

function esc(s = '') {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function langClass(lang) { return lang === 'hi' ? 'hindi' : ''; }
function languageCard(language, code) {
  return `<a class="language-card" href="home.html?lang=${code}"><img src="${language.logo}" alt="${esc(language.name)} logo"><span><h3 class="${langClass(code)}">${esc(language.native)}</h3>${language.tagline ? `<p>${esc(language.tagline)}</p>` : ''}</span><span class="card-arrow">›</span></a>`;
}
function languagePicker() {
  app.innerHTML = `<div class="page-head"><div><span class="eyebrow">Welcome</span><h1>Choose a language</h1><p>Choose the language you’d like to explore in.</p></div><span class="pill">2 languages available</span></div><div class="language-grid">${['hi', 'en'].map(code => languageCard(catalog[code], code)).join('')}</div>`;
}
function progressPage() {
  const lang = progressStore.getLanguage();
  const data = catalog[lang];
  const state = progressStore.getData();
  const group = progressStore.activeGroup(state);
  const completed = Object.entries(group.completed).filter(([key, value]) => value && key.startsWith(`${lang}:`));
  const nextLesson = data.lessons.find(item => !group.completed[`${lang}:${item.id}`]);
  const hi = lang === 'hi';
  const labels = {
    journey: hi ? 'आपकी यात्रा' : 'Your journey',
    title: hi ? 'प्रगति' : 'Progress',
    description: hi ? 'आपकी पूरी की गई पाठ-यात्रा इस डिवाइस पर सेव है।' : 'Your completed lessons are saved on this device.',
    select: hi ? 'समूह चुनें' : 'Choose group',
    create: hi ? 'नया समूह बनाएँ' : 'Create a group',
    name: hi ? 'समूह का नाम' : 'Group name',
    createButton: hi ? 'समूह बनाएँ' : 'Create group',
    keep: hi ? 'अगला पाठ' : 'Next lesson',
    tracking: hi ? 'समूह' : 'Group',
    allDone: hi ? 'इस समूह ने सभी पाठ पूरे कर लिए हैं।' : 'This group has completed every lesson.',
    complete: hi ? 'पूरा हुआ' : 'Completed',
    empty: hi ? 'आपकी पहली खोज प्रतीक्षा कर रही है।' : 'Your first discovery is waiting.',
    chooseLanguage: hi ? 'भाषा चुनें' : 'Choose a language to begin'
  };
  app.innerHTML = `<div class="page-head"><div><span class="eyebrow">${labels.journey}</span><h1 class="${langClass(lang)}">${labels.title}</h1><p class="${langClass(lang)}">${labels.description}</p></div></div>
    <section class="group-manager ${langClass(lang)}"><label for="progress-group-select">${labels.select}</label><select id="progress-group-select" aria-label="${labels.select}">${state.groups.map(item => `<option value="${esc(item.id)}" ${item.id === group.id ? 'selected' : ''}>${esc(item.name)}</option>`).join('')}</select>
      <details class="group-create"><summary>${labels.create}</summary><form id="create-group-form"><label for="new-group-name">${labels.name}</label><input id="new-group-name" name="name" maxlength="60" required autocomplete="off"><button class="primary-btn" type="submit">${labels.createButton}</button></form></details></section>
    <section class="progress-summary ${langClass(lang)}"><div><h2>${labels.keep}</h2><p>${labels.tracking}: ${esc(group.name)}</p>${nextLesson ? `<a class="next-lesson-link" href="lesson.html?lang=${lang}&id=${encodeURIComponent(nextLesson.id)}">${esc(nextLesson.title)} →</a>` : `<p class="next-lesson-complete">${labels.allDone}</p>`}</div><div class="progress-count">${completed.length}<span style="font-size:19px;color:#f5e6d1"> / ${data.lessons.length}</span></div></section>
    ${completed.length ? `<div class="lesson-list">${completed.map(([key]) => { const id = key.split(':')[1], lesson = data.lessons.find(item => item.id === id); return lesson ? `<a class="lesson-row is-done" href="lesson.html?lang=${lang}&id=${encodeURIComponent(id)}"><span class="lesson-number">${lesson.number === 'Intro' ? '✦' : String(lesson.number).padStart(2, '0')}</span><span><h3 class="${langClass(lang)}">${esc(lesson.title)}</h3><p>${esc(lesson.ref)}</p></span><span class="lesson-completion" role="img" aria-label="${labels.complete}" title="${labels.complete}">✓</span></a>` : ''; }).join('')}</div>` : `<div class="empty-note ${langClass(lang)}">${labels.empty}<br><a class="text-link" href="index.html#language">${labels.chooseLanguage} →</a></div>`}`;

  document.querySelector('#progress-group-select').addEventListener('change', event => {
    progressStore.setActiveGroup(event.target.value);
    progressPage();
  });
  document.querySelector('#create-group-form').addEventListener('submit', event => {
    event.preventDefault();
    if (progressStore.createGroup(document.querySelector('#new-group-name').value)) progressPage();
  });
}
function setInterfaceLanguage(lang, progressView) {
  const hi = progressView && lang === 'hi';
  document.documentElement.lang = hi ? 'hi' : 'en';
  document.title = progressView ? (hi ? 'प्रगति — जीवन की ज्योति' : 'Progress — Light of Life') : 'Choose a language — Light of Life';
  const nav = document.querySelector('.bottom-nav');
  nav?.setAttribute('aria-label', hi ? 'मुख्य नेविगेशन' : 'Main navigation');
  const homeLink = document.querySelector('[data-nav="home"]');
  const progressLink = document.querySelector('[data-nav="progress"]');
  if (homeLink) homeLink.innerHTML = `<span>⌂</span>${hi ? 'होम' : 'Home'}`;
  if (progressLink) progressLink.innerHTML = `<span>◷</span>${hi ? 'प्रगति' : 'Progress'}`;
  document.querySelector('.language-shortcut')?.setAttribute('aria-label', hi ? 'भाषा चुनें' : 'Choose language');
  document.querySelector('.tracking-shortcut')?.setAttribute('aria-label', hi ? 'समूह की प्रगति' : 'Group progress');
  document.querySelector('#share-btn')?.setAttribute('aria-label', hi ? 'पेज साझा करें' : 'Share this page');
  document.querySelector('.avatar')?.setAttribute('aria-label', hi ? 'आपकी प्रगति' : 'Your progress');
  const install = document.querySelector('#install-btn');
  if (install) install.textContent = hi ? 'ऐप इंस्टॉल करें' : 'Install app';
  if (hi) {
    document.querySelector('#text-size-toggle')?.setAttribute('aria-label', 'पाठ का आकार');
    document.querySelector('#text-size-panel')?.setAttribute('aria-label', 'पाठ का आकार नियंत्रित करें');
    const title = document.querySelector('.text-size-panel-title'); if (title) title.textContent = 'पाठ का आकार';
    document.querySelector('#text-size-decrease')?.setAttribute('aria-label', 'पाठ छोटा करें');
    document.querySelector('#text-size-increase')?.setAttribute('aria-label', 'पाठ बड़ा करें');
    const reset = document.querySelector('#text-size-reset'); if (reset) reset.textContent = 'रीसेट';
  } else {
    document.querySelector('#text-size-toggle')?.setAttribute('aria-label', 'Text size');
    document.querySelector('#text-size-panel')?.setAttribute('aria-label', 'Text size controls');
    const title = document.querySelector('.text-size-panel-title'); if (title) title.textContent = 'Text size';
    document.querySelector('#text-size-decrease')?.setAttribute('aria-label', 'Decrease text size');
    document.querySelector('#text-size-increase')?.setAttribute('aria-label', 'Increase text size');
    const reset = document.querySelector('#text-size-reset'); if (reset) reset.textContent = 'Reset';
  }
}
function render() {
  const isProgress = location.hash === '#progress';
  if (isProgress) progressPage(); else languagePicker();
  const lang = isProgress ? progressStore.getLanguage() : 'en';
  setInterfaceLanguage(lang, isProgress);
  document.querySelectorAll('[data-nav]').forEach(link => link.classList.toggle('active', link.dataset.nav === (isProgress ? 'progress' : 'home')));
  window.applyBrandLanguage?.();
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', render);
render();
