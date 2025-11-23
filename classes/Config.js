export const CONFIG = {
    PLAYER: {
        SPEED: 170,
        RUN_SPEED: 350,
        HEALTH: 150,
        KNOCKBACK_FORCE: 500,    
        IMMUNITY_DURATION: 2000, 
    },
    WEAPON: {
        FIRE_RATE: 120,
        BULLET_DMG: 10,
        RELOAD_SPD: 1000,
        AMMO: 30,
        BULLET_SPEED: 600,
        BULLET_LIFETIME: 9000
    },
    SKILLS: {
        GRENADE: { COOLDOWN: 3000, DMG_MULTIPLIER: 6, SIZE: 180, THROW_DIST: 300 },
        SHIELD: { COOLDOWN: 8000, DURATION: 5000 },
        OVERDRIVE: { COOLDOWN: 10000, DURATION: 4000, FIRE_RATE_MULTIPLIER: 0.5 },
        NUKE: { COOLDOWN: 40000, DAMAGE: 999, RADIUS: 50000 } 
    },
    ENEMIES: {
        BASE_SPAWN_RATE: 1200, 
        MIN_SPAWN_RATE: 100,   
        DIFFICULTY_STEP: 20000, 
        TYPES: {
            1: { KEY: 'Enemy_1', HP: 60, DMG: 40, SPEED: 100,  SCORE: 10,  }, 
            2: { KEY: 'Enemy_2', HP: 50, DMG: 30, SPEED: 180, SCORE: 20,  }, 
            3: { KEY: 'Enemy_3', HP: 170, DMG: 50, SPEED: 80, SCORE: 50,  }, 
            4: { KEY: 'Enemy_4', HP: 20, DMG: 60, SPEED: 250, SCORE: 30,  }  
        }
    },
    // NEW BOSS CONFIG
    BOSS: {
        MINION_TIME: 40000, 
        MAIN_TIME: 90000,   
        PUNISH_DIST: 700,   

        MINION: {
            KEY: 'minion', HP: 800, DMG: 50, SPEED: 70, SCALE: 3, SCORE: 1500, 
            BULLET_SPEED: 300, ATTACK_DELAY: 1800
        },
        MAIN: {
            KEY: 'Boss', HP: 6000, DMG: 100, SPEED: 50, SCALE: 4, SCORE: 5000,
            BULLET_SPEED: 400, ATTACK_DELAY: 1200
        }
    }
};