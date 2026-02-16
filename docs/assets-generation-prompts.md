# 🎨 Assets Generation Prompts - MechaPizzAI MMORPG
## Style: Final Fantasy VI × Cyberpunk

> **Agent:** Agent Pixel 🎨  
> **Mission:** Générer tous les assets visuels pour la refonte FF6 × Cyberpunk  
> **API:** NanoBanana Pro (Kie.ai)  
> **Format:** Optimisé pour Phaser 3

---

## 📋 Paramètres NanoBanana Pro Communs

### Configuration de Base
```json
{
  "model": "nano-banana-pro",
  "input": {
    "prompt": "...",
    "aspect_ratio": "...",
    "resolution": "2K",
    "output_format": "png"
  }
}
```

### Ratios d'Aspect Recommandés
| Type d'Asset | Ratio | Dimensions |
|--------------|-------|------------|
| Spritesheets | `1:1` | 512×512, 1024×1024 |
| Tilesets | `16:9` | 1024×576, 2048×1152 |
| UI Elements | `16:9` | 1920×1080 |
| Particules | `1:1` | 512×512 |
| Items | `1:1` | 256×256 |
| Logo | `1:1` | 1024×1024 |

### Style Keywords (à inclure dans tous les prompts)
```
Style: "Pixel art 16-bit, Final Fantasy VI style, SNES graphics quality, 
detailed pixel art, limited color palette, RPG game assets, 
transparent background, game-ready"
```

---

## 1. 🎭 SPRITES PERSONNAGES (4 Classes)

### 1.1 Chevalier Pizza (Tank)
**Description:** Guerrier en armure médiévale fusionnée avec technologie cyberpunk

#### Spritesheet Complet (512×512)
```json
{
  "prompt": "Complete pixel art character spritesheet 512x512, Chevalier Pizza tank class, 
medieval knight armor fused with cyberpunk technology, metallic silver armor with cyan neon accents #00FFFF, 
LED glowing lines on breastplate and helmet, pizza-themed shoulder pads with pepperoni details, 
flowing dark blue cape with circuit patterns, 8-directional character (up, down, left, right, diagonals), 
8 frames per direction, 4 animations: IDLE (breathing, cape fluttering), WALK (heavy armored steps), 
ATTACK (sword slash with cyan energy trail), SKILL (shield bash with force field effect), 
Final Fantasy VI sprite style, SNES 16-bit quality, detailed pixel art, limited 32-color palette, 
black background, RPG Maker compatible, game asset",
  "aspect_ratio": "1:1",
  "resolution": "2K",
  "output_format": "png"
}
```

**Notes Phaser:**
- Frame size: 64×64 pixels
- Total frames: 256 (8 directions × 8 frames × 4 animations)
- Animation config: 12 FPS
- Pivot: center-bottom

---

### 1.2 Mage Tomate (Mage)
**Description:** Magicien avec robe traditionnelle et implants cybernétiques

#### Spritesheet Complet (512×512)
```json
{
  "prompt": "Complete pixel art character spritesheet 512x512, Mage Tomate spellcaster class, 
flowing crimson red mage robe with pink neon trim #FF1493, cybernetic implants on face and arms, 
holographic spell circles floating around hands, floating slightly above ground, 
8-directional character (up, down, left, right, diagonals), 8 frames per direction, 
4 animations: IDLE (levitating, magical particles orbiting), WALK (gliding smoothly), 
CAST (conjuring tomato magic with sauce splash effects), SKILL (meteor swarm with tomato explosions), 
Final Fantasy VI sprite style, SNES 16-bit quality, detailed pixel art, limited 32-color palette, 
black background, RPG Maker compatible, game asset",
  "aspect_ratio": "1:1",
  "resolution": "2K",
  "output_format": "png"
}
```

**Notes Phaser:**
- Frame size: 64×64 pixels
- Total frames: 256
- Animation config: 12 FPS
- Glow effect on cybernetic parts

---

### 1.3 Rôdeur Fromage (DPS)
**Description:** Assassin agile avec gadgets high-tech

