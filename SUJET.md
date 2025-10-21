# 🏦 Banque AVENIR

## Clean Code & Clean Architecture - Projet Pédagogique

---

## 📋 Introduction

La banque **AVENIR** (Alliance de Valeurs Économiques et Nationnales Investies Responsablement) vous a recruté comme développeur Web afin de pouvoir l'aider à développer son métier et concurrencer les banques traditionnelles.

**Objectif :** Créer une application Web permettant à ses clients de gérer efficacement leurs liquidités, épargne et investissements.

---

## ⚡ Fonctionnalités (15 points)

### 👤 Client

#### 🔐 Authentification
- ✅ En tant que client, je dois pouvoir m'inscrire sur cette nouvelle plateforme
- ✅ Je dois pouvoir renseigner mes informations afin de recevoir un lien me permettant de confirmer mon inscription et accéder à mon compte (qui sera automatiquement créé à l'inscription)

#### 💰 Comptes
- ✅ En tant que client, je dois pouvoir disposer d'autant de comptes que je le souhaite
- ✅ Un nouvel IBAN unique et valide mathématiquement doit être généré chaque fois que je crée un compte (Value Object IBAN créé)
- ✅ Je dois pouvoir supprimer le compte et modifier son nom personnalisé si je le souhaite

#### 🔄 Opérations
- ✅ En tant que client, je dois pouvoir effectuer des opérations courantes, tel qu'un transfert d'un compte à un autre
- ✅ Le solde d'un compte doit refléter la somme des opérations de débit et de crédit

#### 🏦 Épargne
- ✅ En tant que client, je dois pouvoir ouvrir un compte d'épargne
- ✅ Celui-ci doit pouvoir me permettre d'effectuer des opérations entrantes et sortantes
- ✅ Ce dernier sera rémunéré tous les jours, au taux en vigueur fixé par les administrateurs

#### 🔑 Gestion de compte et sécurité 
- ✅ En tant que client, je peux réinitialiser mon mot de passe via email sécurisé
- ✅ Je reçois des emails de confirmation avec tokens d'expiration (24h vérification, 1h reset)
- ✅ Mon compte est automatiquement créé à l'inscription avec un compte courant
- ✅ J'ai accès à un dashboard moderne avec vue d'ensemble de mes comptes
- ✅ Les erreurs de connexion s'affichent sans rechargement de page

#### 📧 Système de notification 
- ✅ Email de vérification avec design professionnel et lien sécurisé
- ✅ Email de bienvenue après validation du compte
- ✅ Email de réinitialisation de mot de passe avec expiration
- ✅ Système prêt pour notifications de changement de taux d'épargne

#### 📈 Investissement
- ✅ En tant que client, je dois pouvoir enregistrer des ordres d'achat ou de vente d'une action
- ✅ Une action est un titre financier d'appartenance à une entreprise côtée sur un marché financier
- ✅ Le cours est calculé en fonction du prix d'équilibre entre un prix de vente et un prix d'achat, selon le carnet d'ordre global pour une action
- ✅ Étant donné que nous sommes une banque moderne, nous n'avons pas de frais d'arbitrage
- ✅ Les seuls frais sont de **1€** à l'achat, comme à la vente

---

### 🎯 Directeur de banque

#### 🔐 Authentification
- ⏳ En tant que directeur de banque, je dois pouvoir m'authentifier

#### 👥 Gestion des comptes
- ⏳ En tant que directeur de banque, je dois pouvoir créer, modifier ou supprimer un compte client ou le bannir

#### 📊 Fixation du taux d'épargne
- ⏳ En tant que directeur de la banque, je dois pouvoir effectuer une modification du taux d'épargne disponible pour les comptes d'épargne
- ⏳ Ce faisant, tous les clients ayant actuellement un compte d'épargne doivent avoir une notification en ce qui concerne le changement du taux qui a été fixé lors de la modification

#### 📈 Actions
- ⏳ En tant que directeur de banque, je suis celui qui crée, modifie et supprime les actions
- ⏳ Je n'ai pas la possibilité de modifier le cours d'une action, mais c'est moi qui décide quelles sont les actions disponibles de celles qui ne le sont pas
- ⏳ Les clients sont propriétaires de leurs actions, contrairement à certains de nos concurrents qui ne le disent pas, nous l'affichons fièrement

---

### 🤝 Conseiller de banque

#### 🔐 Authentification
- ⏳ En tant que conseiller bancaire, je peux m'authentifier

#### 📰 Actualités
- ⏳ En tant que conseiller bancaire, je peux consulter les actualités de la banque
- ⏳ Je peux également recevoir des notifications concernant les mises à jour importantes
- ⏳ Je peux également créer des actualités pour informer les clients

#### 👥 Gestion des clients
- ⏳ En tant que conseiller bancaire, je peux uniquement consulter la liste des clients
- ⏳ Je peux également valider ou refuser les transactions des clients en attente de validation


#### 💳 Crédit
- ⏳ En tant que conseiller bancaire, je peux être amené à octroyer des crédits
- ⏳ Un crédit a :
  - Un **taux annuel d'intérêts** à rembourser sur le capital restant chaque mois
  - Une **assurance** (obligatoire) à un taux dont le montant est calculé sur le total du crédit accordé et prélevé sur les mensualités
  - Des **mensualités** qui correspondent au montant du crédit remboursé chaque mois
- ⏳ Nous utilisons la méthode de calcul du crédit à **mensualité constante**

#### 💬 Messagerie instantanée
- ⏳ En tant que conseiller bancaire, je peux répondre aux messages qui me sont envoyés de la part de mes clients
- ⏳ Étant donné que nous sommes une banque moderne, chaque fois qu'un message est envoyé et en attente de réponse, tous les conseillers peuvent le voir
- ⏳ Néanmoins à partir du premier message, la discussion est reliée au conseiller bancaire qui a répondu en premier au client
- ⏳ En cas de besoin, la discussion peut être transférée d'un conseiller à un autre, auquel cas le transfert de la discussion se fait entre les deux conseillers

---

## 🛠️ Contraintes techniques

### 1. 🔧 Langage
 Développement en **TypeScript**

### 2. 🏗️ Clean Architecture
- **Séparation stricte des couches :**
  -  **Domain** (Entities) - User, Account avec logique métier complète
  -  **Application** (Use Cases) - RegisterUser, LoginUser, VerifyEmail, RequestPasswordReset, ResetPassword
  -  **Interface** (API/Interface utilisateur) - Controllers Express + Pages Next.js complètes
  -  **Infrastructure** (base de données, frameworks) - MySQL repositories + Email service
- **2 adaptateurs pour les bases de données :**
  - ⏳ **MySQL** (SQL) - en cours
  - ⏳ **Postgres** - À créer pour tests
- **2 frameworks backend :**
  - ⏳ **Express** - en cours
  - ⏳ **NestJS** - À créer

### 3. 📝 Clean Code
- ⏳ Respect des principes de Clean Code vus en cours
- ⏳ Les pratiques supplémentaires et documentées sous la forme d'œuvres et d'ouvrages sont aussi à prendre en compte (livres de Bob Martin, etc)

---

## 🎁 Bonus

### 1. 🔄 CQRS
- Utiliser des **commandes** pour les requêtes
- Utiliser des **queries** pour les demandes
- Permet de préparer l'Event-Sourcing

### 2. 📊 Event-Sourcing
- Utiliser l'Event-Sourcing avec comme objectif le retour dans le temps des événements passés
- Utilisation de **microservices** bienvenue

### 3. 🖥️ Framework Frontend
- Utilisation de plusieurs frameworks frontend
- **Angular**, **React** & **Solid.js** à privilégier

---

# 🌐 Web en Temps Réel

## Projet pédagogique

---

## 📋 Introduction

## ⚡ Fonctionnalités (18 points)

### 👤 Client

#### 🔐 Authentification
✅ En tant que client, je dois pouvoir m'inscrire sur cette nouvelle plateforme. Je dois pouvoir renseigner mes informations afin de recevoir un lien me permettant de confirmer mon inscription et d'accéder à mon compte (qui sera automatiquement créé à l'inscription).

#### 💬 Discussion privée
⏳ En tant que client, je dois pouvoir contacter mon conseiller via messages privés en temps réel.

#### 📰 Activités et feed
⏳ En tant que client je dois pouvoir, sur mon espace, consulter en temps réel les actualités de ma banque.

---

### 🤝 Conseiller de banque

#### 📰 Activités
⏳ En tant que conseiller, je dois pouvoir créer une nouvelle actualité consultable par les clients.

#### 🔔 Notification
⏳ En tant que conseiller, je peux envoyer une notification en temps réel à l'un de mes clients. La notification doit être personnalisée en fonction du besoin.

#### 💬 Discussion privée
⏳ En tant que conseiller, je peux répondre aux clients qui m'ont contacté via message privé en temps réel.

---

### 👥 Conseiller de banque et directeur de banque

#### 💬 Discussion de groupe
⏳ En tant que conseiller ou directeur, je dois pouvoir communiquer via une discussion de groupe avec tout le monde en temps réel. Le directeur de banque doit se démarquer visuellement dans la conversation.

---

## 🛠️ Contraintes techniques

### 1. 🔧 Langage
⏳ Développement en **TypeScript** (backend et frontend).

### 2. 🌐 Web Temps Réel
- ⏳ Le système de **chat** doit être réalisé via **web socket**.
- ⏳ Le système de **Feed et de notification** doit être réalisé via **SSE** (Server-Sent Events).

### 3. 🧪 Fixtures
⏳ Le projet devra avoir des **fixtures** et/ou des **jeux de données** afin de tester rapidement toutes les fonctionnalités.

### 4. 📖 README
⏳ Le README de votre projet devra contenir les informations suivantes :
- Le Prénom, NOM et classe de toutes les personnes
- Toutes les étapes sur comment installer / lancer le projet
- Toutes les étapes pour avoir des jeux de données et les identifiants d'un compte de test (un compte utilisateur et un compte admin)

---

## 🎁 BONUS

### 💭 Statut "En train d'écrire"
⏳ Afficher le statut « En train d'écrire » si un client ou un conseiller est en train d'envoyer un message dans la partie « contacter un conseiller ».

### 🔔 Notifications Push
⏳ Faire le lien entre les notifications administrateur et l'API web « notification push ».

---


---
---
---



# 🧱 Sujet NextJS – 5IW

## 🧩 Contexte
Ce sujet a pour objectif d’ajouter des instructions pour la réalisation du **frontend** du projet **Clean Architecture**.  
Le travail sera **évalué** et constituera la **note de partiel** pour la matière **NextJS**.

---

## 📝 Instructions

### 🎨 Structure et conception
- ✅ Respecter une approche **Atomic Design** pour la construction des composants.  
- ✅ Utiliser un ou plusieurs **contexts** (`React Context`) - AuthContext implémenté pour authentification globale.  

### 🧠 Gestion des formulaires
- Les formulaires doivent être gérés avec **React Hook Form**.  
- La validation doit s’appuyer sur des **schémas** (ex : `zod`).  

### ⚠️ Gestion des erreurs
- Intégrer des pages **404** et **500**, en accord avec la charte graphique de l’application.  

### 🌐 Internationalisation
- L’application doit être traduite en **français** et en **anglais**.  

### 🗺️ SEO et structure du site
- Fournir un fichier **`sitemap.xml`** listant les pages de l’application.  
- Intégrer correctement les **métadonnées SEO** (titre, description, etc.) sur la page d’accueil.  

### ⚡ Optimisation et performance
- Mettre en place un **système de cache**, qu’il soit **applicatif** ou côté **API**.  

---

## 💎 Bonus (optionnel)
- Gestion du **cache** via **Redis**.  
- Ajout d’**animations** sur les tableaux, cartes ou listes.  
- Mise en place d’un **Drag & Drop** (ex : déplacer de l’argent d’un compte à un autre).  

---

## ✅ Livrables attendus
- ✅ Un projet **Next.js** fonctionnel conforme aux instructions ci-dessus.  
- ✅ Un dépôt Git propre, avec un **README clair** et une structure respectant les **bonnes pratiques** du framework.  

---