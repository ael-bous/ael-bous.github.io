// Page templates. Plain template literals: no framework, no runtime dependency.
import { site, screens, designs } from './content.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pad = (n) => String(n).padStart(2, '0');
const arrow = '<svg class="ar" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>';
const down = '<svg class="ar" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3.5 8.5 8 13l4.5-4.5"/></svg>';
const chars = (word) => [...word].map((c) => (c === ' ' ? '<span class="ch ch--sp"> </span>' : `<span class="ch"><span>${esc(c)}</span></span>`)).join('');
const ext = 'target="_blank" rel="noopener"';

function head(t, page = 'home') {
  const url = site.url + (page === 'home' ? t.path : t.path + (t.lang === 'fr' ? 'confidentialite.html' : 'privacy.html'));
  const title = page === 'home' ? t.title : `${t.privacy.title} · ${site.name}`;
  const alt = page === 'home'
    ? `<link rel="alternate" hreflang="fr" href="${site.url}/">
<link rel="alternate" hreflang="en" href="${site.url}/en/">
<link rel="alternate" hreflang="x-default" href="${site.url}/">` : '';
  const ld = page === 'home' ? `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Person', name: site.name, url: site.url + t.path,
    image: site.url + '/img/ayoub-portrait.jpg', jobTitle: t.work.meta[0][1], email: 'mailto:' + site.email,
    worksFor: { '@type': 'Organization', name: 'Amiyas Import', url: 'https://amiyasimport.com' },
    address: { '@type': 'PostalAddress', addressLocality: 'Casablanca', addressCountry: 'MA' },
    alumniOf: [
      { '@type': 'EducationalOrganization', name: 'ISTA Hay Hassani 1 (OFPPT)' },
      { '@type': 'EducationalOrganization', name: '1337 Coding School' },
      { '@type': 'CollegeOrUniversity', name: 'Faculté des Sciences Aïn Chock' },
    ],
    knowsLanguage: ['ar', 'fr', 'en'],
    knowsAbout: ['Digital marketing', 'Meta Ads', 'Social media management', 'SEO', 'Web development', 'Laravel', 'React'],
    sameAs: [site.linkedin, site.github],
  })}</script>` : '';
  return `<!doctype html>
<html lang="${t.lang}" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(t.description)}">
<meta name="author" content="${site.name}">
<link rel="canonical" href="${url}">
${alt}
<meta property="og:type" content="profile">
<meta property="og:locale" content="${t.locale}">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(t.description)}">
<meta property="og:image" content="${site.url}/share.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0e0d0c">
<meta name="color-scheme" content="dark light">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<script>(function(d){d.classList.replace('no-js','js');if(!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('motion');setTimeout(function(){if(!window.gsap)d.classList.remove('motion')},3500)}})(document.documentElement)</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,300..900&family=JetBrains+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="/assets/css/main.css">
${ld}
</head>`;
}

function nav(t) {
  const links = [['work', t.nav.work], ['skills', t.nav.skills], ['path', t.nav.path], ['contact', t.nav.contact]];
  const fr = t.lang === 'fr';
  return `<a class="skip" href="#main">${t.skip}</a>
<header class="nav" data-nav>
  <a class="nav__brand" href="#top"><span class="nav__mark" aria-hidden="true">AEB</span><span class="nav__name">${site.name}</span></a>
  <nav class="nav__links" aria-label="${fr ? 'Principale' : 'Main'}">
    ${links.map(([id, l], i) => `<a href="#${id}" data-link="${id}"><span class="mono">${pad(i + 2)}</span><span class="nav__label" data-scramble>${l}</span></a>`).join('\n    ')}
  </nav>
  <div class="nav__aside">
    <a class="lang" href="${t.otherPath}" hreflang="${t.other}" lang="${t.other}" data-lang-switch>
      <span class="${fr ? 'is-on' : ''}">FR</span><span class="lang__sep">/</span><span class="${fr ? '' : 'is-on'}">EN</span><span class="sr"> · ${t.nav.lang}</span>
    </a>
    <span class="clock mono" title="${t.nav.time}"><span class="clock__dot" aria-hidden="true"></span>CASA <time data-clock>--:--</time></span>
    <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="menu" data-menu-open><span data-menu-label>${t.nav.menu}</span><span class="nav__burger" aria-hidden="true"></span></button>
  </div>
</header>
<div class="menu" id="menu" data-menu hidden>
  <nav aria-label="${fr ? 'Menu' : 'Menu'}">
    <ol>
      ${links.map(([id, l], i) => `<li><a href="#${id}"><span class="mono">${pad(i + 2)}</span><span class="menu__label">${l}</span></a></li>`).join('\n      ')}
    </ol>
  </nav>
  <div class="menu__foot mono"><a href="mailto:${site.email}">${site.email}</a><a href="${t.otherPath}" hreflang="${t.other}" lang="${t.other}">${t.other.toUpperCase()}</a></div>
</div>`;
}

