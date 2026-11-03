(() => {
  'use strict';
  const storageKey = 'wangziqi.portfolio.language.v1';
  const supportedLanguage = value => {
    if (typeof value !== 'string') return null;
    const primary = value.trim().toLowerCase().replace(/_/g, '-').split('-')[0];
    return primary === 'zh' || primary === 'en' ? primary : null;
  };
  const storedPreference = () => {
    try {
      const value = window.localStorage.getItem(storageKey);
      return value === 'zh' || value === 'en' ? value : null;
    } catch {
      return null;
    }
  };
  const browserPreference = () => {
    try {
      const preferred = navigator.languages;
      const languages = Array.isArray(preferred) && preferred.length
        ? preferred : [navigator.language];
      for (const value of languages) {
        const language = supportedLanguage(value);
        if (language) return language;
      }
    } catch {
      // Keep the Chinese fallback if browser preference access is unavailable.
    }
    return 'zh';
  };

  const rememberSelection = event => {
    if (event.defaultPrevented || (event.button !== undefined && event.button !== 0 && event.button !== 1)) return;
    const link = event.target?.closest?.('.language-switch a[lang]');
    if (!link) return;
    const language = supportedLanguage(link.getAttribute('lang'));
    if (!language) return;
    try {
      window.localStorage.setItem(storageKey, language);
    } catch {
      // The explicit language URL still works when persistent storage is blocked.
    }
  };
  document.addEventListener('click', rememberSelection);
  document.addEventListener('auxclick', rememberSelection);

  // Only the neutral entry chooses a language. Explicit language/content URLs
  // always retain their meaning, including when opened from a shared link.
  try {
    const script = document.currentScript;
    if (!script?.src) return;
    const siteRoot = new URL('./', script.src);
    const current = new URL(window.location.href);
    if (!['http:', 'https:'].includes(current.protocol) || siteRoot.origin !== current.origin) return;
    if (current.pathname !== siteRoot.pathname && current.pathname !== siteRoot.pathname + 'index.html') return;
    const language = storedPreference() || browserPreference();
    const destination = new URL(language + '/', siteRoot);
    destination.search = current.search;
    destination.hash = current.hash;
    window.location.replace(destination.href);
  } catch {
    // A failed redirect leaves the complete Chinese HTML and real language links.
  }
})();
