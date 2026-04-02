/* ================================================================
   GLAZED OVER MINI DONUTS — Site Configuration
   ================================================================
   Edit this file to customise images, contact info, and defaults.
   All image paths are relative to the root of the website folder.
   Set any value to null to keep the built-in SVG / emoji fallback.
   ================================================================ */

window.SiteConfig = {

  /* --------------------------------------------------------------
     IMAGE CONFIGURATION
     Replace null with the relative path to your image file.
     e.g.  heroDonut: 'images/hero-donut.png'

     Recommended formats: WebP or PNG with transparency where noted.
     All paths are relative to the website root folder.
     -------------------------------------------------------------- */
  images: {

    /* --- NAV / LOGO ---
       Replaces the inline SVG donut next to the brand name in the
       top navigation bar.
       Recommended: 80 × 80 px, SVG or transparent PNG            */
    logoIcon: null,

    /* --- HERO: MAIN DONUT ---
       The large central donut displayed on the right side of the
       hero section on desktop / above the heading on mobile.
       Recommended: 420 × 420 px, transparent PNG or WebP         */
    heroDonut: null,

    /* --- HERO: SMALL FLOATING DONUT — TOP RIGHT ---
       Small donut floating to the upper-right of the main donut.
       Recommended: 120 × 120 px, transparent PNG or WebP         */
    heroDonutTopRight: null,

    /* --- HERO: SMALL FLOATING DONUT — BOTTOM LEFT ---
       Small donut floating to the lower-left of the main donut.
       Recommended: 100 × 100 px, transparent PNG or WebP         */
    heroDonutBottomLeft: null,

    /* --- HERO: SMALL FLOATING DONUT — MID LEFT ---
       Small donut floating to the middle-left of the main donut.
       Recommended: 80 × 80 px, transparent PNG or WebP           */
    heroDonutMidLeft: null,

    /* --- INGREDIENTS / WHY US SECTION: FEATURE CARD IMAGE ---
       Image shown inside the stacked info card on the right side
       of the "Old School Quality" section.
       Recommended: 480 × 420 px, JPG or WebP                     */
    ingredientsCard: null,

    /* --- FLAVOR CARDS (one image per flavour)
       Each image replaces the large emoji inside the circular
       container at the top of each flavour card.
       Recommended: 80 × 80 px, transparent PNG or WebP           */
    flavorGlazedConfused:    null,   /* "Glazed & Confused"        — classic glaze                */
    flavorPicturePerfect:    null,   /* "Picture Perfect"          — strawberry + rainbow sprinkles*/
    flavorChurroGroove:      null,   /* "Churro Groove"            — cinnamon sugar + dulce de leche*/
    flavorBringingHomeBacon: null,   /* "Bringing Home the Bacon"  — maple drizzle + bacon bits   */
    flavorRaspberryBeret:    null,   /* "Raspberry Beret"          — powdered sugar + raspberry   */
    flavorTotalEclipse:      null,   /* "A Total Eclipse"          — chocolate drizzle + sprinkles */
    flavorRocketMan:         null,   /* "Rocket Man"               — vanilla glaze + Oreo crumble */
    flavorStrawberryFields:  null,   /* "Strawberry Fields"        — choc & strawberry + bits     */

    /* --- FOOD TRUCK / FIND US SECTION ---
       Photo of the food truck, shown inside the truck card on the
       left side of the "Stay in the Loop" section.
       Recommended: 340 × 200 px, JPG or WebP                     */
    truckPhoto: null,

    /* --- ABOUT SNIPPET: ASHLEY'S PHOTO ---
       Portrait photo of Ashley shown on the left side of the
       "Meet Ashley" section on the homepage (and about.html).
       Recommended: 480 × 600 px portrait, JPG or WebP            */
    ashleyPhoto: null,

    /* --- SOCIAL SHARE / OPEN GRAPH IMAGE ---
       Thumbnail shown when the site is shared on social media.
       Recommended: 1200 × 630 px, JPG or PNG (no transparency)   */
    ogImage: null,

  },

  /* --------------------------------------------------------------
     CONTACT & LOCATION
     -------------------------------------------------------------- */
  location:  'Phoenix West Valley, AZ',
  instagram: 'https://www.instagram.com/glazed.over.mini.donuts/',
  facebook:  'https://www.facebook.com/profile.php?id=61578935101657',
  tiktok:    'https://www.tiktok.com/@glazedoverminidonuts',

  /* --------------------------------------------------------------
     DEFAULT THEME
     'auto'     — follows the visitor's OS dark / light preference
     'light'    — always use the warm cream light theme
     'dark'     — always use the dark theme
     'contrast' — high-contrast accessibility theme
     -------------------------------------------------------------- */
  defaultTheme: 'auto',

  /* --------------------------------------------------------------
     DEFAULT LANGUAGE  ('en' | 'es')
     -------------------------------------------------------------- */
  defaultLang: 'en',

  /* --------------------------------------------------------------
     ADMIN DASHBOARD / CONTENT API
     --------------------------------------------------------------
     This powers the future login area and editor dashboard.

     IMPORTANT:
     - Real username/password authentication must be handled by
       your backend or auth provider, not in this file.
     - Fill in the blank endpoints when your API is ready.
     -------------------------------------------------------------- */
  admin: {
    auth: {
      mode: 'firebase',       /* 'remote' | 'firebase' */
      loginEndpoint: '',      /* POST username/password -> token/session */
      sessionEndpoint: '',    /* GET current session / validate token */
      logoutEndpoint: '',     /* POST logout */
      usersEndpoint: '',      /* Optional: create/update admin users */
    },

    firebase: {
      contentCollection: 'siteContent',
      uploadsFolder: 'admin-uploads',
    },

    api: {
      flavorsEndpoint: '',    /* GET/PUT flavors collection */
      eventsEndpoint: '',     /* GET/PUT events collection */
      monthlyEndpoint: '',    /* GET/PUT monthly specials collection */
      beveragesEndpoint: '',  /* GET/PUT beverages collection */
      mediaUploadEndpoint: '',/* POST image upload */
      mediaLibraryEndpoint: '',/* GET existing images/library */
      mediaDeleteEndpoint: '',/* DELETE image */
    },
  },

  /* --------------------------------------------------------------
     FIREBASE WEB CONFIGURATION
     These values are safe to ship in frontend code. Protection is
     enforced by Firebase Auth, Firestore rules, and Storage rules.
     -------------------------------------------------------------- */
  firebase: {
    apiKey: 'AIzaSyB80Xu4fFSrRl23UfvN2kCagQnF8I2dyF0',
    authDomain: 'glazedoverminidonuts.firebaseapp.com',
    projectId: 'glazedoverminidonuts',
    storageBucket: 'glazedoverminidonuts.firebasestorage.app',
    messagingSenderId: '131337225645',
    appId: '1:131337225645:web:b9d4042a54c1ae36d8cd24',
    measurementId: 'G-RQ53ZWRMLR',
  },

};