function hero(t, ascii) {
  const p = site.portrait;
  const c = t.code;
  return `<section class="hero" id="top" data-ground="ink" data-hero aria-labelledby="hero-h">
  <div class="hero__layer hero__surface">
    <div class="hero__portrait"><img src="${p.src}" srcset="${p.srcset}" sizes="(max-width: 767px) 92vw, 82vh" width="${p.w}" height="${p.h}" alt="${esc(t.hero.portraitAlt)}" fetchpriority="high" decoding="async"></div>
    <div class="hero__intro">
      <p class="label" data-enter><span class="mono">00</span>${t.hero.index}</p>
      <p class="hero__role" data-enter><span>${t.hero.role[0]}</span><span>${t.hero.role[1]}</span></p>
      <p class="hero__line" data-enter>${esc(t.hero.line)}</p>
    </div>
    <h1 class="hero__name" id="hero-h"><span class="sr">${site.name}</span><span class="hero__rows" aria-hidden="true"><span class="hero__row hero__row--a">${chars('Ayoub')}</span><span class="hero__row hero__row--b">${chars('El Bousairi')}</span></span></h1>
    <div class="hero__meta mono" data-enter>
      <span>${t.hero.base}</span>
      <span class="hero__now"><span class="pulse" aria-hidden="true"></span>${t.hero.now}</span>
      <a class="hero__scroll" href="#work">${t.hero.scroll}${down}</a>
    </div>
  </div>
  <div class="hero__layer hero__source" aria-hidden="true">
    <pre class="ascii">${esc(ascii)}</pre>
    <div class="hero__code mono">
<span class="tk-c">/* ${esc(c.comment)} */</span>
<span class="tk-k">const</span> <span class="tk-v">ayoub</span> = {
  role:  [<span class="tk-s">${esc(c.role)}</span>],
  base:  <span class="tk-s">${esc(c.base)}</span>,
  stack: [<span class="tk-s">${esc(c.stack)}</span>],
  now:   <span class="tk-s">${esc(c.now)}</span>,
};
<span class="tk-c">${esc(c.line)}</span></div>
    <p class="hero__tag mono"><span class="tk-t">&lt;h1&gt;</span>Ayoub El Bousairi<span class="tk-t">&lt;/h1&gt;</span></p>
  </div>
  <button class="hero__toggle mono" type="button" aria-pressed="false" data-source-toggle data-on="${t.hero.surface}" data-off="${t.hero.source}"><span class="hero__toggle-ic" aria-hidden="true">&lt;/&gt;</span><span data-toggle-label>${t.hero.source}</span></button>
  <span class="lens-hint mono" aria-hidden="true" data-lens-hint>${t.hero.lensHint}</span>
</section>`;
}

function manifesto(t) {
  return `<section class="manifesto" data-ground="ink" aria-labelledby="m-h">
  <canvas class="manifesto__field" aria-hidden="true" data-field></canvas>
  <div class="wrap manifesto__inner">
    <h2 class="manifesto__text" id="m-h" data-words>${esc(t.manifesto.text)}</h2>
    <p class="manifesto__aside">${esc(t.manifesto.aside)}</p>
  </div>
</section>`;
}

function screenFigure(t, s, i, inline = false) {
  const alt = esc(t.work.screenAlt[s.key]);
  if (s.phone) {
    return `<figure class="screen screen--phones${inline ? ' screen--inline' : ''}" data-screen="${i}">
      <div class="phone"><img src="${s.src}" srcset="${s.srcset}" sizes="220px" width="${s.w}" height="${s.h}" alt="${alt}" loading="lazy" decoding="async"></div>
      <div class="phone phone--b"><img src="${s.second.src}" srcset="${s.second.srcset}" sizes="220px" width="${s.w}" height="${s.h}" alt="${esc(t.work.screenAlt.mobile2)}" loading="lazy" decoding="async"></div>
    </figure>`;
  }
  return `<figure class="screen${inline ? ' screen--inline' : ''}" data-screen="${i}"><div class="browser"><div class="browser__bar" aria-hidden="true"><i></i><i></i><i></i><span class="mono">amiyasimport.com</span></div><img src="${s.src}" srcset="${s.srcset}" sizes="(max-width: 1023px) 92vw, 54vw" width="${s.w}" height="${s.h}" alt="${alt}" loading="lazy" decoding="async"></div></figure>`;
}

