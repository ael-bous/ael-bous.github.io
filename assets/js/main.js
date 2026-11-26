// Surface / Source · interaction layer.
// GSAP + ScrollTrigger + SplitText + Lenis are loaded (deferred) before this module.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
const fineMQ = matchMedia('(hover: hover) and (pointer: fine)');
const desktopMQ = matchMedia('(min-width: 1024px)');
const reduce = reduceMQ.matches;
const { gsap, ScrollTrigger, SplitText, Lenis } = window;
const hasGsap = !!(gsap && ScrollTrigger);
if (!hasGsap) root.classList.remove('motion');
const motion = hasGsap && !reduce;
const lang = root.lang;
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (!location.hash) scrollTo(0, 0);

/* ---------- text scramble (adapted from Uberdesigner's text-scramble effect) ---------- */
const hashRand = (a, b = 0) => {
  let h = Math.imul(a + 2654435769, 2246822507) ^ Math.imul(b + 668265263, 3266489909);
  h = Math.imul(h ^ (h >>> 15), 739982445);
  h = Math.imul(h ^ (h >>> 12), 695872825);
  return ((h ^ (h >>> 15)) >>> 0) / 4294967295;
};
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/';
function scramble(el, text = el.dataset.text || el.textContent, { dur = 0.42, stagger = 0.028 } = {}) {
  if (reduce) { el.textContent = text; return; }
  el.dataset.text = text;
  cancelAnimationFrame(el._scr);
  const chars = [...text];
  const t0 = performance.now();
  const total = (chars.length - 1) * stagger + dur;
  const tick = (now) => {
    const t = (now - t0) / 1000;
    const frame = Math.floor(t * 30);
    el.textContent = chars.map((c, i) => (t >= i * stagger + dur || c === ' ' ? c : GLYPHS[Math.floor(hashRand(i, frame) * GLYPHS.length)])).join('');
    if (t < total) el._scr = requestAnimationFrame(tick);
    else el.textContent = text;
  };
  el._scr = requestAnimationFrame(tick);
}

/* ---------- clock ---------- */
const clock = $('[data-clock]');
if (clock) {
  const fmt = new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', { timeZone: 'Africa/Casablanca', hour: '2-digit', minute: '2-digit' });
  const tickClock = () => { clock.textContent = fmt.format(new Date()); };
  tickClock();
  setInterval(tickClock, 15000);
}

/* ---------- smooth scroll ---------- */
let lenis = null;
if (motion && Lenis) {
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
function scrollToTarget(target) {
  if (!target) return;
  if (lenis) lenis.scrollTo(target, { offset: target.id === 'top' ? 0 : 0, duration: 1.2 });
  else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a || a.matches('.skip')) return;
  const id = a.getAttribute('href').slice(1);
  const target = id ? document.getElementById(id) : null;
  if (!target) return;
  e.preventDefault();
  closeMenu();
  scrollToTarget(target);
  history.replaceState(null, '', id === 'top' ? location.pathname : '#' + id);
});

/* ---------- nav: ground colour, scrolled state, current section ---------- */
const nav = $('[data-nav]');
const grounds = $$('[data-ground]');
const updateNav = () => {
  const y = (nav?.offsetHeight || 60) / 2;
  let on = 'ink';
  for (const g of grounds) {
    const r = g.getBoundingClientRect();
    if (r.top <= y && r.bottom >= y) on = g.dataset.ground; // last (innermost) match wins
  }
  nav.dataset.on = on;
  nav.classList.toggle('is-scrolled', window.scrollY > 40);
};
let navRaf = 0;
const onScroll = () => { if (!navRaf) navRaf = requestAnimationFrame(() => { navRaf = 0; updateNav(); }); };
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', onScroll);
updateNav();

const navLinks = $$('.nav__links a');
const io = new IntersectionObserver((entries) => {
  for (const en of entries) if (en.isIntersecting) navLinks.forEach((l) => l.setAttribute('aria-current', l.dataset.link === en.target.id ? 'true' : 'false'));
}, { rootMargin: '-45% 0px -50% 0px' });
['top', 'work', 'expertise', 'path', 'contact'].forEach((id) => { const s = document.getElementById(id); if (s) io.observe(s); });

if (fineMQ.matches) $$('.nav__label').forEach((l) => l.parentElement.addEventListener('pointerenter', () => scramble(l)));

