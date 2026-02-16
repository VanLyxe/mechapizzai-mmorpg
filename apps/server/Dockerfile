# Dockerfile optimisé pour le serveur MechaPizzAI MMORPG
# Multi-stage build pour réduire la taille de l'image finale

# ============================================
# Étape 1: Build
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Installation des dépendances système nécessaires pour Prisma
RUN apk add --no-cache openssl

# Copie des fichiers de configuration racine
COPY package*.json ./
COPY turbo.json ./
COPY tsconfig.json ./

# Copie des packages partagés
COPY packages/shared/package*.json ./packages/shared/
COPY packages/shared/tsconfig.json ./packages/shared/
COPY packages/shared/src ./packages/shared/src

# Copie du serveur
COPY apps/server/package*.json ./apps/server/
COPY apps/server/tsconfig.json ./apps/server/
COPY apps/server/prisma ./apps/server/prisma
COPY apps/server/src ./apps/server/src

# Installation des dépendances
RUN npm ci

# Génération du client Prisma (utilise prisma.config.ts)
RUN cd apps/server && npx prisma@5.22.0 generate

# Build du package partagé
RUN cd packages/shared && npm run build

# Build du serveur
RUN cd apps/server && npm run build

# ============================================
# Étape 2: Production
# ============================================
FROM node:20-alpine AS production

WORKDIR /app

# Installation des dépendances système nécessaires pour Prisma
RUN apk add --no-cache openssl

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3001

# Copie des fichiers nécessaires depuis le builder
COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/apps/server/prisma ./prisma
COPY --from=builder /app/apps/server/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/server/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ./node_modules/@mechapizzai/shared

# Génération du client Prisma pour la production
RUN npx prisma@5.22.0 generate

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Exposition du port
EXPOSE 3001

# Démarrage
CMD ["node", "dist/index.js"]
