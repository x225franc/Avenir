# Banque AVENIR - Next.js
***Alliance de Valeurs Économiques et Nationales Investies Responsablement***

---

## Équipe du Projet

- **Diawara Alpha Malick** - 5IW2
- **Difuidi Mijosé** - 5IW2
- **Classe** : 5IW (Ingénierie Web)
- **Année** : 2025-2026

---


Le code frontend ici :

- `Interface/web/next/`

---

## Stack & Dépendances

- **Next.js** 15 (App Router)
- **React** 19
- **TypeScript**
- **Tailwind CSS** 4
- **MUI** (Material UI)
- **React Hook Form** + **Zod** (validation par schémas)
- **Axios** (API)
- **socket.io-client** (WebSocket)

---

## Structure du Frontend

```
Interface/web/next/
├── app/                      # Routes (App Router) + pages
│   ├── page.tsx              # Accueil
│   ├── layout.tsx            # Layout global + providers
│   ├── error.tsx             # Page 500 (error boundary App Router)
│   ├── not-found.tsx         # Page 404
│   ├── dashboard/            # Espace client
│   ├── advisor/              # Espace conseiller
│   ├── admin/                # Espace directeur/admin
│   ├── messages/             # Messagerie client
│   ├── news/                 # Actualités
│   └── ...
├── components/
│   ├── contexts/             # AuthContext, UiShellContext...
│   ├── hooks/                # Hooks (ex: useSSE)
│   ├── lib/                  # API client, SEO, cache, validations...
│   └── ui/                   # Composants UI
├── public/
│   └── sitemap.xml           # Sitemap statique
├── middleware.ts             # Stratégies de cache + headers sécurité
├── next.config.ts            # Headers cache + config images
└── package.json
```

---

## Prérequis

| Logiciel | Version Minimale | Notes |
|----------|------------------|-------|
| **Node.js** | 20+ | recommandé avec le monorepo |
| **npm** | 9+ | |
| **API Express** | | par défaut sur `http://localhost:3001` |

---

## Installation

### Depuis la racine du projet avec docker                                                                                                       

```bash
npm install
# ou
npm run install:all
```


**Ports par défaut :**
- API : http://localhost:3001
- Front : http://localhost:3000

---

## Variables d'environnement (Frontend)

Le frontend utilise des variables **NEXT_PUBLIC_*** (ex: accès API / WebSocket).

- `NEXT_PUBLIC_API_URL` (par défaut `http://localhost:3001/api`)
- `NEXT_PUBLIC_WS_URL` (par défaut `http://localhost:3001`)
- `NEXT_PUBLIC_API_WS_URL` (utilisé sur certaines pages, par défaut `http://localhost:3001`)

Exemple `.env.local` dans `Interface/web/next/` :

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=http://localhost:3001
NEXT_PUBLIC_API_WS_URL=http://localhost:3001
```

---

## Authentification (AuthContext)

- Gestion globale dans `components/contexts/AuthContext.tsx`
- Token stocké en `localStorage` (`token`)
- `components/lib/api/client.ts` ajoute automatiquement l’header `Authorization: Bearer <token>`
- Redirection automatique vers `/login` en cas de **401**

---

## Formulaires & Validation (React Hook Form + Zod)

- Formulaires gérés via **React Hook Form**
- Validation via **Zod** (schémas)

Organisation des validations :
- `components/lib/validations/`

---

## Structure & conception

Le projet organise les éléments UI dans `components/` afin de garder des composants réutilisables et isolés :

- `components/ui/` : composants UI (boutons, cartes, notifications, etc.)
- `components/contexts/` : Contexts React (ex: `AuthContext`)
- `components/hooks/` : hooks partagés (ex: `useSSE`)
- `components/lib/` : couches utilitaires (API client, cache, SEO, validations…)

Recommandation : conserver cette logique (petits composants réutilisables → assemblés dans les pages de `app/`).

---

## Pages 404 / 500

- 404 : `app/not-found.tsx`
- 500 : `app/error.tsx`

Ces pages respectent la charte et masquent header/footer via `UiShellContext`.

---

## SEO & Sitemap

- Métadonnées globales via `components/lib/seo/` + `app/layout.tsx`
- Les pages utilisent `useClientMetadata("/route")` pour appliquer des métadonnées côté client
- Sitemap statique : `public/sitemap.xml`


---

## Cache & Performance

Le frontend implémente plusieurs niveaux :

1) **Headers & cache navigateur/CDN**
- `next.config.ts` : headers cache (assets, images, /api)
- `middleware.ts` : stratégie cache selon la route + headers sécurité

2) **Cache applicatif (in-memory)**
- `components/lib/cache/index.ts` : cache avec TTL, invalidation, nettoyage
- `components/lib/cache/api-wrapper.ts` : `cachedFetch()` + `CachedApiService` (GET mis en cache)

---

## Temps Réel (intégration côté Next.js)

- Chat client : `app/messages/page.tsx` via `socket.io-client`
- Chat conseiller : `app/advisor/messages/page.tsx`
- Chat interne (staff) : `app/advisor/internal-chat/page.tsx` et `app/admin/internal-chat/page.tsx`
- Notifications SSE : `components/ui/SSENotifications.tsx` + hook `components/hooks/useSSE.ts`

---

## Comptes de test 

Mot de passe identique pour les comptes de démo : `123`

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| `client@avenir-bank.fr` | `123` | **Client** |
| `advisor@avenir-bank.fr` | `123` | **Conseiller** |
| `director@avenir-bank.fr` | `123` | **Directeur** |


