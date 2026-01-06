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
-- Mot de passe pour tous: "password"
SET @password_hash = '$2b$10$NsaXYXQPr.DppHzYMsj8muoOhdNc5WwotCspg/jj72MT71u3QbqRO';

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

-- ========== COMPTES BANCAIRES ==========
-- IBANs valides avec checksums corrects (calcules selon la norme ISO 13616)
INSERT INTO `accounts` (`id`, `user_id`, `iban`, `account_name`, `account_type`, `balance`) VALUES
-- Comptes du directeur
(1, 1, 'FR9730001007941234567890001', 'Compte Courant Direction', 'checking', 50000.00),
(2, 1, 'FR7030001007941234567890002', 'Compte Epargne Direction', 'savings', 100000.00),

-- Comptes des conseillers
(3, 2, 'FR4330001007941234567890003', 'Compte Courant Marie', 'checking', 5000.00),
(4, 2, 'FR1630001007941234567890004', 'Compte Epargne Marie', 'savings', 15000.00),
(5, 3, 'FR8630001007941234567890005', 'Compte Courant Thomas', 'checking', 4500.00),
(6, 3, 'FR5930001007941234567890006', 'Compte Epargne Thomas', 'savings', 12000.00),

-- Comptes des clients
(7, 4, 'FR3230001007941234567890007', 'Compte Courant Pierre', 'checking', 2500.00),
(8, 4, 'FR0530001007941234567890008', 'Compte Epargne Pierre', 'savings', 8000.00),
(9, 4, 'FR7530001007941234567890009', 'Compte Investissement Pierre', 'investment', 15000.00),

(10, 5, 'FR4830001007941234567890010', 'Compte Courant Sophie', 'checking', 3200.00),
(11, 5, 'FR2130001007941234567890011', 'Compte Epargne Sophie', 'savings', 12000.00),

(12, 6, 'FR9130001007941234567890012', 'Compte Courant Lucas', 'checking', 1800.00),
(13, 6, 'FR6430001007941234567890013', 'Compte Investissement Lucas', 'investment', 5000.00),

(14, 7, 'FR3730001007941234567890014', 'Compte Courant Emma', 'checking', 2100.00),
(15, 7, 'FR1030001007941234567890015', 'Compte Epargne Emma', 'savings', 6000.00),

(16, 8, 'FR8030001007941234567890016', 'Compte Courant Hugo', 'checking', 2800.00),
(17, 8, 'FR5330001007941234567890017', 'Compte Investissement Hugo', 'investment', 10000.00);

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

