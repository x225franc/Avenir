-- =============================================
-- BANQUE AVENIR - Base de données MySQL
-- =============================================

-- Création de la base de données
DROP DATABASE IF EXISTS `avenir_bank`;
CREATE DATABASE `avenir_bank` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `avenir_bank`;

-- Suppression des tables si elles existent (ordre inverse des dépendances)
DROP TABLE IF EXISTS `transactions`;
DROP TABLE IF EXISTS `investment_orders`;
DROP TABLE IF EXISTS `stocks`;
DROP TABLE IF EXISTS `credits`;
DROP TABLE IF EXISTS `messages`;
DROP TABLE IF EXISTS `internal_messages`;
DROP TABLE IF EXISTS `news`;
DROP TABLE IF EXISTS `accounts`;
DROP TABLE IF EXISTS `users`;

-- =============================================
-- TABLE: users (Utilisateurs)
-- =============================================
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20),
    `address` TEXT,
    `role` ENUM('client', 'advisor', 'director') NOT NULL DEFAULT 'client',
    `email_verified` BOOLEAN DEFAULT FALSE,
    `verification_token` VARCHAR(255),
    `password_reset_token` varchar(255) DEFAULT NULL,
    `is_banned` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE: accounts (Comptes bancaires)
-- =============================================
CREATE TABLE `accounts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `iban` VARCHAR(34) NOT NULL UNIQUE,
    `account_name` VARCHAR(100) NOT NULL,
    `account_type` ENUM('checking', 'savings', 'investment') NOT NULL DEFAULT 'checking',
    `balance` DECIMAL(15,2) DEFAULT 0.00,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_user_accounts` (`user_id`),
    INDEX `idx_iban` (`iban`)
);

-- =============================================
-- TABLE: transactions (Opérations bancaires)
-- =============================================
CREATE TABLE `transactions` (
    `id` VARCHAR(36) PRIMARY KEY,
    `from_account_id` INT,
    `to_account_id` INT,
    `amount` DECIMAL(15,2) NOT NULL,
    `currency` VARCHAR(3) DEFAULT 'EUR',
    `type` ENUM('transfer', 'transfer_iban', 'deposit', 'withdrawal', 'interest', 'investment_buy', 'investment_sell') NOT NULL,
    `description` VARCHAR(500),
    `status` ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`from_account_id`) REFERENCES `accounts`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`to_account_id`) REFERENCES `accounts`(`id`) ON DELETE SET NULL,
    INDEX `idx_from_account` (`from_account_id`),
    INDEX `idx_to_account` (`to_account_id`),
    INDEX `idx_transaction_date` (`created_at`)
);

-- =============================================
-- TABLE: stocks (Actions)
-- =============================================
CREATE TABLE `stocks` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `symbol` VARCHAR(10) NOT NULL UNIQUE,
    `company_name` VARCHAR(255) NOT NULL,
    `current_price` DECIMAL(10,4) NOT NULL,
    `is_available` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_symbol` (`symbol`)
);

-- =============================================
-- TABLE: investment_orders (Ordres d'investissement)
-- =============================================
CREATE TABLE `investment_orders` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `account_id` INT NOT NULL,
    `stock_id` INT NOT NULL,
    `order_type` ENUM('buy', 'sell') NOT NULL,
    `quantity` INT NOT NULL,
    `price_per_share` DECIMAL(10,4) NOT NULL,
    `total_amount` DECIMAL(15,2) NOT NULL,
    `fees` DECIMAL(10,2) DEFAULT 1.00, -- Frais de 1€
    `status` ENUM('pending', 'executed', 'cancelled') DEFAULT 'pending',
    `executed_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`stock_id`) REFERENCES `stocks`(`id`) ON DELETE RESTRICT,
    INDEX `idx_user_orders` (`user_id`),
    INDEX `idx_account_orders` (`account_id`),
    INDEX `idx_stock_orders` (`stock_id`)
);

