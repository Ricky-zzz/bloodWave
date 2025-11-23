// src/managers/PlayerStatsManager.js
import { GameState } from "./GameState.js";
import { CONFIG } from "./Config.js";

/**
 * PlayerStatsManager
 * - centralizes reads/writes to GameState.player
 * - applies temporary/permanent modifications safely
 */
export class PlayerStatsManager {
    constructor(scene) {
        this.scene = scene;
        this.state = GameState.player;
        this.config = CONFIG;
        this.fireRateMultiplier = 1.0;
    }

    // re-initialize from CONFIG (useful on new run)
    resetFromConfig() {
        this.state.maxHP = this.config.PLAYER.HEALTH;
        this.state.hp = this.state.maxHP;
        this.state.speed = this.config.PLAYER.SPEED;
        this.state.runSpeed = this.config.PLAYER.RUN_SPEED;
        this.state.fireRate = this.config.WEAPON.FIRE_RATE;
        this.state.bulletDmg = this.config.WEAPON.BULLET_DMG;
        this.state.reloadSpeed = this.config.WEAPON.RELOAD_SPD;
        this.state.ammo = this.config.WEAPON.AMMO;
    }

    // getters used by other systems
    getSpeed() { return this.state.speed; }
    getRunSpeed() { return this.state.runSpeed; }
    getFireRate() { // current effective fire rate (ms)
        return this.state.fireRate * this.fireRateMultiplier;
    }
    getBulletDamage() { return this.state.bulletDmg; }

    // damage/heal
    takeDamage(amount) {
        // if shield active, ignore
        if (GameState.skills.isShieldActive) return false;
        this.state.hp = Math.max(0, this.state.hp - amount);
        return this.state.hp <= 0;
    }

    heal(amount) {
        this.state.hp = Math.min(this.state.maxHP, this.state.hp + amount);
    }

    addMaxHP(amount, alsoHeal = true) {
        this.state.maxHP += amount;
        if (alsoHeal) this.state.hp = this.state.maxHP;
    }

    // permanent upgrades (called by level-up)
    applyBrutality() {
        this.state.bulletDmg += 2;
        // faster fire: reduce delay by 10%
        this.state.fireRate = Math.max(20, Math.floor(this.state.fireRate * 0.9));
    }
    applyTactics() {
        this.state.speed += 20;
        this.state.runSpeed += 20;
        this.state.reloadSpeed = Math.max(50, Math.floor(this.state.reloadSpeed * 0.9));
    }
    applySurvivability() {
        this.addMaxHP(20, true);
    }

    // temporary buffs from skills
    startOverdrive(durationMs, multiplier = 0.5) {
        // Set the multiplier (0.5 means firing twice as fast)
        this.fireRateMultiplier = multiplier;
        
        // Schedule revert back to 1.0
        this.scene.time.delayedCall(durationMs, () => {
            this.fireRateMultiplier = 1.0;
        });
    }

    activateShield(durationMs) {
        // nothing to change in stats, shield logic checked where damage occurs
        // but we can schedule an automatic end if desired
        this.scene.time.delayedCall(durationMs, () => {
            // SkillsManager will flip GameState.skills.isShieldActive = false
        });
    }
}
