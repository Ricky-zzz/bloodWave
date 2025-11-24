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
import { SoundManager } from "../utils/SoundManager.js";

export class GameScene extends Phaser.Scene {
    constructor() { super({ key: 'GameScene' }); }

    preload() {
        this.load.image('game_bg', 'assets/imgs/tile_grein.png');
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
        
        this.load.audio('gamebgm', 'assets/sounds/battle.mp3');
        this.load.audio('shoot', 'assets/sounds/shoot.mp3');
        this.load.audio('reload', 'assets/sounds/reload.mp3');
        this.load.audio('hurt', 'assets/sounds/hurt.mp3');
        this.load.audio('damage', 'assets/sounds/damage.mp3');
        this.load.audio('explode', 'assets/sounds/explode.mp3');
        this.load.audio('shield', 'assets/sounds/shield.mp3');
        this.load.audio('powerup', 'assets/sounds/powerup.mp3');
        this.load.audio('nuke', 'assets/sounds/nuke.mp3');
    }

    create() {
        SoundManager.init(this);
        SoundManager.add('gamebgm', { loop: true, volume: 0.5 });
        SoundManager.play('gamebgm');

        this.bg = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'game_bg').setOrigin(0, 0).setScrollFactor(0);
        createAnimations(this);
        this.scene.launch('UIScene');
        
        // Modules
        this.player = new Player(this, this.scale.width / 2, this.scale.height / 2);
        this.add.existing(this.player);
        this.physics.add.existing(this.player);
        this.player.setCollideWorldBounds(false); 
        this.player.setScale(1.7);
        this.player.body.setCircle(15, 10, 10); 
        this.smg = this.add.sprite(this.player.x, this.player.y, 'smg').setOrigin(0.1, 0.5).setScale(0.8);
        this.isReloading = false;
        this.effects = new EffectsManager(this); 
        this.stats = new PlayerStatsManager(this);
        this.stats.resetFromConfig();
        this.skills = new SkillsManager(this, this.stats, this.player); 
        this.enemyController = new EnemyController(this);
        this.bossController = new BossController(this); 
        this.bulletController = new BulletController(this, this.stats);
        this.collisions = new CollisionManager(this);
        this.collisions.setup(); 
        this.setupInputs();
        this.cameras.main.startFollow(this.player);
        this.events.on('skill:nuke', ({ dmg, radius }) => {
            this.effects.playNukeEffect();
            this.collisions.damageEnemiesInArea(this.player.x, this.player.y, radius, dmg, false, true);
        });
        this.createVignette();
    }

    createVignette() {
        this.shadow = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.95).setOrigin(0).setScrollFactor(0).setDepth(9);

        if (!this.textures.exists('vision')) {
            const radius = 1000;
            const texture = this.textures.createCanvas('vision', radius * 2, radius * 2);
            const ctx = texture.context;
            
            const grd = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
            grd.addColorStop(0, 'rgba(255, 255, 255, 1)');
            grd.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, radius * 2, radius * 2);
            texture.refresh();
        }

        this.visionSprite = this.make.image({
            x: this.player.x,
            y: this.player.y,
            key: 'vision',
            add: false
        });
        
        const mask = new Phaser.Display.Masks.BitmapMask(this, this.visionSprite);
        mask.invertAlpha = true;
        this.shadow.setMask(mask);
    }

    setupInputs() {
        this.keyC = this.input.keyboard.addKey('C');
        this.keyQ = this.input.keyboard.addKey('Q');
        this.keyE = this.input.keyboard.addKey('E');
        this.keyZ = this.input.keyboard.addKey('Z');
        this.keyR = this.input.keyboard.addKey('R');
    }

    update(time, delta) {
        if (GameState.isPaused) return;

        if (this.visionSprite) {
            this.visionSprite.x = this.player.x;
            this.visionSprite.y = this.player.y;
        }

        this.player.update();
        this.skills.update(time, delta);
        this.enemyController.update(time, delta);
        this.bossController.update(time, delta);

        this.bg.tilePositionX = this.cameras.main.scrollX;
        this.bg.tilePositionY = this.cameras.main.scrollY;

        const pointer = this.input.activePointer;
        const aimAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, pointer.worldX, pointer.worldY);
        const radius = 20;

        this.smg.x = this.player.x + Math.cos(aimAngle) * radius;
        this.smg.y = this.player.y + Math.sin(aimAngle) * radius;

        if (this.isReloading) {
            this.smg.rotation += 0.9; 
            this.smg.flipY = (aimAngle > Math.PI / 2 || aimAngle < -Math.PI / 2);
        } else {
            this.smg.rotation = aimAngle;
            this.smg.flipY = (aimAngle > Math.PI / 2 || aimAngle < -Math.PI / 2);
        }

        if (this.input.activePointer.isDown && !this.isReloading) {
            const result = this.bulletController.shoot(this.smg.x, this.smg.y, this.smg.rotation);
            if (result === "EMPTY") {
                this.startReload();
            }   
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyR) && !this.isReloading) {
            if (GameState.player.ammo < GameState.player.maxAmmo) {
                this.startReload();
            }
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyC)) this.skills.useGrenade();
        if (Phaser.Input.Keyboard.JustDown(this.keyQ)) this.skills.useShield(time);
        if (Phaser.Input.Keyboard.JustDown(this.keyE)) this.skills.useOverdrive(time);
        if (Phaser.Input.Keyboard.JustDown(this.keyZ)) this.skills.useNuke();
    }

    startReload() {
        this.isReloading = true;
        SoundManager.play('reload');
        const reloadTime = GameState.player.reloadSpeed;
        
        this.time.delayedCall(reloadTime, () => {
            GameState.player.ammo = GameState.player.maxAmmo;
            this.isReloading = false;
            const pointer = this.input.activePointer;
            const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, pointer.worldX, pointer.worldY);
            this.smg.rotation = angle;
            this.smg.flipY = (angle > Math.PI / 2 || angle < -Math.PI / 2);
        });
    }

    damageEnemiesInArea(x, y, radius, damage) {
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
    
        SoundManager.stopAll(); 
        this.scene.start('EndScene');
    }
}