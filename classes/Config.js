export const CONFIG = {
    PLAYER: {
        SPEED: 150,
        RUN_SPEED: 250,
        HEALTH: 100,
        KNOCKBACK_FORCE: 500,    
        IMMUNITY_DURATION: 1000, 
    },
    WEAPON: {
        FIRE_RATE: 200,
        BULLET_DMG: 10,
        RELOAD_SPD: 1000,
        AMMO: 30,
        BULLET_SPEED: 600,
        BULLET_LIFETIME: 1000
    },
    SKILLS: {
        GRENADE: { COOLDOWN: 2000, DMG_MULTIPLIER: 3, SIZE: 120, THROW_DIST: 400 },
        SHIELD: { COOLDOWN: 8000, DURATION: 5000 },
        OVERDRIVE: { COOLDOWN: 10000, DURATION: 4000, FIRE_RATE_MULTIPLIER: 0.5 },
        NUKE: { COOLDOWN: 40000, DAMAGE: 999, RADIUS: 10000 } 
    },
    ENEMIES: {
        BASE_SPAWN_RATE: 1200, 
        MIN_SPAWN_RATE: 100,   
        DIFFICULTY_STEP: 20000, 
        

        TYPES: {
            1: { KEY: 'Enemy_1', HP: 40, DMG: 10, SPEED: 90,  SCORE: 10, COLOR: 0xffffff }, 
            2: { KEY: 'Enemy_2', HP: 30, DMG: 15, SPEED: 160, SCORE: 20, COLOR: 0xffffff }, 
            3: { KEY: 'Enemy_3', HP: 120, DMG: 25, SPEED: 60, SCORE: 50, COLOR: 0xffffff }, 
            4: { KEY: 'Enemy_4', HP: 20, DMG: 40, SPEED: 200, SCORE: 30, COLOR: 0xffffff }  
        }
    }
};