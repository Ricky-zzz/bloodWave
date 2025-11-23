// src/scenes/GameScene.js
import { Player } from "../classes/Player.js";
import { createAnimations } from "../utils/animations.js";
import { BulletController } from "../classes/BulletController.js";
import { PlayerStatsManager } from "../classes/PlayerStatsManager.js";
import { SkillsManager } from "../classes/SkillsManager.js";
import { GameState } from "../classes/GameState.js";

export class GameScene extends Phaser.Scene {
    constructor() { super({ key: 'GameScene' }); }

    preload() {
        this.load.image('bg', 'assets/imgs/tile_black.png');
        this.load.spritesheet('Dina_idle', 'assets/imgs/player/Dina_idle.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('Dina_run', 'assets/imgs/player/Dina_run.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('Dina_walk', 'assets/imgs/player/Dina_walk.png', { frameWidth: 48, frameHeight: 48 });
        this.load.image('smg', 'assets/imgs/smg.png');
        // any grenade/nuke VFX sprites can be loaded here
    }

    create() {
        // background (tileSprite)
        this.bg = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'bg').setOrigin(0, 0).setScrollFactor(0);

        createAnimations(this);

        // Player
        this.player = new Player(this, this.scale.width / 2, this.scale.height / 2);
        this.add.existing(this.player);
        this.physics.add.existing(this.player);
        this.player.setCollideWorldBounds(false);
        this.player.setScale(1.7);

        // Managers
        this.stats = new PlayerStatsManager(this);
        this.stats.resetFromConfig();

        this.skills = new SkillsManager(this, this.stats);

        // Weapon and bullets
        this.smg = this.add.sprite(this.player.x, this.player.y, 'smg').setOrigin(0.1, 0.5).setScale(0.8);
        this.bulletController = new BulletController(this, this.stats);

        // pointer aiming
        this.input.on('pointermove', (pointer) => {
            const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, pointer.worldX, pointer.worldY);
            this.smg.rotation = angle;
            this.smg.flipY = (angle > Math.PI / 2 || angle < -Math.PI / 2);
        });

        // skill keys
        this.keyC = this.input.keyboard.addKey('C');
        this.keyE = this.input.keyboard.addKey('E');
        this.keyQ = this.input.keyboard.addKey('Q');
        this.keyZ = this.input.keyboard.addKey('Z');

        // manager event handlers
        this.events.on('skill:grenade', ({ x, y, dmg, radius }) => {
            // spawn a big explosive bullet or play explosion VFX; simple approach:
            this.spawnExplosion(x, y, dmg, radius);
        });

        this.events.on('skill:nuke', ({ x, y, dmg, radius }) => {
            this.applyNuke(x, y, dmg, radius);
        });

        this.events.on('skill:shield:on', () => {
            // optionally spawn a shield VFX
        });

        this.cameras.main.startFollow(this.player);
    }

    update(time, delta) {
        // don't run game logic while paused by level-up, etc.
        if (GameState.isPaused) return;

        this.player.update();

        // managers update
        this.skills.update(time, delta);

        // background scroll with camera
        this.bg.tilePositionX = this.cameras.main.scrollX;
        this.bg.tilePositionY = this.cameras.main.scrollY;

        // weapon follow
        const radius = 20;
        const angle = this.smg.rotation;
        this.smg.x = this.player.x + Math.cos(angle) * radius;
        this.smg.y = this.player.y + Math.sin(angle) * radius;

        // shooting uses stats-managed fire rate/damage
        if (this.input.activePointer.isDown) {
            this.bulletController.shoot(this.smg.x, this.smg.y, this.smg.rotation);
        }

        // skill input checks (on key down)
        if (Phaser.Input.Keyboard.JustDown(this.keyC)) {
            this.skills.useGrenade();
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
            this.skills.useShield(this.time.now);
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyQ)) {
            this.skills.useOverdrive(this.time.now);
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyZ)) {
            this.skills.useNuke();
        }
    }

    // simple explosion - damages enemies in radius
    spawnExplosion(x, y, dmg, radius) {
        // show VFX (left to you) and damage enemies
        // assume you have an enemy group this.enemyGroup
        if (!this.enemyGroup) return;
        this.enemyGroup.children.iterate((enemy) => {
            if (!enemy || !enemy.active) return;
            const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
            if (dist <= radius) {
                if (enemy.takeDamage) enemy.takeDamage(dmg);
                else enemy.destroy();
            }
        });
    }

    applyNuke(x, y, dmg, radius) {
        // one-shot normal enemies in radius
        if (!this.enemyGroup) return;
        this.enemyGroup.children.iterate((enemy) => {
            if (!enemy || !enemy.active) return;
            const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
            if (dist <= radius) {
                if (enemy.takeDamage) enemy.takeDamage(dmg);
                else enemy.destroy();
            }
        });
        // optional global VFX/sound
    }
}
