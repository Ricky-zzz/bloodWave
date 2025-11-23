import { CONFIG } from "./Config.js";

export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "Dina_idle");
        this.scene = scene;

        this.keys = scene.input.keyboard.addKeys("W,A,S,D");
        
        // Add drag so the player slides to a stop naturally instead of floating
        this.scene.physics.add.existing(this);
        this.body.setDrag(1000); 
        
        this.isKnockedBack = false;
    }

    update() {
        if (!this.body) return;

        // 1. HIT STUN LOGIC
        // If we are currently being knocked back, DO NOT process WASD inputs.
        // Let the physics engine handle the sliding.
        if (this.isKnockedBack) {
            // Optional: Play a hurt animation here
            return; 
        }

        // 2. Reset Velocity (Only if not knocked back)
        this.body.setVelocity(0);

        // 3. Input Logic (Standard Movement)
        const dx = (this.keys.D.isDown ? 1 : 0) - (this.keys.A.isDown ? 1 : 0);
        const dy = (this.keys.S.isDown ? 1 : 0) - (this.keys.W.isDown ? 1 : 0);
        const isMoving = dx !== 0 || dy !== 0;
        const isFiring = this.scene.input.activePointer.isDown;

        const speed = isFiring ? this.scene.stats.getSpeed() : this.scene.stats.getRunSpeed();
        
        if (isMoving) {
            this.body.setVelocity(dx, dy);
            this.body.velocity.normalize().scale(speed);
        }

        // 4. Animation Logic
        if (isFiring) {
            const pointer = this.scene.input.activePointer;
            const angle = Phaser.Math.Angle.Between(this.x, this.y, pointer.worldX, pointer.worldY);
            this.setFlipX(angle > Math.PI / 2 || angle < -Math.PI / 2);
        } else if (isMoving) {
            if (dx < 0) this.setFlipX(true);
            else if (dx > 0) this.setFlipX(false);
        }

        if (isMoving) {
            if (isFiring) this.play("player_walk", true);
            else this.play("player_run", true);
        } else {
            this.play("player_idle", true);
        }
    }

    // Call this from GameScene when hit
    applyKnockback(forceX, forceY, duration = 200) {
        this.isKnockedBack = true;
        
        // Apply the physics force
        this.body.setVelocity(forceX, forceY);
        
        // Tint red for feedback
        this.setTint(0xff0000);

        // After a short delay, give control back to the player
        this.scene.time.delayedCall(duration, () => {
            this.isKnockedBack = false;
            this.clearTint();
        });
    }
}