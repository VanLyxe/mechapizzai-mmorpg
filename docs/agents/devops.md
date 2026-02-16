# 🔧 Agent DevOps - Documentation Détaillée

## Persona

**Nom** : Agent DevOps  
**Avatar** : 🔧  
**Rôle** : Infrastructure & CI/CD Lead  
**Spécialité** : Cloud, Docker, Kubernetes, Monitoring  
**Personnalité** : Automatiseur né, déteste les tâches répétitives  
**Catchphrase** : *"Ça marche sur ma machine... et partout ailleurs !"*

---

## Prompt Système

```
Tu es Agent DevOps, expert en infrastructure cloud et automatisation.
Tu travailles sur le déploiement et l'hébergement de MechaPizzAI MMORPG.

TES OBJECTIFS :
- Déploiement continu sans downtime
- Monitoring proactif (alertes avant les pannes)
- Sécurité renforcée (zero-trust)
- Optimisation des coûts cloud

STACK TECHNIQUE :
- Docker & Kubernetes
- GitHub Actions (CI/CD)
- Terraform (Infrastructure as Code)
- Prometheus + Grafana (Monitoring)
- AWS / Railway / Render (Cloud)

PRINCIPES DIRECTEURS :
1. Tout doit être automatisé (pas de clic manuel)
2. Infrastructure immutable (pas de modifications en prod)
3. Secrets jamais dans le code (vault/secrets manager)
4. Backup avant tout (3-2-1 rule)
5. Monitorer tout ce qui bouge

QUAND ON TE DEMANDE UNE INFRA :
- Propose une architecture cloud
- Estime les coûts mensuels
- Définis les stratégies de backup
- Prévois le scaling automatique
- Documente les procédures de secours
```

---

## Architecture Cloud

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                         DNS (Cloudflare)                    │
│                    SSL + DDoS Protection                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      Load Balancer                          │
│                 (Nginx / AWS ALB / Traefik)                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  Client Pod │ │  Client Pod │ │  Client Pod │
│  (Nginx)    │ │  (Nginx)    │ │  (Nginx)    │
└──────┬──────┘ └──────┬──────┘ └──────┬──────┘
       │               │               │
       └───────────────┼───────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway / Ingress                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Server Pod  │ │ Server Pod  │ │ Server Pod  │
│ (Node.js)   │ │ (Node.js)   │ │ (Node.js)   │
│ Socket.io   │ │ Socket.io   │ │ Socket.io   │
└──────┬──────┘ └──────┬──────┘ └──────┬──────┘
       │               │               │
       └───────────────┼───────────────┘
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Redis       │ │ PostgreSQL  │ │  S3/MinIO   │
│ (Cache)     │ │ (Database)  │ │  (Assets)   │
└─────────────┘ └─────────────┘ └─────────────┘
```

### Environnements

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    DEV      │────▶│    STAGING  │────▶│   PROD      │
│  (local)    │     │  (cloud)    │     │  (cloud)    │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ 1 replica   │     │ 2 replicas  │     │ 3+ replicas │
│ Debug on    │     │ Debug off   │     │ Debug off   │
│ Mock data   │     │ Copy prod   │     │ Real data   │
│ Free tier   │     │ Small tier  │     │ Full tier   │
└─────────────┘     └─────────────┘     └─────────────┘
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # ==========================================
  # TEST
  # ==========================================
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Test
        run: npm run test
      
      - name: Build
        run: npm run build

  # ==========================================
  # BUILD & PUSH DOCKER IMAGES
  # ==========================================
  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Build and push client
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./infrastructure/docker/Dockerfile.client
          push: true
          tags: |
            ghcr.io/${{ github.repository }}/client:${{ github.sha }}
            ghcr.io/${{ github.repository }}/client:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
      
      - name: Build and push server
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./infrastructure/docker/Dockerfile.server
          push: true
          tags: |
            ghcr.io/${{ github.repository }}/server:${{ github.sha }}
            ghcr.io/${{ github.repository }}/server:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # ==========================================
  # DEPLOY TO STAGING
  # ==========================================
  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Staging
        run: |
          echo "Deploying to staging..."
          # kubectl apply -f k8s/staging/
          # helm upgrade --install mechapizzai ./helm-chart -f values-staging.yaml

  # ==========================================
  # DEPLOY TO PRODUCTION
  # ==========================================
  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Production
        run: |
          echo "Deploying to production..."
          # kubectl apply -f k8s/production/
          # helm upgrade --install mechapizzai ./helm-chart -f values-production.yaml
      
      - name: Notify Discord
        uses: sarisia/actions-status-discord@v1
        if: always()
        with:
          webhook: ${{ secrets.DISCORD_WEBHOOK }}
          title: "Deploy to Production"
          description: "Version ${{ github.sha }}"
```

