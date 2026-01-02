# ⚠️ SIMPLIFICATIONS TEMPORAIRES - NestJS Backend

Ce document trace toutes les simplifications faites pour tester rapidement le backend NestJS.
**IMPORTANT**: Ces simplifications devront être réverties pour utiliser la Clean Architecture complète.

---

## 📋 État Actuel (2026-01-02)

### ✅ Modules Créés avec Simplifications

#### 1. **Auth Module** - SIMPLIFIÉ ✓
**Localisation**: `src/modules/auth/`

**Simplifications appliquées**:
- ❌ **N'utilise PAS les Use Cases** de `@application/use-cases/auth/`
- ✅ Utilise directement `UserRepository` PostgreSQL
- ✅ Utilise le singleton `emailService` de `@infrastructure/services/email.service`

**Fichiers concernés**:
- `auth.service.ts` - Lignes 10-200 (toute la logique métier)

**Méthodes simplifiées**:
```typescript
// ❌ AU LIEU DE (Architecture complète):
const user = await new RegisterUserUseCase(userRepository, emailService).execute(dto);

// ✅ ON FAIT (Version simplifiée):
const user = User.create({ ...dto });
await this.userRepository.save(user);
emailService.sendVerificationEmail(...);
```

**Use Cases à réintégrer plus tard**:
- [ ] `RegisterUserUseCase` - Gestion inscription
- [ ] `LoginUserUseCase` - Gestion connexion
- [ ] `VerifyEmailUseCase` - Vérification email
- [ ] `ForgotPasswordUseCase` - Mot de passe oublié
- [ ] `ResetPasswordUseCase` - Réinitialisation mot de passe

---

#### 2. **Users Module** - PAS DE SIMPLIFICATION ✓
**Localisation**: `src/modules/users/`

**État**: Utilise directement le repository (acceptable pour des requêtes simples)
- ✅ `users.service.ts` utilise `UserRepository` directement
- Pas de Use Cases complexes nécessaires pour de simples GET

---

#### 3. **Accounts Module** - SIMPLIFIÉ ✓
**Localisation**: `src/modules/accounts/`

**Simplifications appliquées**:
- ❌ **N'utilise PAS les Use Cases** de `@application/use-cases/account/`
- ✅ Utilise directement `AccountRepository` PostgreSQL
- ✅ Utilise les méthodes du Domain: `Account.create()`, `updateName()`, `canBeDeleted()`

**Fichiers concernés**:
- `accounts.service.ts` - Lignes 25-141 (toute la logique CRUD)

**Méthodes simplifiées**:
```typescript
// ❌ AU LIEU DE (Architecture complète):
const account = await new CreateAccountUseCase(repo).execute(dto);

// ✅ ON FAIT (Version simplifiée):
const account = Account.create({ userId, accountName, accountType });
await this.accountRepository.save(account);
```

**Points importants**:
- `Account.create()` génère automatiquement l'IBAN et initialise le solde à 0
- `account.updateName()` utilise la logique de validation du Domain
- `account.canBeDeleted()` vérifie que le solde est à 0
- `save()` gère à la fois create et update (pas de méthode `update()` séparée)

**Use Cases à réintégrer plus tard**:
- [ ] `CreateAccountUseCase` - Création de compte
- [ ] `GetUserAccountsUseCase` - Récupération comptes utilisateur
- [ ] `UpdateAccountUseCase` - Mise à jour compte
- [ ] `DeleteAccountUseCase` - Suppression compte

---

#### 4. **Transactions Module** - SIMPLIFIÉ ✓
**Localisation**: `src/modules/transactions/`

**Simplifications appliquées**:
- ❌ **N'utilise PAS les Use Cases** de `@application/use-cases/transaction/`
- ✅ Utilise directement `TransactionRepository` et `AccountRepository` PostgreSQL
- ⚠️ **LOGIQUE DE TRANSFERT IMPLÉMENTÉE DIRECTEMENT** (devrait être dans un Use Case)

**Fichiers concernés**:
- `transactions.service.ts` - Lignes 30-91 (méthode `transfer()` complète)

**Logique de transfert simplifiée** (8 étapes):
```typescript
// 1. Trouver les comptes par IBAN
const fromAccount = await accountRepository.findByIban(fromIban);
const toAccount = await accountRepository.findByIban(toIban);

// 2. Vérifier que l'utilisateur est propriétaire du compte source
if (fromAccount.userId.value !== userId) throw error;

// 3. Créer l'objet Money
const amount = new Money(transferDto.amount, 'EUR');

// 4. Vérifier le solde
if (!fromAccount.hasEnoughBalance(amount)) throw error;

// 5. Débiter/Créditer (utilise les méthodes du Domain)
fromAccount.debit(amount);
toAccount.credit(amount);

// 6. Créer la transaction
const transaction = Transaction.create(fromId, toId, amount, type, description);

// 7. Marquer comme complétée
transaction.complete();

// 8. Sauvegarder (ordre important: comptes d'abord, puis transaction)
await accountRepository.save(fromAccount);
await accountRepository.save(toAccount);
await transactionRepository.save(transaction);
```

**⚠️ ATTENTION CRITIQUE**:
Cette logique de transfert est complexe et **DOIT** être dans un Use Case pour:
- Garantir l'intégrité transactionnelle
- Permettre la réutilisation dans d'autres interfaces
- Faciliter les tests unitaires
- Gérer les rollbacks en cas d'erreur

