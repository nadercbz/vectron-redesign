/* Vectron Unterseiten · Menü, weiches Scrollen, Einblendungen */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;

  /* Header, Fortschritt */
  const header = $('#header'), mega = $('#mega'), prog = $('#progress');
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
  onScroll();

  /* Mega-Menü */
  const items = $$('.nav-item');
  let closeT, openedAt = 0;
  const openMenu = key => {
    clearTimeout(closeT);
    if (!mega.classList.contains('open') || !$(`.nav-item.open[data-menu="${key}"]`)) openedAt = Date.now();
    items.forEach(i => i.classList.toggle('open', i.dataset.menu === key));
    $$('.mega-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === key));
    mega.classList.add('open');
  };
  const closeMenu = () => { closeT = setTimeout(() => { mega.classList.remove('open'); items.forEach(i => i.classList.remove('open')); }, 120); };
  items.forEach(i => {
    i.addEventListener('mouseenter', () => fine && openMenu(i.dataset.menu));
    i.addEventListener('click', () => (mega.classList.contains('open') && i.classList.contains('open') && Date.now() - openedAt > 500) ? closeMenu() : openMenu(i.dataset.menu));
  });
  header.addEventListener('mouseleave', closeMenu);
  mega.addEventListener('mouseenter', () => clearTimeout(closeT));
  addEventListener('keydown', e => e.key === 'Escape' && closeMenu());
  $('#burger').addEventListener('click', () => document.body.classList.toggle('mm-open'));
  $$('#mobileMenu a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('mm-open')));

  /* Aktuelle Seite im Menü markieren */
  const here = location.pathname.split('/').pop();
  $$('#mega a, #mobileMenu a, .footer a').forEach(a => { if (a.getAttribute('href') === here) a.classList.add('current'); });

  if (!window.gsap || !window.ScrollTrigger || reduce) return;
  gsap.registerPlugin(ScrollTrigger);

  if (window.Lenis && fine) {
    const lenis = new Lenis({ duration: 1.1, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length > 1 && $(id)) { e.preventDefault(); lenis.scrollTo(id, { offset: -80 }); }
    }));
  }

  /* Überschriften Wort für Wort (Masken mit Luft, siehe style.css) */
  const split = el => {
    const walk = node => [...node.childNodes].forEach(ch => {
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
    walk(el);
    return $$('.w > span', el);
  };

  /* Hero */
  const h1 = $('.p-hero h1');
  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .from('.crumbs, .p-hero .eyebrow', { opacity: 0, y: 16, duration: .8, stagger: .08 })
    .from(split(h1), { yPercent: 120, rotate: 3, duration: 1.2, stagger: .06, onComplete: () => h1.classList.add('done') }, '-=.5')
    .from('.p-hero .fade-up', { opacity: 0, y: 30, duration: 1, stagger: .1 }, '-=.9')
    .from('.p-frame', { opacity: 0, y: 80, scale: .94, duration: 1.4 }, '-=1.1')
    .from('.p-chip', { opacity: 0, x: -20, duration: .8 }, '-=.6');
  gsap.to('.p-frame img.parallax', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '.p-hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.p-glow', { y: 200, ease: 'none', scrollTrigger: { trigger: '.p-hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* Abschnitte */
  $$('main .split').forEach(el => {
    if (el.closest('.p-hero')) return;
    const words = split(el);
    gsap.from(words, { yPercent: 120, rotate: 3, duration: 1.1, stagger: .05, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' }, onComplete: () => el.classList.add('done') });
  });
  $$('main .fade-up').forEach(el => {
    if (el.closest('.p-hero')) return;
    gsap.from(el, { opacity: 0, y: 40, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
  });
  const batch = sel => {
    gsap.set(sel, { opacity: 0 });
    ScrollTrigger.batch(sel, { start: 'top 92%', onEnter: els => gsap.fromTo(els, { opacity: 0, y: 60, scale: .97 }, { opacity: 1, y: 0, scale: 1, duration: 1, stagger: Math.min(.08, .5 / els.length), ease: "expo.out", overwrite: true }) });
  };
  ['.pc', '.faq', '.tl-row', '.gtile', '.art', '.rel', '.ch', '.checks.grid li'].forEach(s => $(s) && batch(s));
  $$('.ps-frame').forEach(f => gsap.fromTo(f, { clipPath: 'inset(10% 10% 10% 10% round 36px)' }, { clipPath: 'inset(0% 0% 0% 0% round 36px)', ease: 'none', scrollTrigger: { trigger: f, start: 'top 95%', end: 'top 40%', scrub: true } }));
  $$('.ps-frame img.parallax').forEach(img => gsap.fromTo(img, { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
  if ($('.final-glow')) gsap.fromTo('.final-glow', { scale: .5, yPercent: 30 }, { scale: 1.2, yPercent: -30, ease: 'none', scrollTrigger: { trigger: '.final', start: 'top bottom', end: 'bottom top', scrub: true } });

  if (fine) $$('.magnetic').forEach(b => {
    const xT = gsap.quickTo(b, 'x', { duration: .6, ease: 'elastic.out(1,.4)' });
    const yT = gsap.quickTo(b, 'y', { duration: .6, ease: 'elastic.out(1,.4)' });
    b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); xT((e.clientX - r.left - r.width / 2) * .25); yT((e.clientY - r.top - r.height / 2) * .35); });
    b.addEventListener('mouseleave', () => { xT(0); yT(0); });
  });
  addEventListener('load', () => ScrollTrigger.refresh());
})();
