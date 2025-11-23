import { GameState } from "./GameState.js";
import { CONFIG } from "./Config.js";

// handles skills cd and activation so not to sphageti the player
export class SkillsManager {
    constructor(scene, statsManager) {
        this.scene = scene;
        this.stats = statsManager;
        this.state = GameState.skills;
        this.config = CONFIG.SKILLS;
    }

    // call every frame from scene.update(time, delta)
    update(time, delta) {
        const s = this.state;
        s.grenadeCooldown = Math.max(0, s.grenadeCooldown - delta);
        s.shieldCooldown = Math.max(0, s.shieldCooldown - delta);
        s.overdriveCooldown = Math.max(0, s.overdriveCooldown - delta);
        s.nukeCooldown = Math.max(0, s.nukeCooldown - delta);

        if (s.isShieldActive && time > s._shieldEndTime) {
            s.isShieldActive = false;
        }
        if (s.isOverdriveActive && time > s._overdriveEndTime) {
            s.isOverdriveActive = false;
        }
    }

    // Input wrappers (call these on keypress)
    useGrenade() {
        const s = this.state;
        if (s.grenadeCooldown > 0) return false;
        s.grenadeCooldown = this.config.GRENADE.COOLDOWN;
        // grenade dmg scales with bullet damage
        const dmg = this.stats.getBulletDamage() * this.config.GRENADE.DMG_MULTIPLIER;
        const radius = this.config.GRENADE.SIZE;
        // emit event so GameScene spawns an AoE effect
        this.scene.events.emit('skill:grenade', { x: this.scene.player.x, y: this.scene.player.y, dmg, radius });
        return true;
    }

    useShield(timeNow = 0) {
        const s = this.state;
        if (s.shieldCooldown > 0 || s.isShieldActive) return false;
        s.shieldCooldown = this.config.SHIELD.COOLDOWN;
        s.isShieldActive = true;
        const duration = this.config.SHIELD.DURATION;
        s._shieldEndTime = timeNow + duration;
        // optionally notify scene for VFX
        this.scene.events.emit('skill:shield:on');
        return true;
    }

    useOverdrive(timeNow = 0) {
        const s = this.state;
        if (s.overdriveCooldown > 0 || s.isOverdriveActive) return false;
        s.overdriveCooldown = this.config.OVERDRIVE.COOLDOWN;
        s.isOverdriveActive = true;
        const duration = this.config.OVERDRIVE.DURATION;
        s._overdriveEndTime = timeNow + duration;
        // apply immediate stat change
        this.stats.startOverdrive(duration, this.config.OVERDRIVE.FIRE_RATE_MULTIPLIER);
        this.scene.events.emit('skill:overdrive:on');
        return true;
    }

    useNuke() {
        const s = this.state;
        if (s.nukeCooldown > 0) return false;
        s.nukeCooldown = this.config.NUKE.COOLDOWN;
        // huge damage and radius
        const dmg = this.config.NUKE.DAMAGE;
        const radius = this.config.NUKE.RADIUS;
        this.scene.events.emit('skill:nuke', { x: this.scene.player.x, y: this.scene.player.y, dmg, radius });
        return true;
    }
}