/* language switch keeps the reader's place */
$$('[data-lang-switch], .menu__foot a[hreflang]').forEach((a) => a.addEventListener('click', () => {
  const current = navLinks.find((l) => l.getAttribute('aria-current') === 'true');
  if (current && current.dataset.link !== 'top') a.href = a.getAttribute('href').split('#')[0] + '#' + current.dataset.link;
}));

/* ---------- mobile menu ---------- */
const menu = $('[data-menu]');
const menuBtn = $('[data-menu-open]');
const menuLabel = $('[data-menu-label]');
function openMenu() {
  menu.hidden = false;
  menuBtn.setAttribute('aria-expanded', 'true');
  menuLabel.textContent = lang === 'fr' ? 'Fermer' : 'Close';
  lenis?.stop();
  document.body.style.overflow = 'hidden';
  if (motion) gsap.fromTo($$('li a', menu), { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'expo.out' });
  $('a', menu).focus();
}
function closeMenu() {
  if (!menu || menu.hidden) return;
  menu.hidden = true;
  menuBtn.setAttribute('aria-expanded', 'false');
  menuLabel.textContent = 'Menu';
  lenis?.start();
  document.body.style.overflow = '';
}
menuBtn?.addEventListener('click', () => (menu.hidden ? openMenu() : (closeMenu(), menuBtn.focus())));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { closeMenu(); menuBtn.focus(); } });
desktopMQ.addEventListener('change', (e) => e.matches && closeMenu());

/* ---------- hero: entrance ---------- */
const hero = $('[data-hero]');
if (motion) {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.1 });
  tl.fromTo('.hero__portrait img', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' }, 0)
    .from('.hero__portrait img', { scale: 1.12, duration: 2, ease: 'expo.out' }, 0)
    .to('.hero .ch > span', { y: 0, yPercent: 0, duration: 1.2, stagger: { each: 0.035, from: 'start' } }, 0.45)
    .to('.hero [data-enter]', { opacity: 1, y: 0, duration: 0.9, stagger: 0.08 }, 0.9)
    .from('.hero__toggle', { opacity: 0, duration: 0.6, ease: 'power2.out' }, 1.2);
  // the width-axis morph relays the text out every frame, so it is kept for large, fine-pointer screens
  if (fineMQ.matches && desktopMQ.matches) tl.fromTo('.hero__row--a', { '--wa': 72 }, { '--wa': 125, duration: 1.8, ease: 'expo.out' }, 0.45);
}

/* ---------- hero: the source lens ---------- */
const source = $('.hero__source', hero);
const toggle = $('[data-source-toggle]', hero);
const toggleLabel = $('[data-toggle-label]', toggle);
const hint = $('[data-lens-hint]', hero);
const lens = { x: 0, y: 0, r: 0, tx: 0, ty: 0, tr: 0, vx: 0, vy: 0, vr: 0, raf: 0, full: false };
const setClip = () => { source.style.clipPath = `circle(${lens.r.toFixed(1)}px at ${lens.x.toFixed(1)}px ${lens.y.toFixed(1)}px)`; source.style.visibility = lens.r > 0.5 ? 'visible' : 'hidden'; };
function lensLoop() {
  // critically-damped spring toward the pointer: it trails the hand a little, never overshoots
  const k = 0.16, d = 0.72;
  lens.vx = (lens.vx + (lens.tx - lens.x) * k) * d; lens.x += lens.vx;
  lens.vy = (lens.vy + (lens.ty - lens.y) * k) * d; lens.y += lens.vy;
  lens.vr = (lens.vr + (lens.tr - lens.r) * 0.12) * 0.7; lens.r += lens.vr;
  if (lens.r < 0.5 && lens.tr === 0) lens.r = 0;
  setClip();
  const settled = Math.abs(lens.tx - lens.x) < 0.3 && Math.abs(lens.ty - lens.y) < 0.3 && Math.abs(lens.tr - lens.r) < 0.3;
  lens.raf = settled ? 0 : requestAnimationFrame(lensLoop);
}
const kick = () => { if (!lens.raf) lens.raf = requestAnimationFrame(lensLoop); };
let hintShown = false;
try { hintShown = sessionStorage.getItem('lens-hint') === '1'; } catch { /* storage blocked */ }
if (fineMQ.matches && hero) {
  hero.addEventListener('pointermove', (e) => {
    if (lens.full) return;
    const r = hero.getBoundingClientRect();
    lens.tx = e.clientX - r.left; lens.ty = e.clientY - r.top;
    const overUI = e.target.closest('.hero__toggle, a, button');
    lens.tr = overUI ? 0 : Math.min(190, Math.max(120, r.width * 0.1));
    if (lens.r === 0 && lens.raf === 0) { lens.x = lens.tx; lens.y = lens.ty; }
    if (reduce) { lens.x = lens.tx; lens.y = lens.ty; lens.r = lens.tr; setClip(); } else kick();
    if (!hintShown && hint) {
      hint.style.setProperty('--hx', `${lens.tx + 22}px`); hint.style.setProperty('--hy', `${lens.ty + 22}px`);
      hint.classList.add('is-on'); hero.classList.add('is-lens');
      clearTimeout(hint._t);
      hint._t = setTimeout(() => { hint.classList.remove('is-on'); hintShown = true; try { sessionStorage.setItem('lens-hint', '1'); } catch { /* */ } }, 2600);
    }
  });
  hero.addEventListener('pointerleave', () => { if (lens.full) return; lens.tr = 0; reduce ? (lens.r = 0, setClip()) : kick(); hint?.classList.remove('is-on'); });
}
toggle?.addEventListener('click', () => {
  const on = toggle.getAttribute('aria-pressed') !== 'true';
  toggle.setAttribute('aria-pressed', String(on));
  scramble(toggleLabel, on ? toggle.dataset.on : toggle.dataset.off);
  cancelAnimationFrame(lens.raf); lens.raf = 0;
  const hr = hero.getBoundingClientRect();
  const br = toggle.getBoundingClientRect();
  const cx = br.left + br.width / 2 - hr.left, cy = br.top + br.height / 2 - hr.top;
  const cover = Math.hypot(Math.max(cx, hr.width - cx), Math.max(cy, hr.height - cy));
  lens.full = on;
  if (on) { lens.x = cx; lens.y = cy; }
  const to = { r: on ? cover : 0 };
  if (reduce || !hasGsap) { lens.r = to.r; setClip(); return; }
  gsap.to(lens, { ...to, duration: on ? 0.9 : 0.55, ease: on ? 'expo.inOut' : 'expo.out', onUpdate: setClip, onComplete: () => { lens.tr = 0; lens.vr = 0; } });
});

