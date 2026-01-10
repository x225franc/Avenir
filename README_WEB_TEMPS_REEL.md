# Banque AVENIR - Web en Temps Réel
***Alliance de Valeurs Économiques et Nationales Investies Responsablement***

---

## Équipe du Projet

- **Diawara Alpha Malick** - 5IW2
- **Difuidi Mijosé** - 5IW2
- **Classe** : 5IW (Ingénierie Web)
- **Année** : 2025-2026

---

## Code ?

### Backend (Express)

- Serveur Socket.IO + initialisation : `Interface/api/express/server.ts`
- Service Socket.IO (émission d’événements) : `Infrastructure/services/MessageSocketService.ts`
- Service SSE (gestion clients + broadcast) : `Infrastructure/services/SSEService.ts`
- Endpoint SSE : `Interface/api/express/controllers/SSEController.ts`
- Événements SSE “News” : `Interface/api/express/controllers/NewsController.ts`
- Événement SSE taux épargne : `Interface/api/express/controllers/AdminController.ts`

### Frontend (Next.js)

- Hook SSE : `Interface/web/next/components/hooks/useSSE.ts`
- Toast notifications SSE : `Interface/web/next/components/ui/SSENotifications.tsx`
- Chat client : `Interface/web/next/app/messages/page.tsx`
- Chat conseiller : `Interface/web/next/app/advisor/messages/page.tsx`
- Chat interne (staff) :
  - `Interface/web/next/app/advisor/internal-chat/page.tsx`
  - `Interface/web/next/app/admin/internal-chat/page.tsx`
- Cours d’actions en temps réel : `Interface/web/next/app/investment/stocks/page.tsx`

---

## Démarrage (dev)

### 1) Pour lancer tout le projet

À la racine du projet :

```bash
npm run start
```

Cela démarre Docker + l’API Express + Next.js.


**Ports par défaut :**
- API : http://localhost:3001
- Front : http://localhost:3000

---

## WebSocket (Socket.IO)

### Connexion et rooms

Le serveur Socket.IO est initialisé dans `Interface/api/express/server.ts`.

Rooms utilisées :
- `user:{userId}` : notifications ciblées (client, conseiller, directeur)
- `conversation:{conversationId}` : événements d’une conversation
- `advisors` : salle globale conseillers (visibilité des conversations en attente)
- `staff` : salle groupe (conseillers + directeur) pour le chat interne

Côté client, la connexion Socket.IO se fait via `socket.io-client`.

### Événements principaux (messagerie client↔conseiller)

Émis par `MessageSocketService` et/ou relayés par le serveur :

- `message:new` : nouveau message dans une conversation
- `conversation:new` : une conversation vient d’être créée (visible par tous les conseillers)
- `conversation:assigned` : conversation assignée à un conseiller
- `conversation:updated` : conversation mise à jour (ex: assignation/transfert/clôture)
- `conversation:transferred` / `conversation:transferred:from` / `conversation:transferred:to`
- `conversation:closed` : conversation clôturée
- `message:read` : message(s) marqués comme lus

### Typing indicator (bonus)

- `typing:start` / `typing:stop` : “en train d’écrire” (par conversation)

### Chat interne (staff)

- `internal_message:new` : nouveau message interne (groupe ou direct)
- `internal_typing:start` / `internal_typing:stop`

### Cours des actions

- `stock_price_update` : diffusé à tous les clients connectés (depuis `stockPriceFluctuationService`)

---

## SSE (Server-Sent Events)

### Endpoint

- `GET /api/sse/stream?userId=<id>&role=<role>`
  - ouvre une connexion SSE (HTTP keep-alive)
  - `role` sert à filtrer les broadcasts (ex: `client`)

Route définie dans `Interface/api/express/routes/sse.routes.ts`.

### Événements SSE utilisés

- `connected` : message initial lors de la connexion
- `news:created` : broadcast aux clients (`role=client`) quand une actualité est créée
- `savings_rate:updated` : broadcast aux clients lors d’un changement de taux d’épargne

### Consommation côté Next.js

- Hook : `useSSE({ userId, role })` crée un `EventSource` vers `/api/sse/stream`
- UI : `SSENotifications` écoute notamment `news:created` et `savings_rate:updated` (toast)

---

## Variables d’environnement (temps réel)

Côté Next.js (frontend) :
- `NEXT_PUBLIC_API_URL` (par défaut `http://localhost:3001/api`)
- `NEXT_PUBLIC_WS_URL` (par défaut `http://localhost:3001`)
- `NEXT_PUBLIC_API_WS_URL` (par défaut `http://localhost:3001`)

Côté Express (backend) :
- `FRONTEND_URL` (utilisé pour CORS Socket.IO/Express)

---

## Fixtures / jeux de données (pour tester rapidement)

Le projet fournit des **jeux de données** directement dans les scripts SQL du dossier `db/`.

### Avec Docker (recommandé)

Le `docker-compose.yml` monte automatiquement :
- `db/schema.sql` dans MySQL (import au premier démarrage)
- `db/schema-postgresql.sql` dans PostgreSQL (import au premier démarrage)

Démarrage :

```bash
docker compose up -d
```

⚠️ l’import automatique via `/docker-entrypoint-initdb.d/` ne se rejoue **que lors du tout premier init** des volumes.

Si vous voulez **réinitialiser** la base et recharger les fixtures :

```bash
docker compose down -v
docker compose up -d
```

Services utiles :
- phpMyAdmin : http://localhost:8080
  - host: `mysql`
  - user: `root`
  - password: `root`
- pgAdmin : http://localhost:8081 (login `admin@avenir.com` / `admin`)

### En local (Laragon / XAMPP)

- MySQL : importer `db/schema.sql` dans la base `avenir_bank`
- PostgreSQL : importer `db/schema-postgresql.sql`

---

## Comptes de test (temps réel)

Mot de passe identique pour les comptes de démo : `123`

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| `client@avenir-bank.fr` | `123` | **Client** |
| `advisor@avenir-bank.fr` | `123` | **Conseiller** |
| `director@avenir-bank.fr` | `123` | **Directeur** |

Ces comptes permettent de valider rapidement :
- SSE : réception de `news:created` et `savings_rate:updated`
- WebSocket : chat client↔conseiller et chat interne staff

---

## Vérifications rapides

1) **SSE News**
- Ouvrir le dashboard côté client (la cloche/toast SSE est branchée ici)
- Créer une actu côté conseiller/directeur
- Vérifier la réception du toast (événement `news:created`)

2) **SSE taux d’épargne**
- En tant que directeur, modifier le taux
- Vérifier la notification temps réel côté client sur le dashboard (`savings_rate:updated`)

3) **Chat client↔conseiller**
- Ouvrir `/messages` côté client et `/advisor/messages` côté conseiller
- Envoyer un message et vérifier : réception instantanée + typing indicator

4) **Chat interne staff**
- Ouvrir `/advisor/internal-chat` (conseiller) et `/admin/internal-chat` (directeur)
- Envoyer un message de groupe, vérifier la diffusion

5) **Cours actions**
- Ouvrir `/investment/stocks`
- Vérifier réception de `stock_price_update` (cours qui bougent)


