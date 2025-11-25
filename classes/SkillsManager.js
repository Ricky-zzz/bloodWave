import { GameState } from "./GameState.js";
import { SoundManager } from "../utils/SoundManager.js";

export class SkillsManager {
  constructor(scene, statsManager, player) {
    this.scene = scene;
    this.stats = statsManager;
    this.player = player;
    this.state = GameState.skills;
    this.createVisualAssets();
  }

  createVisualAssets() {
    this.shieldVisual = this.scene.add.graphics();
    this.shieldVisual.lineStyle(4, 0x00ff00, 1);
    this.shieldVisual.fillStyle(0x00ff00, 0.1);
    this.shieldVisual.fillCircle(0, 0, 60);
    this.shieldVisual.strokeCircle(0, 0, 60);
    this.shieldVisual.setVisible(false);
    this.shieldVisual.setDepth(10);
  }

  update(time, delta) {
    const s = this.state;
    s.grenadeTimer = Math.max(0, s.grenadeTimer - delta);
    s.shieldTimer = Math.max(0, s.shieldTimer - delta);
    s.overdriveTimer = Math.max(0, s.overdriveTimer - delta);
    s.nukeTimer = Math.max(0, s.nukeTimer - delta);

    if (s.isShieldActive && time > s._shieldEndTime) s.isShieldActive = false;
    if (s.isOverdriveActive && time > s._overdriveEndTime)
      s.isOverdriveActive = false;

    if (s.isShieldActive) {
      this.shieldVisual.setVisible(true);
      this.shieldVisual.x = this.player.x;
      this.shieldVisual.y = this.player.y;
      this.shieldVisual.rotation += 0.2;
    } else {
      this.shieldVisual.setVisible(false);
    }

    if (s.isOverdriveActive) {
      this.player.setTint(0xff0000);
    } else {
      this.player.clearTint();
    }
  }

  resetCooldowns() {
    const s = this.state;
    s.grenadeTimer = 0;
    s.shieldTimer = 0;
    s.overdriveTimer = 0;
    s.nukeTimer = 0;
  }

  useGrenade() {
    const s = this.state;

    if (s.grenadeTimer > 0) return false;

    s.grenadeTimer = s.grenadeMaxCooldown;
    const startX = this.player.x;
    const startY = this.player.y;
    const pointer = this.scene.input.activePointer;
    const angle = Phaser.Math.Angle.Between(
      startX,
      startY,
      pointer.worldX,
      pointer.worldY
    );

    const dist = s.grenadeDist;
    const targetX = startX + Math.cos(angle) * dist;
    const targetY = startY + Math.sin(angle) * dist;

    const grenade = this.scene.add.circle(startX, startY, 8, 0xffffff, 1);
    this.scene.physics.add.existing(grenade);

    this.scene.tweens.add({
      targets: grenade,
      x: targetX,
      y: targetY,
      duration: 400,
      ease: "Power2",
      onComplete: () => {
        grenade.destroy();
        this.triggerGrenadeExplosion(
          targetX,
          targetY,
          s.grenadeRadius,
          s.grenadeDmgMult
        );
      },
    });

    return true;
  }

  triggerGrenadeExplosion(x, y, radius, dmgMult) {
    const visualScale = radius / 10;
    SoundManager.play("explode");

    const explosion = this.scene.add.circle(x, y, 10, 0xffffff, 0.8);
    this.scene.tweens.add({
      targets: explosion,
      scale: visualScale,
      alpha: 0,
      duration: 300,
      onComplete: () => explosion.destroy(),
    });
    const baseDmg = this.stats.getBulletDamage();
    const totalDmg = baseDmg * dmgMult;
    this.scene.damageEnemiesInArea(x, y, radius, totalDmg);
  }

  useShield(timeNow) {
    const s = this.state;
    if (s.shieldTimer > 0 || s.isShieldActive) return false;

    s.shieldTimer = s.shieldMaxCooldown;

    s.isShieldActive = true;
    SoundManager.play("shield");
    s._shieldEndTime = timeNow + s.shieldDuration;

    return true;
  }

  useOverdrive(timeNow) {
    const s = this.state;
    if (s.overdriveTimer > 0 || s.isOverdriveActive) return false;

    s.overdriveTimer = s.overdriveMaxCooldown;
    s.isOverdriveActive = true;
    s._overdriveEndTime = timeNow + s.overdriveDuration;
    this.stats.startOverdrive(s.overdriveDuration, s.overdriveRateMult);
    SoundManager.play("powerup");

    const burst = this.scene.add.circle(
      this.player.x,
      this.player.y,
      50,
      0xff0000,
      0.5
    );
    this.scene.tweens.add({
      targets: burst,
      scale: 2,
      alpha: 0,
      duration: 500,
      onComplete: () => burst.destroy(),
    });

    return true;
  }

  useNuke() {
    const s = this.state;
    if (s.nukeTimer > 0) return false;

    s.nukeTimer = s.nukeMaxCooldown;
    this.scene.cameras.main.flash(4000, 255, 255, 255);
    this.scene.cameras.main.shake(1000, 0.1);
    SoundManager.play("nuke");

    this.scene.events.emit("skill:nuke", {
      dmg: s.nukeDmg,
      radius: s.nukeRadius,
    });
    return true;
  }
}
