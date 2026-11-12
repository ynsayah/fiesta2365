# Fiesta365 v3

Le calendrier des fêtes du monde, mis à jour chaque jour. Cette version remplace **fiesta365.org** (WordPress) et **fiesta365.org/v2** (Astro 4).

## En bref
- **Site statique Astro 5**, 10 langues (fr par défaut, en, es, zh, hi, ar en RTL, ru, pt, bn, de) : 800 pages générées, aucune base de données pour la lecture.
- **Contenu** : une fiche JSON par fête dans `content/fetes/<slug>.json` (72 fêtes au départ, issues des éditions « Fêtes du monde » d'oct.-nov. 2026).
- **Backend PHP léger** (`public/api/`, copié tel quel dans le site) : forum par fête avec modération, formulaire de contact, flux pour l'agent, import des réponses signées de l'agent.
- **Agent quotidien** : tâches programmées Claude (voir `AGENT.md`) qui ajoutent des fêtes, photos et vidéos par commit dans ce dépôt, et répondent au forum et aux emails.
- **Déploiement** : en parallèle sur **Vercel** (site statique, push GitHub → déploiement automatique, `vercel.json`) et **o2switch** (site complet + API PHP, GitHub Actions → rsync). Le forum et le contact tournent sur l'API o2switch (`/api` ou `https://api.fiesta365.org`, voir `src/lib/api.js`). Détails dans `DEPLOIEMENT.md`.

## Choix techniques (et pourquoi)
| Sujet | Choix | Raison |
|---|---|---|
| Carte | SVG vectoriel calculé au build (Natural Earth 1:110m, projection Equal Earth, `/world.svg`) | Pas de tuiles tierces : zéro traceur, RGPD simple, rapide, marche hors ligne. Leaflet + OSM reste possible plus tard pour un zoom rue par rue. |
| Recherche | Index JSON embarqué + filtre côté client | Avec quelques centaines de fêtes, plus léger et plus fiable que Pagefind. À revoir au-delà de ~3 000 fiches. |
| Visuels | Affiche générée par fête (`/posters/<slug>.svg`, rosace selon le type de fête) sous la photo Commons | Aucune carte vide quand une photo manque ou se charge mal. |
| Vidéos | Vignettes `i.ytimg.com` + lecteur `youtube-nocookie.com` chargé au clic | Performance et vie privée. |
| Forum | PHP/MySQL sur o2switch, messages modérés avant publication, email jamais publié | Hébergement déjà payé, pas de service tiers. |
| Agent ↔ forum | Lecture : `api/forum/pending.json?k=<clé>` (WebFetch). Écriture : fichiers signés HMAC dans `agent/replies/`, importés par cron toutes les 15 min | L'environnement de l'agent ne peut joindre que GitHub en écriture. La signature empêche quiconque de publier au nom de l'agent. |

## Développer
```bash
npm install
npm run dev          # http://localhost:4321/fr/
npm run check:data   # valide les fiches JSON
npm run build        # génère dist/
```

## Ajouter ou corriger une fête
Créer/éditer `content/fetes/<slug>.json` (modèle : n'importe quelle fiche existante), puis `npm run check:data`.
Champs : `name`, `description` (fr et en obligatoires, autres langues facultatives), `country`, `place`, `geo`, `continent`, `category`, `fame`, `dates[]` (une entrée par année), `rule`, `photos[]` (nom de fichier Commons sans « File: »), `videos[]` (id YouTube), `sources[]`, `featured`.
Les traductions faites par machine et non relues sont listées dans `translations_machine` (ex. `["es","de"]`).

## Limites connues (au 8 nov. 2026)
- Les textes des fêtes existent en fr et en ; les 8 autres langues affichent l'anglais avec une mention, en attendant que l'agent les traduise. L'interface est traduite dans les 10 langues (traductions à faire relire par des locuteurs natifs, en priorité ar, hi, bn, zh).
- `place` et les légendes photo sont en français seulement.
- Les dates sont celles de 2026 ; l'agent ajoute une entrée `dates[]` par année.
- Redirections WordPress : règles génériques dans `public/.htaccess` ; la liste fiche par fiche reste à établir (voir DEPLOIEMENT.md).
- Mentions légales : champs « éditeur » à compléter.
