#!/usr/bin/env node

/**
 * Script de génération d'assets avec NanoBanana Pro API
 * Agent Pixel + DevOps - MechaPizzAI MMORPG
 * 
 * Ce script :
 * 1. Lit les prompts depuis docs/assets-generation-prompts.md
 * 2. Appelle l'API NanoBanana Pro pour chaque asset
 * 3. Télécharge les images générées
 * 4. Les place dans apps/client/public/assets/
 * 5. Crée des fichiers JSON de metadata
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const API_URL = 'https://api.kie.ai';
const API_KEY = process.env.GEMINI_API_KEY || '9f0fb9a92aba158161bd6b3b67bea08d';
const OUTPUT_DIR = path.join(__dirname, '..', 'apps', 'client', 'public', 'assets');
const PROMPTS_FILE = path.join(__dirname, '..', 'docs', 'assets-generation-prompts.md');

// Définition des assets à générer avec leurs prompts
const ASSETS_TO_GENERATE = [
    // ====================
    // PRIORITÉ 1 : Sprites Personnages (4 classes)
    // ====================
    {
        id: 'player-knight',
        category: 'characters',
        filename: 'player-knight.png',
        prompt: `Complete pixel art character spritesheet 512x512, Chevalier Pizza tank class, 
medieval knight armor fused with cyberpunk technology, metallic silver armor with cyan neon accents #00FFFF, 
LED glowing lines on breastplate and helmet, pizza-themed shoulder pads with pepperoni details, 
flowing dark blue cape with circuit patterns, 8-directional character (up, down, left, right, diagonals), 
8 frames per direction, 4 animations: IDLE (breathing, cape fluttering), WALK (heavy armored steps), 
ATTACK (sword slash with cyan energy trail), SKILL (shield bash with force field effect), 
Final Fantasy VI sprite style, SNES 16-bit quality, detailed pixel art, limited 32-color palette, 
black background, RPG Maker compatible, game asset`,
        aspect_ratio: '1:1',
        resolution: '2K',
        output_format: 'png',
        frameWidth: 64,
        frameHeight: 64,
        priority: 1
    },
    {
        id: 'player-mage',
        category: 'characters',
        filename: 'player-mage.png',
        prompt: `Complete pixel art character spritesheet 512x512, Mage Tomate spellcaster class, 
flowing crimson red mage robe with pink neon trim #FF1493, cybernetic implants on face and arms, 
holographic spell circles floating around hands, floating slightly above ground, 
8-directional character (up, down, left, right, diagonals), 8 frames per direction, 
4 animations: IDLE (levitating, magical particles orbiting), WALK (gliding smoothly), 
CAST (conjuring tomato magic with sauce splash effects), SKILL (meteor swarm with tomato explosions), 
Final Fantasy VI sprite style, SNES 16-bit quality, detailed pixel art, limited 32-color palette, 
black background, RPG Maker compatible, game asset`,
        aspect_ratio: '1:1',
        resolution: '2K',
        output_format: 'png',
        frameWidth: 64,
        frameHeight: 64,
        priority: 1
    },
    {
        id: 'player-rogue',
        category: 'characters',
        filename: 'player-rogue.png',
        prompt: `Complete pixel art character spritesheet 512x512, Rodeur Fromage rogue class, 
sleek leather armor in golden yellow #FFD700 with green neon accents #00FF00, 
cybernetic goggles with HUD display, utility belt with cheese-themed gadgets, 
short cape for quick movement, 8-directional character (up, down, left, right, diagonals), 
8 frames per direction, 4 animations: IDLE (scanning area, adjusting goggles), 
WALK (stealthy silent steps), ATTACK (throwing cheese shurikens with trails), 
SKILL (holographic camouflage cloak activation), Final Fantasy VI sprite style, 
SNES 16-bit quality, detailed pixel art, limited 32-color palette, black background, 
RPG Maker compatible, game asset`,
        aspect_ratio: '1:1',
        resolution: '2K',
        output_format: 'png',
        frameWidth: 64,
        frameHeight: 64,
        priority: 1
    },
    {
        id: 'player-engineer',
        category: 'characters',
        filename: 'player-engineer.png',
        prompt: `Complete pixel art character spritesheet 512x512, Ingenieur Pate support class, 
white chef apron over mechanical exoskeleton, orange neon lights #FF6B35 on robotic limbs, 
holographic blueprint projector on wrist, tool belt with pizza construction tools, 
8-directional character (up, down, left, right, diagonals), 8 frames per direction, 
4 animations: IDLE (checking holographic interface), WALK (mechanical assisted gait), 
BUILD (deploying pizza turret with welding sparks), SKILL (healing pizza aura with rising steam), 
Final Fantasy VI sprite style, SNES 16-bit quality, detailed pixel art, limited 32-color palette, 
black background, RPG Maker compatible, game asset`,
        aspect_ratio: '1:1',
        resolution: '2K',
        output_format: 'png',
        frameWidth: 64,
        frameHeight: 64,
        priority: 1
    },

    // ====================
    // PRIORITÉ 2 : Tilesets Environnement (5)
    // ====================
    {
        id: 'tileset-urban-ground',
        category: 'tilesets',
        filename: 'tileset-urban-ground.png',
        prompt: `Pixel art tileset 2048x1152, cyberpunk medieval city ground tiles, 
32x32 pixel grid, FF6 style graphics, includes: cobblestone streets with neon cracks, 
metal plates with rivets, holographic pavement tiles, sewer grates with green glow, 
manhole covers with pizza symbols, crosswalks with LED strips, damaged asphalt with lava underneath, 
neon-lit sidewalk tiles, 64 different ground variations, consistent 16-bit palette, 
SNES quality, tileable seamless textures, game asset, transparent background on edges`,
        aspect_ratio: '16:9',
        resolution: '2K',
        output_format: 'png',
        tileWidth: 32,
        tileHeight: 32,
        priority: 2
    },
    {
        id: 'tileset-urban-walls',
        category: 'tilesets',
        filename: 'tileset-urban-walls.png',
        prompt: `Pixel art tileset 2048x1152, cyberpunk medieval city walls and buildings, 
32x32 pixel grid, FF6 style graphics, includes: medieval stone walls with neon piping, 
cyberpunk building facades with holographic billboards, pizza restaurant storefronts with neon signs, 
steampunk chimneys with digital smoke, windows with glowing interiors, doorways with energy shields, 
rooftops with antenna arrays, wall decorations (posters, lanterns, cables), 
64 wall variations, 32 window types, 16 door styles, consistent 16-bit palette, 
SNES quality, game asset`,
        aspect_ratio: '16:9',
        resolution: '2K',
        output_format: 'png',
        tileWidth: 32,
        tileHeight: 32,
        priority: 2
    },
    {
        id: 'tileset-interior',
        category: 'tilesets',
        filename: 'tileset-interior.png',
        prompt: `Pixel art tileset 1024x1024, medieval tavern fused with futuristic pizzeria interior, 
32x32 pixel grid, FF6 style graphics, includes: wooden floorboards with LED strips, 
stone tile kitchen floors, medieval stone walls with digital menu screens, 
wooden tables with holographic menus, bar counter with neon underlighting, 
brick ovens with digital temperature displays, pizza preparation stations with robotic arms, 
hanging cured meats with data tags, medieval chandeliers with electric bulbs, 
32 floor variations, 32 wall types, 16 furniture sets, consistent 16-bit palette, 
SNES quality, game asset`,
        aspect_ratio: '1:1',
        resolution: '2K',
        output_format: 'png',
        tileWidth: 32,
        tileHeight: 32,
        priority: 2
    },
    {
        id: 'tileset-dungeon-oven',
        category: 'tilesets',
        filename: 'tileset-dungeon-oven.png',
        prompt: `Pixel art tileset 1024x1024, ancient oven dungeon interior, 
32x32 pixel grid, FF6 style graphics, includes: volcanic rock floors with lava cracks, 
metal grating platforms, ancient brick walls with heat damage, industrial machinery with steam vents, 
glowing forge fires, molten metal pools, ancient pizza ovens as dungeon rooms, 
mechanical traps (spikes, flames), ancient runes with orange glow, 
32 floor variations, 32 wall types, 16 hazard types, consistent 16-bit palette with reds and oranges, 
SNES quality, game asset`,
        aspect_ratio: '1:1',
        resolution: '2K',
        output_format: 'png',
        tileWidth: 32,
        tileHeight: 32,
        priority: 2
    },
    {
        id: 'tileset-dungeon-fridge',
        category: 'tilesets',
        filename: 'tileset-dungeon-fridge.png',
        prompt: `Pixel art tileset 1024x1024, infinite refrigerator dungeon, 
32x32 pixel grid, FF6 style graphics, includes: icy metal floors with frost patterns, 
frozen conveyor belts, frosted glass walls with blue neon backlighting, 
server racks covered in ice, cryogenic chambers, ice stalactites with LED tips, 
frozen pizza boxes as loot containers, frost breath particle emitters, 
32 floor variations, 32 wall types, 16 ice formations, consistent 16-bit palette with blues and cyans, 
SNES quality, game asset`,
        aspect_ratio: '1:1',
        resolution: '2K',
        output_format: 'png',
        tileWidth: 32,
        tileHeight: 32,
        priority: 2
    },

    // ====================
    // PRIORITÉ 3 : UI/HUD (5)
    // ====================
    {
        id: 'ui-bars',
        category: 'ui',
        filename: 'ui-bars.png',
        prompt: `Pixel art UI elements spritesheet 1024x1024, Final Fantasy VI style health and mana bars,
  includes: long HP bar with gradient from green to red, MP bar with blue gradient,
  XP bar with golden gradient, bar frames with decorative borders,
  character portrait frames 64x64 with ornate borders, status icons (poison, buff, debuff),
  FF6 menu aesthetic, cyberpunk neon accents cyan #00FFFF,
  16-bit pixel art, SNES quality, transparent background, game UI asset`,
        aspect_ratio: '1:1',
        resolution: '2K',
        output_format: 'png',
        priority: 3
    },
    {
        id: 'ui-buttons',
        category: 'ui',
        filename: 'ui-buttons.png',
        prompt: `Pixel art UI button spritesheet 512x512, cyberpunk medieval menu buttons, 
includes: rectangular buttons with double border, cyan neon glow effect #00FFFF, 
orange accent variant #FF6B35, disabled state grayed out, hover state with brighter glow, 
pressed state with inset shadow, 9-slice design for scaling, 
button sizes: 256x64, 128x32, 64x32, decorative corner ornaments, 
FF6 menu style meets cyberpunk, 16-bit pixel art, SNES quality, 
transparent background, game UI asset`,
        aspect_ratio: '1:1',
        resolution: '2K',
        output_format: 'png',
        priority: 3
    },
    {
        id: 'ui-inventory',
        category: 'ui',
        filename: 'ui-inventory.png',
        prompt: `Pixel art inventory UI 1024x1024, Final Fantasy VI style grid inventory, 
includes: 8x8 equipment slots grid with decorative borders, item slot backgrounds, 
selected item highlight with golden border, empty slot placeholder, 
item rarity borders (common gray, rare blue, epic purple, legendary gold), 
inventory background panel with ornate corners, scroll bar with cyberpunk styling, 
equipment comparison panel, item tooltip background, 
FF6 aesthetic with cyberpunk neon accents, 16-bit pixel art, SNES quality, 
transparent background, game UI asset`,
        aspect_ratio: '1:1',
        resolution: '2K',
        output_format: 'png',
        priority: 3
    },
    {
        id: 'ui-minimap',
        category: 'ui',
        filename: 'ui-minimap.png',
        prompt: `Pixel art minimap UI 512x512, cyberpunk radar-style minimap, 
includes: circular radar frame with cyan neon border #00FFFF, 
radar sweep animation frame, player position indicator (arrow), 
enemy blips (red dots), ally blips (green dots), NPC blips (yellow dots), 
quest marker icons, fog of war overlay, grid lines for coordinates, 
compass directions NESW, zoom level indicators, 
FF6 meets cyberpunk aesthetic, 16-bit pixel art, SNES quality, 
transparent background, game UI asset`,
        aspect_ratio: '1:1',
        resolution: '2K',
        output_format: 'png',
        priority: 3
    },
    {
        id: 'ui-font',
        category: 'ui',
        filename: 'ui-font.png',
        prompt: `Pixel art bitmap font spritesheet 1024x1024, FF6 style pixel font,
  includes: complete ASCII set 32-126, uppercase and lowercase letters,
  numbers 0-9, punctuation marks, special characters (accents),
  3 font sizes: 8x8, 16x16, 24x24 pixels per character,
  3 color variants: white, cyan neon #00FFFF, gold #FFD700,
  shadow/outline variants for readability,
  monospace grid layout, 16-bit pixel art style, SNES quality,
  black background, game UI asset`,
        aspect_ratio: '1:1',
        resolution: '2K',
        output_format: 'png',
        priority: 3
    },

    // ====================
    // PRIORITÉ 4 : Effets et Particules (5)
    // ====================
    {
        id: 'effects-fire',
        category: 'effects',
        filename: 'effects-fire.png',
        prompt: `Pixel art magic particle effects spritesheet 512x512, fire magic spell effects, 
includes: fireball projectile 8 frames animation, fire explosion 8 frames, 
fire trail particles, ember sparks, flame aura around character 8 frames, 
meteor falling animation, lava splash, fire shield effect, 
FF6 style spell effects, warm orange and red palette, 
16-bit pixel art, SNES quality, additive blend mode ready, 
transparent background, game VFX asset`,
        aspect_ratio: '1:1',
        resolution: '2K',
        output_format: 'png',
        frameWidth: 64,
        frameHeight: 64,
        priority: 4
    },
    {
        id: 'effects-ice',
        category: 'effects',
        filename: 'effects-ice.png',
        prompt: `Pixel art magic particle effects spritesheet 512x512, ice magic spell effects, 
includes: ice shard projectile 8 frames, ice explosion crystal formation 8 frames, 
blizzard swirl effect, frost trail, ice shield barrier, 
snowflake particles, frozen status effect on character, icicle drop animation, 
FF6 style spell effects, cool blue and cyan palette #87CEEB #00FFFF, 
16-bit pixel art, SNES quality, additive blend mode ready, 
transparent background, game VFX asset`,
        aspect_ratio: '1:1',
        resolution: '2K',
        output_format: 'png',
        frameWidth: 64,
        frameHeight: 64,
        priority: 4
    },
    {
        id: 'effects-heal',
        category: 'effects',
        filename: 'effects-heal.png',
        prompt: `Pixel art healing particle effects spritesheet 512x512, healing and buff spell effects, 
includes: healing cross rising animation 8 frames, green plus symbols floating up, 
golden light aura expanding, HP recovery numbers effect, 
shield buff bubble formation, regeneration particles, 
cleansing effect (removing debuffs), resurrection light beam, 
FF6 style spell effects, green and gold palette #228B22 #FFD700, 
16-bit pixel art, SNES quality, additive blend mode ready, 
transparent background, game VFX asset`,
        aspect_ratio: '1:1',
        resolution: '2K',
        output_format: 'png',
        frameWidth: 64,
        frameHeight: 64,
        priority: 4
    },
    {
        id: 'effects-impacts',
        category: 'effects',
        filename: 'effects-impacts.png',
        prompt: `Pixel art explosion and impact effects spritesheet 512x512, combat impact effects, 
includes: sword slash impact 8 frames, explosion cloud 8 frames, 
screen shake effect indicator, critical hit star burst, 
block/parry spark effect, damage number popup background, 
stun stars circling head, knockback dust cloud, 
FF6 style combat effects, white and yellow impact colors, 
16-bit pixel art, SNES quality, additive blend mode ready, 
transparent background, game VFX asset`,
        aspect_ratio: '1:1',
        resolution: '2K',
        output_format: 'png',
        frameWidth: 64,
        frameHeight: 64,
        priority: 4
    },
    {
        id: 'effects-auras',
        category: 'effects',
        filename: 'effects-auras.png',
        prompt: `Pixel art character aura and trail effects spritesheet 512x512, 
includes: cyan neon aura for knight class 8 frames loop, 
pink magical aura for mage class, green stealth aura for rogue, 
orange tech aura for engineer, dash movement trail effect, 
level up aura burst, teleportation dissolve effect, 
charging power aura intensifying, 
FF6 style aura effects, class-specific neon colors, 
16-bit pixel art, SNES quality, additive blend mode ready, 
transparent background, game VFX asset`,
        aspect_ratio: '1:1',
        resolution: '2K',
        output_format: 'png',
        frameWidth: 64,
        frameHeight: 64,
        priority: 4
    },

    // ====================
    // PRIORITÉ 5 : Items et Objets (5)
    // ====================
    {
        id: 'items-weapons',
        category: 'items',
        filename: 'items-weapons.png',
        prompt: `Pixel art weapons spritesheet 512x512, medieval cyberpunk weapons, 
includes: pizza cutter sword with neon edge, tomato sauce blade with dripping effect, 
cheese grater shield, rolling pin staff with tech modifications, 
pepperoni throwing stars, garlic bread sword, 
4 tiers each: common (iron), rare (steel), epic (neon), legendary (golden), 
weapon icons 64x64 each, diagonal display angle, 
FF6 item style, detailed pixel art, 16-bit palette, 
transparent background, game item asset`,
        aspect_ratio: '1:1',
        resolution: '2K',
        output_format: 'png',
        priority: 5
    },
    {
        id: 'items-armor',
        category: 'items',
        filename: 'items-armor.png',
        prompt: `Pixel art armor equipment spritesheet 512x512, medieval cyberpunk armor pieces, 
includes: knight helmet with HUD visor, mage hood with holographic trim, 
rogue mask with night vision goggles, engineer goggles with scanner, 
armor chest pieces (4 classes), gloves with tech enhancements, 
boots with rocket boosters, capes with circuit patterns, 
4 tiers each: common, rare, epic, legendary, 
64x64 icons, FF6 equipment style, detailed pixel art, 
16-bit palette, transparent background, game item asset`,
        aspect_ratio: '1:1',
        resolution: '2K',
        output_format: 'png',
        priority: 5
    },
    {
        id: 'items-consumables',
        category: 'items',
        filename: 'items-consumables.png',
        prompt: `Pixel art consumable items spritesheet 512x512, potions and food items,
  includes: health potion (red tomato sauce bottle), mana potion (blue glowing liquid),
  stamina potion (green energy drink), antidote (clear vial),
  buff pizza slice (various toppings), energy drink can,
  bread roll ration, cheese wheel snack,
  32x32 icons, FF6 item style, vibrant colors,
  16-bit pixel art, transparent background, game item asset`,
        aspect_ratio: '1:1',
        resolution: '2K',
        output_format: 'png',
        priority: 5
    },
    {
        id: 'items-quest',
        category: 'items',
        filename: 'items-quest.png',
        prompt: `Pixel art quest items spritesheet 512x512, keys and quest objects,
  includes: ancient pizza oven key, digital access card,
  recipe scroll with holographic display, delivery order ticket,
  vip customer badge, secret ingredient vial,
  map fragment, mysterious cheese artifact,
  32x32 icons, FF6 key item style, golden and silver variants,
  16-bit pixel art, transparent background, game item asset`,
        aspect_ratio: '1:1',
        resolution: '2K',
        output_format: 'png',
        priority: 5
    },
    {
        id: 'items-pizza-buffs',
        category: 'items',
        filename: 'items-pizza-buffs.png',
        prompt: `Pixel art magical pizza items 256x256, enchanted pizza buff items, 
includes: healing margherita with golden glow, strength pepperoni with red aura, 
speed mushroom pizza with green trails, defense four-cheese with blue shield, 
magic seafood pizza with purple sparkles, legendary supreme with rainbow effect, 
64x64 icons each, floating animation frames, 
FF6 item style with magical effects, vibrant colors, 
16-bit pixel art, transparent background, game item asset`,
        aspect_ratio: '1:1',
        resolution: '2K',
        output_format: 'png',
        priority: 5
    },

    // ====================
    // PRIORITÉ 6 : Logo et Titre (3)
    // ====================
    {
        id: 'logo-game',
        category: 'logo',
        filename: 'logo-game.png',
        prompt: `Pixel art game logo 1024x1024, MechaPizzAI MMORPG title, 
Final Fantasy VI logo style meets cyberpunk, 
METAL text 'MECHA' in chrome silver with cyan neon outline #00FFFF, 
PIZZA text 'PIZZ' in warm orange #FF6B35 with cheese texture, 
AI text in digital cyan with circuit patterns, 
crossed pizza cutter sword and robotic arm behind text, 
neon glow effects, chrome bevel, medieval ornamental frame, 
16-bit pixel art style, SNES quality, transparent background, 
game logo asset, center composition`,
        aspect_ratio: '1:1',
        resolution: '2K',
        output_format: 'png',
        priority: 6
    },
    {
        id: 'title-screen',
        category: 'logo',
        filename: 'title-screen.png',
        prompt: `Pixel art title screen background 1920x1080, animated title screen scene, 
cyberpunk medieval cityscape at night, neon signs in Japanese and pizza themes, 
flying delivery drones, towering pizza restaurant castle, 
hero characters silhouettes in foreground, dramatic lighting with cyan and orange neon, 
parallax layers ready: distant buildings, midground structures, foreground elements, 
FF6 opening cinematic style, atmospheric fog, rain effect, 
16-bit pixel art, SNES quality, game title screen asset`,
        aspect_ratio: '16:9',
        resolution: '2K',
        output_format: 'png',
        priority: 6
    },
    {
        id: 'class-icons',
        category: 'logo',
        filename: 'class-icons.png',
        prompt: `Pixel art class icons spritesheet 512x512, 4 RPG class icons arranged in 2x2 grid, 
Knight Pizza: shield with pizza emblem and cyan glow, 
Mage Tomato: spell book with tomato and pink magic, 
Rogue Cheese: dagger with cheese wedge and green stealth, 
Engineer Dough: wrench with dough and orange tech, 
128x128 icons, circular frames with class color borders, 
FF6 job class icon style, detailed pixel art, 
16-bit palette, transparent background, game UI asset`,
        aspect_ratio: '1:1',
        resolution: '2K',
        output_format: 'png',
        priority: 6
    }
];

// ============================================
// UTILITAIRES
// ============================================

/**
 * Effectue une requête HTTP POST
 */
