/* =============================================
   GLAZED OVER MINI DONUTS — Main Script
   Handles: Loader, Nav, Scroll Animations,
            Parallax, Confetti, Back-to-Top,
            Form Handling
   ============================================= */

'use strict';

/* ---- Utility ---- */
const qs  = (s, ctx = document) => ctx.querySelector(s);
const qsa = (s, ctx = document) => [...ctx.querySelectorAll(s)];
const t   = (key, fallback = '') => (window.GOMI18N && typeof window.GOMI18N.t === 'function' ? window.GOMI18N.t(key) : fallback);

/* ======================================
   LOADING SCREEN
   ====================================== */
(function initLoader() {
  const screen = qs('#loading-screen');
  if (!screen) return;

  // Hide loader after page is loaded + 300ms extra
  const hide = () => setTimeout(() => screen.classList.add('hidden'), 300);

  if (document.readyState === 'complete') {
    hide();
  } else {
    window.addEventListener('load', hide, { once: true });
  }
})();

/* ======================================
   STICKY NAVIGATION
   ====================================== */
(function initNav() {
  const header  = qs('#site-header');
  const toggle  = qs('.nav-toggle');
  const navLinks = qs('.nav-links');
  const overlay = qs('.nav-overlay');

  if (!header) return;

  // Scroll → add/remove .scrolled
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
    updateActiveLink();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  // Mobile hamburger
  if (toggle && navLinks && overlay) {
    const openMenu  = () => { toggle.classList.add('open'); toggle.setAttribute('aria-expanded', 'true'); navLinks.classList.add('open'); overlay.classList.add('show'); document.body.style.overflow = 'hidden'; };
    const closeMenu = () => { toggle.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); navLinks.classList.remove('open'); overlay.classList.remove('show'); document.body.style.overflow = ''; };

    toggle.addEventListener('click', () => toggle.classList.contains('open') ? closeMenu() : openMenu());
    overlay.addEventListener('click', closeMenu);

    // Close on link click
    qsa('.nav-links a').forEach(a => a.addEventListener('click', closeMenu));

    // Close on Escape
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  }

  // Active link highlighting
  function updateActiveLink() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    qsa('.nav-links a').forEach(a => {
      const href = a.getAttribute('href');
      a.classList.toggle('active', href === path || (path === '' && href === 'index.html'));
    });
  }
  updateActiveLink();
})();

/* ======================================
   SCROLL REVEAL ANIMATIONS
   ====================================== */
(function initScrollReveal() {
  const selectors  = '.reveal, .reveal-left, .reveal-right, .reveal-scale';
  const elements   = qsa(selectors);
  if (!elements.length) return;

  // Fallback: IntersectionObserver not supported
  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // animate once
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
})();

/* ======================================
   PARALLAX HERO
   ====================================== */