/* ---------- hero name: the second row widens (variable wdth axis) to span the full width ---------- */
const rowB = $('.hero__row--b');
if (rowB) {
  const inkWidth = () => { const c = rowB.children; return c[c.length - 1].getBoundingClientRect().right - c[0].getBoundingClientRect().left; };
  const measure = (w) => { rowB.style.setProperty('--wb', w); return inkWidth(); };
  const fitName = () => {
    if (!desktopMQ.matches) { rowB.style.removeProperty('--wb'); return; } // mobile keeps its own sizing
    const target = rowB.clientWidth;
    let lo = 62, hi = 125;
    if (measure(hi) <= target) return; // even the widest cut fits: keep it
    if (measure(lo) >= target) return; // already full at the narrowest cut
    for (let i = 0; i < 7; i++) { const mid = (lo + hi) / 2; if (measure(mid) > target) hi = mid; else lo = mid; }
    rowB.style.setProperty('--wb', lo.toFixed(2));
  };
  // on wide screens the first row ends early: centre the portrait in the space it leaves on the right
  const hero = $('.hero');
  const rowA = $('.hero__row--a');
  const placePortrait = () => {
    hero.style.removeProperty('--pl');
    if (!desktopMQ.matches) return;
    const c = rowA.children, W = hero.clientWidth;
    const prev = rowA.style.getPropertyValue('--wa'); // measure at the final width, even mid-intro
    rowA.style.setProperty('--wa', 125);
    const aEnd = c[c.length - 1].getBoundingClientRect().right - hero.getBoundingClientRect().left;
    if (prev) rowA.style.setProperty('--wa', prev); else rowA.style.removeProperty('--wa');
    const pw = $('.hero__portrait').offsetWidth;
    const free = W - aEnd;
    if (free < pw * 0.9) return; // the name already fills the width: keep the default placement
    const center = Math.max(W * 0.6, (aEnd + W) / 2);
    hero.style.setProperty('--pl', `${Math.round(center - pw / 2)}px`);
  };
  const fitAll = () => { fitName(); placePortrait(); };
  let fitT = 0;
  fitAll();
  document.fonts?.ready.then(fitAll);
  addEventListener('resize', () => { clearTimeout(fitT); fitT = setTimeout(fitAll, 120); });
}

