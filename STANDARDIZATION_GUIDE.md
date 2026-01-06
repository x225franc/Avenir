# Guide de standardisation des modules

Ce guide explique comment standardiser un module pour assurer l'interchangeabilité entre Express et NestJS dans notre architecture Clean Architecture.

## 📘 Processus de standardisation

### Étape 1 : Identifier le module à standardiser

Consulter le [CLEAN_ARCHITECTURE_PROGRESS.md](./CLEAN_ARCHITECTURE_PROGRESS.md) pour la liste des modules.

**Ordre de priorité :**
1. Transactions
2. Investments
3. Credits
4. Admin
5. Advisor
6. Messages
7. News
8. Operations
9. Internal Messages

### Étape 2 : Lire le service Express (source de vérité)

**Fichier :** `Interface/api/express/src/controllers/[Module]Controller.ts`

**Ce qu'on cherche :**
1. Les endpoints disponibles (routes)
2. Le format exact des réponses pour chaque endpoint
3. Les messages de succès/erreur

**Exemple pour Accounts :**
```typescript
// Interface/api/express/src/controllers/AccountController.ts
static async create(req: Request, res: Response) {
  // ...
  res.status(201).json({
    success: true,
    message: 'Compte créé avec succès',
    data: {
      accountId: result.accountId,
      iban: result.iban,
    },
  });
}
```

### Étape 3 : Lire le service NestJS actuel

**Fichier :** `Interface/api/nestjs/src/modules/[module]/[module].service.ts`

**Ce qu'on cherche :**
1. Les méthodes qui correspondent aux endpoints Express
2. Le format actuel des réponses
3. Les différences avec Express

**Exemple :**
```typescript
// AVANT - Format non standardisé
async create(userId: string, createAccountDto: CreateAccountDto) {
  // ...
  return {
    accountId: result.accountId,
    iban: result.iban,
  };
}
```

### Étape 4 : Modifier le service NestJS

#### Pattern 1 : Lectures (GET) retournant un objet

```typescript
// AVANT
async findById(id: string) {
  const entity = await this.repository.findById(id);
  return entity; // ou return { propriété: valeur }
}

// APRÈS
async findById(id: string) {
  const entity = await this.repository.findById(id);

  if (!entity) {
    throw new NotFoundException('Entity non trouvée');
  }

  // Format standardisé compatible avec Express
  return {
    success: true,
    data: {
      id: entity.id,
      // ... toutes les propriétés nécessaires
    }
  };
}
```

#### Pattern 2 : Lectures (GET) retournant un tableau

```typescript
// AVANT
async findAll() {
  const entities = await this.repository.findAll();
  return entities;
}

// APRÈS
async findAll() {
  const entities = await this.repository.findAll();

  // Format standardisé compatible avec Express
  return {
    success: true,
    data: entities.map(entity => ({
      id: entity.id,
      // ... propriétés
    }))
  };
}
```

#### Pattern 3 : Créations (POST)

```typescript
// AVANT
async create(dto: CreateDto) {
  const result = await this.useCase.execute(dto);
  return result;
}

// APRÈS
async create(dto: CreateDto) {
  try {
    const result = await this.useCase.execute(dto);

    if (!result.success) {
      throw new BadRequestException(result.error);
    }

    // Format standardisé compatible avec Express
    return {
      success: true,
      message: 'Entité créée avec succès', // Message spécifique en français
      data: {
        id: result.id,
        // ... données pertinentes
      }
    };
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw error;
    }
    throw new BadRequestException('Erreur lors de la création');
  }
}
```

#### Pattern 4 : Mises à jour (PATCH/PUT)

```typescript
// APRÈS
async update(id: string, dto: UpdateDto) {
  const entity = await this.repository.findById(id);

  if (!entity) {
    throw new NotFoundException('Entity non trouvée');
  }

  // Appliquer les modifications
  entity.updateProperty(dto.property);
  await this.repository.save(entity);

  // Format standardisé compatible avec Express
  return {
    success: true,
    message: 'Entité mise à jour avec succès',
    data: {
      id: entity.id,
      property: entity.property,
      updatedAt: entity.updatedAt,
    }
  };
}
```

