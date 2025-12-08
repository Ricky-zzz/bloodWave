import { Bullet } from "./Bullet.js"; 
import { CONFIG } from "./Config.js";

export class SisterBulletController {
    constructor(scene) {
        this.scene = scene;
        
        this.createBulletTexture();

        this.bulletGroup = this.scene.physics.add.group({
            classType: Bullet,
            maxSize: 1000, 
            runChildUpdate: true 
        });
    }

    createBulletTexture() {
        if (this.scene.textures.exists('sister_bullet')) return;

        const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
        
        graphics.fillStyle(0xffffff, 1); 
        graphics.fillCircle(8, 8, 4);  
        
        graphics.lineStyle(2, 0xff0000, 1); 
        graphics.strokeCircle(8, 8, 7);

        graphics.generateTexture('sister_bullet', 16, 16);
    }

    fire(x, y, angle, speed) {
        const bullet = this.bulletGroup.get();

        if (bullet) {
            bullet.setTexture('sister_bullet');
            
            const damage = CONFIG.FINAL_BOSS.DMG; 
            
            bullet.fire(x, y, angle, speed, damage);
        }
    }
}