function postRequest(url, data, headers = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || 443,
            path: urlObj.pathname + urlObj.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(data);
                }
            });
        });

        req.on('error', reject);
        req.write(JSON.stringify(data));
        req.end();
    });
}

/**
 * Effectue une requête HTTP GET
 */
function getRequest(url, headers = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || 443,
            path: urlObj.pathname + urlObj.search,
            method: 'GET',
            headers: headers
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(data);
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

/**
 * Télécharge un fichier depuis une URL
 */
function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const file = fs.createWriteStream(destPath);

        protocol.get(url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                // Redirection
                file.close();
                downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
                return;
            }

            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve(destPath);
            });
        }).on('error', (err) => {
            fs.unlink(destPath, () => { });
            reject(err);
        });
    });
}

/**
 * Attend un certain nombre de millisecondes
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// FONCTIONS PRINCIPALES
// ============================================

/**
 * Crée une tâche de génération sur NanoBanana Pro
 */
async function createGenerationTask(asset) {
    console.log(`  🎨 Création de la tâche pour ${asset.id}...`);

    const payload = {
        model: 'nano-banana-pro',
        input: {
            prompt: asset.prompt,
            aspect_ratio: asset.aspect_ratio,
            resolution: asset.resolution,
            output_format: asset.output_format
        }
    };

    try {
        const response = await postRequest(
            `${API_URL}/api/v1/jobs/createTask`,
            payload,
            { 'Authorization': `Bearer ${API_KEY}` }
        );

        if (response.code === 200 && response.data && response.data.taskId) {
            console.log(`  ✅ Tâche créée: ${response.data.taskId}`);
            return response.data.taskId;
        } else {
            throw new Error(`Erreur API: ${response.msg || JSON.stringify(response)}`);
        }
    } catch (error) {
        console.error(`  ❌ Erreur création tâche: ${error.message}`);
        throw error;
    }
}

