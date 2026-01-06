# Guide de Test - Next.js avec Express vs NestJS

Ce guide vous aide à tester que Next.js fonctionne correctement avec **les deux backends** (Express et NestJS) de manière interchangeable.

## 🎯 Objectif

Vérifier que Next.js peut utiliser **indifféremment** Express ou NestJS grâce à la standardisation des réponses API.

## 📋 Prérequis

- ✅ Tous les modules sont standardisés (voir `STANDARDIZATION_GUIDE.md`)
- ✅ Les deux backends utilisent le même port (3001)
- ✅ Next.js pointe vers `http://localhost:3001/api`

## 🚀 Configuration des Backends

### Express (MySQL)
- **Port:** 3001
- **Base de données:** MySQL
- **Préfixe API:** `/api`

### NestJS (PostgreSQL)
- **Port:** 3001
- **Base de données:** PostgreSQL
- **Préfixe API:** `/api`

⚠️ **Important:** Les deux backends ne peuvent **PAS** tourner en même temps sur le même port !

## 🔄 Étapes de Test

### 1. Tester avec Express

#### Démarrer Express
```bash
cd Interface/api/express
npm run dev
```

Vérifiez que le serveur démarre :
```
🚀 Serveur express tourne sur http://localhost:3001
📊 Health check: http://localhost:3001/health
```

#### Démarrer Next.js
```bash
cd Interface/web/next
npm run dev
```

Next.js démarre sur `http://localhost:3000`

#### Tests à effectuer
1. **Authentification**
   - [ ] Inscription d'un nouvel utilisateur
   - [ ] Connexion avec les identifiants
   - [ ] Vérification du profil utilisateur (GET /api/auth/me)

2. **Comptes**
   - [ ] Créer un compte d'épargne
   - [ ] Créer un compte courant
   - [ ] Lire la liste des comptes
   - [ ] Voir les détails d'un compte

3. **Transactions**
   - [ ] Faire un transfert entre comptes
   - [ ] Voir l'historique des transactions
   - [ ] Faire un dépôt
   - [ ] Faire un retrait

4. **Investissements**
   - [ ] Voir la liste des actions disponibles
   - [ ] Passer un ordre d'achat
   - [ ] Voir le portefeuille
   - [ ] Annuler un ordre

5. **Actualités**
   - [ ] Voir la liste des actualités
   - [ ] Créer une actualité (advisor/director)
   - [ ] Modifier une actualité
   - [ ] Supprimer une actualité

6. **Messages**
   - [ ] Envoyer un message client → conseiller
   - [ ] Voir les conversations
   - [ ] Assigner une conversation (advisor)
   - [ ] Transférer une conversation (advisor)

### 2. Basculer vers NestJS

#### Arrêter Express
- Appuyez sur `Ctrl+C` dans le terminal Express

#### Démarrer NestJS
```bash
cd Interface/api/nestjs
npm run dev
```

Vérifiez que le serveur démarre :
```
✅ NestJS API running on http://localhost:3001
📊 Health check: http://localhost:3001/api/health
```

⚠️ **Note:** Next.js continue de tourner, **pas besoin de le redémarrer** !

#### Répéter les mêmes tests

**Refaire tous les tests de l'étape 1** avec NestJS.

Les résultats doivent être **identiques** car les réponses sont standardisées.

## ✅ Vérifications Clés

### Format des Réponses

Toutes les réponses doivent suivre ce format :

#### Lectures (GET)
```json
{
  "success": true,
  "data": { ... }
}
```

#### Mutations (POST/PATCH/PUT)
```json
{
  "success": true,
  "message": "Opération réussie",
  "data": { ... }
}
```

#### Suppressions (DELETE)
```json
{
  "success": true,
  "message": "Suppression réussie"
}
```

### Vérifier dans la Console du Navigateur

Ouvrez les DevTools (F12) et vérifiez :

1. **Onglet Network**
   - Les requêtes vers `/api/*` doivent retourner `200 OK`
   - Les réponses doivent contenir `success: true`

2. **Onglet Console**
   - Pas d'erreurs JavaScript
   - Pas d'erreurs de parsing JSON

## 🐛 Debugging

### Problème : "Cannot read property 'data' of undefined"

**Cause :** Une réponse n'est pas standardisée

**Solution :**
1. Vérifier le endpoint dans le backend
2. S'assurer qu'il retourne `{ success: true, data: ... }`
3. Consulter `STANDARDIZATION_GUIDE.md`

