// src/classes/SkillsManager.js
import { GameState } from "./GameState.js";

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
        this.shieldVisual.lineStyle(4, 0x00ffff, 1); 
        this.shieldVisual.fillStyle(0x00ffff, 0.1); 
        this.shieldVisual.fillCircle(0, 0, 60);
        this.shieldVisual.strokeCircle(0, 0, 60);
        this.shieldVisual.setVisible(false);
        this.shieldVisual.setDepth(10); 
    }

    update(time, delta) {
        const s = this.state;

        // 1. Handle Cooldowns (Using the runtime Timers)
        s.grenadeTimer = Math.max(0, s.grenadeTimer - delta);
        s.shieldTimer = Math.max(0, s.shieldTimer - delta);
        s.overdriveTimer = Math.max(0, s.overdriveTimer - delta);
        s.nukeTimer = Math.max(0, s.nukeTimer - delta);

        // 2. Handle Duration Expiry
        if (s.isShieldActive && time > s._shieldEndTime) s.isShieldActive = false;
        if (s.isOverdriveActive && time > s._overdriveEndTime) s.isOverdriveActive = false;

        // --- VISUAL UPDATES ---
        if (s.isShieldActive) {
            this.shieldVisual.setVisible(true);
            this.shieldVisual.x = this.player.x;
            this.shieldVisual.y = this.player.y;
            this.shieldVisual.rotation += 0.02; 
        } else {
            this.shieldVisual.setVisible(false);
        }

        if (s.isOverdriveActive) {
            this.player.setTint(0xff0000); 
        } else {
            this.player.clearTint();
        }
    }

    // --- SKILL ACTIONS ---

    useGrenade() {
        const s = this.state; // This is GameState.skills
        
        if (s.grenadeTimer > 0) return false;
        
        // USE STAT: Set timer based on current MaxCooldown (Upgradeable)
        s.grenadeTimer = s.grenadeMaxCooldown;

        const startX = this.player.x;
        const startY = this.player.y;
        const pointer = this.scene.input.activePointer;
        const angle = Phaser.Math.Angle.Between(startX, startY, pointer.worldX, pointer.worldY);
        
        // USE STAT: Throw distance
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
            ease: 'Power2',
            onComplete: () => {
                grenade.destroy();
                // USE STATS: Pass Radius and Damage Multiplier to the explosion logic
                this.triggerGrenadeExplosion(targetX, targetY, s.grenadeRadius, s.grenadeDmgMult);
            }
        });

        return true;
    }

    triggerGrenadeExplosion(x, y, radius, dmgMult) {
        // Logic uses the passed stats
        const visualScale = radius / 10; 

        const explosion = this.scene.add.circle(x, y, 10, 0xffffff, 0.8);
        this.scene.tweens.add({
            targets: explosion,
            scale: visualScale, 
            alpha: 0, 
            duration: 300,
            onComplete: () => explosion.destroy()
        });

        console.log(`Grenade Boom: Radius ${radius}, Multiplier ${dmgMult}`);
        // Later: Apply Damage = BaseDamage * dmgMult
    }

    useShield(timeNow) {
        const s = this.state;
        if (s.shieldTimer > 0 || s.isShieldActive) return false;
        
        // USE STAT: Cooldown
        s.shieldTimer = s.shieldMaxCooldown;
        
        s.isShieldActive = true;
        
        // USE STAT: Duration
        s._shieldEndTime = timeNow + s.shieldDuration;
        
        return true;
    }

    useOverdrive(timeNow) {
        const s = this.state;
        if (s.overdriveTimer > 0 || s.isOverdriveActive) return false;

        // USE STAT: Cooldown
        s.overdriveTimer = s.overdriveMaxCooldown;
        
        s.isOverdriveActive = true;
        
        // USE STAT: Duration
        s._overdriveEndTime = timeNow + s.overdriveDuration;

        // USE STAT: Apply the multiplier (e.g., 0.5)
        // This sends the current upgrade level to PlayerStatsManager
        this.stats.startOverdrive(s.overdriveDuration, s.overdriveRateMult);

        // Visual
        const burst = this.scene.add.circle(this.player.x, this.player.y, 50, 0xff0000, 0.5);
        this.scene.tweens.add({
            targets: burst,
            scale: 2,
            alpha: 0,
            duration: 500,
            onComplete: () => burst.destroy()
        });

        return true;
    }

    useNuke() {
        const s = this.state;
        if (s.nukeTimer > 0) return false;

        s.nukeTimer = s.nukeMaxCooldown;

        this.scene.cameras.main.flash(4000, 255, 255, 255);
        this.scene.cameras.main.shake(1000, 0.1);

        // USE STATS: Damage and Radius
        console.log(`Nuke: Dmg ${s.nukeDmg}, Radius ${s.nukeRadius}`);
        return true;
    }
}