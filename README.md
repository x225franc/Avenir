# 🏦 Banque AVENIR

## Clean Code & Clean Architecture - Projet Pédagogique

---

## 📋 Introduction

La banque **AVENIR** (Alliance de Valeurs Économiques et Nationnales Investies Responsablement) vous a recruté comme développeur Web afin de pouvoir l'aider à développer son métier et concurrencer les banques traditionnelles.

**Objectif :** Créer une application Web permettant à ses clients de gérer efficacement leurs liquidités, épargne et investissements.

---

## 🏗️ Architecture du Projet

Ce projet utilise une architecture **monorepo** avec plusieurs interfaces et implémentations :

```
Avenir/
├── Interface/
│   ├── api/
│   │   ├── express/          # Backend Express + TypeScript
│   │   └── nestjs/           # Backend NestJS (alternatif)
│   └── web/
│       ├── next/             # Frontend Next.js + React
│       └── nuxt/             # Frontend Nuxt + Vue (alternatif)
├── package.json              # Configuration monorepo
└── README.md                 # Ce fichier
```

### 🎯 Frameworks disponibles

**Backend (2 implémentations) :**
- ✅ **Express** : API REST complète avec Clean Architecture
- ⏳ **NestJS** : Alternative avec modules et décorateurs

**Frontend (2 implémentations) :**
- ✅ **Next.js** : Application React avec App Router
- ⏳ **Nuxt** : Alternative Vue.js avec SSR

---

## 🚀 Installation et Lancement

### 📋 Prérequis

- **Node.js** 18+ 
- **MySQL** (Laragon ou XAMPP)
- **Git**

### 📦 Installation

1. **Cloner le projet :**
```bash
git clone https://github.com/x225franc/Avenir.git
cd Avenir
```

2. **Installer toutes les dépendances :**
```bash
npm run install:all
```

### 🗄️ Configuration Base de Données

1. **Démarrer MySQL** (via Laragon/XAMPP)

2. **Créer la base de données :**
```sql
CREATE DATABASE avenir_bank CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

3. **Configurer les variables d'environnement :**

**Pour Express :** `Interface/api/express/.env`
```env
# Base de données
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=avenir_bank

# JWT
JWT_SECRET=votre_secret_jwt_tres_long_et_securise

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=contact.omnimatci@gmail.com
EMAIL_PASS=qcxrqurnnignfobz

# URLs
FRONTEND_URL=http://localhost:3000
```

4. **Importer le schéma :**
```bash
mysql -u root -p avenir_bank < database/schema.sql
```

### 🎮 Lancement du Projet

#### 🔥 Option 1 : Express + Next.js (Recommandé)
```bash
npm run dev:1
```
- **Backend Express** : http://localhost:3001
- **Frontend Next.js** : http://localhost:3000

#### 🔄 Option 2 : NestJS + Nuxt
```bash
npm run dev:2
```
- **Backend NestJS** : http://localhost:3002
- **Frontend Nuxt** : http://localhost:3001

#### 🧩 Lancement individuel

**Express uniquement :**
```bash
npm run dev:express
```

**Next.js uniquement :**
```bash
npm run dev:next
```

**NestJS uniquement :**
```bash
npm run dev:nestjs
```

**Nuxt uniquement :**
```bash
npm run dev:nuxt
```

---

## 🧪 Comptes de Test

### 👤 Client Test
- **Email :** `client@example.com`
- **Mot de passe :** `password123`
- **Rôle :** Client

### 👨‍💼 Conseiller Test
- **Email :** `advisor@avenir-bank.fr`
- **Mot de passe :** `password123`
- **Rôle :** Conseiller

### 👔 Directeur Test
- **Email :** `director@avenir-bank.fr`
- **Mot de passe :** `password123`
- **Rôle :** Directeur

---

## 🔧 Scripts Disponibles

```bash
# Installation
npm run install:all           # Installer toutes les dépendances

# Développement
npm run dev:1                 # Express + Next.js
npm run dev:2                 # NestJS + Nuxt
npm run dev:express           # Express uniquement
npm run dev:nestjs            # NestJS uniquement  
npm run dev:next              # Next.js uniquement
npm run dev:nuxt              # Nuxt uniquement

# Production
npm run build                 # Build tous les projets
```

---

## 🎯 Fonctionnalités Actuelles

### ✅ Fonctionnelles
- **Authentification complète** : Inscription, vérification email, connexion, reset password
- **Dashboard moderne** : Vue d'ensemble des comptes avec stats
- **Gestion des comptes** : Création automatique, types (courant, épargne, investissement)
- **Système email** : Templates HTML professionnels
- **Sécurité** : JWT, bcrypt, validation Zod

### ⏳ En Développement
- **Transferts d'argent** : Entre comptes de la banque
- **Chat temps réel** : WebSocket client-conseiller
- **Feed actualités** : SSE pour notifications temps réel
- **Interface admin** : Gestion taux épargne, actions
- **Système de crédit** : Calcul mensualités, gestion

---

## 🔍 API Endpoints (Express)

```
# Authentification
POST   /api/users/register           # Inscription
POST   /api/users/login              # Connexion  
GET    /api/users/me                 # Profil utilisateur
GET    /api/users/verify-email       # Vérification email
POST   /api/users/forgot-password    # Demande reset password
POST   /api/users/reset-password     # Reset password

# Comptes
GET    /api/accounts                 # Liste comptes
POST   /api/accounts                 # Créer compte
GET    /api/accounts/:id             # Détail compte
PUT    /api/accounts/:id             # Modifier compte
DELETE /api/accounts/:id             # Supprimer compte
```

---

## 💡 Notes Techniques

- **TypeScript** strict sur backend et frontend
- **Clean Architecture** : Domain → Application → Interface → Infrastructure
- **Validation** : Zod schemas côté client et serveur
- **Base de données** : MySQL avec pool de connexions
- **Email** : Nodemailer + Gmail SMTP
- **Authentification** : JWT avec expiration 7 jours
- **Responsive** : Tailwind CSS mobile-first

---

**🎉 Le projet est prêt ! Lancez `npm run dev:1` et rendez-vous sur http://localhost:3000**
