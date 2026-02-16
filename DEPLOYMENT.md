# 🚀 MechaPizzAI MMORPG - Guide de Déploiement

Ce guide explique comment déployer MechaPizzAI MMORPG en production.

## 📋 Table des matières

1. [Architecture de déploiement](#architecture-de-déploiement)
2. [Prérequis](#prérequis)
3. [Déploiement rapide](#déploiement-rapide)
4. [Configuration détaillée](#configuration-détaillée)
5. [Variables d'environnement](#variables-denvironnement)
6. [Monitoring](#monitoring)
7. [Rollback](#rollback)
8. [Dépannage](#dépannage)

---

## 🏗️ Architecture de déploiement

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│                    Vercel (Frontend)                        │
│              https://mechapizzai.vercel.app                 │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                        SERVEUR                              │
│              Railway / Render / Fly.io                      │
│              https://mechapizzai.up.railway.app             │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Node.js    │  │  PostgreSQL  │  │    Redis     │      │
│  │   API + WS   │  │   Database   │  │    Cache     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Prérequis

### Comptes nécessaires

- [GitHub](https://github.com) - Hébergement du code
- [Vercel](https://vercel.com) - Déploiement client (gratuit)
- [Railway](https://railway.app) ou [Render](https://render.com) - Déploiement serveur (gratuit tier disponible)
- [Neon](https://neon.tech) ou [Supabase](https://supabase.com) - PostgreSQL (optionnel, inclus avec Railway/Render)

### Oils locaux

- Node.js 20+
- Docker & Docker Compose (optionnel)
- Git

---

## 🚀 Déploiement rapide

### 1. Fork/Clone le repository

```bash
git clone https://github.com/VanLyxe/mechapizzai-mmorpg.git
cd mechapizzai-mmorpg
```

### 2. Configuration Vercel (Client)

#### Option A: Via CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
cd apps/client
vercel --prod
```

#### Option B: Via GitHub Integration

1. Connectez votre repo GitHub à Vercel
2. Configurez:
   - **Framework Preset**: Vite
   - **Root Directory**: `apps/client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Ajoutez les variables d'environnement:
   - `VITE_SERVER_URL`: URL de votre serveur Railway

### 3. Configuration Railway (Serveur)

#### Option A: Via CLI

```bash
# Installer Railway CLI
npm i -g @railway/cli

# Se connecter
railway login

# Créer un projet
railway init

# Ajouter PostgreSQL
railway add --database postgres

# Déployer
cd apps/server
railway up
```

#### Option B: Via Dashboard

1. Créez un nouveau projet sur Railway
2. Ajoutez une base de données PostgreSQL
3. Connectez votre repo GitHub
4. Configurez:
   - **Root Directory**: `apps/server`
   - **Build Command**: `docker build -t mechapizzai-server .`
   - **Start Command**: (laisser vide, utilise Dockerfile)
5. Ajoutez les variables d'environnement (voir ci-dessous)

### 4. Configuration CORS

Dans les variables d'environnement du serveur:

```
CLIENT_URL=https://votre-app-vercel.vercel.app
```

Et mettez à jour le client:

```
VITE_SERVER_URL=https://votre-app-railway.up.railway.app
```

---

## ⚙️ Configuration détaillée

### Structure des fichiers de configuration

```
mechapizzai-mmorpg/
├── apps/
│   ├── client/
│   │   ├── vercel.json          # Config Vercel
│   │   └── vite.config.ts       # Config build
│   └── server/
│       ├── Dockerfile            # Image Docker
│       └── railway.json          # Config Railway
├── infrastructure/
│   └── docker/
│       ├── docker-compose.prod.yml
│       └── nginx.prod.conf
├── .github/
│   └── workflows/
│       ├── ci.yml                # Tests CI
│       ├── deploy-client.yml     # Auto-deploy Vercel
│       └── deploy-server.yml     # Auto-deploy Railway
└── .env.production.example       # Template env
```

### Configuration Docker (Auto-hébergement)

```bash
# Copier le fichier d'environnement
cp .env.production.example .env

# Éditer les variables
nano .env

# Lancer en production
cd infrastructure/docker
docker-compose -f docker-compose.prod.yml up -d

# Voir les logs
docker-compose -f docker-compose.prod.yml logs -f

# Arrêter
docker-compose -f docker-compose.prod.yml down
```

---

## 🔐 Variables d'environnement

### Client (Vercel)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `VITE_SERVER_URL` | URL du serveur API | `https://api.mechapizzai.com` |
| `VITE_GAME_VERSION` | Version du jeu | `0.1.0` |

### Serveur (Railway/Render)

| Variable | Description | Obligatoire |
|----------|-------------|-------------|
| `PORT` | Port du serveur | ✅ |
| `NODE_ENV` | `production` | ✅ |
| `CLIENT_URL` | URL du client Vercel | ✅ |
| `DATABASE_URL` | URL PostgreSQL | ✅ |
| `REDIS_URL` | URL Redis | ❌ |
| `JWT_SECRET` | Clé secrète JWT | ✅ |
| `RATE_LIMIT_WINDOW_MS` | Fenêtre rate limit | ❌ |
| `RATE_LIMIT_MAX_REQUESTS` | Max requêtes | ❌ |

### Générer un JWT_SECRET sécurisé

```bash
openssl rand -base64 32
```

---

## 📊 Monitoring

### Health Check

Le serveur expose un endpoint de santé:

```bash
curl https://votre-serveur.com/health
```

Réponse:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "version": "0.2.0",
  "environment": "production",
  "players": 42,
  "rooms": 3
}
```

### Logs

**Railway:**
- Dashboard → Service → Logs

**Vercel:**
- Dashboard → Project → Functions → Logs

**Docker:**
```bash
docker-compose -f docker-compose.prod.yml logs -f server
```

### Alertes (Optionnel)

Intégrez Sentry pour le tracking d'erreurs:

1. Créez un projet sur [Sentry](https://sentry.io)
2. Ajoutez `SENTRY_DSN` aux variables d'environnement

---

## ↩️ Rollback

### Vercel (Client)

```bash
# Via CLI
vercel --prod --version=PREVIOUS_DEPLOYMENT_ID

# Via Dashboard
# Project → Deployments → ... → Promote to Production
```

### Railway (Serveur)

```bash
# Via CLI
railway up --rollback

# Via Dashboard
# Service → Deployments → Rollback
```

### Docker Compose

```bash
# Revenir à une version précédente
git checkout <commit-hash>
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 🔧 Dépannage

### Problème: CORS errors

**Symptôme:** `Access-Control-Allow-Origin` error dans le navigateur

**Solution:**
1. Vérifiez que `CLIENT_URL` sur le serveur correspond exactement à l'URL Vercel
2. Incluez le protocole (`https://`)
3. Pas de slash à la fin

### Problème: WebSocket ne se connecte pas

**Symptôme:** Les joueurs ne voient pas les autres

**Solution:**
1. Vérifiez que le serveur supporte WebSocket (Railway/Render oui par défaut)
2. Vérifiez le firewall/règles de sécurité
3. Testez avec: `wscat -c wss://votre-serveur.com/socket.io/`

### Problème: Base de données non connectée

**Symptôme:** Erreurs Prisma, pas de données persistantes

**Solution:**
```bash
# Vérifier la connexion
npx prisma db pull

# Redéployer les migrations
npx prisma migrate deploy
```

### Problème: Build échoue sur Vercel

**Symptôme:** `Module not found` ou erreurs TypeScript

**Solution:**
1. Vérifiez que le package `@mechapizzai/shared` est buildé
2. Vérifiez le `vercel.json`
3. Essayez un redeploy sans cache

---

## 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Railway](https://docs.railway.app)
- [Documentation Render](https://render.com/docs)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

---

## 🆘 Support

En cas de problème:
1. Vérifiez les logs sur Vercel/Railway
2. Testez le health check
3. Ouvrez une issue sur GitHub

**URLs de production:**
- Client: https://mechapizzai.vercel.app
- API: https://mechapizzai.up.railway.app
- Health: https://mechapizzai.up.railway.app/health
