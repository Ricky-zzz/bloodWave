// src/classes/GameState.js
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
        maxAmmo: CONFIG.WEAPON.AMMO,
        ammo: CONFIG.WEAPON.AMMO,
        bullletKnockback: CONFIG.WEAPON.BULLET_KNOCKBACK,
        expCap: CONFIG.PLAYER.EXP_CAP,
        exp: 0,
    },

    skills: {
        grenadeTimer: 0,
        shieldTimer: 0,
        overdriveTimer: 0,
        nukeTimer: 0,

        isShieldActive: false,
        isOverdriveActive: false,
        _shieldEndTime: 0,
        _overdriveEndTime: 0,

        grenadeMaxCooldown: CONFIG.SKILLS.GRENADE.COOLDOWN,
        grenadeDmgMult: CONFIG.SKILLS.GRENADE.DMG_MULTIPLIER,
        grenadeRadius: CONFIG.SKILLS.GRENADE.SIZE,
        grenadeDist: CONFIG.SKILLS.GRENADE.THROW_DIST,

        shieldMaxCooldown: CONFIG.SKILLS.SHIELD.COOLDOWN,
        shieldDuration: CONFIG.SKILLS.SHIELD.DURATION,

        overdriveMaxCooldown: CONFIG.SKILLS.OVERDRIVE.COOLDOWN,
        overdriveDuration: CONFIG.SKILLS.OVERDRIVE.DURATION,
        overdriveRateMult: CONFIG.SKILLS.OVERDRIVE.FIRE_RATE_MULTIPLIER,

        nukeMaxCooldown: CONFIG.SKILLS.NUKE.COOLDOWN,
        nukeDmg: CONFIG.SKILLS.NUKE.DAMAGE,
        nukeRadius: CONFIG.SKILLS.NUKE.RADIUS,
    },
};