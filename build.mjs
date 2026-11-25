// Builds the static pages from src/. Usage: node build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { i18n, site } from './src/content.mjs';
import { renderHome, renderPrivacy } from './src/render.mjs';

const ascii = readFileSync(new URL('./src/portrait.txt', import.meta.url), 'utf8').replace(/\s+$/, '');
mkdirSync('en', { recursive: true });

writeFileSync('index.html', renderHome(i18n.fr, ascii));
writeFileSync('en/index.html', renderHome(i18n.en, ascii));
writeFileSync('confidentialite.html', renderPrivacy(i18n.fr));
writeFileSync('en/privacy.html', renderPrivacy(i18n.en));

const today = new Date().toISOString().slice(0, 10);
writeFileSync('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url><loc>${site.url}/</loc><lastmod>${today}</lastmod>
    <xhtml:link rel="alternate" hreflang="fr" href="${site.url}/"/><xhtml:link rel="alternate" hreflang="en" href="${site.url}/en/"/></url>
  <url><loc>${site.url}/en/</loc><lastmod>${today}</lastmod>
    <xhtml:link rel="alternate" hreflang="fr" href="${site.url}/"/><xhtml:link rel="alternate" hreflang="en" href="${site.url}/en/"/></url>
</urlset>
`);
writeFileSync('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);
console.log('built: index.html, en/index.html, confidentialite.html, en/privacy.html, sitemap.xml, robots.txt');
