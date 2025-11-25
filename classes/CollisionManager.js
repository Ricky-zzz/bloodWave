import { CONFIG } from "./Config.js";
import { GameState } from "./GameState.js";
import { SoundManager } from "../utils/SoundManager.js";

export class CollisionManager {
    constructor(scene) {
        this.scene = scene;
    }

    setup() {
        const s = this.scene; 

        // B v E
        s.physics.add.overlap(s.bulletController.bulletGroup, s.enemyController.enemies, (bullet, enemy) => {
            if (enemy.active && bullet.active) {
                bullet.disableBody(true, true);
                this.applyKnockback(enemy, s.player.x, s.player.y, GameState.player.bullletKnockback);
                enemy.takeDamage(s.stats.getBulletDamage());
                SoundManager.play('damage');
            }
        });

        //E v P
        s.physics.add.collider(s.player, s.enemyController.enemies, (player, enemy) => {
            this.handlePlayerHit(enemy.damage, enemy.x, enemy.y);
            if (enemy.active) {
                enemy.body.velocity.x = -enemy.body.velocity.x;
                enemy.body.velocity.y = -enemy.body.velocity.y;
            }
        });

        // b vs B
        s.physics.add.overlap(s.bulletController.bulletGroup, s.bossController.bossGroup, (bullet, boss) => {
            if (boss.active && bullet.active) {
                bullet.disableBody(true, true);
                boss.takeDamage(s.stats.getBulletDamage());
                SoundManager.play('damage');
            }
        });

        // 4.B v P
        s.physics.add.collider(s.player, s.bossController.bossGroup, (player, boss) => {
            this.handlePlayerHit(boss.damage, boss.x, boss.y);
        });

        // 5. Bbullet vs P
        s.physics.add.overlap(s.player, s.bossController.bulletController.bulletGroup, (player, bullet) => {
            if (bullet.active) {
                bullet.disableBody(true, true);
                this.handlePlayerHit(bullet.damage, bullet.x, bullet.y);
            }
        });
    }

    applyKnockback(entity, sourceX, sourceY, force) {
        const angle = Phaser.Math.Angle.Between(sourceX, sourceY, entity.x, entity.y);
        const vx = Math.cos(angle) * force;
        const vy = Math.sin(angle) * force;

        if (typeof entity.receiveKnockback === 'function') {
            entity.receiveKnockback(vx, vy, 200);
        } else {
            entity.body.velocity.x += vx;
            entity.body.velocity.y += vy;
        }
    }

    handlePlayerHit(damage, sourceX, sourceY) {
        const s = this.scene;
        if (!s.player.active) return;

        const prevHp = s.stats.state.hp;
        const isDead = s.stats.takeDamage(damage);

        if (s.stats.state.hp < prevHp) {
            const angle = Phaser.Math.Angle.Between(sourceX, sourceY, s.player.x, s.player.y);
            const force = CONFIG.PLAYER.KNOCKBACK_FORCE;
            s.player.applyKnockback(Math.cos(angle) * force, Math.sin(angle) * force, 200);
        }

        if (isDead) s.triggerPlayerDeath();
    }

    damageEnemiesInArea(x, y, radius, damage, affectBosses = true, skipDeathEffect = false) {
        const enemies = this.scene.enemyController.enemies.getChildren();
        enemies.forEach(enemy => {
            if (enemy.active && Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y) <= radius) {
                enemy.takeDamage(damage, skipDeathEffect);
            }
        });

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