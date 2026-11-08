import { LANGS } from '../i18n/ui.js';
import { FETES } from '../lib/data.js';
export function GET() {
  const S = 'https://fiesta365.org';
  const paths = ['', 'map/', 'calendar/', 'search/', 'forum/', 'contact/', 'about/', 'legal/', ...FETES.map((f) => `festivals/${f.slug}/`)];
  const urls = paths.map((p) => `<url><loc>${S}/fr/${p}</loc>${LANGS.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${S}/${l}/${p}"/>`).join('')}</url>`);
  const body = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${LANGS.flatMap((l) => paths.map((p) => `<url><loc>${S}/${l}/${p}</loc>${LANGS.map((x) => `<xhtml:link rel="alternate" hreflang="${x}" href="${S}/${x}/${p}"/>`).join('')}</url>`)).join('')}</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