function work(t) {
  const w = t.work;
  const steps = w.steps.map((st, i) => `<li class="step" data-step="${i}">
          <span class="step__n mono">${pad(i + 1)}</span>
          <div class="step__body"><h4>${esc(st.title)}</h4><p>${esc(st.text)}</p></div>
          ${screenFigure(t, screens[i], i, true)}
        </li>`).join('\n        ');
  const pieces = designs.map((d, i) => {
    const [kind, name] = w.designs[d.key];
    const small = `/img/work/${d.file}-560.webp`;
    const big = `/img/work/${d.file}-1100.webp`;
    if (d.kind !== 'image') return ''; // future media kinds render here (see README)
    return `<figure class="piece piece--${d.size} p${i + 1}" data-piece style="--ar:${d.w}/${d.h}">
        <button class="piece__open" type="button" data-open="${big}" data-w="${d.w}" data-h="${d.h}" data-caption="${esc(kind + ' · ' + name)}" data-alt="${esc(w.alt[d.key])}" aria-label="${esc(w.open + ' : ' + name)}">
          <img src="${small}" srcset="${small} 560w, ${big} 1100w" sizes="(max-width: 767px) 92vw, (max-width: 1023px) 46vw, 40vw" width="${d.w}" height="${d.h}" alt="${esc(w.alt[d.key])}" loading="lazy" decoding="async">
        </button>
        <figcaption><span class="mono">Fig. ${pad(i + 1)}</span><span class="piece__kind">${esc(kind)}</span><span class="piece__name">${esc(name)}</span></figcaption>
      </figure>`;
  }).join('\n      ');
  return `<section class="work" id="work" data-ground="ink" aria-labelledby="work-h">
  <div class="wrap work__head">
    <h2 class="work__title" id="work-h" data-reveal>${w.title}</h2>
    <p class="work__kicker mono">${esc(w.kicker)}</p>
    <div class="work__intro">
      <p class="lead" data-reveal>${esc(w.intro)}</p>
      <dl class="meta">${w.meta.map(([k, v]) => `<div><dt class="mono">${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      <a class="link" href="https://amiyasimport.com" ${ext}>${w.visit}${arrow}</a>
    </div>
  </div>

  <div class="chapter chapter--source" data-chapter>
    <div class="wrap chapter__grid">
      <div class="chapter__text">
        <h3 class="chapter__title"><span class="tag mono">&lt;/&gt; ${w.sourceLabel}</span>${w.sourceTitle}</h3>
        <ol class="steps">
        ${steps}
        </ol>
      </div>
      <div class="chapter__stage" aria-hidden="true">
        <div class="stage">
          ${screens.map((s, i) => screenFigure(t, s, i)).join('\n          ')}
          <div class="stage__progress mono"><span data-stage-n>01</span> / ${pad(screens.length)}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="chapter chapter--surface" data-ground="paper" data-sheet>
    <div class="wrap">
      <div class="surface__head">
        <h3 class="chapter__title"><span class="tag mono">◎ ${w.surfaceLabel}</span>${w.surfaceTitle}</h3>
        <p class="lead">${esc(w.surfaceIntro)}</p>
        <ul class="channels mono" aria-label="${t.lang === 'fr' ? 'Canaux' : 'Channels'}">${w.channels.map((c) => `<li>${c}</li>`).join('')}</ul>
      </div>
      <div class="gallery">
      ${pieces}
      </div>
    </div>
  </div>
</section>`;
}

function skills(t) {
  const col = (c, mark) => `<div class="skills__col">
      <h3 class="skills__label"><span class="tag mono">${mark} ${c.label}</span>${c.title}</h3>
      <ul class="rows">
        ${c.items.map(([n, d], i) => `<li class="row"><span class="row__n mono">${pad(i + 1)}</span><span class="row__name">${esc(n)}</span><span class="row__detail">${esc(d)}</span></li>`).join('\n        ')}
      </ul>
    </div>`;
  return `<section class="skills" id="skills" data-ground="ink" aria-labelledby="skills-h">
  <div class="wrap">
    <h2 class="section-title" id="skills-h" data-reveal>${t.skills.title}</h2>
    <div class="skills__cols">
    ${col(t.skills.surface, '◎')}
    ${col(t.skills.source, '&lt;/&gt;')}
    </div>
  </div>
</section>`;
}

function path(t) {
  const p = t.path;
  return `<section class="path" id="path" data-ground="ink" aria-labelledby="path-h">
  <div class="wrap">
    <h2 class="section-title" id="path-h" data-reveal>${p.title}</h2>
    <div class="path__grid">
      <ol class="timeline" data-timeline>
        ${p.items.map((it, i) => `<li class="tl tl--${it.type}">
          <span class="tl__year mono">${it.year}</span>
          <span class="tl__node" aria-hidden="true"></span>
          <div class="tl__body">
            <p class="tl__type mono">${p.types[it.type]}${i < 2 ? ` · <span class="tl__now">${p.now}</span>` : ''}</p>
            <h3>${esc(it.title)}</h3>
            <p class="tl__org">${esc(it.org)}</p>
            <p class="tl__text">${esc(it.text)}</p>
          </div>
        </li>`).join('\n        ')}
      </ol>
      <aside class="path__aside">
        <h3 class="mono">${p.langsTitle}</h3>
        <dl class="langs">${p.langs.map(([l, v]) => `<div><dt>${l}</dt><dd class="mono">${v}</dd></div>`).join('')}</dl>
        <a class="link" href="/${site.cv}" download>${p.cv}${down}</a>
      </aside>
    </div>
  </div>
</section>`;
}

function contact(t) {
  const c = t.contact;
  const privacy = t.lang === 'fr' ? '/confidentialite.html' : '/en/privacy.html';
  return `<section class="contact" id="contact" data-ground="signal" aria-labelledby="contact-h">
  <div class="wrap">
    <h2 class="contact__title" id="contact-h"><span>${c.title[0]}</span><span>${c.title[1]}</span></h2>
    <div class="contact__grid">
      <p class="contact__text">${esc(c.text)}</p>
      <div class="contact__mail">
        <a class="mail" href="mailto:${site.email}" data-magnetic>${site.email.replace('@', '<wbr>@')}</a>
        <button class="copy mono" type="button" data-copy="${site.email}" data-done="${c.copied}"><span data-copy-label>${c.copy}</span></button>
        <span class="sr" role="status" data-copy-status></span>
      </div>
      <ul class="contact__links">
        <li><a href="${site.whatsapp}" ${ext}>${c.links.whatsapp}${arrow}</a></li>
        <li><a href="${site.linkedin}" ${ext}>${c.links.linkedin}${arrow}</a></li>
        <li><a href="${site.github}" ${ext}>${c.links.github}${arrow}</a></li>
        <li><a href="/${site.cv}" download>${c.links.cv}${down}</a></li>
      </ul>
    </div>
  </div>
  <footer class="footer wrap mono">
    <span>© 2026 ${site.name}</span>
    <span>${t.footer.made}</span>
    <a href="${privacy}">${t.footer.privacy}</a>
    <a href="#top">${t.footer.top} ↑</a>
  </footer>
</section>`;
}

const scripts = `<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.1/dist/gsap.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.1/dist/ScrollTrigger.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.1/dist/SplitText.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.3.28/dist/lenis.min.js" defer></script>
<script src="/assets/js/main.js" type="module"></script>`;

export function renderHome(t, ascii) {
  return `${head(t)}
<body>
${nav(t)}
<main id="main">
${hero(t, ascii)}
${manifesto(t)}
${work(t)}
${skills(t)}
${path(t)}
${contact(t)}
</main>
<dialog class="viewer" data-viewer aria-labelledby="viewer-cap">
  <figure data-viewer-fig><figcaption class="mono" id="viewer-cap" data-viewer-cap></figcaption></figure>
  <button class="viewer__close mono" type="button" data-viewer-close>${t.dialog.close} ✕</button>
</dialog>
<div class="cursor" aria-hidden="true" data-cursor><span data-cursor-label>${t.work.view}</span></div>
${scripts}
</body>
</html>
`;
}

export function renderPrivacy(t) {
  return `${head(t, 'privacy')}
<body class="page-plain">
<main id="main" class="plain wrap">
  <a class="mono plain__back" href="${t.path}">← ${t.privacy.back}</a>
  <h1 class="section-title">${t.privacy.title}</h1>
  ${t.privacy.body.map((p) => `<p class="lead">${esc(p)}</p>`).join('\n  ')}
  <p class="mono plain__foot">© 2026 ${site.name} · <a href="mailto:${site.email}">${site.email}</a></p>
</main>
</body>
</html>
`;
}
