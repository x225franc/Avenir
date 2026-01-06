# 📊 Fixtures de test - Banque AVENIR

Ce document liste toutes les données de test disponibles dans les bases de données MySQL et PostgreSQL.

## 🔐 Mot de passe universel

Tous les utilisateurs ont le même mot de passe pour faciliter les tests :
- **Mot de passe** : `password`
- **Hash bcrypt** : `$2b$10$NsaXYXQPr.DppHzYMsj8muoOhdNc5WwotCspg/jj72MT71u3QbqRO`

---

## 👥 Utilisateurs (8 total)

### Directeur (1)
| ID | Email | Nom | Téléphone | Rôle |
|----|-------|-----|-----------|------|
| 1 | director@avenir-bank.fr | Jean Dupont | 0140506070 | director |

### Conseillers (2)
| ID | Email | Nom | Téléphone | Rôle |
|----|-------|-----|-----------|------|
| 2 | advisor@avenir-bank.fr | Marie Martin | 0141516171 | advisor |
| 3 | advisor2@avenir-bank.fr | Thomas Bernard | 0142526272 | advisor |

### Clients (5)
| ID | Email | Nom | Téléphone | Rôle | Conseiller assigné |
|----|-------|-----|-----------|------|--------------------|
| 4 | client@avenir-bank.fr | Pierre Durand | 0601020304 | client | Marie Martin (2) |
| 5 | client2@avenir-bank.fr | Sophie Lefebvre | 0605060708 | client | Marie Martin (2) |
| 6 | client3@avenir-bank.fr | Lucas Moreau | 0609101112 | client | Marie Martin (2) |
| 7 | client4@avenir-bank.fr | Emma Simon | 0613141516 | client | Thomas Bernard (3) |
| 8 | client5@avenir-bank.fr | Hugo Laurent | 0617181920 | client | Thomas Bernard (3) |

---

## 💰 Comptes bancaires (17 total)

### Comptes du directeur Jean Dupont
| ID | IBAN | Nom | Type | Solde |
|----|------|-----|------|-------|
| 1 | FR76...185 | Compte Courant Direction | checking | 50 000,00 € |
| 2 | FR76...186 | Compte Épargne Direction | savings | 100 000,00 € |

### Comptes des conseillers
**Marie Martin :**
| ID | IBAN | Nom | Type | Solde |
|----|------|-----|------|-------|
| 3 | FR76...187 | Compte Courant Marie | checking | 5 000,00 € |
| 4 | FR76...188 | Compte Épargne Marie | savings | 15 000,00 € |

**Thomas Bernard :**
| ID | IBAN | Nom | Type | Solde |
|----|------|-----|------|-------|
| 5 | FR76...189 | Compte Courant Thomas | checking | 4 500,00 € |
| 6 | FR76...190 | Compte Épargne Thomas | savings | 12 000,00 € |

### Comptes des clients
**Pierre Durand :**
| ID | IBAN | Nom | Type | Solde |
|----|------|-----|------|-------|
| 7 | FR76...191 | Compte Courant Pierre | checking | 2 500,00 € |
| 8 | FR76...192 | Compte Épargne Pierre | savings | 8 000,00 € |
| 9 | FR76...193 | Compte Investissement Pierre | investment | 15 000,00 € |

**Sophie Lefebvre :**
| ID | IBAN | Nom | Type | Solde |
|----|------|-----|------|-------|
| 10 | FR76...194 | Compte Courant Sophie | checking | 3 200,00 € |
| 11 | FR76...195 | Compte Épargne Sophie | savings | 12 000,00 € |

**Lucas Moreau :**
| ID | IBAN | Nom | Type | Solde |
|----|------|-----|------|-------|
| 12 | FR76...196 | Compte Courant Lucas | checking | 1 800,00 € |
| 13 | FR76...197 | Compte Investissement Lucas | investment | 5 000,00 € |

**Emma Simon :**
| ID | IBAN | Nom | Type | Solde |
|----|------|-----|------|-------|
| 14 | FR76...198 | Compte Courant Emma | checking | 2 100,00 € |
| 15 | FR76...199 | Compte Épargne Emma | savings | 6 000,00 € |

**Hugo Laurent :**
| ID | IBAN | Nom | Type | Solde |
|----|------|-----|------|-------|
| 16 | FR76...200 | Compte Courant Hugo | checking | 2 800,00 € |
| 17 | FR76...201 | Compte Investissement Hugo | investment | 10 000,00 € |

