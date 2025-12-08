export const CONFIG = {
    PLAYER: {
        SPEED: 170,
        RUN_SPEED: 350,
        HEALTH: 200,
        KNOCKBACK_FORCE: 600,
        IMMUNITY_DURATION: 1000,
        EXP_CAP: 2000,
    },
    WEAPON: {
        FIRE_RATE: 250,
        BULLET_DMG: 32,
        RELOAD_SPD: 1000,
        AMMO: 12,
        BULLET_SPEED: 600,
        BULLET_LIFETIME: 3000,
        BULLET_KNOCKBACK: 30,
    },
    SKILLS: {
        GRENADE: { COOLDOWN: 3000, DMG_MULTIPLIER: 6, SIZE: 180, THROW_DIST: 300 },
        SHIELD: { COOLDOWN: 8000, DURATION: 5000 },
        OVERDRIVE: { COOLDOWN: 10000, DURATION: 4000, FIRE_RATE_MULTIPLIER: 0.5 },
        NUKE: { COOLDOWN: 40000, DAMAGE: 999, RADIUS: 50000 },
        TELEPORT: { COOLDOWN: 3000, DISTANCE: 300, IMMUNITY: 500 }
    },
    MAP: {
        FOREST_WIDTH: 1600,
        FOREST_HEIGHT: 5000,

        ARENA_WIDTH: 1280,
        ARENA_HEIGHT: 1200,
    },
    ENEMIES: {
        SPAWN_AHEAD_DIST: 700,
        BASE_SPAWN_RATE: 1600,
        MIN_SPAWN_RATE: 100,
        DIFFICULTY_STEP: 30000,
        TYPES: {
            1: { KEY: 'Enemy_1', HP: 60, DMG: 40, SPEED: 100, SCORE: 20, },
            2: { KEY: 'Enemy_2', HP: 50, DMG: 30, SPEED: 180, SCORE: 30, },
            3: { KEY: 'Enemy_3', HP: 170, DMG: 50, SPEED: 70, SCORE: 60, },
            4: { KEY: 'Enemy_4', HP: 40, DMG: 50, SPEED: 260, SCORE: 20, }
        }
    },
    BOSS: {
        MINION_TIME: 40000,
        MAIN_TIME: 90000,
        PUNISH_DIST: 700,

        MINION: {
            KEY: 'minion', HP: 1200, DMG: 50, SPEED: 70, SCALE: 3, SCORE: 1500,
            BULLET_SPEED: 300, ATTACK_DELAY: 1800
        },
        MAIN: {
            KEY: 'Boss', HP: 2400, DMG: 100, SPEED: 50, SCALE: 4, SCORE: 5000,
            BULLET_SPEED: 400, ATTACK_DELAY: 1200
        }
    }
};