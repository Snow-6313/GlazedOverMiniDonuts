import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js';
import { getAuth, setPersistence, browserLocalPersistence, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import { initializeFirestore, getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js';

/* =============================================
   GLAZED OVER MINI DONUTS — Admin Dashboard
   Front-end scaffold for future authenticated content editing
   ============================================= */

(function () {
  'use strict';

  const qs = (selector, ctx = document) => ctx.querySelector(selector);
  const qsa = (selector, ctx = document) => [...ctx.querySelectorAll(selector)];
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const storageKeys = {
    session: 'gom-admin-session-v1',
    content: 'gom-admin-content-v1',
  };

  const siteConfig = window.SiteConfig || {};
  const adminConfig = siteConfig.admin || {};
  const authConfig = adminConfig.auth || {};
  const apiConfig = adminConfig.api || {};
  const authMode = authConfig.mode || 'firebase';
  const mediaConfig = {
    uploadEndpoint: apiConfig.mediaUploadEndpoint || '',
    libraryEndpoint: apiConfig.mediaLibraryEndpoint || '',
    deleteEndpoint: apiConfig.mediaDeleteEndpoint || '',
  };
  const pageView = document.body ? document.body.dataset.adminView || 'shared' : 'shared';
  const loginPageUrl = 'admin-login.html';
  const dashboardPageUrl = 'admin-dashboard.html';
  const firebaseConfig = siteConfig.firebase || {};
  const firebaseAdminConfig = adminConfig.firebase || {};
  const firebaseState = {
    ready: false,
    app: null,
    auth: null,
    db: null,
    storage: null,
    authResolved: false,
    authUser: null,
    authPromise: null,
  };

  const state = {
    session: null,
    content: null,
    activeTab: 'flavors',
    allowUnload: false,
    selectedIds: {
      flavors: null,
      events: null,
      monthly: null,
      beverages: null,
    },
    drafts: {
      flavors: null,
      events: null,
      monthly: null,
      beverages: null,
    },
    dirtySections: {
      flavors: false,
      events: false,
      monthly: false,
      beverages: false,
    },
    sectionStatus: {
      flavors: 'Ready',
      events: 'Ready',
      monthly: 'Ready',
      beverages: 'Ready',
    },
    pendingUploads: {
      flavors: {},
      events: {},
      monthly: {},
      beverages: {},
    },
  };

  const defaultContent = {
    flavors: [
      {
        id: 'flavor-glazed-confused',
        name: { en: 'Glazed & Confused', es: 'Glazed & Confused' },
        description: { en: 'Classic glaze — simple, perfect, and timeless', es: 'Glaseado clásico — simple, perfecto e inmortal' },
        tag: 'classic',
        emoji: '🍩',
        imageUrl: '',
        imageAlt: '',
        background: 'rgba(244,167,65,.12)',
        showOnHome: true,
        active: true,
        sortOrder: 1,
      },
      {
        id: 'flavor-picture-perfect',
        name: { en: 'Picture Perfect', es: 'Picture Perfect' },
        description: { en: 'Strawberry glaze + rainbow sprinkles', es: 'Glaseado de fresa + chispas de colores' },
        tag: 'popular',
        emoji: '🍓',
        imageUrl: '',
        imageAlt: '',
        background: 'rgba(232,100,122,.12)',
        showOnHome: true,
        active: true,
        sortOrder: 2,
      },
      {
        id: 'flavor-churro-groove',
        name: { en: 'Churro Groove', es: 'Churro Groove' },
        description: { en: 'Cinnamon sugar + dulce de leche', es: 'Azúcar con canela + dulce de leche' },
        tag: 'fan-fave',
        emoji: '🥐',
        imageUrl: '',
        imageAlt: '',
        background: 'rgba(184,121,15,.12)',
        showOnHome: true,
        active: true,
        sortOrder: 3,
      },
      {
        id: 'flavor-bringing-home-bacon',
        name: { en: 'Bringing Home the Bacon', es: 'Trayendo el Tocino a Casa' },
        description: { en: 'Maple drizzle + bacon bits', es: 'Jarabe de maple + trocitos de tocino' },
        tag: 'bold',
        emoji: '🥓',
        imageUrl: '',
        imageAlt: '',
        background: 'rgba(60,40,20,.08)',
        showOnHome: true,
        active: true,
        sortOrder: 4,
      },
    ],
    events: [
      {
        id: 'event-surprise-eggstravaganza',
        name: { en: 'Surprise Eggstravaganza', es: 'Surprise Eggstravaganza' },
        month: { en: 'Apr', es: 'Abr' },
        day: '3',
        time: '5:00 PM – 9:00 PM',
        emoji: '📍',
        imageUrl: '',
        imageAlt: '',
        location: { en: '15960 N Bullard Ave, Surprise AZ', es: '15960 N Bullard Ave, Surprise AZ' },
        showOnHome: true,
        showOnContact: true,
        active: true,
        sortOrder: 1,
      },
      {
        id: 'event-community-affair',
        name: { en: 'A Community Affair Farmers Market', es: 'A Community Affair Farmers Market' },
        month: { en: 'Apr', es: 'Abr' },
        day: '5',
        time: '9:00 AM – 1:00 PM',
        emoji: '📍',
        imageUrl: '',
        imageAlt: '',
        location: { en: '279 N La Loma Ave, Litchfield Park AZ', es: '279 N La Loma Ave, Litchfield Park AZ' },
        showOnHome: true,
        showOnContact: true,
        active: true,
        sortOrder: 2,
      },
      {
        id: 'event-tacos-low-lows',
        name: { en: 'Tacos & Low Lows', es: 'Tacos & Low Lows' },
        month: { en: 'Apr', es: 'Abr' },
        day: '11',
        time: '12:00 PM – 11:59 PM',
        emoji: '📍',
        imageUrl: '',
        imageAlt: '',
        location: { en: '10020 N Ball Park Blvd, Glendale AZ', es: '10020 N Ball Park Blvd, Glendale AZ' },
        showOnHome: true,
        showOnContact: true,
        active: true,
        sortOrder: 3,
      },
    ],
    monthly: [
      {
        id: 'monthly-orange-creamsicle',
        name: { en: 'Orange Creamsicle', es: 'Naranja Cremosa' },
        description: {
          en: 'A dreamy retro flavor — fresh orange vibes meets classic creamy sweetness. Coming soon.',
          es: 'Un sabor retro de ensueño — vibras de naranja fresca con cremosa dulzura clásica. Próximamente.',
        },
        badge: { en: 'COMING SOON', es: 'PRÓXIMAMENTE' },
        emoji: '🍊',
        imageUrl: '',
        imageAlt: '',
        accent: 'linear-gradient(135deg,#F4A741,#E8647A)',
        active: true,
        sortOrder: 1,
      },
      {
        id: 'monthly-key-lime-pie',
        name: { en: 'Key Lime Pie', es: 'Pie de Lima' },
        description: {
          en: 'Tangy, sweet, refreshing — just like a slice of key lime pie in a tiny donut. Coming soon.',
          es: 'Ácido, dulce y refrescante — como una rebanada de pie de lima en una mini dona. Próximamente.',
        },
        badge: { en: 'COMING SOON', es: 'PRÓXIMAMENTE' },
        emoji: '🍋',
        imageUrl: '',
        imageAlt: '',
        accent: 'linear-gradient(135deg,#3DBCB8,#2a8f8c)',
        active: true,
        sortOrder: 2,
      },
    ],
    beverages: [
      {
        id: 'beverage-java-jive',
        name: { en: 'Java Jive', es: 'Java Jive' },
        description: { en: 'Build your own coffee (Hot or Iced)', es: 'Crea tu propio café (Caliente o Frío)' },
        price: '$3.50 sm / $5 lg',
        emoji: '☕',
        imageUrl: '',
        imageAlt: '',
        active: true,
        sortOrder: 1,
      },
      {
        id: 'beverage-hot-cocoa-hippie',
        name: { en: 'Hot Cocoa Hippie', es: 'Hippie de Cacao Caliente' },
        description: { en: 'Rich, classic hot chocolate', es: 'Rico chocolate caliente clásico' },
        price: '$3.50 / $5 – 16oz',
        emoji: '🍫',
        imageUrl: '',
        imageAlt: '',
        active: true,
        sortOrder: 2,
      },
      {
        id: 'beverage-moo-juice',
        name: { en: 'Moo Juice', es: 'Jugo de Vaca' },
        description: { en: 'Chocolate or Whole Plain milk', es: 'Leche de chocolate o leche entera' },
        price: '$3.50',
        emoji: '🥛',
        imageUrl: '',
        imageAlt: '',
        active: true,
        sortOrder: 3,
      },
    ],
  };

  const sectionConfig = {
    flavors: {
      title: 'Flavor',
      emptyLabel: 'No flavors yet.',
      endpoint: apiConfig.flavorsEndpoint || '',
      fields: [
        { key: 'name.en', label: 'Name (English)', type: 'text', required: true },
        { key: 'name.es', label: 'Name (Spanish)', type: 'text' },
        { key: 'description.en', label: 'Description (English)', type: 'textarea', required: true, full: true },
        { key: 'description.es', label: 'Description (Spanish)', type: 'textarea', full: true },
        {
          key: 'tag',
          label: 'Tag',
          type: 'select',
          options: [
            { value: 'classic', label: 'Classic' },
            { value: 'popular', label: 'Popular' },
            { value: 'fan-fave', label: 'Fan Fave' },
            { value: 'bold', label: 'Bold' },
            { value: 'special', label: 'Special' },
          ],
        },
        { key: 'emoji', label: 'Emoji', type: 'text' },
        { key: 'imageUrl', label: 'Image URL', type: 'url', full: true },
        { key: 'imageAlt', label: 'Image alt text', type: 'text', full: true },
        { key: 'background', label: 'Background style', type: 'text', full: true },
        { key: 'showOnHome', label: 'Show on home page preview', type: 'checkbox' },
        { key: 'active', label: 'Active', type: 'checkbox' },
        { key: 'sortOrder', label: 'Sort order', type: 'number' },
      ],
      preview(item) {
        return item.description && item.description.en ? item.description.en : 'Flavor description';
      },
      chips(item) {
        return [item.tag || 'untagged', item.active ? 'Active' : 'Hidden'];
      },
      create() {
        return {
          id: uid('flavor'),
          name: { en: '', es: '' },
          description: { en: '', es: '' },
          tag: 'classic',
          emoji: '🍩',
          imageUrl: '',
          imageAlt: '',
          background: 'rgba(244,167,65,.12)',
          showOnHome: true,
          active: true,
          sortOrder: nextSortOrder('flavors'),
        };
      },
    },
    events: {
      title: 'Event',
      emptyLabel: 'No events yet.',
      endpoint: apiConfig.eventsEndpoint || '',
      fields: [
        { key: 'name.en', label: 'Event name (English)', type: 'text', required: true, full: true },
        { key: 'name.es', label: 'Event name (Spanish)', type: 'text', full: true },
        { key: 'month.en', label: 'Month (English)', type: 'text', required: true },
        { key: 'month.es', label: 'Month (Spanish)', type: 'text' },
        { key: 'day', label: 'Day', type: 'text', required: true },
        { key: 'time', label: 'Time', type: 'text', full: true },
        { key: 'emoji', label: 'Fallback emoji', type: 'text' },
        { key: 'imageUrl', label: 'Image URL', type: 'url', full: true },
        { key: 'imageAlt', label: 'Image alt text', type: 'text', full: true },
        { key: 'location.en', label: 'Location (English)', type: 'textarea', required: true, full: true },
        { key: 'location.es', label: 'Location (Spanish)', type: 'textarea', full: true },
        { key: 'showOnHome', label: 'Show on home page', type: 'checkbox' },
        { key: 'showOnContact', label: 'Show on contact page', type: 'checkbox' },
        { key: 'active', label: 'Active', type: 'checkbox' },
        { key: 'sortOrder', label: 'Sort order', type: 'number' },
      ],
      preview(item) {
        return [item.month && item.month.en, item.day, item.time].filter(Boolean).join(' • ');
      },
      chips(item) {
        return [item.showOnHome ? 'Home' : 'No home', item.showOnContact ? 'Contact' : 'No contact'];
      },
      create() {
        return {
          id: uid('event'),
          name: { en: '', es: '' },
          month: { en: 'Apr', es: 'Abr' },
          day: '',
          time: '',
          emoji: '📍',
          imageUrl: '',
          imageAlt: '',
          location: { en: '', es: '' },
          showOnHome: true,
          showOnContact: true,
          active: true,
          sortOrder: nextSortOrder('events'),
        };
      },
    },
    monthly: {
      title: 'Special',
      emptyLabel: 'No monthly specials yet.',
      endpoint: apiConfig.monthlyEndpoint || '',
      fields: [
        { key: 'name.en', label: 'Name (English)', type: 'text', required: true },
        { key: 'name.es', label: 'Name (Spanish)', type: 'text' },
        { key: 'description.en', label: 'Description (English)', type: 'textarea', required: true, full: true },
        { key: 'description.es', label: 'Description (Spanish)', type: 'textarea', full: true },
        { key: 'badge.en', label: 'Badge label (English)', type: 'text' },
        { key: 'badge.es', label: 'Badge label (Spanish)', type: 'text' },
        { key: 'emoji', label: 'Emoji', type: 'text' },
        { key: 'imageUrl', label: 'Image URL', type: 'url', full: true },
        { key: 'imageAlt', label: 'Image alt text', type: 'text', full: true },
        { key: 'accent', label: 'Card background / gradient', type: 'text', full: true },
        { key: 'active', label: 'Active', type: 'checkbox' },
        { key: 'sortOrder', label: 'Sort order', type: 'number' },
      ],
      preview(item) {
        return item.description && item.description.en ? item.description.en : 'Monthly special description';
      },
      chips(item) {
        return [item.badge && item.badge.en ? item.badge.en : 'Badge', item.active ? 'Active' : 'Hidden'];
      },
      create() {
        return {
          id: uid('monthly'),
          name: { en: '', es: '' },
          description: { en: '', es: '' },
          badge: { en: 'COMING SOON', es: 'PRÓXIMAMENTE' },
          emoji: '🍩',
          imageUrl: '',
          imageAlt: '',
          accent: 'linear-gradient(135deg,#F4A741,#E8647A)',
          active: true,
          sortOrder: nextSortOrder('monthly'),
        };
      },
    },
    beverages: {
      title: 'Drink',
      emptyLabel: 'No drinks yet.',
      endpoint: apiConfig.beveragesEndpoint || '',
      fields: [
        { key: 'name.en', label: 'Name (English)', type: 'text', required: true },
        { key: 'name.es', label: 'Name (Spanish)', type: 'text' },
        { key: 'description.en', label: 'Description (English)', type: 'textarea', required: true, full: true },
        { key: 'description.es', label: 'Description (Spanish)', type: 'textarea', full: true },
        { key: 'price', label: 'Price', type: 'text', required: true },
        { key: 'emoji', label: 'Emoji', type: 'text' },
        { key: 'imageUrl', label: 'Image URL', type: 'url', full: true },
        { key: 'imageAlt', label: 'Image alt text', type: 'text', full: true },
        { key: 'active', label: 'Active', type: 'checkbox' },
        { key: 'sortOrder', label: 'Sort order', type: 'number' },
      ],
      preview(item) {
        return item.price || 'No price';
      },
      chips(item) {
        return [item.active ? 'Active' : 'Hidden'];
      },
      create() {
        return {
          id: uid('beverage'),
          name: { en: '', es: '' },
          description: { en: '', es: '' },
          price: '',
          emoji: '🥤',
          imageUrl: '',
          imageAlt: '',
          active: true,
          sortOrder: nextSortOrder('beverages'),
        };
      },
    },
  };

  function uid(prefix) {
    return prefix + '-' + Math.random().toString(36).slice(2, 10);
  }

  function nextSortOrder(section) {
    const items = state.content && state.content[section] ? state.content[section] : defaultContent[section];
    if (!items.length) return 1;
    return Math.max(...items.map((item) => Number(item.sortOrder) || 0)) + 1;
  }

  function getNested(obj, path) {
    return path.split('.').reduce((acc, key) => (acc == null ? '' : acc[key]), obj);
  }

  function setNested(obj, path, value) {
    const keys = path.split('.');
    let target = obj;
    for (let i = 0; i < keys.length - 1; i += 1) {
      const key = keys[i];
      if (typeof target[key] !== 'object' || target[key] === null) target[key] = {};
      target = target[key];
    }
    target[keys[keys.length - 1]] = value;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function hasFirebaseConfig() {
    return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
  }

  async function ensureFirebase() {
    if (authMode !== 'firebase') return false;
    if (!hasFirebaseConfig()) {
      setMessage('admin-auth-message', 'Firebase config is missing in js/site-config.js.', true);
      return false;
    }
    if (firebaseState.ready) return true;

    firebaseState.app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    firebaseState.auth = getAuth(firebaseState.app);
    firebaseState.db = initializeFirestore(firebaseState.app, {
      experimentalAutoDetectLongPolling: true,
      useFetchStreams: false,
    });
    firebaseState.storage = getStorage(firebaseState.app);
    await setPersistence(firebaseState.auth, browserLocalPersistence);
    firebaseState.ready = true;
    return true;
  }

  async function waitForFirebaseAuth() {
    const ready = await ensureFirebase();
    if (!ready) return null;
    if (firebaseState.authResolved) return firebaseState.authUser;
    if (firebaseState.authPromise) return firebaseState.authPromise;

    // authStateReady() waits for Firebase to fully load the persisted auth
    // state from localStorage before we read currentUser. Using onAuthStateChanged
    // with an immediate unsubscribe is unreliable — it can fire with null on the
    // first event while the token is still being restored from storage.
    firebaseState.authPromise = (async () => {
      await firebaseState.auth.authStateReady();
      const user = firebaseState.auth.currentUser;
      firebaseState.authResolved = true;
      firebaseState.authUser = user;
      syncSessionFromFirebase(user);
      return user;
    })();

    return firebaseState.authPromise;
  }

  function syncSessionFromFirebase(user) {
    if (!user) {
      state.session = null;
      return;
    }

    state.session = {
      username: user.email || user.uid,
      token: 'firebase-auth',
      mode: 'firebase',
      loggedInAt: user.metadata && user.metadata.lastSignInTime ? user.metadata.lastSignInTime : new Date().toISOString(),
    };
  }

  function getFirebaseContentDoc(section) {
    return doc(firebaseState.db, firebaseAdminConfig.contentCollection || 'siteContent', section);
  }

  function isLoginPage() {
    return pageView === 'login';
  }

  function isDashboardPage() {
    return pageView === 'dashboard';
  }

  function goToLogin() {
    window.location.href = loginPageUrl;
  }

  function goToDashboard() {
    window.location.href = dashboardPageUrl;
  }

  function loadStoredContent() {
    try {
      const raw = localStorage.getItem(storageKeys.content);
      if (!raw) return clone(defaultContent);
      const parsed = JSON.parse(raw);
      return {
        flavors: Array.isArray(parsed.flavors) ? parsed.flavors : clone(defaultContent.flavors),
        events: Array.isArray(parsed.events) ? parsed.events : clone(defaultContent.events),
        monthly: Array.isArray(parsed.monthly) ? parsed.monthly : clone(defaultContent.monthly),
        beverages: Array.isArray(parsed.beverages) ? parsed.beverages : clone(defaultContent.beverages),
      };
    } catch (error) {
      return clone(defaultContent);
    }
  }

  function persistContent() {
    localStorage.setItem(storageKeys.content, JSON.stringify(state.content));
  }

  function hasUnsyncedChanges() {
    return Object.values(state.dirtySections).some(Boolean);
  }

  function markSectionDirty(section, message) {
    state.dirtySections[section] = true;
    state.sectionStatus[section] = message || 'Changes pending sync';
    state.allowUnload = false;
  }

  function clearSectionDirty(section, message) {
    state.dirtySections[section] = false;
    state.sectionStatus[section] = message || 'Synced successfully';
    state.allowUnload = false;
  }

  function loadSession() {
    try {
      const raw = localStorage.getItem(storageKeys.session);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function persistSession() {
    if (!state.session) return;
    localStorage.setItem(storageKeys.session, JSON.stringify(state.session));
  }

  function clearSession() {
    localStorage.removeItem(storageKeys.session);
    state.session = null;
  }

  function setMessage(targetId, text, isError) {
    const el = qs('#' + targetId);
    if (!el) return;
    el.textContent = text || '';
    el.style.color = isError ? 'var(--clr-secondary)' : 'var(--clr-muted)';
  }

  function getFirebaseErrorMessage(error, fallbackAction) {
    const code = error && error.code ? error.code : '';
    if (window.location.protocol === 'file:') {
      return 'Firebase sync requires http://localhost or a real hosted domain. Opening admin pages directly from the file system will not sync.';
    }
    // Auth sign-in errors
    if (
      code === 'auth/invalid-credential' ||
      code === 'auth/user-not-found' ||
      code === 'auth/wrong-password' ||
      code === 'auth/invalid-email' ||
      code === 'auth/invalid-login-credentials'
    ) {
      return 'Wrong email or password. Make sure you have a user set up in the Firebase console under Authentication → Users.';
    }
    if (code === 'auth/user-disabled') {
      return 'This account has been disabled. Re-enable it in the Firebase console under Authentication → Users.';
    }
    if (code === 'auth/too-many-requests') {
      return 'Too many failed attempts. Wait a few minutes and try again, or reset the account in the Firebase console.';
    }
    if (code === 'auth/network-request-failed') {
      return 'Network error. Check your internet connection and make sure this domain is allowed in Firebase Authentication settings.';
    }
    if (code === 'auth/operation-not-allowed') {
      return 'Email/password sign-in is not enabled. Turn it on in the Firebase console under Authentication → Sign-in method.';
    }
    if (code === 'permission-denied' || code === 'auth/insufficient-permission') {
      return 'Firebase denied access. Check Firestore rules so authenticated admins can read and write to siteContent.';
    }
    if (code === 'unauthenticated') {
      return 'Firebase session failed. Sign in again and verify your domain is allowed in Firebase Authentication.';
    }
    return fallbackAction + ': ' + (error && error.message ? error.message : 'Unknown Firebase error.');
  }

  function updateModeBadges() {
    const authBadge = qs('#auth-mode-badge');
    const syncMode = qs('#admin-sync-mode');
    const authHelp = qs('#admin-auth-help');
    const loginLabel = qs('#admin-login-identifier-label');
    const loginInput = qs('input[name="username"]');

    if (authBadge) authBadge.textContent = authMode === 'firebase' ? 'Firebase auth' : 'Remote auth';
    if (syncMode) syncMode.textContent = authMode === 'firebase' ? 'Firebase live data' : hasAnyContentEndpoint() ? 'API endpoints detected' : 'Local storage fallback';
    if (authHelp) {
      authHelp.textContent = authMode === 'firebase'
        ? 'Sign in with your Firebase Authentication email and password.'
        : 'Sign in with your backend account credentials. Add the auth endpoints in js/site-config.js when the backend is ready.';
    }
    if (loginLabel) loginLabel.textContent = authMode === 'firebase' ? 'Email' : 'Username';
    if (loginInput) {
      loginInput.type = authMode === 'firebase' ? 'email' : 'text';
      loginInput.placeholder = authMode === 'firebase' ? 'owner@example.com' : 'owner';
    }
  }

  function hasAnyContentEndpoint() {
    return ['flavors', 'events', 'monthly', 'beverages'].some((section) => Boolean(sectionConfig[section].endpoint));
  }

  function sortItems(section) {
    state.content[section].sort((a, b) => {
      const orderA = Number(a.sortOrder) || 0;
      const orderB = Number(b.sortOrder) || 0;
      return orderA - orderB;
    });
  }

  function getItems(section) {
    sortItems(section);
    return state.content[section];
  }

  function ensureSelection(section) {
    const items = getItems(section);
    if (!items.length) {
      state.selectedIds[section] = null;
      state.drafts[section] = sectionConfig[section].create();
      return;
    }

    const stillExists = items.some((item) => item.id === state.selectedIds[section]);
    if (!stillExists) state.selectedIds[section] = items[0].id;
    const selected = items.find((item) => item.id === state.selectedIds[section]) || items[0];
    state.drafts[section] = clone(selected);
  }

  function renderSummary() {
    const map = {
      flavors: '#summary-flavors',
      events: '#summary-events',
      monthly: '#summary-monthly',
      beverages: '#summary-beverages',
    };

    Object.keys(map).forEach((section) => {
      const el = qs(map[section]);
      if (el) el.textContent = String(getItems(section).length);
    });
  }

  function renderLists() {
    Object.keys(sectionConfig).forEach((section) => {
      const listEl = qs('[data-list="' + section + '"]');
      if (!listEl) return;

      ensureSelection(section);
      const items = getItems(section);
      const config = sectionConfig[section];

      if (!items.length) {
        listEl.innerHTML = '<div class="admin-empty-note">' + escapeHtml(config.emptyLabel) + '</div>';
        return;
      }

      listEl.innerHTML = items.map((item) => {
        const isActive = item.id === state.selectedIds[section] ? ' is-active' : '';
        const title = getNested(item, 'name.en') || config.title + ' item';
        const chips = config.chips(item)
          .filter(Boolean)
          .map((chip, index) => '<span class="admin-mini-chip' + (index > 1 ? ' is-muted' : '') + '">' + escapeHtml(chip) + '</span>')
          .join('');
        return (
          '<button type="button" class="admin-list-item' + isActive + '" data-section-item="' + section + '" data-item-id="' + escapeHtml(item.id) + '">' +
            '<div class="admin-item-title"><span>' + escapeHtml(title) + '</span>' + renderVisualToken(item, 'admin-mini-visual') + '</div>' +
            '<div class="admin-panel-copy">' + escapeHtml(config.preview(item)) + '</div>' +
            '<div class="admin-item-meta">' + chips + '</div>' +
          '</button>'
        );
      }).join('');
    });
  }

  function renderVisualToken(item, className) {
    const classes = className || 'admin-visual-token';
    const imageUrl = item && item.imageUrl ? item.imageUrl : '';
    const alt = item && item.imageAlt ? item.imageAlt : (getNested(item || {}, 'name.en') || '');
    if (imageUrl) {
      return '<span class="' + classes + '"><img src="' + escapeHtml(imageUrl) + '" alt="' + escapeHtml(alt) + '" loading="lazy" decoding="async"></span>';
    }
    return '<span class="' + classes + '">' + escapeHtml(item && item.emoji ? item.emoji : '🍩') + '</span>';
  }

  function fieldMarkup(field, value) {
    const classes = 'admin-editor-field' + (field.full ? ' is-full' : '');
    const safeValue = value == null ? '' : value;

    if (field.type === 'textarea') {
      return (
        '<div class="' + classes + '">' +
          '<label>' + escapeHtml(field.label) + '</label>' +
          '<textarea data-field-key="' + escapeHtml(field.key) + '"' + (field.required ? ' required' : '') + '>' + escapeHtml(safeValue) + '</textarea>' +
        '</div>'
      );
    }

    if (field.type === 'select') {
      const options = (field.options || []).map((option) => {
        const selected = option.value === safeValue ? ' selected' : '';
        return '<option value="' + escapeHtml(option.value) + '"' + selected + '>' + escapeHtml(option.label) + '</option>';
      }).join('');

      return (
        '<div class="' + classes + '">' +
          '<label>' + escapeHtml(field.label) + '</label>' +
          '<select data-field-key="' + escapeHtml(field.key) + '">' + options + '</select>' +
        '</div>'
      );
    }

    if (field.type === 'checkbox') {
      return (
        '<label class="admin-checkbox ' + (field.full ? 'is-full' : '') + '">' +
          '<input type="checkbox" data-field-key="' + escapeHtml(field.key) + '"' + (safeValue ? ' checked' : '') + ' />' +
          '<span>' + escapeHtml(field.label) + '</span>' +
        '</label>'
      );
    }

    return (
      '<div class="' + classes + '">' +
        '<label>' + escapeHtml(field.label) + '</label>' +
        '<input type="' + escapeHtml(field.type || 'text') + '" data-field-key="' + escapeHtml(field.key) + '" value="' + escapeHtml(safeValue) + '"' + (field.required ? ' required' : '') + ' />' +
      '</div>'
    );
  }

  function renderEditors() {
    Object.keys(sectionConfig).forEach((section) => {
      const editor = qs('[data-editor="' + section + '"]');
      if (!editor) return;

      ensureSelection(section);
      const draft = state.drafts[section];
      const config = sectionConfig[section];
      const heading = draft && getNested(draft, 'name.en') ? getNested(draft, 'name.en') : 'New ' + config.title;
      const hasImage = Boolean(draft && draft.imageUrl);
      const isDirty = Boolean(state.dirtySections[section]);

      const fields = config.fields.map((field) => fieldMarkup(field, getNested(draft, field.key))).join('');

      editor.innerHTML = [
        '<div class="admin-editor-header">',
          '<div>',
            '<span class="section-label">Editor</span>',
            '<h4 class="admin-editor-title">' + escapeHtml(heading) + '</h4>',
          '</div>',
          isDirty ? '<span class="admin-dirty-badge">Unsaved changes</span>' : '',
        '</div>',
        '<p class="admin-panel-copy admin-workflow-hint">',
          '① Edit fields &nbsp;→&nbsp; ② <strong>Save ' + escapeHtml(config.title) + '</strong> &nbsp;→&nbsp; ③ <strong>Sync Section</strong> to publish.',
        '</p>',

        /* ---- Upload zone ---- */
        '<div class="admin-upload-zone' + (hasImage ? ' has-image' : '') + '" data-upload-zone="' + section + '">',
          '<label class="admin-upload-area" title="Click to choose an image file">',
            '<input class="admin-file-input" type="file" accept="image/*" data-image-file="' + section + '">',
            '<div class="admin-upload-prompt">',
              '<span class="admin-upload-icon">🖼️</span>',
              '<strong>Click to upload image</strong>',
              '<span class="admin-upload-hint">PNG · JPG · WEBP · GIF — max 5 MB</span>',
            '</div>',
            '<img class="admin-upload-preview" src="" alt="" loading="eager">',
          '</label>',
          '<div class="admin-upload-overlay-btns">',
            '<button type="button" class="btn btn-outline" data-view-image-section="' + section + '"' + (hasImage ? '' : ' disabled') + '>🔍 View photo</button>',
            '<button type="button" class="btn btn-dark" data-clear-image-section="' + section + '"' + (hasImage ? '' : ' disabled') + '>✕ Remove</button>',
          '</div>',
        '</div>',

        '<div class="admin-editor-grid">' + fields + '</div>',
        '<div class="admin-editor-actions">',
          '<button type="submit" class="btn btn-primary">Save ' + escapeHtml(config.title) + '</button>',
          '<button type="button" class="btn btn-outline" data-duplicate-section="' + section + '">Duplicate</button>',
          '<button type="button" class="btn btn-outline" data-reset-section="' + section + '">Reset</button>',
          '<button type="button" class="btn btn-dark" data-delete-section="' + section + '">Delete</button>',
        '</div>',
      ].join('');

      /* Set image src imperatively — avoids embedding huge data URLs in innerHTML */
      if (hasImage) {
        const previewImg = qs('.admin-upload-preview', editor);
        if (previewImg) {
          previewImg.src = draft.imageUrl;
          previewImg.alt = draft.imageAlt || getNested(draft, 'name.en') || '';
        }
      }
    });
  }

  function renderActivePanel() {
    qsa('.admin-tab').forEach((button) => {
      const tab = button.getAttribute('data-tab');
      button.classList.toggle('is-active', tab === state.activeTab);
      if (state.dirtySections && state.dirtySections[tab]) {
        button.setAttribute('data-dirty', '');
      } else {
        button.removeAttribute('data-dirty');
      }
    });
    qsa('.admin-panel').forEach((panel) => {
      panel.classList.toggle('is-active', panel.getAttribute('data-panel') === state.activeTab);
    });
  }

  function renderUserState() {
    const userName = qs('#admin-user-name');
    const sessionState = qs('#admin-session-state');
    if (userName) userName.textContent = state.session && state.session.username ? state.session.username : '—';
    if (sessionState) sessionState.textContent = state.session ? 'Session active' : 'Not signed in';
  }

  function renderEndpointSettings() {
    const fb = siteConfig.firebase || {};
    const fbAdmin = adminConfig.firebase || {};
    const projectId = fb.projectId || '';
    const consoleBase = projectId ? 'https://console.firebase.google.com/project/' + projectId : '';

    const valueMap = {
      'auth-mode':      authMode === 'firebase' ? 'Firebase Auth' : authMode === 'remote' ? 'Remote / Custom' : authMode,
      'fb-project':     projectId,
      'fb-authdomain':  fb.authDomain,
      'fb-appid':       fb.appId,
      'fb-senderid':    fb.messagingSenderId,
      'fb-apikey':      fb.apiKey ? 'Configured ✓' : '',
      'fb-collection':  fbAdmin.contentCollection,
      'fb-bucket':      fb.storageBucket,
      'fb-uploads':     fbAdmin.uploadsFolder,
      'fb-measurement': fb.measurementId,
      'fb-storageurl':  fb.storageBucket ? 'https://firebasestorage.googleapis.com/v0/b/' + fb.storageBucket : '',
    };

    Object.keys(valueMap).forEach((key) => {
      const el = qs('#endpoint-' + key);
      if (!el) return;
      const val = valueMap[key];
      if (val) {
        el.textContent = val;
        el.setAttribute('data-configured', 'true');
        el.title = val;
      } else {
        el.textContent = 'Not configured';
        el.setAttribute('data-configured', 'false');
        el.removeAttribute('title');
      }
    });

    if (consoleBase) {
      const links = {
        'link-fb-console':   consoleBase + '/overview',
        'link-fb-firestore': consoleBase + '/firestore',
        'link-fb-auth':      consoleBase + '/authentication/users',
        'link-fb-storage':   consoleBase + '/storage',
        'link-fb-hosting':   consoleBase + '/hosting',
      };
      Object.keys(links).forEach((id) => {
        const a = qs('#' + id);
        if (a) a.href = links[id];
      });
    }
  }

  function ensurePhotoViewer() {
    let modal = qs('#admin-photo-viewer');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'admin-photo-viewer';
    modal.className = 'admin-photo-viewer hidden';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = [
      '<div class="admin-photo-viewer-backdrop" data-close-photo-viewer></div>',
      '<div class="admin-photo-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-photo-title">',
        '<button type="button" class="admin-photo-close" data-close-photo-viewer aria-label="Close photo viewer">×</button>',
        '<div class="admin-photo-frame">',
          '<img id="admin-photo-image" src="" alt="" loading="eager" decoding="async">',
        '</div>',
        '<div class="admin-photo-meta">',
          '<strong id="admin-photo-title">Uploaded image preview</strong>',
          '<span id="admin-photo-caption"></span>',
        '</div>',
      '</div>'
    ].join('');

    document.body.appendChild(modal);
    return modal;
  }

  function closePhotoViewer() {
    const modal = qs('#admin-photo-viewer');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }

  function openPhotoViewer(section) {
    updateDraftFromInputs(section);
    const draft = state.drafts[section];
    if (!draft || !draft.imageUrl) {
      setMessage('admin-global-message', 'Import or save an image first, then use the photo viewer.', true);
      return;
    }

    const modal = ensurePhotoViewer();
    const image = qs('#admin-photo-image', modal);
    const title = qs('#admin-photo-title', modal);
    const caption = qs('#admin-photo-caption', modal);
    const itemTitle = getNested(draft, 'name.en') || sectionConfig[section].title;
    const alt = draft.imageAlt || itemTitle;

    if (image) {
      image.src = draft.imageUrl;
      image.alt = alt;
    }
    if (title) title.textContent = itemTitle + ' image';
    if (caption) caption.textContent = alt;

    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
  }

  function renderAll() {
    renderActivePanel();
    renderSummary();
    renderLists();
    renderEditors();
    renderUserState();
    renderEndpointSettings();
    updateModeBadges();
    Object.keys(sectionConfig).forEach((section) => updateSectionStatus(section, state.sectionStatus[section] || 'Ready'));
  }

  function selectItem(section, id) {
    state.selectedIds[section] = id;
    const selected = getItems(section).find((item) => item.id === id);
    state.drafts[section] = selected ? clone(selected) : sectionConfig[section].create();
    renderAll();
  }

  function updateDraftFromInputs(section) {
    const editor = qs('[data-editor="' + section + '"]');
    if (!editor || !state.drafts[section]) return;

    qsa('[data-field-key]', editor).forEach((input) => {
      const key = input.getAttribute('data-field-key');
      const value = input.type === 'checkbox' ? input.checked : input.value;
      setNested(state.drafts[section], key, input.type === 'number' ? Number(value) : value);
    });
  }

  async function upsertDraft(section) {
    updateDraftFromInputs(section);

    const config = sectionConfig[section];
    const draft = clone(state.drafts[section]);
    const requiredFields = config.fields.filter((field) => field.required);
    const missing = requiredFields.find((field) => {
      const value = getNested(draft, field.key);
      return value === '' || value == null;
    });

    if (missing) {
      setMessage('admin-global-message', 'Fill in "' + missing.label + '" before saving.', true);
      return;
    }

    const items = state.content[section];
    const index = items.findIndex((item) => item.id === draft.id);
    if (index >= 0) {
      items[index] = draft;
    } else {
      items.push(draft);
    }

    state.selectedIds[section] = draft.id;
    state.drafts[section] = clone(draft);
    markSectionDirty(section, 'Changes pending sync');
    renderAll();

    setMessage('admin-global-message', config.title + ' saved locally. Click Sync Section to publish it.', false);
    updateSectionStatus(section, 'Changes pending sync');
  }

  function updateSectionStatus(section, message) {
    state.sectionStatus[section] = message;
    const el = qs('#status-' + section);
    if (el) el.textContent = message;
  }

  async function duplicateDraft(section) {
    updateDraftFromInputs(section);
    const draft = clone(state.drafts[section]);
    draft.id = uid(sectionConfig[section].title.toLowerCase());
    if (getNested(draft, 'name.en')) {
      setNested(draft, 'name.en', getNested(draft, 'name.en') + ' Copy');
    }
    draft.sortOrder = nextSortOrder(section);
    state.content[section].push(draft);
    state.selectedIds[section] = draft.id;
    state.drafts[section] = clone(draft);
    markSectionDirty(section, 'Changes pending sync');
    renderAll();

    setMessage('admin-global-message', sectionConfig[section].title + ' duplicated locally. Click Sync Section to publish it.', false);
    updateSectionStatus(section, 'Changes pending sync');
  }

  function resetDraft(section) {
    ensureSelection(section);
    renderAll();
    setMessage('admin-global-message', 'Changes reset.', false);
  }

  async function deleteDraft(section) {
    const selectedId = state.selectedIds[section];
    if (!selectedId) return;

    state.content[section] = state.content[section].filter((item) => item.id !== selectedId);
    delete state.pendingUploads[section][selectedId];
    markSectionDirty(section, 'Changes pending sync');
    ensureSelection(section);
    renderAll();

    setMessage('admin-global-message', sectionConfig[section].title + ' deleted locally. Click Sync Section to publish it.', false);
    updateSectionStatus(section, 'Changes pending sync');
  }

  function createNewItem(section) {
    const fresh = sectionConfig[section].create();
    state.selectedIds[section] = fresh.id;
    state.drafts[section] = fresh;
    renderAll();
    updateSectionStatus(section, 'Draft ready');
  }

  async function requestJson(url, options) {
    const headers = Object.assign({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }, options && options.headers ? options.headers : {});

    if (state.session && state.session.token) {
      headers.Authorization = 'Bearer ' + state.session.token;
    }

    const response = await fetch(url, Object.assign({}, options, { headers }));
    if (!response.ok) {
      throw new Error('Request failed with status ' + response.status);
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return response.json();
    return {};
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => reject(new Error('Could not read the image file.'));
      reader.readAsDataURL(file);
    });
  }

  async function uploadImageFile(file, section) {
    if (authMode === 'firebase') {
      const ready = await ensureFirebase();
      if (!ready || !firebaseState.storage) return '';
      const safeName = (Date.now() + '-' + file.name).replace(/[^a-zA-Z0-9._-]/g, '-');
      const uploadRef = ref(firebaseState.storage, (firebaseAdminConfig.uploadsFolder || 'admin-uploads') + '/' + section + '/' + safeName);
      await uploadBytes(uploadRef, file);
      return getDownloadURL(uploadRef);
    }

    if (!mediaConfig.uploadEndpoint) return '';

    const formData = new FormData();
    formData.append('file', file);

    const headers = {};
    if (state.session && state.session.token) {
      headers.Authorization = 'Bearer ' + state.session.token;
    }

    const response = await fetch(mediaConfig.uploadEndpoint, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed with status ' + response.status);
    }

    const payload = await response.json();
    return payload.url || payload.imageUrl || '';
  }

  async function prepareSectionItemsForSync(section) {
    const items = clone(state.content[section]);
    const pending = state.pendingUploads[section] || {};
    const pendingIds = Object.keys(pending);

    for (const itemId of pendingIds) {
      const pendingUpload = pending[itemId];
      const item = items.find((entry) => entry.id === itemId);

      if (!pendingUpload || !pendingUpload.file || !item) {
        delete pending[itemId];
        continue;
      }

      const remoteUrl = await uploadImageFile(pendingUpload.file, section);
      if (remoteUrl) item.imageUrl = remoteUrl;
      if (!item.imageAlt) item.imageAlt = pendingUpload.alt || pendingUpload.file.name.replace(/\.[^.]+$/, '');
      delete pending[itemId];
    }

    state.content[section] = items;
    const selected = items.find((item) => item.id === state.selectedIds[section]);
    if (selected) state.drafts[section] = clone(selected);

    return items;
  }

  async function handleImageImport(section, file) {
    if (!file || !state.drafts[section]) return;

    updateDraftFromInputs(section);

    const zone = qs('[data-upload-zone="' + section + '"]');
    if (zone) zone.classList.add('is-uploading');

    try {
      const imageUrl = await readFileAsDataUrl(file);

      state.drafts[section].imageUrl = imageUrl;
      if (!state.drafts[section].imageAlt) {
        state.drafts[section].imageAlt = file.name.replace(/\.[^.]+$/, '');
      }

      state.pendingUploads[section][state.drafts[section].id] = {
        file,
        alt: state.drafts[section].imageAlt,
      };

      const index = state.content[section].findIndex((item) => item.id === state.drafts[section].id);
      if (index >= 0) {
        state.content[section][index] = clone(state.drafts[section]);
      }

      markSectionDirty(section, 'Image ready to sync');

      renderAll();

      setMessage('admin-global-message', 'Image imported locally. Click Sync Section to publish it.', false);
      updateSectionStatus(section, 'Image ready to sync');
    } catch (error) {
      setMessage('admin-global-message', error.message, true);
      updateSectionStatus(section, 'Image import failed');
    } finally {
      if (zone) zone.classList.remove('is-uploading');
    }
  }

  async function syncSection(section) {
    updateDraftFromInputs(section);

    if (!state.content[section]) return;

    const syncBtn = qs('[data-sync-section="' + section + '"]');
    if (syncBtn) { syncBtn.disabled = true; syncBtn.textContent = 'Syncing…'; }

    const finish = (ok) => {
      if (syncBtn) {
        syncBtn.disabled = false;
        syncBtn.textContent = ok ? '✓ Synced' : 'Sync Section';
        if (ok) setTimeout(() => { if (syncBtn) syncBtn.textContent = 'Sync Section'; }, 2500);
      }
    };

    if (authMode === 'firebase') {
      try {
        await ensureFirebase();
        updateSectionStatus(section, 'Syncing...');
        const itemsToSync = await prepareSectionItemsForSync(section);
        await setDoc(getFirebaseContentDoc(section), {
          items: itemsToSync,
          updatedAt: serverTimestamp(),
          updatedBy: state.session && state.session.username ? state.session.username : 'admin',
        }, { merge: true });
        persistContent();
        clearSectionDirty(section, 'Synced successfully');
        renderAll();
        setMessage('admin-global-message', sectionConfig[section].title + ' synced successfully.', false);
        finish(true);
      } catch (error) {
        updateSectionStatus(section, 'Sync failed');
        setMessage('admin-global-message', getFirebaseErrorMessage(error, 'Could not sync ' + section), true);
        finish(false);
      }
      return;
    }

    const endpoint = sectionConfig[section].endpoint;
    if (!endpoint) {
      persistContent();
      clearSectionDirty(section, 'Synced successfully');
      renderAll();
      setMessage('admin-global-message', sectionConfig[section].title + ' synced successfully.', false);
      finish(true);
      return;
    }

    try {
      updateSectionStatus(section, 'Syncing...');
      const itemsToSync = await prepareSectionItemsForSync(section);
      await requestJson(endpoint, {
        method: 'PUT',
        body: JSON.stringify(itemsToSync),
      });
      persistContent();
      clearSectionDirty(section, 'Synced successfully');
      renderAll();
      setMessage('admin-global-message', sectionConfig[section].title + ' synced successfully.', false);
      finish(true);
    } catch (error) {
      updateSectionStatus(section, 'Sync failed');
      setMessage('admin-global-message', 'Could not sync ' + section + ': ' + error.message, true);
      finish(false);
    }
  }

  async function loadRemoteContent() {
    if (authMode === 'firebase') {
      try {
        if (window.location.protocol === 'file:') {
          Object.keys(sectionConfig).forEach((section) => updateSectionStatus(section, 'File preview blocks Firebase'));
          setMessage('admin-global-message', 'Open the admin through http://localhost or your hosted domain. Firebase will not sync reliably from file previews.', true);
          return;
        }

        await ensureFirebase();

        // Resolve auth state before making any Firestore requests.
        // Without this, requests go out unauthenticated and get rejected
        // by Firestore security rules even when the user is logged in.
        const user = await waitForFirebaseAuth();
        if (!user) {
          Object.keys(sectionConfig).forEach((section) => updateSectionStatus(section, 'Not signed in'));
          setMessage('admin-global-message', 'You are not signed in. Please sign in from the login page.', true);
          return;
        }

        syncSessionFromFirebase(user);

        for (const section of Object.keys(sectionConfig)) {
          const snapshot = await getDoc(getFirebaseContentDoc(section));
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (Array.isArray(data.items)) {
              state.content[section] = data.items;
              state.dirtySections[section] = false;
              state.pendingUploads[section] = {};
              updateSectionStatus(section, 'Loaded from Firebase');
            }
          }
        }
        persistContent();
      } catch (error) {
        Object.keys(sectionConfig).forEach((section) => updateSectionStatus(section, 'Using local fallback'));
        setMessage('admin-global-message', getFirebaseErrorMessage(error, 'Could not load Firebase content'), true);
      }
      return;
    }

    const sections = Object.keys(sectionConfig);
    for (const section of sections) {
      const endpoint = sectionConfig[section].endpoint;
      if (!endpoint) continue;
      try {
        const response = await requestJson(endpoint, { method: 'GET' });
        if (Array.isArray(response)) {
          state.content[section] = response;
          state.dirtySections[section] = false;
          state.pendingUploads[section] = {};
          updateSectionStatus(section, 'Loaded from API');
        }
      } catch (error) {
        updateSectionStatus(section, 'Using local fallback');
      }
    }
    persistContent();
  }

  async function handleLogin(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const username = String(formData.get('username') || '').trim();
    const password = String(formData.get('password') || '').trim();

    if (!username || !password) {
      setMessage('admin-auth-message', 'Enter both username and password.', true);
      return;
    }

    if (authMode === 'firebase') {
      try {
        if (window.location.protocol === 'file:') {
          setMessage('admin-auth-message', 'Open the admin from http://localhost or your hosted site. Firebase Authentication does not work from a file preview.', true);
          return;
        }

        await ensureFirebase();
        const credential = await signInWithEmailAndPassword(firebaseState.auth, username, password);
        firebaseState.authResolved = true;
        firebaseState.authUser = credential.user;
        syncSessionFromFirebase(credential.user);
        goToDashboard();
      } catch (error) {
        console.error('[Admin] Firebase sign-in failed — code:', error && error.code, '| message:', error && error.message);
        setMessage('admin-auth-message', getFirebaseErrorMessage(error, 'Login failed'), true);
      }
      return;
    }

    if (authMode === 'remote') {
      if (!authConfig.loginEndpoint) {
        setMessage('admin-auth-message', 'Add the login endpoint in js/site-config.js first.', true);
        return;
      }

      try {
        const response = await requestJson(authConfig.loginEndpoint, {
          method: 'POST',
          body: JSON.stringify({ username, password }),
        });
        state.session = {
          username: response.user && response.user.username ? response.user.username : username,
          token: response.token || '',
          mode: 'remote',
          loggedInAt: new Date().toISOString(),
        };
        persistSession();
        setMessage('admin-auth-message', 'Signed in.', false);
        goToDashboard();
      } catch (error) {
        setMessage('admin-auth-message', 'Login failed: ' + error.message, true);
      }
      return;
    }

    setMessage('admin-auth-message', 'Demo sign-in has been removed. Use Firebase auth or configure remote auth endpoints in js/site-config.js.', true);
  }

  async function validateRemoteSession() {
    if (authMode === 'firebase') {
      const user = await waitForFirebaseAuth();
      firebaseState.authResolved = true;
      firebaseState.authUser = user;
      syncSessionFromFirebase(user);
      return Boolean(user);
    }

    if (!state.session || authMode !== 'remote' || !authConfig.sessionEndpoint) return Boolean(state.session);
    try {
      await requestJson(authConfig.sessionEndpoint, { method: 'GET' });
      return true;
    } catch (error) {
      clearSession();
      return false;
    }
  }

  async function handleLogout() {
    if (isDashboardPage() && hasUnsyncedChanges()) {
      const shouldLeave = window.confirm('You have unsynced changes. Leave this page and discard them?');
      if (!shouldLeave) return;
      state.allowUnload = true;
    }

    if (authMode === 'firebase') {
      await ensureFirebase();
      await signOut(firebaseState.auth);
      firebaseState.authUser = null;
      firebaseState.authResolved = true;
      clearSession();
      goToLogin();
      return;
    }

    if (authMode === 'remote' && authConfig.logoutEndpoint && state.session) {
      try {
        await requestJson(authConfig.logoutEndpoint, { method: 'POST' });
      } catch (error) {
        /* Ignore logout endpoint errors and clear local session anyway. */
      }
    }

    clearSession();
    goToLogin();
  }

  function bindEvents() {
    const loginForm = qs('#admin-login-form');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    const logoutBtn = qs('#admin-logout');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    qsa('a[href]').forEach((link) => {
      link.addEventListener('click', (event) => {
        if (!isDashboardPage() || !hasUnsyncedChanges()) return;
        const href = link.getAttribute('href') || '';
        if (!href || href.startsWith('#')) return;
        const shouldLeave = window.confirm('You have unsynced changes. Leave this page and discard them?');
        if (!shouldLeave) {
          event.preventDefault();
          return;
        }
        state.allowUnload = true;
      });
    });

    qsa('.admin-tab').forEach((button) => {
      button.addEventListener('click', () => {
        state.activeTab = button.getAttribute('data-tab');
        renderActivePanel();
      });
    });

    qsa('.admin-section-new').forEach((button) => {
      button.addEventListener('click', () => createNewItem(button.getAttribute('data-new-section')));
    });

    qsa('.admin-section-sync').forEach((button) => {
      button.addEventListener('click', async () => {
        await syncSection(button.getAttribute('data-sync-section'));
      });
    });

    qsa('[data-editor]').forEach((editor) => {
      const section = editor.getAttribute('data-editor');
      editor.addEventListener('submit', async (event) => {
        event.preventDefault();
        await upsertDraft(section);
      });

      editor.addEventListener('input', () => updateDraftFromInputs(section));
      editor.addEventListener('change', () => updateDraftFromInputs(section));

      editor.addEventListener('click', async (event) => {
        const duplicateButton = event.target.closest('[data-duplicate-section]');
        const resetButton = event.target.closest('[data-reset-section]');
        const deleteButton = event.target.closest('[data-delete-section]');
        const clearImageButton = event.target.closest('[data-clear-image-section]');
        const viewImageButton = event.target.closest('[data-view-image-section]');

        if (duplicateButton) await duplicateDraft(duplicateButton.getAttribute('data-duplicate-section'));
        if (resetButton) resetDraft(resetButton.getAttribute('data-reset-section'));
        if (deleteButton) await deleteDraft(deleteButton.getAttribute('data-delete-section'));
        if (viewImageButton) openPhotoViewer(viewImageButton.getAttribute('data-view-image-section'));
        if (clearImageButton) {
          updateDraftFromInputs(section);
          state.drafts[section].imageUrl = '';
          state.drafts[section].imageAlt = '';
          delete state.pendingUploads[section][state.drafts[section].id];
          const index = state.content[section].findIndex((item) => item.id === state.drafts[section].id);
          if (index >= 0) state.content[section][index] = clone(state.drafts[section]);
          markSectionDirty(section, 'Changes pending sync');
          renderAll();
          updateSectionStatus(section, 'Changes pending sync');
          setMessage('admin-global-message', 'Image removed locally. Click Sync Section to publish it.', false);
        }
      });

      editor.addEventListener('change', (event) => {
        const fileInput = event.target.closest('[data-image-file]');
        if (!fileInput || !fileInput.files || !fileInput.files[0]) return;
        handleImageImport(fileInput.getAttribute('data-image-file'), fileInput.files[0]);
      });
    });

    qsa('[data-list]').forEach((listEl) => {
      listEl.addEventListener('click', (event) => {
        const button = event.target.closest('[data-section-item]');
        if (!button) return;
        selectItem(button.getAttribute('data-section-item'), button.getAttribute('data-item-id'));
      });
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('[data-close-photo-viewer]')) return;
      closePhotoViewer();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closePhotoViewer();
    });

    window.addEventListener('beforeunload', (event) => {
      if (!isDashboardPage() || !hasUnsyncedChanges() || state.allowUnload) return;
      event.preventDefault();
      event.returnValue = '';
    });
  }

  async function init() {
    state.content = loadStoredContent();
    state.session = authMode === 'firebase' ? null : loadSession();

    Object.keys(sectionConfig).forEach((section) => ensureSelection(section));
    bindEvents();
    renderAll();

    if (isDashboardPage()) {
      await loadRemoteContent();
      renderAll();
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
