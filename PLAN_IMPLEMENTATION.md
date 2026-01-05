# 📋 Plan d'Implémentation - Nuxt/NestJS

**Date:** 2026-01-04
**Objectif:** Compléter l'application bancaire Nuxt/NestJS avec Clean Architecture

---

## ✅ Ce qui est déjà fait

### Backend NestJS
- ✅ 10 modules créés (Auth, Accounts, Transactions, Messages, Investments, Credits, News, Admin, Advisor, Users)
- ✅ 50+ endpoints fonctionnels
- ✅ Guards et middlewares (JWT, Roles)
- ✅ PostgreSQL avec repositories
- ✅ WebSockets Gateway + SSE Controller

### Frontend Nuxt
- ✅ 30+ pages créées (client, advisor, director)
- ✅ Layouts (default, auth, dashboard)
- ✅ Middleware (auth, guest, role)
- ✅ Stores Pinia (auth, notifications, ui)
- ✅ Composables (useApi, useAuth)

### Use Cases Existants
Tous les Use Cases sont **déjà créés** dans `Application/use-cases/` :
- ✅ 5 Use Cases Account (CreateAccount, TransferMoney, DepositMoney, WithdrawMoney, ApplyDailyInterest)
- ✅ 6 Use Cases Admin (Stocks, SavingsRate)
- ✅ 3 Use Cases Credit (GrantCredit, ProcessMonthlyPayments, GetUserCredits)
- ✅ 3 Use Cases Internal-Message
- ✅ 4 Use Cases Investment (PlaceOrder, CancelOrder, GetPortfolio, GetStocks)
- ✅ 8 Use Cases Message
- ✅ 4 Use Cases News
- ✅ 5 Use Cases User (Register, Login, VerifyEmail, RequestPasswordReset, ResetPassword)
- ✅ 1 Use Case Transaction (TransferMoney existe aussi ici)

**Total : 39 Use Cases existants** ✨

---

## 🔴 PRIORITÉ 1 : Modules Backend Manquants (NestJS)

### 1.1 Module Operations (CRITIQUE)
**Fichiers à créer :**
```
Interface/api/nestjs/src/modules/operations/
├── operations.module.ts
├── operations.controller.ts
├── operations.service.ts
└── dto/
    ├── deposit.dto.ts
    └── withdraw.dto.ts
```

**Endpoints :**
- `POST /operations/deposit` - Utiliser `DepositMoney` use case
- `POST /operations/withdraw` - Utiliser `WithdrawMoney` use case

**Use Cases à utiliser :**
- ✅ `Application/use-cases/account/DepositMoney.ts`
- ✅ `Application/use-cases/account/WithdrawMoney.ts`

---

### 1.2 Module Internal Messages (Admin Chat)
**Fichiers à créer :**
```
Interface/api/nestjs/src/modules/internal-messages/
├── internal-messages.module.ts
├── internal-messages.controller.ts
├── internal-messages.service.ts
└── dto/
    └── send-internal-message.dto.ts
```

**Endpoints :**
- `POST /internal-messages` - Envoyer message interne
- `GET /internal-messages/:userId` - Messages avec un utilisateur
- `GET /internal-messages/staff` - Liste staff members

**Use Cases à utiliser :**
- ✅ `Application/use-cases/internal-message/SendInternalMessage.ts`
- ✅ `Application/use-cases/internal-message/GetInternalMessages.ts`
- ✅ `Application/use-cases/internal-message/GetStaffMembers.ts`

---

### 1.3 Endpoints Manquants - Transactions
**Fichier à modifier :** `transactions.controller.ts`

**Nouveaux endpoints :**
- `GET /transactions/account/:accountId` - Historique d'un compte spécifique
- `GET /transactions/iban/lookup/:iban` - Recherche compte par IBAN
- `POST /transactions/iban` - Transfert vers IBAN externe

**Méthodes à ajouter au service :**
```typescript
async getAccountTransactions(accountId: string)
async lookupByIban(iban: string)
async transferToExternalIban(userId: string, transferDto: TransferToIbanDto)
```

---

### 1.4 Endpoints Manquants - Credits
**Fichier à modifier :** `credits.controller.ts`

**Nouveaux endpoints :**
- `GET /credits/calculate` - Simulateur de crédit (calcul mensualités)

**Méthode à ajouter au service :**
```typescript
async calculateCredit(amount: number, durationMonths: number, rate: number)
```

---

### 1.5 Endpoints Manquants - Investments
**Fichier à modifier :** `investments.controller.ts`

**Nouveaux endpoints :**
- `GET /investments/orders` - Historique des ordres de l'utilisateur

