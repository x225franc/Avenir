# Banque AVENIR - Clean Architecture - Projet Pédagogique
***Alliance de Valeurs Économiques et Nationales Investies Responsablement***

---

## Équipe du Projet

- **Diawara Alpha Malick** - 5IW2
- **Difuidi Mijosé** - 5IW2
- **Classe** : 5IW (Ingénierie Web)
- **Année** : 2025-2026

---

## Introduction

**AVENIR** est une application bancaire moderne permettant la gestion complète de liquidités, épargne et investissements. Le projet implémente une **Clean Architecture** avec TypeScript, plusieurs frameworks (Express/NestJS, Next.js/Nuxt), et des fonctionnalités temps réel (WebSocket, SSE).

### Fonctionnalités Principales

**Authentification complète** (inscription, vérification email, reset password)  
**Gestion multi-comptes** (courant, épargne, investissement)  
**Transferts d'argent** entre comptes  
**Système d'épargne** avec intérêts quotidiens  
**Investissement boursier** (achat/vente d'actions, portefeuille)  
**Crédits bancaires** (calcul mensualités, gestion)  
**Messagerie temps réel** (client-conseiller via WebSocket)  
**Chat interne** (équipe bancaire)  
**Actualités** avec feed temps réel (SSE)  
**Interface admin** (gestion utilisateurs, taux, actions)  
**SEO optimisé** (sitemap, métadonnées)  
**Système de cache** (optimisation performances)  

---

## Architecture du Projet

En **Clean Architecture** avec une séparation en 4 couches indépendantes :

```
Avenir/
├── Domain/                # Couche Domaine (Entités & Logique métier)
│   ├── entities/          # Entités métier (User, Account, Transaction...)
│   ├── enums/             # Énumérations (TransactionType, Status...)
│   ├── repositories/      # Interfaces des repositories (contrats)
│   └── value-objects/     # Value Objects (Email, IBAN, Money...)
│
├── Application/           # Couche Application (Cas d'usage)
│   ├── use-cases/         # Use Cases métier (CreateAccount, TransferMoney...)
│   ├── services/          # Services applicatifs
│
├── Infrastructure/        # Couche Infrastructure (Implémentations)
│   ├── database/          # Implémentations des repositories
│   │   └── mysql/         # Repositories MySQL 
│   │   └── postgresql/    # Repositories PostgreSQL 
│   ├── jobs/              # Tâches planifiées (Cron)
│   └── services/          # Services externes (Email, WebSocket...)
│
└── Interface/             # Couche Interface (Points d'entrée)
    ├── api/
    │   ├── express/       # Backend Express + TypeScript
    │   └── nestjs/        # Backend NestJS (alternatif)
    └── web/
        ├── next/          # Frontend Next.js + React
        └── nuxt/          # Frontend Nuxt + Vue (alternatif)
```

### Frameworks disponibles

**Backend (2 implémentations) :**
- **Express** : API REST avec Clean Architecture
- **NestJS** : Alternative avec modules et décorateurs

**Frontend (2 implémentations) :**
- **Next.js** : Application React avec App Router
- **Nuxt** : Alternative Vue.js avec SSR
---

### Prérequis Système

Avant de commencer, assurez-vous d'avoir :

| Logiciel | Version Minimale | Notes |
|----------|------------------|-------|
| **Node.js** | 20.0.0+ | |
| **npm** | 9.0.0+ | |
| **Docker Desktop** | Dernière version | **Recommandé** pour MySQL + PostgreSQL |
| **MySQL** | 8.0+ | Optionnel si vous utilisez Docker |
| **PostgreSQL** | 15.0+ | Optionnel si vous utilisez Docker |

---

## Installation du Projet

### 1. Cloner le projet

```bash
git clone https://github.com/x225franc/Avenir.git
cd Avenir
```

### 2. Installer les dépendances Node.js

```bash
npm install
```
ou 

```bash
npm run install:all
```

### 3. Configurer les bases de données

** Option A : Docker (Recommandé)**

Cette option démarre automatiquement MySQL, PostgreSQL, phpMyAdmin et pgAdmin :

```bash
# Démarrer tous les services (MySQL, PostgreSQL, phpMyAdmin, pgAdmin)
docker-compose up -d

# Vérifier que tout fonctionne
docker-compose ps
```

ps : les fixtures sont automatiquement importées au démarrage via les scripts SQL dans le dossier `db/`.

Cette commande démarre :
- **MySQL** sur le port `3306` (avec fixtures)
- **PostgreSQL** sur le port `5432` (avec fixtures)
- **phpMyAdmin** sur [http://localhost:8080](http://localhost:8080)
- **pgAdmin** sur [http://localhost:8081](http://localhost:8081)

#### Accéder aux interfaces web

**phpMyAdmin (MySQL)**
- **URL** : [http://localhost:8080](http://localhost:8080)
- **Utilisateur** : `root`
- **Mot de passe** : ``
- **Base de données** : `avenir_bank`

**pgAdmin (PostgreSQL)**
- **URL** : [http://localhost:8081](http://localhost:8081)
- **Email** : `admin@avenir.com`
- **Mot de passe** : `admin`

**Configuration du serveur PostgreSQL dans pgAdmin :**
1. Clic droit sur "Servers" → "Register" → "Server"
2. **General tab** :
   - Name : `Avenir PostgreSQL`
3. **Connection tab** :
   - Host : `postgres` (nom du service Docker)
   - Port : `5432`
   - Database : `avenir_bank`
   - Username : `avenir`
   - Password : `avenir123`
   - Save password : ✅
4. Cliquer sur "Save"

---

**Option B : Installation Locale (Laragon, XAMPP, etc.)**

<details>
<summary>Cliquer pour voir les instructions Laragon/XAMPP</summary>

**MySQL avec Laragon/XAMPP :**

1. **Démarrer Laragon/XAMPP** : Cliquer sur "Démarrer tout"
2. **Créer la base de données** :
   - Ouvrir PHPMyAdmin : [http://localhost/phpmyadmin](http://localhost/phpmyadmin)
   - Créer une nouvelle base : `avenir_bank` (interclassement: `utf8mb4_unicode_ci`)
3. **Importer le schéma** :
   - Sélectionner `avenir_bank`
   - Onglet "Importer" → Fichier `db/schema.sql` → "Exécuter"

**PostgreSQL avec pgAdmin :**

1. **Ouvrir pgAdmin**
2. **Créer la base de données** : `avenir_bank_postgres`
3. **Importer le schéma** : Exécuter `db/schema-postgresql.sql`

</details>

---

La base contient maintenant les utilisateurs de test, actions boursières et configuration bancaire

### 4. Configurer les variables d'environnement

Le projet utilise un fichier `.env` à la racine pour configurer les deux backends (Express/NestJS) et les deux bases de données (MySQL/PostgreSQL).

**Exemple de configuration `.env` :**

```env
# ========== MYSQL (Express) ==========
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=avenir
DB_PASSWORD=avenir_password
DB_NAME=avenir_bank

# ========== POSTGRESQL (NestJS) ==========
DB_POSTGRES_HOST=localhost
DB_POSTGRES_PORT=5432
DB_POSTGRES_USER=avenir
DB_POSTGRES_PASSWORD=avenir_password
DB_POSTGRES_NAME=avenir_bank_postgres

# ========== JWT & APP ==========
PORT=3001
JWT_SECRET=secret_super_securise_pour_jwt
NODE_ENV=development

# ========== EMAIL (Optionnel) ==========
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-mot-de-passe-application-gmail

# ========== FRONTEND ==========
FRONTEND_URL=http://localhost:3000
```

**Notes importantes :**
- Les variables `DB_*` sont pour **Express + MySQL**
- Les variables `DB_POSTGRES_*` sont pour **NestJS + PostgreSQL**
- Si vous utilisez Docker, les valeurs par défaut fonctionnent directement
- Pour les emails vous pouvez tester en utilisant vos propres identifiants
- Les comptes de test sont déjà vérifiés, l'email est optionnel pour tester

### 5. Lancer l'application

Le projet permet de lancer différentes combinaisons frontend / backend
afin de démontrer l’indépendance des couches (Clean Architecture).

**Démarrage complet (Docker + Express + Next.js) à la racine du projet**

```bash
npm run start
```

Cette commande lance automatiquement Docker (MySQL/PostgreSQL + outils) puis démarre l’API Express et le frontend Next.js.

### Combinaisons disponibles

| Commande | Backend | Frontend |
|--------|--------|---------|
| npm run dev:1 | Express (MySQL) | Next.js |
| npm run dev:2 | NestJS (PostgreSQL) | Next.js |
| npm run dev:3 | Express (MySQL) | Nuxt | (Bonus)
| npm run dev:4 | NestJS (PostgreSQL) | Nuxt | (Bonus)



**Accès :**
-  Frontend : [http://localhost:3000](http://localhost:3000)
-  API : [http://localhost:3001](http://localhost:3001)

**Pour arrêter :**
- `Ctrl+C` dans le terminal


---

## Comptes de Test

### Identifiants de Connexion

**Mot de passe identique pour tous les comptes :** `123`

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| `client@avenir-bank.fr` | `123` | **Client**|
| `advisor@avenir-bank.fr` | `123` | **Conseiller**|
| `director@avenir-bank.fr` | `123` | **Directeur**|

### Status des Comptes

- Tous les comptes ci dessus sont vérifiés
- Mots de passe de test simplifiés (hashés avec bcrypt en production)

---

## Scripts NPM Disponibles

```bash
# Installation
npm run install:all           # Installer toutes les dépendances (root + workspaces)

# Développement
npm start                     # Docker + Express + Next.js (dev:1)
npm run start:nestjs          # Docker + NestJS + Nuxt (dev:2)
npm run dev:1                 # Express + Next.js (workspace 1)
npm run dev:2                 # NestJS + Next.js (workspace 2)
npm run dev:3                 # Express + Nuxt (workspace 3)
npm run dev:4                 # NestJS + Nuxt (workspace 4)
npm run dev:express           # Express API uniquement
npm run dev:nestjs            # NestJS API uniquement
npm run dev:next              # Next.js frontend uniquement
npm run dev:nuxt              # Nuxt frontend uniquement
npm run docker:up             # Démarrer les services Docker (attend les healthchecks)
npm run docker:down           # Arrêter les services Docker

```

---

## API Endpoints Principaux

### Authentification
```
POST   /api/users/register           # Inscription utilisateur
POST   /api/users/login              # Connexion (retourne JWT)
GET    /api/users/me                 # Profil utilisateur connecté
GET    /api/users/verify-email       # Vérification email
POST   /api/users/forgot-password    # Demande reset password
POST   /api/users/reset-password     # Réinitialiser password
```

### Gestion des Comptes
```
GET    /api/accounts                 # Liste des comptes de l'utilisateur
POST   /api/accounts                 # Créer un nouveau compte
GET    /api/accounts/:id             # Détails d'un compte
GET    /api/accounts/:id/transactions # Transactions d'un compte
POST   /api/accounts/transfer        # Virement entre comptes
```

### Administration
```
GET    /api/admin/stocks             # Liste des actions boursières
POST   /api/admin/stocks             # Créer une action
PUT    /api/admin/stocks/:id         # Modifier une action
DELETE /api/admin/stocks/:id         # Supprimer une action
GET    /api/admin/savings-rate       # Taux d'épargne actuel
PUT    /api/admin/savings-rate       # Modifier le taux d'épargne
```

### Investissements
```
GET    /api/investment/stocks        # Actions disponibles
GET    /api/investment/portfolio     # Portfolio de l'utilisateur
POST   /api/investment/orders        # Passer un ordre d'achat/vente
GET    /api/investment/orders        # Historique des ordres
DELETE /api/investment/orders/:id    # Annuler un ordre
```

### Crédits
```
GET    /api/credits                  # Crédits de l'utilisateur
POST   /api/credits                  # Demander un crédit
GET    /api/credits/:id              # Détails d'un crédit
POST   /api/credits/:id/pay          # Effectuer un paiement
```

### Actualités
```
GET    /api/news                     # Liste des actualités
GET    /api/news/:id                 # Détail d'une actualité
POST   /api/news                     # Créer une actualité (conseiller/directeur)
PUT    /api/news/:id                 # Modifier une actualité
DELETE /api/news/:id                 # Supprimer une actualité
```

---

## Technologies Utilisées

### Backend
- **TypeScript** 5.0+
- **Express.js** 4.18+
- **MySQL** 8.0+
- **JWT** pour l'authentification
- **bcrypt** pour le hashage des mots de passe
- **Zod** pour la validation des données
- **Nodemailer** pour les emails transactionnels

### Frontend
- **Next.js** 15+ (App Router)
- **React** 19+ avec hooks
- **TypeScript** strict
- **Tailwind CSS** 3.4+ (mobile-first)
- **Zod** pour la validation côté client
- **Axios** pour les appels API
- **React Hook Form** pour les formulaires
---


### Sécurité
- Tokens JWT avec expiration
- Validation des entrées (Zod)
- Protection CORS configurée
- Middleware d'authentification sur routes protégées

### Base de Données
- Le schéma utilise **utf8mb4** pour les emojis et caractères spéciaux
- Les **IBANs** sont générés automatiquement (format FR76 XXXX XXXX XXXX XXXX XXXX XXX)
- Les **transactions** sont trackées avec status (PENDING, COMPLETED, FAILED)

### Performance
- **Cache système** : Headers HTTP pour assets statiques
- **Image optimization** : AVIF/WebP avec Next.js
- **Database indexing** : Index sur colonnes fréquemment requêtées
- **Connection pooling** : Pool MySQL réutilisable

### Email
- Email de test configuré dans `.env`
- Les comptes de test sont déjà vérifiés (pas besoin de confirmer l'email)
