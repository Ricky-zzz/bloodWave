import { Player } from "../classes/Player.js";
import { createAnimations } from "../utils/animations.js";
import { BulletController } from "../classes/BulletController.js";
import { EnemyController } from "../classes/EnemyController.js";
import { BossController } from "../classes/BossController.js"; // <--- IMPORT
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
        
        this.load.spritesheet('Enemy_1', 'assets/imgs/enemy/Enemy1.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('Enemy_2', 'assets/imgs/enemy/Enemy2.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('Enemy_3', 'assets/imgs/enemy/Enemy3.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('Enemy_4', 'assets/imgs/enemy/Enemy4.png', { frameWidth: 48, frameHeight: 48 });

        // Boss Sprites
        this.load.spritesheet('minion', 'assets/imgs/enemy/minion.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('Boss', 'assets/imgs/enemy/Boss.png', { frameWidth: 48, frameHeight: 48 });

        this.load.image('smg', 'assets/imgs/smg.png');
    }

    create() {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(0, 0, 12, 12);      
        graphics.generateTexture('particle', 12, 12);
        
        this.bg = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'bg').setOrigin(0, 0).setScrollFactor(0);
        createAnimations(this);
        this.scene.launch('UIScene');

        this.player = new Player(this, this.scale.width / 2, this.scale.height / 2);
        this.add.existing(this.player);
        this.physics.add.existing(this.player);
        this.player.setCollideWorldBounds(false); 
        this.player.setScale(1.7);
        this.player.body.setCircle(15, 10, 10); 

        // Managers
        this.stats = new PlayerStatsManager(this);
        this.stats.resetFromConfig();
        this.skills = new SkillsManager(this, this.stats, this.player); 
        this.enemyController = new EnemyController(this);
        this.bossController = new BossController(this); 
        this.bulletController = new BulletController(this, this.stats);

        this.smg = this.add.sprite(this.player.x, this.player.y, 'smg').setOrigin(0.1, 0.5).setScale(0.8);

        // Inputs
        this.keyC = this.input.keyboard.addKey('C');
        this.keyQ = this.input.keyboard.addKey('Q');
        this.keyE = this.input.keyboard.addKey('E');
        this.keyZ = this.input.keyboard.addKey('Z');

        this.input.on('pointermove', (pointer) => {
            const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, pointer.worldX, pointer.worldY);
            this.smg.rotation = angle;
            this.smg.flipY = (angle > Math.PI / 2 || angle < -Math.PI / 2);
        });

        this.cameras.main.startFollow(this.player);

        // --- COLLISIONS ---
        
        // 1. Player Bullets vs Regular Enemies
        this.physics.add.overlap(this.bulletController.bulletGroup, this.enemyController.enemies, (bullet, enemy) => {
            if (enemy.active && bullet.active) {
                bullet.disableBody(true, true);
                const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, enemy.x, enemy.y);
                enemy.body.velocity.x += Math.cos(angle) * 100;
                enemy.body.velocity.y += Math.sin(angle) * 100;
                enemy.takeDamage(this.stats.getBulletDamage());
            }
        });

        // 2. Regular Enemies vs Player
        this.physics.add.collider(this.player, this.enemyController.enemies, (player, enemy) => {
            this.handlePlayerHit(enemy.damage, enemy.x, enemy.y);
            // Bounce Enemy
            if (enemy.active) {
                enemy.body.velocity.x = -enemy.body.velocity.x;
                enemy.body.velocity.y = -enemy.body.velocity.y;
            }
        });

        // 3. Player Bullets vs BOSS
        this.physics.add.overlap(this.bulletController.bulletGroup, this.bossController.bossGroup, (bullet, boss) => {
            if (boss.active && bullet.active) {
                bullet.disableBody(true, true);
                boss.takeDamage(this.stats.getBulletDamage());
            }
        });

        // 4. Boss Body vs Player
        this.physics.add.collider(this.player, this.bossController.bossGroup, (player, boss) => {
            this.handlePlayerHit(boss.damage, boss.x, boss.y);
        });

        // 5. Boss Bullets vs Player
        this.physics.add.overlap(this.player, this.bossController.bulletController.bulletGroup, (player, bullet) => {
            if (bullet.active) {
                bullet.disableBody(true, true);
                this.handlePlayerHit(bullet.damage, bullet.x, bullet.y);
            }
        });

        // Skills
        this.events.on('skill:nuke', ({ dmg, radius }) => {
            this.damageEnemiesInArea(this.player.x, this.player.y, radius, dmg);
        });
    }

    update(time, delta) {
        if (GameState.isPaused) return;

        this.player.update();
        this.skills.update(time, delta);
        this.enemyController.update(time, delta);
        this.bossController.update(time, delta); // <--- UPDATE BOSS

        this.bg.tilePositionX = this.cameras.main.scrollX;
        this.bg.tilePositionY = this.cameras.main.scrollY;

        const radius = 20;
        const angle = this.smg.rotation;
        this.smg.x = this.player.x + Math.cos(angle) * radius;
        this.smg.y = this.player.y + Math.sin(angle) * radius;

        if (this.input.activePointer.isDown) {
            this.bulletController.shoot(this.smg.x, this.smg.y, this.smg.rotation);
        }

        if (Phaser.Input.Keyboard.JustDown(this.keyC)) this.skills.useGrenade();
        if (Phaser.Input.Keyboard.JustDown(this.keyQ)) this.skills.useShield(time);
        if (Phaser.Input.Keyboard.JustDown(this.keyE)) this.skills.useOverdrive(time);
        if (Phaser.Input.Keyboard.JustDown(this.keyZ)) this.skills.useNuke();
    }

    // Consolidated Hit Logic
    handlePlayerHit(damage, sourceX, sourceY) {
        if (!this.player.active) return;
        
        const prevHp = this.stats.state.hp;
        const isDead = this.stats.takeDamage(damage);

        if (this.stats.state.hp < prevHp) {
            const angle = Phaser.Math.Angle.Between(sourceX, sourceY, this.player.x, this.player.y);
            const force = CONFIG.PLAYER.KNOCKBACK_FORCE;
            this.player.applyKnockback(Math.cos(angle) * force, Math.sin(angle) * force, 200);
        }

        if (isDead) this.gameOver();
    }

    damageEnemiesInArea(x, y, radius, damage) {
        // Hit Regular Enemies
        const enemies = this.enemyController.enemies.getChildren();
        enemies.forEach(enemy => {
            if (enemy.active) {
                if (Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y) <= radius) {
                    enemy.takeDamage(damage);
                }
            }
        });

        // Hit Bosses
        const bosses = this.bossController.bossGroup.getChildren();
        bosses.forEach(boss => {
            if (boss.active) {
                if (Phaser.Math.Distance.Between(x, y, boss.x, boss.y) <= radius) {
                    boss.takeDamage(damage);
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