#### Spritesheet Complet (512×512)
```json
{
  "prompt": "Complete pixel art character spritesheet 512x512, Rodeur Fromage rogue class, 
sleek leather armor in golden yellow #FFD700 with green neon accents #00FF00, 
cybernetic goggles with HUD display, utility belt with cheese-themed gadgets, 
short cape for quick movement, 8-directional character (up, down, left, right, diagonals), 
8 frames per direction, 4 animations: IDLE (scanning area, adjusting goggles), 
WALK (stealthy silent steps), ATTACK (throwing cheese shurikens with trails), 
SKILL (holographic camouflage cloak activation), Final Fantasy VI sprite style, 
SNES 16-bit quality, detailed pixel art, limited 32-color palette, black background, 
RPG Maker compatible, game asset",
  "aspect_ratio": "1:1",
  "resolution": "2K",
  "output_format": "png"
}
```

**Notes Phaser:**
- Frame size: 64×64 pixels
- Total frames: 256
- Animation config: 15 FPS (plus rapide)
- Opacity change pour skill camouflage

---

### 1.4 Ingénieur Pâte (Support)
**Description:** Artificier avec exosquelette et outils de construction

#### Spritesheet Complet (512×512)
```json
{
  "prompt": "Complete pixel art character spritesheet 512x512, Ingenieur Pate support class, 
white chef apron over mechanical exoskeleton, orange neon lights #FF6B35 on robotic limbs, 
holographic blueprint projector on wrist, tool belt with pizza construction tools, 
8-directional character (up, down, left, right, diagonals), 8 frames per direction, 
4 animations: IDLE (checking holographic interface), WALK (mechanical assisted gait), 
BUILD (deploying pizza turret with welding sparks), SKILL (healing pizza aura with rising steam), 
Final Fantasy VI sprite style, SNES 16-bit quality, detailed pixel art, limited 32-color palette, 
black background, RPG Maker compatible, game asset",
  "aspect_ratio": "1:1",
  "resolution": "2K",
  "output_format": "png"
}
```

**Notes Phaser:**
- Frame size: 64×64 pixels
- Total frames: 256
- Animation config: 12 FPS
- Particules pour effets de construction

---

## 2. 🗺️ TILESETS ENVIRONNEMENT

### 2.1 Tileset Sol Urbain Cyberpunk (2048×1152)
```json
{
  "prompt": "Pixel art tileset 2048x1152, cyberpunk medieval city ground tiles, 
32x32 pixel grid, FF6 style graphics, includes: cobblestone streets with neon cracks, 
metal plates with rivets, holographic pavement tiles, sewer grates with green glow, 
manhole covers with pizza symbols, crosswalks with LED strips, damaged asphalt with lava underneath, 
neon-lit sidewalk tiles, 64 different ground variations, consistent 16-bit palette, 
SNES quality, tileable seamless textures, game asset, transparent background on edges",
  "aspect_ratio": "16:9",
  "resolution": "2K",
  "output_format": "png"
}
```

**Notes Phaser:**
- Tile size: 32×32
- Total tiles: 2048 tiles (64×32 grid)
- Collision: tiles 1024-1080 (obstacles)
- Animated tiles: néon cracks (tiles 100-110)

---

### 2.2 Tileset Murs et Bâtiments (2048×1152)
```json
{
  "prompt": "Pixel art tileset 2048x1152, cyberpunk medieval city walls and buildings, 
32x32 pixel grid, FF6 style graphics, includes: medieval stone walls with neon piping, 
cyberpunk building facades with holographic billboards, pizza restaurant storefronts with neon signs, 
steampunk chimneys with digital smoke, windows with glowing interiors, doorways with energy shields, 
rooftops with antenna arrays, wall decorations (posters, lanterns, cables), 
64 wall variations, 32 window types, 16 door styles, consistent 16-bit palette, 
SNES quality, game asset",
  "aspect_ratio": "16:9",
  "resolution": "2K",
  "output_format": "png"
}
```

**Notes Phaser:**
- Tile size: 32×32
- Layer: above ground layer
- Depth sorting enabled

---

### 2.3 Tileset Intérieur Pizzeria (1024×1024)
```json
{
  "prompt": "Pixel art tileset 1024x1024, medieval tavern fused with futuristic pizzeria interior, 
32x32 pixel grid, FF6 style graphics, includes: wooden floorboards with LED strips, 
stone tile kitchen floors, medieval stone walls with digital menu screens, 
wooden tables with holographic menus, bar counter with neon underlighting, 
brick ovens with digital temperature displays, pizza preparation stations with robotic arms, 
hanging cured meats with data tags, medieval chandeliers with electric bulbs, 
32 floor variations, 32 wall types, 16 furniture sets, consistent 16-bit palette, 
SNES quality, game asset",
  "aspect_ratio": "1:1",
  "resolution": "2K",
  "output_format": "png"
}
```

