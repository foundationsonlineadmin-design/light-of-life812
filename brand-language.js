window.applyBrandLanguage = () => {
  const hindi=document.documentElement.lang==='hi';
  const brand=hindi?'जीवन की ज्योति':'LIGHT OF LIFE';
  const header=document.querySelector('.topbar .brand');
  const footer=document.querySelector('.site-footer b');
  const selectedLanguage=new URLSearchParams(location.search).get('lang');
  if((selectedLanguage==='hi'||selectedLanguage==='en')&&window.progressStore)window.progressStore.setLanguage(selectedLanguage);
  document.querySelector('.tracking-shortcut')?.setAttribute('aria-label',hindi?'समूह की प्रगति':'Group progress');
  if(header){header.setAttribute('aria-label',hindi?'मुखपृष्ठ':'Home');if(selectedLanguage==='hi'||selectedLanguage==='en')header.href=`home.html?lang=${selectedLanguage}`;header.classList.toggle('hindi',hindi)}
  if(footer){footer.textContent=brand;footer.classList.toggle('hindi',hindi)}
};
window.applyBrandLanguage();
