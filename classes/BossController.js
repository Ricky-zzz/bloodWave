import { Boss } from "./Boss.js";
import { BossBulletController } from "./BossBulletController.js";
import { CONFIG } from "./Config.js";

export class BossController {
  constructor(scene) {
    this.scene = scene;
    this.gameTime = 0;

    this.nextMinionSpawn = CONFIG.BOSS.MINION_TIME;
    this.nextBossSpawn = CONFIG.BOSS.MAIN_TIME;
    this.bulletController = new BossBulletController(scene);

    this.bossGroup = this.scene.physics.add.group({
      classType: Boss,
      runChildUpdate: true,
    });
  }

  update(time, delta) {
    this.gameTime += delta;

    if (this.gameTime > this.nextMinionSpawn) {
      this.spawnBoss(false); // isMain = false
      this.nextMinionSpawn += CONFIG.BOSS.MINION_TIME;
      console.log("MINION SPAWNED");
    }

    if (this.gameTime > this.nextBossSpawn) {
      this.spawnBoss(true); // isMain = true
      this.nextBossSpawn += CONFIG.BOSS.MAIN_TIME;
      console.log("BOSS SPAWNED");
    }
  }

  spawnBoss(isMain) {
    const cam = this.scene.cameras.main;
    const x = cam.scrollX + cam.width / 2;
    const y = cam.scrollY - 100;

    const boss = new Boss(this.scene, this.bulletController);
    this.bossGroup.add(boss);
    boss.spawn(x, y, isMain);
  }
}
