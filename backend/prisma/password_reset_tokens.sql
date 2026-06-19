CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `id` CHAR(36) NOT NULL,
  `token_hash` VARCHAR(64) NOT NULL,
  `id_utilisateur` CHAR(36) NOT NULL,
  `expires_at` DATETIME(3) NOT NULL,
  `used_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `uk_password_reset_token` (`token_hash`),
  INDEX `idx_password_reset_user` (`id_utilisateur`),
  INDEX `idx_password_reset_expires` (`expires_at`),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_password_reset_user`
    FOREIGN KEY (`id_utilisateur`)
    REFERENCES `utilisateurs` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
