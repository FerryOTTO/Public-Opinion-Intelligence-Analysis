-- Demo login packaging supplement
-- 仅用于展示“登录已接入数据库”的答辩/演示场景

USE public_opinion_platform;

CREATE TABLE IF NOT EXISTS sys_user_accounts (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(64) NOT NULL,
  password_hash VARCHAR(128) NOT NULL,
  display_name VARCHAR(128) NOT NULL,
  role_code VARCHAR(64) NOT NULL,
  department_name VARCHAR(128) NOT NULL,
  security_level ENUM('A', 'B', 'C') NOT NULL DEFAULT 'B',
  account_status ENUM('active', 'locked', 'disabled') NOT NULL DEFAULT 'active',
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_sys_user_accounts_username (username)
) ENGINE=InnoDB;

INSERT INTO sys_user_accounts (
  username,
  password_hash,
  display_name,
  role_code,
  department_name,
  security_level,
  account_status,
  last_login_at
) VALUES
  ('admin', 'demo:mysql:admin:123456', '系统管理员', 'super_admin', '网络舆情研判中心', 'A', 'active', NOW()),
  ('operator', 'demo:mysql:operator:123456', '值班分析员', 'duty_operator', '监测调度组', 'B', 'active', DATE_SUB(NOW(), INTERVAL 2 HOUR))
ON DUPLICATE KEY UPDATE
  password_hash = VALUES(password_hash),
  display_name = VALUES(display_name),
  role_code = VALUES(role_code),
  department_name = VALUES(department_name),
  security_level = VALUES(security_level),
  account_status = VALUES(account_status),
  last_login_at = VALUES(last_login_at),
  updated_at = CURRENT_TIMESTAMP;
