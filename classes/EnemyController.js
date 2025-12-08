import { Enemy } from "./Enemy.js";
import { CONFIG } from "./Config.js";
import { GameState } from "./GameState.js";

export class EnemyController {
    constructor(scene) {
        this.scene = scene;
        
        this.enemies = this.scene.physics.add.group({
            classType: Enemy,
            maxSize: 200,
            runChildUpdate: true
        });

        this.spawnDelay = CONFIG.ENEMIES.BASE_SPAWN_RATE;
        this.spawnTimer = 0;
        this.difficultyTimer = 0;
    }

    update(time, delta) {
        this.spawnTimer += delta;
        this.difficultyTimer += delta;

        if (this.difficultyTimer > CONFIG.ENEMIES.DIFFICULTY_STEP) {
            this.difficultyTimer = 0;
            this.spawnDelay = Math.max(CONFIG.ENEMIES.MIN_SPAWN_RATE, this.spawnDelay * 0.9);
            GameState.wave += 1;
        }

        if (this.spawnTimer > this.spawnDelay) {
            this.spawnTimer = 0;
            this.spawnEnemy();
        }
    }

    spawnEnemy() {
        const enemy = this.enemies.get();
        if (enemy) {
            // 1. Randomize Type
            const rand = Math.random();
            let typeId = 1;
            if (rand > 0.8) typeId = 4; 
            else if (rand > 0.6) typeId = 3; 
            else if (rand > 0.4) typeId = 2; 

            const cam = this.scene.cameras.main;
            const padding = 60; 
            

            let x = Phaser.Math.Between(cam.scrollX + 50, cam.scrollX + cam.width - 50);

            let y = cam.scrollY - padding;

            y -= Phaser.Math.Between(0, 100);

            enemy.spawn(x, y, typeId);
        }
    }
}