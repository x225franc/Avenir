# 🐳 Configuration Docker pour AVENIR

Ce guide explique comment démarrer les bases de données MySQL et PostgreSQL avec Docker au lieu de Laragon/installations locales.

## 📋 Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et démarré
- Les fichiers de schéma doivent exister :
  - `db/schema.sql` (MySQL)
  - `db/schema-postgres.sql` (PostgreSQL)

## 🚀 Démarrage rapide

### 1. Démarrer tous les services

```bash
# À la racine du projet
docker-compose up -d
```

Cette commande démarre :
- **MySQL** sur le port `3306` (avec fixtures)
- **PostgreSQL** sur le port `5432` (avec fixtures)
- **phpMyAdmin** sur [http://localhost:8080](http://localhost:8080)
- **pgAdmin** sur [http://localhost:8081](http://localhost:8081)

**✅ Les bases de données sont automatiquement créées avec des utilisateurs de test :**
- 👔 **Directeur** : `director@avenir-bank.fr` / `password`
- 👨‍💼 **Conseiller** : `advisor@avenir-bank.fr` / `password`
- 👤 **Client** : `client@avenir-bank.fr` / `password`

Les bases contiennent aussi :
- 5 actions boursières (AAPL, GOOGL, MSFT, TSLA, AMZN)
- Configuration du taux d'épargne (2.5%)
- Frais d'investissement (1€)

### 2. Vérifier que tout fonctionne

```bash
# Voir les conteneurs en cours d'exécution
docker-compose ps

# Voir les logs
docker-compose logs -f
```

Vous devriez voir 4 conteneurs :
- `avenir_mysql` (healthy)
- `avenir_postgres` (healthy)
- `avenir_phpmyadmin`
- `avenir_pgadmin`

### 3. Accéder aux interfaces web

#### phpMyAdmin (MySQL)
- **URL** : [http://localhost:8080](http://localhost:8080)
- **Utilisateur** : `root`
- **Mot de passe** : `root`
- **Base de données** : `avenir_bank`

#### pgAdmin (PostgreSQL)
- **URL** : [http://localhost:8081](http://localhost:8081)
- **Email** : `admin@avenir.com`
- **Mot de passe** : `admin`

**Configuration du serveur PostgreSQL dans pgAdmin :**
1. Clic droit sur "Servers" → "Register" → "Server"
2. **General tab** :
   - Name : `Avenir PostgreSQL`
3. **Connection tab** :
   - Host : `postgres` (nom du service Docker)
   - Port : `5433`
   - Database : `avenir_bank`
   - Username : `avenir`
   - Password : `avenir123`
   - Save password : ✅
4. Cliquer sur "Save"

## 🔧 Configuration des backends

### Express (MySQL)

Créer/modifier `Interface/api/express/.env` :

```env
# Base de données MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=avenir
DB_PASSWORD=avenir123
DB_NAME=avenir_bank

# Autres configurations...
JWT_SECRET=votre_secret_jwt
PORT=3000
FRONTEND_URL=http://localhost:3000
```

### NestJS (PostgreSQL)

Créer/modifier `Interface/api/nestjs/.env` :

```env
# Base de données PostgreSQL
DATABASE_URL=postgresql://avenir:avenir123@localhost:5432/avenir_bank

# Autres configurations...
JWT_SECRET=votre_secret_jwt
PORT=3001
FRONTEND_URL=http://localhost:3000
```

## 📊 Commandes utiles

### Gestion des conteneurs

```bash
# Démarrer les services
docker-compose up -d

# Arrêter les services
docker-compose down

# Arrêter et supprimer les volumes (⚠️ supprime les données)
docker-compose down -v

# Redémarrer un service spécifique
docker-compose restart mysql
docker-compose restart postgres

# Voir les logs d'un service
docker-compose logs -f mysql
docker-compose logs -f postgres
```

### Accès direct aux bases de données

#### MySQL

```bash
# Se connecter à MySQL en ligne de commande
docker exec -it avenir_mysql mysql -u root -proot avenir_bank

# Exporter la base
docker exec avenir_mysql mysqldump -u root -proot avenir_bank > backup.sql

# Importer un fichier SQL
docker exec -i avenir_mysql mysql -u root -proot avenir_bank < fichier.sql
```

#### PostgreSQL

```bash
# Se connecter à PostgreSQL en ligne de commande
docker exec -it avenir_postgres psql -U avenir -d avenir_bank

# Exporter la base
docker exec avenir_postgres pg_dump -U avenir avenir_bank > backup.sql

# Importer un fichier SQL
docker exec -i avenir_postgres psql -U avenir -d avenir_bank < fichier.sql
```

## 🔄 Réinitialiser les bases de données

Si vous voulez repartir de zéro :

```bash
# 1. Arrêter et supprimer les conteneurs + volumes
docker-compose down -v

# 2. Redémarrer (les schémas seront réimportés)
docker-compose up -d

# 3. Attendre que les bases soient prêtes (environ 10-20 secondes)
docker-compose logs -f mysql
docker-compose logs -f postgres
```

## 🐛 Résolution de problèmes

### Port déjà utilisé

Si les ports 3306, 5433, 8080 ou 8081 sont déjà utilisés :

**Option 1** : Arrêter les services locaux (Laragon, XAMPP, etc.)

**Option 2** : Modifier les ports dans `docker-compose.yml` :

```yaml
mysql:
  ports:
    - "3307:3306"  # Utiliser le port 3307 au lieu de 3306

postgres:
  ports:
    - "5433:5432"  # Utiliser le port 5433 au lieu de 5432

phpmyadmin:
  ports:
    - "8082:80"    # Utiliser le port 8082 au lieu de 8080

pgadmin:
  ports:
    - "8083:80"    # Utiliser le port 8083 au lieu de 8081
```

N'oubliez pas de mettre à jour vos fichiers `.env` avec les nouveaux ports !

### Les schémas ne s'importent pas

```bash
# Vérifier que les fichiers existent
ls -la db/schema.sql
ls -la db/schema-postgres.sql

# Forcer la réinitialisation
docker-compose down -v
docker-compose up -d

# Importer manuellement si besoin
docker exec -i avenir_mysql mysql -u root -proot avenir_bank < db/schema.sql
docker exec -i avenir_postgres psql -U avenir -d avenir_bank < db/schema-postgres.sql
```

### Conteneur en état "unhealthy"

```bash
# Voir les logs du conteneur
docker-compose logs mysql
docker-compose logs postgres

# Redémarrer le conteneur
docker-compose restart mysql
docker-compose restart postgres
```

## 🎯 Avantages de Docker

✅ **Installation simple** : Un seul `docker-compose up -d`
✅ **Isolation** : Pas de conflit avec d'autres installations
✅ **Reproductible** : Même environnement pour toute l'équipe
✅ **Réinitialisation facile** : `docker-compose down -v && docker-compose up -d`
✅ **Pas besoin de Laragon/XAMPP** : Tout est dans Docker
✅ **Interfaces web incluses** : phpMyAdmin + pgAdmin préconfigurés

## 📝 Notes importantes

- Les **données persistent** même après `docker-compose down` (grâce aux volumes Docker)
- Pour **supprimer les données**, utilisez `docker-compose down -v`
- Les schémas SQL s'importent **automatiquement** au premier démarrage
- Les bases sont accessibles depuis `localhost` (pas besoin de changer vos backends)

## 🔐 Identifiants par défaut

### MySQL
- **Root** : `root` / `root`
- **User** : `avenir` / `avenir123`
- **Database** : `avenir_bank`

### PostgreSQL
- **User** : `avenir` / `avenir123`
- **Database** : `avenir_bank`

### phpMyAdmin
- **User** : `root` / `root`

### pgAdmin
- **Email** : `admin@avenir.com`
- **Password** : `admin`

---

**💡 Conseil** : Ajoutez `docker-compose up -d` à votre workflow de démarrage quotidien, avant de lancer vos backends Express/NestJS.
