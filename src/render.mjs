// Page templates. Plain template literals: no framework, no runtime dependency.
import { site, screens, showcase } from './content.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pad = (n) => String(n).padStart(2, '0');
const arrow = '<svg class="ar" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>';
const down = '<svg class="ar" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3.5 8.5 8 13l4.5-4.5"/></svg>';
const chars = (word) => [...word].map((c) => (c === ' ' ? '<span class="ch ch--sp"> </span>' : `<span class="ch"><span>${esc(c)}</span></span>`)).join('');
const ext = 'target="_blank" rel="noopener"';

function head(t, page = 'home') {
  const url = site.url + (page === 'home' ? t.root : t.root + (t.lang === 'fr' ? 'confidentialite.html' : 'privacy.html'));
  const title = page === 'home' ? t.title : `${t.privacy.title} · ${site.name}`;
  const alt = page === 'home'
    ? `<link rel="alternate" hreflang="fr" href="${site.url}/">
<link rel="alternate" hreflang="en" href="${site.url}/en/">
<link rel="alternate" hreflang="x-default" href="${site.url}/">` : '';
  const ld = page === 'home' ? `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Person', name: site.name, url: site.url + t.root,
    image: site.url + '/img/ayoub-portrait.jpg', jobTitle: t.work.meta[0][1], email: 'mailto:' + site.email,
    worksFor: { '@type': 'Organization', name: 'Amiyas Import', url: 'https://amiyasimport.com' },
    address: { '@type': 'PostalAddress', addressLocality: 'Casablanca', addressCountry: 'MA' },
    alumniOf: [
      { '@type': 'EducationalOrganization', name: 'ISTA Hay Hassani 1 (OFPPT)' },
      { '@type': 'EducationalOrganization', name: '1337 Coding School' },
      { '@type': 'CollegeOrUniversity', name: 'Faculté des Sciences Aïn Chock' },
    ],
    knowsLanguage: ['ar', 'fr', 'en'],
    knowsAbout: ['Digital marketing', 'B2B marketing', 'Meta Ads', 'Lead generation', 'SEO', 'Marketing automation', 'Social media management', 'Content marketing', 'Web development', 'Laravel', 'React'],
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
<meta name="theme-color" content="#141210">
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

const sections = (t) => [['top', t.nav.top], ['work', t.nav.work], ['expertise', t.nav.expertise], ['path', t.nav.path], ['contact', t.nav.contact]];

function nav(t) {
  const fr = t.lang === 'fr';
  const links = sections(t);
  return `<a class="skip" href="#main">${t.skip}</a>
<header class="nav" data-nav>
  <a class="nav__brand" href="#top"><span class="nav__mark" aria-hidden="true">AEB</span><span class="nav__name">${site.name}</span></a>
  <nav class="nav__links" aria-label="${fr ? 'Principale' : 'Main'}">
    ${links.map(([id, l]) => `<a href="#${id}" data-link="${id}"><span class="nav__label" data-scramble>${l}</span></a>`).join('\n    ')}
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
  <nav aria-label="Menu">
    <ol>
      ${links.map(([id, l]) => `<li><a href="#${id}"><span class="menu__label">${l}</span></a></li>`).join('\n      ')}
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
    <h2 class="manifesto__text" id="m-h" data-words>${esc(t.manifesto.text).replace(/\*(.+?)\*([,.;:]?)/g, '<span class="nw"><em class="kw">$1</em>$2</span>')}</h2>
    <p class="manifesto__aside mono">${t.manifesto.aside.split(/(?<=\.)\s+/).map((x) => `<span>${esc(x)}</span>`).join(' ')}</p>
  </div>
</section>`;
}

function screenFigure(t, s, i, inline = false) {
  const alt = esc(t.work.screenAlt[s.key]);
  if (s.phone) {
    return `<figure class="screen screen--phones${inline ? ' screen--inline' : ''}" data-screen="${i}">
      <div class="phone"><img src="${s.src}" srcset="${s.srcset}" sizes="200px" width="${s.w}" height="${s.h}" alt="${alt}" loading="lazy" decoding="async"></div>
      <div class="phone phone--b"><img src="${s.second.src}" srcset="${s.second.srcset}" sizes="200px" width="${s.w}" height="${s.h}" alt="${esc(t.work.screenAlt.mobile2)}" loading="lazy" decoding="async"></div>
    </figure>`;
  }
  return `<figure class="screen${inline ? ' screen--inline' : ''}" data-screen="${i}"><div class="browser"><div class="browser__bar" aria-hidden="true"><i></i><i></i><i></i><span class="mono">amiyasimport.com</span></div><img src="${s.src}" srcset="${s.srcset}" sizes="(max-width: 1023px) 92vw, 46vw" width="${s.w}" height="${s.h}" alt="${alt}" loading="lazy" decoding="async"></div></figure>`;
}

function work(t) {
  const w = t.work;
  const steps = w.steps.map((st, i) => `<li class="step" data-step="${i}">
          <span class="step__n mono">${pad(i + 1)}</span>
          <div class="step__body">
            <h4>${esc(st.title)}</h4>
            <p>${esc(st.text)}</p>
            <ul class="step__tags mono">${st.tags.map((g) => `<li>${esc(g)}</li>`).join('')}</ul>
          </div>
          ${screenFigure(t, screens[i], i, true)}
        </li>`).join('\n        ');
  return `<section class="work" id="work" data-ground="paper" data-sheet aria-labelledby="work-h">
  <div class="wrap work__head">
    <h2 class="work__title" id="work-h" data-reveal>${w.title}</h2>
    <p class="work__kicker">${esc(w.kicker)}</p>
    <p class="lead work__lead" data-reveal>${esc(w.intro)}</p>
    <div class="work__side">
      <dl class="meta">${w.meta.map(([k, v]) => `<div><dt class="mono">${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      <a class="link" href="https://amiyasimport.com" ${ext}>${w.visit}${arrow}</a>
    </div>
  </div>

  <div class="chapter" data-chapter>
    <div class="wrap chapter__grid">
      <div class="chapter__text">
        <p class="chapter__label mono">${esc(w.sourceLabel)}</p>
        <h3 class="chapter__title">${esc(w.sourceTitle)}</h3>
        <p class="chapter__intro">${esc(w.sourceIntro)}</p>
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
${cases(t)}
${showcaseBlock(t)}
</section>`;
}

/* One media entry (image or video) from `showcase` in content.mjs. */
function showItem(s, lang) {
  const title = esc(s.title[lang]);
  const text = s.text ? `<p>${esc(s.text[lang])}</p>` : '';
  let media = '';
  if (s.kind === 'image') media = `<img src="${s.src}" width="${s.w}" height="${s.h}" alt="${esc(s.alt[lang])}" loading="lazy" decoding="async">`;
  if (s.kind === 'video') media = `<video src="${s.src}" poster="${s.poster}" width="${s.w}" height="${s.h}" controls muted playsinline preload="none" aria-label="${esc(s.alt[lang])}"></video>`;
  const link = s.href ? `<a class="link" href="${s.href}" ${ext}>${esc(s.linkLabel?.[lang] || s.href)}${arrow}</a>` : '';
  return `<article class="show__item show__item--${s.kind}">${media}<h4>${title}</h4>${text}${link}</article>`;
}

/* Media not attached to a case study. Renders nothing until such entries exist. */
function showcaseBlock(t) {
  const loose = showcase.filter((s) => !s.case);
  if (!loose.length) return '';
  return `  <div class="wrap show">${loose.map((s) => showItem(s, t.lang)).join('\n    ')}</div>`;
}

/* Case studies 02 to 08: one row each, opening on the full case. */
const CASE_FIELDS = ['context', 'challenge', 'role', 'approach', 'execution', 'tools', 'deliverables'];
function cases(t) {
  const c = t.cases;
  const rows = c.items.map((it, i) => {
    const media = showcase.filter((s) => s.case === it.id);
    const fields = CASE_FIELDS.filter((f) => it[f]).map((f) => `<div><dt class="mono">${c.fields[f]}</dt><dd>${esc(it[f])}</dd></div>`).join('');
    const link = it.link ? `<a class="link case__link" href="${site[it.link.href]}" ${ext}>${esc(it.link.label)}${arrow}</a>` : '';
    const status = it.ongoing ? `<span class="case__status">${c.ongoing}</span>` : '';
    return `<li class="case" id="case-${it.id}">
          <details>
            <summary><span class="case__n mono">${pad(i + 2)}</span><span class="case__title">${esc(it.title)}</span><span class="case__tags mono">${status}${it.tags.map(esc).join(' · ')}</span><span class="case__plus" aria-hidden="true"></span></summary>
            <div class="case__body">
              <dl>${fields}</dl>
              ${link}${media.length ? `<div class="case__media">${media.map((s) => showItem(s, t.lang)).join('')}</div>` : ''}
            </div>
          </details>
        </li>`;
  }).join('\n        ');
  return `  <div class="wrap map cases">
    <div class="map__intro">
      <h3 class="map__title" data-reveal>${esc(c.title)}</h3>
      <p>${esc(c.intro)}</p>
    </div>
    <ol class="cases__list">
        ${rows}
    </ol>
  </div>`;
}

/* the expertise cycle: eight areas on a ring, decorative (the list carries the content) */
const NODE_ORDER = ['strategy', 'content', 'ads', 'seo', 'web', 'leads', 'measure', 'auto'];
function cycleSvg(e) {
  const C = 260, R = 178;
  const step = 360 / NODE_ORDER.length;
  const nodes = NODE_ORDER.map((k, i) => {
    const a = (-90 + i * step) * (Math.PI / 180);
    const x = C + R * Math.cos(a), y = C + R * Math.sin(a);
    const lx = C + (R + 42) * Math.cos(a), ly = C + (R + 42) * Math.sin(a);
    const anchor = Math.abs(Math.cos(a)) < 0.2 ? 'middle' : Math.cos(a) > 0 ? 'start' : 'end';
    return `<g class="cy__node" data-node="${k}">
        <line class="cy__spoke" x1="${C}" y1="${C}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>
        <circle class="cy__halo" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="16"/>
        <circle class="cy__dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5.5"/>
        <text class="cy__label" x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" text-anchor="${anchor}">${esc(e.nodes[k])}</text>
      </g>`;
  }).join('\n      ');
  const ticks = Array.from({ length: 72 }, (_, i) => {
    const a = (i * 5) * (Math.PI / 180);
    const r1 = R - 14, r2 = R - (i % 6 === 0 ? 24 : 18);
    return `<line x1="${(C + r1 * Math.cos(a)).toFixed(1)}" y1="${(C + r1 * Math.sin(a)).toFixed(1)}" x2="${(C + r2 * Math.cos(a)).toFixed(1)}" y2="${(C + r2 * Math.sin(a)).toFixed(1)}"/>`;
  }).join('');
  return `<svg class="cycle" viewBox="-80 -10 680 540" aria-hidden="true" data-cycle>
      <g class="cy__ticks">${ticks}</g>
      <circle class="cy__ring cy__ring--base" cx="${C}" cy="${C}" r="${R}"/>
      <circle class="cy__ring cy__ring--draw" cx="${C}" cy="${C}" r="${R}" pathLength="1" transform="rotate(-90 ${C} ${C})"/>
      <g class="cy__orbit" data-orbit><circle cx="${C}" cy="${C - R}" r="3.5"/></g>
      ${nodes}
      ${e.center.map((l, i) => `<text class="cy__center${i === 0 ? ' cy__center--b' : ' cy__center--s'}" x="${C}" y="${C + (i - (e.center.length - 1) / 2) * 38 + 11}" text-anchor="middle">${esc(l)}</text>`).join('\n      ')}
    </svg>`;
}

function expertise(t) {
  const e = t.expertise;
  const caps = e.items.map(([node, fam, name, text], i) => `<li class="cap" data-node="${node}">
          <span class="cap__stage mono">${pad(i + 1)} · ${esc(e.families[fam])}</span>
          <h3 class="cap__name">${esc(name)}</h3>
          <p class="cap__text">${esc(text)}</p>
        </li>`).join('\n        ');
  const groups = e.groups.map((g) => `<div class="map__group">
        <h4 class="map__head">${esc(g.title)}</h4>
        <ul class="map__rows">
          ${g.rows.map(([n, d, s]) => `<li class="map__row map__row--${s}"><span class="map__name">${esc(n)}</span><span class="map__ctx">${esc(d)}</span><span class="map__lvl mono"><i aria-hidden="true"></i>${e.status[s]}</span></li>`).join('\n          ')}
        </ul>
      </div>`).join('\n      ');
  return `<section class="expertise" id="expertise" data-ground="paper" aria-labelledby="exp-h">
  <div class="wrap exp__grid">
    <div class="exp__head">
      <h2 class="section-title" id="exp-h" data-reveal>${e.title}</h2>
      <p class="lead exp__intro">${esc(e.intro)}</p>
    </div>
    <div class="exp__visual">${cycleSvg(e)}</div>
    <div class="exp__body">
      <ul class="caps" data-caps>
        ${caps}
      </ul>
    </div>
  </div>
  <div class="wrap map">
    <div class="map__intro">
      <h3 class="map__title" data-reveal>${e.mapTitle}</h3>
      <p>${esc(e.mapIntro)}</p>
      <p class="map__legend mono">${Object.entries(e.status).map(([k, v]) => `<span class="map__lvl map__row--${k}"><i aria-hidden="true"></i>${v}</span>`).join('')}</p>
    </div>
    <div class="map__groups">
      ${groups}
    </div>
  </div>
</section>`;
}

function path(t) {
  const p = t.path;
  return `<section class="path" id="path" data-ground="paper" aria-labelledby="path-h">
  <div class="wrap path__grid">
    <div class="path__intro">
      <h2 class="section-title" id="path-h" data-reveal>${p.title}</h2>
      <p class="lead">${esc(p.story)}</p>
      <div class="path__now">
        <h3 class="mono">${p.nowTitle}</h3>
        <ul>${p.nowItems.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>
      </div>
      <div class="path__langs">
        <h3 class="mono">${p.langsTitle}</h3>
        <dl class="langs">${p.langs.map(([l, v]) => `<div><dt>${l}</dt><dd>${v}</dd></div>`).join('')}</dl>
      </div>
      <a class="link" href="/${site.cv}" download>${p.cv}${down}</a>
    </div>
    <ol class="timeline" data-timeline>
      ${p.items.map((it) => `<li class="tl tl--${it.type}">
        <span class="tl__year mono">${it.year}</span>
        <span class="tl__node" aria-hidden="true"></span>
        <div class="tl__body">
          <p class="tl__type mono">${p.types[it.type]}${it.current ? ` · <span class="tl__now">${p.now}</span>` : ''}</p>
          <h3>${esc(it.title)}</h3>
          <p class="tl__org">${esc(it.org)}</p>
          <p class="tl__text">${esc(it.text)}</p>
        </div>
      </li>`).join('\n      ')}
    </ol>
  </div>
</section>`;
}

function contact(t) {
  const c = t.contact;
  const privacy = t.lang === 'fr' ? '/confidentialite.html' : '/en/privacy.html';
  const href = { whatsapp: site.whatsapp, linkedin: site.linkedin, github: site.github, cv: '/' + site.cv };
  const links = c.links.map(([k, name, sub]) => {
    const attrs = k === 'cv' ? 'download' : ext;
    return `<li><a href="${href[k]}" ${attrs}><span class="cl__name">${name}</span><span class="cl__sub">${sub}</span>${k === 'cv' ? down : arrow}</a></li>`;
  }).join('\n        ');
  return `<section class="contact" id="contact" data-ground="ink" aria-labelledby="contact-h">
  <div class="wrap contact__grid">
    <div class="contact__lead">
      <h2 class="contact__title" id="contact-h" data-reveal>${esc(c.title)}</h2>
      <p class="contact__text">${esc(c.text)}</p>
    </div>
    <div class="contact__mail">
      <a class="mail" href="mailto:${site.email}">${site.email.replace('@', '<wbr>@')}</a>
      <div class="contact__actions">
        <a class="btn btn--primary" href="mailto:${site.email}">${c.write}${arrow}</a>
        <button class="btn btn--ghost" type="button" data-copy="${site.email}" data-done="${c.copied}"><span data-copy-label>${c.copy}</span></button>
        <span class="sr" role="status" data-copy-status></span>
      </div>
    </div>
    <ul class="contact__links">
        ${links}
    </ul>
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
${expertise(t)}
${path(t)}
${contact(t)}
</main>
${scripts}
</body>
</html>
`;
}

export function renderPrivacy(t) {
  return `${head(t, 'privacy')}
<body class="page-plain">
<main id="main" class="plain wrap">
  <a class="mono plain__back" href="${t.root}">← ${t.privacy.back}</a>
  <h1 class="section-title">${t.privacy.title}</h1>
  ${t.privacy.body.map((p) => `<p class="lead">${esc(p)}</p>`).join('\n  ')}
  <p class="mono plain__foot">© 2026 ${site.name} · <a href="mailto:${site.email}">${site.email}</a></p>
</main>
</body>
</html>
`;
}
