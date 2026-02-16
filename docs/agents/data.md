# 🗄️ Agent Data - Documentation Détaillée

## Persona

**Nom** : Agent Data  
**Avatar** : 🗄️  
**Rôle** : Database & Systems Architect  
**Spécialité** : Modélisation données, Progression, Économie  
**Personnalité** : Méthodique, analytique, amoureux des stats  
**Catchphrase** : *"Les données ne mentent pas."*

---

## Prompt Système

```
Tu es Agent Data, expert en conception de systèmes de jeu et architecture de bases de données.
Tu travailles sur les mécaniques de progression et l'économie de MechaPizzAI MMORPG.

TES OBJECTIFS :
- Équilibre du jeu (fairness)
- Intégrité des données (ACID)
- Performance des requêtes (< 10ms)
- Scalabilité des systèmes

STACK TECHNIQUE :
- PostgreSQL (données relationnelles)
- Prisma (ORM)
- Redis (cache)
- ClickHouse (analytics)

PRINCIPES DIRECTEURS :
1. Normalise d'abord, dénormalise si nécessaire
2. Toutes les transactions doivent être ACID
3. Cache intelligemment (invalidation)
4. Versionne tes schémas (migrations)
5. Documente les formules de jeu

QUAND ON TE DEMANDE UN SYSTÈME :
- Propose un schéma de base de données
- Définis les formules mathématiques
- Identifie les index nécessaires
- Prévois la stratégie de cache
- Documente les cas limites
```

---

## Schéma de Base de Données

### Diagramme ERD

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     users       │     │    players      │     │    guilds       │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │────▶│ id (PK)         │     │ id (PK)         │
│ email           │     │ user_id (FK)    │     │ name            │
│ password_hash   │     │ username        │     │ tag             │
│ created_at      │     │ level           │◀────│ leader_id (FK)  │
│ updated_at      │     │ experience      │     │ level           │
└─────────────────┘     │ health          │     │ experience      │
                        │ energy          │     │ created_at      │
                        │ credits         │     └─────────────────┘
                        │ guild_id (FK)   │              │
                        │ position_x      │              │
                        │ position_y      │              ▼
                        │ last_login      │     ┌─────────────────┐
                        └─────────────────┘     │  guild_members  │
                                 │              ├─────────────────┤
                                 │              │ guild_id (FK)   │
                                 ▼              │ player_id (FK)  │
                        ┌─────────────────┐     │ role            │
                        │   inventories   │     │ joined_at       │
                        ├─────────────────┤     └─────────────────┘
                        │ id (PK)         │
                        │ player_id (FK)  │
                        │ item_id (FK)    │
                        │ quantity        │
                        │ equipped        │
                        └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │     items       │
                        ├─────────────────┤
                        │ id (PK)         │
                        │ name            │
                        │ description     │
                        │ type            │
                        │ rarity          │
                        │ stats           │
                        └─────────────────┘
```

### Tables Principales

#### Users (Authentification)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

#### Players (Progression)
```sql
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(20) UNIQUE NOT NULL,
  level INTEGER DEFAULT 1,
  experience BIGINT DEFAULT 0,
  health INTEGER DEFAULT 100,
  max_health INTEGER DEFAULT 100,
  energy INTEGER DEFAULT 100,
  max_energy INTEGER DEFAULT 100,
  credits BIGINT DEFAULT 0,
  guild_id UUID REFERENCES guilds(id),
  position_x FLOAT DEFAULT 0,
  position_y FLOAT DEFAULT 0,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_players_user_id ON players(user_id);
CREATE INDEX idx_players_guild_id ON players(guild_id);
CREATE INDEX idx_players_username ON players(username);
```

#### Items
```sql
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- 'consumable', 'equipment', 'material', 'quest'
  rarity VARCHAR(20) NOT NULL, -- 'common', 'uncommon', 'rare', 'epic', 'legendary'
  icon_url VARCHAR(255),
  stackable BOOLEAN DEFAULT TRUE,
  max_stack INTEGER DEFAULT 99,
  stats JSONB, -- { "speed": 10, "defense": 5 }
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_items_type ON items(type);
CREATE INDEX idx_items_rarity ON items(rarity);
```

#### Inventories
```sql
CREATE TABLE inventories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  equipped BOOLEAN DEFAULT FALSE,
  slot INTEGER, -- pour l'équipement
  acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(player_id, item_id, slot)
);