(function initParallax() {
  const hero = qs('#hero');
  if (!hero) return;

  // Respect reduced-motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        const sunburst = qs('.hero-sunburst');
        if (sunburst) sunburst.style.transform = `rotate(${scrolled * .05}deg)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* ======================================
   BACK TO TOP BUTTON
   ====================================== */
(function initBackToTop() {
  const btn = qs('#back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ======================================
   SMOOTH SCROLL (for older browsers)
   ====================================== */
(function initSmoothScroll() {
  if ('scrollBehavior' in document.documentElement.style) return; // native support

  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id  = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });
})();

/* ======================================
   EXTERNAL LINK EXIT CONFIRMATION
   ====================================== */
(function initExternalLinkConfirmation() {
  if (window.GOMDisableLegacyLeavePrompt) return;

  const ignoredProtocols = new Set(['mailto:', 'tel:', 'sms:', 'javascript:']);
  const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  let modal;
  let modalTitle;
  let modalBody;
  let modalNotice;
  let modalDestinationLabel;
  let modalDestinationUrl;
  let modalCloseButton;
  let modalBackdrop;
  let stayButton;
  let leaveButton;
  let pendingNavigation = null;
  let lastFocusedElement = null;

  const shouldConfirmExit = (link) => {
    if (!link || link.hasAttribute('download') || link.dataset.skipLeaveConfirm === 'true') return false;

    const rawHref = link.getAttribute('href');
    if (!rawHref || rawHref.startsWith('#')) return false;

    let url;
    try {
      url = new URL(link.href, window.location.href);
    } catch (error) {
      return false;
    }

    if (ignoredProtocols.has(url.protocol)) return false;
    if (url.origin === window.location.origin) return false;

    return url.protocol === 'http:' || url.protocol === 'https:';
  };

  const getModalText = (url) => {
    const shortLink = url.hostname.replace(/^www\./, '') || url.href;

    return {
      eyebrow: t('leave_site_eyebrow', 'External link'),
      title: t('leave_site_title', 'Leaving Glazed Over Mini Donuts'),
      body: t('leave_site_body', 'Are you sure you want to go to {link}?').replace('{link}', shortLink),
      notice: t('leave_site_notice', 'You will be leaving this site.'),
      destinationLabel: t('leave_site_destination', 'Destination'),
      stay: t('leave_site_stay', 'Stay here'),
      leave: t('leave_site_leave', 'Leave site')
    };
  };

  const getFocusableElements = () => {
    if (!modal || modal.hidden) return [];
    return qsa(focusableSelector, modal).filter((el) => !el.disabled && el.getClientRects().length > 0);
  };

  const closeModal = ({ restoreFocus = true } = {}) => {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('leave-site-modal-open');
    pendingNavigation = null;
    if (restoreFocus && lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  };

  const updateModalContent = () => {
    if (!modalTitle || !modalBody || !modalNotice || !modalDestinationLabel || !modalDestinationUrl || !stayButton || !leaveButton || !pendingNavigation) return;

    const text = getModalText(pendingNavigation.url);
    const eyebrow = qs('.leave-site-modal-eyebrow', modal);

    if (eyebrow) eyebrow.textContent = text.eyebrow;
    modalTitle.textContent = text.title;
    modalBody.textContent = text.body;
    modalNotice.textContent = text.notice;
    modalDestinationLabel.textContent = text.destinationLabel;
    modalDestinationUrl.textContent = pendingNavigation.url.href;
    stayButton.textContent = text.stay;
    leaveButton.textContent = text.leave;
    leaveButton.href = pendingNavigation.url.href;
    leaveButton.target = pendingNavigation.target || '_self';

    const relTokens = new Set((pendingNavigation.rel || '').split(/\s+/).filter(Boolean));
    if (leaveButton.target === '_blank') relTokens.add('noopener');
    leaveButton.rel = [...relTokens].join(' ');
  };

  const ensureModal = () => {
    if (modal) return;

    modal = document.createElement('div');
    modal.className = 'leave-site-modal';
    modal.id = 'leave-site-modal';
    modal.hidden = true;
    modal.innerHTML = [
      '<div class="leave-site-modal-backdrop" data-leave-close></div>',
      '<div class="leave-site-modal-dialog" role="alertdialog" aria-modal="true" aria-labelledby="leave-site-modal-title" aria-describedby="leave-site-modal-body leave-site-modal-note">',
        '<button type="button" class="leave-site-modal-close" aria-label="Close" data-leave-close>×</button>',
        '<div class="leave-site-modal-badge" aria-hidden="true">↗</div>',
        '<p class="leave-site-modal-eyebrow"></p>',
        '<h2 id="leave-site-modal-title" class="leave-site-modal-title"></h2>',
        '<p id="leave-site-modal-body" class="leave-site-modal-body"></p>',
        '<div class="leave-site-modal-destination">',
          '<span class="leave-site-modal-destination-label"></span>',
          '<span class="leave-site-modal-destination-url"></span>',
        '</div>',
        '<p id="leave-site-modal-note" class="leave-site-modal-note"></p>',
        '<div class="leave-site-modal-actions">',
          '<button type="button" class="btn btn-outline" data-leave-action="stay"></button>',
          '<a class="btn btn-primary" data-leave-action="leave" data-skip-leave-confirm="true"></a>',
        '</div>',
      '</div>'
    ].join('');

    document.body.appendChild(modal);

    modalBackdrop = qs('.leave-site-modal-backdrop', modal);
    modalTitle = qs('#leave-site-modal-title', modal);
    modalBody = qs('#leave-site-modal-body', modal);
    modalNotice = qs('#leave-site-modal-note', modal);
    modalDestinationLabel = qs('.leave-site-modal-destination-label', modal);
    modalDestinationUrl = qs('.leave-site-modal-destination-url', modal);
    modalCloseButton = qs('.leave-site-modal-close', modal);
    stayButton = qs('[data-leave-action="stay"]', modal);
    leaveButton = qs('[data-leave-action="leave"]', modal);

    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        closeModal();
      });
    }

    if (modalCloseButton) {
      modalCloseButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        closeModal();
      });
    }

    if (stayButton) {
      stayButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        closeModal();
      });
    }

    if (leaveButton) {
      leaveButton.addEventListener('click', () => {
        closeModal({ restoreFocus: false });
      });
    }

    modal.addEventListener('click', (event) => {
      const actionNode = event.target instanceof Element ? event.target.closest('[data-leave-action], [data-leave-close]') : null;

      if (actionNode) {
        const action = actionNode.getAttribute('data-leave-action');

        if (action === 'stay' || actionNode.hasAttribute('data-leave-close')) {
          event.preventDefault();
          event.stopPropagation();
          closeModal();
          return;
        }

        if (action === 'leave') {
          closeModal({ restoreFocus: false });
          return;
        }
      }

      if (event.target === modal || (event.target instanceof Element && event.target.classList.contains('leave-site-modal-backdrop'))) {
        closeModal();
      }
    });
  };

  const openModal = (link, url) => {
    ensureModal();
    pendingNavigation = {
      url,
      target: link.getAttribute('target') || '_self',
      rel: (link.getAttribute('rel') || '').toLowerCase()
    };
    lastFocusedElement = document.activeElement;
    updateModalContent();
    modal.hidden = false;
    document.body.classList.add('leave-site-modal-open');
    window.requestAnimationFrame(() => {
      if (stayButton) stayButton.focus();
    });
  };

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (event.target && !(event.target instanceof Element)) return;
    if ('button' in event && event.button !== 0) return;

    const link = event.target.closest('a[href]');
    if (!shouldConfirmExit(link)) return;

    let url;
    try {
      url = new URL(link.href, window.location.href);
    } catch (error) {
      return;
    }

    event.preventDefault();
    openModal(link, url);
  }, true);

  document.addEventListener('keydown', (event) => {
    if (!modal || modal.hidden) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusable = getFocusableElements();
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  document.addEventListener('gom:langchange', () => {
    if (pendingNavigation) updateModalContent();
  });
})();

/* ======================================
   SUBTLE ADMIN LOGIN LINK
   ====================================== */
(function initAdminLoginLink() {
  const footerBottom = qs('#site-footer .footer-bottom');
  if (!footerBottom || qs('.footer-admin-link', footerBottom)) return;

  const adminLink = document.createElement('a');
  adminLink.href = 'admin-login.html';
  adminLink.className = 'footer-admin-link';
  adminLink.textContent = 'Admin';
  adminLink.setAttribute('aria-label', 'Admin login');

  footerBottom.insertBefore(adminLink, qs('.footer-peace', footerBottom) || null);
})();

/* ======================================
   DYNAMIC SITE SPRINKLES
   ====================================== */
(function initSprinkles() {
  const hosts = qsa('main > section:first-of-type > .container');
  if (!hosts.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let resizeTimer = null;

  const rand = (min, max) => Math.random() * (max - min) + min;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const getPalette = () => {
    const styles = getComputedStyle(document.documentElement);
    return [
      styles.getPropertyValue('--clr-primary').trim() || '#F4A741',
      styles.getPropertyValue('--clr-secondary').trim() || '#E8647A',
      styles.getPropertyValue('--clr-accent').trim() || '#7EC8A4',
      styles.getPropertyValue('--clr-teal').trim() || '#3DBCB8',
      styles.getPropertyValue('--clr-purple').trim() || '#9B59B6',
      '#F7DC6F'
    ];
  };

  const ensureLayer = (host) => {
    host.classList.add('sprinkle-host');

    [...host.children].forEach((child) => {
      if (child.classList.contains('sprinkle-layer')) return;
      if (!child.classList.contains('sprinkle-content')) child.classList.add('sprinkle-content');
    });

    let layer = [...host.children].find((child) => child.classList.contains('sprinkle-layer'));
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'sprinkle-layer';
      host.insertBefore(layer, host.firstChild);
    }
    return layer;
  };

  const createSprinkle = (palette, host) => {
    const depthRoll = Math.random();
    const depth = depthRoll < 0.32 ? 'back' : depthRoll < 0.76 ? 'mid' : 'front';
    const scale = depth === 'back' ? rand(0.75, 0.95) : depth === 'mid' ? rand(0.95, 1.2) : rand(1.2, 1.5);
    const width = rand(7, 18) * scale;
    const height = rand(2.5, 5.5) * scale;
    const opacity = depth === 'back' ? rand(0.12, 0.22) : depth === 'mid' ? rand(0.2, 0.35) : rand(0.32, 0.5);
    const isHomeHero = Boolean(host.closest('#hero'));
    const topMin = isHomeHero ? 4 : 5;
    const topMax = isHomeHero ? 38 : 28;
    const sprinkle = document.createElement('span');

    sprinkle.className = `site-sprinkle depth-${depth}`;
    sprinkle.style.left = `${rand(1, 98)}%`;
    sprinkle.style.top = `${rand(topMin, topMax)}%`;
    sprinkle.style.setProperty('--spr-width', `${width.toFixed(2)}px`);
    sprinkle.style.setProperty('--spr-height', `${height.toFixed(2)}px`);
    sprinkle.style.setProperty('--spr-color', palette[Math.floor(Math.random() * palette.length)]);
    sprinkle.style.setProperty('--spr-opacity', opacity.toFixed(2));
    sprinkle.style.setProperty('--spr-scale', scale.toFixed(2));
    sprinkle.style.setProperty('--spr-rotate', `${rand(0, 360).toFixed(2)}deg`);
    sprinkle.style.setProperty('--spr-drift-x', `${rand(-10, 10).toFixed(2)}px`);
    sprinkle.style.setProperty('--spr-drift-y', `${rand(10, 26).toFixed(2)}px`);
    sprinkle.style.setProperty('--spr-duration', `${rand(5.5, 10.5).toFixed(2)}s`);
    sprinkle.style.setProperty('--spr-delay', `${rand(-8, 0).toFixed(2)}s`);

    if (prefersReducedMotion.matches) sprinkle.style.animation = 'none';

    return sprinkle;
  };

  const renderSprinkles = () => {
    const palette = getPalette();

    hosts.forEach((host) => {
      const layer = ensureLayer(host);
      const area = Math.max(host.offsetWidth * host.offsetHeight, 1);
      const density = host.closest('#hero') ? 17000 : 23000;
      const minCount = host.closest('#hero') ? 12 : 5;
      const maxCount = host.closest('#hero') ? 28 : 16;
      const count = clamp(Math.round(area / density), minCount, maxCount);

      layer.innerHTML = '';

      for (let i = 0; i < count; i += 1) {
        layer.appendChild(createSprinkle(palette, host));
      }
    });
  };

  const queueRender = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(renderSprinkles, 140);
  };

  renderSprinkles();
  window.addEventListener('resize', queueRender, { passive: true });

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(queueRender);
    hosts.forEach((host) => observer.observe(host));
  }

  const themeObserver = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => mutation.attributeName === 'data-theme')) {
      renderSprinkles();
    }
  });

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
})();

/* ======================================
   NUMBER COUNTER ANIMATION
   ====================================== */
(function initCounters() {
  const counters = qsa('[data-count]');
  if (!counters.length) return;
  if (!('IntersectionObserver' in window)) {
    counters.forEach(el => { el.textContent = el.dataset.count; });
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const end = parseInt(el.dataset.count, 10);
      const dur = 1800;
      const start = performance.now();

      const update = (now) => {
        const progress = Math.min((now - start) / dur, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * end) + (el.dataset.suffix || '');
        if (progress < 1) requestAnimationFrame(update);
      };

      requestAnimationFrame(update);
      observer.unobserve(el);
    });
  }, { threshold: .8 });

  counters.forEach(el => observer.observe(el));
})();

/* ======================================
   FLAVOR CARD HOVER TILT
   ====================================== */
(function initTilt() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if ('ontouchstart' in window) return; // skip on touch devices

  qsa('.flavor-card, .menu-flavor-card, .pack-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect    = card.getBoundingClientRect();
      const centerX = rect.left + rect.width  / 2;
      const centerY = rect.top  + rect.height / 2;
      const rotX   = ((e.clientY - centerY) / (rect.height / 2)) * -5;
      const rotY   = ((e.clientX - centerX) / (rect.width  / 2)) *  5;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ======================================
   CONTACT FORM
   ====================================== */
(function initContactForm() {
  const form    = qs('#contact-form');
  if (!form) return;
  const success = qs('#form-success');
  const submit  = qs('#form-submit');

  form.addEventListener('submit', e => {
    e.preventDefault();

    // Simple client-side validation
    let valid = true;
    qsa('[required]', form).forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = 'var(--clr-secondary)';
        valid = false;
      } else {
        field.style.borderColor = '';
      }
    });
    if (!valid) return;

    // Send via Web3Forms
    submit.textContent = t('contact_sending', 'Sending...');
    submit.disabled = true;

    const data = new FormData(form);
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: data
    })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          form.style.display = 'none';
          if (success) success.classList.add('show');
          launchConfetti();
        } else {
          submit.textContent = t('contact_send', '🍩 Send It!');
          submit.disabled = false;
          alert('Something went wrong. Please try again or reach out on social media.');
        }
      })
      .catch(() => {
        submit.textContent = t('contact_send', '🍩 Send It!');
        submit.disabled = false;
        alert('Network error. Please check your connection and try again.');
      });
  });
})();

/* ======================================
   DATA DELETION MODAL
   ====================================== */
(function initDeletionModal() {
  const modal      = qs('#deletion-modal');
  if (!modal) return;

  const openBtn    = qs('#open-deletion-modal');
  const closeBtn   = qs('#close-deletion-modal');
  const backdrop   = qs('#deletion-backdrop');
  const form       = qs('#deletion-form');
  const submitBtn  = qs('#deletion-submit');
  const successDiv = qs('#deletion-success');
  const closeSucc  = qs('#close-deletion-success');

  let previousFocus = null;

  function openModal() {
    previousFocus = document.activeElement;
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    document.body.style.overflow = 'hidden';
    // Focus the close button
    setTimeout(() => closeBtn && closeBtn.focus(), 50);
  }

  function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = '';
    if (previousFocus) previousFocus.focus();
  }

  if (openBtn)   openBtn.addEventListener('click', openModal);
  if (closeBtn)  closeBtn.addEventListener('click', closeModal);
  if (backdrop)  backdrop.addEventListener('click', closeModal);
  if (closeSucc) closeSucc.addEventListener('click', closeModal);

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.style.display !== 'none') closeModal();
  });

  // Form submission
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();

    // Validate required fields
    let valid = true;
    qsa('[required]', form).forEach(field => {
      if (field.type === 'checkbox') {
        field.style.outline = field.checked ? '' : '2px solid var(--clr-secondary)';
        if (!field.checked) valid = false;
      } else if (!field.value.trim()) {
        field.style.borderColor = 'var(--clr-secondary)';
        valid = false;
      } else {
        field.style.borderColor = '';
      }
    });
    if (!valid) return;

    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    const data = new FormData(form);
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: data
    })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          form.style.display = 'none';
          if (successDiv) successDiv.style.display = 'block';
        } else {
          submitBtn.textContent = '🔒 Submit Request';
          submitBtn.disabled = false;
          alert('Something went wrong. Please try again or contact us on social media.');
        }
      })
      .catch(() => {
        submitBtn.textContent = '🔒 Submit Request';
        submitBtn.disabled = false;
        alert('Network error. Please check your connection and try again.');
      });
  });
})();

/* ======================================
   CONFETTI CELEBRATION
   ====================================== */
function launchConfetti() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const colors  = ['#F4A741','#E8647A','#7EC8A4','#9B59B6','#3DBCB8','#F7DC6F','#FF6B6B'];
  const total   = 80;

  for (let i = 0; i < total; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const size = Math.random() * 8 + 6;
    Object.assign(piece.style, {
      left:             `${Math.random() * 100}vw`,
      top:              '-20px',
      width:            `${size}px`,
      height:           `${size}px`,
      background:       colors[Math.floor(Math.random() * colors.length)],
      borderRadius:     Math.random() > .5 ? '50%' : '2px',
      animationDuration:`${Math.random() * 2.5 + 2}s`,
      animationDelay:   `${Math.random() * 1.5}s`,
    });
    document.body.appendChild(piece);
    piece.addEventListener('animationend', () => piece.remove());
  }
}

/* ======================================
   MARQUEE DUPLICATION (for seamless loop)
   ====================================== */
(function initMarquee() {
  const tracks = qsa('.marquee-track');
  tracks.forEach(track => {
    const clone = track.cloneNode(true);
    track.parentElement.appendChild(clone);
  });
})();

/* ======================================
   IMAGE LAZY LOADING FALLBACK
   ====================================== */
(function initLazyImages() {
  if ('loading' in HTMLImageElement.prototype) return; // native lazy loading supported

  const lazyImgs = qsa('img[loading="lazy"]');
  if (!('IntersectionObserver' in window)) {
    lazyImgs.forEach(img => { if (img.dataset.src) img.src = img.dataset.src; });
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      if (img.dataset.src) img.src = img.dataset.src;
      observer.unobserve(img);
    });
  });
  lazyImgs.forEach(img => observer.observe(img));
})();

/* ======================================
   COPY PHONE / EMAIL QUICK-COPY
   ====================================== */
(function initCopyButtons() {
  qsa('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.dataset.copy;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          const orig = btn.textContent;
          btn.textContent = t('copy_success', '✔ Copied!');
          setTimeout(() => { btn.textContent = orig; }, 1800);
        }).catch(() => {/* clipboard not available */});
      }
    });
  });
})();

/* ======================================
   STICKY HEADER HEIGHT CSS VAR
   (so content doesn't jump under header)
   ====================================== */
(function setHeaderHeight() {
  const header = qs('#site-header');
  if (!header) return;
  const update = () => document.documentElement.style.setProperty('--header-h', `${header.offsetHeight}px`);
  update();
  window.addEventListener('resize', update);
})();
