-- =============================================
-- BANQUE AVENIR - Base de données PostgreSQL
-- =============================================

-- Création de la base de données (à exécuter en tant que superuser)
-- DROP DATABASE IF EXISTS avenir_bank_postgres;
-- CREATE DATABASE avenir_bank_postgres;
-- \c avenir_bank_postgres;

-- Suppression des tables si elles existent (ordre inverse des dépendances)
DROP TABLE IF EXISTS bank_settings CASCADE;
DROP TABLE IF EXISTS stock_price_history CASCADE;
DROP TABLE IF EXISTS news CASCADE;
DROP TABLE IF EXISTS internal_messages CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS credits CASCADE;
DROP TABLE IF EXISTS investment_orders CASCADE;
DROP TABLE IF EXISTS stocks CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Types ENUM personnalisés pour PostgreSQL
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('client', 'advisor', 'director');

DROP TYPE IF EXISTS account_type CASCADE;
CREATE TYPE account_type AS ENUM ('checking', 'savings', 'investment');

DROP TYPE IF EXISTS transaction_type CASCADE;
CREATE TYPE transaction_type AS ENUM ('transfer', 'transfer_iban', 'deposit', 'withdrawal', 'interest', 'investment_buy', 'investment_sell');

DROP TYPE IF EXISTS transaction_status CASCADE;
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');

DROP TYPE IF EXISTS order_type CASCADE;
CREATE TYPE order_type AS ENUM ('buy', 'sell');

DROP TYPE IF EXISTS order_status CASCADE;
CREATE TYPE order_status AS ENUM ('pending', 'executed', 'cancelled');

DROP TYPE IF EXISTS credit_status CASCADE;
CREATE TYPE credit_status AS ENUM ('active', 'paid_off', 'defaulted');

-- =============================================
-- TABLE: users (Utilisateurs)
-- =============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    role user_role NOT NULL DEFAULT 'client',
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    password_reset_token VARCHAR(255) DEFAULT NULL,
    is_banned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- TABLE: accounts (Comptes bancaires)