**Méthode à ajouter au service :**
```typescript
async getUserOrders(userId: string)
```

---

## 🟡 PRIORITÉ 2 : Intégrer les Use Cases (Clean Architecture)

**⚠️ IMPORTANT :** Les Use Cases existent déjà ! Il faut juste **modifier les services NestJS** pour les utiliser au lieu d'appeler directement les repositories.

### 2.1 Refactoring Critical (Logique Métier Complexe)

#### ✅ Transactions Service
**Fichier :** `transactions.service.ts`

**Avant (simplifié) :**
```typescript
async transfer(userId: string, dto: TransferDto) {
  const fromAccount = await this.accountRepository.findByIban(dto.fromIban);
  const toAccount = await this.accountRepository.findByIban(dto.toIban);
  // ... logique métier directe
  fromAccount.debit(amount);
  toAccount.credit(amount);
  await this.accountRepository.save(fromAccount);
  // ...
}
```

**Après (avec Use Case) :**
```typescript
async transfer(userId: string, dto: TransferDto) {
  const transferUseCase = new TransferMoney(
    this.accountRepository,
    this.transactionRepository
  );
  return await transferUseCase.execute({
    userId,
    fromIban: dto.fromIban,
    toIban: dto.toIban,
    amount: dto.amount,
    description: dto.description
  });
}
```

**Use Cases à intégrer :**
- ✅ `Application/use-cases/account/TransferMoney.ts` (existe aussi dans transaction/)

---

#### ✅ Investments Service
**Fichier :** `investments.service.ts`

**Use Cases à intégrer :**
- ✅ `Application/use-cases/investment/PlaceInvestmentOrder.ts`
- ✅ `Application/use-cases/investment/CancelInvestmentOrder.ts`
- ✅ `Application/use-cases/investment/GetUserPortfolio.ts`
- ✅ `Application/use-cases/investment/GetAvailableStocks.ts`

---

#### ✅ Credits Service
**Fichier :** `credits.service.ts`

**Use Cases à intégrer :**
- ✅ `Application/use-cases/credit/GrantCredit.ts`
- ✅ `Application/use-cases/credit/ProcessMonthlyPayments.ts`
- ✅ `Application/use-cases/credit/GetUserCredits.ts`

---

#### ✅ Admin Service
**Fichier :** `admin.service.ts`

**Use Cases à intégrer :**
- ✅ `Application/use-cases/admin/CreateStock.ts`
- ✅ `Application/use-cases/admin/UpdateStock.ts`
- ✅ `Application/use-cases/admin/DeleteStock.ts`
- ✅ `Application/use-cases/admin/GetAllStocks.ts`
- ✅ `Application/use-cases/admin/UpdateSavingsRate.ts`
- ✅ `Application/use-cases/admin/GetSavingsRate.ts`
- ✅ `Application/use-cases/account/ApplyDailyInterest.ts` (pour applyInterest)

---

### 2.2 Refactoring Standard (Opérations CRUD)

#### ✅ Accounts Service
**Fichier :** `accounts.service.ts`

**Use Cases à intégrer :**
- ✅ `Application/use-cases/account/CreateAccount.ts`

---

#### ✅ Auth Service
**Fichier :** `auth.service.ts`

**Use Cases à intégrer :**
- ✅ `Application/use-cases/user/RegisterUser.ts`
- ✅ `Application/use-cases/user/LoginUser.ts`
- ✅ `Application/use-cases/user/VerifyEmail.ts`
- ✅ `Application/use-cases/user/RequestPasswordReset.ts`
- ✅ `Application/use-cases/user/ResetPassword.ts`

---

#### ✅ Messages Service
**Fichier :** `messages.service.ts`

**Use Cases à intégrer :**
- ✅ `Application/use-cases/message/SendMessage.ts`
- ✅ `Application/use-cases/message/GetConversations.ts`
- ✅ `Application/use-cases/message/GetConversation.ts`
- ✅ `Application/use-cases/message/AssignConversation.ts`
- ✅ `Application/use-cases/message/TransferConversation.ts`
- ✅ `Application/use-cases/message/CloseConversation.ts`
- ✅ `Application/use-cases/message/MarkConversationAsRead.ts`
- ✅ `Application/use-cases/message/CheckOpenConversation.ts`

---

#### ✅ News Service
**Fichier :** `news.service.ts`

**Use Cases à intégrer :**
- ✅ `Application/use-cases/news/CreateNews.ts`
- ✅ `Application/use-cases/news/UpdateNews.ts`
- ✅ `Application/use-cases/news/DeleteNews.ts`
- ✅ `Application/use-cases/news/GetNews.ts`

