import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js';
import { initializeFirestore, getFirestore, doc, onSnapshot } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

(function () {
  'use strict';

  const siteConfig = window.SiteConfig || {};
  const adminConfig = siteConfig.admin || {};
  const firebaseConfig = siteConfig.firebase || {};
  const firebaseAdminConfig = adminConfig.firebase || {};
  const contentCollection = firebaseAdminConfig.contentCollection || 'siteContent';
  const state = {
    flavors: null,
    events: null,
    monthly: null,
    beverages: null,
  };

  const qs = (selector, ctx = document) => ctx.querySelector(selector);

  function getSyncWarningBox() {
    let box = qs('#site-sync-warning');
    if (box) return box;

    box = document.createElement('div');
    box.id = 'site-sync-warning';
    box.className = 'runtime-sync-warning hidden';
    box.setAttribute('role', 'status');
    box.setAttribute('aria-live', 'polite');

    const target = qs('main') || document.body;
    if (target && target.parentNode) {
      target.parentNode.insertBefore(box, target);
    }

    return box;
  }

  function showSyncWarning(message) {
    const box = getSyncWarningBox();
    if (!box) return;
    box.textContent = message;
    box.classList.remove('hidden');
  }

  function clearSyncWarning() {
    const box = qs('#site-sync-warning');
    if (!box) return;
    box.textContent = '';
    box.classList.add('hidden');
  }

  function getFirebaseErrorMessage(error) {
    const code = error && error.code ? error.code : '';
    if (window.location.protocol === 'file:') {
      return 'Live Firebase updates will not work from a file preview. Open the site through http://localhost or your hosted domain.';
    }
    if (code === 'permission-denied' || code === 'storage/unauthorized') {
      return 'Live content is blocked by Firebase rules. Public reads must be allowed for siteContent and admin-uploads.';
    }
    if (code === 'unauthenticated') {
      return 'Firebase could not verify the session. Sign in again in the admin dashboard.';
    }
    return 'Live content could not connect to Firebase right now.';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getLang() {
    return document.documentElement.getAttribute('lang') || siteConfig.defaultLang || 'en';
  }

  function textFor(value, fallback) {
    if (value && typeof value === 'object') {
      const lang = getLang();
      return value[lang] || value.en || value.es || fallback || '';
    }
    return value || fallback || '';
  }

  function getTagLabel(tag) {
    const map = {
      classic: { en: 'Classic', es: 'Clásico' },
      popular: { en: 'Popular', es: 'Popular' },
      'fan-fave': { en: 'Fan Fave', es: 'Favorito' },
      bold: { en: 'Bold', es: 'Atrevido' },
      special: { en: 'Special', es: 'Especial' },
    };
    return textFor(map[tag] || null, tag || '');
  }

  function tagClass(tag) {
    const map = {
      classic: 'tag-classic',
      popular: 'tag-popular',
      'fan-fave': 'tag-popular',
      bold: 'tag-special',
      special: 'tag-special',
    };
    return map[tag] || 'tag-classic';
  }

  function sortItems(items) {
    return [...items].sort((a, b) => {
      const orderA = Number(a && a.sortOrder) || 0;
      const orderB = Number(b && b.sortOrder) || 0;
      if (orderA !== orderB) return orderA - orderB;
      return textFor(a && a.name, '').localeCompare(textFor(b && b.name, ''));
    });
  }

  function getItems(section) {
    return Array.isArray(state[section]) ? sortItems(state[section]).filter((item) => item && item.active !== false) : null;
  }

  function mediaMarkup(item, className, fallbackEmoji) {
    const imageUrl = item && item.imageUrl ? item.imageUrl : '';
    const alt = item && item.imageAlt ? item.imageAlt : textFor(item && item.name, '');
    if (imageUrl) {
      return '<span class="' + className + ' is-image"><img src="' + escapeHtml(imageUrl) + '" alt="' + escapeHtml(alt) + '" loading="lazy" decoding="async"></span>';
    }
    return '<span class="' + className + '" aria-hidden="true">' + escapeHtml(item && item.emoji ? item.emoji : fallbackEmoji || '🍩') + '</span>';
  }

  function emptyMessage(section) {
    const messages = {
      flavors: {
        en: 'Fresh flavors are being updated. Check back soon.',
        es: 'Estamos actualizando los sabores. Vuelve pronto.',
      },
      events: {
        en: 'New event dates are on the way.',
        es: 'Pronto habrá nuevas fechas de eventos.',
      },
      monthly: {
        en: 'This month’s specials are coming soon.',
        es: 'Las especiales del mes llegarán pronto.',
      },
      beverages: {
        en: 'Drink options are being refreshed.',
        es: 'Las bebidas se están actualizando.',
      },
    };
    return textFor(messages[section], 'Coming soon.');
  }

  function renderHomeFlavors() {
    const container = qs('#flavors-preview [data-dynamic-content="home-flavors"]') || qs('#flavors-preview .flavors-grid');
    const items = getItems('flavors');
    if (!container || !items) return;

    const visible = items.filter((item) => item.showOnHome !== false);
    if (!visible.length) {
      container.innerHTML = '<div class="public-empty-state">' + escapeHtml(emptyMessage('flavors')) + '</div>';
      return;
    }

    container.innerHTML = visible.map((item) => {
      const background = item.background || 'rgba(244,167,65,.12)';
      return (
        '<article class="flavor-card visible">' +
          '<div class="flavor-donut-wrap" style="background:' + escapeHtml(background) + ';">' + mediaMarkup(item, 'public-card-visual', '🍩') + '</div>' +
          '<h3 class="flavor-name">' + escapeHtml(textFor(item.name, 'Flavor')) + '</h3>' +
          '<p class="flavor-desc">' + escapeHtml(textFor(item.description, '')) + '</p>' +
          '<span class="flavor-tag ' + escapeHtml(tagClass(item.tag)) + '">' + escapeHtml(getTagLabel(item.tag)) + '</span>' +
        '</article>'
      );
    }).join('');
  }

  function renderSharedEvents(container, items, includeMoreCard) {
    if (!container || !items) return;

    if (!items.length) {
      container.innerHTML = '<div class="public-empty-state">' + escapeHtml(emptyMessage('events')) + '</div>';
      return;
    }

    const cards = items.map((item) => {
      const image = item && item.imageUrl
        ? '<div class="event-card-media"><img src="' + escapeHtml(item.imageUrl) + '" alt="' + escapeHtml(item.imageAlt || textFor(item.name, '')) + '" loading="lazy" decoding="async"></div>'
        : '';
      return (
        '<article class="event-card visible">' +
          '<div class="event-date-box">' +
            '<div class="event-date-month">' + escapeHtml(textFor(item.month, '')) + '</div>' +
            '<div class="event-date-day">' + escapeHtml(item.day || '') + '</div>' +
          '</div>' +
          '<div class="event-info">' +
            image +
            '<div class="event-name">' + escapeHtml(textFor(item.name, 'Event')) + '</div>' +
            '<div class="event-time"><span class="event-icon">🕒</span>' + escapeHtml(item.time || '') + '</div>' +
            '<div class="event-location"><span class="event-icon">📍</span>' + escapeHtml(textFor(item.location, '')) + '</div>' +
          '</div>' +
        '</article>'
      );
    });

    if (includeMoreCard) {
      cards.push(
        '<article class="event-card visible public-more-events-card">' +
          '<div class="event-date-box" style="width:60px;">' +
            '<div class="event-date-month" style="background:var(--clr-primary);">' + escapeHtml(textFor({ en: 'More', es: 'Más' }, 'More')) + '</div>' +
            '<div class="event-date-day" style="border-color:var(--clr-primary);">+</div>' +
          '</div>' +
          '<div class="event-info">' +
            '<div class="event-name" style="color:var(--clr-secondary);">' + escapeHtml(textFor({ en: 'More Events Coming!', es: '¡Más eventos próximamente!' }, 'More Events Coming!')) + '</div>' +
            '<div class="event-time"><span class="event-icon">📱</span>' + escapeHtml(textFor({ en: 'Follow us for the latest', es: 'Síguenos para lo último' }, 'Follow us for the latest')) + '</div>' +
            '<div class="event-location"><span class="event-icon">✌️</span>' + escapeHtml(textFor({ en: 'Instagram, Facebook, and TikTok', es: 'Instagram, Facebook y TikTok' }, 'Instagram, Facebook, and TikTok')) + '</div>' +
          '</div>' +
        '</article>'
      );
    }

    container.innerHTML = cards.join('');
  }

  function renderHomeEvents() {
    const container = qs('#events [data-dynamic-content="home-events"]') || qs('#events .events-grid');
    const items = getItems('events');
    if (!container || !items) return;
    renderSharedEvents(container, items.filter((item) => item.showOnHome !== false), false);
  }

  function renderContactEvents() {
    const container = qs('.contact-events-section [data-dynamic-content="contact-events"]') || qs('.contact-events-section .events-grid');
    const items = getItems('events');
    if (!container || !items) return;
    renderSharedEvents(container, items.filter((item) => item.showOnContact !== false), true);
  }

  function renderMenuFlavors() {
    const container = qs('#flavors [data-dynamic-content="menu-flavors"]') || qs('#flavors .menu-section-grid');
    const items = getItems('flavors');
    if (!container || !items) return;

    if (!items.length) {
      container.innerHTML = '<div class="public-empty-state">' + escapeHtml(emptyMessage('flavors')) + '</div>';
      return;
    }

    container.innerHTML = items.map((item) => {
      return (
        '<article class="menu-flavor-card visible">' +
          mediaMarkup(item, 'mfc-emoji public-card-visual', '🍩') +
          '<div class="mfc-name">' + escapeHtml(textFor(item.name, 'Flavor')) + '</div>' +
          '<div class="mfc-desc">' + escapeHtml(textFor(item.description, '')) + '</div>' +
          '<span class="flavor-tag ' + escapeHtml(tagClass(item.tag)) + '" style="margin-top:.75rem;display:inline-block;">' + escapeHtml(getTagLabel(item.tag)) + '</span>' +
        '</article>'
      );
    }).join('');
  }

  function renderMonthly() {
    const container = qs('#monthly [data-dynamic-content="monthly-items"]') || qs('#monthly .public-monthly-grid');
    const items = getItems('monthly');
    if (!container || !items) return;

    if (!items.length) {
      container.innerHTML = '<div class="public-empty-state public-empty-state--light">' + escapeHtml(emptyMessage('monthly')) + '</div>';
      return;
    }

    container.innerHTML = items.map((item) => {
      const accent = item.accent || 'linear-gradient(135deg,#F4A741,#E8647A)';
      return (
        '<article class="monthly-banner visible" style="background:' + escapeHtml(accent) + ';">' +
          '<div class="public-monthly-media">' + mediaMarkup(item, 'public-card-visual public-card-visual--monthly', '🍩') + '</div>' +
          '<h3 class="public-monthly-title">' + escapeHtml(textFor(item.name, 'Monthly Special')) + '</h3>' +
          '<p class="public-monthly-desc">' + escapeHtml(textFor(item.description, '')) + '</p>' +
          '<div class="public-monthly-badge">' + escapeHtml(textFor(item.badge, '')) + '</div>' +
        '</article>'
      );
    }).join('');
  }

  function renderBeverages() {
    const container = qs('#beverages [data-dynamic-content="beverages"]') || qs('#beverages .bev-grid');
    const items = getItems('beverages');
    if (!container || !items) return;

    if (!items.length) {
      container.innerHTML = '<div class="public-empty-state">' + escapeHtml(emptyMessage('beverages')) + '</div>';
      return;
    }

    container.innerHTML = items.map((item) => {
      return (
        '<article class="bev-card visible">' +
          mediaMarkup(item, 'bev-emoji public-card-visual public-card-visual--drink', '🥤') +
          '<div class="bev-name">' + escapeHtml(textFor(item.name, 'Drink')) + '</div>' +
          '<div class="bev-desc">' + escapeHtml(textFor(item.description, '')) + '</div>' +
          '<div class="bev-price">' + escapeHtml(item.price || '') + '</div>' +
        '</article>'
      );
    }).join('');
  }

  function renderAll() {
    renderHomeFlavors();
    renderHomeEvents();
    renderMenuFlavors();
    renderMonthly();
    renderBeverages();
    renderContactEvents();
  }

  function syncFromSnapshot(section, snapshot) {
    if (!snapshot.exists()) return;
    const data = snapshot.data();
    if (!data || !Array.isArray(data.items)) return;
    state[section] = data.items;
    renderAll();
  }

  function hasFirebaseConfig() {
    return Boolean(firebaseConfig && firebaseConfig.projectId && firebaseConfig.apiKey && firebaseConfig.appId);
  }

  function initRealtimeContent() {
    if (!hasFirebaseConfig()) return;

    if (window.location.protocol === 'file:') {
      showSyncWarning('Live Firebase updates require a local or hosted web server. Opening the HTML files directly will not sync.');
      return;
    }

    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    const db = initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
      useFetchStreams: false,
    });
    let receivedAnySnapshot = false;

    ['flavors', 'events', 'monthly', 'beverages'].forEach((section) => {
      onSnapshot(
        doc(db, contentCollection, section),
        (snapshot) => {
          receivedAnySnapshot = true;
          clearSyncWarning();
          syncFromSnapshot(section, snapshot);
        },
        (error) => {
          showSyncWarning(getFirebaseErrorMessage(error));
          console.warn('Live content unavailable for section:', section, error);
        }
      );
    });

    window.setTimeout(() => {
      if (!receivedAnySnapshot) {
        showSyncWarning('Waiting for Firebase content. If this never loads, check Firestore rules and make sure you are not using a file preview.');
      }
    }, 4000);
  }

  function hookLanguageRefresh() {
    const refresh = () => window.requestAnimationFrame(renderAll);
    const toggle = qs('#lang-toggle');
    if (toggle) toggle.addEventListener('click', refresh);

    if (window.GOMI18N && typeof window.GOMI18N.applyLang === 'function') {
      const originalApplyLang = window.GOMI18N.applyLang;
      if (!originalApplyLang.__gomContentWrapped) {
        const wrapped = function (lang) {
          const result = originalApplyLang(lang);
          renderAll();
          return result;
        };
        wrapped.__gomContentWrapped = true;
        window.GOMI18N.applyLang = wrapped;
      }
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    hookLanguageRefresh();
    initRealtimeContent();
  });
})();