**Use Cases à réintégrer EN PRIORITÉ**:
- [ ] `TransferMoneyUseCase` - ⚠️ **CRITIQUE** - Gestion des transferts (logique métier complexe)
- [ ] `GetUserTransactionsUseCase` - Récupération transactions

---

## 🎯 Prochaines Étapes

### ✅ Étape 1: Simplifier Accounts & Transactions - TERMINÉ
1. ✅ Modifier `accounts.service.ts`:
   - ✅ Supprimé imports Use Cases
   - ✅ Implémenté logique directement avec `AccountRepository`
   - ✅ Utilise `Account.create()` qui génère automatiquement l'IBAN

2. ✅ Modifier `transactions.service.ts`:
   - ✅ Supprimé imports Use Cases
   - ✅ Implémenté logique de transfert complète (8 étapes)
   - ⚠️ ATTENTION: La logique de transfert est complexe et doit être réintégrée dans un Use Case

### Étape 2: Tester le Backend
1. Démarrer le serveur NestJS (port 3002)
2. Tester Auth avec Postman:
   - POST `/api/auth/register`
   - POST `/api/auth/login`
   - GET `/api/auth/me` (avec JWT)
3. Tester Accounts:
   - POST `/api/accounts` (créer un compte)
   - GET `/api/accounts` (lister comptes)
4. Tester Transactions:
   - POST `/api/transactions/transfer`

### Étape 3: Créer les Modules Restants (SIMPLIFIÉS)
- Messages Module (8 endpoints)
- Investments Module (4 endpoints)
- Credits Module (3 endpoints)
- News Module (CRUD)
- Admin Module (17 endpoints)
- Advisor Module (7 endpoints)

---

## 📝 Checklist de Réintégration Future

Quand le backend sera opérationnel et testé, réintégrer la Clean Architecture:

### Phase de Réintégration (APRÈS tests réussis)

1. **Créer les Use Cases manquants** dans `Application/use-cases/`:
   - [ ] Auth Use Cases (register, login, verify, forgot, reset)
   - [ ] Account Use Cases (create, update, delete, get)
   - [ ] Transaction Use Cases (transfer, get history)
   - [ ] ... autres modules

2. **Modifier les Services NestJS** pour utiliser les Use Cases:
   - [ ] auth.service.ts
   - [ ] accounts.service.ts
   - [ ] transactions.service.ts
   - [ ] ... autres services

3. **Avantages de la réintégration**:
   - Logique métier dans le Domain/Application (testable indépendamment)
   - Infrastructure (NestJS) devient juste une couche de présentation
   - Possibilité de réutiliser les Use Cases dans d'autres interfaces (CLI, GraphQL, etc.)

---

## 🚨 Points d'Attention Critiques

### 1. TransferMoneyUseCase
**TRÈS IMPORTANT**: La logique de transfert d'argent est complexe et critique:
- Vérifier le solde du compte source
- Débiter le compte source
- Créditer le compte destination
- Créer la transaction avec le bon statut
- Gérer les erreurs transactionnelles (rollback si échec)

**⚠️ Dans la version simplifiée**, cette logique sera dans `transactions.service.ts`.
**⚠️ À RÉINTÉGRER en priorité** dans un Use Case pour garantir l'intégrité.

### 2. Email Service
**État actuel**: Utilise le singleton de `@infrastructure/services/email.service`
- ✅ Fonctionnel pour les tests
- ⚠️ Pas injectable NestJS (pas un @Injectable())
- 💡 **Option future**: Créer un wrapper NestJS pour emailService

### 3. Validation & DTOs
**État actuel**: DTOs avec class-validator
- ✅ Validation fonctionnelle avec NestJS ValidationPipe
- ✅ Pas besoin de modification

---

## 📊 Résumé des Fichiers Modifiés

### Fichiers avec simplifications temporaires:
```
Interface/api/nestjs/src/modules/
├── auth/
│   └── auth.service.ts          ⚠️ SIMPLIFIÉ (pas de Use Cases)
├── accounts/
│   └── accounts.service.ts      ⚠️ SIMPLIFIÉ (pas de Use Cases)
└── transactions/
    └── transactions.service.ts  ⚠️ SIMPLIFIÉ (logique transfert directe ⚠️ CRITIQUE)
```

### Fichiers OK (pas de simplification):
```
Interface/api/nestjs/src/
├── main.ts                      ✅ OK
├── app.module.ts                ✅ OK
├── common/
│   ├── guards/                  ✅ OK
│   ├── decorators/              ✅ OK
│   ├── filters/                 ✅ OK
│   └── interceptors/            ✅ OK
└── modules/
    └── users/                   ✅ OK (simple GET)
```

---

## 🔄 Commandes Utiles

### Démarrer le serveur
```bash
npm run dev --workspace=Interface/api/nestjs
```

### Tester les endpoints
```bash
# Register
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","firstName":"John","lastName":"Doe"}'

# Login
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

---

**Dernière mise à jour**: 2026-01-02
**Créé par**: Claude Sonnet 4.5
**Objectif**: Tracer les simplifications temporaires pour faciliter la réintégration future de la Clean Architecture complète.
