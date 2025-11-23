export const CONFIG = {
    PLAYER: {
        SPEED: 150,
        RUN_SPEED: 250,
        HEALTH: 100,
    },
    WEAPON: {
        FIRE_RATE: 200,
        BULLET_DMG: 10,
        RELOAD_SPD: 1000,
        AMMO: 30,
        BULLET_SPEED: 600,
        BULLET_LIFETIME: 1000
    },
    // ADD THIS SECTION
    SKILLS: {
        GRENADE: {
            COOLDOWN: 2000,
            DMG_MULTIPLIER: 3,
            SIZE: 100, 
            THROW_DIST: 400
        },
        SHIELD: {
            COOLDOWN: 8000,
            DURATION: 5000,
        },
        OVERDRIVE: {
            COOLDOWN: 10000,
            DURATION: 4000,
            FIRE_RATE_MULTIPLIER: 0.5
        },
        NUKE: {
            COOLDOWN: 40000,
            DAMAGE: 999,
            RADIUS: 10000
        }
    }
};