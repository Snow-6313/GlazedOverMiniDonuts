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
    const openMenu  = () => { toggle.classList.add('open'); navLinks.classList.add('open'); overlay.classList.add('show'); document.body.style.overflow = 'hidden'; };
    const closeMenu = () => { toggle.classList.remove('open'); navLinks.classList.remove('open'); overlay.classList.remove('show'); document.body.style.overflow = ''; };

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

    // Simulate sending (replace with real endpoint)
    submit.textContent = t('contact_sending', 'Sending...');
    submit.disabled = true;

    setTimeout(() => {
      form.style.display = 'none';
      if (success) success.classList.add('show');
      launchConfetti();
    }, 1400);
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
      navigator.clipboard?.writeText(text).then(() => {
        const orig = btn.textContent;
        btn.textContent = t('copy_success', '✔ Copied!');
        setTimeout(() => { btn.textContent = orig; }, 1800);
      }).catch(() => {/* clipboard not available */});
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