#### Pattern 5 : Suppressions (DELETE)

```typescript
// APRÈS
async delete(id: string) {
  const entity = await this.repository.findById(id);

  if (!entity) {
    throw new NotFoundException('Entity non trouvée');
  }

  await this.repository.delete(id);

  // Format standardisé compatible avec Express
  return {
    success: true,
    message: 'Entité supprimée avec succès'
    // Pas de data pour un DELETE
  };
}
```

### Étape 5 : Vérifier les points clés

**Checklist :**
- [ ] Toutes les méthodes retournent `{ success: true, ... }`
- [ ] Les mutations (POST/PATCH/DELETE) incluent un `message`
- [ ] Les lectures incluent `data` avec la structure exacte d'Express
- [ ] Les erreurs utilisent les bonnes exceptions NestJS (`NotFoundException`, `BadRequestException`, `ForbiddenException`)
- [ ] Les commentaires `// Format standardisé compatible avec Express` sont présents
- [ ] Les messages sont en français et spécifiques à l'action

### Étape 6 : Comparer avec Express pour validation

**Créer un tableau de comparaison :**

| Endpoint | Express Response | NestJS Response | ✅ Conforme |
|----------|-----------------|-----------------|-------------|
| POST /accounts | `{ success, message, data: { accountId, iban } }` | `{ success, message, data: { accountId, iban } }` | ✅ |
| GET /accounts/:id | `{ success, data: { id, name, ... } }` | `{ success, data: { id, name, ... } }` | ✅ |

### Étape 7 : Documenter les changements

**Template de documentation :**

```markdown
## Module [Nom] - Standardisé ✅

### Endpoints modifiés
1. **POST /[route]** - [Description]
   - Avant : `{ ... }`
   - Après : `{ success: true, message: "...", data: { ... } }`

2. **GET /[route]** - [Description]
   - Avant : `{ ... }`
   - Après : `{ success: true, data: { ... } }`

### Fichiers modifiés
- `Interface/api/nestjs/src/modules/[module]/[module].service.ts`

### Tests recommandés
- [ ] Créer une entité
- [ ] Lire une entité
- [ ] Mettre à jour une entité
- [ ] Supprimer une entité
- [ ] Vérifier que Next.js fonctionne
- [ ] Vérifier que Nuxt.js fonctionne (après mise à jour)
```

## 🔄 Mise à jour Frontend Nuxt (Optionnel)

### Pattern de transformation

#### Lectures (GET)
```typescript
// AVANT
const data = await apiFetch<Type>('/route');
entity.value = data;

// APRÈS
const response = await apiFetch<{ success: boolean; data: Type }>('/route');
if (response.success && response.data) {
  entity.value = response.data;
}
```

#### Mutations (POST/PATCH/DELETE)
```typescript
// AVANT
await apiFetch('/route', {
  method: 'POST',
  body: { ... }
});

notificationsStore.addNotification({
  type: 'success',
  message: 'Succès !',
});

// APRÈS
const response = await apiFetch<{ success: boolean; message?: string; data?: any }>('/route', {
  method: 'POST',
  body: { ... }
});

if (response.success) {
  notificationsStore.addNotification({
    type: 'success',
    message: response.message || 'Succès !',
  });
}
```

## 🤖 Prompt pour une IA

Si tu veux faire standardiser un module par une autre IA :

```
Je travaille sur une application en Clean Architecture avec deux backends (Express + NestJS) qui doivent être interchangeables.

Tâche : Standardiser le module [NOM_MODULE] pour que NestJS retourne le même format de réponse qu'Express.

Format standardisé :
- Lectures : { success: true, data: { ... } }
- Mutations : { success: true, message: "...", data: { ... } }
- Suppressions : { success: true, message: "..." }

Étapes :
1. Lis le fichier Express : Interface/api/express/src/controllers/[Module]Controller.ts
2. Note le format exact de chaque réponse
3. Modifie le fichier NestJS : Interface/api/nestjs/src/modules/[module]/[module].service.ts
4. Assure-toi que TOUTES les méthodes retournent le format standardisé
5. Vérifie que les structures de data correspondent EXACTEMENT à Express
6. Ajoute des commentaires "// Format standardisé compatible avec Express"
7. Utilise les bonnes exceptions NestJS (NotFoundException, BadRequestException, etc.)
8. Les messages doivent être en français et spécifiques à l'action

Ne modifie PAS le frontend, je m'en occupe.
```