CREATE INDEX idx_inventories_player_id ON inventories(player_id);
CREATE INDEX idx_inventories_item_id ON inventories(item_id);
```

#### Quests
```sql
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- 'delivery', 'collection', 'combat', 'social'
  requirements JSONB, -- { "level": 5, "items": ["id1", "id2"] }
  rewards JSONB, -- { "experience": 100, "credits": 50, "items": ["id1"] }
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE player_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'failed'
  progress JSONB DEFAULT '{}', -- { "collected": 5, "target": 10 }
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  UNIQUE(player_id, quest_id)
);

CREATE INDEX idx_player_quests_player_id ON player_quests(player_id);
CREATE INDEX idx_player_quests_status ON player_quests(status);
```

---

## Système de Progression

### Formules d'XP

```typescript
// XP nécessaire pour passer au niveau suivant
function getXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

// XP totale accumulée pour atteindre un niveau
function getTotalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += getXpForLevel(i);
  }
  return total;
}

// Niveau actuel basé sur l'XP totale
function getLevelFromXp(totalXp: number): number {
  let level = 1;
  let xpNeeded = getXpForLevel(level);
  
  while (totalXp >= xpNeeded) {
    totalXp -= xpNeeded;
    level++;
    xpNeeded = getXpForLevel(level);
  }
  
  return level;
}

// Exemples:
// Niveau 1 → 2: 100 XP
// Niveau 2 → 3: 283 XP
// Niveau 10 → 11: 3,162 XP
// Niveau 50 → 51: 35,355 XP
```

### Récompenses par Niveau

```typescript
interface LevelReward {
  level: number;
  maxHealth: number;
  maxEnergy: number;
  unlocks: string[];
}

const levelRewards: LevelReward[] = [
  { level: 1, maxHealth: 100, maxEnergy: 100, unlocks: ['basic_delivery'] },
  { level: 5, maxHealth: 120, maxEnergy: 110, unlocks: ['hoverboard', 'guild_join'] },
  { level: 10, maxHealth: 150, maxEnergy: 125, unlocks: ['premium_delivery', 'trading'] },
  { level: 25, maxHealth: 200, maxEnergy: 150, unlocks: ['agency_creation', 'advanced_automation'] },
  { level: 50, maxHealth: 300, maxEnergy: 200, unlocks: ['legendary_delivery', 'mentor_status'] },
];
```

---

## Économie du Jeu

### Sources de Revenus

```typescript
interface IncomeSource {
  name: string;
  baseAmount: number;
  levelMultiplier: number;
  cooldown: number; // secondes
}

const incomeSources: IncomeSource[] = [
  { name: 'delivery_basic', baseAmount: 10, levelMultiplier: 1.1, cooldown: 60 },
  { name: 'delivery_premium', baseAmount: 50, levelMultiplier: 1.2, cooldown: 300 },
  { name: 'delivery_legendary', baseAmount: 200, levelMultiplier: 1.5, cooldown: 1800 },
  { name: 'quest_daily', baseAmount: 100, levelMultiplier: 1.0, cooldown: 86400 },
  { name: 'automation_passive', baseAmount: 5, levelMultiplier: 1.3, cooldown: 60 },
];

// Calcul des gains
function calculateReward(
  source: IncomeSource,
  playerLevel: number
): number {
  return Math.floor(
    source.baseAmount * Math.pow(source.levelMultiplier, playerLevel - 1)
  );
}
```

### Système de Rareté

```typescript
type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

interface RarityConfig {
  name: Rarity;
  dropChance: number; // pourcentage
  color: string;
  multiplier: number; // valeur de revente
}

const rarityTable: Record<Rarity, RarityConfig> = {
  common: { name: 'common', dropChance: 60, color: '#9CA3AF', multiplier: 1 },
  uncommon: { name: 'uncommon', dropChance: 25, color: '#10B981', multiplier: 2 },
  rare: { name: 'rare', dropChance: 10, color: '#00D4FF', multiplier: 5 },
  epic: { name: 'epic', dropChance: 4, color: '#8B5CF6', multiplier: 15 },
  legendary: { name: 'legendary', dropChance: 1, color: '#FF6B35', multiplier: 50 },
};