---

## Docker Configuration

### Multi-stage Builds

```dockerfile
# Dockerfile.client (optimisé)
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM nginx:alpine AS runner
COPY --from=builder /app/apps/client/dist /usr/share/nginx/html
COPY infrastructure/docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose (Local Dev)

```yaml
# docker-compose.yml
version: '3.8'

services:
  client:
    build:
      context: .
      dockerfile: infrastructure/docker/Dockerfile.client
    ports:
      - "3000:80"
    depends_on:
      - server

  server:
    build:
      context: .
      dockerfile: infrastructure/docker/Dockerfile.server
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/mechapizzai
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./apps/server:/app/apps/server
      - /app/node_modules

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: mechapizzai
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

  # Outils de dev
  pgadmin:
    image: dpage/pgadmin4
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@mechapizzai.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres

volumes:
  postgres-data:
  redis-data:
```

---

## Kubernetes

### Déploiement Server

```yaml
# k8s/server-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mechapizzai-server
  labels:
    app: mechapizzai-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mechapizzai-server
  template:
    metadata:
      labels:
        app: mechapizzai-server
    spec:
      containers:
        - name: server
          image: ghcr.io/vanlyxe/mechapizzai-mmorpg/server:latest
          ports:
            - containerPort: 3001
          env:
            - name: NODE_ENV
              value: "production"
            - name: PORT
              value: "3001"
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: mechapizzai-secrets
                  key: database-url
            - name: REDIS_URL
              valueFrom:
                secretKeyRef:
                  name: mechapizzai-secrets
                  key: redis-url
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3001
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 3001
            initialDelaySeconds: 5
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: mechapizzai-server-service
spec:
  selector:
    app: mechapizzai-server
  ports:
    - protocol: TCP
      port: 3001
      targetPort: 3001
  type: ClusterIP
```

### Horizontal Pod Autoscaler

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: mechapizzai-server-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: mechapizzai-server
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Percent
          value: 100
          periodSeconds: 15
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60
```

---

## Monitoring

### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'mechapizzai-server'
    static_configs:
      - targets: ['mechapizzai-server:3001']
    metrics_path: /metrics
    
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
      
  - job_name: 'postgres-exporter'
    static_configs:
      - targets: ['postgres-exporter:9187']
      
  - job_name: 'redis-exporter'
    static_configs:
      - targets: ['redis-exporter:9121']
```

### Grafana Dashboard (JSON Model)

```json
{
  "dashboard": {
    "title": "MechaPizzAI Monitoring",
    "panels": [
      {
        "title": "Joueurs en ligne",
        "type": "stat",
        "targets": [
          {
            "expr": "game_players_online"
          }
        ]
      },
      {
        "title": "Latence moyenne",
        "type": "graph",
        "targets": [
          {
            "expr": "avg(socket_latency_seconds)"
          }
        ]
      },
      {
        "title": "Requêtes par seconde",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Utilisation CPU",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(container_cpu_usage_seconds_total[5m])"
          }
        ]
      },
      {
        "title": "Utilisation Mémoire",
        "type": "graph",
        "targets": [
          {
            "expr": "container_memory_usage_bytes"
          }
        ]
      }
    ]
  }
}
```

### Alertes (AlertManager)

```yaml
# alertmanager.yml
groups:
  - name: mechapizzai
    rules:
      - alert: HighLatency
        expr: avg(socket_latency_seconds) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Latence élevée détectée"
          description: "Latence moyenne > 100ms"
      
      - alert: PlayersDisconnected
        expr: game_players_online < 10
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Baisse soudaine des joueurs"
          description: "Moins de 10 joueurs en ligne"
      
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Taux d'erreur élevé"
          description: "Plus de 10% d'erreurs 5xx"
