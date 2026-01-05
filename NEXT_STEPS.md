# 📋 Prochaines Étapes - Projet Avenir Banking

**Dernière mise à jour:** 04/01/2026
**Phase actuelle:** Phase 1 ✅ TERMINÉE | Phase 2 🔄 EN COURS

---

## ✅ CE QUI EST FAIT

### Phase 1 : Backend Core (COMPLÉTÉ)

#### Nouveaux Modules Créés
1. **✅ Module Operations** ([operations.module.ts](Interface/api/nestjs/src/modules/operations/operations.module.ts))
   - `POST /api/operations/deposit` - Dépôt d'argent ✅ TESTÉ
   - `POST /api/operations/withdraw` - Retrait d'argent
   - ✅ Utilise `DepositMoney` et `WithdrawMoney` Use Cases

2. **✅ Module Internal Messages** ([internal-messages.module.ts](Interface/api/nestjs/src/modules/internal-messages/internal-messages.module.ts))
   - `POST /api/internal-messages` - Envoyer message interne
   - `GET /api/internal-messages/:userId` - Messages avec utilisateur
   - `GET /api/internal-messages/staff/members` - Liste staff
   - ✅ Utilise `SendInternalMessage`, `GetInternalMessages`, `GetStaffMembers` Use Cases

#### Endpoints Ajoutés
3. **✅ Transactions** ([transactions.controller.ts](Interface/api/nestjs/src/modules/transactions/transactions.controller.ts))
   - `GET /api/transactions/account/:accountId` - Historique compte
   - `GET /api/transactions/iban/lookup/:iban` - Recherche IBAN
   - `POST /api/transactions/iban` - Transfert IBAN externe

4. **✅ Credits** ([credits.controller.ts](Interface/api/nestjs/src/modules/credits/credits.controller.ts))
   - `POST /api/credits/calculate` - Simulateur crédit

5. **✅ Investments** ([investments.controller.ts](Interface/api/nestjs/src/modules/investments/investments.controller.ts))
   - `GET /api/investments/orders` - Historique ordres

### Phase 2 : Refactoring Use Cases (EN COURS)

#### Services Refactorés
1. **✅ Transactions Service** ([transactions.service.ts](Interface/api/nestjs/src/modules/transactions/transactions.service.ts:18))
   - ✅ Méthode `transfer()` utilise maintenant `TransferMoney` Use Case
   - ✅ Convertit IBAN → AccountId puis appelle le Use Case
   - ✅ Gère la logique métier complexe via Use Case

---

## 🔴 CE QUI RESTE À FAIRE

### Phase 2 : Refactoring Use Cases (PRIORITAIRE)

#### Services Critiques à Refactorer

**⚠️ PROBLÈME IDENTIFIÉ:** Plusieurs Use Cases nécessitent `BankSettingsRepository` qui n'est pas encore créé.

**1. Credits Service** ([credits.service.ts](Interface/api/nestjs/src/modules/credits/credits.service.ts))
- [ ] Refactorer `grantCredit()` → Use Case `GrantCredit`
- [ ] Refactorer `processMonthlyPayments()` → Use Case `ProcessMonthlyPayments`
- [ ] Refactorer `getUserCredits()` → Use Case `GetUserCredits`
- **Statut:** Logique déjà présente, juste besoin d'extraire vers Use Cases

**2. Investments Service** ([investments.service.ts](Interface/api/nestjs/src/modules/investments/investments.service.ts))
- [ ] ⚠️ **BLOQUÉ**: Nécessite `BankSettingsRepository` pour `PlaceInvestmentOrder`
- [ ] Refactorer `placeOrder()` → Use Case `PlaceInvestmentOrder`
- [ ] Refactorer `cancelOrder()` → Use Case `CancelInvestmentOrder`
- [ ] Refactorer `getPortfolio()` → Use Case `GetUserPortfolio`
- [ ] Refactorer `getStocks()` → Use Case `GetAvailableStocks`

**3. Admin Service** ([admin.service.ts](Interface/api/nestjs/src/modules/admin/admin.service.ts))
- [ ] ⚠️ **BLOQUÉ**: Nécessite `BankSettingsRepository` pour `ApplyDailyInterest`
- [ ] Refactorer `applyInterest()` → Use Case `ApplyDailyInterest`
- [ ] Refactorer `createStock()` → Use Case `CreateStock`
- [ ] Refactorer `updateStock()` → Use Case `UpdateStock`
- [ ] Refactorer `deleteStock()` → Use Case `DeleteStock`
- [ ] Refactorer `getAllStocks()` → Use Case `GetAllStocks`
- [ ] Refactorer `updateSavingsRate()` → Use Case `UpdateSavingsRate`
- [ ] Refactorer `getSavingsRate()` → Use Case `GetSavingsRate`

