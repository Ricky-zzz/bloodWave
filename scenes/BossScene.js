import { Player } from "../classes/Player.js";
import { BulletController } from "../classes/BulletController.js";
import { PlayerStatsManager } from "../classes/PlayerStatsManager.js";
import { SkillsManager } from "../classes/SkillsManager.js";
import { EffectsManager } from "../classes/EffectsManager.js";
import { CollisionManager } from "../classes/CollisionManager.js";
import { MapManager } from "../classes/MapManager.js";
import { GameState } from "../classes/GameState.js";
import { SoundManager } from "../utils/SoundManager.js";
import { CONFIG } from "../classes/Config.js";
import { createAnimations } from "../utils/animations.js";
import { SisterBulletController } from "../classes/SisterBulletController.js";
import { Sister } from "../classes/Sister.js";

export class BossScene extends Phaser.Scene {
    constructor() { super({ key: 'BossScene' }); }

    preload() {

        this.load.audio('hina_defeat', 'assets/sounds/hina_defeat.mp3');
        this.load.audio('hina_tp', 'assets/sounds/hina_tp.mp3');
        this.load.audio('hina_atk1', 'assets/sounds/hina_atk1.mp3');
        this.load.audio('hina_atk2', 'assets/sounds/hina_atk2.mp3');
        this.load.audio('hina_atk3', 'assets/sounds/hina_atk3.mp3');
    }

    create() {
        SoundManager.init(this);
        SoundManager.add('gamebgm', { loop: true, volume: 2 });
        SoundManager.play('gamebgm');

        createAnimations(this);


        this.scene.launch('UIScene');

        this.mapManager = new MapManager(this);
        this.mapManager.setupArena();

        const startX = CONFIG.MAP.ARENA_WIDTH / 2;
        const startY = CONFIG.MAP.ARENA_HEIGHT - 200;

        this.player = new Player(this, startX, startY);
        this.add.existing(this.player);
        this.physics.add.existing(this.player);
        this.player.setCollideWorldBounds(true);
        this.player.setScale(1.7);
        this.player.body.setCircle(15, 10, 10);

        this.smg = this.add.sprite(this.player.x, this.player.y, 'smg').setOrigin(0.1, 0.5).setScale(0.8);
        this.isReloading = false;

        this.sisterBulletController = new SisterBulletController(this);
        this.sister = new Sister(this, CONFIG.MAP.ARENA_WIDTH / 2, CONFIG.MAP.ARENA_HEIGHT / 2, this.sisterBulletController);

        this.effects = new EffectsManager(this);
        this.stats = new PlayerStatsManager(this);

        this.skills = new SkillsManager(this, this.stats, this.player);
        this.bulletController = new BulletController(this, this.stats);

        this.collisions = new CollisionManager(this);
        this.collisions.setup();

        this.setupInputs();
        this.cameras.main.startFollow(this.player);

        this.events.on('skill:nuke', ({ dmg, radius }) => {
            this.effects.playNukeEffect();
            this.collisions.damageEnemiesInArea(this.player.x, this.player.y, radius, dmg, false, true);
        });

        this.lastUpgradeTime = 0;

        GameState.sceneType = "boss";
        GameState.goalText = "Defeat your sister";
        GameState.distanceToGoal = 0;
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

        if (GameState.isPaused) return;

        if (this.mapManager) {
            this.mapManager.update();
        }

        this.player.update();
        this.skills.update(time, delta);

        if (this.sister) {
            this.sister.update(time, delta);
        }

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

    triggerBossDefeat() {
        this.physics.pause();
        this.scene.stop('UIScene');

        const w = this.scale.width;
        const h = this.scale.height;

        const victoryText = this.add.text(w / 2, h / 2, "VICTORY", {
            fontSize: '96px',
            fill: '#269926ff',
            fontStyle: 'bold',
            stroke: '#0a0909ff',
            strokeThickness: 6
        }).setOrigin(0.5).setScrollFactor(0).setAlpha(0);

        this.tweens.add({
            targets: victoryText,
            alpha: 1,
            scale: 1.2,
            duration: 1000,
            ease: 'Back.out'
        });
        this.time.delayedCall(4000, () => {
            this.showGameOverScreen(true);
        });
    }

    showGameOverScreen(isWin = true) {
        this.registry.set('isWin', isWin);
        SoundManager.stopAll();
        this.scene.start('StoryScene', {

            images: ['panel4', 'panel5'], 
            nextScene: 'EndScene' 
        });
    }
}