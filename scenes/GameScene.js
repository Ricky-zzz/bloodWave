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
    }

    create() {
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
        
        // We pass the Player object to the manager so it can draw shields around it
        this.skills = new SkillsManager(this, this.stats, this.player); 

        // Weapon
        this.smg = this.add.sprite(this.player.x, this.player.y, 'smg').setOrigin(0.1, 0.5).setScale(0.8);
        this.bulletController = new BulletController(this, this.stats);

        // Inputs
        this.keyC = this.input.keyboard.addKey('C');
        this.keyQ = this.input.keyboard.addKey('Q');
        this.keyE = this.input.keyboard.addKey('E');
        this.keyZ = this.input.keyboard.addKey('Z');

        // Mouse Aiming
        this.input.on('pointermove', (pointer) => {
            const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, pointer.worldX, pointer.worldY);
            this.smg.rotation = angle;
            this.smg.flipY = (angle > Math.PI / 2 || angle < -Math.PI / 2);
        });

        this.cameras.main.startFollow(this.player);
    }

    update(time, delta) {
        if (GameState.isPaused) return;

        this.player.update();
        this.skills.update(time, delta); // Manager handles all VFX updates now

        // Background
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

        // Skill Inputs
        if (Phaser.Input.Keyboard.JustDown(this.keyC)) this.skills.useGrenade();
        if (Phaser.Input.Keyboard.JustDown(this.keyE)) this.skills.useOverdrive(this.time.now);
        if (Phaser.Input.Keyboard.JustDown(this.keyQ)) this.skills.useShield(this.time.now);
        if (Phaser.Input.Keyboard.JustDown(this.keyZ)) this.skills.useNuke();
    }
}