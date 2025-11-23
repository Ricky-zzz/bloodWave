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

    fireBullet(x, y, angle, speed, damage, owner) {
        const bullet = this.bulletGroup.get();
        if (bullet) {
            bullet.owner = owner;
            bullet.setTexture('boss_bullet');
            // Pass 3000ms lifetime for boss bullets
            bullet.fire(x, y, angle, speed, damage, 3000);
        }
    }

    clearBulletsForOwner(owner) {
        this.bulletGroup.children.each(bullet => {
            if (bullet.active && bullet.owner === owner) {
                bullet.disableBody(true, true);
                
                // Optional: Add a small vanish effect
                if (this.scene.textures.exists('particle')) {
                    const emitter = this.scene.add.particles(bullet.x, bullet.y, 'particle', {
                        speed: 50,
                        scale: { start: 0.5, end: 0 },
                        lifespan: 200,
                        blendMode: 'ADD',
                        duration: 100
                    });
                    emitter.explode(4);
                }
            }
        });
    }
}