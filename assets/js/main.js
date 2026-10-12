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

  /* ---------- hero video: real-time white-background keying ----------
     The HeyGen video has a baked-in white studio background. CSS blend modes
     fail on mobile (iOS Safari composites video separately), so we key out
     the white per-frame on a canvas. Flood-fill from the borders preserves
     interior whites (e.g. sneakers). */
  const canvas = document.getElementById('introCanvas');
  if (video && canvas) {
    const ctx = canvas.getContext('2d', { alpha: true });
    const W = 360, H = 640;
    const proc = document.createElement('canvas');
    proc.width = W; proc.height = H;
    const pctx = proc.getContext('2d', { willReadFrequently: true });
    const mask = new Uint8Array(W * H);
    const stack = new Int32Array(W * H);

    const isWhite = (d, i) => d[i] > 235 && d[i+1] > 235 && d[i+2] > 235;

    function keyFrame() {
      if (video.paused || video.ended || video.readyState < 2) {
        requestAnimationFrame(keyFrame);
        return;
      }
      try {
        pctx.drawImage(video, 0, 0, W, H);
        const img = pctx.getImageData(0, 0, W, H);
        const d = img.data;
        mask.fill(0);
        let sp = 0;
        // seed: all border pixels that are white
        for (let x = 0; x < W; x++) {
          const t = x * 4, b = ((H-1)*W + x) * 4;
          if (isWhite(d, t) && !mask[x]) { mask[x] = 1; stack[sp++] = x; }
          const bi = (H-1)*W + x;
          if (isWhite(d, b) && !mask[bi]) { mask[bi] = 1; stack[sp++] = bi; }
        }
        for (let y = 0; y < H; y++) {
          const l = y*W*4, r = (y*W + W-1)*4;
          const li = y*W, ri = y*W + W-1;
          if (isWhite(d, l) && !mask[li]) { mask[li] = 1; stack[sp++] = li; }
          if (isWhite(d, r) && !mask[ri]) { mask[ri] = 1; stack[sp++] = ri; }
        }
        // flood fill through white
        while (sp > 0) {
          const p = stack[--sp];
          const px = p % W, py = (p / W) | 0;
          const neighbors = [];
          if (px > 0) neighbors.push(p-1);
          if (px < W-1) neighbors.push(p+1);
          if (py > 0) neighbors.push(p-W);
          if (py < H-1) neighbors.push(p+W);
          for (const n of neighbors) {
            if (!mask[n] && isWhite(d, n*4)) { mask[n] = 1; stack[sp++] = n; }
          }
        }
        // apply: background -> transparent, feather edges
        for (let p = 0; p < W*H; p++) {
          const i = p*4;
          if (mask[p]) {
            d[i+3] = 0;
          } else if (d[i] > 225 && d[i+1] > 225 && d[i+2] > 225) {
            // near-white interior pixel: soften based on whiteness
            const w = Math.min(d[i], d[i+1], d[i+2]);
            d[i+3] = Math.round(((255 - w) / 30) * 255);
          }
        }
        ctx.putImageData(img, 0, 0);
      } catch (e) { /* canvas tainted or unavailable: leave last frame */ }
      requestAnimationFrame(keyFrame);
    }

    // start keying once video can play; hide canvas until first keyed frame
    video.addEventListener('canplay', () => { requestAnimationFrame(keyFrame); }, { once: true });
    if (video.readyState >= 2) requestAnimationFrame(keyFrame);
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


  /* ---------- clients logo marquee ---------- */
  const clientTrack = document.getElementById('clientTrack');
  if (clientTrack) {
    // Duplicate the cards so the -50% loop is seamless.
    clientTrack.innerHTML += clientTrack.innerHTML;
    // Tap toggles the marquee on touch (there is no hover-to-pause there).
    const clientMarquee = clientTrack.closest('.client-marquee');
    if (clientMarquee) {
      clientMarquee.addEventListener('click', () => {
        const paused = clientTrack.style.animationPlayState === 'paused';
        clientTrack.style.animationPlayState = paused ? '' : 'paused';
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
  const familyDescs = {
    all: 'Twenty-two elements across six families — pick one to see what it covers.',
    languages: 'Python and SQL — the languages of pipelines, transformations and analysis.',
    platforms: 'Databricks, Spark, Delta Lake — the lakehouse stack where the pipelines run.',
    databases: 'BigQuery and SQL Server — warehouses where analytics-ready data lives.',
    bi: 'Looker, Tableau, Power BI — the last mile from data to decisions.',
    healthcare: 'Claims, clinical, HCC, HEDIS — the domain data that makes healthcare hard.',
    core: 'Architecture, governance, modeling — the engineering discipline underneath it all.'
  };
  const familyDescEl = document.getElementById('familyDesc');
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
        if (familyDescEl && familyDescs[fam]) familyDescEl.textContent = familyDescs[fam];
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

  /* ---------- architecture lab: stage inspector ---------- */
  const flowStages = document.querySelectorAll('.flow-stage[data-stage]');
  const flowDetail = document.getElementById('flowDetail');
  const stageData = {
    sources: {
      title: 'Sources',
      decision: 'Land everything raw first (bronze). Never transform data you cannot re-read from the source.',
      failure: 'A source changes its schema overnight \u2014 a renamed field, a new column, a shifted file format.',
      control: 'Schema checks on landing; quarantine bad batches instead of failing the whole pipeline. Alert, never silently drop.'
    },
    lakehouse: {
      title: 'Lakehouse',
      decision: 'Medallion layers with explicit contracts \u2014 bronze is raw, silver is cleaned and conformed, gold is business-ready. No skipping layers.',
      failure: 'Late-arriving data or duplicates quietly corrupt downstream aggregates.',
      control: 'Idempotent incremental loads (merge on keys, not append); data-quality gates between every layer.'
    },
    governance: {
      title: 'Governance',
      decision: 'Access control at the table and column level \u2014 least privilege by default, especially for PHI.',
      failure: 'Sensitive healthcare data exposed to the wrong audience.',
      control: 'Column-level masking, audit logging on every access, lineage tracked end to end.'
    },
    outcomes: {
      title: 'Outcomes',
      decision: 'Gold tables serve BI and ML from the same definitions \u2014 one source of truth, no divergent metric logic.',
      failure: 'A model trained on data that leaked the future \u2014 lookback and follow-up windows misaligned.',
      control: 'Point-in-time correct features; snapshot dates respected; model inputs versioned with the data.'
    }
  };
  function setStage(key) {
    const d = stageData[key];
    if (!d || !flowDetail) return;
    flowDetail.querySelector('#fdTitle').textContent = d.title;
    flowDetail.querySelector('#fdDecision').textContent = d.decision;
    flowDetail.querySelector('#fdFailure').textContent = d.failure;
    flowDetail.querySelector('#fdControl').textContent = d.control;
    flowStages.forEach(s => s.classList.toggle('active', s.dataset.stage === key));
  }
  if (flowStages.length && flowDetail) {
    flowStages.forEach(s => {
      s.addEventListener('click', () => setStage(s.dataset.stage));
    });
    setStage('lakehouse');
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

// Native newsletter form -> Substack in background
(function(){
  var form = document.querySelector('.newsletter-form');
  if (!form) return;
  var input = form.querySelector('.nl-input');
  var success = form.querySelector('.nl-success');
  var error = form.querySelector('.nl-error');
  var row = form.querySelector('.nl-row');
  var label = form.querySelector('.nl-label');
  var submitting = false;

  form.addEventListener('submit', function(e){
    var email = (input.value || '').trim();
    input.value = email;
    error.hidden = true;
    success.hidden = true;

    if (!input.checkValidity() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.preventDefault();
      error.hidden = false;
      input.focus();
      return;
    }

    if (submitting) {
      e.preventDefault();
      return;
    }
    submitting = true;
    var button = form.querySelector('.nl-btn');
    button.disabled = true;
    button.textContent = 'Submitting…';

    // The browser posts directly to Substack in a hidden iframe. Its cross-origin
    // response cannot be inspected, so the message asks new readers to confirm by email.
    window.setTimeout(function(){
      row.hidden = true;
      label.hidden = true;
      success.hidden = false;
      button.disabled = false;
      button.textContent = 'Subscribe';
      submitting = false;
    }, 1200);
  });
})();