---

## 📈 Actions disponibles (8 total)

| ID | Symbole | Nom de l'entreprise | Prix actuel |
|----|---------|---------------------|-------------|
| 1 | AAPL | Apple Inc. | 150,25 € |
| 2 | GOOGL | Alphabet Inc. | 2 500,75 € |
| 3 | MSFT | Microsoft Corporation | 300,50 € |
| 4 | TSLA | Tesla Inc. | 800,00 € |
| 5 | AMZN | Amazon.com Inc. | 3 200,00 € |
| 6 | META | Meta Platforms Inc. | 350,80 € |
| 7 | NVDA | NVIDIA Corporation | 450,20 € |
| 8 | NFLX | Netflix Inc. | 420,15 € |

---

## 💳 Transactions (8 total)

| De compte | Vers compte | Montant | Type | Description | Statut |
|-----------|-------------|---------|------|-------------|--------|
| 7 (Pierre) | 8 (Pierre) | 500 € | transfer | Économies du mois | completed |
| 10 (Sophie) | 11 (Sophie) | 800 € | transfer | Virement épargne | completed |
| 12 (Lucas) | 13 (Lucas) | 200 € | transfer | Investissement mensuel | completed |
| - | 7 (Pierre) | 1 500 € | deposit | Dépôt salaire | completed |
| - | 10 (Sophie) | 2 000 € | deposit | Virement salaire | completed |
| 14 (Emma) | - | 300 € | withdrawal | Retrait DAB | completed |
| 7 (Pierre) | 10 (Sophie) | 150 € | transfer | Remboursement repas | completed |
| 16 (Hugo) | 14 (Emma) | 200 € | transfer | Cadeau anniversaire | **pending** |

---

## 📊 Ordres d'investissement (5 total)

| Client | Action | Type | Quantité | Prix/action | Total | Statut |
|--------|--------|------|----------|-------------|-------|--------|
| Pierre | AAPL | buy | 10 | 150,25 € | 1 502,50 € | executed |
| Pierre | MSFT | buy | 5 | 300,50 € | 1 502,50 € | executed |
| Lucas | TSLA | buy | 2 | 800,00 € | 1 600,00 € | executed |
| Hugo | GOOGL | buy | 3 | 2 500,75 € | 7 502,25 € | executed |
| Hugo | NVDA | buy | 5 | 450,20 € | 2 251,00 € | **pending** |

---

## 💰 Crédits actifs (4 total)

| Client | Montant principal | Taux | Durée | Mensualité | Solde restant | Conseiller |
|--------|-------------------|------|-------|------------|---------------|------------|
| Sophie Lefebvre | 20 000 € | 3,50% | 60 mois | 364,85 € | 18 500 € | Marie Martin |
| Lucas Moreau | 15 000 € | 3,80% | 48 mois | 340,15 € | 14 200 € | Marie Martin |
| Emma Simon | 30 000 € | 3,20% | 72 mois | 456,20 € | 28 500 € | Thomas Bernard |
| Hugo Laurent | 10 000 € | 4,00% | 36 mois | 295,55 € | 9 500 € | Thomas Bernard |

---

## 📰 Actualités / News (7 total)

| Titre | Auteur | Publié | Date |
|-------|--------|--------|------|
| Bienvenue chez Banque AVENIR | Jean Dupont (Directeur) | ✅ | Il y a 60 jours |
| Nouveaux taux d'épargne attractifs | Jean Dupont (Directeur) | ✅ | Il y a 45 jours |
| Investissez dans les nouvelles technologies | Marie Martin (Conseiller) | ✅ | Il y a 30 jours |
| Conseils pour optimiser votre budget | Marie Martin (Conseiller) | ✅ | Il y a 20 jours |
| Nouveau service de crédit immobilier | Thomas Bernard (Conseiller) | ✅ | Il y a 10 jours |
| Sécurité renforcée sur votre espace client | Jean Dupont (Directeur) | ✅ | Il y a 5 jours |
| Prochainement : Application mobile | Jean Dupont (Directeur) | ❌ Brouillon | Il y a 1 jour |

---

## 💬 Conversations client-conseiller

### Conversation 1 : Pierre Durand ↔ Marie Martin
**Statut** : 🟢 Ouverte  
**Sujet** : Demande d'information sur crédit immobilier  
**Messages** : 4

