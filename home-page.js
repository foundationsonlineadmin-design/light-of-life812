const root = document.querySelector('#home-page');
const lang = new URLSearchParams(location.search).get('lang') === 'hi' ? 'hi' : 'en';
const data = catalog[lang];
progressStore.setLanguage(lang);
const copy = lang === 'hi' ? {
  welcome: 'आपका स्वागत है',
  title: 'जीवन की ज्योति',
  lessons: 'पाठ शुरू करें',
  installEyebrow: 'अपने साथ रखें',
  installTitle: 'ऐप इंस्टॉल करें',
  installDescription: 'पूरे स्क्रीन के अनुभव के लिए इस साइट को अपनी होम स्क्रीन पर जोड़ें। इंस्टॉल करना वैकल्पिक है; यह श्रृंखला ब्राउज़र में भी उपलब्ध है।',
  installButton: 'ऐप इंस्टॉल करें',
  android: 'Android या कंप्यूटर',
  androidSteps: 'ऊपर <b>ऐप इंस्टॉल करें</b> पर टैप करें, या ब्राउज़र मेनू खोलकर <b>ऐप इंस्टॉल करें</b> या <b>होम स्क्रीन पर जोड़ें</b> चुनें।',
  apple: 'iPhone या iPad',
  appleSteps: 'Safari में <b>शेयर</b> बटन टैप करें, <b>होम स्क्रीन पर जोड़ें</b> चुनें, फिर <b>जोड़ें</b> टैप करें।',
  logoAlt: 'जीवन की ज्योति का लोगो',
  brand: 'जीवन की ज्योति',
  documentTitle: 'जीवन की ज्योति — बाइबल खोज श्रृंखला'
} : {
  welcome: 'Welcome',
  title: 'Light of Life',
  lessons: 'Explore the lessons',
  installEyebrow: 'Take it with you',
  installTitle: 'Install Light of Life',
  installDescription: 'Add this site to your home screen for a full-screen app experience. Installation is optional; the series also works in your browser.',
  installButton: 'Install app',
  android: 'Android or desktop',
  androidSteps: 'Tap <b>Install app</b> above when it appears, or open your browser menu and choose <b>Install app</b> or <b>Add to Home screen</b>.',
  apple: 'iPhone or iPad',
  appleSteps: 'In Safari, tap the <b>Share</b> button, choose <b>Add to Home Screen</b>, then tap <b>Add</b>.',
  logoAlt: 'Light of Life logo',
  brand: 'LIGHT OF LIFE',
  documentTitle: 'Light of Life — Discovery Bible Series'
};
document.documentElement.lang = lang;
document.title = copy.documentTitle;
document.querySelector('.topbar .brand').href = `home.html?lang=${lang}`;
document.querySelector('.topbar .brand').setAttribute('aria-label', copy.brand);
document.querySelector('.language-shortcut').setAttribute('aria-label', lang === 'hi' ? 'भाषा चुनें' : 'Choose language');
document.querySelector('.tracking-shortcut')?.setAttribute('aria-label', lang === 'hi' ? 'समूह की प्रगति' : 'Group progress');
document.querySelector('#share-btn')?.setAttribute('aria-label', lang === 'hi' ? 'पेज साझा करें' : 'Share this page');
root.innerHTML = `<section class="language-home-hero ${lang === 'hi' ? 'hindi' : ''}">
  <div class="language-home-copy"><span class="eyebrow">${copy.welcome}</span>
  <h1>${copy.title}</h1>
  ${copy.intro ? `<p>${copy.intro}</p>` : ''}
  <a class="primary-btn lessons-entry" href="language.html?lang=${lang}">${copy.lessons}<span aria-hidden="true">→</span></a></div>
  <span class="language-home-logo-frame ${lang === 'hi' ? 'hindi-logo' : 'english-logo'}"><img class="language-home-logo" src="${data.logo}" alt="${copy.logoAlt}"></span>
</section>
<section class="install-guide ${lang === 'hi' ? 'hindi' : ''}" id="install-instructions">
  <div><span class="eyebrow">${copy.installEyebrow}</span><h2>${copy.installTitle}</h2><p>${copy.installDescription}</p><button class="primary-btn" id="install-guide-btn">${copy.installButton} <span aria-hidden="true">↓</span></button></div>
  <div class="install-steps"><details open><summary>${copy.android}</summary><p>${copy.androidSteps}</p></details><details><summary>${copy.apple}</summary><p>${copy.appleSteps}</p></details></div>
</section>`;
document.querySelector('#install-btn').textContent = copy.installButton;
if (lang === 'hi') {
  const sizeToggle = document.querySelector('#text-size-toggle');
  sizeToggle.setAttribute('aria-label', 'पाठ का आकार');
  document.querySelector('#text-size-panel').setAttribute('aria-label', 'पाठ का आकार नियंत्रित करें');
  document.querySelector('.text-size-panel-title').textContent = 'पाठ का आकार';
  document.querySelector('#text-size-decrease').setAttribute('aria-label', 'पाठ छोटा करें');
  document.querySelector('#text-size-increase').setAttribute('aria-label', 'पाठ बड़ा करें');
  document.querySelector('#text-size-reset').textContent = 'रीसेट';
}
document.querySelector('#install-guide-btn').addEventListener('click', () => {
  const installButton = document.querySelector('#install-btn');
  if (!installButton.hidden) installButton.click();
  else document.querySelector('#install-instructions details').open = true;
});
