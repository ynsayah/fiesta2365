-- Fiesta365 v3 — schéma MySQL / MariaDB (o2switch). Importer via phpMyAdmin.
CREATE TABLE IF NOT EXISTS forum_posts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  fete VARCHAR(120) NOT NULL DEFAULT '',          -- slug de la fête ('' = forum général)
  parent_id INT UNSIGNED NULL,                    -- réponse à un message
  lang CHAR(2) NOT NULL DEFAULT 'fr',
  name VARCHAR(40) NOT NULL,
  email VARCHAR(120) NOT NULL,                    -- jamais publié
  subject VARCHAR(120) NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  is_team TINYINT(1) NOT NULL DEFAULT 0,          -- message de l'équipe / de l'agent
  ip_hash CHAR(32) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL,
  INDEX (fete, status, created_at), INDEX (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL, email VARCHAR(120) NOT NULL, subject VARCHAR(120) NOT NULL, body TEXT NOT NULL,
  lang CHAR(2) NOT NULL DEFAULT 'fr', ip_hash CHAR(32) NOT NULL DEFAULT '', created_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS rate_log (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, ip_hash CHAR(32) NOT NULL, action VARCHAR(20) NOT NULL, created_at DATETIME NOT NULL,
  INDEX (ip_hash, action, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS agent_actions (
  action_id VARCHAR(80) PRIMARY KEY, applied_at DATETIME NOT NULL, result VARCHAR(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