#### Services Standard à Refactorer

**4. Auth Service** ([auth.service.ts](Interface/api/nestjs/src/modules/auth/auth.service.ts))
- [ ] Refactorer `register()` → Use Case `RegisterUser`
- [ ] Refactorer `login()` → Use Case `LoginUser`
- [ ] Refactorer `verifyEmail()` → Use Case `VerifyEmail`
- [ ] Refactorer `requestPasswordReset()` → Use Case `RequestPasswordReset`
- [ ] Refactorer `resetPassword()` → Use Case `ResetPassword`

**5. Accounts Service** ([accounts.service.ts](Interface/api/nestjs/src/modules/accounts/accounts.service.ts))
- [ ] Refactorer `create()` → Use Case `CreateAccount`

**6. Messages Service** ([messages.service.ts](Interface/api/nestjs/src/modules/messages/messages.service.ts))
- [ ] Refactorer `sendMessage()` → Use Case `SendMessage`
- [ ] Refactorer `getConversations()` → Use Case `GetConversations`
- [ ] Refactorer `getConversation()` → Use Case `GetConversation`
- [ ] Refactorer `assignConversation()` → Use Case `AssignConversation`
- [ ] Refactorer `transferConversation()` → Use Case `TransferConversation`
- [ ] Refactorer `closeConversation()` → Use Case `CloseConversation`
- [ ] Refactorer `markAsRead()` → Use Case `MarkConversationAsRead`
- [ ] Refactorer `checkOpenConversation()` → Use Case `CheckOpenConversation`

**7. News Service** ([news.service.ts](Interface/api/nestjs/src/modules/news/news.service.ts))
- [ ] Refactorer `create()` → Use Case `CreateNews`
- [ ] Refactorer `update()` → Use Case `UpdateNews`
- [ ] Refactorer `delete()` → Use Case `DeleteNews`
- [ ] Refactorer `getAll()` → Use Case `GetNews`

---

### Phase 3 : Frontend Nuxt (NON DÉMARRÉE)

#### Pages Client à Connecter
- [ ] Dashboard ([dashboard/index.vue](Interface/web/nuxt/pages/dashboard/index.vue))
- [ ] Transfers liste ([dashboard/transfers/index.vue](Interface/web/nuxt/pages/dashboard/transfers/index.vue))
- [ ] Transfers création ([dashboard/transfers/create.vue](Interface/web/nuxt/pages/dashboard/transfers/create.vue))
- [ ] Credits liste ([dashboard/credits/index.vue](Interface/web/nuxt/pages/dashboard/credits/index.vue))
- [ ] Credits demande ([dashboard/credits/apply.vue](Interface/web/nuxt/pages/dashboard/credits/apply.vue))
- [ ] Messages ([messages/index.vue](Interface/web/nuxt/pages/messages/index.vue))

#### Pages Advisor à Connecter
- [ ] Dashboard ([advisor/dashboard.vue](Interface/web/nuxt/pages/advisor/dashboard.vue))
- [ ] Clients liste ([advisor/clients/index.vue](Interface/web/nuxt/pages/advisor/clients/index.vue))
- [ ] Client détail ([advisor/clients/[id].vue](Interface/web/nuxt/pages/advisor/clients/[id].vue))
- [ ] Credits octroyer ([advisor/credits/grant.vue](Interface/web/nuxt/pages/advisor/credits/grant.vue))

#### Chat Interne à Finaliser
- [ ] Admin chat ([admin/internal-chat.vue](Interface/web/nuxt/pages/admin/internal-chat.vue))
- [ ] Advisor chat ([advisor/internal-chat.vue](Interface/web/nuxt/pages/advisor/internal-chat.vue))

---

### Phase 4 : Fonctionnalités Avancées (NON DÉMARRÉE)

- [ ] **Cron Jobs** - Tâches planifiées
  - Intérêts quotidiens (ApplyDailyInterest)
  - Paiements mensuels crédits (ProcessMonthlyPayments)
- [ ] **WebSocket/SSE** - Notifications temps réel
- [ ] **File Upload** - Photos profil, documents
- [ ] **PDF Generation** - Relevés, contrats
- [ ] **Email Templates** - Améliorer notifications

---

## 🔧 INSTRUCTIONS POUR CONTINUER

### 1. Créer BankSettingsRepository (PRIORITAIRE)

