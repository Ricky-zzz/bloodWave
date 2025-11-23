import { Boss } from "./Boss.js";
import { BossBulletController } from "./BossBulletController.js";
import { CONFIG } from "./Config.js";

export class BossController {
    constructor(scene) {
        this.scene = scene;
        this.gameTime = 0;
        this.minionSpawned = false;
        this.bossSpawned = false;

        // Controller for Red Bullets
        this.bulletController = new BossBulletController(scene);

        // Group for Bosses
        this.bossGroup = this.scene.physics.add.group({
            classType: Boss,
            runChildUpdate: true
        });
    }

    update(time, delta) {
        this.gameTime += delta;

        // Check Minion Spawn (40s)
        if (!this.minionSpawned && this.gameTime > CONFIG.BOSS.MINION_TIME) {
            this.spawnBoss(false); // isMain = false
            this.minionSpawned = true;
            console.log("MINION SPAWNED");
        }

        // Check Main Boss Spawn (90s)
        if (!this.bossSpawned && this.gameTime > CONFIG.BOSS.MAIN_TIME) {
            this.spawnBoss(true); // isMain = true
            this.bossSpawned = true;
            console.log("BOSS SPAWNED");
        }
    }

    spawnBoss(isMain) {
        // Spawn slightly off screen top
        const cam = this.scene.cameras.main;
        const x = cam.scrollX + cam.width / 2;
        const y = cam.scrollY - 100;

        // Create specific instance manually passing the bullet controller
        const boss = new Boss(this.scene, this.bulletController);
        this.bossGroup.add(boss);
        boss.spawn(x, y, isMain);
    }
}