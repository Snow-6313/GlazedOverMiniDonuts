/* ================================================================
   GLAZED OVER MINI DONUTS — Cookie / Consent Manager
   Stores one necessary consent record and gates optional preference
   storage for theme/language until the visitor opts in.
   ================================================================ */

(function () {
  'use strict';

  var CONSENT_COOKIE_KEY = 'gom_cookie_consent';
  var CONSENT_LOCAL_KEY = 'gom_cookie_consent_local';
  var CONSENT_TTL_DAYS = 180;
  var OPTIONAL_STORAGE_KEYS = ['gom-theme', 'gom-lang'];
  var DEFAULT_CONSENT = {
    version: 1,
    status: 'pending',
    necessary: true,
    preferences: false,
    analytics: false,
    marketing: false,
    updatedAt: null,
  };

  var ui = {
    banner: null,
    settingsButton: null,
    modal: null,
    preferencesToggle: null,
  };

  var MOBILE_SETTINGS_BREAKPOINT = '(max-width: 768px)';

  var STRINGS = {
    en: {
      eyebrow: 'Privacy choices',
      title: 'We use cookies and local storage',
      body: 'We use one necessary consent record to remember your choice. Optional preference storage saves your theme and language settings. This site does not load advertising or analytics cookies by default.',
      contact: 'Questions? Contact us.',
      reject: 'Reject optional',
      settings: 'Cookie settings',
      accept: 'Accept preferences',
      modalTitle: 'Manage cookie settings',
      modalBody: 'Necessary storage keeps the site working and remembers your consent choice. Preference storage is optional and only saves things like your theme and language.',
      necessaryTitle: 'Strictly necessary',
      necessaryBody: 'Required for core site functions and storing your consent choice.',
      preferenceTitle: 'Preferences',
      preferenceBody: 'Saves your theme and language choices for future visits.',
      alwaysOn: 'Always on',
      save: 'Save choices',
      cancel: 'Cancel',
      statusAccepted: 'Preference storage accepted',
      statusRejected: 'Optional storage rejected',
      statusSaved: 'Cookie choices saved',
      floatingLabel: 'Cookie settings',
    },
    es: {
      eyebrow: 'Opciones de privacidad',
      title: 'Usamos cookies y almacenamiento local',
      body: 'Usamos un registro de consentimiento necesario para recordar tu elección. El almacenamiento opcional de preferencias guarda tu tema e idioma. Este sitio no carga cookies de publicidad ni analítica por defecto.',
      contact: '¿Preguntas? Contáctanos.',
      reject: 'Rechazar opcionales',
      settings: 'Configuración de cookies',
      accept: 'Aceptar preferencias',
      modalTitle: 'Administrar cookies',
      modalBody: 'El almacenamiento necesario mantiene el sitio funcionando y recuerda tu elección de consentimiento. El almacenamiento de preferencias es opcional y solo guarda cosas como tu tema e idioma.',
      necessaryTitle: 'Estrictamente necesarias',
      necessaryBody: 'Requerido para funciones básicas del sitio y para guardar tu elección de consentimiento.',
      preferenceTitle: 'Preferencias',
      preferenceBody: 'Guarda tu tema e idioma para futuras visitas.',
      alwaysOn: 'Siempre activas',
      save: 'Guardar opciones',
      cancel: 'Cancelar',
      statusAccepted: 'Almacenamiento de preferencias aceptado',
      statusRejected: 'Almacenamiento opcional rechazado',
      statusSaved: 'Opciones de cookies guardadas',
      floatingLabel: 'Configuración de cookies',
    },
  };

  function getLang() {
    var lang = document.documentElement.getAttribute('lang') || 'en';
    return STRINGS[lang] ? lang : 'en';
  }

  function t(key) {
    var lang = getLang();
    return STRINGS[lang][key] || STRINGS.en[key] || '';
  }

  function safeLocalStorage(method, key, value) {
    try {
      if (!window.localStorage) return null;
      if (method === 'get') return window.localStorage.getItem(key);
      if (method === 'set') {
        window.localStorage.setItem(key, value);
        return true;
      }
      if (method === 'remove') {
        window.localStorage.removeItem(key);
        return true;
      }
    } catch (error) {
      return null;
    }
    return null;
  }

  function supportsCookies() {
    return /^https?:$/i.test(window.location.protocol || '');
  }

  function setCookie(name, value, days) {
    if (!supportsCookies()) return false;
    var parts = [
      name + '=' + encodeURIComponent(value),
      'Path=/',
      'Max-Age=' + String(days * 24 * 60 * 60),
      'SameSite=Lax'
    ];
    if (window.location.protocol === 'https:') parts.push('Secure');
    document.cookie = parts.join('; ');
    return true;
  }

  function getCookie(name) {
    if (!supportsCookies()) return '';
    var prefix = name + '=';
    var parts = document.cookie ? document.cookie.split('; ') : [];
    for (var i = 0; i < parts.length; i += 1) {
      if (parts[i].indexOf(prefix) === 0) {
        return decodeURIComponent(parts[i].slice(prefix.length));
      }
    }
    return '';
  }

  function loadConsent() {
    var raw = getCookie(CONSENT_COOKIE_KEY) || safeLocalStorage('get', CONSENT_LOCAL_KEY);
    if (!raw) return null;

    try {
      var parsed = JSON.parse(raw);
      return Object.assign({}, DEFAULT_CONSENT, parsed);
    } catch (error) {
      return null;
    }
  }

  function hasDecision() {
    var consent = loadConsent();
    return Boolean(consent && consent.status && consent.status !== 'pending');
  }

  function canUse(category) {
    if (!category || category === 'necessary' || category === 'essential') return true;
    var consent = loadConsent();
    return Boolean(consent && consent[category]);
  }

  function removeOptionalStorage() {
    OPTIONAL_STORAGE_KEYS.forEach(function (key) {
      safeLocalStorage('remove', key);
    });
  }

  function dispatchConsentChange(consent) {
    document.documentElement.setAttribute('data-consent-status', consent.status || 'pending');
    document.documentElement.setAttribute('data-consent-preferences', consent.preferences ? 'true' : 'false');
    document.dispatchEvent(new CustomEvent('gom:consentchange', { detail: consent }));
  }

  function rememberConsent(consent) {
    var raw = JSON.stringify(consent);
    setCookie(CONSENT_COOKIE_KEY, raw, CONSENT_TTL_DAYS);
    safeLocalStorage('set', CONSENT_LOCAL_KEY, raw);
  }

  function saveConsent(preferencesAllowed, source) {
    var consent = {
      version: DEFAULT_CONSENT.version,
      status: preferencesAllowed ? 'accepted' : 'rejected',
      necessary: true,
      preferences: Boolean(preferencesAllowed),
      analytics: false,
      marketing: false,
      updatedAt: new Date().toISOString(),
      source: source || 'banner',
    };

    if (!preferencesAllowed) removeOptionalStorage();

    rememberConsent(consent);
    dispatchConsentChange(consent);
    syncUI();
  }

  function shouldRenderUi() {
    if (!document.body) return false;
    return !document.body.classList.contains('admin-page');
  }

  function createBanner() {
    var banner = document.createElement('section');
    banner.className = 'cookie-consent';
    banner.id = 'cookie-consent';
    banner.setAttribute('aria-labelledby', 'cookie-consent-title');
    banner.innerHTML = [
      '<div class="cookie-consent-card">',
        '<div class="cookie-consent-copy">',
          '<p class="cookie-consent-eyebrow" data-cookie-text="eyebrow"></p>',
          '<h2 id="cookie-consent-title" class="cookie-consent-title" data-cookie-text="title"></h2>',
          '<p class="cookie-consent-body" data-cookie-text="body"></p>',
          '<a class="cookie-consent-link" href="contact.html" data-cookie-text="contact"></a>',
        '</div>',
        '<div class="cookie-consent-actions">',
          '<button type="button" class="btn btn-outline cookie-btn-settings" data-cookie-action="settings"></button>',
          '<button type="button" class="btn btn-outline cookie-btn-reject" data-cookie-action="reject"></button>',
          '<button type="button" class="btn btn-primary cookie-btn-accept" data-cookie-action="accept"></button>',
        '</div>',
      '</div>'
    ].join('');
    document.body.appendChild(banner);
    ui.banner = banner;

    var settingsBtn = banner.querySelector('[data-cookie-action="settings"]');
    var rejectBtn = banner.querySelector('[data-cookie-action="reject"]');
    var acceptBtn = banner.querySelector('[data-cookie-action="accept"]');

    if (settingsBtn) settingsBtn.addEventListener('click', openPreferences);
    if (rejectBtn) rejectBtn.addEventListener('click', function () { saveConsent(false, 'banner'); });
    if (acceptBtn) acceptBtn.addEventListener('click', function () { saveConsent(true, 'banner'); });
  }

  function createSettingsButton() {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'cookie-settings-trigger';
    button.id = 'cookie-settings-trigger';
    button.addEventListener('click', openPreferences);
    document.body.appendChild(button);
    ui.settingsButton = button;
    syncSettingsButtonPlacement();
  }

  function getSettingsButtonMountTarget() {
    var footerBottom = document.querySelector('#site-footer .footer-bottom');
    if (footerBottom) return footerBottom;

    var footer = document.querySelector('#site-footer');
    if (footer) return footer;

    return document.body;
  }

  function syncSettingsButtonPlacement() {
    if (!ui.settingsButton) return;

    var isMobile = window.matchMedia(MOBILE_SETTINGS_BREAKPOINT).matches;
    var target = isMobile ? getSettingsButtonMountTarget() : document.body;

    if (target && ui.settingsButton.parentNode !== target) {
      target.appendChild(ui.settingsButton);
    }

    ui.settingsButton.classList.toggle('in-footer', isMobile && target !== document.body);
  }

  function createModal() {
    var modal = document.createElement('div');
    modal.className = 'cookie-modal';
    modal.id = 'cookie-modal';
    modal.hidden = true;
    modal.innerHTML = [
      '<div class="cookie-modal-backdrop" data-cookie-close></div>',
      '<div class="cookie-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="cookie-modal-title">',
        '<div class="cookie-modal-header">',
          '<div>',
            '<p class="cookie-consent-eyebrow" data-cookie-text="eyebrow"></p>',
            '<h2 id="cookie-modal-title" class="cookie-consent-title" data-cookie-text="modalTitle"></h2>',
          '</div>',
          '<button type="button" class="cookie-modal-close" aria-label="Close" data-cookie-close>×</button>',
        '</div>',
        '<p class="cookie-consent-body cookie-modal-body" data-cookie-text="modalBody"></p>',
        '<div class="cookie-option">',
          '<div class="cookie-option-copy">',
            '<strong data-cookie-text="necessaryTitle"></strong>',
            '<span data-cookie-text="necessaryBody"></span>',
          '</div>',
          '<span class="cookie-pill" data-cookie-text="alwaysOn"></span>',
        '</div>',
        '<label class="cookie-option cookie-option-toggle" for="cookie-preferences-toggle">',
          '<div class="cookie-option-copy">',
            '<strong data-cookie-text="preferenceTitle"></strong>',
            '<span data-cookie-text="preferenceBody"></span>',
          '</div>',
          '<span class="cookie-switch">',
            '<input type="checkbox" id="cookie-preferences-toggle">',
            '<span class="cookie-switch-ui"></span>',
          '</span>',
        '</label>',
        '<div class="cookie-modal-actions">',
          '<button type="button" class="btn btn-outline" data-cookie-close data-cookie-text="cancel"></button>',
          '<button type="button" class="btn btn-primary" data-cookie-action="save" data-cookie-text="save"></button>',
        '</div>',
      '</div>'
    ].join('');
    document.body.appendChild(modal);
    ui.modal = modal;
    ui.preferencesToggle = modal.querySelector('#cookie-preferences-toggle');

    var closeButtons = modal.querySelectorAll('[data-cookie-close]');
    closeButtons.forEach(function (button) {
      button.addEventListener('click', closePreferences);
    });

    var saveButton = modal.querySelector('[data-cookie-action="save"]');
    if (saveButton) {
      saveButton.addEventListener('click', function () {
        saveConsent(Boolean(ui.preferencesToggle && ui.preferencesToggle.checked), 'settings');
        closePreferences();
      });
    }
  }

  function renderText() {
    if (!shouldRenderUi()) return;

    document.querySelectorAll('[data-cookie-text]').forEach(function (node) {
      var key = node.getAttribute('data-cookie-text');
      node.textContent = t(key);
    });

    if (ui.banner) {
      var accept = ui.banner.querySelector('[data-cookie-action="accept"]');
      var reject = ui.banner.querySelector('[data-cookie-action="reject"]');
      var settings = ui.banner.querySelector('[data-cookie-action="settings"]');
      if (accept) accept.textContent = t('accept');
      if (reject) reject.textContent = t('reject');
      if (settings) settings.textContent = t('settings');
    }

    if (ui.settingsButton) {
      ui.settingsButton.textContent = t('floatingLabel');
      ui.settingsButton.setAttribute('aria-label', t('floatingLabel'));
    }
  }

  function closePreferences() {
    if (!ui.modal) return;
    ui.modal.hidden = true;
    document.body.classList.remove('cookie-modal-open');
  }

  function openPreferences() {
    if (!ui.modal || !ui.preferencesToggle) return;
    var consent = loadConsent() || DEFAULT_CONSENT;
    ui.preferencesToggle.checked = Boolean(consent.preferences);
    ui.modal.hidden = false;
    document.body.classList.add('cookie-modal-open');
  }

  function syncUI() {
    if (!shouldRenderUi()) return;

    var decided = hasDecision();
    var consent = loadConsent() || DEFAULT_CONSENT;

    if (ui.banner) {
      if (decided) {
        ui.banner.classList.remove('show');
        window.setTimeout(function () {
          if (ui.banner) ui.banner.hidden = true;
        }, 220);
      } else {
        ui.banner.hidden = false;
        window.requestAnimationFrame(function () {
          if (ui.banner) ui.banner.classList.add('show');
        });
      }
    }

    if (ui.settingsButton) {
      ui.settingsButton.hidden = !decided;
    }

    if (ui.preferencesToggle) {
      ui.preferencesToggle.checked = Boolean(consent.preferences);
    }
  }

  function wireEvents() {
    if (ui.modal) {
      ui.modal.addEventListener('click', function (event) {
        if (event.target === ui.modal || event.target.classList.contains('cookie-modal-backdrop')) {
          closePreferences();
        }
      });
    }

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closePreferences();
    });

    document.addEventListener('gom:langchange', function () {
      renderText();
    });

    window.addEventListener('resize', syncSettingsButtonPlacement);
  }

  window.GOMConsent = {
    getConsent: function () {
      return loadConsent() || Object.assign({}, DEFAULT_CONSENT);
    },
    hasDecision: hasDecision,
    canUse: canUse,
    accept: function () { saveConsent(true, 'api'); },
    reject: function () { saveConsent(false, 'api'); },
    openPreferences: openPreferences,
  };

  window.GOMStorage = {
    canUse: canUse,
    getItem: function (key, category) {
      if (!canUse(category || 'preferences')) return null;
      return safeLocalStorage('get', key);
    },
    setItem: function (key, value, category) {
      if (!canUse(category || 'preferences')) return false;
      return safeLocalStorage('set', key, value);
    },
    removeItem: function (key, category) {
      if (!canUse(category || 'preferences')) return false;
      return safeLocalStorage('remove', key);
    },
  };

  var existingConsent = loadConsent();
  if (existingConsent) dispatchConsentChange(existingConsent);
  else dispatchConsentChange(Object.assign({}, DEFAULT_CONSENT));

  document.addEventListener('DOMContentLoaded', function () {
    if (!shouldRenderUi()) return;
    createBanner();
    createSettingsButton();
    createModal();
    renderText();
    wireEvents();
    syncUI();
  });
})();