Pour débloquer Investments et Admin Services, créer:

**Fichier:** `Infrastructure/database/postgresql/BankSettingsRepository.ts`

```typescript
import { IBankSettingsRepository } from "@domain/repositories/IBankSettingsRepository";
import { pool } from "./connection";

export class BankSettingsRepository implements IBankSettingsRepository {
  async getSavingsRate(): Promise<number> {
    const result = await pool.query(
      "SELECT savings_rate FROM bank_settings LIMIT 1"
    );
    return result.rows[0]?.savings_rate || 0;
  }

  async getInvestmentFee(): Promise<number> {
    const result = await pool.query(
      "SELECT investment_fee FROM bank_settings LIMIT 1"
    );
    return result.rows[0]?.investment_fee || 1.0;
  }

  async updateSavingsRate(rate: number): Promise<void> {
    await pool.query(
      "UPDATE bank_settings SET savings_rate = $1, updated_at = CURRENT_TIMESTAMP",
      [rate]
    );
  }
}
```

**Puis l'injecter dans les modules:**
- AdminModule
- InvestmentsModule
- OperationsModule (si besoin pour cron jobs)

### 2. Refactorer Credits Service

**Exemple pour `grantCredit()`:**

```typescript
import { GrantCredit } from '@application/use-cases/credit/GrantCredit';

async grantCredit(advisorId: string, grantCreditDto: GrantCreditDto) {
  const grantCreditUseCase = new GrantCredit(
    this.creditRepository,
    this.accountRepository,
    this.userRepository // si nécessaire
  );

  const result = await grantCreditUseCase.execute({
    advisorId,
    userId: grantCreditDto.userId,
    accountId: grantCreditDto.accountId,
    principalAmount: grantCreditDto.principalAmount,
    annualInterestRate: grantCreditDto.annualInterestRate,
    insuranceRate: grantCreditDto.insuranceRate,
    durationMonths: grantCreditDto.durationMonths,
  });

  if (!result.success) {
    throw new BadRequestException(result.errors.join(', '));
  }

  return result.credit;
}
```

### 3. Pattern Général pour Refactoring

**AVANT (appel direct repository):**
```typescript
async someMethod(dto: SomeDto) {
  const entity = Entity.create({ ...dto });
  await this.repository.save(entity);
  return entity;
}
```

**APRÈS (utilisation Use Case):**
```typescript
async someMethod(dto: SomeDto) {
  const useCase = new SomeUseCase(
    this.repository1,
    this.repository2
  );

  const result = await useCase.execute(dto);

  if (!result.success) {
    throw new BadRequestException(result.error || result.errors.join(', '));
  }

  return result.data; // ou result directement
}
```

---

## 📊 PROGRESSION GLOBALE

```
Phase 1 : Backend Core          ████████████████████ 100% ✅
Phase 2 : Refactoring Use Cases ████░░░░░░░░░░░░░░░░  20% 🔄
Phase 3 : Frontend Nuxt         ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Phase 4 : Features Avancées     ░░░░░░░░░░░░░░░░░░░░   0% ⏳

TOTAL: 30% complété
```

---

## 🎯 RECOMMANDATIONS

### Ordre de Priorité

1. **Créer BankSettingsRepository** (30 min)
2. **Refactorer Credits Service** (1h) - Plus simple, pas de dépendances
3. **Refactorer Investments Service** (1h30) - Une fois BankSettings créé
4. **Refactorer Admin Service** (1h30) - Une fois BankSettings créé
5. **Refactorer Auth Service** (1h) - 5 Use Cases
6. **Refactorer Messages Service** (2h) - 8 Use Cases
7. **Refactorer News Service** (30 min) - 4 Use Cases simples
8. **Refactorer Accounts Service** (20 min) - 1 seul Use Case

### Tests à Effectuer

Après chaque refactoring, tester avec Postman:
- Login: `POST /api/auth/login`
- Token: Utiliser dans Authorization Bearer
- Endpoint refactoré: Vérifier que ça fonctionne toujours

---

## 📝 NOTES IMPORTANTES

- **✅ Les Use Cases existent déjà** dans `Application/use-cases/`
- **✅ Pas besoin de créer de nouveaux Use Cases**
- **✅ Juste refactorer les services pour les utiliser**
- **⚠️ BankSettingsRepository manquant** - Bloque plusieurs refactorings
- **✅ Pattern validé** avec Transactions et Operations

---

**Créé par:** Claude Sonnet 4.5
**Pour:** Projet Avenir Banking - Clean Architecture