---

## 🟢 PRIORITÉ 3 : Pages Frontend Nuxt Non Fonctionnelles

### 3.1 Pages Client

#### Dashboard
**Fichier :** `pages/dashboard/index.vue`
- [ ] Connecter aux APIs (accounts, transactions, portfolio)
- [ ] Afficher widgets statistiques
- [ ] Graphiques soldes/transactions

#### Transfers
**Fichiers :**
- `pages/dashboard/transfers/index.vue` - Liste virements
- `pages/dashboard/transfers/create.vue` - Créer virement

**Endpoints à utiliser :**
- `GET /transactions` - Liste virements
- `POST /transactions/transfer` - Créer virement
- `GET /transactions/iban/lookup/:iban` - Recherche destinataire

#### Credits
**Fichiers :**
- `pages/dashboard/credits/index.vue` - Mes crédits
- `pages/dashboard/credits/apply.vue` - Demander crédit

**Endpoints à utiliser :**
- `GET /credits/user/:userId` - Mes crédits
- `GET /credits/calculate` - Simulateur
- `POST /credits/grant` - Demander crédit (sera approuvé par conseiller)

#### Messages
**Fichier :** `pages/messages/index.vue`

**Endpoints à utiliser :**
- `GET /messages/conversations` - Liste conversations
- `GET /messages/conversation/:id` - Messages
- `POST /messages/send` - Envoyer message

---

### 3.2 Pages Advisor

#### Dashboard
**Fichier :** `pages/advisor/dashboard.vue`
- [ ] Stats conseillers
- [ ] Liste clients assignés
- [ ] Transactions en attente

#### Clients
**Fichiers :**
- `pages/advisor/clients/index.vue` - Liste clients
- `pages/advisor/clients/[id].vue` - Détail client

**Endpoints à utiliser :**
- `GET /advisor/clients` - Mes clients
- `GET /accounts/user/:userId` - Comptes d'un client
- `GET /transactions` - Transactions client

#### Credits
**Fichier :** `pages/advisor/credits/grant.vue`

**Endpoints à utiliser :**
- `POST /credits/grant` - Octroyer crédit

---

### 3.3 Chat Interne

**Fichiers :**
- `pages/admin/internal-chat.vue`
- `pages/advisor/internal-chat.vue`

**Endpoints à créer puis utiliser :**
- `GET /internal-messages/:userId` - Messages avec utilisateur
- `POST /internal-messages` - Envoyer message
- `GET /internal-messages/staff` - Liste staff

---

## 🔵 PRIORITÉ 4 : Fonctionnalités Avancées

### 4.1 Cron Jobs
**Fichier à créer :** `src/cron/interest.cron.ts`

- [ ] Tâche quotidienne : Application intérêts (utiliser `ApplyDailyInterest` use case)
- [ ] Tâche mensuelle : Paiements crédits (utiliser `ProcessMonthlyPayments` use case)

### 4.2 SSE/WebSocket
- [ ] Intégrer WebSocket avec événements métier
- [ ] SSE pour notifications temps réel
- [ ] Authentification JWT sur WebSocket

### 4.3 File Upload
- [ ] Multer configuration
- [ ] Upload photos profil
- [ ] Upload documents crédits

### 4.4 PDF Generation
- [ ] Relevés bancaires
- [ ] Contrats crédits
- [ ] Récapitulatifs transactions

### 4.5 Email Templates
- [ ] Améliorer templates email
- [ ] Notifications transaction
- [ ] Alertes solde

---

## 📊 Récapitulatif Chiffré

| Catégorie | Tâches | Estimation |
|-----------|--------|------------|
| **Nouveaux Modules Backend** | 2 modules (Operations, Internal-Messages) | 1 jour |
| **Endpoints Manquants** | ~7 endpoints | 0.5 jour |
| **Refactoring Use Cases** | 9 services à refactorer | 2-3 jours |
| **Pages Frontend** | ~15 pages à connecter | 2-3 jours |
| **Fonctionnalités Avancées** | 5 features | 2-3 jours |
| **Tests & Debug** | Tests E2E | 1-2 jours |
| **TOTAL** | | **9-13 jours** |

---

## 🎯 Ordre d'Implémentation Recommandé

### ✅ Phase 1 : Backend Core (COMPLÉTÉ - 04/01/2026)
1. ✅ Créer module Operations (deposit/withdraw)
2. ✅ Créer module Internal Messages
3. ✅ Ajouter endpoints manquants (transactions, credits, investments)

