/* ============================================================
   Ask Preet — zero-cost client-side Q&A chatbot
   No APIs, no tokens, no backend. All matching happens in the
   visitor's browser against assets/data/chatbot-kb.json.
   Answers are deterministic: the bot only replies with text from
   the curated knowledge base, so it can never hallucinate.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- text processing ---------- */

  const STOPWORDS = new Set(
    ('a,an,the,and,or,but,if,then,else,when,at,by,for,with,about,into,of,on,to,in,is,are,was,were,be,been,being,' +
     'have,has,had,do,does,did,will,would,should,could,can,may,might,must,shall,i,me,my,we,our,you,your,he,him,his,' +
     'she,her,it,its,they,them,their,this,that,these,there,here,what,which,who,whom,whose,how,why,where,when,' +
     'as,so,than,too,very,just,not,no,yes,please,tell,know,kind,kinds,say,said,like,get,got,give,us,let,lets')
      .split(',')
  );

  // tiny synonym map: visitor wording -> canonical terms used in the KB
  const SYNONYMS = {
    job: ['work', 'role', 'employer', 'company'],
    jobs: ['work', 'role', 'employer', 'company'],
    career: ['work', 'experience', 'role'],
    company: ['work', 'employer', 'role'],
    employer: ['work', 'company', 'role'],
    boss: ['work', 'manager', 'role'],
    school: ['education', 'university', 'college', 'masters', 'degree'],
    college: ['education', 'university', 'masters', 'degree'],
    university: ['education', 'college', 'masters', 'degree'],
    studied: ['education', 'degree', 'masters'],
    study: ['education', 'learn', 'teaching'],
    degree: ['education', 'masters'],
    background: ['experience', 'work', 'education', 'bio'],
    cv: ['resume'],
    resume: ['cv'],
    hire: ['contact', 'work', 'opportunities'],
    hiring: ['contact', 'work', 'opportunities'],
    email: ['contact', 'reach'],
    phone: ['contact', 'reach'],
    call: ['contact', 'reach'],
    salary: ['contact'],
    pay: ['contact'],
    money: ['contact'],
    projects: ['work', 'built', 'portfolio'],
    built: ['projects', 'work'],
    portfolio: ['projects', 'work'],
    code: ['github', 'projects', 'python'],
    coding: ['python', 'github', 'projects'],
    ai: ['ml', 'machine', 'learning', 'artificial', 'intelligence'],
    ml: ['machine', 'learning', 'ai'],
    artificial: ['ai', 'ml', 'machine'],
    intelligence: ['ai', 'ml'],
    data: ['engineer', 'engineering'],
    engineering: ['engineer', 'data'],
    databse: ['database', 'sql'],
    experince: ['experience'],
    experiance: ['experience'],
    teh: ['the'],
    abt: ['about'],
    u: ['you'],
    ur: ['your'],
    r: ['are'],
    wanna: ['want'],
    gonna: ['going'],
    info: ['about', 'bio'],
    details: ['about', 'bio'],
    life: ['about', 'bio', 'personal'],
    // NOTE: personal-life questions (married, wife, family, age, born, hobbies)
    // intentionally have NO synonyms and NO KB entry — the bot must fall
    // back rather than guess. Preet can add approved personal facts later.
    salary: ['contact'],
    visa: ['contact'],
    h1b: ['contact'],
    'h-1b': ['contact'],
    immigration: ['contact'],
    adobe: ['contact'],
  };

  function stem(w) {
    if (w.length <= 3) return w;
    if (w.endsWith('ies') && w.length > 5) return w.slice(0, -3) + 'y';
    if (w.endsWith('ing') && w.length > 6) return w.slice(0, -3);
    if (w.endsWith('ers') && w.length > 6) return w.slice(0, -3);
    if (w.endsWith('ed') && w.length > 5) return w.slice(0, -2);
    if (w.endsWith('es') && w.length > 5) return w.slice(0, -2);
    if (w.endsWith('s') && w.length > 4 && !w.endsWith('ss')) return w.slice(0, -1);
    // "write" vs "writing"->"writ": strip a trailing e so both sides agree
    if (w.endsWith('e') && w.length > 4) return w.slice(0, -1);
    return w;
  }

  function tokenize(text) {
    return (text.toLowerCase().match(/[a-z0-9+#]+/g) || [])
      .map(stem)
      .filter((t) => t && !STOPWORDS.has(t));
  }

  function expandSynonyms(tokens) {
    const out = new Set(tokens);
    tokens.forEach((t) => {
      (SYNONYMS[t] || []).forEach((s) => out.add(stem(s)));
    });
    return [...out];
  }

  // Full query analysis: raw words first (so synonym keys like "adobe"
  // match before stemming turns it into "adob"), then stem everything.
  function analyze(text) {
    const clean = text.toLowerCase().replace(/h-1b/g, 'h1b');
    const raw = clean.match(/[a-z0-9+#]+/g) || [];
    const out = new Set();
    raw.forEach((w) => {
      if (STOPWORDS.has(w) || STOPWORDS.has(stem(w))) return;
      out.add(stem(w));
      (SYNONYMS[w] || []).forEach((s) => out.add(stem(s)));
    });
    return [...out];
  }

  function levenshtein(a, b) {
    if (a === b) return 0;
    const m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    let prev = new Array(n + 1), cur = new Array(n + 1);
    for (let j = 0; j <= n; j++) prev[j] = j;
    for (let i = 1; i <= m; i++) {
      cur[0] = i;
      for (let j = 1; j <= n; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      [prev, cur] = [cur, prev];
    }
    return prev[n];
  }

  /* ---------- index ---------- */

  function buildIndex(kb) {
    const docs = kb.entries.map((e) => {
      const qText = e.q.join(' ');
      const kText = (e.k || []).join(' ');
      return {
        entry: e,
        qTokens: new Set(tokenize(qText)),
        kTokens: new Set(tokenize(kText)),
        aTokens: new Set(tokenize(e.a)),
      };
    });
    // IDF over the KB corpus so rare, distinctive terms score higher
    const df = {};
    docs.forEach((d) => {
      new Set([...d.qTokens, ...d.kTokens, ...d.aTokens]).forEach((t) => {
        df[t] = (df[t] || 0) + 1;
      });
    });
    const N = docs.length;
    const idf = {};
    Object.keys(df).forEach((t) => {
      idf[t] = Math.log(1 + N / df[t]);
    });
    return { docs, idf };
  }

  function scoreEntry(doc, idf, terms) {
    let score = 0, exact = 0;
    terms.forEach((t) => {
      const w = idf[t] || 1;
      if (doc.qTokens.has(t)) { score += 3 * w; exact += 3 * w; }
      else if (doc.kTokens.has(t)) { score += 2 * w; exact += 2 * w; }
      else if (doc.aTokens.has(t)) { score += 1 * w; exact += 1 * w; }
      else if (t.length >= 5) {
        // fuzzy fallback for typos: nearest KB term within edit distance 2
        let best = null;
        doc.qTokens.forEach((kt) => {
          if (Math.abs(kt.length - t.length) > 2) return;
          const d = levenshtein(t, kt);
          if (d <= 2 && (best === null || d < best)) best = d;
        });
        if (best !== null) score += (best === 1 ? 1.5 : 1) * w;
        else {
          doc.kTokens.forEach((kt) => {
            if (Math.abs(kt.length - t.length) > 2) return;
            const d = levenshtein(t, kt);
            if (d <= 2 && (best === null || d < best)) best = d;
          });
          if (best !== null) score += 0.75 * w;
        }
      }
    });
    return { score, exact };
  }

  function answer(kb, index, rawQuery) {
    const query = rawQuery.trim();
    if (!query) return null;
    const lowered = ' ' + query.toLowerCase() + ' ';

    // greetings
    if (/(^|\W)(hi|hii+|hello|hey|yo|namaste|good\s?(morning|afternoon|evening))(\W|$)/.test(query.toLowerCase())) {
      const g = kb.entries.find((e) => e.id === 'greeting');
      if (g && query.toLowerCase().split(/\s+/).length <= 3) return { entry: g, score: 999 };
    }

    // exact question-variant substring bonus (very high precision).
    // longest matching variant wins; ties break toward more words
    // ("cvs health" beats "experience", "teaching award" beats "teaching").
    let phraseHit = null, phraseLen = 0, phraseWords = 0;
    kb.entries.forEach((e) => {
      e.q.forEach((qv) => {
        const ql = qv.toLowerCase();
        const words = ql.split(/\s+/).length;
        if (qv.length >= 4 && lowered.includes(' ' + ql + ' ') &&
            (qv.length > phraseLen || (qv.length === phraseLen && words > phraseWords))) {
          phraseHit = e;
          phraseLen = qv.length;
          phraseWords = words;
        }
      });
    });

    const terms = analyze(query);
    if (!terms.length && !phraseHit) return null;

    let best = null, bestScore = 0, bestExact = 0, second = 0;
    index.docs.forEach((doc) => {
      const { score: s, exact: x } = scoreEntry(doc, index.idf, terms);
      if (s > bestScore) { second = bestScore; bestScore = s; bestExact = x; best = doc.entry; }
      else if (s > second) second = s;
    });
    if (phraseHit) best = phraseHit;

    // confidence gate: needs a solid score AND at least one exact (non-fuzzy)
    // term match — fuzzy-only matches ("married"~"mart") must stay silent.
    const CONFIDENCE = 2.2;
    if (!best || bestScore < CONFIDENCE || bestExact <= 0) return null;
    return { entry: best, score: bestScore };
  }

  /* ---------- widget ---------- */

  const FALLBACKS = [
    "I don't have that in my notes yet — I only answer from what Preet has approved. Try asking about his work, skills, projects, teaching, or how to contact him.",
  ];

  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  }

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function init() {
    if (document.getElementById('preetbot')) return;

    const fab = el('button', 'preetbot-fab', '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg><span class="preetbot-fab-label">Ask Preet</span>');
    fab.id = 'preetbotFab';
    fab.setAttribute('aria-label', 'Open the Ask Preet chat');

    const panel = el('div', 'preetbot-panel');
    panel.id = 'preetbot';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Ask about Preet');
    panel.innerHTML =
      '<div class="preetbot-head"><div><div class="preetbot-title">Ask about Preet</div>' +
      '<div class="preetbot-sub">Answers come straight from his approved notes — no guessing.</div></div>' +
      '<button class="preetbot-close" aria-label="Close chat">✕</button></div>' +
      '<div class="preetbot-msgs" id="preetbotMsgs" aria-live="polite"></div>' +
      '<div class="preetbot-chips" id="preetbotChips"></div>' +
      '<form class="preetbot-form" id="preetbotForm">' +
      '<input id="preetbotInput" type="text" placeholder="Ask about his work, skills, projects…" autocomplete="off" aria-label="Type your question">' +
      '<button type="submit" aria-label="Send"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button></form>';

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    const msgs = panel.querySelector('#preetbotMsgs');
    const chips = panel.querySelector('#preetbotChips');
    const form = panel.querySelector('#preetbotForm');
    const input = panel.querySelector('#preetbotInput');
    let kb = null, index = null, greeted = false;

    function addMsg(text, who, links) {
      const m = el('div', 'preetbot-msg ' + who);
      m.innerHTML = '<div class="preetbot-bubble">' + esc(text) +
        (links && links.length
          ? '<div class="preetbot-links">' + links.map((l) =>
              '<a href="' + esc(l.u) + '" target="_blank" rel="noopener">' + esc(l.t) + ' ↗</a>').join('') + '</div>'
          : '') + '</div>';
      msgs.appendChild(m);
      msgs.scrollTop = msgs.scrollHeight;
    }

    function showChips(list) {
      chips.innerHTML = '';
      (list || []).forEach((s) => {
        const b = el('button', 'preetbot-chip', esc(s));
        b.type = 'button';
        b.addEventListener('click', () => { input.value = s; form.requestSubmit(); });
        chips.appendChild(b);
      });
    }

    function respond(q) {
      addMsg(q, 'user');
      const r = kb && index ? answer(kb, index, q) : null;
      setTimeout(() => {
        if (r) {
          addMsg(r.entry.a, 'bot', r.entry.links);
          showChips(kb.suggestions);
        } else {
          addMsg(FALLBACKS[0], 'bot');
          showChips(kb ? kb.suggestions : []);
        }
      }, 350);
    }

    function open() {
      panel.classList.add('open');
      fab.classList.add('hidden');
      if (!greeted && kb) {
        greeted = true;
        const g = kb.entries.find((e) => e.id === 'greeting');
        addMsg(g.a, 'bot');
        showChips(kb.suggestions);
      }
      setTimeout(() => input.focus(), 300);
    }
    function close() {
      panel.classList.remove('open');
      fab.classList.remove('hidden');
    }

    fab.addEventListener('click', open);
    panel.querySelector('.preetbot-close').addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = input.value.trim();
      if (!q) return;
      input.value = '';
      respond(q);
    });

    fetch('assets/data/chatbot-kb.json')
      .then((r) => r.json())
      .then((data) => { kb = data; index = buildIndex(kb); })
      .catch(() => { kb = null; });
  }

  // expose for testing in node
  const api = { tokenize, expandSynonyms, stem, buildIndex, answer, levenshtein };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }
})();
