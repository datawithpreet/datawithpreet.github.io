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

