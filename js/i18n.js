/**
 * BONE SIP — languages (English + 10 Indian languages).
 *
 * The app keeps all data and logic in English. This file translates what is
 * *displayed*: every text node and the placeholder/title/aria-label/alt
 * attributes are swapped for the chosen language as they appear on screen
 * (a MutationObserver covers everything app.js renders later), so saved data,
 * meal swaps and the AI never depend on the display language.
 *
 *   t('Room {n} of {total}', { n, total })  → explicit translation with values
 *   tr(text)                                → translate a display string (data)
 *
 * Dictionaries live in js/i18n/<code>.js (English text → translation) and are
 * loaded only for the language in use. Missing entries fall back to English.
 * Add translate="no" to any element whose text must never be translated
 * (user input, chat messages).
 */
(function () {
  'use strict';

  const VERSION = '3.7.0';
  const STORE_KEY = 'bonesip_lang';

  const LANGS = [
    { code: 'en', name: 'English', native: 'English', glyph: 'Aa', font: '' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी', glyph: 'अ', font: 'Noto Sans Devanagari' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা', glyph: 'অ', font: 'Noto Sans Bengali' },
    { code: 'mr', name: 'Marathi', native: 'मराठी', glyph: 'म', font: 'Noto Sans Devanagari' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు', glyph: 'తె', font: 'Noto Sans Telugu' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்', glyph: 'த', font: 'Noto Sans Tamil' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', glyph: 'ગુ', font: 'Noto Sans Gujarati' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', glyph: 'ಕ', font: 'Noto Sans Kannada' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം', glyph: 'മ', font: 'Noto Sans Malayalam' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', glyph: 'ਪੰ', font: 'Noto Sans Gurmukhi' },
    { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', glyph: 'ଓ', font: 'Noto Sans Oriya' },
    { code: 'as', name: 'Assamese', native: 'অসমীয়া', glyph: 'অ', font: 'Noto Sans Bengali' }
  ];
  const BY_CODE = {};
  LANGS.forEach(l => { BY_CODE[l.code] = l; });

  const dicts = { en: {} };
  const pending = {};
  let current = 'en';
  let collecting = false;
  const missing = new Set();
  const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

  // ---------------------------------------------------------------------------
  // Lookup
  // ---------------------------------------------------------------------------
  function norm(s) {
    return String(s).replace(/\s+/g, ' ').trim();
  }

  function lookup(key) {
    const d = dicts[current];
    return d && has(d, key) ? d[key] : null;
  }

  function fill(str, vars) {
    return vars ? str.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined && vars[k] !== null ? vars[k] : m)) : str;
  }

  /** Explicit translation of a source string with {placeholders}. */
  function t(key, vars) {
    let out = key;
    if (current !== 'en') {
      const hit = lookup(key);
      if (hit !== null) out = hit;
      else if (collecting) missing.add(key);
    }
    return fill(out, vars);
  }

  /** Plural helper: tn(3, '{n} move', '{n} moves'). */
  function tn(n, one, other, vars) {
    return t(n === 1 ? one : other, Object.assign({ n }, vars));
  }

  /**
   * Translate a display string. Besides exact matches it understands the app's
   * composite labels: "A + B" (meal items), "a · b", "Name (portion)" and
   * "10 slow reps" (number + phrase, via a "{n} slow reps" entry).
   */
  let depth = 0;
  function tr(text) {
    if (current === 'en' || text === null || text === undefined) return text;
    depth++;
    try { return trInner(text); } finally { depth--; }
  }

  function trInner(text) {
    const s = norm(text);
    if (!s || !/[A-Za-z]/.test(s)) return text;
    const hit = lookup(s);
    if (hit !== null) return hit;

    for (const sep of [' + ', ' · ', ' | ', ' – ', ', ']) {
      if (s.includes(sep)) {
        const parts = s.split(sep);
        const out = parts.map(p => tr(p));
        if (out.some((o, i) => o !== parts[i])) return out.join(sep);
      }
    }
    const paren = /^(.*\S)\s*\(([^()]+)\)$/.exec(s);
    if (paren) {
      const a = tr(paren[1]);
      const b = tr(paren[2]);
      if (a !== paren[1] || b !== paren[2]) return `${a} (${b})`;
    }
    // Numbers become placeholders: "Room 2 of 5" → "Room {0} of {1}".
    const nums = [];
    const tpl = s.replace(NUM_RE, m => `{${nums.push(m) - 1}}`);
    if (nums.length) {
      const phrase = lookup(tpl);
      if (phrase !== null) return phrase.replace(/\{(\d+)\}/g, (m, i) => (nums[i] !== undefined ? nums[i] : m));
    }
    if (collecting && depth === 1) missing.add(nums.length ? tpl : s);
    return text;
  }
  const NUM_RE = /\d+(?:[.,:]\d+)*/g;

  // ---------------------------------------------------------------------------
  // DOM translation
  // ---------------------------------------------------------------------------
  const ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];
  const textMemo = new WeakMap(); // Text node -> { src, out }
  const attrMemo = new WeakMap(); // Element -> { [attr]: { src, out } }

  function excluded(el) {
    return !el || !!el.closest('[translate="no"], script, style, noscript, textarea, code');
  }

  function withSpace(src) {
    const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(src);
    const core = tr(m[2]);
    return core === m[2] ? src : m[1] + core + m[3];
  }

  function translateText(node) {
    if (excluded(node.parentElement)) return;
    const rec = textMemo.get(node);
    // If the app changed the text since we last translated it, that is the new source.
    const src = rec && rec.out === node.nodeValue ? rec.src : node.nodeValue;
    if (!/[A-Za-z]/.test(src)) return;
    const out = withSpace(src);
    textMemo.set(node, { src, out });
    if (out !== node.nodeValue) node.nodeValue = out;
  }

  function translateAttr(el, name) {
    if (!el.hasAttribute(name) || excluded(el)) return;
    let recs = attrMemo.get(el);
    if (!recs) { recs = {}; attrMemo.set(el, recs); }
    const value = el.getAttribute(name);
    const rec = recs[name];
    const src = rec && rec.out === value ? rec.src : value;
    if (!/[A-Za-z]/.test(src)) return;
    const out = tr(src);
    recs[name] = { src, out };
    if (out !== value) el.setAttribute(name, out);
  }

  function translateTree(root) {
    if (!root) return;
    if (root.nodeType === 3) { translateText(root); return; }
    if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
    if (root.nodeType === 1) {
      if (excluded(root)) return;
      ATTRS.forEach(a => translateAttr(root, a));
    }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        if (n.nodeType === 1 && (n.getAttribute('translate') === 'no' || /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|CODE)$/.test(n.tagName))) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let n = walker.nextNode();
    while (n) {
      if (n.nodeType === 3) translateText(n);
      else ATTRS.forEach(a => translateAttr(n, a));
      n = walker.nextNode();
    }
  }

  let observer = null;
  function observe() {
    if (observer || typeof MutationObserver === 'undefined' || !document.body) return;
    observer = new MutationObserver(muts => {
      if (current === 'en') return;
      muts.forEach(m => {
        if (m.type === 'childList') m.addedNodes.forEach(translateTree);
        else if (m.type === 'characterData') translateText(m.target);
        else if (m.type === 'attributes') translateAttr(m.target, m.attributeName);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }

  // ---------------------------------------------------------------------------
  // Loading & switching
  // ---------------------------------------------------------------------------
  function loadFont(lang) {
    if (!lang.font || document.querySelector(`link[data-font="${lang.code}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.dataset.font = lang.code;
    link.href = `https://fonts.googleapis.com/css2?family=${lang.font.replace(/ /g, '+')}:wght@400;500;600;700;800&display=swap`;
    document.head.appendChild(link);
  }

  function loadDict(code) {
    if (dicts[code]) return Promise.resolve();
    if (pending[code]) return pending[code];
    pending[code] = new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = `js/i18n/${code}.js?v=${VERSION}`;
      s.onload = () => resolve();
      s.onerror = () => { console.warn('Could not load language', code); resolve(); };
      document.head.appendChild(s);
    });
    return pending[code];
  }

  /** Called by js/i18n/<code>.js */
  function register(code, dict) {
    dicts[code] = Object.assign(dicts[code] || {}, dict);
  }

  function saved() {
    try { const c = localStorage.getItem(STORE_KEY); return BY_CODE[c] ? c : null; } catch (e) { return null; }
  }

  function setLanguage(code, opts = {}) {
    const lang = BY_CODE[code] || BY_CODE.en;
    loadFont(lang);
    return loadDict(lang.code).then(() => {
      const changed = current !== lang.code;
      current = dicts[lang.code] ? lang.code : 'en';
      if (opts.persist !== false) { try { localStorage.setItem(STORE_KEY, current); } catch (e) { /* private mode */ } }
      document.documentElement.lang = current;
      document.documentElement.dataset.lang = current;
      if (!document.documentElement.dataset.titleSrc) document.documentElement.dataset.titleSrc = document.title;
      document.title = tr(document.documentElement.dataset.titleSrc);
      observe();
      translateTree(document.body);
      if (changed) document.dispatchEvent(new CustomEvent('bonesip:language', { detail: { code: current } }));
      return current;
    });
  }

  /** Locale for Intl (dates) — always Western digits for readability. */
  function locale() {
    return `${current}-IN-u-nu-latn`;
  }

  function date(d, opts) {
    try { return d.toLocaleDateString(locale(), opts); } catch (e) { return d.toLocaleDateString('en-IN', opts); }
  }

  // Load the saved language as early as possible so the first screen is already translated.
  // Loaded in <head>: start fetching the dictionary and font straight away and keep
  // the page hidden (max 2.5 s) until it is translated, so there's no English flash.
  const ready = (function () {
    const code = saved();
    if (!code || code === 'en') return Promise.resolve('en');
    const root = document.documentElement;
    root.classList.add('i18n-pending');
    const reveal = () => root.classList.remove('i18n-pending');
    const failSafe = setTimeout(reveal, 2500);
    loadFont(BY_CODE[code]);
    loadDict(code);
    return new Promise(resolve => {
      const go = () => setLanguage(code, { persist: false }).then(c => { clearTimeout(failSafe); reveal(); resolve(c); });
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go, { once: true }); else go();
    });
  })();

  window.BoneI18n = {
    LANGS,
    all: () => LANGS,
    VERSION,
    t, tn, tr,
    register,
    setLanguage,
    ready,
    saved,
    current: () => current,
    language: () => BY_CODE[current],
    locale,
    date,
    translateTree,
    // Development helpers: collect strings with no translation.
    collect(on = true) { collecting = on; },
    missing: () => Array.from(missing).sort()
  };
})();
