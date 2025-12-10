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
import { MapManager } from "../classes/MapManager.js";
import { CONFIG } from "../classes/Config.js";
import { Sister } from "../classes/Sister.js";

export class GameScene extends Phaser.Scene {
    constructor() { super({ key: 'GameScene' }); }

    preload() {
        this.load.image('game_bg', 'assets/imgs/tile_grein.png');
        this.load.image('tree', 'assets/imgs/tree.png');
        this.load.spritesheet('Dina_idle', 'assets/imgs/player/Dina_idle.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('Dina_run', 'assets/imgs/player/Dina_run.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('Dina_walk', 'assets/imgs/player/Dina_walk.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('hina_idle', 'assets/imgs/enemy/hina_idle.png', { frameWidth: 47, frameHeight: 48 });
        this.load.spritesheet('hina_run', 'assets/imgs/enemy/hina_run.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('hina_walk', 'assets/imgs/enemy/hina_walk.png', { frameWidth: 48, frameHeight: 48 });

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
        this.load.audio('level_up', 'assets/sounds/angel.mp3');
    }

    create() {
        SoundManager.init(this);
        SoundManager.add('gamebgm', { loop: true, volume: 2 });
        SoundManager.play('gamebgm');

        createAnimations(this);
        this.scene.launch('UIScene');

        // MANAGERS INITIALIZATION 
        this.mapManager = new MapManager(this);
        this.mapManager.setupForest();

        this.sister = new Sister(this, this.mapManager.goalX, this.mapManager.goalY, null);

        this.effects = new EffectsManager(this);
        this.stats = new PlayerStatsManager(this);
        this.stats.resetFromConfig();

        //  ENTITIES 
        const startX = CONFIG.MAP.FOREST_WIDTH / 2;
        const startY = CONFIG.MAP.FOREST_HEIGHT - 200;
        this.player = new Player(this, startX, startY);
        this.add.existing(this.player);
        this.physics.add.existing(this.player);
        this.player.setCollideWorldBounds(false);
        this.player.setScale(1.7);
        this.player.body.setCircle(15, 10, 10);

        this.physics.add.overlap(this.player, this.mapManager.goalZone, () => {
            this.transitionToBoss();
        });

        this.physics.add.overlap(this.player, this.sister, () => {
            this.transitionToBoss();
        });

        this.smg = this.add.sprite(this.player.x, this.player.y, 'smg').setOrigin(0.1, 0.5).setScale(0.8);
        this.isReloading = false;

        //  CONTROLLERS 
        this.skills = new SkillsManager(this, this.stats, this.player);
        this.skills.resetCooldowns();
        this.enemyController = new EnemyController(this);
        this.bossController = new BossController(this);
        this.bulletController = new BulletController(this, this.stats);

        //  COLLISIONS 
        this.collisions = new CollisionManager(this);
        this.collisions.setup();

        // INPUTS & CAMERA 
        this.setupInputs();
        this.cameras.main.startFollow(this.player);

        this.events.on('skill:nuke', ({ dmg, radius }) => {
            this.effects.playNukeEffect();
            this.collisions.damageEnemiesInArea(this.player.x, this.player.y, radius, dmg, false, true);
        });
        
        this.lastUpgradeTime = 0;
        
        GameState.sceneType = "forest";
        GameState.goalText = "Find your sister";
    }
    setupInputs() {
        this.keyC = this.input.keyboard.addKey('C');
        this.keyQ = this.input.keyboard.addKey('Q');
        this.keyE = this.input.keyboard.addKey('E');
        this.keyZ = this.input.keyboard.addKey('Z');
        this.keyR = this.input.keyboard.addKey('R');
        this.keyT = this.input.keyboard.addKey('T');
    }

    update(time, delta) {
        if (GameState.seconds > 0 && GameState.seconds % 80 === 0 && GameState.seconds !== this.lastUpgradeTime) {
            this.lastUpgradeTime = GameState.seconds;
            SoundManager.play('level_up');
            this.physics.pause();
            this.scene.launch('UpgradeScene');
        }

        if (GameState.isPaused) return;

        if (this.mapManager) {
            this.mapManager.update();
        }

        this.player.update();
        this.skills.update(time, delta);
        this.enemyController.update(time, delta);
        this.bossController.update(time, delta);
        
        const distToGoal = Math.abs(this.player.y - this.mapManager.goalY);
        GameState.distanceToGoal = Math.floor(distToGoal);


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

        if ((pointer.leftButtonDown && pointer.leftButtonDown()) && !this.isReloading) {
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
        if (Phaser.Input.Keyboard.JustDown(this.keyT)) this.skills.resetCooldowns();
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

    showGameOverScreen(isWin = false) {
        this.physics.pause();
        this.scene.stop('UIScene');
        SoundManager.stopAll();
        this.registry.set('isWin', isWin);
        this.scene.start('EndScene');
    }

transitionToBoss() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    this.physics.pause();
    SoundManager.stop('gamebgm');
    this.cameras.main.fade(1000, 0, 0, 0);

    this.time.delayedCall(1000, () => {
        this.scene.stop('UIScene');
        
        this.scene.start('StoryScene', {

            images: ['brainwash'], 
            nextScene: 'BossScene' 
        });
    });
}
}