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
| `src/content.mjs` | Every piece of text (FR and EN dictionaries) and the data lists: `site`, `screens`, `designs` |
| `src/render.mjs` | Page templates |
| `assets/css/main.css` | Styles, grounds (`data-ground="ink|paper|signal"`), responsive and reduced-motion rules |
| `assets/js/main.js` | Interactions and scroll scenes (GSAP, ScrollTrigger, SplitText and Lenis from jsDelivr, pinned versions) |
| `assets/js/halftone.js` + `assets/shaders/halftone.frag` | WebGL2 halftone field behind the manifesto. It loads on approach and pauses off-screen |

## Adding work

**A design (image).** Export it at 1100 px wide, then make a 560 px copy:
`img/work/<file>-1100.webp` and `img/work/<file>-560.webp`.

1. Add `{ key, kind: 'image', file, w, h, size: 'wide' | 'mid' | 'tall' }` to `designs` in `src/content.mjs`.
2. Add the caption `[type, name]` under `work.designs` and the alt text under `work.alt`, in both `fr` and `en`.
3. Each piece is placed on the 12-column grid by its index: `.p1` to `.p8` in `main.css`. A ninth piece needs a `.p9` rule.
4. Rebuild.

**A site screen.** Add the image to `img/`, add the entry to `screens`, and add the matching step text under `work.steps` in both languages.

**Video or reels (later).** `render.mjs` skips any `kind` other than `'image'`. Videos are not shown yet, so there are no empty placeholders on the site.

To add videos, handle `kind: 'video'` in the `designs.map` of `render.mjs`:
- Use `<video muted playsinline preload="none" poster="…">`.
- Keep the poster to the piece's aspect ratio.
- Do not autoplay when `prefers-reduced-motion` is set.

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
