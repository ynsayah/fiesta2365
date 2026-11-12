# Déploiement pas à pas : Vercel + o2switch en parallèle

Décision du 12 nov. 2026 : **on garde les deux hébergements quelques semaines**, puis on n'en garde qu'un (voir « Choisir dans quelques semaines » en bas).

| | Vercel | o2switch |
|---|---|---|
| Ce qui y tourne | le site statique (pages, carte, calendrier, recherche) | le site complet **et** l'API PHP (forum, contact, flux de l'agent) |
| Adresse de l'API utilisée par le site | `https://api.fiesta365.org` | `/api` (même domaine) |
| Déploiement | automatique à chaque push GitHub (aperçu sur `v3`, production sur `main`) | GitHub Actions « Build et déploiement o2switch » à chaque push sur `main` |

Le forum et le contact tournent **toujours** sur o2switch : les deux versions du site partagent la même base de messages.

Rien ne casse le site actuel : tout est testé sur des adresses d'aperçu avant la bascule.

## 1. Dépôt GitHub (fait le 12 nov. 2026)
- Le code est sur `ynsayah/fiesta2365`, branche **`v3`**. Claude a l'accès en écriture.
- Quand l'aperçu est validé : fusionner `v3` dans `main`. Le push sur `main` met en production sur Vercel et sur o2switch.