-- =============================================
-- TABLE: credits (Crédits)
-- =============================================
CREATE TABLE `credits` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `account_id` INT NOT NULL,
    `advisor_id` INT NOT NULL,
    `principal_amount` DECIMAL(15,2) NOT NULL,
    `annual_interest_rate` DECIMAL(5,4) NOT NULL,
    `insurance_rate` DECIMAL(5,4) NOT NULL,
    `duration_months` INT NOT NULL,
    `monthly_payment` DECIMAL(10,2) NOT NULL,
    `remaining_balance` DECIMAL(15,2) NOT NULL,
    `status` ENUM('active', 'paid_off', 'defaulted') DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`advisor_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
    INDEX `idx_user_credits` (`user_id`),
    INDEX `idx_advisor_credits` (`advisor_id`)
);

-- =============================================
-- TABLE: messages (Messagerie)
-- =============================================
CREATE TABLE `messages` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `conversation_id` VARCHAR(255) NOT NULL,
    `from_user_id` INT DEFAULT NULL,
    `to_user_id` INT DEFAULT NULL,
    `content` TEXT NOT NULL,
    `is_read` BOOLEAN DEFAULT FALSE,
    `is_closed` BOOLEAN DEFAULT FALSE,
    `is_system` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`from_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`to_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    INDEX `idx_conversation` (`conversation_id`),
    INDEX `idx_from_user` (`from_user_id`),
    INDEX `idx_to_user` (`to_user_id`),
    INDEX `idx_is_closed` (`is_closed`)
);

-- =============================================
-- TABLE: internal_messages (Messages internes entre conseillers/directeurs)
-- =============================================
CREATE TABLE `internal_messages` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `from_user_id` INT NOT NULL,
    `to_user_id` INT DEFAULT NULL, -- NULL = message de groupe
    `content` TEXT NOT NULL,
    `is_group_message` BOOLEAN DEFAULT FALSE,
    `is_read` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`from_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`to_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_from_user` (`from_user_id`),
    INDEX `idx_to_user` (`to_user_id`),
    INDEX `idx_is_group` (`is_group_message`),
    INDEX `idx_created_at` (`created_at`)
);

-- =============================================
-- TABLE: stock_price_history (Historique des prix des actions)
-- =============================================

CREATE TABLE `stock_price_history` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `stock_id` INT NOT NULL,
    `price` DECIMAL(10,4) NOT NULL,
    `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`stock_id`) REFERENCES `stocks`(`id`)
);

-- =============================================
-- TABLE: news (Actualités de la banque)
-- =============================================
CREATE TABLE `news` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL,
    `author_id` INT NOT NULL,
    `published` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_author` (`author_id`),
    INDEX `idx_published` (`published`)
);


-- =============================================
-- DONNÉES D'EXEMPLE
-- =============================================

-- Insertion d'un directeur de banque
INSERT INTO `users` (`email`, `password_hash`, `first_name`, `last_name`, `role`, `email_verified`) 
VALUES ('director@avenir-bank.fr', '$2b$10$example_hash', 'Jean', 'Dupont', 'director', TRUE);

-- Insertion d'un conseiller bancaire
INSERT INTO `users` (`email`, `password_hash`, `first_name`, `last_name`, `role`, `email_verified`) 
VALUES ('advisor@avenir-bank.fr', '$2b$10$example_hash', 'Marie', 'Martin', 'advisor', TRUE);

-- Insertion d'un client exemple
INSERT INTO `users` (`email`, `password_hash`, `first_name`, `last_name`, `phone`, `address`, `role`, `email_verified`) 
VALUES ('client@example.com', '$2b$10$example_hash', 'Pierre', 'Durand', '0123456789', '123 Rue de la Paix, Paris', 'client', TRUE);

-- Insertion de quelques actions disponibles
INSERT INTO `stocks` (`symbol`, `company_name`, `current_price`, `is_available`) VALUES
('AAPL', 'Apple Inc.', 150.25, TRUE),
('GOOGL', 'Alphabet Inc.', 2500.75, TRUE),
('MSFT', 'Microsoft Corporation', 300.50, TRUE),
('TSLA', 'Tesla Inc.', 800.00, TRUE),
('AMZN', 'Amazon.com Inc.', 3200.00, TRUE);

-- Configuration du taux d'épargne global (peut être stocké dans une table de configuration)
CREATE TABLE `bank_settings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `setting_key` VARCHAR(100) NOT NULL UNIQUE,
    `setting_value` VARCHAR(255) NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO `bank_settings` (`setting_key`, `setting_value`) VALUES
('savings_interest_rate', '2.5'), -- 2.5% annuel
('investment_fee', '1.00'); -- 1€ de frais par transaction