/**
 * Vérifie le statut d'une tâche
 */
async function checkTaskStatus(taskId) {
    try {
        const response = await getRequest(
            `${API_URL}/api/v1/jobs/recordInfo?taskId=${taskId}`,
            { 'Authorization': `Bearer ${API_KEY}` }
        );

        if (response.code === 200 && response.data) {
            return response.data;
        } else {
            throw new Error(`Erreur API: ${response.msg || JSON.stringify(response)}`);
        }
    } catch (error) {
        console.error(`  ❌ Erreur vérification statut: ${error.message}`);
        throw error;
    }
}

/**
 * Attend la complétion d'une tâche avec polling
 */
async function waitForTaskCompletion(taskId, maxAttempts = 60) {
    console.log(`  ⏳ Attente de la génération (taskId: ${taskId})...`);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const status = await checkTaskStatus(taskId);

        if (status.state === 'success') {
            console.log(`  ✅ Génération terminée !`);
            const result = JSON.parse(status.resultJson);
            return result.resultUrls[0];
        } else if (status.state === 'fail') {
            throw new Error(`Génération échouée: ${status.failMsg || 'Erreur inconnue'}`);
        }

        process.stdout.write(`  ⏳ Attente... ${attempt}/${maxAttempts}\r`);
        await sleep(5000); // Attendre 5 secondes entre chaque vérification
    }

    throw new Error('Timeout: La génération a pris trop de temps');
}

