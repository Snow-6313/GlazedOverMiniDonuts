/* =============================================
  GLAZED OVER MINI DONUTS — Groovy Helper
  Loads Q&A from JSON and makes a best-guess match
  for custom questions.
  ============================================= */

(function () {
  'use strict';

  var DATA_PATH = 'data/chatbot-qa.json';
  var MAX_MESSAGES = 10;
  var UI = {
    en: {
      open: 'Open donut helper',
      close: 'Close donut helper',
      title: 'Groovy Helper',
      subtitle: 'Quick answers from our Groovy Helper',
      placeholder: 'Ask about flavors, ingredients, events…',
      send: 'Send',
      intro: 'Ask a quick question and I’ll do my best to guess what you mean.',
      guessed: 'Closest match',
      loading: 'Loading answers…',
      empty: 'Type a question first.',
      fallbackTitle: 'Try asking',
      fallbackItems: ['Flavors', 'Ingredients', 'Ordering'],
      launch: 'Ask us',
    },
    es: {
      open: 'Abrir ayudante de donas',
      close: 'Cerrar ayudante de donas',
      title: 'Ayudante Groovy',
      subtitle: 'Respuestas rápidas de nuestro Ayudante Groovy',
      placeholder: 'Pregunta sobre sabores, ingredientes, eventos…',
      send: 'Enviar',
      intro: 'Haz una pregunta rápida y haré lo posible por adivinar lo que buscas.',
      guessed: 'Coincidencia más cercana',
      loading: 'Cargando respuestas…',
      empty: 'Escribe una pregunta primero.',
      fallbackTitle: 'Prueba con',
      fallbackItems: ['Sabores', 'Ingredientes', 'Pedidos'],
      launch: 'Pregúntanos',
    }
  };

  var FALLBACK_DATA = {
    en: {
      starter: 'Hey! I’m your groovy mini donut helper. Ask me about flavors, ingredients, ordering, events, or Ashley.',
      fallback: 'I’m not fully sure on that one yet, but I can usually help with flavors, ingredients, ordering, events, and contact info.',
      suggestions: ['What flavors do you have?', 'Do you use seed oils?', 'Who made this website?'],
      items: [
        {
          questions: ['what flavors do you have', 'what is on the menu', 'what donuts do you have', 'what flavors are available'],
          keywords: ['flavors', 'glazes', 'menu', 'specials', 'donuts', 'available'],
          answer: 'We serve groovy classic flavors plus rotating favorites and specials. Check the menu page for the full lineup and current monthly picks.'
        },
        {
          questions: ['do you use seed oils', 'what ingredients do you use', 'are your donuts fried in beef tallow', 'what oil do you use'],
          keywords: ['ingredients', 'seed oils', 'beef tallow', 'artificial colors', 'tallow', 'fried'],
          answer: 'Our donuts are made with old-school vibes and fried in beef tallow, but some flavors or toppings may include some seed oils. If you need details, ask us about a specific donut flavor.'
        },
        {
          questions: ['where can i find you', 'where are you located', 'where is the truck', 'what area do you serve'],
          keywords: ['events', 'truck', 'phoenix', 'west valley', 'location', 'find you'],
          answer: 'We roll through the Phoenix West Valley at pop-ups and events. Check the contact page or social media for real-time updates.'
        },
        {
          questions: ['how do i order', 'what pack sizes do you have', 'are your donuts made to order'],
          keywords: ['order', 'pack', 'packs', '6', '12', '24', 'made to order'],
          answer: 'Our mini donuts are made fresh to order. You can grab packs of 6, 12, or 24 and pick your flavors from the menu.'
        },
        {
          questions: ['who made this website', 'who built this website', 'who created this website'],
          keywords: ['website', 'site', 'built', 'made', 'created', 'ethan'],
          answer: 'This website was made by Ashley’s son, Ethan Curtuis.'
        }
      ]
    },
    es: {
      starter: '¡Hola! Soy tu ayudante groovy de mini donas. Pregúntame sobre sabores, ingredientes, pedidos, eventos o Ashley.',
      fallback: 'Todavía no estoy totalmente seguro de eso, pero normalmente puedo ayudar con sabores, ingredientes, pedidos, eventos y contacto.',
      suggestions: ['¿Qué sabores tienen?', '¿Usan aceites de semillas?', '¿Quién hizo este sitio web?'],
      items: [
        {
          questions: ['que sabores tienen', 'que hay en el menu', 'que donas tienen', 'que sabores estan disponibles'],
          keywords: ['sabores', 'glaseados', 'menu', 'especiales', 'donas', 'disponibles'],
          answer: 'Tenemos sabores clásicos, favoritos que van rotando y especiales. Mira la página del menú para ver la selección completa y los especiales del mes.'
        },
        {
          questions: ['usan aceites de semillas', 'que ingredientes usan', 'frien las donas en sebo de res', 'que aceite usan'],
          keywords: ['ingredientes', 'aceites de semillas', 'sebo de res', 'colorantes artificiales', 'sebo', 'fritas'],
          answer: 'Nuestras donas se hacen con un estilo clásico y se fríen en sebo de res, pero algunos sabores o toppings sí pueden incluir algo de aceite de semillas. Si quieres saber sobre una dona específica, pregúntanos por ese sabor.'
        },
        {
          questions: ['donde puedo encontrarlos', 'donde estan ubicados', 'donde esta el camion', 'que area sirven'],
          keywords: ['eventos', 'camion', 'phoenix', 'west valley', 'ubicacion', 'encontrarlos'],
          answer: 'Estamos recorriendo el Valle Oeste de Phoenix en pop-ups y eventos. Revisa la página de contacto o nuestras redes sociales para ver dónde estaremos.'
        },
        {
          questions: ['como hago un pedido', 'que tamaños de paquetes tienen', 'las donas se hacen al momento'],
          keywords: ['pedido', 'paquete', 'paquetes', '6', '12', '24', 'hecho al momento'],
          answer: 'Nuestras mini donas se hacen frescas al momento. Puedes pedir paquetes de 6, 12 o 24 y elegir tus sabores del menú.'
        },
        {
          questions: ['quien hizo este sitio web', 'quien creo este sitio web', 'quien hizo la pagina web'],
          keywords: ['sitio web', 'pagina web', 'web', 'hizo', 'creo', 'ethan'],
          answer: 'Este sitio web fue hecho por Ethan Curtuis, el hijo de Ashley.'
        }
      ]
    }
  };

  var STOP_WORDS = {
    en: {
      a: true, an: true, and: true, are: true, can: true, do: true, for: true, how: true,
      i: true, is: true, me: true, of: true, on: true, or: true, the: true, to: true,
      what: true, where: true, who: true, you: true, your: true, we: true, us: true
    },
    es: {
      a: true, al: true, como: true, con: true, de: true, del: true, el: true, en: true,
      es: true, la: true, las: true, lo: true, los: true, me: true, para: true, que: true,
      se: true, su: true, sus: true, un: true, una: true, y: true
    }
  };

  var state = {
    data: null,
    lang: 'en',
    isOpen: false,
    hasWelcomed: false,
    loaded: false
  };

  var els = {};

  function getStoredLang() {
    if (window.GOMStorage) return window.GOMStorage.getItem('gom-lang', 'preferences');
    try {
      return localStorage.getItem('gom-lang');
    } catch (error) {
      return null;
    }
  }

  function getLang() {
    var lang = document.documentElement.getAttribute('lang') || getStoredLang() || 'en';
    return UI[lang] ? lang : 'en';
  }

  function copy(key) {
    var lang = getLang();
    return (UI[lang] && UI[lang][key]) || UI.en[key] || '';
  }

  function normalize(str) {
    return String(str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function tokenize(str, lang) {
    var stop = STOP_WORDS[lang] || STOP_WORDS.en;
    return normalize(str).split(' ').filter(function (token) {
      return token && token.length > 1 && !stop[token];
    });
  }

  function uniqueTokens(tokens) {
    var seen = {};
    return tokens.filter(function (token) {
      if (seen[token]) return false;
      seen[token] = true;
      return true;
    });
  }

  function diceCoefficient(a, b) {
    if (!a || !b) return 0;
    if (a === b) return 1;
    if (a.length < 2 || b.length < 2) return 0;

    var map = {};
    var pairs = 0;
    var matches = 0;
    var i;

    for (i = 0; i < a.length - 1; i++) {
      var pairA = a.slice(i, i + 2);
      map[pairA] = (map[pairA] || 0) + 1;
      pairs += 1;
    }

    for (i = 0; i < b.length - 1; i++) {
      var pairB = b.slice(i, i + 2);
      if (map[pairB]) {
        map[pairB] -= 1;
        matches += 1;
      }
      pairs += 1;
    }

    return pairs ? (2 * matches) / pairs : 0;
  }

  function getDataForLang(lang) {
    var data = state.data || FALLBACK_DATA;
    return data[lang] || data.en || FALLBACK_DATA.en;
  }

  function buildWidget() {
    if (document.getElementById('gom-chatbot')) return;

    var root = document.createElement('aside');
    root.id = 'gom-chatbot';
    root.className = 'gom-chatbot';
    root.innerHTML = [
      '<button class="gom-chatbot-toggle" type="button" aria-expanded="false">',
      '  <span class="gom-chatbot-toggle-icon" aria-hidden="true">🍩</span>',
      '  <span class="gom-chatbot-toggle-label"></span>',
      '</button>',
      '<section class="gom-chatbot-window" hidden aria-live="polite" aria-labelledby="gom-chatbot-title">',
      '  <div class="gom-chatbot-header">',
      '    <div>',
      '      <h2 id="gom-chatbot-title" class="gom-chatbot-title"></h2>',
      '      <p class="gom-chatbot-subtitle"></p>',
      '    </div>',
      '    <button class="gom-chatbot-close" type="button">×</button>',
      '  </div>',
      '  <div class="gom-chatbot-messages"></div>',
      '  <div class="gom-chatbot-suggestions"></div>',
      '  <form class="gom-chatbot-form">',
      '    <label class="sr-only" for="gom-chatbot-input">Chatbot input</label>',
      '    <input id="gom-chatbot-input" class="gom-chatbot-input" type="text" autocomplete="off" />',
      '    <button class="gom-chatbot-send" type="submit"></button>',
      '  </form>',
      '</section>'
    ].join('');

    document.body.appendChild(root);

    els.root = root;
    els.toggle = root.querySelector('.gom-chatbot-toggle');
    els.toggleLabel = root.querySelector('.gom-chatbot-toggle-label');
    els.window = root.querySelector('.gom-chatbot-window');
    els.close = root.querySelector('.gom-chatbot-close');
    els.title = root.querySelector('.gom-chatbot-title');
    els.subtitle = root.querySelector('.gom-chatbot-subtitle');
    els.messages = root.querySelector('.gom-chatbot-messages');
    els.suggestions = root.querySelector('.gom-chatbot-suggestions');
    els.form = root.querySelector('.gom-chatbot-form');
    els.input = root.querySelector('.gom-chatbot-input');
    els.send = root.querySelector('.gom-chatbot-send');

    bindEvents();
    refreshUI();
  }

  function bindEvents() {
    els.toggle.addEventListener('click', function () {
      setOpen(!state.isOpen);
    });

    els.close.addEventListener('click', function () {
      setOpen(false);
      els.toggle.focus();
    });

    els.form.addEventListener('submit', function (event) {
      event.preventDefault();
      submitQuestion(els.input.value);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && state.isOpen) setOpen(false);
    });

    var observer = new MutationObserver(function () {
      var nextLang = getLang();
      if (state.lang !== nextLang) {
        state.lang = nextLang;
        refreshUI();
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang', 'data-theme']
    });
  }

  function setOpen(nextOpen) {
    state.isOpen = nextOpen;
    els.toggle.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');
    els.window.hidden = !nextOpen;
    els.root.classList.toggle('is-open', nextOpen);

    if (nextOpen) {
      if (!state.hasWelcomed) {
        addWelcomeMessage();
        state.hasWelcomed = true;
      }
      els.input.focus();
    }
  }

  function refreshUI() {
    state.lang = getLang();
    var langData = getDataForLang(state.lang);

    els.toggle.setAttribute('aria-label', state.isOpen ? copy('close') : copy('open'));
    els.toggle.setAttribute('title', copy('title'));
    els.toggleLabel.textContent = copy('launch');
    els.title.textContent = copy('title');
    els.subtitle.textContent = copy('subtitle');
    els.close.setAttribute('aria-label', copy('close'));
    els.input.placeholder = copy('placeholder');
    els.input.setAttribute('aria-label', copy('placeholder'));
    els.send.textContent = copy('send');

    renderSuggestions(langData.suggestions || []);

    if (!state.hasWelcomed && els.messages.childNodes.length === 0) {
      addMessage(copy('intro'), 'bot');
    }
  }

  function clearMessages() {
    els.messages.innerHTML = '';
  }

  function addWelcomeMessage() {
    clearMessages();
    var langData = getDataForLang(getLang());
    addMessage(langData.starter || copy('intro'), 'bot');
  }

  function addMessage(text, sender, note) {
    if (!text) return;

    var wrap = document.createElement('div');
    wrap.className = 'gom-chatbot-msg gom-chatbot-msg--' + sender;

    if (note) {
      var badge = document.createElement('div');
      badge.className = 'gom-chatbot-note';
      badge.textContent = note;
      wrap.appendChild(badge);
    }

    var bubble = document.createElement('div');
    bubble.className = 'gom-chatbot-bubble';
    bubble.textContent = text;
    wrap.appendChild(bubble);

    els.messages.appendChild(wrap);

    while (els.messages.children.length > MAX_MESSAGES) {
      els.messages.removeChild(els.messages.firstChild);
    }

    els.messages.scrollTop = els.messages.scrollHeight;
  }

  function renderSuggestions(list) {
    els.suggestions.innerHTML = '';
    (list || []).slice(0, 3).forEach(function (question) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gom-chatbot-chip';
      btn.textContent = question;
      btn.addEventListener('click', function () {
        submitQuestion(question);
      });
      els.suggestions.appendChild(btn);
    });
  }

  function countOverlap(a, b) {
    var set = {};
    var matches = 0;
    a.forEach(function (token) { set[token] = true; });
    b.forEach(function (token) {
      if (set[token]) matches += 1;
    });
    return matches;
  }

  function scoreSignal(queryNorm, queryTokens, signal, weight, lang) {
    var signalNorm = normalize(signal);
    if (!signalNorm) return 0;

    if (queryNorm === signalNorm) return weight;
    if (queryNorm.indexOf(signalNorm) !== -1 || signalNorm.indexOf(queryNorm) !== -1) return Math.max(weight - 0.08, 0.5);

    var signalTokens = uniqueTokens(tokenize(signalNorm, lang));
    var overlap = countOverlap(queryTokens, signalTokens);
    var overlapScore = signalTokens.length ? overlap / signalTokens.length : 0;
    var diceScore = diceCoefficient(queryNorm.replace(/\s+/g, ''), signalNorm.replace(/\s+/g, ''));

    return Math.max(overlapScore * (weight - 0.12), diceScore * (weight - 0.18));
  }

  function findBestMatch(question) {
    var lang = getLang();
    var langData = getDataForLang(lang);
    var queryNorm = normalize(question);
    var queryTokens = uniqueTokens(tokenize(queryNorm, lang));
    var best = null;
    var bestScore = 0;

    (langData.items || []).forEach(function (item) {
      var score = 0;

      (item.questions || []).forEach(function (signal) {
        score = Math.max(score, scoreSignal(queryNorm, queryTokens, signal, 1, lang));
      });

      var keywordHits = 0;
      (item.keywords || []).forEach(function (signal) {
        var signalScore = scoreSignal(queryNorm, queryTokens, signal, 0.78, lang);
        score = Math.max(score, signalScore);
        if (signalScore > 0.35) keywordHits += 1;
      });

      if (keywordHits > 1) score += Math.min(0.14, keywordHits * 0.04);

      if (score > bestScore) {
        bestScore = score;
        best = item;
      }
    });

    if (!best || bestScore < 0.34) return null;

    return {
      item: best,
      guessed: bestScore < 0.92
    };
  }

  function submitQuestion(rawQuestion) {
    var question = String(rawQuestion || '').trim();
    if (!question) {
      addMessage(copy('empty'), 'bot');
      return;
    }

    if (!state.isOpen) setOpen(true);

    addMessage(question, 'user');
    els.input.value = '';

    var match = findBestMatch(question);
    var langData = getDataForLang(getLang());
    var answer = match ? match.item.answer : langData.fallback;
    var note = match && match.guessed ? copy('guessed') : '';

    window.setTimeout(function () {
      addMessage(answer, 'bot', note);
    }, 180);
  }

  function loadData() {
    return fetch(DATA_PATH, { cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) throw new Error('Failed to load chatbot data');
        return response.json();
      })
      .then(function (data) {
        state.data = data;
        state.loaded = true;
        refreshUI();
        return data;
      })
      .catch(function () {
        state.data = FALLBACK_DATA;
        state.loaded = true;
        refreshUI();
        return FALLBACK_DATA;
      });
  }

  function init() {
    buildWidget();
    loadData();
    window.GOMChatbot = {
      refresh: refreshUI,
      ask: submitQuestion
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
