import { CONFIG } from "./Config.js";

export const GameState = {
    score: 0,
    wave: 1,
    isPaused: false,

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

    skills: {
        grenadeCooldown: 0,
        shieldCooldown: 0,
        overdriveCooldown: 0,
        nukeCooldown: 0,

        isShieldActive: false,
        isOverdriveActive: false,
    },
};