/**
 * Génère un asset complet (création, attente, téléchargement)
 */
async function generateAsset(asset) {
    console.log(`\n🎯 Génération: ${asset.id} (${asset.category})`);
    console.log(`   Fichier: ${asset.filename}`);

    try {
        // Étape 1: Créer la tâche
        const taskId = await createGenerationTask(asset);

        // Étape 2: Attendre la complétion
        const imageUrl = await waitForTaskCompletion(taskId);

        // Étape 3: Créer le dossier de destination
        const categoryDir = path.join(OUTPUT_DIR, asset.category);
        if (!fs.existsSync(categoryDir)) {
            fs.mkdirSync(categoryDir, { recursive: true });
        }

        // Étape 4: Télécharger l'image
        const imagePath = path.join(categoryDir, asset.filename);
        console.log(`  📥 Téléchargement...`);
        await downloadFile(imageUrl, imagePath);
        console.log(`  ✅ Téléchargé: ${imagePath}`);

        // Étape 5: Créer le fichier de metadata
        const metadata = {
            id: asset.id,
            category: asset.category,
            filename: asset.filename,
            generatedAt: new Date().toISOString(),
            api: 'NanoBanana Pro',
            taskId: taskId,
            imageUrl: imageUrl,
            config: {
                aspect_ratio: asset.aspect_ratio,
                resolution: asset.resolution,
                output_format: asset.output_format
            },
            phaser: {
                type: asset.frameWidth ? 'spritesheet' : 'image',
                ...(asset.frameWidth && {
                    frameWidth: asset.frameWidth,
                    frameHeight: asset.frameHeight
                }),
                ...(asset.tileWidth && {
                    tileWidth: asset.tileWidth,
                    tileHeight: asset.tileHeight
                })
            }
        };

        const metadataPath = path.join(categoryDir, `${asset.id}.json`);
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
        console.log(`  ✅ Metadata: ${metadataPath}`);

        return { success: true, asset, imagePath, metadataPath };
    } catch (error) {
        console.error(`  ❌ Erreur génération ${asset.id}: ${error.message}`);
        return { success: false, asset, error: error.message };
    }
}

