import { GameState } from "./GameState.js";

export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "Dina_idle");

        this.walkSpeed = GameState.player.SPEED; 
        this.runSpeed = GameState.player.RUN_SPEED; 
        
        this.keys = scene.input.keyboard.addKeys("W,A,S,D");
    }

    update() {
        if (!this.body) return;

        this.body.setVelocity(0);

        let dx = 0;
        let dy = 0;

        if (this.keys.A.isDown) {
            dx = -1;
        } else if (this.keys.D.isDown) {
            dx = 1;
        }

        if (this.keys.W.isDown) {
            dy = -1;
        } else if (this.keys.S.isDown) {
            dy = 1;
        }

        const isFiring = this.scene.input.activePointer.isDown;
        const isMoving = (dx !== 0 || dy !== 0);

        let currentSpeed = this.runSpeed;

        if (isFiring) {
            currentSpeed = this.walkSpeed;
        }

        if (isMoving) {
            this.body.setVelocity(dx, dy);
            this.body.velocity.normalize().scale(currentSpeed);
        }

        if (isFiring) {
            const pointer = this.scene.input.activePointer;
            const angle = Phaser.Math.Angle.Between(
                this.x, this.y,
                pointer.worldX, pointer.worldY
            );
            this.setFlipX(angle > Math.PI / 2 || angle < -Math.PI / 2);
        } else if (isMoving) {
            if (dx < 0) {
                this.setFlipX(true); 
            } else if (dx > 0) {
                this.setFlipX(false); 
            }
        }

        if (isMoving) {
            if (isFiring) {
                this.play("player_walk", true);
            } else {
                this.play("player_run", true);
            }
        } else {
            this.play("player_idle", true);
        }
    }
}