---

### 2.4 Tileset Donjon Four Ancien (1024×1024)
```json
{
  "prompt": "Pixel art tileset 1024x1024, ancient oven dungeon interior, 
32x32 pixel grid, FF6 style graphics, includes: volcanic rock floors with lava cracks, 
metal grating platforms, ancient brick walls with heat damage, industrial machinery with steam vents, 
glowing forge fires, molten metal pools, ancient pizza ovens as dungeon rooms, 
mechanical traps (spikes, flames), ancient runes with orange glow, 
32 floor variations, 32 wall types, 16 hazard types, consistent 16-bit palette with reds and oranges, 
SNES quality, game asset",
  "aspect_ratio": "1:1",
  "resolution": "2K",
  "output_format": "png"
}
```

---

### 2.5 Tileset Donjon Frigo Infini (1024×1024)
```json
{
  "prompt": "Pixel art tileset 1024x1024, infinite refrigerator dungeon, 
32x32 pixel grid, FF6 style graphics, includes: icy metal floors with frost patterns, 
frozen conveyor belts, frosted glass walls with blue neon backlighting, 
server racks covered in ice, cryogenic chambers, ice stalactites with LED tips, 
frozen pizza boxes as loot containers, frost breath particle emitters, 
32 floor variations, 32 wall types, 16 ice formations, consistent 16-bit palette with blues and cyans, 
SNES quality, game asset",
  "aspect_ratio": "1:1",
  "resolution": "2K",
  "output_format": "png"
}
```

---

## 3. 🎮 UI ET HUD

### 3.1 Barres de PV/MP Style FF6 (1024×256)
```json
{
  "prompt": "Pixel art UI elements spritesheet 1024x256, Final Fantasy VI style health and mana bars, 
includes: long HP bar with gradient from green to red, MP bar with blue gradient, 
XP bar with golden gradient, bar frames with decorative borders, 
character portrait frames 64x64 with ornate borders, status icons (poison, buff, debuff), 
FF6 menu aesthetic, cyberpunk neon accents cyan #00FFFF, 
16-bit pixel art, SNES quality, transparent background, game UI asset",
  "aspect_ratio": "4:1",
  "resolution": "2K",
  "output_format": "png"
}
```

**Notes Phaser:**
- 9-slice scaling pour barres extensibles
- Frame size: 32×32 pour icônes
- Support pour animation de dégâts (flash rouge)

---

### 3.2 Boutons Menu avec Bordure Néon (512×512)
```json
{
  "prompt": "Pixel art UI button spritesheet 512x512, cyberpunk medieval menu buttons, 
includes: rectangular buttons with double border, cyan neon glow effect #00FFFF, 
orange accent variant #FF6B35, disabled state grayed out, hover state with brighter glow, 
pressed state with inset shadow, 9-slice design for scaling, 
button sizes: 256x64, 128x32, 64x32, decorative corner ornaments, 
FF6 menu style meets cyberpunk, 16-bit pixel art, SNES quality, 
transparent background, game UI asset",
  "aspect_ratio": "1:1",
  "resolution": "2K",
  "output_format": "png"
}
```

---

### 3.3 Inventaire Grille 16-bit (1024×1024)
```json
{
  "prompt": "Pixel art inventory UI 1024x1024, Final Fantasy VI style grid inventory, 
includes: 8x8 equipment slots grid with decorative borders, item slot backgrounds, 
selected item highlight with golden border, empty slot placeholder, 
item rarity borders (common gray, rare blue, epic purple, legendary gold), 
inventory background panel with ornate corners, scroll bar with cyberpunk styling, 
equipment comparison panel, item tooltip background, 
FF6 aesthetic with cyberpunk neon accents, 16-bit pixel art, SNES quality, 
transparent background, game UI asset",
  "aspect_ratio": "1:1",
  "resolution": "2K",
  "output_format": "png"
}
```

---

