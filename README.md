# 🎮 MechaPizzAI MMORPG

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Phaser](https://img.shields.io/badge/Phaser-3.60-00D4FF?style=for-the-badge)](https://phaser.io/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)

> **Un MMORPG pixel art à l'ancienne pour la communauté MechaPizzAI**  
> 🍕 Agents IA • 🤖 Automatisation • 🎮 Aventure multijoueur

---

## 🌟 Concept

Bienvenue dans l'univers **MechaPizzAI**, où la technologie rencontre la pizza ! Incarne un Agent IA dans une mégalopole cyberpunk, automatise des tâches, livre des pizzas intergalactiques et collabore avec la communauté pour devenir une légende.

### ✨ Features Clés

- 🎨 **Pixel Art Rétro** - Style 16-bit inspiré des classiques SNES/PS1
- 🌐 **Multijoueur Temps Réel** - Jusqu'à 100+ joueurs simultanés
- 🤝 **Guildes & Collaboration** - Crée ton agence IA avec tes amis
- ⚡ **Mini-jeux d'Automatisation** - Programmation visuelle fun
- 💰 **Économie Dynamique** - Commerce, crafting et marché noir

---

## 🚀 Démarrage Rapide

### Prérequis

- [Node.js](https://nodejs.org/) 18+ 
- [npm](https://www.npmjs.com/) ou [pnpm](https://pnpm.io/)

### Installation

```bash
# Cloner le repo
git clone https://github.com/VanLyxe/mechapizzai-mmorpg.git
cd mechapizzai-mmorpg

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Le jeu sera accessible sur `http://localhost:3000`

---

## 🏗️ Architecture

```
📦 mechapizzai-mmorpg/
├── 📁 apps/
│   ├── 📁 client/          # Client Phaser 3 (TypeScript)
│   ├── 📁 server/          # Serveur Node.js + Socket.io
│   └── 📁 admin/           # Panel d'administration
├── 📁 packages/
│   ├── 📁 shared/          # Types & utilitaires communs
│   ├── 📁 ui-kit/          # Composants UI réutilisables
│   └── 📁 assets/          # Sprites, sons, musiques
├── 📁 docs/                # Documentation
└── 📁 infrastructure/      # Docker, CI/CD
```

---

## 🤖 L'Équipe des MechaAgents

| Agent | Rôle | Spécialité |
|-------|------|------------|
| 🎨 **Agent Pixel** | Lead Artist | UI/UX, Sprites, Animations |
| ⚡ **Agent Socket** | Backend Lead | Temps réel, Networking |
| 🎮 **Agent Phaser** | Game Engine | Gameplay, Moteur de jeu |
| 🗄️ **Agent Data** | Database | Systèmes, Économie |
| 🔧 **Agent DevOps** | Infrastructure | Déploiement, CI/CD |
| 🧪 **Agent QA** | Testing | Qualité, Tests automatisés |

---

## 🎨 Design System

Le jeu utilise le design system de [MechaHelp](https://www.mechahelp-ai.com) :

```css
--primary-cyan: #00D4FF;      /* Actions principales */
--primary-orange: #FF6B35;    /* Accents & CTA */
--bg-dark: #0A0E1A;           /* Fond principal */
--bg-card: #111827;           /* Cartes & panneaux */
```

📖 [Voir le Design System complet](./docs/design-system/README.md)

---

## 📋 Roadmap

### Phase 1 : MVP - "Pizza Rush" 🍕
- [x] Setup projet & architecture
- [ ] Déplacement multijoueur basique
- [ ] Chat temps réel
- [ ] Système de quêtes simples

### Phase 2 : Communauté - "Agency Wars" 🏢
- [ ] Système de guildes
- [ ] Quêtes collaboratives
- [ ] Mini-jeux d'automatisation

### Phase 3 : Économie - "Cyber Market" 💰
- [ ] Marketplace complet
- [ ] Crafting de bots
- [ ] Système de rareté

### Phase 4 : Création - "Creator Mode" 🛠️
- [ ] Éditeur de quêtes
- [ ] Outils communautaires
- [ ] API pour développeurs

---

## 🤝 Contribuer

Tu veux rejoindre l'aventure ? Rejoins la communauté [MechaPizzAI sur Skool](https://www.skool.com/mechapizzai) !

1. Fork le projet
2. Crée une branche (`git checkout -b feature/AmazingFeature`)
3. Commit tes changements (`git commit -m 'Add some AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvre une Pull Request

---

## 📜 License

Distribué sous licence MIT. Voir [LICENSE](./LICENSE) pour plus d'informations.

---

<p align="center">
  🍕 Fait avec amour par et pour la communauté <strong>MechaPizzAI</strong> 🤖
</p>
