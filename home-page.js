const root = document.querySelector('#home-page');
const requestedLanguage = new URLSearchParams(location.search).get('lang');
const lang = requestedLanguage === 'hi' || requestedLanguage === 'en' ? requestedLanguage : progressStore.getLanguage();
const data = catalog[lang];
progressStore.setLanguage(lang);
const copy = lang === 'hi' ? {
  welcome: 'आपका स्वागत है',
  title: 'जीवन की ज्योति',
  lessons: 'पाठ शुरू करें',
  installEyebrow: 'अपने साथ रखें',
  installTitle: 'ऐप इंस्टॉल करें',
  installDescription: 'अपने डिवाइस के लिए निर्देश देखने हेतु नीचे चुनें।',
  installButton: 'ऐप इंस्टॉल करें',
  android: 'Android फ़ोन या टैबलेट',
  androidSteps: 'Chrome में ऊपर <b>ऐप इंस्टॉल करें</b> पर टैप करें। अगर यह बटन उपलब्ध न हो, तो Chrome मेनू खोलें और <b>ऐप इंस्टॉल करें</b> या <b>होम स्क्रीन पर जोड़ें</b> चुनें। अन्य ब्राउज़र में मेनू से <b>होम स्क्रीन पर जोड़ें</b> चुनें।',
  windows: 'Windows PC',
  windowsSteps: 'Microsoft Edge में पता बार का <b>ऐप उपलब्ध है</b> आइकन चुनें, या मेनू में <b>Apps → Install this site as an app</b> खोलें। Chrome में पता बार का इंस्टॉल आइकन चुनें या मेनू में <b>Install page as app</b> चुनें।',
  mac: 'Mac',
  macSteps: 'Safari (macOS Sonoma 14 या नया) में मेनू बार से <b>File → Add to Dock</b> चुनें। Chrome या Edge में पता बार का इंस्टॉल आइकन चुनें या ब्राउज़र मेनू से इंस्टॉल करें।',
  apple: 'iPhone या iPad',
  appleSteps: 'Safari में <b>शेयर</b> बटन टैप करें, <b>होम स्क्रीन पर जोड़ें</b> चुनें, फिर <b>जोड़ें</b> टैप करें। अगर <b>वेब ऐप के रूप में खोलें</b> दिखे, तो उसे चालू करें।',
  other: 'अन्य डिवाइस या ब्राउज़र',
  otherSteps: 'अपने ब्राउज़र का मेनू खोलें और <b>ऐप इंस्टॉल करें</b> या <b>होम स्क्रीन पर जोड़ें</b> चुनें।',
  logoAlt: 'जीवन की ज्योति का लोगो',
  brand: 'जीवन की ज्योति',
  documentTitle: 'जीवन की ज्योति — बाइबल खोज श्रृंखला'
} : {
  welcome: 'Welcome',
  title: 'Light of Life',
  lessons: 'Start lessons',
  installEyebrow: 'Take it with you',
  installTitle: 'Install Light of Life',
  installDescription: 'Choose your device below for installation steps.',
  installButton: 'Install app',
  android: 'Android phone or tablet',
  androidSteps: 'In Chrome, tap <b>Install app</b> above. If the button is unavailable, open Chrome’s menu and choose <b>Install app</b> or <b>Add to Home screen</b>. In other browsers, use the menu’s <b>Add to Home screen</b> option.',
  windows: 'Windows PC',
  windowsSteps: 'In Microsoft Edge, select the <b>App available</b> icon in the address bar, or choose <b>Apps → Install this site as an app</b> from the menu. In Chrome, select the install icon in the address bar or choose <b>Install page as app</b> from the menu.',
  mac: 'Mac',
  macSteps: 'In Safari (macOS Sonoma 14 or later), choose <b>File → Add to Dock</b>. In Chrome or Edge, select the install icon in the address bar or choose the install option in the browser menu.',
  apple: 'iPhone or iPad',
  appleSteps: 'In Safari, tap <b>Share</b>, choose <b>Add to Home Screen</b>, then tap <b>Add</b>. If shown, turn on <b>Open as Web App</b>.',
  other: 'Other device or browser',
  otherSteps: 'Open your browser menu and choose <b>Install app</b> or <b>Add to Home screen</b>.',
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
  <div class="install-steps"><details data-install-platform="android"><summary>${copy.android}</summary><p>${copy.androidSteps}</p></details><details data-install-platform="windows"><summary>${copy.windows}</summary><p>${copy.windowsSteps}</p></details><details data-install-platform="mac"><summary>${copy.mac}</summary><p>${copy.macSteps}</p></details><details data-install-platform="ios"><summary>${copy.apple}</summary><p>${copy.appleSteps}</p></details><details data-install-platform="other"><summary>${copy.other}</summary><p>${copy.otherSteps}</p></details></div>
</section>`;
if (lang === 'hi') {
  const sizeToggle = document.querySelector('#text-size-toggle');
  sizeToggle.setAttribute('aria-label', 'पाठ का आकार');
  document.querySelector('#text-size-panel').setAttribute('aria-label', 'पाठ का आकार नियंत्रित करें');
  document.querySelector('.text-size-panel-title').textContent = 'पाठ का आकार';
  document.querySelector('#text-size-decrease').setAttribute('aria-label', 'पाठ छोटा करें');
  document.querySelector('#text-size-increase').setAttribute('aria-label', 'पाठ बड़ा करें');
  document.querySelector('#text-size-reset').textContent = 'रीसेट';
}
document.querySelector('#install-guide-btn').addEventListener('click', () => window.startInstallFlow?.());
if (location.hash === '#install-instructions') window.openInstallGuidance?.();
