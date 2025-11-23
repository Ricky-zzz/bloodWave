// src/GameState.js
import { CONFIG } from "./Config.js";

/**
 * Runtime game state.
 * Player object holds current editable stats (copied from CONFIG).
 */
export const GameState = {
    score: 0,
    wave: 1,
    isPaused: false,

    // current player runtime stats (initialized from CONFIG)
    player: {
        hp: CONFIG.PLAYER.HEALTH,
        maxHP: CONFIG.PLAYER.HEALTH,
        speed: CONFIG.PLAYER.SPEED,
        runSpeed: CONFIG.PLAYER.RUN_SPEED,
        fireRate: CONFIG.WEAPON.FIRE_RATE,
        bulletDmg: CONFIG.WEAPON.BULLET_DMG,
        reloadSpeed: CONFIG.WEAPON.RELOAD_SPD,
        ammo: CONFIG.WEAPON.AMMO,
    },

    // skill runtime info (timers in ms)
    skills: {
        grenadeCooldown: 0,
        shieldCooldown: 0,
        overdriveCooldown: 0,
        nukeCooldown: 0,

        isShieldActive: false,
        isOverdriveActive: false,

        // internal end times (ms since epoch) set by SkillsManager
        _shieldEndTime: 0,
        _overdriveEndTime: 0,
    }
};
