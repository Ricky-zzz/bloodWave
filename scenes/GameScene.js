import { Player } from "../classes/Player.js";
import { createAnimations } from "../utils/animations.js";
import { BulletController } from "../classes/BulletController.js";
import { EnemyController } from "../classes/EnemyController.js";
import { PlayerStatsManager } from "../classes/PlayerStatsManager.js";
import { SkillsManager } from "../classes/SkillsManager.js";
import { GameState } from "../classes/GameState.js";
import { CONFIG } from "../classes/Config.js";

export class GameScene extends Phaser.Scene {
    constructor() { super({ key: 'GameScene' }); }

    preload() {
        this.load.image('bg', 'assets/imgs/tile_green.png');
        this.load.spritesheet('Dina_idle', 'assets/imgs/player/Dina_idle.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('Dina_run', 'assets/imgs/player/Dina_run.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('Dina_walk', 'assets/imgs/player/Dina_walk.png', { frameWidth: 48, frameHeight: 48 });
        
        // Enemy Sprites
        this.load.spritesheet('Enemy_1', 'assets/imgs/enemy/Enemy1.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('Enemy_2', 'assets/imgs/enemy/Enemy2.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('Enemy_3', 'assets/imgs/enemy/Enemy3.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('Enemy_4', 'assets/imgs/enemy/Enemy4.png', { frameWidth: 48, frameHeight: 48 });

        this.load.image('smg', 'assets/imgs/smg.png');
    }

    create() {
        // death animation
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(0, 0, 12, 12);      
        graphics.generateTexture('particle', 12, 12);
        

        // 1. World Setup
        this.bg = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'bg').setOrigin(0, 0).setScrollFactor(0);
        createAnimations(this);

        //create ui
        this.scene.launch('UIScene');

        // 2. Player Setup
        this.player = new Player(this, this.scale.width / 2, this.scale.height / 2);
        this.add.existing(this.player);
        this.physics.add.existing(this.player);
        this.player.setCollideWorldBounds(false); // Infinite map
        this.player.setScale(1.7);
        this.player.body.setCircle(15, 10, 10); 

        // 3. Managers
        this.stats = new PlayerStatsManager(this);
        this.stats.resetFromConfig();
        
        this.skills = new SkillsManager(this, this.stats, this.player); 
        this.enemyController = new EnemyController(this);
        this.bulletController = new BulletController(this, this.stats);

        // 4. Weapon Sprite
        this.smg = this.add.sprite(this.player.x, this.player.y, 'smg').setOrigin(0.1, 0.5).setScale(0.8);

        // 5. INPUTS & CONTROLS (RESTORED HERE)
        
        // Skill Keys
        this.keyC = this.input.keyboard.addKey('C');
        this.keyQ = this.input.keyboard.addKey('Q');
        this.keyE = this.input.keyboard.addKey('E');
        this.keyZ = this.input.keyboard.addKey('Z');

        // Mouse Aiming Logic
        this.input.on('pointermove', (pointer) => {
            // Calculate angle between Player and Mouse (World Coordinates)
            const angle = Phaser.Math.Angle.Between(
                this.player.x, this.player.y,
                pointer.worldX, pointer.worldY
            );
            
            // Rotate Gun
            this.smg.rotation = angle;
            
            // Flip Gun if aiming left
            this.smg.flipY = (angle > Math.PI / 2 || angle < -Math.PI / 2);
        });

        // Camera Follow Logic
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1); // Set default zoom if needed

        // 6. COLLISIONS & EVENTS
        
        // Bullet vs Enemy
        this.physics.add.overlap(this.bulletController.bulletGroup, this.enemyController.enemies, (bullet, enemy) => {
            if (enemy.active && bullet.active) {
                bullet.disableBody(true, true);
                
                // Knockback
                const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, enemy.x, enemy.y);
                enemy.body.velocity.x += Math.cos(angle) * 100;
                enemy.body.velocity.y += Math.sin(angle) * 100;

                // Damage
                enemy.takeDamage(this.stats.getBulletDamage());
            }
        });

        // B. Enemy touches Player (Damage + Knockback)
        this.physics.add.collider(this.player, this.enemyController.enemies, (player, enemy) => {
            if (enemy.active) {
                const prevHp = this.stats.state.hp;
                const isDead = this.stats.takeDamage(enemy.damage);

                // If we took damage (HP went down), apply knockback
                if (this.stats.state.hp < prevHp) {
                    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
                    const force = CONFIG.PLAYER.KNOCKBACK_FORCE;
                    player.applyKnockback(Math.cos(angle) * force, Math.sin(angle) * force, 200);

                    // Bounce Enemy off slightly
                    enemy.body.velocity.x = -enemy.body.velocity.x;
                    enemy.body.velocity.y = -enemy.body.velocity.y;
                }

                if (isDead) this.gameOver();
            }
        });        // Skills
        this.events.on('skill:nuke', ({ dmg, radius }) => {
            this.damageEnemiesInArea(this.player.x, this.player.y, radius, dmg);
        });
    }

    update(time, delta) {
        if (GameState.isPaused) return;

        this.player.update();
        this.skills.update(time, delta);
        this.enemyController.update(time, delta);

        // Background Scrolling
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

        // Controls
        if (Phaser.Input.Keyboard.JustDown(this.keyC)) this.skills.useGrenade();
        if (Phaser.Input.Keyboard.JustDown(this.keyQ)) this.skills.useShield(time);
        if (Phaser.Input.Keyboard.JustDown(this.keyE)) this.skills.useOverdrive(time);
        if (Phaser.Input.Keyboard.JustDown(this.keyZ)) this.skills.useNuke();
    }

    damageEnemiesInArea(x, y, radius, damage) {
        const enemies = this.enemyController.enemies.getChildren();
        enemies.forEach(enemy => {
            if (enemy.active) {
                const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
                if (dist <= radius) {
                    enemy.takeDamage(damage);
                }
            }
        });
    }

    gameOver() {
        this.physics.pause();
        GameState.isPaused = true;
        this.scene.stop('UIScene');
        this.add.text(this.cameras.main.midPoint.x, this.cameras.main.midPoint.y, "GAME OVER", {
            fontSize: '64px', fill: '#ff0000'
        }).setOrigin(0.5);
    }
}