<?php
// Tâche cron (toutes les 15 min) : applique les actions de l'agent publiées dans le dépôt GitHub (dossier agent/replies/).
// Format d'un fichier : [{"action_id":"2026-11-09-001","type":"reply|approve|reject","post_id":12,"body":"…","lang":"fr","sig":"<hmac>"}]
// sig = hex(HMAC-SHA256(agent_hmac, action_id|type|post_id|body)). Une action sans signature valide est ignorée.
// cPanel > Tâches cron : */15 * * * * /usr/local/bin/php /home/CPANELUSER/fiesta365.org/api/cron/import_replies.php
if (PHP_SAPI !== 'cli') { http_response_code(403); exit; }
require __DIR__ . '/../lib.php';
require __DIR__ . '/apply.php';
if (getenv('F365_TEST')) return;
$c = cfg();
$ctx = stream_context_create(['http' => ['header' => "User-Agent: fiesta365-cron\r\nAccept: application/vnd.github+json\r\n", 'timeout' => 20]]);
$list = @file_get_contents("https://api.github.com/repos/{$c['github_repo']}/contents/agent/replies?ref={$c['github_branch']}", false, $ctx);
if ($list === false) { fwrite(STDERR, "GitHub injoignable\n"); exit(1); }
$files = json_decode($list, true) ?: [];
$done = 0;
foreach ($files as $f) {
  if (!str_ends_with($f['name'] ?? '', '.json')) continue;
  $raw = @file_get_contents($f['download_url'], false, $ctx); if ($raw === false) continue;
  foreach ((json_decode($raw, true) ?: []) as $a) { if (apply_action($a, $c)) $done++; }
}
echo "Actions traitées : $done\n";