// Tirage aléatoire pondéré
function rollRarity(): Rarity {
  const roll = Math.random() * 100;
  let cumulative = 0;
  
  for (const [rarity, config] of Object.entries(rarityTable)) {
    cumulative += config.dropChance;
    if (roll <= cumulative) {
      return rarity as Rarity;
    }
  }
  
  return 'common';
}
```

---

## Stratégie de Cache

### Redis Cache Keys

```typescript
const cacheKeys = {
  // Player data (TTL: 5 minutes)
  player: (id: string) => `player:${id}`,
  playerInventory: (id: string) => `player:${id}:inventory`,
  
  // Guild data (TTL: 10 minutes)
  guild: (id: string) => `guild:${id}`,
  guildMembers: (id: string) => `guild:${id}:members`,
  
  // Global data (TTL: 1 hour)
  item: (id: string) => `item:${id}`,
  quest: (id: string) => `quest:${id}`,
  
  // Leaderboards (TTL: 5 minutes)
  leaderboardXp: 'leaderboard:xp',
  leaderboardCredits: 'leaderboard:credits',
  
  // Rate limiting (TTL: 1 second to 1 hour)
  rateLimit: (playerId: string, action: string) => `ratelimit:${playerId}:${action}`,
};
```

### Pattern Cache-Aside

```typescript
class PlayerRepository {
  private prisma: PrismaClient;
  private redis: Redis;
  
  async getPlayer(id: string): Promise<Player | null> {
    // 1. Try cache
    const cached = await this.redis.get(cacheKeys.player(id));
    if (cached) {
      return JSON.parse(cached);
    }
    
    // 2. Fetch from DB
    const player = await this.prisma.player.findUnique({ where: { id } });
    if (!player) return null;
    
    // 3. Store in cache
    await this.redis.setex(
      cacheKeys.player(id),
      300, // 5 minutes
      JSON.stringify(player)
    );
    
    return player;
  }
  
  async updatePlayer(id: string, data: Partial<Player>): Promise<Player> {
    // 1. Update DB
    const player = await this.prisma.player.update({
      where: { id },
      data,
    });
    
    // 2. Invalidate cache
    await this.redis.del(cacheKeys.player(id));
    
    return player;
  }
}
```

---

## Analytics

### Événements à Tracker

```typescript
interface GameEvent {
  timestamp: Date;
  playerId: string;
  eventType: string;
  data: Record<string, any>;
}

// Événements importants
const trackedEvents = [
  'player:login',
  'player:logout',
  'player:level_up',
  'quest:completed',
  'item:acquired',
  'item:used',
  'delivery:completed',
  'credits:earned',
  'credits:spent',
  'guild:joined',
  'guild:left',
];
```

### Métriques Clés

```typescript
interface GameMetrics {
  // Engagement
  dau: number; // Daily Active Users
  mau: number; // Monthly Active Users
  avgSessionDuration: number; // minutes
  
  // Progression
  avgPlayerLevel: number;
  levelDistribution: Record<number, number>;
  
  // Économie
  totalCreditsInCirculation: bigint;
  avgCreditsPerPlayer: number;
  marketplaceVolume: bigint;
  
  // Social
  guildCount: number;
  avgGuildSize: number;
  messagesPerDay: number;
}
```

---

## Migrations

### Exemple de Migration Prisma

```typescript
// prisma/migrations/20240101000000_init/migration.sql

-- Create tables
CREATE TABLE "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "password_hash" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX "idx_users_email" ON "users"("email");

-- migration.ts
import { PrismaClient } from '@prisma/client';

async function migrate() {
  const prisma = new PrismaClient();
  
  // Migration logic here
  
  await prisma.$disconnect();
}

migrate().catch(console.error);
```

---

## Checklist de Développement

### Avant de créer une table :

- [ ] Identifier les relations avec les tables existantes
- [ ] Définir les indexes nécessaires
- [ ] Prévoir la stratégie de cache
- [ ] Documenter dans le schéma Prisma

### Avant de modifier une table :

- [ ] Créer une migration
- [ ] Tester la migration (up et down)
- [ ] Vérifier l'impact sur le cache
- [ ] Mettre à jour la documentation

### Pour les formules de jeu :

- [ ] Tester avec des valeurs extrêmes
- [ ] Vérifier l'équilibre (pas trop facile/difficile)
- [ ] Documenter la formule mathématique
- [ ] Créer des tests unitaires

---

## Communication avec les Autres Agents

### Avec Agent Socket (Backend)
- **Tu donnes** : Schémas de données, requêtes optimisées
- **Tu reçois** : Besoins en temps réel
- **Discussion** : Caching et invalidation

### Avec Agent Phaser (Client)
- **Tu donnes** : Structures de données pour l'UI
- **Tu reçois** : Besoins en affichage
- **Discussion** : Format des réponses API

### Avec Agent QA (Tests)
- **Tu donnes** : Données de test, scénarios
- **Tu reçois** : Rapports d'intégrité
- **Discussion** : Tests de charge sur la DB

---

*"Une bonne base de données, c'est comme une bonne pizza : bien structurée, consistante, et qui scale !"* 🍕🗄️