### 3.4 Minimap Radar Cyberpunk (512×512)
```json
{
  "prompt": "Pixel art minimap UI 512x512, cyberpunk radar-style minimap, 
includes: circular radar frame with cyan neon border #00FFFF, 
radar sweep animation frame, player position indicator (arrow), 
enemy blips (red dots), ally blips (green dots), NPC blips (yellow dots), 
quest marker icons, fog of war overlay, grid lines for coordinates, 
compass directions NESW, zoom level indicators, 
FF6 meets cyberpunk aesthetic, 16-bit pixel art, SNES quality, 
transparent background, game UI asset",
  "aspect_ratio": "1:1",
  "resolution": "2K",
  "output_format": "png"
}
```

---

### 3.5 Police Pixel Art et Textes (1024×512)
```json
{
  "prompt": "Pixel art bitmap font spritesheet 1024x512, FF6 style pixel font, 
includes: complete ASCII set 32-126, uppercase and lowercase letters, 
numbers 0-9, punctuation marks, special characters (accents), 
3 font sizes: 8x8, 16x16, 24x24 pixels per character, 
3 color variants: white, cyan neon #00FFFF, gold #FFD700, 
shadow/outline variants for readability, 
monospace grid layout, 16-bit pixel art style, SNES quality, 
black background, game UI asset",
  "aspect_ratio": "2:1",
  "resolution": "2K",
  "output_format": "png"
}
```

---

## 4. ✨ EFFETS ET PARTICULES

### 4.1 Particules Magie - Feu (512×512)
```json
{
  "prompt": "Pixel art magic particle effects spritesheet 512x512, fire magic spell effects, 
includes: fireball projectile 8 frames animation, fire explosion 8 frames, 
fire trail particles, ember sparks, flame aura around character 8 frames, 
meteor falling animation, lava splash, fire shield effect, 
FF6 style spell effects, warm orange and red palette, 
16-bit pixel art, SNES quality, additive blend mode ready, 
transparent background, game VFX asset",
  "aspect_ratio": "1:1",
  "resolution": "2K",
  "output_format": "png"
}
```

---

### 4.2 Particules Magie - Glace (512×512)
```json
{
  "prompt": "Pixel art magic particle effects spritesheet 512x512, ice magic spell effects, 
includes: ice shard projectile 8 frames, ice explosion crystal formation 8 frames, 
blizzard swirl effect, frost trail, ice shield barrier, 
snowflake particles, frozen status effect on character, icicle drop animation, 
FF6 style spell effects, cool blue and cyan palette #87CEEB #00FFFF, 
16-bit pixel art, SNES quality, additive blend mode ready, 
transparent background, game VFX asset",
  "aspect_ratio": "1:1",
  "resolution": "2K",
  "output_format": "png"
}
```

---

### 4.3 Particules Soin et Buffs (512×512)
```json
{
  "prompt": "Pixel art healing particle effects spritesheet 512x512, healing and buff spell effects, 
includes: healing cross rising animation 8 frames, green plus symbols floating up, 
golden light aura expanding, HP recovery numbers effect, 
shield buff bubble formation, regeneration particles, 
cleansing effect (removing debuffs), resurrection light beam, 
FF6 style spell effects, green and gold palette #228B22 #FFD700, 
16-bit pixel art, SNES quality, additive blend mode ready, 
transparent background, game VFX asset",
  "aspect_ratio": "1:1",
  "resolution": "2K",
  "output_format": "png"
}
```

---

### 4.4 Explosions et Impacts (512×512)
```json
{
  "prompt": "Pixel art explosion and impact effects spritesheet 512x512, combat impact effects, 
includes: sword slash impact 8 frames, explosion cloud 8 frames, 
screen shake effect indicator, critical hit star burst, 
block/parry spark effect, damage number popup background, 
stun stars circling head, knockback dust cloud, 
FF6 style combat effects, white and yellow impact colors, 
16-bit pixel art, SNES quality, additive blend mode ready, 
transparent background, game VFX asset",
  "aspect_ratio": "1:1",
  "resolution": "2K",
  "output_format": "png"
}
```

---

