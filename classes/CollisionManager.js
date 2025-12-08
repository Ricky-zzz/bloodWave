import { CONFIG } from "./Config.js";
import { GameState } from "./GameState.js";
import { SoundManager } from "../utils/SoundManager.js";

export class CollisionManager {
    constructor(scene) {
        this.scene = scene;
    }

    setup() {
        const s = this.scene;

        // MAP COLLISIONS 
        if (s.mapManager) {
            if (s.mapManager.trees) {
                s.physics.add.collider(s.player, s.mapManager.trees);
            }
            if (s.mapManager.borderGroup) {
                s.physics.add.collider(s.player, s.mapManager.borderGroup);
            }
        }

        if (s.enemyController) {
            s.physics.add.overlap(s.bulletController.bulletGroup, s.enemyController.enemies, (bullet, enemy) => {
                if (enemy.active && bullet.active) {
                    bullet.disableBody(true, true);
                    this.applyKnockback(enemy, s.player.x, s.player.y, GameState.player.bullletKnockback);
                    enemy.takeDamage(s.stats.getBulletDamage());
                    SoundManager.play('damage');
                }
            });

            s.physics.add.collider(s.player, s.enemyController.enemies, (player, enemy) => {
                if (!enemy.active) return;
                this.handlePlayerHit(enemy.damage, enemy.x, enemy.y);
                // Simple bounce
                enemy.body.velocity.x = -enemy.body.velocity.x;
                enemy.body.velocity.y = -enemy.body.velocity.y;
            });
        }

        //  MINIONS/BOSSES 
        if (s.bossController) {
            s.physics.add.overlap(s.bulletController.bulletGroup, s.bossController.bossGroup, (bullet, boss) => {
                if (boss.active && bullet.active) {
                    bullet.disableBody(true, true);
                    boss.takeDamage(s.stats.getBulletDamage());
                    SoundManager.play('damage');
                }
            });

            s.physics.add.collider(s.player, s.bossController.bossGroup, (player, boss) => {
                if (!boss.active) return;
                this.handlePlayerHit(boss.damage, boss.x, boss.y);
            });

            if (s.bossController.bulletController) {
                s.physics.add.overlap(s.player, s.bossController.bulletController.bulletGroup, (player, bullet) => {
                    if (bullet.active) {
                        bullet.disableBody(true, true);
                        this.handlePlayerHit(bullet.damage, bullet.x, bullet.y);
                    }
                });
            }
        }

        // sister
        if (s.sister && s.sister.isBoss) {

            s.physics.add.overlap(s.bulletController.bulletGroup, s.sister, (sister, bullet) => {
                if (bullet.active && sister.active) {
                    bullet.disableBody(true, true);
                    sister.takeDamage(s.stats.getBulletDamage());
                }
            });

            if (s.sisterBulletController) {
                s.physics.add.overlap(s.player, s.sisterBulletController.bulletGroup, (player, bullet) => {
                    if (bullet.active) {
                        bullet.disableBody(true, true);
                        this.handlePlayerHit(bullet.damage, bullet.x, bullet.y);
                    }
                });
            }

            s.physics.add.collider(s.player, s.sister, (player, sister) => {
                if (!sister.active) return;
                this.handlePlayerHit(30, sister.x, sister.y);
            });
        }
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
            SoundManager.play('hurt');

            const angle = Phaser.Math.Angle.Between(sourceX, sourceY, s.player.x, s.player.y);
            const force = CONFIG.PLAYER.KNOCKBACK_FORCE;
            s.player.applyKnockback(Math.cos(angle) * force, Math.sin(angle) * force, 200);
        }

        if (isDead) s.triggerPlayerDeath();
    }

    damageEnemiesInArea(x, y, radius, damage, affectBosses = true, skipDeathEffect = false) {
        if (this.scene.enemyController) {
            const enemies = this.scene.enemyController.enemies.getChildren();
            enemies.forEach(enemy => {
                if (enemy.active && Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y) <= radius) {
                    enemy.takeDamage(damage, skipDeathEffect);
                }
            });
        }

        if (affectBosses && this.scene.bossController) {
            const bosses = this.scene.bossController.bossGroup.getChildren();
            bosses.forEach(boss => {
                if (boss.active && Phaser.Math.Distance.Between(x, y, boss.x, boss.y) <= radius) {
                    boss.takeDamage(damage);
                }
            });
        }

        if (affectBosses && this.scene.sister && this.scene.sister.active) {
            const sister = this.scene.sister;
            if (Phaser.Math.Distance.Between(x, y, sister.x, sister.y) <= radius) {
                sister.takeDamage(damage);
            }
        }
    }
}