/**
 * Génère tous les assets par priorité
 */
async function generateAllAssets() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     🎨 AGENT PIXEL - GÉNÉRATION D\'ASSETS NANOBANANA       ║');
    console.log('║              MechaPizzAI MMORPG - FF6 × Cyberpunk         ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Vérifier le dossier de sortie
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    console.log(`📁 Dossier de sortie: ${OUTPUT_DIR}`);
    console.log(`🔑 API Key: ${API_KEY.substring(0, 8)}...`);
    console.log(`🎯 Total assets à générer: ${ASSETS_TO_GENERATE.length}\n`);

    // Grouper par priorité
    const assetsByPriority = {};
    for (const asset of ASSETS_TO_GENERATE) {
        if (!assetsByPriority[asset.priority]) {
            assetsByPriority[asset.priority] = [];
        }
        assetsByPriority[asset.priority].push(asset);
    }

    const results = {
        success: [],
        failed: []
    };

    // Traiter par priorité
    const priorityNames = {
        1: 'SPRITES PERSONNAGES',
        2: 'TILESETS ENVIRONNEMENT',
        3: 'UI/HUD',
        4: 'EFFETS ET PARTICULES',
        5: 'ITEMS ET OBJETS',
        6: 'LOGO ET TITRE'
    };

    for (const priority of Object.keys(assetsByPriority).sort((a, b) => a - b)) {
        const assets = assetsByPriority[priority];
        console.log(`\n═══════════════════════════════════════════════════════════════`);
        console.log(`🚀 PRIORITÉ ${priority}: ${priorityNames[priority]}`);
        console.log(`   ${assets.length} asset(s) à générer`);
        console.log(`═══════════════════════════════════════════════════════════════`);

        for (const asset of assets) {
            const result = await generateAsset(asset);
            if (result.success) {
                results.success.push(result);
            } else {
                results.failed.push(result);
            }

            // Petite pause entre chaque asset pour ne pas surcharger l'API
            await sleep(1000);
        }
    }

    // Résumé final
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    📊 RÉSUMÉ FINAL                         ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`\n✅ Succès: ${results.success.length}/${ASSETS_TO_GENERATE.length}`);
    console.log(`❌ Échecs: ${results.failed.length}/${ASSETS_TO_GENERATE.length}`);

    if (results.failed.length > 0) {
        console.log('\n❌ Assets en échec:');
        for (const fail of results.failed) {
            console.log(`   - ${fail.asset.id}: ${fail.error}`);
        }
    }

    if (results.success.length > 0) {
        console.log('\n✅ Assets générés avec succès:');
        for (const success of results.success) {
            console.log(`   ✓ ${success.asset.id} → ${success.asset.filename}`);
        }
    }

    // Créer un fichier de résumé
    const summaryPath = path.join(OUTPUT_DIR, 'generation-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify({
        generatedAt: new Date().toISOString(),
        total: ASSETS_TO_GENERATE.length,
        success: results.success.length,
        failed: results.failed.length,
        assets: results.success.map(r => ({
            id: r.asset.id,
            category: r.asset.category,
            filename: r.asset.filename
        })),
        failures: results.failed.map(r => ({
            id: r.asset.id,
            error: r.error
        }))
    }, null, 2));
    console.log(`\n📝 Résumé sauvegardé: ${summaryPath}`);

    return results;
}

// ============================================
// POINT D'ENTRÉE
// ============================================

if (require.main === module) {
    generateAllAssets()
        .then(results => {
            if (results.failed.length > 0) {
                process.exit(1);
            }
            process.exit(0);
        })
        .catch(error => {
            console.error('Erreur fatale:', error);
            process.exit(1);
        });
}

module.exports = { generateAllAssets, ASSETS_TO_GENERATE };
