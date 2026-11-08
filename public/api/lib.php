<?php
declare(strict_types=1);
function cfg(): array { static $c = null; if ($c === null) { $f = __DIR__ . '/config.php'; if (!is_file($f)) { json_out(['error' => 'not_configured'], 503); } $c = require $f; } return $c; }
function db(): PDO {
  static $pdo = null;
  if ($pdo) return $pdo;
  $c = cfg();
  $pdo = new PDO($c['db_dsn'], $c['db_user'] ?? null, $c['db_pass'] ?? null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
  if (str_starts_with($c['db_dsn'], 'sqlite:')) { $pdo->exec(file_get_contents(__DIR__ . '/schema.sqlite.sql')); }
  return $pdo;
}
function json_out($data, int $code = 200): void {
  http_response_code($code);
  header('Content-Type: application/json; charset=utf-8');
  header('Cache-Control: no-store');
  header('X-Content-Type-Options: nosniff');
  echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}
function ip_hash(): string { return substr(hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . cfg()['ip_salt']), 0, 32); }
function rate_ok(string $action): bool {
  $st = db()->prepare("SELECT COUNT(*) FROM rate_log WHERE ip_hash = ? AND action = ? AND created_at > ?");
  $st->execute([ip_hash(), $action, gmdate('Y-m-d H:i:s', time() - 3600)]);
  if ((int)$st->fetchColumn() >= (int)(cfg()['rate_per_hour'] ?? 5)) return false;
  db()->prepare("INSERT INTO rate_log (ip_hash, action, created_at) VALUES (?, ?, ?)")->execute([ip_hash(), $action, gmdate('Y-m-d H:i:s')]);
  db()->prepare("DELETE FROM rate_log WHERE created_at < ?")->execute([gmdate('Y-m-d H:i:s', time() - 30 * 86400)]);
  return true;
}
function field(string $k, int $max, bool $required = true): string {
  $v = trim((string)($_POST[$k] ?? ''));
  $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v) ?? '';
  if (mb_strlen($v) > $max) $v = mb_substr($v, 0, $max);
  if ($required && $v === '') json_out(['error' => 'missing_' . $k], 422);
  return $v;
}
function require_post(): void {
  if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') json_out(['error' => 'method'], 405);
  if (trim((string)($_POST['website'] ?? '')) !== '') json_out(['ok' => true]); // pot de miel : on fait semblant
}
function notify(string $subject, string $body, ?string $replyTo = null): void {
  $c = cfg();
  $h = "From: {$c['mail_from']}\r\nContent-Type: text/plain; charset=utf-8\r\n";
  if ($replyTo && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) $h .= "Reply-To: $replyTo\r\n";
  @mail($c['contact_to'], '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $h);
}
