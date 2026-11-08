// Chargement et helpers des fiches de fêtes (content/fetes/*.json)
const files = import.meta.glob('../../content/fetes/*.json', { eager: true });
export const FETES = Object.values(files).map((m) => m.default || m)
  .sort((a, b) => (a.dates[0].start).localeCompare(b.dates[0].start) || a.slug.localeCompare(b.slug));

export const CONTINENTS = ['afrique', 'ameriques', 'asie', 'moyen-orient', 'europe', 'oceanie'];
export const CATEGORIES = ['lumieres', 'morts', 'religieuse', 'patronale', 'recolte', 'ancestrale', 'nationale', 'foire', 'nature'];

// texte localisé avec repli sur en puis fr ; renvoie {text, lang}
export function L(obj, lang) {
  if (!obj) return { text: '', lang };
  if (obj[lang]) return { text: obj[lang], lang };
  if (obj.en) return { text: obj.en, lang: 'en' };
  return { text: obj.fr || '', lang: 'fr' };
}
export const nameOf = (f, lang) => L(f.name, lang).text;

export function commonsPage(file) { return 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(file.replace(/ /g, '_')); }
export function commonsImg(file, w = 900) { return 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(file.replace(/ /g, '_')) + '?width=' + w; }

export function fmtRange(f, locale) {
  const d = f.dates[0];
  const s = new Date(d.start + 'T12:00:00Z'), e = new Date(d.end + 'T12:00:00Z');
  const o = { day: 'numeric', month: 'long', timeZone: 'UTC' };
  if (d.start === d.end) return s.toLocaleDateString(locale, { ...o, weekday: 'long' });
  try { return new Intl.DateTimeFormat(locale, o).formatRange(s, e); } catch { return s.toLocaleDateString(locale, o) + ' – ' + e.toLocaleDateString(locale, o); }
}

export function haversine(a, b) {
  const R = 6371, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(x)));
}
export function nearby(f, n = 4) {
  return FETES.filter((x) => x.slug !== f.slug).map((x) => ({ f: x, km: haversine(f.geo, x.geo) })).sort((a, b) => a.km - b.km).slice(0, n);
}

// Données compactes pour le JS client (dates calculées dans le navigateur)
export function clientIndex(lang) {
  return FETES.map((f) => ({
    s: f.slug, n: nameOf(f, lang), p: f.place, c: L(f.country, lang).text, k: f.continent, t: f.category, m: f.fame,
    a: f.dates[0].start, b: f.dates[0].end, la: f.geo.lat, lo: f.geo.lng, h: !!f.featured,
    d: L(f.description, lang).text.slice(0, 220),
  }));
}