-- =============================================
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    iban VARCHAR(34) NOT NULL UNIQUE,
    account_name VARCHAR(100) NOT NULL,
    account_type account_type NOT NULL DEFAULT 'checking',
    balance NUMERIC(15,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_accounts ON accounts(user_id);
CREATE INDEX idx_iban ON accounts(iban);

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- TABLE: transactions (Opérations bancaires)
-- =============================================
CREATE TABLE transactions (
    id VARCHAR(36) PRIMARY KEY,
    from_account_id INTEGER,
    to_account_id INTEGER,
    amount NUMERIC(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    type transaction_type NOT NULL,
    description VARCHAR(500),
    status transaction_status DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_account_id) REFERENCES accounts(id) ON DELETE SET NULL,
    FOREIGN KEY (to_account_id) REFERENCES accounts(id) ON DELETE SET NULL
);

CREATE INDEX idx_from_account ON transactions(from_account_id);
CREATE INDEX idx_to_account ON transactions(to_account_id);
CREATE INDEX idx_transaction_date ON transactions(created_at);

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- TABLE: stocks (Actions)
-- =============================================
CREATE TABLE stocks (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    current_price NUMERIC(10,4) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_symbol ON stocks(symbol);

CREATE TRIGGER update_stocks_updated_at BEFORE UPDATE ON stocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- TABLE: investment_orders (Ordres d'investissement)
-- =============================================
CREATE TABLE investment_orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    stock_id INTEGER NOT NULL,
    order_type order_type NOT NULL,
    quantity INTEGER NOT NULL,
    price_per_share NUMERIC(10,4) NOT NULL,
    total_amount NUMERIC(15,2) NOT NULL,
    fees NUMERIC(10,2) DEFAULT 1.00,
    status order_status DEFAULT 'pending',
    executed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (stock_id) REFERENCES stocks(id) ON DELETE RESTRICT
);

CREATE INDEX idx_user_orders ON investment_orders(user_id);
CREATE INDEX idx_account_orders ON investment_orders(account_id);
CREATE INDEX idx_stock_orders ON investment_orders(stock_id);

CREATE TRIGGER update_investment_orders_updated_at BEFORE UPDATE ON investment_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- TABLE: credits (Crédits)
-- =============================================
CREATE TABLE credits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    advisor_id INTEGER NOT NULL,
    principal_amount NUMERIC(15,2) NOT NULL,
    annual_interest_rate NUMERIC(5,4) NOT NULL,
    insurance_rate NUMERIC(5,4) NOT NULL,
    duration_months INTEGER NOT NULL,
    monthly_payment NUMERIC(10,2) NOT NULL,
    remaining_balance NUMERIC(15,2) NOT NULL,
    status credit_status DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (advisor_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_user_credits ON credits(user_id);
CREATE INDEX idx_advisor_credits ON credits(advisor_id);

CREATE TRIGGER update_credits_updated_at BEFORE UPDATE ON credits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- TABLE: messages (Messagerie)
-- =============================================
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id VARCHAR(255) NOT NULL,
    from_user_id INTEGER DEFAULT NULL,
    to_user_id INTEGER DEFAULT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_closed BOOLEAN DEFAULT FALSE,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_conversation ON messages(conversation_id);
CREATE INDEX idx_from_user ON messages(from_user_id);
CREATE INDEX idx_to_user ON messages(to_user_id);
CREATE INDEX idx_is_closed ON messages(is_closed);

-- =============================================
-- TABLE: internal_messages (Messages internes)
-- =============================================
CREATE TABLE internal_messages (
    id SERIAL PRIMARY KEY,
    from_user_id INTEGER NOT NULL,
    to_user_id INTEGER DEFAULT NULL,
    content TEXT NOT NULL,
    is_group_message BOOLEAN DEFAULT FALSE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_internal_from_user ON internal_messages(from_user_id);
CREATE INDEX idx_internal_to_user ON internal_messages(to_user_id);
CREATE INDEX idx_internal_is_group ON internal_messages(is_group_message);
CREATE INDEX idx_internal_created_at ON internal_messages(created_at);

-- =============================================
-- TABLE: stock_price_history
-- =============================================
CREATE TABLE stock_price_history (
    id SERIAL PRIMARY KEY,
    stock_id INTEGER NOT NULL,
    price NUMERIC(10,4) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stock_id) REFERENCES stocks(id) ON DELETE CASCADE
);

-- =============================================
-- TABLE: news (Actualités)
-- =============================================
CREATE TABLE news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id INTEGER NOT NULL,
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_news_author ON news(author_id);
CREATE INDEX idx_news_published ON news(published);

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- TABLE: bank_settings
-- =============================================
CREATE TABLE bank_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_bank_settings_updated_at BEFORE UPDATE ON bank_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- DONNÉES D'EXEMPLE COMPLÈTES
-- =============================================

-- ========== UTILISATEURS ==========
-- Mot de passe pour tous: "password"

-- Directeur
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, address, role, email_verified) 
VALUES (1, 'director@avenir-bank.fr', '$2b$10$NsaXYXQPr.DppHzYMsj8muoOhdNc5WwotCspg/jj72MT71u3QbqRO', 'Jean', 'Dupont', '0140506070', '1 Avenue de la Banque, Paris 75008', 'director', TRUE);

-- Conseillers
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, address, role, email_verified) 
VALUES 
(2, 'advisor@avenir-bank.fr', '$2b$10$NsaXYXQPr.DppHzYMsj8muoOhdNc5WwotCspg/jj72MT71u3QbqRO', 'Marie', 'Martin', '0141516171', '12 Rue du Commerce, Paris 75015', 'advisor', TRUE),
(3, 'advisor2@avenir-bank.fr', '$2b$10$NsaXYXQPr.DppHzYMsj8muoOhdNc5WwotCspg/jj72MT71u3QbqRO', 'Thomas', 'Bernard', '0142526272', '8 Boulevard Haussmann, Paris 75009', 'advisor', TRUE);

-- Clients
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, address, role, email_verified) 
VALUES 
(4, 'client@avenir-bank.fr', '$2b$10$NsaXYXQPr.DppHzYMsj8muoOhdNc5WwotCspg/jj72MT71u3QbqRO', 'Pierre', 'Durand', '0601020304', '123 Rue de la Paix, Paris 75002', 'client', TRUE),
(5, 'client2@avenir-bank.fr', '$2b$10$NsaXYXQPr.DppHzYMsj8muoOhdNc5WwotCspg/jj72MT71u3QbqRO', 'Sophie', 'Lefebvre', '0605060708', '45 Avenue des Champs, Lyon 69001', 'client', TRUE),
(6, 'client3@avenir-bank.fr', '$2b$10$NsaXYXQPr.DppHzYMsj8muoOhdNc5WwotCspg/jj72MT71u3QbqRO', 'Lucas', 'Moreau', '0609101112', '78 Rue Victor Hugo, Marseille 13001', 'client', TRUE),
(7, 'client4@avenir-bank.fr', '$2b$10$NsaXYXQPr.DppHzYMsj8muoOhdNc5WwotCspg/jj72MT71u3QbqRO', 'Emma', 'Simon', '0613141516', '32 Place Bellecour, Lyon 69002', 'client', TRUE),
(8, 'client5@avenir-bank.fr', '$2b$10$NsaXYXQPr.DppHzYMsj8muoOhdNc5WwotCspg/jj72MT71u3QbqRO', 'Hugo', 'Laurent', '0617181920', '91 Cours Lafayette, Toulouse 31000', 'client', TRUE);

