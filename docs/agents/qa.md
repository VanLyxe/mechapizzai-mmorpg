# 🧪 Agent QA - Documentation Détaillée

## Persona

**Nom** : Agent QA  
**Avatar** : 🧪  
**Rôle** : Testing & Quality Assurance Lead  
**Spécialité** : Tests automatisés, Bug hunting, UX Testing  
**Personnalité** : Curieux, casse-cou, détective des bugs  
**Catchphrase** : *"J'ai trouvé un bug ! (encore)"*

---

## Prompt Système

```
Tu es Agent QA, expert en assurance qualité et tests de logiciels.
Tu travailles sur la fiabilité de MechaPizzAI MMORPG.

TES OBJECTIFS :
- Couverture de tests maximale (> 80%)
- Détection précoce des bugs
- Tests de charge réalistes
- Expérience utilisateur fluide

STACK TECHNIQUE :
- Jest (tests unitaires)
- Playwright (tests E2E)
- k6 (tests de charge)
- Sentry (error tracking)
- Storybook (tests visuels)

PRINCIPES DIRECTEURS :
1. Teste comme un utilisateur (pas comme un dev)
2. Automatise tout ce qui est répétitif
3. Documente les bugs avec repro steps clairs
4. Priorise par impact utilisateur
5. Sois paranoïaque (tout peut casser)

QUAND ON TE DEMANDE UN TEST :
- Définis les cas de test (happy path + edge cases)
- Propose une stratégie de test (unitaire/intégration/E2E)
- Identifie les risques
- Prévois les données de test
- Documente les critères d'acceptation
```

---

## Stratégie de Test

### Pyramide des Tests

```
         /\
        /  \
       / E2E \          (10%) - Tests de bout en bout
      /────────\         Playwright
     /          \
    / Integration \      (30%) - Tests d'intégration
   /────────────────\     Jest + Supertest
  /                  \
 /      Unit          \   (60%) - Tests unitaires
/────────────────────────\  Jest
```

### Types de Tests

| Type | Outil | Couverture | Fréquence |
|------|-------|------------|-----------|
| **Unitaires** | Jest | Fonctions, classes | À chaque commit |
| **Intégration** | Jest + Supertest | API, DB | À chaque PR |
| **E2E** | Playwright | Parcours utilisateur | Avant release |
| **Charge** | k6 | Performance | Hebdomadaire |
| **Visuels** | Storybook | UI components | À chaque PR |
| **Manuels** | - | Exploratoire | Sprint review |

---

## Tests Unitaires

### Exemple : Player Movement

```typescript
// src/__tests__/player.test.ts
import { Player } from '../entities/Player';
import { createMockScene } from './utils/mockScene';

describe('Player', () => {
  let player: Player;
  let scene: Phaser.Scene;

  beforeEach(() => {
    scene = createMockScene();
    player = new Player(scene, 0, 0, 'player-1');
  });

  describe('Movement', () => {
    it('should move player to target position', () => {
      player.moveTo(100, 100);
      
      expect(player.x).toBe(100);
      expect(player.y).toBe(100);
    });

    it('should respect max speed', () => {
      const startX = player.x;
      player.setVelocity(1000, 0); // Trop rapide
      
      player.update(0, 16); // 16ms = 1 frame à 60fps
      
      const distance = player.x - startX;
      expect(distance).toBeLessThanOrEqual(player.maxSpeed / 60);
    });

    it('should stop when calling stop()', () => {
      player.setVelocity(100, 100);
      player.stop();
      
      expect(player.body.velocity.x).toBe(0);
      expect(player.body.velocity.y).toBe(0);
    });
  });

  describe('Health', () => {
    it('should decrease health when taking damage', () => {
      const initialHealth = player.health;
      player.takeDamage(10);
      
      expect(player.health).toBe(initialHealth - 10);
    });

    it('should not go below 0 health', () => {
      player.takeDamage(9999);
      
      expect(player.health).toBe(0);
      expect(player.isDead()).toBe(true);
    });

    it('should emit death event when health reaches 0', () => {
      const deathHandler = jest.fn();
      player.on('death', deathHandler);
      
      player.takeDamage(player.maxHealth);
      
      expect(deathHandler).toHaveBeenCalled();
    });
  });
});
```

### Exemple : Network Manager

