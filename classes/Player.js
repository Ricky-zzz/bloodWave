import { CONFIG } from "./Config.js";
import { GameState } from "./GameState.js";
import { SoundManager } from "../utils/SoundManager.js";

export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "Dina_idle");
        this.scene = scene;

        this.keys = scene.input.keyboard.addKeys("W,A,S,D");
        
        this.scene.physics.add.existing(this);
        this.body.setDrag(1000); 
        
        this.isKnockedBack = false;
        this._wasRightDown = false;
    }

    update() {
        if (!this.body) return;

        if (this.isKnockedBack) {
            return; 
        }
        // tp
        const pointer = this.scene.input.activePointer;
        const isRightDown = pointer.rightButtonDown && pointer.rightButtonDown();
        const s = GameState.skills;
        const timeNow = this.scene.time.now;

        if (isRightDown && !this._wasRightDown) {
            if (!(s.tpTimer > 0)) {
                try { this.scene.effects.playTeleportPuff(this.x, this.y); } catch (e) {}

                const angle = Phaser.Math.Angle.Between(this.x, this.y, pointer.worldX, pointer.worldY);
                const dist = s.tpDist || CONFIG.SKILLS.TELEPORT.DISTANCE;
                const targetX = this.x + Math.cos(angle) * dist;
                const targetY = this.y + Math.sin(angle) * dist;

                this.setPosition(targetX, targetY);
                if (this.body) this.body.reset(targetX, targetY);

                try { this.scene.effects.playTeleportPuff(targetX, targetY); } catch (e) {}

                GameState.player.postTeleportImmuneUntil = timeNow + (s.tpImmunity || CONFIG.SKILLS.TELEPORT.IMMUNITY);
                s.tpTimer = s.tpMaxCooldown || CONFIG.SKILLS.TELEPORT.COOLDOWN;

                try { SoundManager.play('powerup'); } catch (e) {}

                this.scene.tweens.add({
                    targets: this,
                    alpha: 0.4,
                    yoyo: true,
                    duration: 120,
                    repeat: 1
                });

            }
        }
        this._wasRightDown = !!isRightDown;
        this.body.setVelocity(0);

        const dx = (this.keys.D.isDown ? 1 : 0) - (this.keys.A.isDown ? 1 : 0);
        const dy = (this.keys.S.isDown ? 1 : 0) - (this.keys.W.isDown ? 1 : 0);
        const isMoving = dx !== 0 || dy !== 0;
        const isFiring = pointer.leftButtonDown && pointer.leftButtonDown();

        const speed = isFiring ? this.scene.stats.getSpeed() : this.scene.stats.getRunSpeed();
        
        if (isMoving) {
            this.body.setVelocity(dx, dy);
            this.body.velocity.normalize().scale(speed);
        }

        if (isFiring) {
            const p = this.scene.input.activePointer;
            const angle = Phaser.Math.Angle.Between(this.x, this.y, p.worldX, p.worldY);
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

    applyKnockback(forceX, forceY, duration = 200) {
        this.isKnockedBack = true;
        this.body.setVelocity(forceX, forceY);
    
        this.setTint(0xff0000);
        this.scene.time.delayedCall(duration, () => {
            this.isKnockedBack = false;
            this.clearTint();
        });
    }
}