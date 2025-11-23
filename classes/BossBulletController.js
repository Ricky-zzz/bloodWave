import { Bullet } from "./Bullet.js";

export class BossBulletController {
    constructor(scene) {
        this.scene = scene;
        this.createBulletTexture();

        this.bulletGroup = this.scene.physics.add.group({
            classType: Bullet,
            maxSize: 200,
            runChildUpdate: true
        });
    }

    createBulletTexture() {
        if (this.scene.textures.exists('boss_bullet')) return;

        const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0xff0000, 1);
        graphics.fillCircle(6, 6, 6); 
        graphics.generateTexture('boss_bullet', 16, 16);
    }

    fireBullet(x, y, angle, speed, damage) {
        const bullet = this.bulletGroup.get();
        if (bullet) {
            bullet.setTexture('boss_bullet');
            bullet.fire(x, y, angle, speed, damage);
        }
    }
}