```typescript
// src/__tests__/network.test.ts
import { NetworkManager } from '../network/NetworkManager';
import { io, Socket } from 'socket.io-client';

jest.mock('socket.io-client');

describe('NetworkManager', () => {
  let network: NetworkManager;
  let mockSocket: jest.Mocked<Socket>;

  beforeEach(() => {
    mockSocket = {
      on: jest.fn(),
      emit: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
      id: 'test-socket-id',
    } as any;

    (io as jest.Mock).mockReturnValue(mockSocket);
    network = new NetworkManager('http://localhost:3001');
  });

  describe('Connection', () => {
    it('should connect to server', async () => {
      const connectHandler = jest.fn();
      mockSocket.on.mockImplementation((event, handler) => {
        if (event === 'connect') handler();
      });

      const result = await network.connect();

      expect(result).toBe(true);
      expect(network.getIsConnected()).toBe(true);
    });

    it('should handle connection error', async () => {
      mockSocket.on.mockImplementation((event, handler) => {
        if (event === 'connect_error') handler(new Error('Connection failed'));
      });

      const result = await network.connect();

      expect(result).toBe(false);
      expect(network.getIsConnected()).toBe(false);
    });
  });

  describe('Player Position', () => {
    it('should send position update', () => {
      network.connect();
      network.sendPlayerPosition(100, 200);

      expect(mockSocket.emit).toHaveBeenCalledWith('player:move', {
        x: 100,
        y: 200,
      });
    });

    it('should not send if not connected', () => {
      network.sendPlayerPosition(100, 200);

      expect(mockSocket.emit).not.toHaveBeenCalled();
    });
  });

  describe('Rate Limiting', () => {
    it('should throttle position updates', () => {
      network.connect();
      
      // Envoyer 100 updates en 1 seconde
      for (let i = 0; i < 100; i++) {
        network.sendPlayerPosition(i, i);
      }

      // Devrait être throttlé à ~20 updates/sec
      expect(mockSocket.emit).toHaveBeenCalledTimes(20);
    });
  });
});
```

---

## Tests d'Intégration

### API Tests

```typescript
// src/__tests__/api.test.ts
import request from 'supertest';
import { app } from '../server';
import { prisma } from '../database';

describe('API Integration', () => {
  beforeAll(async () => {
    // Setup test database
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean database
    await prisma.player.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('POST /api/players', () => {
    it('should create a new player', async () => {
      const response = await request(app)
        .post('/api/players')
        .send({
          username: 'TestPlayer',
          email: 'test@example.com',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe('TestPlayer');

      // Verify in database
      const player = await prisma.player.findUnique({
        where: { id: response.body.id },
      });
      expect(player).not.toBeNull();
    });

    it('should reject duplicate username', async () => {
      // Create first player
      await request(app)
        .post('/api/players')
        .send({
          username: 'TestPlayer',
          email: 'test1@example.com',
        });

      // Try to create second with same username
      const response = await request(app)
        .post('/api/players')
        .send({
          username: 'TestPlayer',
          email: 'test2@example.com',
        })
        .expect(409);

      expect(response.body.error).toContain('already exists');
    });

    it('should validate username format', async () => {
      const response = await request(app)
        .post('/api/players')
        .send({
          username: 'ab', // Too short
          email: 'test@example.com',
        })
        .expect(400);

      expect(response.body.error).toContain('username');
    });
  });

  describe('GET /api/players/:id', () => {
    it('should return player data', async () => {
      // Create player
      const createRes = await request(app)
        .post('/api/players')
        .send({
          username: 'TestPlayer',
          email: 'test@example.com',
        });

      const playerId = createRes.body.id;

      // Get player
      const response = await request(app)
        .get(`/api/players/${playerId}`)
        .expect(200);

      expect(response.body.id).toBe(playerId);
      expect(response.body.username).toBe('TestPlayer');
    });

    it('should return 404 for non-existent player', async () => {
      await request(app)
        .get('/api/players/non-existent-id')
        .expect(404);
    });
  });
});
```

---

## Tests E2E (End-to-End)

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Tests E2E : Parcours Utilisateur

```typescript
// e2e/gameplay.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Gameplay', () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('user can start the game', async ({ page }) => {
    // Vérifier le menu principal
    await expect(page.locator('text=MECHAPIZZAI')).toBeVisible();
    await expect(page.locator('text=JOUER')).toBeVisible();

    // Cliquer sur Jouer
    await page.click('text=JOUER');

    // Vérifier que le jeu démarre
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('user can move character', async ({ page }) => {
    // Démarrer le jeu
    await page.goto('/');
    await page.click('text=JOUER');
    await page.waitForSelector('canvas');

    // Attendre le chargement
    await page.waitForTimeout(1000);

    // Simuler mouvement (flèches)
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(500);

    // Vérifier que le personnage a bougé (via console ou API)
    const playerPosition = await page.evaluate(() => {
      return (window as any).game?.scene?.scenes[0]?.player?.position;
    });

    expect(playerPosition.x).not.toBe(0);
    expect(playerPosition.y).not.toBe(0);
  });

  test('user can send chat message', async ({ page }) => {
    await page.goto('/');
    await page.click('text=JOUER');
    await page.waitForSelector('canvas');

    // Ouvrir le chat (touche T)
    await page.keyboard.press('t');

    // Vérifier que l'input est visible
    await expect(page.locator('input[placeholder*="chat"]')).toBeVisible();

    // Taper un message
    await page.fill('input[placeholder*="chat"]', 'Hello World!');
    await page.keyboard.press('Enter');

    // Vérifier que le message apparaît
    await expect(page.locator('text=Hello World!')).toBeVisible();
  });

  test('multiplayer - two players can see each other', async ({ browser }) => {
    // Créer deux contextes (deux joueurs)
    const player1Context = await browser.newContext();
    const player2Context = await browser.newContext();

    const player1Page = await player1Context.newPage();
    const player2Page = await player2Context.newPage();

    // Les deux joueurs rejoignent
    await player1Page.goto('/');
    await player1Page.click('text=JOUER');
    await player1Page.waitForTimeout(1000);

    await player2Page.goto('/');
    await player2Page.click('text=JOUER');
    await player2Page.waitForTimeout(1000);

    // Player 1 envoie un message
    await player1Page.keyboard.press('t');
    await player1Page.fill('input[placeholder*="chat"]', 'Hey Player 2!');
    await player1Page.keyboard.press('Enter');

    // Player 2 devrait voir le message
    await expect(player2Page.locator('text=Hey Player 2!')).toBeVisible({
      timeout: 5000,
    });
  });
});
```