1. **Pierre** : "Bonjour, je souhaiterais obtenir des informations sur les crédits immobiliers."
2. **Marie** : "Bonjour Pierre, je serais ravie de vous aider. Quel est le montant de votre projet ?"
3. **Pierre** : "Nous cherchons un bien aux alentours de 250 000€."
4. **Marie** : "Parfait ! Je vous propose un rendez-vous cette semaine pour étudier votre dossier. Êtes-vous disponible jeudi ?"

### Conversation 2 : Sophie Lefebvre ↔ Marie Martin
**Statut** : 🔴 Clôturée  
**Sujet** : Question sur frais bancaires  
**Messages** : 5

1. **Sophie** : "Bonjour, j'ai une question sur mes frais bancaires du mois dernier."
2. **Marie** : "Bonjour Sophie, je consulte votre dossier. De quels frais parlez-vous ?"
3. **Sophie** : "J'ai été prélevée de 5€ de frais de découvert, mais je ne pense pas avoir été à découvert."
4. **Marie** : "Je vois le problème. Il s'agit d'une erreur de notre part. Je procède au remboursement immédiat. Toutes mes excuses."
5. **Système** : "Cette conversation a été clôturée. Votre remboursement de 5€ a été effectué."

---

## 📨 Messages internes (staff)

| De | À | Message | Type | Lu |
|----|---|---------|------|-----|
| Jean Dupont | Tous | Réunion d'équipe vendredi à 14h. Présence obligatoire pour tous les conseillers. | Groupe | ✅ |
| Marie Martin | Thomas Bernard | Thomas, peux-tu prendre en charge le dossier de Mme Lefebvre pendant mon absence ? | Privé | ✅ |
| Thomas Bernard | Marie Martin | Pas de souci Marie, je m'en occupe. | Privé | ✅ |
| Jean Dupont | Tous | Nouveaux objectifs trimestriels disponibles sur l'intranet. | Groupe | ❌ |
| Thomas Bernard | Jean Dupont | Jean, j'ai besoin de valider un crédit de 30k€ pour Emma Simon. Peux-tu me rappeler ? | Privé | ❌ |

---

## ⚙️ Configuration de la banque

| Paramètre | Valeur | Description |
|-----------|--------|-------------|
| savings_interest_rate | 2.5 | Taux d'intérêt annuel des comptes épargne (2,5%) |
| investment_fee | 1.00 | Frais par transaction d'investissement (1€) |

---

## 🎯 Scénarios de test recommandés

### 1. Test Authentification
- Connectez-vous avec `director@avenir-bank.fr` / `password`
- Connectez-vous avec `advisor@avenir-bank.fr` / `password`
- Connectez-vous avec `client@avenir-bank.fr` / `password`

### 2. Test Transactions
- Effectuez un virement entre les comptes 7 et 8 de Pierre
- Approuvez la transaction pending entre Hugo et Emma (ID: voir base)
- Testez un dépôt sur le compte 7
- Testez un retrait du compte 14

### 3. Test Investissements
- Approuvez l'ordre pending de Hugo (NVDA)
- Créez un nouvel ordre d'achat pour Pierre
- Consultez le portefeuille de Hugo (3 actions)

### 4. Test Messagerie
- Répondez à la conversation ouverte de Pierre
- Créez une nouvelle conversation depuis le compte de Lucas
- Transférez une conversation d'un conseiller à un autre

### 5. Test Crédits
- Consultez les crédits de Sophie (18 500€ restants)
- Simulez un nouveau crédit pour un client
- Calculez les mensualités pour un crédit de 25 000€

### 6. Test News
- Publiez le brouillon "Application mobile"
- Créez une nouvelle actualité en tant que directeur
- Consultez les actualités depuis un compte client

---

## 📝 Notes importantes

1. **Cohérence des données** : Les clients sont liés à leurs conseillers respectifs (visible via les crédits)
2. **Relations** : Tous les comptes, transactions, crédits sont liés de manière cohérente
3. **Dates** : Utilisation de dates relatives (NOW() - INTERVAL) pour des données fraîches à chaque reset
4. **Montants réalistes** : Les soldes et montants sont crédibles pour des tests réalistes

---

## 🔄 Réinitialisation des données

Pour réinitialiser les bases de données avec ces fixtures :

```bash
# Tout supprimer et recréer
docker-compose down -v
docker-compose up -d

# Attendre 20 secondes l'initialisation
```

Les fixtures sont automatiquement chargées depuis :
- `db/schema.sql` (MySQL)
- `db/schema-postgresql.sql` (PostgreSQL)

