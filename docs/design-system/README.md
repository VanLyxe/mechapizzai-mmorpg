# 🎨 MechaPizzAI Design System

> Design system basé sur l'identité visuelle de [MechaHelp](https://www.mechahelp-ai.com)

---

## 🎯 Philosophie

Le design de MechaPizzAI mélange :
- **Cyberpunk futuriste** - Néons, technologie, IA
- **Chaleur humaine** - Pizza, communauté, fun
- **Rétro gaming** - Pixel art, nostalgie 16-bit

---

## 🎨 Palette de Couleurs

### Couleurs Principales

| Nom | Hex | Usage |
|-----|-----|-------|
| **Cyan Néon** | `#00D4FF` | Actions principales, liens, accents |
| **Orange Chaud** | `#FF6B35` | Boutons CTA, badges importants, pizza |
| **Vert Succès** | `#10B981` | Validation, succès, gains |
| **Rouge Erreur** | `#EF4444` | Erreurs, danger, pertes |
| **Jaune Attention** | `#F59E0B` | Avertissements, notifications |

### Couleurs de Fond

| Nom | Hex | Usage |
|-----|-----|-------|
| **Nuit Profonde** | `#0A0E1A` | Fond principal du jeu |
| **Gris Bleu** | `#111827` | Cartes, panneaux, modales |
| **Gris Moyen** | `#1F2937` | Éléments secondaires |
| **Gris Clair** | `#374151` | Bordures, séparateurs |

### Couleurs de Texte

| Nom | Hex | Usage |
|-----|-----|-------|
| **Blanc** | `#FFFFFF` | Titres, texte principal |
| **Gris Clair** | `#9CA3AF` | Descriptions, texte secondaire |
| **Gris Moyen** | `#6B7280` | Texte désactivé, hints |

### Effets & Glows

```css
/* Glow Cyan */
--glow-cyan: 0 0 20px rgba(0, 212, 255, 0.5);
--glow-cyan-strong: 0 0 40px rgba(0, 212, 255, 0.8);

/* Glow Orange */
--glow-orange: 0 0 20px rgba(255, 107, 53, 0.5);
--glow-orange-strong: 0 0 40px rgba(255, 107, 53, 0.8);

/* Bordures lumineuses */
--border-glow-cyan: 1px solid rgba(0, 212, 255, 0.3);
--border-glow-orange: 1px solid rgba(255, 107, 53, 0.3);
```

---

## 🔤 Typographie

### Police Principale

```css
/* Pour les titres et UI */
font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
```

### Police Pixel (pour le jeu)

```css
/* Pour les éléments in-game */
font-family: 'Press Start 2P', 'VT323', monospace;
```

### Hiérarchie

| Élément | Taille | Poids | Usage |
|---------|--------|-------|-------|
| **H1** | 48px | 800 | Titres de page |
| **H2** | 36px | 700 | Sections |
| **H3** | 24px | 600 | Sous-sections |
| **H4** | 18px | 600 | Cartes, panneaux |
| **Body** | 16px | 400 | Texte courant |
| **Small** | 14px | 400 | Légendes, hints |
| **Caption** | 12px | 500 | Tags, badges |

---

## 🧩 Composants UI

### Boutons

#### Bouton Primaire (Cyan)
```css
.btn-primary {
  background: linear-gradient(135deg, #00D4FF 0%, #0099CC 100%);
  color: #0A0E1A;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  box-shadow: 0 0 30px rgba(0, 212, 255, 0.6);
  transform: translateY(-2px);
}
```

#### Bouton Secondaire (Orange)
```css
.btn-secondary {
  background: linear-gradient(135deg, #FF6B35 0%, #CC5529 100%);
  color: #FFFFFF;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  box-shadow: 0 0 20px rgba(255, 107, 53, 0.3);
}
```

#### Bouton Outline
```css
.btn-outline {
  background: transparent;
  color: #00D4FF;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  border: 2px solid #00D4FF;
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.2);
}

.btn-outline:hover {
  background: rgba(0, 212, 255, 0.1);
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
}
```

### Cartes

```css
.card {
  background: #111827;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(0, 212, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.card:hover {
  border-color: rgba(0, 212, 255, 0.4);
  box-shadow: 0 0 30px rgba(0, 212, 255, 0.1);
}
```

### Badges/Tags

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.badge-cyan {
  background: rgba(0, 212, 255, 0.2);
  color: #00D4FF;
  border: 1px solid rgba(0, 212, 255, 0.3);
}