## 📊 Format de réponse standardisé

### Succès - Lecture (GET)
```typescript
{
  success: true,
  data: {
    // Structure de l'objet ou tableau
  }
}
```

### Succès - Création (POST)
```typescript
{
  success: true,
  message: "Entité créée avec succès",
  data: {
    id: "...",
    // Propriétés pertinentes
  }
}
```

### Succès - Mise à jour (PATCH/PUT)
```typescript
{
  success: true,
  message: "Entité mise à jour avec succès",
  data: {
    id: "...",
    // Propriétés modifiées
    updatedAt: "..."
  }
}
```

### Succès - Suppression (DELETE)
```typescript
{
  success: true,
  message: "Entité supprimée avec succès"
}
```

### Erreur
Les erreurs sont gérées par les exceptions NestJS et le système d'exception global :
```typescript
throw new NotFoundException('Message d\'erreur');
throw new BadRequestException('Message d\'erreur');
throw new ForbiddenException('Message d\'erreur');
throw new UnauthorizedException('Message d\'erreur');
```

## 🎯 Exemple complet : Module Accounts

Voir les fichiers suivants pour un exemple complet de standardisation :
- Backend : `Interface/api/nestjs/src/modules/accounts/accounts.service.ts`
- Frontend Nuxt : `Interface/web/nuxt/pages/dashboard/accounts/`
- Référence Express : `Interface/api/express/src/controllers/AccountController.ts`

## ⚠️ Important : Méthodes Admin vs Client

Certains services NestJS contiennent des méthodes qui n'existent PAS dans le controller client Express, mais dans les controllers Admin ou Advisor.

**Exemple avec Transactions :**
- `TransactionsService.findByUserId()` → Dans `TransactionController` (client) ✅ À standardiser
- `TransactionsService.findAll()` → Dans `AdvisorController` (conseiller) ⏸️ Reporter au module Advisor
- `TransactionsService.findByStatus()` → Dans `AdvisorController` (conseiller) ⏸️ Reporter au module Advisor

**Comment identifier :**
1. Chercher la méthode dans Express `TransactionController` (client)
2. Si elle n'existe pas, chercher dans `AdvisorController` ou `AdminUserController`
3. Standardiser uniquement les méthodes du controller client
4. Les autres seront standardisées lors du module correspondant

## ✅ Modules standardisés

- [x] **Auth** (Users) - Login, Register, GetMe
- [x] **Accounts** - Create, Read, Update, Delete
- [x] **Transactions** - Transfer, FindByUserId, FindByAccountId, LookupIban, TransferToExternalIban
- [x] **Investments** - PlaceOrder, CancelOrder, GetStocks, GetPortfolio, GetUserOrders, GetInvestmentFee
- [x] **Credits** - GrantCredit, GetUserCredits, CalculateCredit, ProcessMonthlyPayments
- [x] **Admin** - GetAllUsers, CreateUser, UpdateUser, DeleteUser, BanUser, UnbanUser, GetStats, GetTeamMembers, GetAllStocks, CreateStock, UpdateStock, DeleteStock, ApplyInterest, TestInterest, UpdateSavingsRate, GetSavingsRate, GetCronStatus
- [x] **Advisor** - GetAdvisors, GetClients, GetTransactions, GetPendingTransactions, ApproveTransaction, RejectTransaction, NotifyClient
- [x] **Operations** - Deposit, Withdraw
- [x] **News** - Create, GetAll, GetById, Update, Delete
- [x] **Messages** - SendMessage, GetConversations, GetConversation, AssignConversation, TransferConversation, CloseConversation, MarkAsRead, CheckOpenConversation
- [x] **Internal Messages** - SendMessage, GetMessages, GetStaffMembers