/* ================================================================
   IMAGE INJECTION — runs automatically when the DOM is ready.
   You do not need to edit anything below this line.
   ================================================================ */
document.addEventListener('DOMContentLoaded', function () {
  var cfg = window.SiteConfig.images;
  if (!cfg) return;

  /* Helper: replace an emoji/SVG container with a real <img>       */
  function injectImage(selector, src, alt) {
    var el = document.querySelector(selector);
    if (!el || !src) return;
    var img = document.createElement('img');
    img.src = src;
    img.alt = alt || '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.style.cssText = 'width:100%;height:100%;object-fit:contain;';
    el.textContent = '';
    el.appendChild(img);
  }

  /* Logo icon */
  if (cfg.logoIcon) {
    var logoSvg = document.querySelector('.nav-logo-icon');
    if (logoSvg) {
      var logoImg = document.createElement('img');
      logoImg.src = cfg.logoIcon;
      logoImg.alt = 'Glazed Over Mini Donuts logo';
      logoImg.className = 'nav-logo-icon';
      logoImg.width = 44; logoImg.height = 44;
      logoSvg.parentNode.replaceChild(logoImg, logoSvg);
    }
  }

  /* Hero main donut */
  if (cfg.heroDonut) {
    var heroSvg = document.querySelector('.hero-donut-main');
    if (heroSvg) {
      var heroImg = document.createElement('img');
      heroImg.src = cfg.heroDonut;
      heroImg.alt = 'A freshly glazed Glazed Over mini donut';
      heroImg.className = 'hero-donut-main';
      heroSvg.parentNode.replaceChild(heroImg, heroSvg);
    }
  }

  /* Hero small floating donuts */
  var smMap = {
    heroDonutTopRight:   '.hero-donut-sm.top-right',
    heroDonutBottomLeft: '.hero-donut-sm.bottom-left',
    heroDonutMidLeft:    '.hero-donut-sm.mid-left',
  };
  Object.keys(smMap).forEach(function (k) {
    if (cfg[k]) {
      var sm = document.querySelector(smMap[k]);
      if (sm) {
        var smImg = document.createElement('img');
        smImg.src = cfg[k];
        smImg.alt = '';
        smImg.setAttribute('aria-hidden', 'true');
        smImg.className = sm.className;
        sm.parentNode.replaceChild(smImg, sm);
      }
    }
  });

  /* Flavour card emojis */
  var flavorMap = {
    flavorGlazedConfused:    '[data-flavor="glazed-confused"] .flavor-donut-wrap',
    flavorPicturePerfect:    '[data-flavor="picture-perfect"] .flavor-donut-wrap',
    flavorChurroGroove:      '[data-flavor="churro-groove"] .flavor-donut-wrap',
    flavorBringingHomeBacon: '[data-flavor="bringing-home-bacon"] .flavor-donut-wrap',
    flavorRaspberryBeret:    '[data-flavor="raspberry-beret"] .flavor-donut-wrap',
    flavorTotalEclipse:      '[data-flavor="total-eclipse"] .flavor-donut-wrap',
    flavorRocketMan:         '[data-flavor="rocket-man"] .flavor-donut-wrap',
    flavorStrawberryFields:  '[data-flavor="strawberry-fields"] .flavor-donut-wrap',
  };
  Object.keys(flavorMap).forEach(function (k) {
    if (cfg[k]) injectImage(flavorMap[k], cfg[k], '');
  });

  /* Truck photo */
  if (cfg.truckPhoto) {
    var truck = document.querySelector('.truck-emoji');
    if (truck) {
      var tImg = document.createElement('img');
      tImg.src = cfg.truckPhoto; tImg.alt = 'The Glazed Over food truck';
      tImg.className = 'truck-photo'; tImg.loading = 'lazy';
      truck.parentNode.replaceChild(tImg, truck);
    }
  }

  /* Ashley photo */
  if (cfg.ashleyPhoto) {
    var frame = document.querySelector('.about-photo-frame');
    if (frame) {
      var aImg = document.createElement('img');
      aImg.src = cfg.ashleyPhoto; aImg.alt = 'Ashley, founder of Glazed Over Mini Donuts';
      aImg.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:inherit;';
      aImg.loading = 'lazy'; aImg.decoding = 'async';
      frame.innerHTML = '';
      frame.appendChild(aImg);
    }
  }

  /* OG image meta tag */
  if (cfg.ogImage) {
    var ogMeta = document.querySelector('meta[property="og:image"]');
    if (!ogMeta) {
      ogMeta = document.createElement('meta');
      ogMeta.setAttribute('property', 'og:image');
      document.head.appendChild(ogMeta);
    }
    ogMeta.setAttribute('content', cfg.ogImage);
  }
});
