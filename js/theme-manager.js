/* ================================================================
   GLAZED OVER MINI DONUTS — Theme Manager
   Themes: auto | light | dark | contrast
   ================================================================ */

(function () {
  'use strict';

  var STORAGE_KEY = 'gom-theme';
  var storage = window.GOMStorage;
  var THEMES      = ['auto', 'light', 'dark', 'contrast'];
  var META_COLORS  = {
    light:    '#FDF4E3',
    dark:     '#1a0e05',
    contrast: '#000000',
    auto:     '#FDF4E3',
  };

  /* ---- Icons (inline SVG strings) ----------------------------- */
  var ICONS = {
    auto: '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
    light: '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
    dark: '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>',
    contrast: '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M12 2a10 10 0 010 20"/><path fill="currentColor" d="M12 2a10 10 0 000 20z"/></svg>',
  };

  var LABELS = {
    en: {
      auto:     'System theme (auto)',
      light:    'Light theme',
      dark:     'Dark theme',
      contrast: 'High-contrast theme',
      applied:  'applied',
    },
    es: {
      auto:     'Tema del sistema (auto)',
      light:    'Tema claro',
      dark:     'Tema oscuro',
      contrast: 'Tema de alto contraste',
      applied:  'aplicado',
    },
  };

  function getStoredTheme() {
    if (storage) return storage.getItem(STORAGE_KEY, 'preferences');
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function saveTheme(pref) {
    if (storage) return storage.setItem(STORAGE_KEY, pref, 'preferences');
    try {
      localStorage.setItem(STORAGE_KEY, pref);
      return true;
    } catch (error) {
      return false;
    }
  }

  function getCurrentThemePref() {
    return document.documentElement.getAttribute('data-theme-pref') || getStoredTheme() || ((window.SiteConfig && window.SiteConfig.defaultTheme) || 'auto');
  }

  function getLang() {
    var lang = document.documentElement.getAttribute('lang') || (window.GOMStorage && window.GOMStorage.getItem('gom-lang', 'preferences')) || 'en';
    return LABELS[lang] ? lang : 'en';
  }

  function getLabel(pref) {
    var lang = getLang();
    return LABELS[lang][pref] || LABELS.en[pref] || pref;
  }

  function updateToggleButton(pref) {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    var label = getLabel(pref);
    btn.innerHTML = ICONS[pref] + '<span class="sr-only">' + label + '</span>';
    btn.setAttribute('aria-label', label);
    btn.setAttribute('title', label);
    btn.setAttribute('data-current-theme', pref);
  }

  /* ---- Resolve the actual applied theme ----------------------- */
  function resolveTheme(pref) {
    if (pref === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return pref;
  }

  /* ---- Apply theme to DOM ------------------------------------- */
  function applyTheme(pref) {
    var resolved = resolveTheme(pref);
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.setAttribute('data-theme-pref', pref);

    if (window.GOMConsent && window.GOMConsent.canUse('preferences')) {
      saveTheme(pref);
    }

    /* Update meta theme-color */
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', META_COLORS[resolved] || META_COLORS.light);

    /* Update button icon + label */
    updateToggleButton(pref);

    /* Live-announce to screen readers */
    var live = document.getElementById('theme-live');
    if (live) live.textContent = getLabel(pref) + ' ' + LABELS[getLang()].applied;
  }

  /* ---- Cycle to next theme ------------------------------------ */
  function cycleTheme() {
    var current = document.documentElement.getAttribute('data-theme-pref') || 'auto';
    var idx = THEMES.indexOf(current);
    var next = THEMES[(idx + 1) % THEMES.length];
    saveTheme(next);
    applyTheme(next);
  }

  /* ---- Init --------------------------------------------------- */
  function init() {
    /* Read saved pref; fall back to site config default or 'auto' */
    var saved = getStoredTheme();
    if (!saved) {
      saved = (window.SiteConfig && window.SiteConfig.defaultTheme) || 'auto';
    }
    applyTheme(saved);

    /* Wire toggle button */
    document.addEventListener('DOMContentLoaded', function () {
      var btn = document.getElementById('theme-toggle');
      if (btn) {
        btn.addEventListener('click', cycleTheme);
        /* Refresh the icon now that DOM is ready */
        applyTheme(saved);
      }
    });

    /* Re-apply when OS preference changes (only affects 'auto') */
    var darkMql = window.matchMedia('(prefers-color-scheme: dark)');
    var onMqlChange = function () {
      var pref = getStoredTheme() || 'auto';
      if (pref === 'auto') applyTheme('auto');
    };
    /* Safari 13 only supports deprecated addListener */
    if (darkMql.addEventListener) {
      darkMql.addEventListener('change', onMqlChange);
    } else if (darkMql.addListener) {
      darkMql.addListener(onMqlChange);
    }

    document.addEventListener('gom:consentchange', function (event) {
      var consent = event && event.detail ? event.detail : null;
      var next = getCurrentThemePref();
      if (consent && consent.preferences) saveTheme(next);
      applyTheme(next);
    });
  }

  window.GOMRefreshThemeToggle = function () {
    var pref = document.documentElement.getAttribute('data-theme-pref') || getStoredTheme() || 'auto';
    updateToggleButton(pref);
  };

  init();

})();
