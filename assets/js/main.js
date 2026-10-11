(() => {
  // Free Google Analytics 4 integration.
  const GA_MEASUREMENT_ID = 'G-STZRGV7QX4';

  const loadAnalytics = () => {
    if (!/^G-[A-Z0-9]+$/i.test(GA_MEASUREMENT_ID)) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_MEASUREMENT_ID);
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });

    // Event delegation: also catches links added to the page later
    // (e.g. the Substack article cards rendered by substack-feed.js).
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');
      if (!link) return;
      if ((link.getAttribute('href') || '').startsWith('#')) return; // in-page anchors aren't outbound clicks
      {
        const href = link.href;
        const label = (link.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120);
        let eventName = 'link_click';
        if (/substack\.com/i.test(href)) eventName = 'substack_click';
        else if (/resources\.html/i.test(href)) eventName = 'resource_click';
        else if (/blog\.html/i.test(href)) eventName = 'blog_click';
        else if (/linkedin\.com/i.test(href)) eventName = 'linkedin_click';
        else if (/\.pdf($|[?#])/i.test(href)) eventName = 'resume_download';

        window.gtag('event', eventName, {
          link_url: href,
          link_text: label,
          page_path: window.location.pathname
        });
      }
    });
  };

  loadAnalytics();

  /* ---------- header / nav ---------- */
  const header = document.querySelector('.site-header');
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.menu-toggle');
  const links = [...document.querySelectorAll('.nav a')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

  const updateHeader = () => header && header.classList.toggle('scrolled', window.scrollY > 24);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  toggle?.addEventListener('click', () => {
    const open = header.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });

  links.forEach(link => link.addEventListener('click', () => {
    header.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
  }));

  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id));
      }
    });
  }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
  sections.forEach(section => navObserver.observe(section));

  const yearEl = document.querySelector('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fineHover = window.matchMedia('(hover: hover)').matches;

  /* ---------- scroll reveal ---------- */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ---------- hero video: fallback + play/pause ---------- */
  const video = document.getElementById('introVideo');
  const videoImg = document.getElementById('introFallback');
  const videoToggle = document.getElementById('videoToggle');
  const bubble = document.getElementById('speechBubble');
  let hasVideo = false;

  const useImageFallback = () => {
    hasVideo = false;
    if (video) video.style.display = 'none';
    if (videoImg) videoImg.hidden = false;
    if (videoToggle) videoToggle.style.display = 'none';
    if (bubble) bubble.classList.remove('hidden-bubble');
    video?.closest('.talk-card')?.classList.add('no-video');
  };

  const muteToggle = document.getElementById('muteToggle');
  const syncMuteIcon = () => {
    if (!muteToggle || !video) return;
    muteToggle.classList.toggle('unmuted', !video.muted);
    muteToggle.setAttribute('aria-label', video.muted ? 'Unmute intro video' : 'Mute intro video');
  };
  muteToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!hasVideo || !video) return;
    video.muted = !video.muted;
    if (!video.muted && video.paused) video.play().catch(() => {});
    syncMuteIcon();
  });

  if (video) {
    const src = video.querySelector('source');
    const onSrcError = () => useImageFallback();
    video.addEventListener('error', onSrcError);
    if (src) src.addEventListener('error', onSrcError);
    video.addEventListener('canplay', () => {
      hasVideo = true;
      syncMuteIcon();
      if (bubble) bubble.classList.add('hidden-bubble');
    });
    // If the mp4 404s, some browsers stay silent — double-check shortly after load.
    setTimeout(() => {
      if (video.readyState === 0 && video.networkState === 3) useImageFallback();
    }, 3000);

    videoToggle?.addEventListener('click', () => {
      if (!hasVideo) return;
      if (video.paused) {
        video.play().then(() => {
          video.muted = false; // user gesture: voiceover becomes audible
          videoToggle.textContent = '⏸';
          videoToggle.setAttribute('aria-label', 'Pause intro video');
          videoToggle.setAttribute('title', 'Pause intro video');
          syncMuteIcon();
        }).catch(() => {});
      } else {
        video.pause();
        videoToggle.textContent = '▶';
        videoToggle.setAttribute('aria-label', 'Play intro video');
        videoToggle.setAttribute('title', 'Play intro video');
      }
    });
    video.addEventListener('ended', () => {
      if (!videoToggle) return;
      videoToggle.textContent = '▶';
      videoToggle.setAttribute('aria-label', 'Play intro video');
    });
  } else {
    useImageFallback();
  }

  /* ---------- typewriter speech bubble ---------- */
  const tw = document.getElementById('typewriter');
  if (tw && !reduceMotion) {
    const phrases = [
      "Hi, I'm Preet.",
      'I build data platforms.',
      'Healthcare data is my thing.',
      "Let's talk data."
    ];
    let pi = 0, ci = 0, deleting = false;
    (function tick() {
      const phrase = phrases[pi];
      tw.textContent = phrase.slice(0, ci);
      let wait = deleting ? 26 : 58;
      if (!deleting && ci === phrase.length) { wait = 1800; deleting = true; }
      else if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; wait = 400; }
      else ci += deleting ? -1 : 1;
      setTimeout(tick, wait);
    })();
  } else if (tw) {
    tw.textContent = "Hi, I'm Preet.";
  }

  /* ---------- ID card: lanyard pop + pendulum physics ---------- */
  const swing = document.getElementById('idSwing');
  const idZone = swing ? swing.closest('.id-zone') : null;
  if (swing && !reduceMotion) {
    let dropped = false, inView = false, rafId = 0;
    let angle = 0, vel = 0, target = 0, lastT = 0;

    // spring-physics loop: cursor nudges the target, the spring gives
    // natural overshoot + oscillation, like a real badge on a thread
    const render = (t) => {
      const dt = Math.min(64, t - (lastT || t - 16.7)) / 16.7;
      lastT = t;
      const idle = Math.sin(t / 1400) * 1.8 + Math.sin(t / 2900 + 1.3) * 0.9;
      const goal = target + idle;
      vel += (goal - angle) * 0.028 * dt;
      vel *= Math.pow(0.965, dt);
      angle += vel * dt;
      swing.style.transform = 'rotate(' + angle.toFixed(2) + 'deg)';
      rafId = inView ? requestAnimationFrame(render) : 0;
    };
    const kick = () => { if (inView && !rafId) rafId = requestAnimationFrame(render); };

    window.addEventListener('pointermove', (e) => {
      if (!idZone) return;
      const r = idZone.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / Math.max(1, window.innerWidth);
      target = Math.max(-11, Math.min(11, dx * 34));
      kick();
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { target = 0; });

    const zoneObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        inView = entry.isIntersecting;
        if (inView) {
          if (!dropped) { dropped = true; swing.classList.add('dropped'); }
          kick();
        }
      });
    }, { threshold: 0.15 });
    if (idZone) zoneObserver.observe(idZone);
  } else if (swing) {
    swing.style.opacity = '1';
  }

  const idCard = document.querySelector('#idCard');
  if (idCard) {
    const flip = () => idCard.classList.toggle('flipped');
    idCard.addEventListener('click', flip);
    idCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
    });
  }

  /* ---------- work accordion panels ---------- */
  const panels = [...document.querySelectorAll('#workPanels .panel')];
  if (panels.length) {
    const openPanel = (target) => panels.forEach(p => {
      const isOpen = p === target;
      p.classList.toggle('open', isOpen);
      p.setAttribute('aria-expanded', String(isOpen));
    });
    let hoverTimer = null;
    panels.forEach(panel => {
      if (fineHover) {
        // Hover-intent: don't strobe panels when the pointer just sweeps across.
        panel.addEventListener('mouseenter', () => {
          clearTimeout(hoverTimer);
          hoverTimer = setTimeout(() => openPanel(panel), 140);
        });
        panel.addEventListener('mouseleave', () => clearTimeout(hoverTimer));
      }
      panel.addEventListener('click', (e) => {
        if (panel.classList.contains('open')) return;
        clearTimeout(hoverTimer);
        openPanel(panel);
        e.preventDefault();
      });
      panel.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          clearTimeout(hoverTimer);
          openPanel(panel);
        }
      });
    });
  }

  /* ---------- achievements infinite carousel ---------- */
  const achTrack = document.getElementById('achTrack');
  if (achTrack) {
    // Duplicate the cards so the -50% loop is seamless.
    achTrack.innerHTML += achTrack.innerHTML;
    // Re-observe duplicated reveal cards (they start hidden until intersecting).
    achTrack.querySelectorAll('.reveal:not(.in)').forEach(el => revealObserver.observe(el));
    // Tap toggles the marquee on touch (there is no hover-to-pause there).
    const achMarquee = achTrack.closest('.ach-marquee');
    if (achMarquee) {
      achMarquee.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        const paused = achTrack.style.animationPlayState === 'paused';
        achTrack.style.animationPlayState = paused ? '' : 'paused';
      });
    }
  }

  /* ---------- recommendations infinite carousel ---------- */
  const recTrack = document.getElementById('recTrack');
  if (recTrack) {
    // Duplicate the cards so the -50% loop is seamless.
    recTrack.innerHTML += recTrack.innerHTML;
    // Re-observe duplicated reveal cards (they start hidden until intersecting).
    recTrack.querySelectorAll('.reveal:not(.in)').forEach(el => revealObserver.observe(el));
    // Tap toggles the marquee on touch (there is no hover-to-pause there).
    const recMarquee = recTrack.closest('.rec-marquee');
    if (recMarquee) {
      recMarquee.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        const paused = recTrack.style.animationPlayState === 'paused';
        recTrack.style.animationPlayState = paused ? '' : 'paused';
      });
    }
  }

  /* ---------- periodic table: inspector + family light-up + tilt ---------- */
  const ptable = document.querySelector('#ptable');
  const detail = document.querySelector('#ptableDetail');
  const familyLabels = {
    languages: 'LANGUAGES', platforms: 'PLATFORMS', databases: 'DATABASES',
    bi: 'BI & TOOLS', healthcare: 'HEALTHCARE', core: 'CORE'
  };
  const setDetail = (el) => {
    if (!detail || !el) return;
    detail.querySelector('#pdSym').textContent = el.querySelector('.el-sym').textContent;
    detail.querySelector('#pdName').textContent = el.dataset.name || '';
    detail.querySelector('#pdFamily').textContent = familyLabels[el.dataset.family] || '';
    detail.querySelector('#pdDesc').textContent = el.dataset.desc || '';
    renderProjects(el.dataset.name || '');
  };
  /* projects where each skill was actually used — keyed by element data-name */
  const skillProjects = {
    "Python": [
      ["Russian Troll Tweets", "https://github.com/ynpreet/Analysing-Russian-Troll-Tweets-data-using-Python"],
      ["GOT Characters Sentiment Analysis", "https://github.com/ynpreet/Game-Of-Thrones-Sentiment-Analysis-using-Twitter-data"],
      ["Predicting Wildfire in CA", "https://github.com/ynpreet/Prediction-of-Wildfire-in-California"],
      ["Flight Fare Prediction", "https://github.com/ynpreet/Flight-Fare-Prediction-Web-App-Project-With-Deployment"],
      ["Predicting Ideal Location for Restaurant", "https://github.com/ynpreet/Predicting-Ideal-location-for-a-new-reastaurant-using-Yelp-dataset"]
    ],
    "SQL": [
      ["Datawarehouse for Yelp", "https://github.com/ynpreet/Data-warehouse-for-Yelp-dataset"],
      ["Designing Ecommerce OLTP Database", "https://github.com/ynpreet/Designing-Ecommerce-Sales-operation-OLTP-database"]
    ],
    "Power BI": [
      ["DAESO Hackathon Winner", "https://www.linkedin.com/posts/preetmehta_hackathon-powerbi-daeso-activity-6858606729383444480-hQAT?utm_source=linkedin_share&utm_medium=member_desktop_web"]
    ],
    "Looker": [
      ["Looker LookML Developer", "https://drive.google.com/file/d/1SkhBHgFvCZD7VIA2oymBOvMfC3A2q4zi/view?usp=sharing"],
      ["Looker Consulting Partner", "https://www.linkedin.com/posts/preetmehta_achievementunlocked-solvingforbetter-looker-activity-6811442346924752896-v42U?utm_source=linkedin_share&utm_medium=member_desktop_web"]
    ],
    "Tableau": [
      ["OTT Platform Subscribers", "https://public.tableau.com/app/profile/preet.shailesh.mehta/viz/OTTPlatform_16425659537330/Dashboard1"],
      ["Feeding the World", "https://public.tableau.com/app/profile/preet.shailesh.mehta/viz/FoodSupplychain/Dashboard2"],
      ["Spotify", "https://public.tableau.com/app/profile/preet.shailesh.mehta/viz/Spotify_16367235491610/Dashboard1"],
      ["Game of Thrones", "https://public.tableau.com/app/profile/preet.shailesh.mehta/viz/PreetMehta_Gameofthrones/Kills"]
    ],
    "Git": [
      ["Russian Troll Tweets", "https://github.com/ynpreet/Analysing-Russian-Troll-Tweets-data-using-Python"],
      ["GOT Characters Sentiment Analysis", "https://github.com/ynpreet/Game-Of-Thrones-Sentiment-Analysis-using-Twitter-data"],
      ["Predicting Wildfire in CA", "https://github.com/ynpreet/Prediction-of-Wildfire-in-California"],
      ["Datawarehouse for Yelp", "https://github.com/ynpreet/Data-warehouse-for-Yelp-dataset"],
      ["Designing Ecommerce OLTP Database", "https://github.com/ynpreet/Designing-Ecommerce-Sales-operation-OLTP-database"],
      ["Flight Fare Prediction", "https://github.com/ynpreet/Flight-Fare-Prediction-Web-App-Project-With-Deployment"],
      ["Predicting Ideal Location for Restaurant", "https://github.com/ynpreet/Predicting-Ideal-location-for-a-new-reastaurant-using-Yelp-dataset"]
    ],
    "Data Modeling": [
      ["Datawarehouse for Yelp", "https://github.com/ynpreet/Data-warehouse-for-Yelp-dataset"],
      ["Designing Ecommerce OLTP Database", "https://github.com/ynpreet/Designing-Ecommerce-Sales-operation-OLTP-database"]
    ],
    "ETL / ELT": [
      ["Datawarehouse for Yelp", "https://github.com/ynpreet/Data-warehouse-for-Yelp-dataset"]
    ],
    "Machine Learning": [
      ["Russian Troll Tweets", "https://github.com/ynpreet/Analysing-Russian-Troll-Tweets-data-using-Python"],
      ["GOT Characters Sentiment Analysis", "https://github.com/ynpreet/Game-Of-Thrones-Sentiment-Analysis-using-Twitter-data"],
      ["Predicting Wildfire in CA", "https://github.com/ynpreet/Prediction-of-Wildfire-in-California"],
      ["Flight Fare Prediction", "https://github.com/ynpreet/Flight-Fare-Prediction-Web-App-Project-With-Deployment"],
      ["Predicting Ideal Location for Restaurant", "https://github.com/ynpreet/Predicting-Ideal-location-for-a-new-reastaurant-using-Yelp-dataset"]
    ],
    "Data Architecture": [
      ["Datawarehouse for Yelp", "https://github.com/ynpreet/Data-warehouse-for-Yelp-dataset"],
      ["Designing Ecommerce OLTP Database", "https://github.com/ynpreet/Designing-Ecommerce-Sales-operation-OLTP-database"]
    ]
  };
  const pdProjList = document.getElementById('pdProjList');
  const renderProjects = (name) => {
    if (!pdProjList) return;
    const list = skillProjects[name] || [];
    pdProjList.innerHTML = list.length
      ? list.map(([t, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${t}<span aria-hidden="true">↗</span></a></li>`).join('')
      : '<li class="pd-empty">No personal projects yet — this skill comes from client work.</li>';
  };
  renderProjects('Python');
  if (ptable) {
    ptable.querySelectorAll('.element').forEach(el => {
      el.addEventListener('mouseenter', () => setDetail(el));
      el.addEventListener('click', () => setDetail(el));
      el.addEventListener('focus', () => setDetail(el));
      el.setAttribute('tabindex', '0');
      if (fineHover && !reduceMotion) {
        el.addEventListener('mousemove', (e) => {
          const r = el.getBoundingClientRect();
          const rx = ((e.clientY - r.top) / r.height - 0.5) * -12;
          const ry = ((e.clientX - r.left) / r.width - 0.5) * 12;
          el.style.transform =
            `translateY(-6px) scale(1.05) rotateX(${rx.toFixed(1)}deg) rotateY(${ry.toFixed(1)}deg)`;
        });
        el.addEventListener('mouseleave', () => { el.style.transform = ''; });
      }
    });
    document.querySelectorAll('#familyFilters .family-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#familyFilters .family-btn').forEach(b => b.classList.remove('on'));
        btn.classList.add('on');
        const fam = btn.dataset.family;
        if (fam === 'all') {
          ptable.classList.remove('dimmed');
          ptable.querySelectorAll('.element').forEach(el => el.classList.remove('lit'));
        } else {
          ptable.classList.add('dimmed');
          ptable.querySelectorAll('.element').forEach(el =>
            el.classList.toggle('lit', el.dataset.family === fam));
          setDetail(ptable.querySelector(`.element[data-family="${fam}"]`));
        }
      });
    });
  }

  /* ---------- parallax + timeline draw (single rAF loop) ---------- */
  const parallaxEls = [...document.querySelectorAll('[data-parallax]')];
  const timelines = [...document.querySelectorAll('.timeline')];
  let ticking = false;

  const updateParallax = () => {
    const vh = window.innerHeight;
    parallaxEls.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const speed = parseFloat(el.dataset.parallax || '0.1');
      const y = -((r.top + r.height / 2) - vh / 2) * speed;
      const base = el.dataset.parallaxKeep ? 'translate(-50%,-54%) ' : '';
      el.style.transform = `${base}translate3d(0, ${y.toFixed(1)}px, 0)`;
    });
  };

  const updateTimelines = () => {
    const vh = window.innerHeight;
    timelines.forEach(tl => {
      const r = tl.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.82 - r.top) / r.height));
      tl.style.setProperty('--draw', p.toFixed(3));
    });
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateParallax();
      updateTimelines();
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();


/* ---------- Did-you-know ticker: data & engineering facts, fresh every 60s ---------- */
(function () {
  var el = document.getElementById('dykText');
  if (!el) return;
  var srcEl = document.getElementById('dykSrc');
  var btn = document.getElementById('dykRefresh');

  var facts = [
    'The job title \u201Cdata scientist\u201D was only coined in 2008.',
    'The world creates roughly 400 million terabytes of new data every single day.',
    'Apache Hadoop was named after its creator\u2019s child\u2019s toy elephant.',
    'Apache Spark started as a research project at UC Berkeley\u2019s AMPLab in 2009.',
    'SQL was developed at IBM in the 1970s \u2014 it was originally called SEQUEL.',
    'Python is named after Monty Python, not the snake.',
    'The first computer bug was a real moth, found taped into Harvard\u2019s Mark II logbook in 1947.',
    'The term \u201Cdata lake\u201D was coined by James Dixon in 2010.',
    'The \u201Cdata mesh\u201D concept was introduced by Zhamak Dehghani in 2019.',
    'Apache Kafka is named after Franz Kafka \u2014 its creator thought the name fit a system optimized for writing.',
    'Apache Airflow was created at Airbnb in 2014 to orchestrate its data pipelines.',
    'The Parquet file format was created at Twitter in 2013 for efficient columnar storage.',
    'Avro was created by Doug Cutting \u2014 the same person who created Hadoop.',
    '\u201CData is the new oil\u201D was coined by Clive Humby back in 2006.',
    'The 3 Vs of big data \u2014 volume, velocity, variety \u2014 were defined by Doug Laney in 2001.',
    '\u201CData warehouse\u201D as a term was popularized by Bill Inmon in the 1990s.',
    'The lakehouse architecture \u2014 combining data lakes and warehouses \u2014 was described by Databricks in 2020.',
    'The first 1GB hard drive (IBM, 1980) was the size of a refrigerator and cost $40,000.',
    'The first hard disk ever (IBM, 1956) held just 5MB and weighed over a ton.',
    'IPv4\u2019s 4.3 billion addresses officially ran out at the global level in 2011.',
    'Git was created by Linus Torvalds in 2005 to manage Linux kernel development.',
    'Kubernetes is the Greek word for \u201Chelmsman\u201D or \u201Cpilot\u201D.',
    'The first programmer was Ada Lovelace, who wrote an algorithm in the 1840s.',
    'Grace Hopper popularized the term \u201Cdebugging\u201D after that famous moth incident.',
    'Java was originally called Oak.',
    'JavaScript was famously created in just 10 days in 1995.',
    'COBOL, created in 1959, still powers a huge share of the world\u2019s financial transactions.',
    'The QWERTY layout was designed in the 1870s to keep typewriter keys from jamming.',
    'The first webcam was built at Cambridge to watch a coffee pot \u2014 so researchers wouldn\u2019t walk to an empty one.',
    'The first domain ever registered, Symbolics.com, went live on March 15, 1985.',
    'The \u201C@\u201D in email addresses was chosen by Ray Tomlinson in 1971 because it wasn\u2019t used in anyone\u2019s name.',
    'Ethernet was invented at Xerox PARC in 1973.',
    '\u201CWi-Fi\u201D doesn\u2019t stand for anything \u2014 it\u2019s a play on \u201Chi-fi\u201D.',
    'The name \u201CBluetooth\u201D comes from a 10th-century Viking king, Harald Bluetooth.',
    'Moore\u2019s Law (1965) predicted transistors would double roughly every two years \u2014 and held for decades.',
    'Your phone has roughly 100,000 times the processing power of the Apollo 11 guidance computer.',
    'CAPTCHA stands for \u201CCompletely Automated Public Turing test to tell Computers and Humans Apart\u201D.',
    'The first SMS ever sent, in 1992, simply said \u201CMerry Christmas\u201D.',
    'A large data center can use as much electricity as a small town.',
    'There are over 700 programming languages in existence.',
    'The ETL-to-ELT shift happened because cheap cloud storage made transforming after loading practical.',
    'dbt, the SQL-based transformation tool, started at a small consultancy in Philadelphia in 2016.',
    'ENIAC, the first general-purpose computer (1945), weighed about 30 tons.',
    'Fixing the Y2K bug cost the world an estimated few hundred billion dollars.',
    'The first tweet ever, in 2006, was Jack Dorsey writing \u201Cjust setting up my twttr\u201D.'
  ];
  var last = -1;

  function setFact(text) {
    el.style.opacity = '0';
    setTimeout(function () {
      el.textContent = text;
      el.style.opacity = '1';
    }, 260);
  }
  function pick() {
    var i;
    do { i = Math.floor(Math.random() * facts.length); } while (i === last);
    last = i;
    return facts[i];
  }
  function tick() {
    // ~1 in 3 ticks: a programming joke instead of a fact
    if (Math.random() < 0.34) {
      fetch('https://v2.jokeapi.dev/joke/Programming?type=single&blacklistFlags=nsfw,religious,political,racist,sexist')
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (j && !j.error && j.joke) { setFact(j.joke); if (srcEl) srcEl.innerHTML = '&middot; programming joke via JokeAPI'; return; }
          setFact(pick());
        })
        .catch(function () { setFact(pick()); });
      return;
    }
    if (srcEl) srcEl.innerHTML = '&middot; from Preet&rsquo;s notebook';
    setFact(pick());
  }
  if (btn) btn.addEventListener('click', tick);
  // The HTML already shows a default fact, so only rotate on a timer / button.
  setInterval(tick, 60000);
})();


/* ---------- live band: term of the day, HN pulse, substack refresh, quiz ---------- */
(function () {
  function dayOfYear() {
    var now = new Date();
    return Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 864e5);
  }

  /* ----- 2. data term of the day ----- */
  var terms = [
    ['ETL', 'Extract, Transform, Load: pull data from sources, reshape it, then write it into the warehouse. The classic batch pipeline pattern.'],
    ['ELT', 'Extract, Load, Transform: land raw data in the warehouse first, then transform it there using the warehouse\u2019s compute. The cloud-era flip of ETL.'],
    ['Data Lake', 'Central storage for raw data in any format \u2014 structured, semi-structured, unstructured \u2014 usually cheap object storage.'],
    ['Data Warehouse', 'A system built for fast analytical queries over clean, structured, modeled data.'],
    ['Lakehouse', 'An architecture combining the cheap storage of a data lake with the reliability and performance of a warehouse: ACID, indexing, caching.'],
    ['Data Mesh', 'A decentralized approach where domain teams own their data as products, with federated governance.'],
    ['CDC', 'Change Data Capture: streaming row-level inserts, updates and deletes from a source database downstream \u2014 usually by reading the database\u2019s transaction log.'],
    ['SCD Type 2', 'Slowly Changing Dimension Type 2: keep full history by adding a new row per change, with effective dates and a current flag.'],
    ['Star Schema', 'A fact table of measurable events joined to denormalized dimension tables \u2014 the workhorse of analytics modeling.'],
    ['Medallion Architecture', 'Bronze (raw) \u2192 Silver (cleaned) \u2192 Gold (business-ready): the layered pattern popularized by Databricks.'],
    ['Partitioning', 'Splitting a table\u2019s files by a column like date, so queries scan only the relevant slice.'],
    ['Z-Ordering', 'Co-locating related rows in the same files so queries filtering on multiple columns skip far more data.'],
    ['Data Contract', 'An explicit agreement between producers and consumers on a dataset\u2019s schema, semantics and SLAs.'],
    ['DAG', 'Directed Acyclic Graph: tasks with dependencies and no cycles \u2014 how orchestrators like Airflow model pipelines.'],
    ['Idempotency', 'A job that produces the same result whether it runs once or ten times \u2014 the property that makes safe retries possible.'],
    ['Backfill', 'Reprocessing historical data, usually after fixing a bug or changing pipeline logic.'],
    ['Schema Evolution', 'Safely handling changes to a dataset\u2019s columns over time \u2014 adds, renames, type changes \u2014 without breaking readers.'],
    ['Data Lineage', 'The map of where data came from and how it changed at each step. Essential for debugging and compliance.'],
    ['Data Catalog', 'A searchable inventory of an organization\u2019s datasets: owners, definitions and quality info.'],
    ['Watermark', 'In streaming, the threshold of \u201Chow late is too late\u201D \u2014 data older than the watermark is dropped or handled separately.'],
    ['Exactly-Once Semantics', 'The guarantee that each record affects the result precisely once, even with retries and failures.'],
    ['Small Files Problem', 'Too many tiny files kills query performance \u2014 the reader spends more time opening files than reading data. Fixed with compaction.'],
    ['Compaction', 'Merging many small files into fewer large ones to restore read performance.'],
    ['ACID', 'Atomicity, Consistency, Isolation, Durability \u2014 the transaction guarantees formats like Delta Lake bring to data lakes.'],
    ['Time Travel', 'Querying a table as it looked at an earlier version or timestamp, enabled by the transaction log.'],
    ['Late-Arriving Data', 'Records that show up after their event-time processing window \u2014 the eternal headache of streaming pipelines.'],
    ['Data Quality', 'The discipline of keeping data accurate, complete, consistent and timely \u2014 usually enforced with tests and monitors.'],
    ['Orchestration', 'Scheduling, triggering and monitoring pipelines and their dependencies.'],
    ['Feature Store', 'A system that serves consistent ML features for both training and real-time inference.'],
    ['dbt', 'The SQL-based transformation tool that turned analytics engineers into first-class pipeline builders.']
  ];
  var tw = document.getElementById('termWord'), td = document.getElementById('termDef');
  if (tw && td) {
    var t = terms[dayOfYear() % terms.length];
    tw.textContent = t[0]; td.textContent = t[1];
  }

  /* ----- 7. quiz of the day ----- */
  var quiz = [
    { q: 'In a medallion architecture, what does the Silver layer hold?', o: ['Raw ingested data', 'Cleaned, conformed data', 'Business-ready aggregates', 'Archived backups'], a: 1, why: 'Bronze = raw as-ingested, Silver = cleaned and conformed, Gold = business-ready aggregates.' },
    { q: 'What does CDC stand for in data engineering?', o: ['Change Data Capture', 'Centralized Data Cloud', 'Continuous Deployment Cycle', 'Columnar Data Compression'], a: 0, why: 'Change Data Capture streams row-level inserts, updates and deletes \u2014 usually by tailing the database transaction log.' },
    { q: 'Which file format is columnar and the default workhorse for Spark and Databricks?', o: ['Avro', 'JSON', 'Parquet', 'CSV'], a: 2, why: 'Parquet stores data column-by-column, so analytical queries read only the columns they need.' },
    { q: 'SCD Type 2 handles a changing dimension by\u2026', o: ['Overwriting the old row', 'Adding a new row per change, with effective dates', 'Deleting all history', 'Moving changes to another database'], a: 1, why: 'Type 2 preserves full history: each change becomes a new row with effective dates and a current flag.' },
    { q: 'What problem does Z-ordering solve?', o: ['Slow writes', 'Too many small files', 'Skipping irrelevant data when filtering on multiple columns', 'Schema changes'], a: 2, why: 'Z-ordering co-locates related rows in the same files, so multi-column filters skip far more data.' },
    { q: 'In Airflow, a DAG is\u2026', o: ['A database access gateway', 'A graph of tasks with dependencies and no cycles', 'A data archive group', 'A deployment automation guide'], a: 1, why: 'DAG = Directed Acyclic Graph. Tasks run in dependency order; cycles are forbidden.' },
    { q: 'ELT differs from ETL mainly because\u2026', o: ['It skips extraction entirely', 'Raw data is loaded first, then transformed inside the warehouse', 'It only works on streaming data', 'It needs no orchestration'], a: 1, why: 'ELT lands raw data in the warehouse first and transforms it there, exploiting cheap cloud compute.' },
    { q: 'A watermark in stream processing defines\u2026', o: ['Maximum throughput', 'How late data can arrive before it is considered too late', 'The encryption key', 'The checkpoint interval'], a: 1, why: 'The watermark is the lateness threshold \u2014 data older than it is dropped or side-routed.' },
    { q: 'Which of these brings ACID transactions to a data lake?', o: ['Plain Parquet files', 'CSV on object storage', 'Delta Lake', 'JSON Lines'], a: 2, why: 'Delta Lake adds a transaction log over Parquet, giving lakes ACID guarantees, time travel and schema enforcement.' },
    { q: 'The \u201Csmall files problem\u201D hurts\u2026', o: ['Write speed only', 'Query performance \u2014 too much time opening files', 'Storage cost', 'Network bandwidth only'], a: 1, why: 'Thousands of tiny files mean the engine spends more time opening files than reading data. Compaction fixes it.' },
    { q: 'Idempotent pipelines matter because\u2026', o: ['They run faster', 'Retries and re-runs produce the same correct result', 'They use less memory', 'They need no tests'], a: 1, why: 'Idempotency means running twice is the same as running once \u2014 the foundation of safe retries and backfills.' },
    { q: 'Data lineage answers\u2026', o: ['How much storage costs', 'Where data came from and how it changed', 'Who has dashboard access', 'Which tool is fastest'], a: 1, why: 'Lineage traces every dataset back through its transformations \u2014 critical for debugging and compliance.' },
    { q: 'In Kafka, a partition is\u2026', o: ['An ordered, immutable sequence of records within a topic', 'A backup server', 'A compression algorithm', 'A consumer group'], a: 0, why: 'Each partition is an append-only ordered log; partitions are Kafka\u2019s unit of parallelism.' },
    { q: 'Time travel on a Delta table lets you\u2026', o: ['Predict future data', 'Query the table as of a past version', 'Move data between regions', 'Recover a dropped table only'], a: 1, why: 'The transaction log keeps every version, so you can query or restore the table as of any earlier point.' }
  ];
  var qq = document.getElementById('quizQ'), qo = document.getElementById('quizOpts'),
      qw = document.getElementById('quizWhy'), qs = document.getElementById('quizScore');
  if (qq && qo) {
    var item = quiz[(dayOfYear() + 5) % quiz.length];
    qq.textContent = item.q;
    var score = 0;
    try { score = parseInt(localStorage.getItem('dq_score') || '0', 10); } catch (e) {}
    if (qs) qs.textContent = score > 0 ? ('\u2605 ' + score + ' correct all-time') : '';
    item.o.forEach(function (opt, i) {
      var b = document.createElement('button');
      b.className = 'quiz-opt'; b.textContent = opt;
      b.addEventListener('click', function () {
        var btns = qo.querySelectorAll('button');
        btns.forEach(function (x) { x.disabled = true; });
        btns[item.a].classList.add('correct');
        if (i === item.a) {
          score += 1;
          try { localStorage.setItem('dq_score', String(score)); } catch (e) {}
          if (qs) qs.textContent = '\u2605 ' + score + ' correct all-time';
          qw.innerHTML = '<b>Correct.</b> ' + item.why;
        } else {
          b.classList.add('wrong');
          qw.innerHTML = '<b>Not quite.</b> ' + item.why;
        }
        qw.hidden = false;
      });
      qo.appendChild(b);
    });
  }

  /* ----- 4. tech pulse: Hacker News, filtered to data/AI ----- */
  var pl = document.getElementById('pulseList');
  var kw = /data|ai\b|ml\b|llm|gpt|machine learning|neural|transformer|database|sql|spark|kafka|python|pipeline|etl|elt|databricks|snowflake|airflow|dbt|vector|rag\b|agent|analytics|warehouse|lakehouse|kubernetes|postgres|flink|iceberg|delta lake|embedding|inference/i;
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  if (pl) {
    fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
      .then(function (r) { return r.json(); })
      .then(function (ids) {
        var batch = ids.slice(0, 40);
        return Promise.all(batch.map(function (id) {
          return fetch('https://hacker-news.firebaseio.com/v0/item/' + id + '.json')
            .then(function (r) { return r.json(); }).catch(function () { return null; });
        }));
      })
      .then(function (items) {
        var hits = items.filter(function (it) { return it && it.title && kw.test(it.title); })
                         .sort(function (x, y) { return (y.score || 0) - (x.score || 0); })
                         .slice(0, 5);
        if (!hits.length) { pl.innerHTML = '<li class="pulse-loading">No data/AI stories in the top 40 right now \u2014 check the front page.</li>'; return; }
        pl.innerHTML = '';
        hits.forEach(function (it) {
          var li = document.createElement('li');
          li.innerHTML = '<a href="https://news.ycombinator.com/item?id=' + it.id + '" target="_blank" rel="noopener">' +
            esc(it.title) + '</a> <span class="pulse-pts">' + (it.score || 0) + ' points</span>';
          pl.appendChild(li);
        });
      })
      .catch(function () { pl.innerHTML = '<li class="pulse-loading">Couldn\u2019t reach Hacker News \u2014 try the front page link below.</li>'; });
  }

  /* ----- 2b. substack: try a live refresh, keep baked-in list on failure ----- */
  var sl = document.getElementById('subList');
  if (sl) {
    var feed = 'https://masterdataengineering.substack.com/feed';
    fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent(feed))
      .then(function (r) { if (!r.ok) throw 0; return r.text(); })
      .then(function (xml) {
        var doc = new DOMParser().parseFromString(xml, 'text/xml');
        var items = doc.querySelectorAll('item');
        if (!items.length) throw 0;
        sl.innerHTML = '';
        Array.prototype.slice.call(items, 0, 3).forEach(function (it) {
          var title = (it.querySelector('title') || {}).textContent || '';
          var link = (it.querySelector('link') || {}).textContent || '';
          var pub = (it.querySelector('pubDate') || {}).textContent || '';
          var dstr = '';
          try { dstr = new Date(pub).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch (e) {}
          var li = document.createElement('li');
          li.innerHTML = '<a href="' + esc(link) + '" target="_blank" rel="noopener">' + esc(title) + '</a>' +
            (dstr ? '<small>' + esc(dstr) + '</small>' : '');
          sl.appendChild(li);
        });
      })
      .catch(function () { /* keep the baked-in list */ });
  }
})();


/* ---------- student feedback: star rating + FormSubmit ---------- */
(function () {
  var widget = document.getElementById('starWidget');
  if (!widget) return;
  var stars = Array.prototype.slice.call(widget.querySelectorAll('button'));
  var hint = document.getElementById('starsHint');
  var rating = 0;
  var labels = ['', 'Poor', 'Okay', 'Good', 'Great', 'Excellent!'];

  function paint(n) {
    stars.forEach(function (s, i) { s.classList.toggle('lit', i < n); });
    if (hint) hint.textContent = n ? labels[n] + ' — ' + n + ' of 5' : 'Tap a star';
  }
  stars.forEach(function (s, i) {
    s.addEventListener('mouseenter', function () { paint(i + 1); });
    s.addEventListener('focus', function () { paint(i + 1); });
    s.addEventListener('click', function () { rating = i + 1; paint(rating); });
    s.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' && i < 4) { stars[i + 1].focus(); }
      if (e.key === 'ArrowLeft' && i > 0) { stars[i - 1].focus(); }
    });
  });
  widget.addEventListener('mouseleave', function () { paint(rating); });

  var form = document.getElementById('feedbackForm');
  var status = document.getElementById('fbStatus');
  var submitBtn = document.getElementById('fbSubmit');
  function setStatus(msg, ok) {
    status.hidden = false;
    status.textContent = msg;
    status.className = 'fb-status ' + (ok ? 'ok' : 'err');
  }
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var name = document.getElementById('fbName').value.trim();
    var comment = document.getElementById('fbComment').value.trim();
    if (!rating) { setStatus('Please tap a star rating first.', false); widget.querySelector('button').focus(); return; }
    if (!comment && !name) { setStatus('Add your name or a comment along with the rating.', false); return; }
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    fetch('https://formsubmit.co/ajax/ynpreetinusa@gmail.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      mode: 'no-cors',
      body: JSON.stringify({
        _subject: 'Workshop feedback: ' + rating + '/5 stars' + (name ? ' from ' + name : ''),
        _captcha: 'false',
        _template: 'table',
        name: name || '(anonymous)',
        rating: rating + ' / 5',
        comment: comment || '(no comment)'
      })
    }).then(function () {
      setStatus('Thanks! Your ' + rating + '-star feedback was sent to Preet.', true);
      form.querySelectorAll('input, textarea').forEach(function (el) { el.value = ''; });
      rating = 0; paint(0);
    }).catch(function () {
      setStatus('Could not send — please check your connection and try again.', false);
    }).finally(function () {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send feedback →';
    });
  });
})();

/* ---------- giscus: persistent public comments via GitHub Discussions ---------- */
(function () {
  var wrap = document.getElementById('giscusWrap');
  if (!wrap) return;
  var s = document.createElement('script');
  s.src = 'https://giscus.app/client.js';
  s.async = true;
  s.crossOrigin = 'anonymous';
  s.setAttribute('data-repo', 'datawithpreet/datawithpreet.github.io');
  s.setAttribute('data-repo-id', 'R_kgDOVBzKeg');
  s.setAttribute('data-category', 'General');
  s.setAttribute('data-category-id', 'DIC_kwDOVBzKes4DHLY8');
  s.setAttribute('data-mapping', 'pathname');
  s.setAttribute('data-strict', '0');
  s.setAttribute('data-reactions-enabled', '1');
  s.setAttribute('data-emit-metadata', '0');
  s.setAttribute('data-input-position', 'top');
  s.setAttribute('data-theme', 'light');
  s.setAttribute('data-lang', 'en');
  wrap.appendChild(s);
})();

/* ---------- download / resource click tracking (audit) ---------- */
(function () {
  function track(name) {
    try { if (typeof gtag === 'function') gtag('event', 'resource_download', { resource: name }); } catch (e) {}
    try {
      if (window.goatcounter && typeof window.goatcounter.count === 'function') {
        window.goatcounter.count({ path: 'download/' + name, title: name, event: true });
      }
    } catch (e) {}
  }
  document.addEventListener('click', function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest('a[data-track]') : null;
    if (a) track(a.getAttribute('data-track'));
  }, true);
})();
