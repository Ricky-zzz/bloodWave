import { CONFIG } from "../classes/Config.js";
import { SoundManager } from "../utils/SoundManager.js";
import { GameState } from "./GameState.js";

export class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {

        super(scene, x, y, 'Enemy_1');
        this.scene = scene;
    }

    spawn(x, y, typeId) {
        this.body.reset(x, y);
        this.body.enable = true;
        this.enableBody(true, x, y, true, true);
        this.setActive(true);
        this.setVisible(true);
        this.setScale(1.5);
        this.clearTint();
        this.stop(); 

        const stats = CONFIG.ENEMIES.TYPES[typeId];
        
        this.setTexture(stats.KEY);

        if (typeId === 4) {
            this.play('Enemy4');
        }

        this.typeId = typeId;
        this.hp = stats.HP;
        this.damage = stats.DMG;
        this.moveSpeed = stats.SPEED;
        this.scoreValue = stats.SCORE;

        this.isCharging = false;
        this.chargeCooldown = 0;
        
        this.knockbackTimer = 0;
    }

    update(time, delta) {
        if (!this.active) return;

        if (this.knockbackTimer > 0) {
            this.knockbackTimer -= delta;
            return;
        }

        const player = this.scene.player;
        if (!player) return;

        const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

        if (this.typeId === 3) {
            if (this.isCharging) {

                return; 
            }

            if (dist < 200 && this.chargeCooldown <= 0) {
                this.startChargeAttack(player);
                return;
            }
            
            if (this.chargeCooldown > 0) this.chargeCooldown -= delta;
        }

        if (this.typeId === 4) {
            if (dist < 50) {
                this.explode(); 
                return;
            }
        }

        this.scene.physics.moveToObject(this, player, this.moveSpeed);
        
        if (player.x < this.x) this.setFlipX(true);
        else this.setFlipX(false);
    }

    receiveKnockback(vx, vy, duration) {
        this.body.velocity.x += vx;
        this.body.velocity.y += vy;
        this.knockbackTimer = duration;
    }

    startChargeAttack(player) {
        this.isCharging = true;
        this.body.setVelocity(0); 
        this.setTint(0xff0000);  

        this.scene.time.delayedCall(500, () => {
            if (!this.active) return;

            this.scene.physics.moveToObject(this, player, 500); 
            
            this.scene.time.delayedCall(500, () => {
                if (!this.active) return;
                this.isCharging = false;
                this.chargeCooldown = 3000; 
                this.setTint(CONFIG.ENEMIES.TYPES[3].COLOR); 
            });
        });
    }

    takeDamage(amount, skipDeathEffect = false) {
        this.hp -= amount;

        this.setTintFill(0xffffff);
        this.scene.time.delayedCall(100, () => {
            if (!this.active) return;
            this.clearTint();
            this.setTint(CONFIG.ENEMIES.TYPES[this.typeId].COLOR);
        });

        if (this.hp <= 0) {
            if (this.typeId === 4 && !skipDeathEffect) this.explode(); 
            else this.die();
        }
    }

    explode() {
        if (!this.active) return;
        SoundManager.play('explode');
        const explosion = this.scene.add.circle(this.x, this.y, 60, 0xff0000, 0.6);
        this.scene.tweens.add({ targets: explosion, scale: 2, alpha: 0, duration: 300, onComplete: () => explosion.destroy() });
        
        const dist = Phaser.Math.Distance.Between(this.x, this.y, this.scene.player.x, this.scene.player.y);
        if (dist < 100) {
            this.scene.stats.takeDamage(this.damage * 1.5); 
        }
        
        this.die();
    }

    die() {
        this.setActive(false);
        this.setVisible(false);
        this.body.enable = false;
        this.disableBody(true, false);
        this.body.stop();
        
        this.isCharging = false;
        this.knockbackTimer = 0;

        const emitter = this.scene.add.particles(this.x, this.y, 'particle', {
            speed: { min: 50, max: 200 },
            scale: { start: 1.5, end: 0 },
            lifespan: 500,
            blendMode: 'ADD',
            emitting: false
        });

        emitter.explode(15);

        this.scene.time.delayedCall(600, () => {
            emitter.destroy();
        });

        GameState.score += this.scoreValue;
    }
}