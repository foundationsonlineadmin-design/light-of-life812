(() => {
  const params = new URLSearchParams(location.search);
  const rawDestination = params.get('to');
  const fallback = new URL(`home.html?lang=${document.documentElement.lang === 'hi' ? 'hi' : 'en'}`, location.href);
  let destination = fallback;
  if (rawDestination) {
    try {
      const candidate = new URL(rawDestination, location.href);
      const sameSite = candidate.origin === location.origin || (location.protocol === 'file:' && candidate.protocol === 'file:');
      const allowedPage = /\/(?:index|home|language|lesson|bible)\.html$/.test(candidate.pathname);
      if (sameSite && allowedPage) destination = candidate;
    } catch {}
  }
  location.replace(destination.href);
})();