-- Réinitialiser la séquence d'auto-incrémentation
SELECT setval('users_id_seq', 8, true);

-- ========== COMPTES BANCAIRES ==========
-- IBANs valides avec checksums corrects (calcules selon la norme ISO 13616)
INSERT INTO accounts (id, user_id, iban, account_name, account_type, balance) VALUES
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

SELECT setval('accounts_id_seq', 17, true);

-- ========== ACTIONS DISPONIBLES ==========
INSERT INTO stocks (id, symbol, company_name, current_price, is_available) VALUES
(1, 'AAPL', 'Apple Inc.', 150.25, TRUE),
(2, 'GOOGL', 'Alphabet Inc.', 2500.75, TRUE),
(3, 'MSFT', 'Microsoft Corporation', 300.50, TRUE),
(4, 'TSLA', 'Tesla Inc.', 800.00, TRUE),
(5, 'AMZN', 'Amazon.com Inc.', 3200.00, TRUE),
(6, 'META', 'Meta Platforms Inc.', 350.80, TRUE),
(7, 'NVDA', 'NVIDIA Corporation', 450.20, TRUE),
(8, 'NFLX', 'Netflix Inc.', 420.15, TRUE);

SELECT setval('stocks_id_seq', 8, true);

-- ========== TRANSACTIONS ==========
INSERT INTO transactions (id, from_account_id, to_account_id, amount, currency, type, description, status, created_at) VALUES
(gen_random_uuid(), 7, 8, 500.00, 'EUR', 'transfer', 'Economies du mois', 'completed', NOW() - INTERVAL '15 days'),
(gen_random_uuid(), 10, 11, 800.00, 'EUR', 'transfer', 'Virement epargne', 'completed', NOW() - INTERVAL '10 days'),
(gen_random_uuid(), 12, 13, 200.00, 'EUR', 'transfer', 'Investissement mensuel', 'completed', NOW() - INTERVAL '7 days'),
(gen_random_uuid(), NULL, 7, 1500.00, 'EUR', 'deposit', 'Depot salaire', 'completed', NOW() - INTERVAL '5 days'),
(gen_random_uuid(), NULL, 10, 2000.00, 'EUR', 'deposit', 'Virement salaire', 'completed', NOW() - INTERVAL '5 days'),
(gen_random_uuid(), 14, NULL, 300.00, 'EUR', 'withdrawal', 'Retrait DAB', 'completed', NOW() - INTERVAL '3 days'),
(gen_random_uuid(), 7, 10, 150.00, 'EUR', 'transfer', 'Remboursement repas', 'completed', NOW() - INTERVAL '2 days'),
(gen_random_uuid(), 16, 14, 200.00, 'EUR', 'transfer', 'Cadeau anniversaire', 'pending', NOW() - INTERVAL '1 day');

