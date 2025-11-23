export const CONFIG = {
    PLAYER: {
        SPEED: 150,
        RUN_SPEED: 300,
        HEALTH: 100,
    },

    WEAPON: {
        FIRE_RATE: 100,
        BULLET_SPEED: 600,
        BULLET_LIFETIME: 2000,
        BULLET_DMG: 1,
        SPREAD: 0.1,
        AMMO: 36,
        RELOAD_SPD: 6,
    },

    SKILLS: {
        GRENADE: {
            COOLDOWN: 8000,      
            SIZE: 30,            
            DMG_MULTIPLIER: 12,   
        },

        SHIELD: {
            COOLDOWN: 12000,
            DURATION: 4_000,      
        },

        OVERDRIVE: { 
            COOLDOWN: 10000,
            DURATION: 3_000,
            FIRE_RATE_MULTIPLIER: 0.5, 
        },

        NUKE: {
            COOLDOWN: 20000,
            DAMAGE: 99999,         
            RADIUS: 500,           
        },
    },

    ENEMY1: {
        SPEED: 100,
        DAMAGE: 10,
    },
};