/* ---------- halftone field (WebGL2), loaded only near the manifesto ---------- */
const field = $('[data-field]');
if (field) {
  const near = new IntersectionObserver(async ([en]) => {
    if (!en.isIntersecting) return;
    near.disconnect();
    try { const { initField } = await import('./halftone.js'); initField(field, { still: reduce }); } catch { /* CSS dots stay */ }
  }, desktopMQ.matches ? { rootMargin: '25% 0px' } : { threshold: 0.05 });
  // never compete with the first paint: start watching once the page has loaded
  const watch = () => near.observe(field);
  if (document.readyState === 'complete') watch(); else addEventListener('load', watch, { once: true });
}

/* ---------- scroll choreography (built once the page has loaded, off the startup path) ---------- */
function initScroll() {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  // manifesto: words light up as the statement is read
  const words = $('[data-words]');
  if (words) {
    const split = SplitText.create(words, { type: 'words', wordsClass: 'w' });
    // overlapping word fades read as one wave; each key word draws its rule once it is lit
    const tl = gsap.timeline({ scrollTrigger: { trigger: '.manifesto', start: 'top 85%', end: 'center 40%', scrub: 0.6 } });
    const STEP = 0.32;
    tl.fromTo(split.words, { opacity: 0.2, filter: 'blur(3px)' }, { opacity: 1, filter: 'blur(0px)', duration: 1, stagger: STEP, ease: 'power1.out' }, 0);
    $$('.kw', words).forEach((kw) => {
      const last = split.words.indexOf($$('.w', kw).pop());
      tl.fromTo(kw, { '--kw': 0 }, { '--kw': 1, duration: 1.2, ease: 'power2.inOut' }, last * STEP + 0.4);
    });
    tl.from('.manifesto__aside span', { opacity: 0, y: 12, duration: 1, stagger: 0.25, ease: 'power2.out' }, split.words.length * STEP * 0.7);
  }

  // headings rise out of their own line masks
  $$('[data-reveal]').forEach((el) => {
    SplitText.create(el, { type: 'lines', mask: 'lines', autoSplit: true, aria: 'none', onSplit: (s) => gsap.from(s.lines, { yPercent: 105, duration: 1.1, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 86%', once: true } }) });
  });

  // labels decode as they arrive
  $$('.label').forEach((l) => {
    const text = l.lastChild;
    if (!text || text.nodeType !== 3) return;
    const span = document.createElement('span'); span.textContent = text.textContent; l.replaceChild(span, text);
    ScrollTrigger.create({ trigger: l, start: 'top 90%', once: true, onEnter: () => scramble(span) });
  });

  gsap.utils.toArray('.meta > div, .map__row, .case, .langs > div').forEach((el) => {
    gsap.from(el, { opacity: 0, y: 16, duration: 0.8, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });

  // the site chapter: pinned, each step wipes in its screen
  const mm = gsap.matchMedia();
  mm.add('(min-width: 1024px)', () => {
    const chapter = $('[data-chapter]');
    const screens = $$('.chapter__stage .screen');
    const steps = $$('.steps .step');
    const counter = $('[data-stage-n]');
    const list = $('.steps');
    list.classList.add('is-tracking');
    let current = -1;
    const setActive = (i) => {
      if (i === current) return; current = i;
      steps.forEach((s, j) => s.classList.toggle('is-active', j === i));
      if (counter) scramble(counter, String(i + 1).padStart(2, '0'), { dur: 0.3 });
    };
    setActive(0);
    const tl = gsap.timeline({ scrollTrigger: { trigger: chapter, start: 'top top', end: () => `+=${(screens.length - 1) * window.innerHeight * 0.6}`, pin: true, scrub: 0.6, onUpdate: (st) => setActive(Math.min(screens.length - 1, Math.round(st.progress * (screens.length - 1)))) } });
    screens.forEach((s, i) => {
      if (!i) return;
      tl.fromTo(s, { clipPath: 'inset(100% 0% 0% 0% round 12px)' }, { clipPath: 'inset(0% 0% 0% 0% round 12px)', duration: 1, ease: 'power2.inOut' }, i - 1)
        .to(screens[i - 1], { scale: 0.94, opacity: 0.4, duration: 1, ease: 'power2.inOut' }, i - 1);
    });
    return () => list.classList.remove('is-tracking');
  });

  // the paper sheet is laid over the ink
  gsap.fromTo('[data-sheet]', { clipPath: 'inset(0% 3% 0% 3% round 28px 28px 0px 0px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px 28px 0px 0px)', ease: 'none', scrollTrigger: { trigger: '[data-sheet]', start: 'top bottom', end: 'top 30%', scrub: 0.5 } });

  // the communication cycle: the ring draws itself, the marker travels with the reading
  const ring = $('.cy__ring--draw');
  const orbit = $('[data-orbit]');
  if (ring) {
    ScrollTrigger.create({ trigger: '.expertise', start: 'top 75%', end: 'top 15%', scrub: 0.6, onUpdate: (st) => ring.style.setProperty('--draw', (1 - st.progress).toFixed(4)) });
    ScrollTrigger.create({ trigger: '[data-caps]', start: 'top 70%', end: 'bottom 40%', scrub: 0.8, onUpdate: (st) => orbit?.style.setProperty('--orbit', `${(st.progress * 315).toFixed(2)}deg`) });
    gsap.from('.cy__node', { opacity: 0, scale: 0.8, transformOrigin: 'center', duration: 0.8, stagger: 0.07, ease: 'expo.out', scrollTrigger: { trigger: '.expertise', start: 'top 55%', once: true } });
  }

  // timeline rail fills with the reading
  const tlEl = $('[data-timeline]');
  if (tlEl) {
    tlEl.style.setProperty('--p', 0);
    ScrollTrigger.create({ trigger: tlEl, start: 'top 70%', end: 'bottom 60%', scrub: true, onUpdate: (st) => tlEl.style.setProperty('--p', st.progress.toFixed(3)) });
    $$('.tl', tlEl).forEach((li) => gsap.from(li, { opacity: 0, x: 24, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: li, start: 'top 85%', once: true } }));
  }

  // a case study opening or closing changes the page height: re-measure the triggers below it
  let caseRefresh = 0;
  $$('.case details').forEach((d) => d.addEventListener('toggle', () => { clearTimeout(caseRefresh); caseRefresh = setTimeout(() => ScrollTrigger.refresh(), 60); }));

  document.fonts?.ready.then(() => { ScrollTrigger.refresh(); updateNav(); });
  if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) setTimeout(() => lenis ? lenis.scrollTo(t, { immediate: true }) : t.scrollIntoView(), 120); }
}
if (motion) {
  const idle = window.requestIdleCallback || ((f) => setTimeout(f, 200));
  const go = () => idle(initScroll, { timeout: 1200 });
  if (document.readyState === 'complete') go(); else addEventListener('load', go, { once: true });
} else if (desktopMQ.matches) {
  // no motion: the stage simply follows the step being read
  const screens = $$('.chapter__stage .screen');
  const show = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    const i = +en.target.dataset.step;
    screens.forEach((s, j) => { s.style.visibility = j === i ? 'visible' : 'hidden'; });
  }), { rootMargin: '-45% 0px -45% 0px' });
  $$('.steps .step').forEach((s) => show.observe(s));
  screens.forEach((s, j) => { s.style.visibility = j ? 'hidden' : 'visible'; });
}

