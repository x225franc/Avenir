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
-- DONNÉES D'EXEMPLE
-- =============================================

-- Insertion d'un directeur de banque
-- Mot de passe: password123
INSERT INTO users (email, password_hash, first_name, last_name, role, email_verified)
VALUES ('director@avenir-bank.fr', '$2a$12$04rk1P4hovuMECe2uV7fXeMMK7PXGltAcFX4Gu2p1jUIuv5MXBZ.C', 'Jean', 'Dupont', 'director', TRUE);

-- Insertion d'un conseiller bancaire
-- Mot de passe: password123
INSERT INTO users (email, password_hash, first_name, last_name, role, email_verified)
VALUES ('advisor@avenir-bank.fr', '$2a$12$04rk1P4hovuMECe2uV7fXeMMK7PXGltAcFX4Gu2p1jUIuv5MXBZ.C', 'Marie', 'Martin', 'advisor', TRUE);

-- Insertion d'un client exemple
-- Mot de passe: password123
INSERT INTO users (email, password_hash, first_name, last_name, phone, address, role, email_verified)
VALUES ('client@avenir-bank.fr', '$2a$12$04rk1P4hovuMECe2uV7fXeMMK7PXGltAcFX4Gu2p1jUIuv5MXBZ.C', 'Pierre', 'Durand', '0123456789', '123 Rue de la Paix, Paris', 'client', TRUE);

-- Insertion de quelques actions disponibles
INSERT INTO stocks (symbol, company_name, current_price, is_available) VALUES
('AAPL', 'Apple Inc.', 150.25, TRUE),
('GOOGL', 'Alphabet Inc.', 2500.75, TRUE),
('MSFT', 'Microsoft Corporation', 300.50, TRUE),
('TSLA', 'Tesla Inc.', 800.00, TRUE),
('AMZN', 'Amazon.com Inc.', 3200.00, TRUE);

-- Configuration des paramètres de la banque
INSERT INTO bank_settings (setting_key, setting_value) VALUES
('savings_interest_rate', '2.5'), -- 2.5% annuel
('investment_fee', '1.00'); -- 1€ de frais par transaction