```

---

## Backup & Recovery

### Stratégie 3-2-1

```bash
#!/bin/bash
# backup.sh

# 3 copies des données
# 2 types de stockage différents
# 1 copie offsite

DATE=$(date +%Y%m%d_%H%M%S)

# Backup PostgreSQL
docker exec mechapizzai-postgres pg_dump -U postgres mechapizzai > \
  /backups/postgres/mechapizzai_${DATE}.sql

# Backup Redis
docker exec mechapizzai-redis redis-cli BGSAVE
cp /var/lib/redis/dump.rdb /backups/redis/redis_${DATE}.rdb

# Compression
gzip /backups/postgres/mechapizzai_${DATE}.sql

# Upload vers S3 (offsite)
aws s3 cp /backups/postgres/mechapizzai_${DATE}.sql.gz s3://mechapizzai-backups/postgres/
aws s3 cp /backups/redis/redis_${DATE}.rdb s3://mechapizzai-backups/redis/

# Cleanup (garder 7 jours en local)
find /backups -name "*.gz" -mtime +7 -delete
find /backups -name "*.rdb" -mtime +7 -delete

echo "Backup completed: ${DATE}"
```

### Cron Job

```bash
# Crontab - backup toutes les 4 heures
0 */4 * * * /opt/mechapizzai/scripts/backup.sh >> /var/log/mechapizzai-backup.log 2>&1
```

---

## Sécurité

### Checklist Sécurité

- [ ] Secrets dans Vault/AWS Secrets Manager
- [ ] Pas de credentials dans le code
- [ ] Images Docker scannées (Trivy/Snyk)
- [ ] Network policies Kubernetes
- [ ] WAF (Web Application Firewall)
- [ ] DDoS protection (Cloudflare)
- [ ] SSL/TLS partout
- [ ] MFA pour l'accès admin
- [ ] Audit logs activés
- [ ] Penetration testing régulier

### Network Policies

```yaml
# k8s/network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: mechapizzai-server-policy
spec:
  podSelector:
    matchLabels:
      app: mechapizzai-server
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
      ports:
        - protocol: TCP
          port: 3001
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: postgres
      ports:
        - protocol: TCP
          port: 5432
    - to:
        - podSelector:
            matchLabels:
              app: redis
      ports:
        - protocol: TCP
          port: 6379
```

---

## Coûts Estimation

### Infrastructure Mensuelle (Production)

| Service | Provider | Coût/mois |
|---------|----------|-----------|
| Kubernetes Cluster | AWS EKS / GKE | $150-300 |
| Compute (3-10 nodes) | AWS EC2 | $200-500 |
| PostgreSQL | AWS RDS | $100-200 |
| Redis | AWS ElastiCache | $50-100 |
| Load Balancer | AWS ALB | $25-50 |
| Bandwidth | AWS | $50-200 |
| Monitoring | Datadog / New Relic | $50-100 |
| **Total estimé** | | **$625-1450** |

### Optimisations Coûts

- Utiliser Spot Instances (60% moins cher)
- Autoscaling agressif
- CDN pour les assets statiques
- Reserved Instances pour la base

---

## Communication avec les Autres Agents

### Avec Agent Socket (Backend)
- **Tu donnes** : Infrastructure déployée, URLs
- **Tu reçois** : Besoins en ressources
- **Discussion** : Scaling et monitoring

### Avec Agent QA (Tests)
- **Tu donnes** : Environnements de test
- **Tu reçois** : Rapports de performance
- **Discussion** : Optimisations

### Avec tous les Agents
- **Tu donnes** : Documentation runbooks
- **Tu reçois** : Alertes et incidents
- **Discussion** : Amélioration continue

---

*"Une bonne infrastructure, c'est comme une bonne pizza : bien cuite, bien distribuée, et qui ne tombe jamais !"* 🍕🔧