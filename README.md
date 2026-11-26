# ael-bous.github.io

Portfolio of Ayoub El Bousairi (digital marketing and web development), in French and English.
Live at https://ael-bous.github.io/ (FR) and https://ael-bous.github.io/en/ (EN). The site is static and served by GitHub Pages.

## Build

The HTML is generated. Do not edit `index.html`, `en/index.html`, `confidentialite.html`, `en/privacy.html`, `sitemap.xml` or `robots.txt` by hand.

```sh
node build.mjs
```

The build needs Node 18 or newer and has no dependencies. Commit the generated files: GitHub Pages serves them as they are.

| File | Role |
|---|---|
| `src/content.mjs` | Every piece of text (FR and EN dictionaries) and the data lists: `site`, `screens`, `showcase` |
| `src/render.mjs` | Page templates |
| `assets/css/main.css` | Styles, grounds (`data-ground="ink|paper"`), responsive and reduced-motion rules |
| `assets/js/main.js` | Interactions and scroll scenes (GSAP, ScrollTrigger, SplitText and Lenis from jsDelivr, pinned versions) |
| `assets/js/halftone.js` + `assets/shaders/halftone.frag` | WebGL2 halftone field behind the manifesto. It loads on approach and pauses off-screen |

## Adding work

**A case study.** Add an entry to `cases.items` in both `fr` and `en`, with the same `id`. Fields: `title`, `tags`, `context`, `challenge`, `role`, `approach`, `execution`, `tools`, `deliverables`. Optional: `ongoing: true` for an "in progress" badge, `link: { href, label }` where `href` is a key of `site`. A missing field is simply left out. Cases are numbered from 02, after the Amiyas Import website (project 01).

**Project media (images, videos, reels).** Add an entry to `showcase` in `src/content.mjs`:
`{ kind: 'image' | 'video', case: '<case id>', src, poster?, w, h, title: { fr, en }, alt: { fr, en }, text?: { fr, en } }`.
- With `case`, it appears inside that case study. Without it, it appears in a strip under the case studies.
- Videos render with `controls muted playsinline preload="none"` and never autoplay.
- The list is empty on purpose: nothing renders until real material exists, so there are no empty placeholders.

**A tool or skill.** Add a row `[name, context, 'done' | 'practice' | 'grow']` to an `expertise.groups` entry, in both languages.

**A site screen.** Add the image to `img/`, add the entry to `screens`, and add the matching step text under `work.steps` in both languages.

## Regenerating assets

- **ASCII portrait** (the "source" layer of the hero): run `python src/ascii-portrait.py`. It reads `img/ayoub-portrait.jpg`, writes `src/portrait.txt`, and needs Pillow. Rebuild afterwards.
- **Shader**: edit `src/halftone.glsl`, then bundle it with the shader-art-coding tools into `assets/shaders/halftone.frag`:
  `glsl_tools.py bundle src/halftone.glsl -o assets/shaders/halftone.frag`, then `glsl_tools.py check …`.
- **Share image** (`share.jpg`, 1200×630): a screenshot of the hero at a 1200×630 viewport.

## Principles

- Only real material: the real portrait, real site screenshots, and the author's own designs. No stock images, AI images or invented figures.
- Accessible by default:
  - real headings and landmarks;
  - keyboard focus;
  - `prefers-reduced-motion` turns every scroll scene and the lens into static layouts;
  - the page works without JavaScript.

Previous versions are kept in the tags `v1-legacy` and `v2-taste`, and in the branch `legacy-v1`.
