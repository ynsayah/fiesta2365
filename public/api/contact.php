<?php
// POST /api/contact.php (name, email, subject, body, lang, website=pot de miel)
require __DIR__ . '/lib.php';
require_post();
$name = field('name', 60); $email = field('email', 120); $subject = field('subject', 120); $body = field('body', 6000);
$lang = preg_replace('/[^a-z]/', '', substr((string)($_POST['lang'] ?? 'fr'), 0, 2)) ?: 'fr';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) json_out(['error' => 'email'], 422);
if (!rate_ok('contact')) json_out(['error' => 'rate'], 429);
db()->prepare("INSERT INTO contact_messages (name, email, subject, body, lang, ip_hash, created_at) VALUES (?,?,?,?,?,?,?)")
  ->execute([$name, $email, $subject, $body, $lang, ip_hash(), gmdate('Y-m-d H:i:s')]);
notify("[Fiesta365 contact] $subject", "De : $name <$email>\nLangue : $lang\n\n$body\n", $email);
json_out(['ok' => true], 201);
