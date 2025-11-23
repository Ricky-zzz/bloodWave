// scenes/GameScene.js
import { Player } from "../classes/Player.js";
import { createAnimations } from "../utils/animations.js";
import { BulletController } from "../classes/BulletController.js"; 

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('bg', 'assets/imgs/tile_black.png');
        this.load.spritesheet('Dina_idle', 'assets/imgs/player/Dina_idle.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('Dina_run', 'assets/imgs/player/Dina_run.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('Dina_walk', 'assets/imgs/player/Dina_walk.png', { frameWidth: 48, frameHeight: 48 });
        this.load.image('smg', 'assets/imgs/smg.png');
    }

    create() {
        // INFINITE BACKGROUND 
        this.bg = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'bg').setOrigin(0, 0).setScrollFactor(0); 

        createAnimations(this);

        // Player 
        this.player = new Player(this, this.scale.width / 2, this.scale.height / 2);
        this.add.existing(this.player);
        this.physics.add.existing(this.player);       
        this.player.setCollideWorldBounds(false); 
        const playerScale = 1.7;
        this.player.setScale(playerScale);

        // Weapon 
        this.smg = this.add.sprite(this.player.x, this.player.y, 'smg').setOrigin(0.1, 0.5).setScale(0.8);

        // Bullet Controller
        this.bulletController = new BulletController(this); 

        // Mouse Aiming
        this.input.on('pointermove', (pointer) => {
            const angle = Phaser.Math.Angle.Between(
                this.player.x, this.player.y,
                pointer.worldX, pointer.worldY
            );
            this.smg.rotation = angle;
            this.smg.flipY = (angle > Math.PI / 2 || angle < -Math.PI / 2);
        });

        this.cameras.main.startFollow(this.player);
    }

    update(time, delta) {
        this.player.update();

        this.bg.tilePositionX = this.cameras.main.scrollX;
        this.bg.tilePositionY = this.cameras.main.scrollY;

        const radius = 20;
        const angle = this.smg.rotation;
        this.smg.x = this.player.x + Math.cos(angle) * radius;
        this.smg.y = this.player.y + Math.sin(angle) * radius;

        if (this.input.activePointer.isDown) {
            this.bulletController.shoot(this.smg.x, this.smg.y, this.smg.rotation);
        }
    }
}