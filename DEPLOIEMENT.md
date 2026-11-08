# Déploiement pas à pas (o2switch + GitHub)

Durée : environ 1 h la première fois. Rien ne casse le site actuel : la v3 est installée dans un **nouveau dossier**, testée sur un **sous-domaine**, puis on bascule.

## 1. Dépôt GitHub
1. Récupérer ce projet (archive fournie par Claude) et le pousser dans `ynsayah/fiesta2365` :
   ```bash
   cd fiesta365-v3 && git remote add origin https://github.com/ynsayah/fiesta2365.git
   git push -u origin v3          # branche de travail
   ```
2. Quand l'aperçu est validé : fusionner `v3` dans `main` (le push sur `main` déclenche le déploiement).
3. Pour que l'agent quotidien puisse écrire dans le dépôt : dans claude.ai, autoriser l'accès en écriture au dépôt `ynsayah/fiesta2365` (connecteur GitHub de Claude Code).

## 2. cPanel o2switch
1. **Email** : *Comptes de messagerie* → créer `contact@fiesta365.org`. Puis *Redirecteurs* → transférer `contact@fiesta365.org` vers `gestionaacc@gmail.com` (c'est la boîte que lit l'agent).
2. **Gmail « envoyer en tant que »** : dans gestionaacc@gmail.com → Paramètres → Comptes → « Envoyer des e-mails en tant que » → ajouter `contact@fiesta365.org`, serveur SMTP o2switch (nom d'hôte du serveur indiqué dans cPanel, port 465 SSL, identifiants du compte mail). Les réponses de l'agent partiront ainsi de contact@fiesta365.org.
3. **Base MySQL** : *Bases de données MySQL* → créer `CPANELUSER_fiesta`, un utilisateur, lui donner tous les droits. Puis *phpMyAdmin* → importer `public/api/schema.sql`.
4. **Sous-domaine de test** : *Domaines* → créer `new.fiesta365.org` avec comme racine `/home/CPANELUSER/fiesta365-v3`.
5. **SSH** : *Accès SSH* → *Gérer les clés* → générer une clé `github-deploy` (ed25519), l'autoriser. Garder la clé **privée** pour l'étape 3. Sur o2switch, penser à ajouter l'IP de GitHub Actions si le pare-feu SSH (« Autorisation SSH ») est actif.
6. **config.php** : dans `/home/CPANELUSER/fiesta365-v3/api/`, copier `config.sample.php` en `config.php` et remplir (base, trois chaînes aléatoires longues : `ip_salt`, `agent_key`, `agent_hmac`). Ce fichier n'est jamais écrasé par le déploiement.
7. **Cron** : *Tâches cron* → toutes les 15 minutes :
   `/usr/local/bin/php /home/CPANELUSER/fiesta365-v3/api/cron/import_replies.php`

## 3. Secrets GitHub (Settings → Secrets and variables → Actions)
| Nom | Valeur |
|---|---|
| `O2_SSH_KEY` | la clé privée générée à l'étape 2.5 |
| `O2_HOST` | nom d'hôte SSH du serveur o2switch |
| `O2_USER` | identifiant cPanel |
| `O2_PATH` | `/home/CPANELUSER/fiesta365-v3` |

Puis *Actions* → « Build et déploiement o2switch » → *Run workflow*. Tester sur https://new.fiesta365.org/fr/ (forum : poster un message, il doit arriver par email et apparaître dans `api/forum/pending.json?k=<agent_key>`).

## 4. Bascule
1. *Domaines* → `fiesta365.org` → changer la racine du document vers `/home/CPANELUSER/fiesta365-v3` (l'ancien WordPress reste intact dans son dossier, retour arrière possible en 1 min).
2. Vérifier https://fiesta365.org/fr/, une ancienne URL `/v2/fr/` (doit rediriger) et une ancienne URL WordPress.
3. **Redirections fiche par fiche** : exporter la liste des articles WordPress (Outils → Exporter, ou l'URL `/wp-sitemap-posts-post-1.xml` avant bascule) et ajouter une ligne par article dans `public/.htaccess` vers la fiche v3 correspondante. Claude peut le faire à partir de cette liste.
4. Google Search Console : ajouter `https://fiesta365.org/sitemap.xml`.
5. Activer les deux tâches programmées (voir `AGENT.md`).

## Retour arrière
Remettre l'ancienne racine du domaine dans cPanel. Aucune donnée n'est perdue.
