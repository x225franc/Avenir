# Guide de Configuration PostgreSQL - Avenir Bank

## 1. Démarrer PostgreSQL sur Windows

### Option A: Via Services Windows (Recommandé)
1. Appuyez sur `Win + R`
2. Tapez `services.msc` et appuyez sur Entrée
3. Cherchez "postgresql" dans la liste
4. Cliquez droit sur le service → "Démarrer"

### Option B: Via PowerShell (en tant qu'Administrateur)
```powershell
# Trouver le nom exact du service
Get-Service | Where-Object {$_.Name -like "*postgres*"}

# Démarrer le service (remplacer par le nom exact)
Start-Service postgresql-x64-14  # ou postgresql-x64-15, etc.
```

### Option C: Via CMD (en tant qu'Administrateur)
```bash
net start postgresql-x64-14
```

## 2. Vérifier que PostgreSQL est démarré

```bash
# Vérifier le statut
psql --version

# Se connecter à PostgreSQL (par défaut)
psql -U postgres
```

Le mot de passe par défaut est celui que vous avez défini lors de l'installation de PostgreSQL.

## 3. Créer la Base de Données

### Option A: Via psql (Terminal)

```bash
# Se connecter en tant que postgres
psql -U postgres

# Dans psql, créer la base de données
CREATE DATABASE avenir_bank_postgres;

# Se connecter à la base de données
\c avenir_bank_postgres

# Exécuter le script SQL
\i 'C:/Users/mijos/Desktop/ESGI/5IW - T1/Clean Architecture/Avenir/db/schema-postgresql.sql'

# Vérifier que les tables ont été créées
\dt

# Quitter psql
\q
```

### Option B: Via pgAdmin (Interface Graphique)

1. Ouvrir pgAdmin
2. Se connecter au serveur PostgreSQL local
3. Cliquer droit sur "Databases" → "Create" → "Database..."
4. Nom: `avenir_bank_postgres`
5. Owner: `postgres`
6. Cliquer "Save"
7. Cliquer droit sur la nouvelle base → "Query Tool"
8. Ouvrir le fichier `schema-postgresql.sql` et l'exécuter

### Option C: En une seule commande (Windows)

```bash
psql -U postgres -c "CREATE DATABASE avenir_bank_postgres;"
psql -U postgres -d avenir_bank_postgres -f "C:\Users\mijos\Desktop\ESGI\5IW - T1\Clean Architecture\Avenir\db\schema-postgresql.sql"
```

## 4. Configuration des Variables d'Environnement

Créer un fichier `.env` dans `Interface/api/nestjs/` :

```env
# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe_postgres
DB_NAME=avenir_bank_postgres

# JWT Configuration
JWT_SECRET=votre_secret_jwt_super_securise_changez_moi
JWT_EXPIRES_IN=7d

# Frontend URL (pour CORS)
FRONTEND_URL=http://localhost:3003

# API Port
PORT=3002

# Email Configuration (optionnel pour les tests)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASSWORD=votre_mot_de_passe_application
SMTP_FROM=noreply@avenir-bank.fr
```

## 5. Vérifier la Connexion PostgreSQL

Dans le dossier `Interface/api/nestjs`, créez un script de test:

```javascript
// test-db-connection.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'avenir_bank_postgres',
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Connexion PostgreSQL réussie!');

    const result = await client.query('SELECT COUNT(*) FROM users');
    console.log(`✅ ${result.rows[0].count} utilisateurs dans la base`);

    client.release();
    await pool.end();
  } catch (err) {
    console.error('❌ Erreur de connexion PostgreSQL:', err.message);
    process.exit(1);
  }
}

testConnection();
```

Exécuter le test:
```bash
node test-db-connection.js
```

## 6. Données de Test

Le script `schema-postgresql.sql` insère automatiquement 3 utilisateurs de test:

| Email | Mot de passe | Rôle | Vérifié |
|-------|--------------|------|---------|
| director@avenir-bank.fr | password123 | director | ✅ |
| advisor@avenir-bank.fr | password123 | advisor | ✅ |
| client@avenir-bank.fr | password123 | client | ✅ |

Et 5 actions:
- AAPL (Apple Inc.) - 150.25€
- GOOGL (Alphabet Inc.) - 2500.75€
- MSFT (Microsoft Corporation) - 300.50€
- TSLA (Tesla Inc.) - 800.00€
- AMZN (Amazon.com Inc.) - 3200.00€

## 7. Commandes PostgreSQL Utiles

```sql
-- Lister toutes les bases de données
\l

-- Se connecter à une base de données
\c avenir_bank_postgres

-- Lister toutes les tables
\dt

-- Décrire une table
\d users

-- Voir tous les utilisateurs
SELECT * FROM users;

-- Voir tous les comptes
SELECT * FROM accounts;

-- Compter les enregistrements
SELECT COUNT(*) FROM users;

-- Supprimer toutes les données (ATTENTION!)
TRUNCATE TABLE users, accounts, transactions, stocks, investment_orders, credits, messages, internal_messages, news, bank_settings RESTART IDENTITY CASCADE;
```

## 8. Résolution de Problèmes

### Problème: "psql: command not found"
**Solution**: Ajouter PostgreSQL au PATH Windows
- Aller dans les variables d'environnement système
- Ajouter `C:\Program Files\PostgreSQL\14\bin` (ou votre version) au PATH

### Problème: "password authentication failed"
**Solution**: Vérifier le mot de passe dans le fichier `.env`

### Problème: "database does not exist"
**Solution**: Créer d'abord la base de données avec `CREATE DATABASE avenir_bank_postgres;`

### Problème: "role 'postgres' does not exist"
**Solution**: Installer correctement PostgreSQL ou utiliser un autre utilisateur

## 9. Démarrer le Serveur NestJS

Une fois PostgreSQL configuré:

```bash
# Dans le dossier racine du projet
npm run dev --workspace=Interface/api/nestjs
```

Le serveur devrait démarrer sur `http://localhost:3002` 🚀
