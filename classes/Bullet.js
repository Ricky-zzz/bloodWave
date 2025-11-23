import { CONFIG } from "./Config.js";

export class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet_texture');
    }

    fire(x, y, angle, speed) {
        this.enableBody(true, x, y, true, true);

        this.setActive(true);
        this.setVisible(true);

        this.setRotation(angle);
        
        this.scene.physics.velocityFromRotation(angle, speed, this.body.velocity);
        
        this.bornTime = this.scene.time.now;
    }

    update(time, delta) {
        if (!this.scene.cameras.main.worldView.contains(this.x, this.y)) {
            this.disableBody(true, true); 
        }
        
        if (this.scene.time.now > this.bornTime + CONFIG.WEAPON.BULLET_LIFETIME) {
             this.disableBody(true, true);
        }
    }
}