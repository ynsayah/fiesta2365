<?php
// POST /api/forum/post.php  (name, email, body, [subject], fete, lang, [parent_id], website=pot de miel)
require __DIR__ . '/../lib.php';
require_post();
$name = field('name', 40); $email = field('email', 120); $body = field('body', 4000); $subject = field('subject', 120, false);
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) json_out(['error' => 'email'], 422);
if (mb_strlen($body) < 10) json_out(['error' => 'too_short'], 422);
if (preg_match_all('#https?://#i', $body) > 2) json_out(['error' => 'too_many_links'], 422);
$fete = preg_replace('/[^a-z0-9-]/', '', (string)($_POST['fete'] ?? ''));
$lang = preg_replace('/[^a-z]/', '', substr((string)($_POST['lang'] ?? 'fr'), 0, 2)) ?: 'fr';
$parent = isset($_POST['parent_id']) && ctype_digit((string)$_POST['parent_id']) ? (int)$_POST['parent_id'] : null;
if (!rate_ok('forum')) json_out(['error' => 'rate'], 429);
db()->prepare("INSERT INTO forum_posts (fete, parent_id, lang, name, email, subject, body, status, is_team, ip_hash, created_at) VALUES (?,?,?,?,?,?,?, 'pending', 0, ?, ?)")
  ->execute([$fete, $parent, $lang, $name, $email, $subject, $body, ip_hash(), gmdate('Y-m-d H:i:s')]);
$id = (int)db()->lastInsertId();
notify("[Fiesta365 forum] #$id " . ($fete ?: 'général') . " — $name", "Nouveau message en attente de modération.\n\nFête : $fete\nLangue : $lang\nDe : $name <$email>\n\n$subject\n$body\n");
json_out(['ok' => true, 'id' => $id, 'status' => 'pending'], 201);
