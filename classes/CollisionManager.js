import { CONFIG } from "./Config.js";

export class CollisionManager {
    constructor(scene) {
        this.scene = scene;
    }

    setup() {
        const s = this.scene; // Short reference

        // 1. Bullet vs Enemy
        s.physics.add.overlap(s.bulletController.bulletGroup, s.enemyController.enemies, (bullet, enemy) => {
            if (enemy.active && bullet.active) {
                bullet.disableBody(true, true);
                this.applyKnockback(enemy, s.player.x, s.player.y, 100);
                enemy.takeDamage(s.stats.getBulletDamage());
            }
        });

        // 2. Enemy vs Player
        s.physics.add.collider(s.player, s.enemyController.enemies, (player, enemy) => {
            this.handlePlayerHit(enemy.damage, enemy.x, enemy.y);
            if (enemy.active) {
                // Bounce enemy
                enemy.body.velocity.x = -enemy.body.velocity.x;
                enemy.body.velocity.y = -enemy.body.velocity.y;
            }
        });

        // 3. Bullet vs Boss
        s.physics.add.overlap(s.bulletController.bulletGroup, s.bossController.bossGroup, (bullet, boss) => {
            if (boss.active && bullet.active) {
                bullet.disableBody(true, true);
                boss.takeDamage(s.stats.getBulletDamage());
            }
        });

        // 4. Boss Body vs Player
        s.physics.add.collider(s.player, s.bossController.bossGroup, (player, boss) => {
            this.handlePlayerHit(boss.damage, boss.x, boss.y);
        });

        // 5. Boss Bullet vs Player
        s.physics.add.overlap(s.player, s.bossController.bulletController.bulletGroup, (player, bullet) => {
            if (bullet.active) {
                bullet.disableBody(true, true);
                this.handlePlayerHit(bullet.damage, bullet.x, bullet.y);
            }
        });
    }

    applyKnockback(entity, sourceX, sourceY, force) {
        const angle = Phaser.Math.Angle.Between(sourceX, sourceY, entity.x, entity.y);
        entity.body.velocity.x += Math.cos(angle) * force;
        entity.body.velocity.y += Math.sin(angle) * force;
    }

    handlePlayerHit(damage, sourceX, sourceY) {
        const s = this.scene;
        if (!s.player.active) return;

        const prevHp = s.stats.state.hp;
        const isDead = s.stats.takeDamage(damage);

        // Apply Player Knockback if damage taken
        if (s.stats.state.hp < prevHp) {
            const angle = Phaser.Math.Angle.Between(sourceX, sourceY, s.player.x, s.player.y);
            const force = CONFIG.PLAYER.KNOCKBACK_FORCE;
            s.player.applyKnockback(Math.cos(angle) * force, Math.sin(angle) * force, 200);
        }

        if (isDead) s.triggerPlayerDeath();
    }

    damageEnemiesInArea(x, y, radius, damage, affectBosses = true, skipDeathEffect = false) {
        // Hit Regular Enemies
        const enemies = this.scene.enemyController.enemies.getChildren();
        enemies.forEach(enemy => {
            if (enemy.active && Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y) <= radius) {
                enemy.takeDamage(damage, skipDeathEffect);
            }
        });

        // Hit Bosses
        if (affectBosses) {
            const bosses = this.scene.bossController.bossGroup.getChildren();
            bosses.forEach(boss => {
                if (boss.active && Phaser.Math.Distance.Between(x, y, boss.x, boss.y) <= radius) {
                    boss.takeDamage(damage);
                }
            });
        }
    }
}