## 2. Vercel (environ 10 minutes, faisable depuis le téléphone)
1. Ouvrir https://vercel.com et se connecter **avec GitHub** (compte `ynsayah`).
2. **Add New… → Project** → dans la liste, **Import** à côté de `fiesta2365`. Si le dépôt n'apparaît pas : « Adjust GitHub App Permissions » et autoriser ce dépôt.
3. Écran de configuration :
   - *Framework Preset* : **Astro** (détecté automatiquement).
   - *Build Command*, *Output Directory*, *Install Command* : ne rien toucher, ils viennent de `vercel.json` (`npm run build:vercel`, `dist`, `npm ci`).
   - *Environment Variables* : ajouter `PUBLIC_API_BASE` = `https://api.fiesta365.org` (facultatif : c'est déjà la valeur par défaut sur Vercel).
   - **Deploy**.
4. *Settings → Git* : **Production Branch** = `main`. Chaque push sur `v3` crée un **aperçu** (adresse du type `https://fiesta2365-git-v3-ynsayah.vercel.app`), chaque push sur `main` met en production.
5. Noter l'adresse d'aperçu de la branche `v3` (onglet *Deployments*) et la donner à Claude : il la met dans `agent/site-url.txt` pour que l'email quotidien pointe vers le bon site, et dans `cors_pattern` si le nom diffère.
6. **Domaine (plus tard, au moment du choix)** : *Settings → Domains* → ajouter `fiesta365.org` et `www.fiesta365.org`. Vercel indique les enregistrements DNS à créer chez o2switch (zone DNS du cPanel). **Ne pas le faire tant que le site principal reste sur o2switch.** En attendant, on peut tester le site Vercel sur un sous-domaine, par exemple `vercel.fiesta365.org` (enregistrement CNAME vers `cname.vercel-dns.com`).

## 3. cPanel o2switch
1. **Email** : *Comptes de messagerie* → créer `contact@fiesta365.org`. Puis *Redirecteurs* → transférer `contact@fiesta365.org` vers `gestionaacc@gmail.com` (c'est la boîte que lit l'agent).
2. **Gmail « envoyer en tant que »** : dans gestionaacc@gmail.com → Paramètres → Comptes → « Envoyer des e-mails en tant que » → ajouter `contact@fiesta365.org`, serveur SMTP o2switch (nom d'hôte du serveur indiqué dans cPanel, port 465 SSL, identifiants du compte mail).
3. **Base MySQL** : *Bases de données MySQL* → créer `CPANELUSER_fiesta`, un utilisateur, lui donner tous les droits. Puis *phpMyAdmin* → importer `public/api/schema.sql`.
4. **Sous-domaine de test** : *Domaines* → créer `new.fiesta365.org` avec comme racine `/home/CPANELUSER/fiesta365-v3`.
5. **SSH** : *Accès SSH* → *Gérer les clés* → générer une clé `github-deploy` (ed25519), l'autoriser. Garder la clé **privée** pour l'étape 5. Si le pare-feu SSH d'o2switch (« Autorisation SSH ») est actif, autoriser les IP de GitHub Actions.
6. **config.php** : dans `/home/CPANELUSER/fiesta365-v3/api/`, copier `config.sample.php` en `config.php` et remplir (base, trois chaînes aléatoires longues : `ip_salt`, `agent_key`, `agent_hmac`). Vérifier `cors_origins` et `cors_pattern` (adresses Vercel autorisées à appeler l'API). Ce fichier n'est jamais écrasé par le déploiement.
7. **Cron** : *Tâches cron* → toutes les 15 minutes :
   `/usr/local/bin/php /home/CPANELUSER/fiesta365-v3/api/cron/import_replies.php`

## 4. Sous-domaine api.fiesta365.org chez o2switch (utilisé par le site Vercel)
1. *Domaines* → **Créer un nouveau domaine** → `api.fiesta365.org`, racine du document : **`/home/CPANELUSER/fiesta365-v3/api`** (le dossier `api` déployé par GitHub Actions, rien à copier en plus).
2. *SSL/TLS Status* (ou *Let's Encrypt*) : vérifier que `api.fiesta365.org` a son certificat (AutoSSL le génère en général sous une heure).
3. Tester :
   - https://api.fiesta365.org/forum/list.php?fete=abissa&lang=fr → doit répondre `{"posts":[...]}` ;
   - le fichier `api/.htaccess` force le HTTPS et bloque `config.php`, `lib.php`, les schémas SQL et le dossier `cron/` ;
   - depuis l'aperçu Vercel, poster un message sur une fiche : il doit arriver par email.
4. Le flux de l'agent est disponible aux deux adresses : `https://fiesta365.org/api/forum/pending.json?k=…` et `https://api.fiesta365.org/forum/pending.json?k=…`.

## 5. Secrets GitHub pour o2switch (Settings → Secrets and variables → Actions)
| Nom | Valeur |
|---|---|
| `O2_SSH_KEY` | la clé privée générée à l'étape 3.5 |
| `O2_HOST` | nom d'hôte SSH du serveur o2switch |
| `O2_USER` | identifiant cPanel |
| `O2_PATH` | `/home/CPANELUSER/fiesta365-v3` |

Puis *Actions* → « Build et déploiement o2switch » → *Run workflow*. Tester sur https://new.fiesta365.org/fr/ (forum : poster un message, il doit arriver par email et apparaître dans `api/forum/pending.json?k=<agent_key>`).

## 6. Bascule du domaine principal (quand l'aperçu est validé)
Pendant la période « les deux en parallèle », **fiesta365.org reste sur o2switch** ; Vercel sert d'aperçu et de version de secours.
1. Fusionner `v3` dans `main` (déploie sur les deux).
2. *Domaines* → `fiesta365.org` → changer la racine du document vers `/home/CPANELUSER/fiesta365-v3` (l'ancien WordPress reste intact dans son dossier, retour arrière en 1 minute).
3. Vérifier https://fiesta365.org/fr/, une ancienne URL `/v2/fr/` (doit rediriger) et une ancienne URL WordPress.
4. **Redirections fiche par fiche** : exporter la liste des articles WordPress (Outils → Exporter, ou `/wp-sitemap-posts-post-1.xml` avant bascule). Claude ajoute une ligne par article dans `public/.htaccess` **et** dans `vercel.json` (les deux hébergements ont les mêmes redirections).
5. Google Search Console : ajouter `https://fiesta365.org/sitemap.xml`.
6. Activer les deux tâches programmées (voir `AGENT.md`).

## Retour arrière
- o2switch : remettre l'ancienne racine du domaine dans cPanel. Aucune donnée n'est perdue.
- Vercel : *Deployments* → choisir un déploiement précédent → *Promote to Production*.

## Choisir dans quelques semaines
| Critère | Vercel (+ API sur o2switch) | o2switch seul |
|---|---|---|
| Coût | Plan Hobby gratuit, mais réservé à un usage **non commercial** ; Pro environ 20 $/mois par membre si publicité ou partenariats. o2switch reste payé pour l'API et l'email. | Déjà payé (hébergement unique), rien de plus. |
| Simplicité | Déploiement et aperçus automatiques à chaque push, sans clé SSH ni secrets. Mais deux hébergements à suivre. | Un seul endroit, mais le déploiement passe par la clé SSH, les secrets GitHub et le pare-feu SSH. |
| Performance | CDN mondial : très rapide partout (Asie, Amériques, Afrique). Important pour un site en 10 langues. | Serveur en France : très rapide en Europe, plus lent à l'autre bout du monde. Le site est statique, donc cela reste correct. |
| Forum et contact | Sur o2switch (api.fiesta365.org), appel d'un domaine à l'autre (CORS déjà réglé). | Même domaine, le plus simple. |
| Email contact@ | o2switch | o2switch |

**Pour ne garder que Vercel :**
1. Pointer le domaine `fiesta365.org` vers Vercel (DNS, étape 2.6).
2. Garder o2switch uniquement pour `api.fiesta365.org` et l'email. Ou migrer le forum vers **Vercel Functions + Supabase** :
   - réécrire `public/api/forum/*.php` et `contact.php` en fonctions `api/*.ts` ;
   - tables `forum_posts`, `contact_messages`, `rate_log`, `agent_actions` dans Supabase (le schéma SQL se transpose presque tel quel en PostgreSQL) ;
   - envoi des emails par Resend ou Brevo ;
   - import des réponses de l'agent par une Vercel Cron Job au lieu du cron cPanel.
   Ensuite, il ne reste plus que l'email chez o2switch.
3. Désactiver le workflow `deploy.yml`.

**Pour ne garder qu'o2switch :**
1. Supprimer le projet sur Vercel, ou le garder en simple aperçu des branches.
2. Retirer `vercel.json`, `tools/strip-php.mjs` et le script `build:vercel` (facultatif).
3. Facultatif : supprimer le sous-domaine `api.fiesta365.org` et resserrer `cors_origins`.