**Détails Phase 1 :**
- ✅ Module Operations créé avec endpoints deposit/withdraw utilisant Use Cases
- ✅ Module Internal Messages créé avec 3 endpoints utilisant Use Cases
- ✅ 3 nouveaux endpoints Transactions (account/:id, iban/lookup/:iban, iban POST)
- ✅ 1 nouveau endpoint Credits (POST /calculate pour simulateur)
- ✅ 1 nouveau endpoint Investments (GET /orders pour historique)

### Phase 2 : Intégrer Use Cases (2-3 jours)
**⚠️ Services CRITIQUES (logique complexe) en priorité :**
1. Transactions Service → TransferMoney
2. Investments Service → PlaceOrder, CancelOrder, Portfolio
3. Credits Service → GrantCredit, ProcessPayments
4. Admin Service → ApplyInterest

**Services Standard :**
5. Auth Service (5 use cases)
6. Messages Service (8 use cases)
7. News Service (4 use cases)
8. Accounts Service (1 use case)

### Phase 3 : Frontend Fonctionnel (2-3 jours)
1. Dashboard client (stats, widgets)
2. Pages Transfers (liste + création)
3. Pages Credits (liste + demande + simulateur)
4. Pages Messages (conversations)
5. Pages Advisor (clients, dashboard)
6. Chat interne (admin + advisor)

### Phase 4 : Features Avancées (2-3 jours)
1. Cron jobs (intérêts + paiements)
2. SSE/WebSocket notifications
3. File upload
4. PDF generation
5. Email templates

### Phase 5 : Tests & Polish (1-2 jours)
1. Tests E2E Playwright/Cypress
2. Tests unitaires Use Cases
3. Fix bugs
4. Documentation API (Swagger)

---

## 📝 Checklist de Progression

### Backend - Modules Manquants
- [x] Module Operations (deposit/withdraw)
- [x] Module Internal Messages
- [x] Endpoints transactions manquants
- [x] Endpoint credits/calculate
- [x] Endpoint investments/orders

### Backend - Refactoring Use Cases
**Services Critiques :**
- [ ] Transactions Service
- [ ] Investments Service
- [ ] Credits Service
- [ ] Admin Service (applyInterest)

**Services Standard :**
- [ ] Auth Service
- [ ] Accounts Service
- [ ] Messages Service
- [ ] News Service

### Frontend - Pages Client
- [ ] Dashboard
- [ ] Transfers (liste + création)
- [ ] Credits (liste + demande)
- [ ] Messages

### Frontend - Pages Advisor
- [ ] Dashboard
- [ ] Clients (liste + détail)
- [ ] Credits (octroyer)
- [ ] Messages

### Frontend - Pages Admin
- [ ] Chat interne fonctionnel

### Features Avancées
- [ ] Cron jobs
- [ ] WebSocket/SSE
- [ ] File upload
- [ ] PDF generation
- [ ] Email templates

---

## 🚨 Points d'Attention

### 1. Use Cases Pattern
**Exemple d'utilisation :**
```typescript
// ❌ AVANT (appel direct repository)
const account = Account.create({ userId, accountName, accountType });
await this.accountRepository.save(account);

// ✅ APRÈS (utilisation Use Case)
const createAccountUseCase = new CreateAccount(this.accountRepository);
const account = await createAccountUseCase.execute({
  userId,
  accountName,
  accountType
});
```

### 2. Injection de Dépendances
Les Use Cases ont besoin de repositories. Deux options :

**Option A : Instancier dans la méthode** (simple, rapide)
```typescript
async create(userId: string, dto: CreateAccountDto) {
  const useCase = new CreateAccount(this.accountRepository);
  return await useCase.execute({ userId, ...dto });
}
```

**Option B : Injecter les Use Cases** (plus propre, testable)
```typescript
constructor(
  private readonly createAccountUseCase: CreateAccount,
  private readonly transferMoneyUseCase: TransferMoney
) {}
```

### 3. Gestion des Erreurs
Les Use Cases lancent des exceptions du Domain. NestJS les catch automatiquement avec les filters.

### 4. Tests
Avec les Use Cases, on peut tester la logique métier indépendamment de NestJS :
```typescript
describe('TransferMoney', () => {
  it('should transfer money between accounts', async () => {
    const useCase = new TransferMoney(mockAccountRepo, mockTransactionRepo);
    // ...
  });
});
```

---

**Dernière mise à jour :** 2026-01-04
**Créé par :** Claude Sonnet 4.5
**Objectif :** Compléter l'application bancaire avec Clean Architecture complète
