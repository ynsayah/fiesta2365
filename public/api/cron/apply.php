<?php
// Application d'une action signée de l'agent (utilisé par import_replies.php)
function apply_action(array $a, array $c): bool {
  $aid = (string)($a['action_id'] ?? ''); if ($aid === '') return false;
  $chk = db()->prepare("SELECT 1 FROM agent_actions WHERE action_id = ?"); $chk->execute([$aid]); if ($chk->fetchColumn()) return false;
  $type = (string)($a['type'] ?? ''); $pid = (int)($a['post_id'] ?? 0); $body = (string)($a['body'] ?? '');
  $expect = hash_hmac('sha256', "$aid|$type|$pid|$body", $c['agent_hmac']);
  $res = 'bad_signature';
  if (hash_equals($expect, (string)($a['sig'] ?? ''))) {
    if ($type === 'approve' || $type === 'reject') {
      db()->prepare("UPDATE forum_posts SET status = ? WHERE id = ? AND status = 'pending'")->execute([$type === 'approve' ? 'approved' : 'rejected', $pid]);
      $res = $type;
    } elseif ($type === 'reply' && $body !== '') {
      $p = db()->prepare("SELECT fete, lang, email, name FROM forum_posts WHERE id = ?"); $p->execute([$pid]); $orig = $p->fetch();
      if ($orig) {
        db()->prepare("UPDATE forum_posts SET status = 'approved' WHERE id = ? AND status = 'pending'")->execute([$pid]);
        db()->prepare("INSERT INTO forum_posts (fete, parent_id, lang, name, email, subject, body, status, is_team, ip_hash, created_at) VALUES (?,?,?,?,?,'',?,'approved',1,'agent',?)")
          ->execute([$orig['fete'], $pid, $a['lang'] ?? $orig['lang'], 'Fiesta365', $c['contact_to'], mb_substr($body, 0, 4000), gmdate('Y-m-d H:i:s')]);
        $url = "https://fiesta365.org/" . ($orig['lang'] ?: 'fr') . "/festivals/{$orig['fete']}/#forum";
        @mail($orig['email'], '=?UTF-8?B?' . base64_encode('Fiesta365 : réponse à votre message') . '?=', "Bonjour {$orig['name']},\n\nVotre message a reçu une réponse :\n\n$body\n\n$url\n", "From: {$c['mail_from']}\r\nContent-Type: text/plain; charset=utf-8\r\n");
        $res = 'replied';
      } else $res = 'post_not_found';
    }
  }
  db()->prepare("INSERT INTO agent_actions (action_id, applied_at, result) VALUES (?,?,?)")->execute([$aid, gmdate('Y-m-d H:i:s'), $res]);
  return true;
}
