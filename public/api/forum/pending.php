<?php
// GET /api/forum/pending.json?k=<agent_key> — flux lu par l'agent (WebFetch) :
// messages en attente de modération + messages publiés sans réponse de l'équipe (14 jours). Les emails ne sont jamais exposés.
require __DIR__ . '/../lib.php';
if (!hash_equals((string)cfg()['agent_key'], (string)($_GET['k'] ?? ''))) json_out(['error' => 'forbidden'], 403);
$since = gmdate('Y-m-d H:i:s', time() - 14 * 86400);
$pending = db()->query("SELECT id, fete, parent_id, lang, name, subject, body, created_at FROM forum_posts WHERE status = 'pending' ORDER BY created_at")->fetchAll();
$st = db()->prepare("SELECT p.id, p.fete, p.lang, p.name, p.subject, p.body, p.created_at FROM forum_posts p
  WHERE p.status = 'approved' AND p.is_team = 0 AND p.parent_id IS NULL AND p.created_at > ?
  AND NOT EXISTS (SELECT 1 FROM forum_posts r WHERE r.parent_id = p.id AND r.is_team = 1) ORDER BY p.created_at");
$st->execute([$since]);
json_out(['generated_at' => gmdate('c'), 'pending_moderation' => $pending, 'awaiting_reply' => $st->fetchAll()]);
