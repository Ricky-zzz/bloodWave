

export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "Dina_idle");
        this.scene = scene;

        this.keys = scene.input.keyboard.addKeys("W,A,S,D");
    }

    update() {
        if (!this.body) return;
        this.body.setVelocity(0);

        const dx = (this.keys.D.isDown ? 1 : 0) - (this.keys.A.isDown ? 1 : 0);
        const dy = (this.keys.S.isDown ? 1 : 0) - (this.keys.W.isDown ? 1 : 0);
        const isMoving = dx !== 0 || dy !== 0;
        const isFiring = this.scene.input.activePointer.isDown;

        const speed = isFiring ? this.scene.stats.getSpeed() : this.scene.stats.getRunSpeed();
        if (isMoving) {
            this.body.setVelocity(dx, dy);
            this.body.velocity.normalize().scale(speed);
        }


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
}
