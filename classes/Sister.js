import { CONFIG } from "./Config.js";

export class Sister extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, bulletController = null) {
        super(scene, x, y, 'hina_idle');
        this.scene = scene;
        this.bulletController = bulletController;

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        this.setScale(CONFIG.FINAL_BOSS.SCALE || 1.8);
        this.body.setCircle(15, 10, 10);

        this.setImmovable(true);

        this.play('sis_idle');

        this.isBoss = !!bulletController;

        if (this.isBoss) {
            this.hp = CONFIG.FINAL_BOSS.HP;
            this.maxHp = CONFIG.FINAL_BOSS.HP;
            this.speed = CONFIG.FINAL_BOSS.SPEED;
            this.setTint(0xffaaaa);

            this.state = "CHASE";
            this.attackTimer = 0;
            this.phase = 1;
        }
    }

    update(time, delta) {
        if (!this.isBoss) {
            this.play('sis_idle', true);
            return;
        }

        if (!this.active || this.hp <= 0) return;

        const player = this.scene.player;
        if (!player.active) return;

        if (this.phase === 1 && this.hp < this.maxHp * CONFIG.FINAL_BOSS.PHASE_2_THRESHOLD) {
            this.enterPhase2();
        }

        if (player.x < this.x) {
            this.setFlipX(true);
        } else {
            this.setFlipX(false);
        }

        const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

        switch (this.state) {
            case "CHASE":
                if (dist > CONFIG.FINAL_BOSS.PREFERRED_DIST) {
                    this.scene.physics.moveToObject(this, player, this.speed);
                    this.play('sis_run', true);
                } else {
                    this.body.setVelocity(0);
                    this.state = "ATTACK";
                    this.attackTimer = 0; 
                }
                break;

            case "ATTACK":
                this.body.setVelocity(0); 
                this.play('sis_idle', true);

                this.attackTimer += delta;

                if (this.attackTimer > CONFIG.FINAL_BOSS.ATTACK_DELAY) {
                    this.attackTimer = 0;
                    this.chooseAttackPattern();

                    if (Math.random() > 0.7) {
                        this.state = "TELEPORT";
                    }
                }

                if (dist > CONFIG.FINAL_BOSS.PREFERRED_DIST * 1.5) {
                    this.state = "CHASE";
                }
                break;

            case "TELEPORT":
                this.performTeleport(player);
                break;

            case "IDLE":
                this.body.setVelocity(0);
                break;
        }
    }


    performTeleport(player) {
        // Prevent multiple teleports triggering at once
        if (this.isTeleporting) return;
        this.isTeleporting = true;

        this.body.setVelocity(0);
        this.state = "IDLE"; // Lock state

        // Fade Out
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                // Move position
                const angle = Math.random() * Math.PI * 2;
                const teleportDist = 250;
                this.x = player.x + Math.cos(angle) * teleportDist;
                this.y = player.y + Math.sin(angle) * teleportDist;

                // Fade In
                this.scene.tweens.add({
                    targets: this,
                    alpha: 1,
                    duration: 300,
                    onComplete: () => {
                        this.isTeleporting = false;
                        this.state = "ATTACK"; // Attack immediately
                        this.chooseAttackPattern();
                    }
                });
            }
        });
    }


    chooseAttackPattern() {
        const patterns = [
            () => this.patternSpiral(),
            () => this.patternRing(),
            () => this.patternWall(),
            () => this.patternFlower(),
            () => this.patternSniper(),
            () => this.patternScatter()
        ];

        const index = Phaser.Math.Between(0, patterns.length - 1);
        patterns[index]();

        if (this.phase === 2 && Math.random() > 0.5) {
            let index2 = Phaser.Math.Between(0, patterns.length - 1);
            if (index2 === index) index2 = (index2 + 1) % patterns.length;

            this.scene.time.delayedCall(700, () => {
                if (this.active) patterns[index2]();
            });
        }
    }

    patternSpiral() {
        let angle = 0;
        this.scene.time.addEvent({
            delay: 70,
            repeat: 20,
            callback: () => {
                if (!this.active) return;
                this.bulletController.fire(this.x, this.y, angle, CONFIG.FINAL_BOSS.BULLET_SPEED);
                this.bulletController.fire(this.x, this.y, angle + Math.PI, CONFIG.FINAL_BOSS.BULLET_SPEED);
                angle += 0.3;
            }
        });
    }

    patternRing() {
        const count = 24;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            this.bulletController.fire(this.x, this.y, angle, CONFIG.FINAL_BOSS.BULLET_SPEED * 0.8);
        }
    }

    patternWall() {
        if (!this.scene.player.active) return;
        const baseAngle = Phaser.Math.Angle.Between(this.x, this.y, this.scene.player.x, this.scene.player.y);
        for (let i = -2; i <= 2; i++) {
            const angle = baseAngle + (i * 0.2);
            this.bulletController.fire(this.x, this.y, angle, CONFIG.FINAL_BOSS.BULLET_SPEED * 1.2);
        }
    }
    patternFlower() {
        let rotationOffset = 0;
        const petals = 5; 

        this.scene.time.addEvent({
            delay: 100,
            repeat: 25, 
            callback: () => {
                if (!this.active) return;

                for (let i = 0; i < petals; i++) {
                    const angle = rotationOffset + (Math.PI * 2 / petals) * i;
                    this.bulletController.fire(this.x, this.y, angle, CONFIG.FINAL_BOSS.BULLET_SPEED);
                }

                rotationOffset += 0.2;
            }
        });
    }


    patternSniper() {
        if (!this.scene.player.active) return;


        const targetAngle = Phaser.Math.Angle.Between(this.x, this.y, this.scene.player.x, this.scene.player.y);

        this.scene.time.addEvent({
            delay: 60, 
            repeat: 12, 
            callback: () => {
                if (!this.active) return;
                this.bulletController.fire(this.x, this.y, targetAngle, CONFIG.FINAL_BOSS.BULLET_SPEED * 1.5);
            }
        });
    }

    patternScatter() {
        if (!this.scene.player.active) return;

        const baseAngle = Phaser.Math.Angle.Between(this.x, this.y, this.scene.player.x, this.scene.player.y);

        this.scene.time.addEvent({
            delay: 50,
            repeat: 15,
            callback: () => {
                if (!this.active) return;
                const spread = Phaser.Math.FloatBetween(-0.8, 0.8);
                const speedVar = Phaser.Math.FloatBetween(0.8, 1.2);

                this.bulletController.fire(
                    this.x,
                    this.y,
                    baseAngle + spread,
                    CONFIG.FINAL_BOSS.BULLET_SPEED * speedVar
                );
            }
        });
    }

    enterPhase2() {
        this.phase = 2;
        this.setTint(0xff0000);
        this.speed *= 1.5;
        CONFIG.FINAL_BOSS.ATTACK_DELAY /= 1.5;
        this.scene.cameras.main.shake(500, 0.01);
    }

    takeDamage(amount) {
        if (!this.isBoss) return;
        this.hp -= amount;
        this.setTintFill(0xffffff);
        this.scene.time.delayedCall(100, () => {
            if (this.active) {
                this.clearTint();
                if (this.phase === 2) this.setTint(0xff0000);
                else this.setTint(0xffaaaa);
            }
        });
        if (this.hp <= 0) this.die();
    }

    die() {
        this.setActive(false);
        this.setVisible(false);
        this.body.enable = false; 

        this.scene.scene.stop('UIScene');
        this.scene.add.text(this.scene.scale.width / 2, this.scene.scale.height / 2, "VICTORY", {
            fontSize: '64px', fill: '#00ff00'
        }).setOrigin(0.5).setScrollFactor(0);

        this.scene.time.delayedCall(3000, () => {
            this.scene.scene.start('MenuScene'); 
        });
    }
}