---

## Tests de Charge

### k6 Script

```javascript
// load-tests/gameplay.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import ws from 'k6/ws';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100
    { duration: '2m', target: 200 }, // Ramp up to 200
    { duration: '5m', target: 200 }, // Stay at 200
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% des requêtes < 200ms
    http_req_failed: ['rate<0.01'],   // < 1% d'erreurs
  },
};

export default function () {
  // Test HTTP API
  const res = http.get('http://localhost:3001/health');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });

  // Test WebSocket
  const url = 'ws://localhost:3001/socket.io/?EIO=4&transport=websocket';
  const response = ws.connect(url, null, function (socket) {
    socket.on('open', function () {
      console.log('Connected');
      socket.send(JSON.stringify({ type: 'ping' }));
    });

    socket.on('message', function (message) {
      console.log('Received message: ', message);
    });

    socket.on('close', function () {
      console.log('Disconnected');
    });

    // Envoyer position toutes les 50ms (comme le vrai client)
    socket.setInterval(function () {
      socket.send(
        JSON.stringify({
          type: 'player:move',
          data: {
            x: Math.random() * 1000,
            y: Math.random() * 1000,
          },
        })
      );
    }, 50);

    // Déconnexion après 10 secondes
    socket.setTimeout(function () {
      socket.close();
    }, 10000);
  });

  check(response, { 'WebSocket status is 101': (r) => r && r.status === 101 });

  sleep(1);
}
```

### Exécution

```bash
# Installation
npm install -g k6

# Run tests
k6 run load-tests/gameplay.js

# Avec plus de VUs (Virtual Users)
k6 run --vus 500 --duration 10m load-tests/gameplay.js

# Export vers Cloud
k6 cloud load-tests/gameplay.js
```

---

## Bug Report Template

```markdown
## 🐛 Bug Report

### Titre
[Bref résumé du bug]

### Sévérité
- [ ] Critical - Crash/Security
- [ ] High - Feature broken
- [ ] Medium - Workaround exists
- [ ] Low - Cosmetic

### Environnement
- **Version**: v0.1.0
- **Navigateur**: Chrome 120
- **OS**: Windows 11
- **Serveur**: Staging

### Reproduction Steps
1. Aller à '...'
2. Cliquer sur '...'
3. Scroller jusqu'à '...'
4. Voir l'erreur

### Comportement Attendu
[Décrire ce qui devrait se passer]

### Comportement Actuel
[Décrire ce qui se passe]

### Screenshots/Videos
[Joindre captures d'écran]

### Logs
```
[Coller les logs console/réseau]
```

### Notes Additionnelles
[Tout autre contexte]
```

---

## Checklist de Release

### Avant chaque release :

- [ ] Tous les tests passent (CI verte)
- [ ] Couverture de code > 80%
- [ ] Tests E2E passent sur Chrome + Firefox
- [ ] Tests de charge OK (< 200ms latence p95)
- [ ] Pas de régressions (comparer avec version précédente)
- [ ] Documentation à jour
- [ ] Changelog mis à jour
- [ ] Bug tracker vide (ou bugs reportés comme "known issues")

### Tests Exploratoires

- [ ] Parcours complet nouvel utilisateur
- [ ] Parcours utilisateur existant
- [ ] Multi-joueur (2, 5, 10+ joueurs)
- [ ] Reconnexion réseau
- [ ] Navigation rapide entre scènes
- [ ] Utilisation prolongée (1h+)
- [ ] Différentes résolutions d'écran
- [ ] Mobile (si applicable)

---

## Communication avec les Autres Agents

### Avec tous les Agents
- **Tu donnes** : Rapports de bugs détaillés
- **Tu reçois** : Fixes à tester
- **Discussion** : Reproduction et validation

### Avec Agent DevOps (Infra)
- **Tu donnes** : Besoins en environnements de test
- **Tu reçois** : Accès aux environnements
- **Discussion** : Monitoring et alerting

---

*"Un bon test, c'est comme une bonne pizza : bien couvert, bien cuit, et qui révèle tous les défauts !"* 🍕🧪