.badge-orange {
  background: rgba(255, 107, 53, 0.2);
  color: #FF6B35;
  border: 1px solid rgba(255, 107, 53, 0.3);
}
```

### Inputs

```css
.input {
  background: #0A0E1A;
  border: 2px solid #374151;
  border-radius: 8px;
  padding: 12px 16px;
  color: #FFFFFF;
  font-size: 16px;
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: #00D4FF;
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.3);
}

.input::placeholder {
  color: #6B7280;
}
```

### Barres de Progression

```css
.progress-bar {
  background: #1F2937;
  border-radius: 10px;
  height: 8px;
  overflow: hidden;
}

.progress-fill {
  background: linear-gradient(90deg, #00D4FF, #0099CC);
  height: 100%;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}
```

---

## 🎮 Éléments de Jeu

### HUD (Heads-Up Display)

```css
.hud-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.hud-panel {
  background: rgba(17, 24, 39, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
  pointer-events: auto;
}
```

### Chat In-Game

```css
.chat-container {
  background: rgba(10, 14, 26, 0.95);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
}

.chat-message {
  padding: 8px 12px;
  border-bottom: 1px solid rgba(55, 65, 81, 0.5);
}

.chat-username {
  color: #00D4FF;
  font-weight: 600;
}

.chat-text {
  color: #FFFFFF;
}
```

### Minimap

```css
.minimap {
  width: 200px;
  height: 200px;
  background: rgba(17, 24, 39, 0.9);
  border: 2px solid rgba(0, 212, 255, 0.3);
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
}
```

---

## ✨ Animations

### Transitions Standard

```css
/* Hover rapide */
--transition-fast: 0.15s ease;

/* Hover standard */
--transition-normal: 0.2s ease;

/* Animations complexes */
--transition-slow: 0.3s ease;
```

### Keyframes

```css
/* Pulse glow */
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(0, 212, 255, 0.3); }
  50% { box-shadow: 0 0 40px rgba(0, 212, 255, 0.6); }
}

/* Slide in */
@keyframes slide-in {
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* Fade in */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Bounce */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

---

## 📐 Espacement

### Échelle de Spacing

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

### Rayons de Bordure

```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;
```

---

## 🖼️ Assets Visuels

### Sprites Requis

#### Personnages
- `player_idle.png` - Animation idle (32x32px, 4 frames)
- `player_walk.png` - Animation marche (32x32px, 4 frames)
- `player_run.png` - Animation course (32x32px, 4 frames)

#### UI
- `button_cyan.png` - Bouton cyan (9-slice)
- `button_orange.png` - Bouton orange (9-slice)
- `panel_dark.png` - Panneau fond sombre (9-slice)
- `icon_pizza.png` - Icône pizza (16x16px)
- `icon_agent.png` - Icône agent/robot (16x16px)

#### Environnement
- `tileset_city.png` - Tileset ville cyberpunk
- `tileset_interior.png` - Tileset intérieurs
- `objects.png` - Objets interactifs

### Tailles Standards

| Type | Taille | Usage |
|------|--------|-------|
| **Tile** | 32x32px | Tuiles de map |
| **Player** | 32x48px | Personnage joueur |
| **NPC** | 32x48px | Personnages PNJ |
| **Icon** | 16x16px | Icônes d'inventaire |
| **Icon Large** | 32x32px | Icônes de compétences |

---

## 🔊 Audio

### Palette Sonore

- **UI** : Bips électroniques courts, style rétro
- **Actions** : Sons de confirmation (succès), erreur (échec)
- **Ambiance** : Musique synthwave, tempo 100-120 BPM
- **Effets** : Sons 8-bit pour actions de jeu

---

## 📱 Responsive

### Breakpoints

```css
/* Mobile */
@media (max-width: 640px) { }

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) { }

/* Desktop */
@media (min-width: 1025px) { }

/* Large Desktop */
@media (min-width: 1440px) { }
```

---

## 🎯 Accessibilité

- Contraste minimum 4.5:1 pour le texte
- Focus visible sur tous les éléments interactifs
- Support clavier complet
- Réduction des animations si demandé (`prefers-reduced-motion`)

---

## 📚 Ressources

- [Google Fonts - Inter](https://fonts.google.com/specimen/Inter)
- [Google Fonts - Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [MechaHelp Website](https://www.mechahelp-ai.com) - Référence visuelle

---

*Dernière mise à jour : 16 Février 2026*  
*Par : Agent Pixel 🎨*