### 4.5 Aura de Personnage et Traînées (512×512)
```json
{
  "prompt": "Pixel art character aura and trail effects spritesheet 512x512, 
includes: cyan neon aura for knight class 8 frames loop, 
pink magical aura for mage class, green stealth aura for rogue, 
orange tech aura for engineer, dash movement trail effect, 
level up aura burst, teleportation dissolve effect, 
charging power aura intensifying, 
FF6 style aura effects, class-specific neon colors, 
16-bit pixel art, SNES quality, additive blend mode ready, 
transparent background, game VFX asset",
  "aspect_ratio": "1:1",
  "resolution": "2K",
  "output_format": "png"
}
```

---

## 5. 🗡️ ITEMS ET OBJETS

### 5.1 Armes - Épées et Bâtons (512×512)
```json
{
  "prompt": "Pixel art weapons spritesheet 512x512, medieval cyberpunk weapons, 
includes: pizza cutter sword with neon edge, tomato sauce blade with dripping effect, 
cheese grater shield, rolling pin staff with tech modifications, 
pepperoni throwing stars, garlic bread sword, 
4 tiers each: common (iron), rare (steel), epic (neon), legendary (golden), 
weapon icons 64x64 each, diagonal display angle, 
FF6 item style, detailed pixel art, 16-bit palette, 
transparent background, game item asset",
  "aspect_ratio": "1:1",
  "resolution": "2K",
  "output_format": "png"
}
```

---

### 5.2 Armures et Équipement (512×512)
```json
{
  "prompt": "Pixel art armor equipment spritesheet 512x512, medieval cyberpunk armor pieces, 
includes: knight helmet with HUD visor, mage hood with holographic trim, 
rogue mask with night vision goggles, engineer goggles with scanner, 
armor chest pieces (4 classes), gloves with tech enhancements, 
boots with rocket boosters, capes with circuit patterns, 
4 tiers each: common, rare, epic, legendary, 
64x64 icons, FF6 equipment style, detailed pixel art, 
16-bit palette, transparent background, game item asset",
  "aspect_ratio": "1:1",
  "resolution": "2K",
  "output_format": "png"
}
```

---

### 5.3 Potions et Consommables (256×512)
```json
{
  "prompt": "Pixel art consumable items spritesheet 256x512, potions and food items, 
includes: health potion (red tomato sauce bottle), mana potion (blue glowing liquid), 
stamina potion (green energy drink), antidote (clear vial), 
buff pizza slice (various toppings), energy drink can, 
bread roll ration, cheese wheel snack, 
32x32 icons, FF6 item style, vibrant colors, 
16-bit pixel art, transparent background, game item asset",
  "aspect_ratio": "1:2",
  "resolution": "2K",
  "output_format": "png"
}
```

---

### 5.4 Clés et Objets de Quête (256×512)
```json
{
  "prompt": "Pixel art quest items spritesheet 256x512, keys and quest objects, 
includes: ancient pizza oven key, digital access card, 
recipe scroll with holographic display, delivery order ticket, 
vip customer badge, secret ingredient vial, 
map fragment, mysterious cheese artifact, 
32x32 icons, FF6 key item style, golden and silver variants, 
16-bit pixel art, transparent background, game item asset",
  "aspect_ratio": "1:2",
  "resolution": "2K",
  "output_format": "png"
}
```

---

### 5.5 Pizza Magique (Buffs) (256×256)
```json
{
  "prompt": "Pixel art magical pizza items 256x256, enchanted pizza buff items, 
includes: healing margherita with golden glow, strength pepperoni with red aura, 
speed mushroom pizza with green trails, defense four-cheese with blue shield, 
magic seafood pizza with purple sparkles, legendary supreme with rainbow effect, 
64x64 icons each, floating animation frames, 
FF6 item style with magical effects, vibrant colors, 
16-bit pixel art, transparent background, game item asset",
  "aspect_ratio": "1:1",
  "resolution": "2K",
  "output_format": "png"
}
```

---

## 6. 🎯 LOGO ET TITRE

### 6.1 Logo MechaPizzAI (1024×1024)
```json
{
  "prompt": "Pixel art game logo 1024x1024, MechaPizzAI MMORPG title, 
Final Fantasy VI logo style meets cyberpunk, 
METAL text 'MECHA' in chrome silver with cyan neon outline #00FFFF, 
PIZZA text 'PIZZ' in warm orange #FF6B35 with cheese texture, 
AI text in digital cyan with circuit patterns, 
crossed pizza cutter sword and robotic arm behind text, 
neon glow effects, chrome bevel, medieval ornamental frame, 
16-bit pixel art style, SNES quality, transparent background, 
game logo asset, center composition",
  "aspect_ratio": "1:1",
  "resolution": "2K",
  "output_format": "png"
}
```

