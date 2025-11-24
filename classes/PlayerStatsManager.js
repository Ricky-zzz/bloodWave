// src/managers/PlayerStatsManager.js
import { GameState } from "./GameState.js";
import { CONFIG } from "./Config.js";
import { SoundManager } from "../utils/SoundManager.js";

export class PlayerStatsManager {
    constructor(scene) {
        this.scene = scene;
        this.state = GameState.player;
        this.config = CONFIG;
        this.fireRateMultiplier = 1.0;
        this.lastHitTime = 0;
    }
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

    getSpeed() { return this.state.speed; }
    getRunSpeed() { return this.state.runSpeed; }
    getFireRate() { 
        return this.state.fireRate * this.fireRateMultiplier;
    }
    getBulletDamage() { return this.state.bulletDmg; }

    takeDamage(amount) {
        const time = this.scene.time.now;

        if (GameState.skills.isShieldActive) return false;
        if (time < this.lastHitTime + CONFIG.PLAYER.IMMUNITY_DURATION) return false;
        this.state.hp = Math.max(0, this.state.hp - amount);
        this.lastHitTime = time;
        SoundManager.play('hurt');

        this.scene.tweens.add({
            targets: this.scene.player,
            alpha: 0.2,
            yoyo: true,
            repeat: 5,
            duration: 100
        });

        return this.state.hp <= 0; 
    }

    heal(amount) {
        this.state.hp = Math.min(this.state.maxHP, this.state.hp + amount);
    }

    addMaxHP(amount, alsoHeal = true) {
        this.state.maxHP += amount;
        if (alsoHeal) this.state.hp = this.state.maxHP;
    }

    applyBrutality() {
        this.state.bulletDmg += 2;
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

    startOverdrive(durationMs, multiplier = 0.5) {
        this.fireRateMultiplier = multiplier;
        
        this.scene.time.delayedCall(durationMs, () => {
            this.fireRateMultiplier = 1.0;
        });
    }

    activateShield(durationMs) {
        this.scene.time.delayedCall(durationMs, () => {
        });
    }
}
