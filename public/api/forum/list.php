<?php
// GET /api/forum/list.php?fete=<slug>  → messages publiés (sans email). Sans fete : 30 dernières discussions.
require __DIR__ . '/../lib.php';
$fete = preg_replace('/[^a-z0-9-]/', '', (string)($_GET['fete'] ?? ''));
if ($fete !== '') {
  $st = db()->prepare("SELECT id, fete, parent_id, name, subject, body, is_team, created_at FROM forum_posts WHERE status = 'approved' AND fete = ? ORDER BY COALESCE(parent_id, id), created_at");
  $st->execute([$fete]);
} else {
  $st = db()->query("SELECT id, fete, parent_id, name, subject, body, is_team, created_at FROM forum_posts WHERE status = 'approved' ORDER BY created_at DESC LIMIT 30");
}
header('Cache-Control: public, max-age=60');
json_out(['posts' => $st->fetchAll()]);
