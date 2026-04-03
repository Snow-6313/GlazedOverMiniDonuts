/* =============================================
   GLAZED OVER MINI DONUTS — External Link Modal
   Standalone implementation to replace legacy
   leave-site confirmation behavior.
   ============================================= */

(function () {
  'use strict';

  window.GOMDisableLegacyLeavePrompt = true;
  if (window.GOMExitModalV2Initialized) return;
  window.GOMExitModalV2Initialized = true;

  var STYLE_ID = 'gom-exit-modal-style';
  var MODAL_ID = 'gom-exit-modal';
  var focusSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  var ignoredProtocols = { 'mailto:': true, 'tel:': true, 'sms:': true, 'javascript:': true };
  var modal = null;
  var stayButton = null;
  var leaveButton = null;
  var closeButton = null;
  var titleNode = null;
  var bodyNode = null;
  var noteNode = null;
  var labelNode = null;
  var urlNode = null;
  var eyebrowNode = null;
  var previousFocus = null;
  var pending = null;

  function translate(key, fallback) {
    if (window.GOMI18N && typeof window.GOMI18N.t === 'function') {
      return window.GOMI18N.t(key) || fallback;
    }
    return fallback;
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.gom-exit-modal[hidden]{display:none !important;}',
      '.gom-exit-modal{position:fixed;top:0;right:0;bottom:0;left:0;inset:0;z-index:2147483000;display:grid;place-items:center;padding:16px;}',
      '.gom-exit-modal,.gom-exit-modal *{box-sizing:border-box;}',
      '.gom-exit-modal__backdrop{position:absolute;top:0;right:0;bottom:0;left:0;inset:0;background:rgba(45,27,14,.56);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);}',
      '.gom-exit-modal__dialog{position:relative;z-index:1;width:min(560px,100%);padding:24px;border-radius:28px;background:linear-gradient(180deg,rgba(255,251,244,.99),rgba(253,244,227,.99));border:1px solid rgba(45,27,14,.10);box-shadow:0 24px 70px rgba(45,27,14,.28);color:#3A2110;pointer-events:auto;font-family:Shrikhand,cursive;}',
      '.gom-exit-modal__close{position:absolute;top:14px;right:14px;width:42px;height:42px;border-radius:999px;border:1px solid rgba(45,27,14,.12);background:rgba(255,255,255,.94);color:#2D1B0E;font-size:26px;line-height:1;cursor:pointer;}',
      '.gom-exit-modal__badge{display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:999px;background:linear-gradient(135deg,rgba(244,167,65,.18),rgba(232,100,122,.22));color:#E8647A;font-size:24px;margin-bottom:12px;pointer-events:none;}',
      '.gom-exit-modal__eyebrow{margin:0 0 6px;color:#E8647A;font-size:12px;letter-spacing:.16em;text-transform:uppercase;}',
      '.gom-exit-modal__title{margin:0 0 10px;color:#2D1B0E;font-size:36px;font-size:clamp(28px,4vw,46px);line-height:1.02;}',
      '.gom-exit-modal__body{margin:0 0 16px;color:#8A6A50;font-size:18px;line-height:1.45;}',
      '.gom-exit-modal__destination{display:grid;gap:6px;margin-bottom:14px;padding:14px 16px;border-radius:18px;background:rgba(255,255,255,.82);border:1px solid rgba(45,27,14,.08);}',
      '.gom-exit-modal__label{font-size:13px;letter-spacing:.10em;text-transform:uppercase;color:#2D1B0E;}',
      '.gom-exit-modal__url{font-size:16px;line-height:1.5;overflow-wrap:break-word;overflow-wrap:anywhere;color:#3A2110;}',
      '.gom-exit-modal__note{margin:0 0 22px;color:#8A6A50;font-size:17px;}',
      '.gom-exit-modal__actions{display:flex;justify-content:flex-end;gap:12px;flex-wrap:wrap;position:relative;z-index:2;}',
      '.gom-exit-modal__btn{display:inline-flex;align-items:center;justify-content:center;min-height:58px;padding:14px 28px;border-radius:999px;border:3px solid transparent;font-family:"Abstract Groovy",cursive;font-size:16px;letter-spacing:.04em;text-decoration:none;cursor:pointer;position:relative;overflow:hidden;white-space:nowrap;pointer-events:auto;}',
      '.gom-exit-modal__btn::before{content:"";position:absolute;top:0;right:0;bottom:0;left:0;inset:0;background:rgba(255,255,255,.18);transform:scaleX(0);transform-origin:left;transition:transform .2s ease;pointer-events:none;}',
      '.gom-exit-modal__btn:hover::before{transform:scaleX(1);}',
      '.gom-exit-modal__btn--secondary{background:transparent;color:#F4A741;border-color:#F4A741;}',
      '.gom-exit-modal__btn--primary{background:#E8647A;color:#fff;border-color:#E8647A;box-shadow:0 4px 16px rgba(232,100,122,.35);}',
      '.gom-exit-modal-open{overflow:hidden;}',
      '[data-theme="dark"] .gom-exit-modal__dialog{background:linear-gradient(180deg,rgba(58,33,16,.99),rgba(45,27,14,.99));border-color:rgba(244,167,65,.16);color:#FFF8F0;}',
      '[data-theme="dark"] .gom-exit-modal__close{background:rgba(255,248,240,.12);border-color:rgba(244,167,65,.16);color:#FFF8F0;}',
      '[data-theme="dark"] .gom-exit-modal__title,[data-theme="dark"] .gom-exit-modal__label,[data-theme="dark"] .gom-exit-modal__url{color:#FFF8F0;}',
      '[data-theme="dark"] .gom-exit-modal__body,[data-theme="dark"] .gom-exit-modal__note{color:rgba(255,248,240,.78);}',
      '[data-theme="dark"] .gom-exit-modal__destination{background:rgba(255,248,240,.08);border-color:rgba(244,167,65,.12);}',
      '@media (max-width:640px){.gom-exit-modal__dialog{padding:22px 18px;}.gom-exit-modal__actions{flex-direction:column-reverse;}.gom-exit-modal__btn{width:100%;}}'
    ].join('');
    document.head.appendChild(style);
  }

  function cleanupLegacyModal() {
    var legacy = document.getElementById('leave-site-modal');
    if (legacy) legacy.remove();
    document.body.classList.remove('leave-site-modal-open');
  }

  function ensureModal() {
    if (modal) return;

    ensureStyles();
    cleanupLegacyModal();

    modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.className = 'gom-exit-modal';
    modal.hidden = true;
    modal.innerHTML = [
      '<div class="gom-exit-modal__backdrop"></div>',
      '<div class="gom-exit-modal__dialog" role="alertdialog" aria-modal="true" aria-labelledby="gom-exit-modal-title" aria-describedby="gom-exit-modal-body gom-exit-modal-note">',
        '<button type="button" class="gom-exit-modal__close" aria-label="Close">×</button>',
        '<div class="gom-exit-modal__badge" aria-hidden="true">↗</div>',
        '<p class="gom-exit-modal__eyebrow"></p>',
        '<h2 id="gom-exit-modal-title" class="gom-exit-modal__title"></h2>',
        '<p id="gom-exit-modal-body" class="gom-exit-modal__body"></p>',
        '<div class="gom-exit-modal__destination">',
          '<span class="gom-exit-modal__label"></span>',
          '<span class="gom-exit-modal__url"></span>',
        '</div>',
        '<p id="gom-exit-modal-note" class="gom-exit-modal__note"></p>',
        '<div class="gom-exit-modal__actions">',
          '<button type="button" class="gom-exit-modal__btn gom-exit-modal__btn--secondary"></button>',
          '<button type="button" class="gom-exit-modal__btn gom-exit-modal__btn--primary"></button>',
        '</div>',
      '</div>'
    ].join('');

    document.body.appendChild(modal);

    eyebrowNode = modal.querySelector('.gom-exit-modal__eyebrow');
    titleNode = modal.querySelector('#gom-exit-modal-title');
    bodyNode = modal.querySelector('#gom-exit-modal-body');
    labelNode = modal.querySelector('.gom-exit-modal__label');
    urlNode = modal.querySelector('.gom-exit-modal__url');
    noteNode = modal.querySelector('#gom-exit-modal-note');
    stayButton = modal.querySelector('.gom-exit-modal__btn--secondary');
    leaveButton = modal.querySelector('.gom-exit-modal__btn--primary');
    closeButton = modal.querySelector('.gom-exit-modal__close');

    modal.querySelector('.gom-exit-modal__backdrop').addEventListener('click', closeModal);
    closeButton.addEventListener('click', closeModal);
    stayButton.addEventListener('click', closeModal);
    leaveButton.addEventListener('click', leaveSite);
  }

  function getTexts(url) {
    var host = url.hostname.replace(/^www\./, '') || url.href;
    return {
      eyebrow: translate('leave_site_eyebrow', 'External link'),
      title: translate('leave_site_title', 'Leaving Glazed Over Mini Donuts'),
      body: translate('leave_site_body', 'Are you sure you want to go to {link}?').replace('{link}', host),
      label: translate('leave_site_destination', 'Destination'),
      note: translate('leave_site_notice', 'You will be leaving this site.'),
      stay: translate('leave_site_stay', 'Stay here'),
      leave: translate('leave_site_leave', 'Leave site')
    };
  }

  function openModal(link, url) {
    ensureModal();
    cleanupLegacyModal();

    pending = {
      href: url.href,
      target: link.getAttribute('target') || '_self',
      rel: (link.getAttribute('rel') || '').toLowerCase()
    };

    previousFocus = document.activeElement;

    var text = getTexts(url);
    eyebrowNode.textContent = text.eyebrow;
    titleNode.textContent = text.title;
    bodyNode.textContent = text.body;
    labelNode.textContent = text.label;
    urlNode.textContent = url.href;
    noteNode.textContent = text.note;
    stayButton.textContent = text.stay;
    leaveButton.textContent = text.leave;

    modal.hidden = false;
    document.body.classList.add('gom-exit-modal-open');
    window.requestAnimationFrame(function () {
      stayButton.focus();
    });
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('gom-exit-modal-open');
    pending = null;
    if (previousFocus && typeof previousFocus.focus === 'function') {
      previousFocus.focus();
    }
  }

  function leaveSite() {
    var navigation = pending;
    modal.hidden = true;
    document.body.classList.remove('gom-exit-modal-open');
    pending = null;

    if (!navigation) return;

    if (navigation.target && navigation.target !== '_self') {
      var features = [];
      if (navigation.target === '_blank' || navigation.rel.indexOf('noopener') !== -1) features.push('noopener');
      if (navigation.rel.indexOf('noreferrer') !== -1) features.push('noreferrer');
      window.open(navigation.href, navigation.target, features.join(','));
      return;
    }

    window.location.assign(navigation.href);
  }

  function getFocusableElements() {
    if (!modal || modal.hidden) return [];
    return Array.prototype.slice.call(modal.querySelectorAll(focusSelector)).filter(function (el) {
      return !el.disabled && el.offsetParent !== null;
    });
  }

  // Social / owned channels that should never show the leave-site modal
  var trustedDomains = {
    'instagram.com': true,
    'facebook.com':  true,
    'tiktok.com':    true
  };

  function shouldConfirm(link) {
    if (!link || link.hasAttribute('download') || link.dataset.skipLeaveConfirm === 'true') return false;
    if (modal && modal.contains(link)) return false;

    var rawHref = link.getAttribute('href');
    if (!rawHref || rawHref.charAt(0) === '#') return false;

    var url;
    try {
      url = new URL(link.href, window.location.href);
    } catch (error) {
      return false;
    }

    if (ignoredProtocols[url.protocol]) return false;
    if (url.origin === window.location.origin) return false;

    // Skip the modal for known owned social-media domains
    var cleanHost = url.hostname.replace(/^www\./, '');
    if (trustedDomains[cleanHost]) return false;

    return url.protocol === 'http:' || url.protocol === 'https:';
  }

  document.addEventListener('click', function (event) {
    if (!(event.target instanceof Element)) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if ('button' in event && event.button !== 0) return;

    var link = event.target.closest('a[href]');
    if (!shouldConfirm(link)) return;

    var url;
    try {
      url = new URL(link.href, window.location.href);
    } catch (error) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    openModal(link, url);
  }, true);

  document.addEventListener('keydown', function (event) {
    if (!modal || modal.hidden) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
      return;
    }

    if (event.key !== 'Tab') return;

    var focusable = getFocusableElements();
    if (!focusable.length) return;

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  document.addEventListener('gom:langchange', function () {
    if (!pending) return;
    openModal({ getAttribute: function (name) { return pending[name] || null; } }, new URL(pending.href));
  });
})();
