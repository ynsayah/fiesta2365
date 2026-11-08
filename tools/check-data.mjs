// Valide content/fetes/*.json — lancé en CI et par l'agent avant chaque commit. Code de sortie 1 si erreur.
import { readdirSync, readFileSync } from 'node:fs';
const DIR = 'content/fetes';
const CONT = ['afrique', 'ameriques', 'asie', 'moyen-orient', 'europe', 'oceanie'];
const CAT = ['lumieres', 'morts', 'religieuse', 'patronale', 'recolte', 'ancestrale', 'nationale', 'foire', 'nature'];
const FAME = ['confidentiel', 'regional', 'celebre'];
const LANGS = ['fr', 'en', 'es', 'zh', 'hi', 'ar', 'ru', 'pt', 'bn', 'de'];
let errors = 0; const names = new Map();
const err = (f, m) => { errors++; console.error(`✗ ${f} : ${m}`); };
for (const file of readdirSync(DIR).filter((x) => x.endsWith('.json'))) {
  let d; try { d = JSON.parse(readFileSync(`${DIR}/${file}`, 'utf8')); } catch (e) { err(file, 'JSON invalide'); continue; }
  if (d.slug + '.json' !== file) err(file, 'slug différent du nom de fichier');
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(d.slug || '')) err(file, 'slug invalide (minuscules, chiffres, tirets)');
  if (!CONT.includes(d.continent)) err(file, 'continent inconnu');
  if (!CAT.includes(d.category)) err(file, 'catégorie inconnue');
  if (!FAME.includes(d.fame)) err(file, 'notoriété inconnue');
  if (!(Math.abs(d.geo?.lat) <= 90 && Math.abs(d.geo?.lng) <= 180)) err(file, 'coordonnées invalides');
  if (!d.name?.fr || !d.name?.en) err(file, 'name.fr et name.en obligatoires');
  if (!d.description?.fr || !d.description?.en) err(file, 'description.fr et description.en obligatoires');
  for (const k of Object.keys(d.name || {})) if (!LANGS.includes(k)) err(file, `langue inconnue dans name : ${k}`);
  if (!Array.isArray(d.dates) || !d.dates.length) err(file, 'dates manquantes');
  for (const x of d.dates || []) { if (!/^\d{4}-\d{2}-\d{2}$/.test(x.start) || !/^\d{4}-\d{2}-\d{2}$/.test(x.end) || x.start > x.end) err(file, `dates invalides ${x.start}–${x.end}`); }
  for (const p of d.photos || []) { if (!p.file || /^File:/i.test(p.file) || /^https?:/.test(p.file)) err(file, `photo : mettre le nom de fichier Commons sans « File: » (${p.file})`); }
  for (const v of d.videos || []) if (!/^[\w-]{11}$/.test(v.id || '')) err(file, `id YouTube invalide : ${v.id}`);
  if (!Array.isArray(d.sources) || !d.sources.length || !d.sources.every((s) => /^https?:\/\//.test(s))) err(file, 'au moins une source URL obligatoire');
  const key = (d.name?.en || '').toLowerCase().replace(/[^a-z0-9]/g, '') + '|' + (d.country?.en || '');
  if (names.has(key)) err(file, `doublon probable de ${names.get(key)}`); else names.set(key, file);
}
console.log(errors ? `${errors} erreur(s)` : `OK : ${names.size} fêtes valides`);
process.exit(errors ? 1 : 0);