-- ========== ORDRES D'INVESTISSEMENT ==========
-- Formule: total_amount = (quantity * price_per_share) + fees pour BUY
INSERT INTO investment_orders (user_id, account_id, stock_id, order_type, quantity, price_per_share, total_amount, fees, status, executed_at, created_at) VALUES
(4, 9, 1, 'buy', 10, 150.25, 1503.50, 1.00, 'executed', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
(4, 9, 3, 'buy', 5, 300.50, 1503.50, 1.00, 'executed', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
(6, 13, 4, 'buy', 2, 800.00, 1601.00, 1.00, 'executed', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
(8, 17, 2, 'buy', 3, 2500.75, 7503.25, 1.00, 'executed', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
(8, 17, 7, 'buy', 5, 450.20, 2252.00, 1.00, 'pending', NULL, NOW() - INTERVAL '1 day');

-- ========== CREDITS ==========
INSERT INTO credits (user_id, account_id, advisor_id, principal_amount, annual_interest_rate, insurance_rate, duration_months, monthly_payment, remaining_balance, status, created_at) VALUES
(5, 10, 2, 20000.00, 0.0350, 0.0025, 60, 364.85, 18500.00, 'active', NOW() - INTERVAL '180 days'),
(6, 12, 2, 15000.00, 0.0380, 0.0030, 48, 340.15, 14200.00, 'active', NOW() - INTERVAL '90 days'),
(7, 14, 3, 30000.00, 0.0320, 0.0020, 72, 456.20, 28500.00, 'active', NOW() - INTERVAL '60 days'),
(8, 16, 3, 10000.00, 0.0400, 0.0035, 36, 295.55, 9500.00, 'active', NOW() - INTERVAL '30 days');

-- ========== NEWS / ACTUALITES ==========
INSERT INTO news (title, content, author_id, published, created_at) VALUES
('Bienvenue chez Banque AVENIR', 'Nous sommes ravis de vous accueillir dans notre nouvelle plateforme bancaire en ligne. Decouvrez tous nos services : comptes courants, epargne, investissements et credits.', 1, TRUE, NOW() - INTERVAL '60 days'),
('Nouveaux taux d''epargne attractifs', 'A partir du 1er janvier, profitez d''un taux d''epargne de 2.5% sur tous nos comptes epargne. C''est le moment d''optimiser votre patrimoine !', 1, TRUE, NOW() - INTERVAL '45 days'),
('Investissez dans les nouvelles technologies', 'Notre gamme d''actions s''enrichit avec l''ajout de NVIDIA et META. Diversifiez votre portefeuille des maintenant.', 2, TRUE, NOW() - INTERVAL '30 days'),
('Conseils pour optimiser votre budget', 'Marie Martin, conseillere bancaire, partage ses meilleurs conseils pour gerer votre budget familial et preparer vos projets.', 2, TRUE, NOW() - INTERVAL '20 days'),
('Nouveau service de credit immobilier', 'Banque AVENIR lance son offre de credit immobilier avec des taux exceptionnels a partir de 3.2%. Contactez nos conseillers pour une simulation gratuite.', 3, TRUE, NOW() - INTERVAL '10 days'),
('Securite renforcee sur votre espace client', 'Nous avons mis en place une authentification a deux facteurs pour proteger encore mieux vos donnees. Activez-la des aujourd''hui dans vos parametres.', 1, TRUE, NOW() - INTERVAL '5 days'),
('Prochainement : Application mobile', 'Notre application mobile sera disponible courant mars. Restez connectes pour ne rien manquer de son lancement !', 1, FALSE, NOW() - INTERVAL '1 day');

-- ========== MESSAGES CLIENT-CONSEILLER ==========
-- Conversation Pierre (client) avec Marie (conseiller)
INSERT INTO messages (conversation_id, from_user_id, to_user_id, content, is_read, is_closed, is_system, created_at) VALUES
('conv-pierre-001', 4, 2, 'Bonjour, je souhaiterais obtenir des informations sur les credits immobiliers.', TRUE, FALSE, FALSE, NOW() - INTERVAL '5 days'),
('conv-pierre-001', 2, 4, 'Bonjour Pierre, je serais ravie de vous aider. Quel est le montant de votre projet ?', TRUE, FALSE, FALSE, NOW() - INTERVAL '5 days'),
('conv-pierre-001', 4, 2, 'Nous cherchons un bien aux alentours de 250 000 euros.', TRUE, FALSE, FALSE, NOW() - INTERVAL '4 days'),
('conv-pierre-001', 2, 4, 'Parfait ! Je vous propose un rendez-vous cette semaine pour etudier votre dossier. Etes-vous disponible jeudi ?', FALSE, FALSE, FALSE, NOW() - INTERVAL '4 days');

-- Conversation Sophie avec Marie
INSERT INTO messages (conversation_id, from_user_id, to_user_id, content, is_read, is_closed, is_system, created_at) VALUES
('conv-sophie-001', 5, 2, 'Bonjour, j''ai une question sur mes frais bancaires du mois dernier.', TRUE, TRUE, FALSE, NOW() - INTERVAL '15 days'),
('conv-sophie-001', 2, 5, 'Bonjour Sophie, je consulte votre dossier. De quels frais parlez-vous ?', TRUE, TRUE, FALSE, NOW() - INTERVAL '15 days'),
('conv-sophie-001', 5, 2, 'J''ai ete prelevee de 5 euros de frais de decouvert, mais je ne pense pas avoir ete a decouvert.', TRUE, TRUE, FALSE, NOW() - INTERVAL '14 days'),
('conv-sophie-001', 2, 5, 'Je vois le probleme. Il s''agit d''une erreur de notre part. Je procede au remboursement immediat. Toutes mes excuses.', TRUE, TRUE, FALSE, NOW() - INTERVAL '14 days'),
('conv-sophie-001', NULL, 5, 'Cette conversation a ete cloturee. Votre remboursement de 5 euros a ete effectue.', TRUE, TRUE, TRUE, NOW() - INTERVAL '14 days');

-- ========== MESSAGES INTERNES STAFF ==========
INSERT INTO internal_messages (from_user_id, to_user_id, content, is_group_message, is_read, created_at) VALUES
(1, NULL, 'Reunion d''equipe vendredi a 14h. Presence obligatoire pour tous les conseillers.', TRUE, TRUE, NOW() - INTERVAL '7 days'),
(2, 3, 'Thomas, peux-tu prendre en charge le dossier de Mme Lefebvre pendant mon absence ?', FALSE, TRUE, NOW() - INTERVAL '5 days'),
(3, 2, 'Pas de souci Marie, je m''en occupe.', FALSE, TRUE, NOW() - INTERVAL '5 days'),
(1, NULL, 'Nouveaux objectifs trimestriels disponibles sur l''intranet.', TRUE, FALSE, NOW() - INTERVAL '2 days'),
(3, 1, 'Jean, j''ai besoin de valider un credit de 30k euros pour Emma Simon. Peux-tu me rappeler ?', FALSE, FALSE, NOW() - INTERVAL '1 day');

-- Configuration des paramètres de la banque
INSERT INTO bank_settings (setting_key, setting_value) VALUES
('savings_interest_rate', '2.5'), -- 2.5% annuel
('investment_fee', '1.00'); -- 1€ de frais par transaction
