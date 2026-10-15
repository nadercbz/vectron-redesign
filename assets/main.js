/* Vectron Website · Interaktion und Scroll-Animationen
   Technik wie bei Bam Bird: Videos werden komplett geladen und beim Scrollen vor und zurück gespult. */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const mobile = () => innerWidth < 900;

  /* ---------- Header und Fortschritt ---------- */
  const header = $('#header');
  const mega = $('#mega');
  const prog = $('#progress');
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    header.classList.toggle('scrolled', y > 40);
    header.classList.toggle('hide', y > 400 && y > lastY && !mega.classList.contains('open'));
    lastY = y;
    const max = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  };
  addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mega-Menü ---------- */
  const items = $$('.nav-item');
  let closeT, openedAt = 0;
  const openMenu = key => {
    clearTimeout(closeT);
    if (!mega.classList.contains('open') || !$(`.nav-item.open[data-menu="${key}"]`)) openedAt = Date.now();
    items.forEach(i => i.classList.toggle('open', i.dataset.menu === key));
    $$('.mega-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === key));
    mega.classList.add('open');
  };
  const closeMenu = () => {
    closeT = setTimeout(() => { mega.classList.remove('open'); items.forEach(i => i.classList.remove('open')); }, 120);
  };
  items.forEach(i => {
    i.addEventListener('mouseenter', () => fine && openMenu(i.dataset.menu));
    i.addEventListener('click', () => (mega.classList.contains('open') && i.classList.contains('open') && Date.now() - openedAt > 500) ? closeMenu() : openMenu(i.dataset.menu));
  });
  header.addEventListener('mouseleave', closeMenu);
  mega.addEventListener('mouseenter', () => clearTimeout(closeT));
  $$('#mega a').forEach(a => a.addEventListener('click', () => {
    closeMenu();
    if (a.dataset.tab) setTab(+a.dataset.tab);
  }));
  addEventListener('keydown', e => e.key === 'Escape' && closeMenu());

  /* ---------- Mobile-Menü ---------- */
  $('#burger').addEventListener('click', () => document.body.classList.toggle('mm-open'));
  $$('#mobileMenu a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('mm-open')));

  /* ---------- Branchen-Tabs ---------- */
  const TABS = [
    ['Gastronomie', 'handheld', 'Schneller am Gast. Mehr Umsatz pro Tisch.', 'Mobile Kassen, Inhouse-Ordering per QR-Code und der Küchenmonitor Order Hub reduzieren Laufwege und beschleunigen jeden Ablauf.', ['Mobile Bestellaufnahme', 'Bis zu 20 % mehr Getränkeumsatz', 'Order Hub für Küche und Bar']],
    ['Bäckerei & Konditorei', 'bakery', 'Morgens voll. Trotzdem entspannt.', 'Schnelle Bedienung an der Theke, Filialsteuerung aus der Cloud und Inhouse-Ordering fürs Café. Vom Einzelbetrieb bis zum Filialisten.', ['Filialübergreifendes Reporting', 'Digital-Bon statt Papierrolle', 'Webinar: Die digitale Bäckerei']],
    ['Metzgerei', 'butcher', 'Waage, Kasse, Theke. Ein System.', 'Anbindung von Waagen und Warenwirtschaft, gesetzeskonforme Abrechnung und Kundenbindung für deine Stammkundschaft.', ['Waagen-Schnittstellen', 'Warenwirtschaft verbunden', 'Gutscheine und bonVito']],
    ['Hotellerie', 'hotel', 'Restaurant, Bar und Spa verbunden.', 'Vectron verknüpft Outlets mit deinem Hotelsystem. Gäste buchen aufs Zimmer, du behältst alle Umsätze im Blick.', ['Schnittstellen zu Hotelsoftware', 'Mehrere Outlets, ein Reporting', 'Erfolgsstory CPI-Hotels']],
    ['Außengastronomie', 'terrace', 'Die Terrasse kassiert mit.', 'Mobile Kassen und Payment am Tisch sparen Wege bei Sonne und Hochbetrieb. Offlinefähig, wenn das WLAN mal nicht reicht.', ['Kassieren direkt am Tisch', 'Online-Checkout per QR-Code', 'Offlinefähig']],
    ['Einzelhandel', 'retail', 'Kasse, die mit dir wächst.', 'Artikelverwaltung, Warenwirtschaft und Payment in einer Lösung. Dazu Shift4 One für Tax-Free Shopping internationaler Gäste.', ['Warenwirtschafts-Schnittstellen', 'Alle Zahlungsmittel', 'Tax-Free mit Shift4 One']],
    ['Friseure', 'salon', 'Mehr Zeit für Kundschaft.', 'Termine, Kasse und Gutscheine in einem System. Bezahlen per Karte oder Smartphone, Trinkgeld direkt am Terminal.', ['Gutscheine verkaufen', 'Trinkgeld-Funktion', 'Reporting per App']]
  ];
  const TAB_PAGES = ['gastronomie', 'baeckerei-konditorei', 'metzgerei', 'hotellerie', 'aussengastronomie', 'einzelhandel', 'friseure'];
  const tabImg = $('#tabImg');
  function setTab(i) {
    const [name, img, title, text, list] = TABS[i];
    $$('.tab').forEach((t, k) => t.classList.toggle('active', k === i));
    const swap = () => {
      tabImg.src = `assets/img/${img}.jpg`;
      $('#tabKicker').textContent = `0${i + 1} · ${name}`;
      $('#tabTitle').textContent = title;
      $('#tabText').textContent = text;
      $('#tabList').innerHTML = list.map(l => `<li>${l}</li>`).join('');
      const b = $('.tab-copy .btn'); if (b) b.href = 'seiten/' + TAB_PAGES[i] + '.html';
    };
    if (window.gsap && !reduce) {
      gsap.timeline()
        .to(['.tab-copy > *', tabImg], { opacity: 0, y: 14, duration: .25, stagger: .02 })
        .add(swap)
        .fromTo(tabImg, { opacity: 0, scale: 1.12, y: 0 }, { opacity: 1, scale: 1, duration: 1, ease: 'expo.out' })
        .fromTo('.tab-copy > *', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .7, stagger: .06, ease: 'expo.out' }, '<.05');
    } else swap();
  }
  $$('.tab').forEach(t => t.addEventListener('click', () => setTab(+t.dataset.i)));

  /* ---------- Zähler ---------- */
  const fmt = (n, el) => {
    const v = Math.round(n);
    const s = el.dataset.format === 'de' || v >= 1000 ? v.toLocaleString('de-DE') : String(v);
    return s + (el.dataset.suffix || '');
  };
  const countUp = el => {
    const target = +el.dataset.count;
    if (!window.gsap || reduce) { el.textContent = fmt(target, el); return; }
    const o = { v: 0 };
    gsap.to(o, { v: target, duration: 2.2, ease: 'power3.out', onUpdate: () => el.textContent = fmt(o.v, el) });
  };

  /* ---------- Kreislauf: Stationsmarken auf der Welt ---------- */
  const cySteps = $$('.cy-step');
  const cyZoom = $('#cyZoom');
  const PIN_NAMES = ['Kunden', 'Restaurant', 'Küche', 'Backoffice', 'Warenwirtschaft', 'Steuerberatung', 'myVectron Cloud'];
  cySteps.forEach((s, i) => {
    const p = document.createElement('div');
    p.className = 'cy-pinpoint';
    p.style.setProperty('--x', s.dataset.x + '%');
    p.style.setProperty('--y', s.dataset.y + '%');
    p.innerHTML = `<span data-n="0${i + 1}">${PIN_NAMES[i]}</span>`;
    cyZoom.appendChild(p);
  });
  const pins = $$('.cy-pinpoint');

  /* ---------- Videos komplett laden, mit Ladebalken ---------- */
  /* Auf Handys und Tablets (Touch) kommt statt des Videos eine Bildfolge aufs Canvas:
     iOS Safari lädt Videos ohne Tipp nicht vor und spult sie beim Scrollen nicht sauber. */
  const useSeq = matchMedia('(pointer: coarse)').matches || mobile();
  const vids = $$('video[data-src]');
  const ldProg = vids.map(() => 0); // Anteil 0 bis 1 je Video
  const ldBar = $('#ldBar'), ldNum = $('#ldNum');
  const showProgress = () => {
    const p = Math.min(100, Math.round(ldProg.reduce((x, y) => x + y, 0) / ldProg.length * 100));
    ldBar.style.width = p + '%'; ldNum.textContent = p + ' %';
  };
  const loadVideo = (v, i) => {
    const url = v.dataset.src + (mobile() ? '_m.mp4' : '.mp4');
    let total = 4e6, got = 0;
    return fetch(url).then(r => {
      if (!r.ok || !r.body) throw new Error('http');
      total = +r.headers.get('content-length') || 4e6;
      const reader = r.body.getReader(), chunks = [];
      const pump = () => reader.read().then(res => {
        if (res.done) return new Blob(chunks, { type: 'video/mp4' });
        chunks.push(res.value); got += res.value.length; ldProg[i] = Math.min(1, got / total); showProgress();
        return pump();
      });
      return pump();
    }).then(blob => {
      v.src = URL.createObjectURL(blob);
      ldProg[i] = 1; showProgress();
      return new Promise(res => {
        if (v.readyState >= 1) return res();
        v.addEventListener('loadedmetadata', res, { once: true });
        setTimeout(res, 4000);
      });
    }).catch(() => { ldProg[i] = 1; showProgress(); }); // ohne Video bleibt das Poster stehen
  };
  const SEQ_N = 61;
  const seqDraw = (seq, k) => { // zeichnet das nächstgelegene schon geladene Bild
    k = Math.max(0, Math.min(seq.n - 1, Math.round(k)));
    let j = -1;
    for (let d = 0; d < seq.n && j < 0; d++) { if (seq.frames[k - d]) j = k - d; else if (seq.frames[k + d]) j = k + d; }
    if (j < 0 || j === seq.drawn) return;
    seq.drawn = j; seq.ctx.drawImage(seq.frames[j], 0, 0, seq.canvas.width, seq.canvas.height);
  };
  const loadSeq = (v, i) => {
    const n = +v.dataset.seqN || SEQ_N;
    const c = document.createElement('canvas');
    c.width = 1440; c.height = 804; c.className = 'seq';
    v.after(c); v.style.display = 'none';
    const seq = { canvas: c, ctx: c.getContext('2d'), frames: new Array(n), n, drawn: -1 };
    v._seq = seq;
    const order = [], seen = new Set(); // grob zu fein: erst jedes 8., dann 4., 2., dann der Rest
    [8, 4, 2, 1].forEach(st => { for (let k = 0; k < n; k += st) if (!seen.has(k)) { seen.add(k); order.push(k); } });
    if (!seen.has(n - 1)) order.splice(1, 0, n - 1);
    let done = 0, idx = 0;
    const one = k => new Promise(res => {
      const img = new Image();
      const fin = () => { done++; ldProg[i] = done / n; showProgress(); res(); };
      img.onload = () => { seq.frames[k] = img; if (k === 0) seqDraw(seq, 0); fin(); };
      img.onerror = fin;
      img.src = `${v.dataset.seq}/f${String(k).padStart(2, '0')}.webp`;
    });
    const worker = () => idx < order.length ? one(order[idx++]).then(worker) : Promise.resolve();
    return Promise.all([worker(), worker(), worker(), worker()]); // 4 Bilder gleichzeitig
  };
  document.body.classList.add('loading');
  const stills = $$('.ex-still, .cy-still').map(img => new Promise(res => {
    if (img.complete && img.naturalWidth) return res();
    img.addEventListener('load', res, { once: true });
    img.addEventListener('error', res, { once: true });
    setTimeout(res, 6000);
  }));
  Promise.race([Promise.all([...vids.map((v, i) => useSeq && v.dataset.seq ? loadSeq(v, i) : loadVideo(v, i)), ...stills]), new Promise(r => setTimeout(r, 25000))]).then(start);

  /* Video weich auf eine Zielzeit spulen */
  function scrubber(v) {
    if (v._seq) { // Bildfolge: Zielbild weich anfahren
      const sq = v._seq; let target = 0, cur = 0;
      gsap.ticker.add(() => { cur += (target - cur) * 0.3; seqDraw(sq, cur); });
      return p => { target = Math.max(0, Math.min(1, p)) * (sq.n - 1); };
    }
    let target = 0, cur = 0;
    gsap.ticker.add(() => {
      if (!v.duration) return;
      cur += (target - cur) * 0.3;
      if (Math.abs(v.currentTime - cur) > 0.012) { try { v.currentTime = cur; } catch (e) {} }
    });
    return p => { if (v.duration) target = Math.max(0, Math.min(v.duration - 0.05, p * v.duration)); };
  }

  /* Text in Wörter splitten (Masken für Überschriften) */
  function splitWords(el) {
    const walk = node => {
      [...node.childNodes].forEach(ch => {
        if (ch.nodeType === 3) {
          const frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const i = document.createElement('span'); i.textContent = part;
            w.appendChild(i); frag.appendChild(w);
          });
          ch.replaceWith(frag);
        } else if (ch.nodeType === 1 && ch.tagName !== 'BR') walk(ch);
      });
    };
    walk(el);
    return $$('.w > span', el);
  }

  /* ---------- Erklärvideo im Hero: startet erst auf Klick, dann mit Ton ---------- */
  function heroVideo() {
    const v = $('#heroVideo'), btn = $('#heroPlay'), bar = $('#heroBar'), frame = $('#heroFrame');
    if (!v) return;
    v.src = v.dataset.hero + (mobile() ? '_m.mp4' : '.mp4');
    const setPlaying = on => frame.classList.toggle('playing', on);
    const play = () => { v.muted = false; const p = v.play(); if (p) p.catch(() => setPlaying(false)); };
    btn.addEventListener('click', () => { if (v.ended) v.currentTime = 0; play(); });
    v.addEventListener('click', () => { if (v.paused) play(); else v.pause(); });
    v.addEventListener('play', () => setPlaying(true));
    v.addEventListener('pause', () => setPlaying(false));
    v.addEventListener('ended', () => { setPlaying(false); bar.style.transform = 'scaleX(0)'; v.load(); }); // zurück zum Startbild
    new IntersectionObserver(([e]) => { if (!e.isIntersecting && !v.paused) v.pause(); }, { threshold: 0 }).observe(v);
    const tick = () => { if (v.duration && !v.paused) bar.style.transform = `scaleX(${v.currentTime / v.duration})`; requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }

  function start() {
    $('#loader').classList.add('done');
    document.body.classList.remove('loading');
    heroVideo();

    if (!window.gsap || !window.ScrollTrigger || reduce) {
      document.body.classList.add('no-motion');
      $$('[data-count]').forEach(countUp);
      $$('.step').forEach(s => s.classList.add('active'));
      $$('.sv')[0].classList.add('active');
      $$('.ex-labels li, #exFlow, .cy-step').forEach(el => { el.style.opacity = 1; el.style.visibility = 'visible'; });
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    /* ---------- Smooth Scroll ---------- */
    if (window.Lenis && fine) {
      const lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
      $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (id.length > 1 && $(id)) { e.preventDefault(); lenis.scrollTo(id, { offset: -60 }); }
      }));
    }

    /* ---------- Hero Intro ---------- */
    const heroH = $('.hero h1');
    const heroWords = splitWords(heroH);
    gsap.timeline({ defaults: { ease: 'expo.out' }, delay: .25 })
      .from('.hero .eyebrow', { opacity: 0, y: 20, duration: .8 })
      .from(heroWords, { yPercent: 120, rotate: 4, duration: 1.3, stagger: .07, onComplete: () => heroH.classList.add('done') }, '-=.5')
      .from('.hero .fade-up', { opacity: 0, y: 30, duration: 1, stagger: .12 }, '-=.9')
      .from('#heroFrame', { opacity: 0, y: 120, scale: .92, duration: 1.6 }, '-=1')
      .from('#heroPlay > *', { opacity: 0, duration: .9, stagger: .12 }, '-=.6');

    gsap.fromTo('#heroFrame', { scale: .9 }, {
      scale: 1.04, borderRadius: 12, ease: 'none',
      scrollTrigger: { trigger: '.hero-media', start: 'top 85%', end: 'bottom top', scrub: true }
    });
    if (!mobile()) gsap.to('.hero-copy', { yPercent: -30, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: '60% top', scrub: true } });

    if (fine) {
      const glow = $('#heroGlow');
      const gx = gsap.quickTo(glow, 'x', { duration: 1.2, ease: 'power3' });
      const gy = gsap.quickTo(glow, 'y', { duration: 1.2, ease: 'power3' });
      $('.hero').addEventListener('mousemove', e => { gx((e.clientX - innerWidth / 2) * .4); gy((e.clientY - 300) * .3); });
    }

    /* ---------- EXPLODE: Kasse geht auseinander, danach der Prozess ---------- */
    const exSet = scrubber($('#vExplode'));
    const exA = $('#exStillA'), exB = $('#exStillB');
    const flowLis = $$('#exFlow li');
    const exTrack = $('.ex-track'), exDot = $('.ex-dot');
    const flow = { v: 0 };
    const drawFlow = () => {
      exTrack.style.setProperty('--fill', flow.v * 100 + '%');
      exDot.style.left = flow.v * 100 + '%';
      const k = Math.round(flow.v * (flowLis.length - 1));
      flowLis.forEach((li, i) => li.classList.toggle('on', i <= k && flow.v > 0.01));
    };
    const exTl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '.ex-pin', start: 'top top', end: () => '+=' + (mobile() ? 2600 : 3400), pin: true, scrub: true, anticipatePin: 1,
        onUpdate: s => {
          const vp = Math.min(1, s.progress / .55);
          exSet(vp);
          gsap.set('#exBar', { scaleY: s.progress });
          /* Steht das Bild still, zeigt die Seite das 4K-Standbild statt des Videos */
          exA.style.opacity = Math.max(0, 1 - vp / .04);
          exB.style.opacity = Math.min(1, Math.max(0, (vp - .96) / .04));
        }
      }
    });
    exTl.fromTo('#exStage', { scale: 1.08 }, { scale: 1, duration: .55 }, 0)
      .to('.ex-head', { opacity: 0, y: -40, duration: .1 }, .32);
    $$('.ex-labels li').forEach((l, i) => {
      const dx = l.classList.contains('l') ? 24 : -24;
      exTl.fromTo(l, { opacity: 0, x: dx }, { opacity: 1, x: 0, duration: .05, ease: 'power2.out' }, .52 + i * .03);
    });
    exTl.to('.ex-labels li', { opacity: 0, duration: .04 }, .76)
      .to('.ex-media', { filter: 'brightness(.45) saturate(.8)', duration: .06 }, .76)
      .to('#exStage', { scale: .94, duration: .1 }, .76)
      .fromTo('#exFlow', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .05, ease: 'power2.out' }, .8)
      .to(flow, { v: 1, duration: .16, onUpdate: drawFlow }, .83)
      .to({}, { duration: .01 }, .99);

    /* ---------- Statement Wort für Wort ---------- */
    $$('.reveal-words').forEach(el => {
      el.innerHTML = el.textContent.trim().split(/\s+/).map(w => `<span class="rw">${w}</span>`).join(' ');
      gsap.to($$('.rw', el), { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true } });
    });

    /* ---------- Überschriften und Inhalte ---------- */
    $$('.split').forEach(el => {
      if (el.closest('.hero')) return;
      const words = splitWords(el);
      gsap.from(words, { yPercent: 120, rotate: 3, duration: 1.2, stagger: .06, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%' }, onComplete: () => el.classList.add('done') });
    });
    $$('.fade-up').forEach(el => {
      if (el.closest('.hero')) return;
      gsap.from(el, { opacity: 0, y: 50, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    $$('.eyebrow').forEach(el => {
      if (el.closest('.hero') || el.closest('.cy-pin') || el.closest('.ex-pin')) return;
      gsap.from(el, { opacity: 0, x: -20, duration: .9, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
    });

    const batch = (sel, vars = {}) => ScrollTrigger.batch(sel, {
      start: 'top 90%',
      onEnter: els => gsap.fromTo(els, { opacity: 0, y: 70, scale: .96 }, { opacity: 1, y: 0, scale: 1, duration: 1.1, stagger: .1, ease: 'expo.out', overwrite: true, ...vars })
    });
    gsap.set('.pcard, .ncard, .b, .pay-pills span, .quote, .ch', { opacity: 0 });
    batch('.pcard'); batch('.ncard'); batch('.b'); batch('.quote'); batch('.ch');
    batch('.pay-pills span', { stagger: .05 });
    gsap.from('.cl-row', { opacity: 0, x: -30, duration: .8, stagger: .05, ease: 'expo.out', scrollTrigger: { trigger: '.cloud-list', start: 'top 80%' } });
    gsap.from('.tab', { opacity: 0, y: 20, duration: .8, stagger: .05, ease: 'expo.out', scrollTrigger: { trigger: '.tabs', start: 'top 90%' } });

    /* ---------- SMART Story ---------- */
    const steps = $$('.step'), svs = $$('.sv'), bars = $$('.sv-progress i');
    const setStep = i => {
      steps.forEach((s, k) => s.classList.toggle('active', k === i));
      svs.forEach((s, k) => s.classList.toggle('active', k <= i));
      bars.forEach((b, k) => b.classList.toggle('on', k <= i));
    };
    setStep(0);
    const mark = mobile() ? '85%' : '55%';
    steps.forEach((s, i) => ScrollTrigger.create({ trigger: s, start: 'top ' + mark, end: 'bottom ' + mark, onToggle: self => self.isActive && setStep(i) }));
    steps.forEach(s => gsap.from($$('.mini li', s), { opacity: 0, x: -20, stagger: .08, duration: .7, ease: 'expo.out', scrollTrigger: { trigger: s, start: 'top 60%' } }));

    /* ---------- Zahlen ---------- */
    $$('.stats [data-count]').forEach(el => ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => countUp(el) }));
    gsap.from('.stat', { opacity: 0, y: 60, stagger: .12, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.stat-grid', start: 'top 85%' } });
    gsap.to('.stats-glow', { x: -500, y: 300, scale: 1.3, ease: 'none', scrollTrigger: { trigger: '.stats', start: 'top bottom', end: 'bottom top', scrub: true } });

    /* ---------- KREISLAUF: Kamerafahrt von Station zu Station ---------- */
    const cySet = scrubber($('#vCycle'));
    const cyStill = $('#cyStill');
    const box = () => { const W = Math.max(innerWidth, innerHeight * 16 / 9); return { W, H: W * 9 / 16 }; };
    const cam = k => {
      const { W, H } = box();
      const m = mobile();
      const base = m ? innerWidth / (W * .78) : 1; // Handy: ganzer Ring passt in die Breite
      const last = k === cySteps.length - 1;
      if (k < 0) return { x: m ? 0 : innerWidth * .14, y: m ? innerHeight * .2 : 0, scale: m ? base : .9 };
      const st = cySteps[k];
      const px = +st.dataset.x, py = +st.dataset.y;
      const s = m ? base * (last ? 1.05 : 2.4) : (last ? 1.05 : 1.55);
      const tx = m ? 0 : innerWidth * .2, ty = m ? -innerHeight * (last ? .1 : .16) : 0;
      return { x: tx - s * (px - 50) / 100 * W, y: ty - s * (py - 50) / 100 * H, scale: s };
    };
    const HOLD = .6, MOVE = 1, SEG = HOLD + MOVE;
    let cyActive = -2;
    const setCy = k => {
      if (k === cyActive) return;
      cyActive = k;
      cySteps.forEach((s, i) => {
        if (i === k) gsap.fromTo(s, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .6, ease: 'expo.out', overwrite: true });
        else gsap.to(s, { autoAlpha: 0, y: -20, duration: .3, overwrite: true });
      });
      pins.forEach((p, i) => p.classList.toggle('on', i === k || (k === cySteps.length - 1)));
      const n = Math.max(0, k + 1);
      $('#cyFill').style.strokeDashoffset = 314.16 * (1 - n / cySteps.length);
      $('#cyNum').textContent = String(n).padStart(2, '0');
    };
    const cyTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.cy-pin', start: 'top top', end: () => '+=' + (mobile() ? 4600 : 6400), pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: s => cySet(s.progress)
      },
      /* Text folgt der Kamera, nicht dem Scrollrad (scrub zieht weich nach) */
      onUpdate: () => {
        const t = cyTl.time();
        setCy(t < HOLD + MOVE / 2 ? -1 : Math.min(cySteps.length - 1, Math.floor((t - HOLD - MOVE / 2) / SEG)));
        const sc = gsap.getProperty(cyZoom, 'scale') || 1;
        cyZoom.style.setProperty('--inv', (1 / sc).toFixed(3));
        cyStill.style.opacity = Math.min(1, Math.max(0, (sc - (mobile() ? cam(-1).scale * 1.15 : 1.08)) / .3));
      }
    });
    cyTl.set(cyZoom, { x: () => cam(-1).x, y: () => cam(-1).y, scale: () => cam(-1).scale }, 0);
    cyTl.to('#cyIntro', { autoAlpha: 0, x: -40, duration: .5 }, HOLD);
    cyTl.to('.cy-veil', { opacity: () => mobile() ? 0 : .5, duration: .5 }, HOLD);
    cySteps.forEach((_, k) => {
      cyTl.to(cyZoom, { x: () => cam(k).x, y: () => cam(k).y, scale: () => cam(k).scale, duration: MOVE, ease: 'power2.inOut' }, HOLD + k * SEG);
    });
    cyTl.to({}, { duration: HOLD }, HOLD + cySteps.length * SEG - HOLD);
    gsap.set(cyZoom, { x: cam(-1).x, y: cam(-1).y, scale: cam(-1).scale });
    cyZoom.style.setProperty('--inv', (1 / cam(-1).scale).toFixed(3));
    setCy(-1);

    /* ---------- STORIES: horizontale Timeline (Nachbau der Hyperiux-Komponente) ---------- */
    const jr = $('.journey'), jrSlider = $('#jrSlider');
    const jrDist = () => Math.max(0, jrSlider.scrollWidth - innerWidth);
    const sizeJourney = () => { jr.style.height = (innerHeight + jrDist() * 1.12) + 'px'; };
    sizeJourney();
    const jrTween = gsap.to(jrSlider, {
      x: () => -jrDist(), ease: 'none',
      scrollTrigger: { trigger: jr, start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true, onRefreshInit: sizeJourney }
    });
    gsap.fromTo('#jrLine', { width: 0 }, { width: '98%', ease: 'none', scrollTrigger: { trigger: jr, start: 'top 30%', end: 'bottom bottom', scrub: true } });
    const jrTitle = $('.jr-title');
    gsap.from(splitWords(jrTitle), { yPercent: 120, rotate: 3, duration: 1.1, stagger: .06, ease: 'expo.out', scrollTrigger: { trigger: jr, start: 'top 70%' }, onComplete: () => jrTitle.classList.add('done') });
    $$('.jr-item').forEach(item => {
      const top = !!item.closest('.jr-top');
      const st = { trigger: item, containerAnimation: jrTween, start: 'left 88%', end: 'left 45%', scrub: true };
      gsap.timeline({ scrollTrigger: st, defaults: { ease: 'none' } })
        .fromTo($('.jr-sline', item), { scaleY: 0 }, { scaleY: 1, duration: .45 }, 0)
        .fromTo($('.jr-sdot', item), { scale: 0 }, { scale: 1, duration: .25, ease: 'back.out(2)' }, top ? 0 : .35)
        .fromTo($$('.jr-txt > *', item), { y: 46, opacity: 0 }, { y: 0, opacity: 1, duration: .5, stagger: .08, ease: 'power2.out' }, .2);
    });
    gsap.fromTo('.jr-img img', { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: jr, start: 'top bottom', end: 'top top', scrub: true } });

    /* ---------- Parallax und Masken ---------- */
    $$('.parallax').forEach(img => gsap.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
    $$('.ncard.big img').forEach(img => gsap.fromTo(img, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: img, start: 'top 95%' } }));
    gsap.fromTo('.service-img', { clipPath: 'inset(12% 12% 12% 12% round 36px)' }, { clipPath: 'inset(0% 0% 0% 0% round 36px)', ease: 'none', scrollTrigger: { trigger: '.service', start: 'top 85%', end: 'center center', scrub: true } });
    gsap.fromTo('.tab-stage', { clipPath: 'inset(8% 6% 8% 6% round 36px)' }, { clipPath: 'inset(0% 0% 0% 0% round 36px)', ease: 'none', scrollTrigger: { trigger: '.tab-stage', start: 'top 95%', end: 'top 35%', scrub: true } });
    gsap.fromTo('.final-glow', { scale: .5, yPercent: 30 }, { scale: 1.2, yPercent: -30, ease: 'none', scrollTrigger: { trigger: '.final', start: 'top bottom', end: 'bottom top', scrub: true } });

    /* ---------- Magnetische Buttons ---------- */
    if (fine) $$('.magnetic').forEach(b => {
      const xT = gsap.quickTo(b, 'x', { duration: .6, ease: 'elastic.out(1,.4)' });
      const yT = gsap.quickTo(b, 'y', { duration: .6, ease: 'elastic.out(1,.4)' });
      b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); xT((e.clientX - r.left - r.width / 2) * .25); yT((e.clientY - r.top - r.height / 2) * .35); });
      b.addEventListener('mouseleave', () => { xT(0); yT(0); });
    });

    onScroll();
    ScrollTrigger.refresh();
    addEventListener('load', () => ScrollTrigger.refresh());
  }
})();