-- ========== TRANSACTIONS ==========
INSERT INTO `transactions` (`id`, `from_account_id`, `to_account_id`, `amount`, `currency`, `type`, `description`, `status`, `created_at`) VALUES
(UUID(), 7, 8, 500.00, 'EUR', 'transfer', 'Economies du mois', 'completed', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(UUID(), 10, 11, 800.00, 'EUR', 'transfer', 'Virement epargne', 'completed', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(UUID(), 12, 13, 200.00, 'EUR', 'transfer', 'Investissement mensuel', 'completed', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(UUID(), NULL, 7, 1500.00, 'EUR', 'deposit', 'Depot salaire', 'completed', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(UUID(), NULL, 10, 2000.00, 'EUR', 'deposit', 'Virement salaire', 'completed', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(UUID(), 14, NULL, 300.00, 'EUR', 'withdrawal', 'Retrait DAB', 'completed', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(UUID(), 7, 10, 150.00, 'EUR', 'transfer', 'Remboursement repas', 'completed', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(UUID(), 16, 14, 200.00, 'EUR', 'transfer', 'Cadeau anniversaire', 'pending', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ========== ORDRES D'INVESTISSEMENT ==========
-- Formule: total_amount = (quantity * price_per_share) + fees pour BUY
INSERT INTO `investment_orders` (`user_id`, `account_id`, `stock_id`, `order_type`, `quantity`, `price_per_share`, `total_amount`, `fees`, `status`, `executed_at`, `created_at`) VALUES
(4, 9, 1, 'buy', 10, 150.25, 1503.50, 1.00, 'executed', DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY)),
(4, 9, 3, 'buy', 5, 300.50, 1503.50, 1.00, 'executed', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY)),
(6, 13, 4, 'buy', 2, 800.00, 1601.00, 1.00, 'executed', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY)),
(8, 17, 2, 'buy', 3, 2500.75, 7503.25, 1.00, 'executed', DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY)),
(8, 17, 7, 'buy', 5, 450.20, 2252.00, 1.00, 'pending', NULL, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ========== CREDITS ==========
INSERT INTO `credits` (`user_id`, `account_id`, `advisor_id`, `principal_amount`, `annual_interest_rate`, `insurance_rate`, `duration_months`, `monthly_payment`, `remaining_balance`, `status`, `created_at`) VALUES
(5, 10, 2, 20000.00, 0.0350, 0.0025, 60, 364.85, 18500.00, 'active', DATE_SUB(NOW(), INTERVAL 180 DAY)),
(6, 12, 2, 15000.00, 0.0380, 0.0030, 48, 340.15, 14200.00, 'active', DATE_SUB(NOW(), INTERVAL 90 DAY)),
(7, 14, 3, 30000.00, 0.0320, 0.0020, 72, 456.20, 28500.00, 'active', DATE_SUB(NOW(), INTERVAL 60 DAY)),
(8, 16, 3, 10000.00, 0.0400, 0.0035, 36, 295.55, 9500.00, 'active', DATE_SUB(NOW(), INTERVAL 30 DAY));

-- ========== NEWS / ACTUALITES ==========
INSERT INTO `news` (`title`, `content`, `author_id`, `published`, `created_at`) VALUES
('Bienvenue chez Banque AVENIR', 'Nous sommes ravis de vous accueillir dans notre nouvelle plateforme bancaire en ligne. Decouvrez tous nos services : comptes courants, epargne, investissements et credits.', 1, TRUE, DATE_SUB(NOW(), INTERVAL 60 DAY)),
('Nouveaux taux d''epargne attractifs', 'A partir du 1er janvier, profitez d''un taux d''epargne de 2.5% sur tous nos comptes epargne. C''est le moment d''optimiser votre patrimoine !', 1, TRUE, DATE_SUB(NOW(), INTERVAL 45 DAY)),
('Investissez dans les nouvelles technologies', 'Notre gamme d''actions s''enrichit avec l''ajout de NVIDIA et META. Diversifiez votre portefeuille des maintenant.', 2, TRUE, DATE_SUB(NOW(), INTERVAL 30 DAY)),
('Conseils pour optimiser votre budget', 'Marie Martin, conseillere bancaire, partage ses meilleurs conseils pour gerer votre budget familial et preparer vos projets.', 2, TRUE, DATE_SUB(NOW(), INTERVAL 20 DAY)),
('Nouveau service de credit immobilier', 'Banque AVENIR lance son offre de credit immobilier avec des taux exceptionnels a partir de 3.2%. Contactez nos conseillers pour une simulation gratuite.', 3, TRUE, DATE_SUB(NOW(), INTERVAL 10 DAY)),
('Securite renforcee sur votre espace client', 'Nous avons mis en place une authentification a deux facteurs pour proteger encore mieux vos donnees. Activez-la des aujourd''hui dans vos parametres.', 1, TRUE, DATE_SUB(NOW(), INTERVAL 5 DAY)),
('Prochainement : Application mobile', 'Notre application mobile sera disponible courant mars. Restez connectes pour ne rien manquer de son lancement !', 1, FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ========== MESSAGES CLIENT-CONSEILLER ==========
-- Conversation Pierre (client) avec Marie (conseiller)
INSERT INTO `messages` (`conversation_id`, `from_user_id`, `to_user_id`, `content`, `is_read`, `is_closed`, `is_system`, `created_at`) VALUES
('conv-pierre-001', 4, 2, 'Bonjour, je souhaiterais obtenir des informations sur les credits immobiliers.', TRUE, FALSE, FALSE, DATE_SUB(NOW(), INTERVAL 5 DAY)),
('conv-pierre-001', 2, 4, 'Bonjour Pierre, je serais ravie de vous aider. Quel est le montant de votre projet ?', TRUE, FALSE, FALSE, DATE_SUB(NOW(), INTERVAL 5 DAY)),
('conv-pierre-001', 4, 2, 'Nous cherchons un bien aux alentours de 250 000 euros.', TRUE, FALSE, FALSE, DATE_SUB(NOW(), INTERVAL 4 DAY)),
('conv-pierre-001', 2, 4, 'Parfait ! Je vous propose un rendez-vous cette semaine pour etudier votre dossier. Etes-vous disponible jeudi ?', FALSE, FALSE, FALSE, DATE_SUB(NOW(), INTERVAL 4 DAY));

-- Conversation Sophie avec Marie
INSERT INTO `messages` (`conversation_id`, `from_user_id`, `to_user_id`, `content`, `is_read`, `is_closed`, `is_system`, `created_at`) VALUES
('conv-sophie-001', 5, 2, 'Bonjour, j''ai une question sur mes frais bancaires du mois dernier.', TRUE, TRUE, FALSE, DATE_SUB(NOW(), INTERVAL 15 DAY)),
('conv-sophie-001', 2, 5, 'Bonjour Sophie, je consulte votre dossier. De quels frais parlez-vous ?', TRUE, TRUE, FALSE, DATE_SUB(NOW(), INTERVAL 15 DAY)),
('conv-sophie-001', 5, 2, 'J''ai ete prelevee de 5 euros de frais de decouvert, mais je ne pense pas avoir ete a decouvert.', TRUE, TRUE, FALSE, DATE_SUB(NOW(), INTERVAL 14 DAY)),
('conv-sophie-001', 2, 5, 'Je vois le probleme. Il s''agit d''une erreur de notre part. Je procede au remboursement immediat. Toutes mes excuses.', TRUE, TRUE, FALSE, DATE_SUB(NOW(), INTERVAL 14 DAY)),
('conv-sophie-001', NULL, 5, 'Cette conversation a ete cloturee. Votre remboursement de 5 euros a ete effectue.', TRUE, TRUE, TRUE, DATE_SUB(NOW(), INTERVAL 14 DAY));

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
