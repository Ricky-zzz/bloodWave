import { Player } from "../classes/Player.js";
import { createAnimations } from "../utils/animations.js";
import { BulletController } from "../classes/BulletController.js";
import { EnemyController } from "../classes/EnemyController.js";
import { BossController } from "../classes/BossController.js";
import { PlayerStatsManager } from "../classes/PlayerStatsManager.js";
import { SkillsManager } from "../classes/SkillsManager.js";
import { EffectsManager } from "../classes/EffectsManager.js"; 
import { CollisionManager } from "../classes/CollisionManager.js"; 
import { GameState } from "../classes/GameState.js";

export class GameScene extends Phaser.Scene {
    constructor() { super({ key: 'GameScene' }); }

    preload() {
        this.load.image('bg', 'assets/imgs/tile_green.png');
        this.load.spritesheet('Dina_idle', 'assets/imgs/player/Dina_idle.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('Dina_run', 'assets/imgs/player/Dina_run.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('Dina_walk', 'assets/imgs/player/Dina_walk.png', { frameWidth: 48, frameHeight: 48 });
        
        this.load.spritesheet('Enemy_1', 'assets/imgs/enemy/Enemy1.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('Enemy_2', 'assets/imgs/enemy/Enemy2.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('Enemy_3', 'assets/imgs/enemy/Enemy3.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('Enemy_4', 'assets/imgs/enemy/Enemy4.png', { frameWidth: 48, frameHeight: 48 });

        this.load.spritesheet('minion', 'assets/imgs/enemy/minion.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('Boss', 'assets/imgs/enemy/Boss.png', { frameWidth: 48, frameHeight: 48 });

        this.load.image('smg', 'assets/imgs/smg.png');
    }

    create() {
        this.bg = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'bg').setOrigin(0, 0).setScrollFactor(0);
        createAnimations(this);
        this.scene.launch('UIScene');

        // --- ENTITIES ---
        this.player = new Player(this, this.scale.width / 2, this.scale.height / 2);
        this.add.existing(this.player);
        this.physics.add.existing(this.player);
        this.player.setCollideWorldBounds(false); 
        this.player.setScale(1.7);
        this.player.body.setCircle(15, 10, 10); 
        
        this.smg = this.add.sprite(this.player.x, this.player.y, 'smg').setOrigin(0.1, 0.5).setScale(0.8);

        // --- MANAGERS ---
        this.effects = new EffectsManager(this); 
        this.stats = new PlayerStatsManager(this);
        this.stats.resetFromConfig();
        this.skills = new SkillsManager(this, this.stats, this.player); 
        this.enemyController = new EnemyController(this);
        this.bossController = new BossController(this); 
        this.bulletController = new BulletController(this, this.stats);
        
        // --- COLLISIONS ---
        this.collisions = new CollisionManager(this);
        this.collisions.setup(); 

        // --- INPUTS & CAMERA ---
        this.setupInputs();
        this.cameras.main.startFollow(this.player);

        // --- EVENT LISTENERS ---
        this.events.on('skill:nuke', ({ dmg, radius }) => {
            this.effects.playNukeEffect();
            // Nuke: No Boss Damage, Skip Death Effects (Explosions)
            this.collisions.damageEnemiesInArea(this.player.x, this.player.y, radius, dmg, false, true);
        });
    }

    setupInputs() {
        this.keyC = this.input.keyboard.addKey('C');
        this.keyQ = this.input.keyboard.addKey('Q');
        this.keyE = this.input.keyboard.addKey('E');
        this.keyZ = this.input.keyboard.addKey('Z');

        this.input.on('pointermove', (pointer) => {
            if (!this.player.active) return;
            const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, pointer.worldX, pointer.worldY);
            this.smg.rotation = angle;
            this.smg.flipY = (angle > Math.PI / 2 || angle < -Math.PI / 2);
        });
    }

    update(time, delta) {
        if (GameState.isPaused) return;

        this.player.update();
        this.skills.update(time, delta);
        this.enemyController.update(time, delta);
        this.bossController.update(time, delta);

        this.bg.tilePositionX = this.cameras.main.scrollX;
        this.bg.tilePositionY = this.cameras.main.scrollY;

        // Weapon Follow
        const radius = 20;
        const angle = this.smg.rotation;
        this.smg.x = this.player.x + Math.cos(angle) * radius;
        this.smg.y = this.player.y + Math.sin(angle) * radius;

        // Shooting
        if (this.input.activePointer.isDown) {
            this.bulletController.shoot(this.smg.x, this.smg.y, this.smg.rotation);
        }

        // Skills
        if (Phaser.Input.Keyboard.JustDown(this.keyC)) this.skills.useGrenade();
        if (Phaser.Input.Keyboard.JustDown(this.keyQ)) this.skills.useShield(time);
        if (Phaser.Input.Keyboard.JustDown(this.keyE)) this.skills.useOverdrive(time);
        if (Phaser.Input.Keyboard.JustDown(this.keyZ)) this.skills.useNuke();
    }

    damageEnemiesInArea(x, y, radius, damage) {
        // Delegate to CollisionManager
        // Grenades use this: Affect Bosses = true, Skip Death Effect = false
        this.collisions.damageEnemiesInArea(x, y, radius, damage, true, false);
    }

    triggerPlayerDeath() {
        GameState.isPaused = true;
        this.player.setActive(false);
        this.player.setVisible(false);
        this.smg.setVisible(false);
        this.player.body.stop();

        this.effects.playDeathSequence(this.player.x, this.player.y, () => {
            this.showGameOverScreen();
        });
    }

    showGameOverScreen() {
        this.physics.pause();
        this.scene.stop('UIScene');
        
        const cam = this.cameras.main;
        this.add.rectangle(cam.scrollX, cam.scrollY, cam.width, cam.height, 0x000000, 0.7).setOrigin(0,0);
        this.add.text(cam.scrollX + cam.width/2, cam.scrollY + cam.height/2, "GAME OVER", { fontSize: '84px', fill: '#ff0000' }).setOrigin(0.5);
    }
}