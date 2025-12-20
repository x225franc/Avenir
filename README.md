# Banque AVENIR

## Clean Code & Clean Architecture - Projet Pédagogique

**Alliance de Valeurs Économiques et Nationales Investies Responsablement**

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

| Logiciel | Version Minimale |
|----------|------------------|
| **Node.js** | 20.0.0+ |
| **npm** | 9.0.0+ |
| **MySQL** | 8.0+ |

---

## Installation du Projet

### 1. Cloner le projet

```bash
git clone https://github.com/x225franc/Avenir.git
cd Avenir
```

### 2. Installer les dépendances Node.js

```bash
npm run install:all
```

### 3. Configurer la base de données avec Laragon

1. **Démarrer Laragon** : Cliquer sur "Démarrer tout"
2. **Créer la base de données** :
   - Ouvrir PHPMyAdmin : [http://localhost/phpmyadmin](http://localhost/phpmyadmin)
   - Créer une nouvelle base : `avenir_bank` (interclassement: `utf8mb4_unicode_ci`)
3. **Importer le schéma** :
   - Sélectionner `avenir_bank`
   - Onglet "Importer" → Fichier `db/schema.sql` → "Exécuter"

La base contient maintenant les utilisateurs de test, actions boursières et configuration

### 4. Configurer les variables d'environnement


```bash
Utilisez le fichier `.env` fourni 
et ajustez si nécessaire (ex. paramètres email).
```

### 5. Lancer l'application (Express + Next.js)

```bash
npm run dev:1
```

**Accès :**
- 🌐 Frontend : [http://localhost:3000](http://localhost:3000)
- 🔧 API : [http://localhost:3001](http://localhost:3001)

**Pour arrêter :**
- `Ctrl+C` dans le terminal

### 6. Premier test

1. Ouvrir [http://localhost:3000](http://localhost:3000)
2. Se connecter avec : `client@avenir-bank.fr` / `123`
3. Explorer le dashboard, comptes, investissements, etc.

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
- Chaque compte **client** possède un **compte courant** pré-chargé
- Mots de passe de test simplifiés (hashés avec bcrypt en production)

---

## Scripts NPM Disponibles

```bash
# Installation
npm run install:all           # Installer toutes les dépendances (root + workspaces)

# Développement
npm run dev:1                 # Express + Next.js (workspace 1)
npm run dev:2                 # NestJS + Nuxt (workspace 2)
npm run dev:express           # Express API uniquement
npm run dev:nestjs            # NestJS API uniquement
npm run dev:next              # Next.js frontend uniquement
npm run dev:nuxt              # Nuxt frontend uniquement

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
GET    /api/investments/stocks       # Actions disponibles
GET    /api/investments/portfolio    # Portfolio de l'utilisateur
POST   /api/investments/orders       # Passer un ordre d'achat/vente
GET    /api/investments/orders       # Historique des ordres
DELETE /api/investments/orders/:id   # Annuler un ordre
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

## Notes Importantes

### Sécurité
- Tokens JWT avec expiration
- Validation des entrées (Zod)
- Protection CORS configurée
- Middleware d'authentification sur routes protégées

### Base de Données
- Les **fixtures** sont importées via PHPMyAdmin (voir section installation)
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
