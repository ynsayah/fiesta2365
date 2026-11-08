<?php
// Copier ce fichier en config.php (jamais versionné) et remplir les valeurs. Voir DEPLOIEMENT.md.
return [
  'db_dsn'   => 'mysql:host=localhost;dbname=CPANELUSER_fiesta;charset=utf8mb4',
  'db_user'  => 'CPANELUSER_fiesta',
  'db_pass'  => 'MOT_DE_PASSE_BASE',
  'contact_to' => 'contact@fiesta365.org',          // reçoit contact + alertes forum (transféré vers gestionaacc@gmail.com)
  'mail_from'  => 'Fiesta365 <contact@fiesta365.org>',
  'ip_salt'    => 'CHAINE_ALEATOIRE_LONGUE_1',       // pour hacher les IP (anti-spam, RGPD)
  'agent_key'  => 'CHAINE_ALEATOIRE_LONGUE_2',       // clé lue par l'agent : /api/forum/pending.json?k=...
  'agent_hmac' => 'CHAINE_ALEATOIRE_LONGUE_3',       // signe les réponses de l'agent (agent/replies/*.json)
  'github_repo'   => 'ynsayah/fiesta2365',
  'github_branch' => 'main',
  'rate_per_hour' => 5,
];
