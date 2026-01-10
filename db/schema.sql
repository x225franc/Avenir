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
-- DONNÉES D'EXEMPLE COMPLÈTES
-- =============================================

-- ========== UTILISATEURS ==========
-- Mot de passe pour tous: "123"
-- Hash bcrypt compatible Node.js (bcrypt rounds=10)
SET @password_hash = '$2a$12$S88KKQU2h5rsWY6JjMHd9eULODFkXeQfklDrSvnUV.doMOACP5VpC';

-- Directeur
INSERT INTO `users` (`id`, `email`, `password_hash`, `first_name`, `last_name`, `phone`, `address`, `role`, `email_verified`) 
VALUES (1, 'director@avenir-bank.fr', @password_hash, 'Jean', 'Dupont', '0140506070', '1 Avenue de la Banque, Paris 75008', 'director', TRUE);

-- Conseillers
INSERT INTO `users` (`id`, `email`, `password_hash`, `first_name`, `last_name`, `phone`, `address`, `role`, `email_verified`) 
VALUES 
(2, 'advisor@avenir-bank.fr', @password_hash, 'Marie', 'Martin', '0141516171', '12 Rue du Commerce, Paris 75015', 'advisor', TRUE),
(3, 'advisor2@avenir-bank.fr', @password_hash, 'Thomas', 'Bernard', '0142526272', '8 Boulevard Haussmann, Paris 75009', 'advisor', TRUE);

-- Clients
INSERT INTO `users` (`id`, `email`, `password_hash`, `first_name`, `last_name`, `phone`, `address`, `role`, `email_verified`) 
VALUES 
(4, 'client@avenir-bank.fr', @password_hash, 'Pierre', 'Durand', '0601020304', '123 Rue de la Paix, Paris 75002', 'client', TRUE),
(5, 'client2@avenir-bank.fr', @password_hash, 'Sophie', 'Lefebvre', '0605060708', '45 Avenue des Champs, Lyon 69001', 'client', TRUE),
(6, 'client3@avenir-bank.fr', @password_hash, 'Lucas', 'Moreau', '0609101112', '78 Rue Victor Hugo, Marseille 13001', 'client', TRUE),
(7, 'client4@avenir-bank.fr', @password_hash, 'Emma', 'Simon', '0613141516', '32 Place Bellecour, Lyon 69002', 'client', TRUE),
(8, 'client5@avenir-bank.fr', @password_hash, 'Hugo', 'Laurent', '0617181920', '91 Cours Lafayette, Toulouse 31000', 'client', TRUE);

-- ========== ACTIONS DISPONIBLES ==========
INSERT INTO `stocks` (`id`, `symbol`, `company_name`, `current_price`, `is_available`) VALUES
(1, 'AAPL', 'Apple Inc.', 150.25, TRUE),
(2, 'GOOGL', 'Alphabet Inc.', 2500.75, TRUE),
(3, 'MSFT', 'Microsoft Corporation', 300.50, TRUE),
(4, 'TSLA', 'Tesla Inc.', 800.00, TRUE),
(5, 'AMZN', 'Amazon.com Inc.', 3200.00, TRUE),
(6, 'META', 'Meta Platforms Inc.', 350.80, TRUE),
(7, 'NVDA', 'NVIDIA Corporation', 450.20, TRUE),
(8, 'NFLX', 'Netflix Inc.', 420.15, TRUE);

-- ========== NEWS / ACTUALITES ==========
INSERT INTO `news` (`title`, `content`, `author_id`, `published`, `created_at`) VALUES
('Bienvenue chez Banque AVENIR', 'Nous sommes ravis de vous accueillir dans notre nouvelle plateforme bancaire en ligne. Decouvrez tous nos services : comptes courants, epargne, investissements et credits.', 1, TRUE, DATE_SUB(NOW(), INTERVAL 60 DAY)),
('Nouveaux taux d''epargne attractifs', 'A partir du 1er janvier, profitez d''un taux d''epargne de 2.5% sur tous nos comptes epargne. C''est le moment d''optimiser votre patrimoine !', 1, TRUE, DATE_SUB(NOW(), INTERVAL 45 DAY)),
('Investissez dans les nouvelles technologies', 'Notre gamme d''actions s''enrichit avec l''ajout de NVIDIA et META. Diversifiez votre portefeuille des maintenant.', 2, TRUE, DATE_SUB(NOW(), INTERVAL 30 DAY)),
('Conseils pour optimiser votre budget', 'Marie Martin, conseillere bancaire, partage ses meilleurs conseils pour gerer votre budget familial et preparer vos projets.', 2, TRUE, DATE_SUB(NOW(), INTERVAL 20 DAY)),
('Nouveau service de credit immobilier', 'Banque AVENIR lance son offre de credit immobilier avec des taux exceptionnels a partir de 3.2%. Contactez nos conseillers pour une simulation gratuite.', 3, TRUE, DATE_SUB(NOW(), INTERVAL 10 DAY)),
('Securite renforcee sur votre espace client', 'Nous avons mis en place une authentification a deux facteurs pour proteger encore mieux vos donnees. Activez-la des aujourd''hui dans vos parametres.', 1, TRUE, DATE_SUB(NOW(), INTERVAL 5 DAY)),
('Prochainement : Application mobile', 'Notre application mobile sera disponible courant mars. Restez connectes pour ne rien manquer de son lancement !', 1, FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY));


-- ========== MESSAGES INTERNES STAFF ==========
INSERT INTO `internal_messages` (`from_user_id`, `to_user_id`, `content`, `is_group_message`, `is_read`, `created_at`) VALUES
(1, NULL, 'Reunion d''equipe vendredi a 14h. Presence obligatoire pour tous les conseillers.', TRUE, TRUE, DATE_SUB(NOW(), INTERVAL 7 DAY)),
(2, 3, 'Thomas, peux-tu prendre en charge le dossier de Mme Lefebvre pendant mon absence ?', FALSE, TRUE, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(3, 2, 'Pas de souci Marie, je m''en occupe.', FALSE, TRUE, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(1, NULL, 'Nouveaux objectifs trimestriels disponibles sur l''intranet.', TRUE, FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 1, 'Jean, j''ai besoin de valider un credit de 30k euros pour Emma Simon. Peux-tu me rappeler ?', FALSE, FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY));

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