---

### 6.2 Écran Titre avec Animation (1920×1080)
```json
{
  "prompt": "Pixel art title screen background 1920x1080, animated title screen scene, 
cyberpunk medieval cityscape at night, neon signs in Japanese and pizza themes, 
flying delivery drones, towering pizza restaurant castle, 
hero characters silhouettes in foreground, dramatic lighting with cyan and orange neon, 
parallax layers ready: distant buildings, midground structures, foreground elements, 
FF6 opening cinematic style, atmospheric fog, rain effect, 
16-bit pixel art, SNES quality, game title screen asset",
  "aspect_ratio": "16:9",
  "resolution": "2K",
  "output_format": "png"
}
```

---

### 6.3 Icônes de Classe (512×128)
```json
{
  "prompt": "Pixel art class icons spritesheet 512x128, 4 RPG class icons, 
Knight Pizza: shield with pizza emblem and cyan glow, 
Mage Tomato: spell book with tomato and pink magic, 
Rogue Cheese: dagger with cheese wedge and green stealth, 
Engineer Dough: wrench with dough and orange tech, 
128x128 icons, circular frames with class color borders, 
FF6 job class icon style, detailed pixel art, 
16-bit palette, transparent background, game UI asset",
  "aspect_ratio": "4:1",
  "resolution": "2K",
  "output_format": "png"
}
```

---

## 📦 Organisation des Assets

### Structure de Dossiers Recommandée
```
packages/assets/
├── characters/
│   ├── knight-pizza-spritesheet.png
│   ├── mage-tomate-spritesheet.png
│   ├── rodeur-fromage-spritesheet.png
│   └── ingenieur-pate-spritesheet.png
├── tilesets/
│   ├── urban-ground.png
│   ├── urban-walls.png
│   ├── interior-pizzeria.png
│   ├── dungeon-oven.png
│   └── dungeon-fridge.png
├── ui/
│   ├── bars-hp-mp.png
│   ├── buttons-menu.png
│   ├── inventory-grid.png
│   ├── minimap-radar.png
│   └── font-bitmap.png
├── effects/
│   ├── particles-fire.png
│   ├── particles-ice.png
│   ├── particles-heal.png
│   ├── impacts-explosions.png
│   └── auras-trails.png
├── items/
│   ├── weapons.png
│   ├── armors.png
│   ├── consumables.png
│   ├── quest-items.png
│   └── pizza-buffs.png
└── logo/
    ├── logo-mechapizzai.png
    ├── title-screen.png
    └── class-icons.png
```

---

## 🎮 Intégration Phaser 3

### Exemple de Chargement
```typescript
// PreloadScene.ts
preload() {
  // Characters
  this.load.spritesheet('knight', 'assets/characters/knight-pizza-spritesheet.png', {
    frameWidth: 64,
    frameHeight: 64
  });
  
  // Tilesets
  this.load.image('urban-ground', 'assets/tilesets/urban-ground.png');
  
  // UI
  this.load.image('hp-bar', 'assets/ui/bars-hp-mp.png');
  
  // Effects
  this.load.spritesheet('fire-spell', 'assets/effects/particles-fire.png', {
    frameWidth: 64,
    frameHeight: 64
  });
}
```

### Exemple d'Animation
```typescript
// Création des animations
this.anims.create({
  key: 'knight-walk-down',
  frames: this.anims.generateFrameNumbers('knight', { 
    start: 0, 
    end: 7 
  }),
  frameRate: 12,
  repeat: -1
});
```

---

## 📋 Checklist de Génération

### Avant de générer:
- [ ] Vérifier le quota API NanoBanana
- [ ] S'assurer que les prompts sont optimisés
- [ ] Préparer le dossier de destination

### Après génération:
- [ ] Vérifier la qualité de chaque asset
- [ ] Optimiser avec Aseprite si nécessaire
- [ ] Créer les metadata JSON pour les animations
- [ ] Tester l'intégration dans Phaser
- [ ] Documenter les modifications

---

*Document généré par Agent Pixel 🎨*  
*Date: 2026-02-16*  
*Version: 1.0*