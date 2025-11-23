import { Bullet } from "./Bullet.js";
import { CONFIG } from "./Config.js";

export class BulletController {
    constructor(scene,statsManager) {
        this.scene = scene;
        this.stats = statsManager;
        this.lastFired = 0;

        this.createBulletTexture();

        this.bulletGroup = this.scene.physics.add.group({
            classType: Bullet,
            maxSize: 300, 
            runChildUpdate: true 
        });
    }

    createBulletTexture() {
        if (this.scene.textures.exists('bullet_texture')) return;

        const width = 60; 
        const height = 10;
        const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
        
        graphics.fillStyle(0xfff7e6, 1); 
        
        const wedgeConnectX = 38; 
        const topY = height * 0.2; 
        const bottomY = height * 0.8; 
        const wedgeHeight = bottomY - topY; 
        const headWidth = width - wedgeConnectX; 

        graphics.beginPath();
        graphics.moveTo(0, height / 2); 
        graphics.lineTo(wedgeConnectX, topY); 
        graphics.lineTo(wedgeConnectX, bottomY); 
        graphics.closePath();
        graphics.fillPath();
        
        graphics.fillRect(wedgeConnectX, topY, headWidth, wedgeHeight); 

        graphics.generateTexture('bullet_texture', width, height);
    }

    shoot(x, y, angle) {
        const time = this.scene.time.now;
        const currentFireRate = this.stats.getFireRate()

        if (time > this.lastFired + currentFireRate) {
            
            const bullet = this.bulletGroup.get();

            if (bullet) {                 
                const barrelLen = 65; 
                const spawnX = x + Math.cos(angle) * barrelLen;
                const spawnY = y + Math.sin(angle) * barrelLen - 5;
                
                bullet.fire(spawnX, spawnY, angle, CONFIG.WEAPON.BULLET_SPEED);              
                
                this.lastFired = time;
            }
        }
    }
}