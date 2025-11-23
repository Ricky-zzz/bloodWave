import { CONFIG } from "../classes/Config.js";

export class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {

        super(scene, x, y, 'Enemy_1');
        this.scene = scene;
    }

    spawn(x, y, typeId) {
        // Reset Physics
        this.body.reset(x, y);
        this.setActive(true);
        this.setVisible(true);
        this.setScale(1.5);
        this.clearTint();

        // Get Stats
        const stats = CONFIG.ENEMIES.TYPES[typeId];
        
        this.setTexture(stats.KEY);

        this.typeId = typeId;
        this.hp = stats.HP;
        this.damage = stats.DMG;
        this.moveSpeed = stats.SPEED;
        this.scoreValue = stats.SCORE;

        // AI State for Heavy Enemy
        this.isCharging = false;
        this.chargeCooldown = 0;
    }

    update(time, delta) {
        if (!this.active) return;

        const player = this.scene.player;
        if (!player) return;

        const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

        // --- TYPE 3: HEAVY CHARGER AI ---
        if (this.typeId === 3) {
            if (this.isCharging) {
                // Currently dashing, ignore steering
                return; 
            }

            if (dist < 200 && this.chargeCooldown <= 0) {
                this.startChargeAttack(player);
                return;
            }
            
            if (this.chargeCooldown > 0) this.chargeCooldown -= delta;
        }

        // --- TYPE 4: EXPLODER AI ---
        if (this.typeId === 4) {
            if (dist < 50) {
                this.explode(); // Self destruct if too close
                return;
            }
        }

        // --- STANDARD MOVEMENT (All types do this unless charging) ---
        this.scene.physics.moveToObject(this, player, this.moveSpeed);
        
        // Sprite Flipping
        if (player.x < this.x) this.setFlipX(true);
        else this.setFlipX(false);
    }

    startChargeAttack(player) {
        this.isCharging = true;
        this.body.setVelocity(0); // Stop moving
        this.setTint(0xff0000);   // Blink Red Warning

        // 1. Charge Up (Wait 500ms)
        this.scene.time.delayedCall(500, () => {
            if (!this.active) return;
            
            // 2. Dash towards LAST KNOWN location
            this.scene.physics.moveToObject(this, player, 500); // High speed dash
            
            // 3. Stop Dashing after 500ms
            this.scene.time.delayedCall(500, () => {
                if (!this.active) return;
                this.isCharging = false;
                this.chargeCooldown = 3000; // Wait 3s before next charge
                this.setTint(CONFIG.ENEMIES.TYPES[3].COLOR); // Restore Blue
            });
        });
    }

    takeDamage(amount, skipDeathEffect = false) {
        this.hp -= amount;
        
        // Hit Flash
        this.setTintFill(0xffffff);
        this.scene.time.delayedCall(100, () => {
            if (!this.active) return;
            this.clearTint();
            // Restore type color
            this.setTint(CONFIG.ENEMIES.TYPES[this.typeId].COLOR);
        });

        if (this.hp <= 0) {
            if (this.typeId === 4 && !skipDeathEffect) this.explode(); // Exploder blows up on death
            else this.die();
        }
    }

    explode() {
        if (!this.active) return;
        // Visual
        const explosion = this.scene.add.circle(this.x, this.y, 60, 0xff0000, 0.6);
        this.scene.tweens.add({ targets: explosion, scale: 2, alpha: 0, duration: 300, onComplete: () => explosion.destroy() });
        
        // Damage Player if close
        const dist = Phaser.Math.Distance.Between(this.x, this.y, this.scene.player.x, this.scene.player.y);
        if (dist < 100) {
            this.scene.stats.takeDamage(this.damage * 1.5); // Boom hurts more
        }
        
        this.die();
    }

    die() {
        this.setActive(false);
        this.setVisible(false);
        this.body.stop();

        // Particle Explosion
        // Create an emitter at the enemy's position
        const emitter = this.scene.add.particles(this.x, this.y, 'particle', {
            speed: { min: 50, max: 200 },
            scale: { start: 1.5, end: 0 },
            lifespan: 500,
            blendMode: 'ADD',
            emitting: false
        });

        emitter.explode(15);

        // Clean up the emitter after particles are gone
        this.scene.time.delayedCall(600, () => {
            emitter.destroy();
        });

        // TODO: Spawn XP Gem here
    }
}