/* ---------- expertise: the capability being read lights its stage on the cycle ---------- */
const cycle = $('[data-cycle]');
const caps = $$('.cap');
if (cycle && caps.length) {
  const nodes = $$('.cy__node', cycle);
  let hovered = null, inView = null;
  const paint = () => {
    const on = hovered || inView;
    caps.forEach((c) => c.classList.toggle('is-on', c === on));
    nodes.forEach((n) => n.classList.toggle('is-on', !!on && n.dataset.node === on.dataset.node));
    cycle.classList.toggle('has-active', !!on);
  };
  const capIO = new IntersectionObserver((entries) => {
    for (const en of entries) if (en.isIntersecting) inView = en.target;
    paint();
  }, { rootMargin: '-42% 0px -52% 0px' });
  caps.forEach((c) => capIO.observe(c));
  new IntersectionObserver(([en]) => { if (!en.isIntersecting) { inView = null; paint(); } }).observe($('[data-caps]'));
  if (fineMQ.matches) caps.forEach((c) => {
    c.addEventListener('pointerenter', () => { hovered = c; paint(); });
    c.addEventListener('pointerleave', () => { hovered = null; paint(); });
  });
}

/* ---------- contact: copy the address ---------- */
const copyBtn = $('[data-copy]');
copyBtn?.addEventListener('click', async () => {
  const label = $('[data-copy-label]', copyBtn);
  const original = label.dataset.text || label.textContent;
  try {
    await navigator.clipboard.writeText(copyBtn.dataset.copy);
    scramble(label, copyBtn.dataset.done);
    $('[data-copy-status]').textContent = copyBtn.dataset.done;
    setTimeout(() => { scramble(label, original); $('[data-copy-status]').textContent = ''; }, 2200);
  } catch { location.href = 'mailto:' + copyBtn.dataset.copy; }
});