### Problème : "Network Error"

**Cause :** Le backend n'est pas démarré ou mauvais port

**Solution :**
1. Vérifier que le backend tourne sur le port 3001
2. Vérifier `NEXT_PUBLIC_API_URL` dans `.env.local`
3. Tester `http://localhost:3001/api/health`

### Problème : Erreur 401 Unauthorized

**Cause :** Token JWT invalide ou expiré

**Solution :**
1. Se déconnecter et se reconnecter
2. Vérifier que le JWT_SECRET est le même dans les deux backends
3. Vérifier l'expiration du token

## 📊 Checklist de Test Complet

### Module Auth
- [ ] POST /api/auth/register
- [ ] POST /api/auth/login
- [ ] GET /api/auth/me

### Module Accounts
- [ ] POST /api/accounts
- [ ] GET /api/accounts
- [ ] GET /api/accounts/:id
- [ ] PATCH /api/accounts/:id
- [ ] DELETE /api/accounts/:id

### Module Transactions
- [ ] POST /api/transactions/transfer
- [ ] GET /api/transactions/user
- [ ] GET /api/transactions/account/:id
- [ ] POST /api/transactions/lookup-iban
- [ ] POST /api/transactions/transfer-external

### Module Operations
- [ ] POST /api/operations/deposit
- [ ] POST /api/operations/withdraw

### Module Investments
- [ ] POST /api/investment/orders
- [ ] DELETE /api/investment/orders/:id
- [ ] GET /api/investment/stocks
- [ ] GET /api/investment/portfolio
- [ ] GET /api/investment/orders
- [ ] GET /api/investment/fee

### Module Credits
- [ ] POST /api/credits/grant (advisor/director)
- [ ] GET /api/credits/user/:userId
- [ ] GET /api/credits/calculate

### Module News
- [ ] POST /api/news (advisor/director)
- [ ] GET /api/news
- [ ] GET /api/news/:id
- [ ] PUT /api/news/:id
- [ ] DELETE /api/news/:id

### Module Messages
- [ ] POST /api/messages/send
- [ ] GET /api/messages/conversations
- [ ] GET /api/messages/conversation/:id
- [ ] POST /api/messages/assign
- [ ] POST /api/messages/transfer
- [ ] POST /api/messages/close
- [ ] POST /api/messages/mark-read
- [ ] GET /api/messages/check-open/:clientId

### Module Internal Messages
- [ ] POST /api/internal-messages
- [ ] GET /api/internal-messages
- [ ] GET /api/staff-members

### Module Admin (director seulement)
- [ ] GET /api/admin/users
- [ ] POST /api/admin/users
- [ ] GET /api/admin/users/:id
- [ ] PUT /api/admin/users/:id
- [ ] DELETE /api/admin/users/:id
- [ ] PATCH /api/admin/users/:id/ban
- [ ] PATCH /api/admin/users/:id/unban
- [ ] POST /api/admin/apply-interest
- [ ] GET /api/admin/savings-rate
- [ ] PUT /api/admin/savings-rate
- [ ] GET /api/admin/cron-status

### Module Advisor (advisor/director)
- [ ] GET /api/advisor/advisors
- [ ] GET /api/advisor/clients
- [ ] GET /api/advisor/transactions
- [ ] GET /api/advisor/transactions/pending
- [ ] PATCH /api/advisor/transactions/:id/approve
- [ ] PATCH /api/advisor/transactions/:id/reject
- [ ] POST /api/advisor/notify-client

## 🎉 Succès !

Si tous les tests passent avec **Express ET NestJS**, félicitations ! 

Votre Clean Architecture est **parfaitement implémentée** et les deux backends sont **100% interchangeables** ! 🚀

## 📝 Notes

- Les deux backends utilisent des bases de données différentes (MySQL vs PostgreSQL)
- Les données ne sont **pas partagées** entre les deux backends
- Créez des utilisateurs de test **dans chaque backend** séparément
- Les tokens JWT sont **spécifiques** à chaque backend

## 🔗 Liens Utiles

- **Guide de Standardisation:** `STANDARDIZATION_GUIDE.md`
- **Progress Clean Architecture:** `CLEAN_ARCHITECTURE_PROGRESS.md`
- **Next.js:** http://localhost:3000
- **API Express/NestJS:** http://localhost:3001/api
- **Health Check:** http://localhost:3001/api/health

