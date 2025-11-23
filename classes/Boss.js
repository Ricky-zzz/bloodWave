import { CONFIG } from "./Config.js";

export class Boss extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, bulletController) {
        super(scene, 0, 0, 'Boss');
        this.scene = scene;
        this.bulletController = bulletController;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
    }

    spawn(x, y, isMainBoss) {
        this.setActive(true);
        this.setVisible(true);
        this.body.reset(x, y);
        this.setCircle(20); 
        
        // Load Stats
        const stats = isMainBoss ? CONFIG.BOSS.MAIN : CONFIG.BOSS.MINION;
        
        this.setTexture(stats.KEY);
        this.setScale(stats.SCALE);
        this.hp = stats.HP;
        this.maxHp = stats.HP;
        this.damage = stats.DMG;
        this.speed = stats.SPEED;
        this.bulletSpeed = stats.BULLET_SPEED;
        this.attackDelay = stats.ATTACK_DELAY;
        
        this.shootTimer = 0;
        this.spinTimer = 0;
        this.isTeleporting = false;
    }

    update(time, delta) {
        if (!this.active || this.hp <= 0) return;

        const player = this.scene.player;
        if (!player) return;

        this.rotation += 0.02;

        if (this.isTeleporting) return; 

        const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

        if (dist > CONFIG.BOSS.PUNISH_DIST) {
            this.teleportToPlayer(player);
            return;
        }

        this.scene.physics.moveToObject(this, player, this.speed);

        this.shootTimer += delta;
        this.spinTimer += delta;

        if (this.shootTimer > this.attackDelay) {
            this.shootTimer = 0;
            this.fireAimedShot(player);
        }

        if (this.spinTimer > 5000) {
            this.spinTimer = 0;
            this.fireSpinAttack();
        }
    }

    fireAimedShot(player) {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        this.bulletController.fireBullet(this.x, this.y, angle, this.bulletSpeed, this.damage, this);
    }

    fireSpinAttack() {
        // Fire 8 bullets in a circle
        for (let i = 0; i < 8; i++) {
            const angle = this.rotation + (i * (Math.PI / 4)); 
            this.bulletController.fireBullet(this.x, this.y, angle, this.bulletSpeed * 0.8, this.damage, this);
        }
    }

    teleportToPlayer(player) {
        this.isTeleporting = true;
        this.body.setVelocity(0);
        
        this.setTint(0xff0000);

        this.scene.time.delayedCall(1000, () => {
            if (!this.active) return;
            
            const offsetX = Phaser.Math.Between(-200, 200);
            const offsetY = Phaser.Math.Between(-200, 200);
            this.x = player.x + offsetX;
            this.y = player.y + offsetY;
            
            this.clearTint();
            this.isTeleporting = false;
            
            this.fireSpinAttack();
        });
    }

    takeDamage(amount) {
        this.hp -= amount;
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => this.clearTint());

        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        this.setActive(false);
        this.setVisible(false);
        this.body.stop();
        
        // Clear bullets fired by this boss
        this.bulletController.clearBulletsForOwner(this);

        // Big Explosion
        const emitter = this.scene.add.particles(this.x, this.y, 'particle', {
            speed: { min: 100, max: 300 },
            scale: { start: 4, end: 0 },
            lifespan: 1000,
            blendMode: 'ADD',
            emitting: false,
            tint: 0xff0000
        });
        emitter.explode(50);
        
        // TODO: Drop Mega XP Gem
    }
}