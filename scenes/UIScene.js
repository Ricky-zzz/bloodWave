import { GameState } from "../classes/GameState.js";
import { createUIAnimations } from "../utils/animations.js";

export class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    preload() {
        this.load.image('c_key', 'assets/imgs/stats/c.png');
        this.load.image('q_key', 'assets/imgs/stats/q.png');
        this.load.image('e_key', 'assets/imgs/stats/e.png');
        this.load.image('z_key', 'assets/imgs/stats/z.png');
        this.load.image('grenade_icon', 'assets/imgs/stats/grenade.png');
        this.load.image('shield_icon', 'assets/imgs/stats/shield.png');
        this.load.image('power_icon', 'assets/imgs/stats/power.png');
        this.load.image('nuke_icon', 'assets/imgs/stats/nuke.png');
        this.load.spritesheet("heart", "assets/imgs/stats/heart.png", {
            frameWidth: 48,
            frameHeight: 48
        });

        this.load.spritesheet("bullet", "assets/imgs/stats/bullet.png", {
            frameWidth: 48,
            frameHeight: 48
        });
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;
        const scaleFactor = Math.min(width / 1920, height / 1080);

        createUIAnimations(this);

        this.heart = this.add.sprite(20 * scaleFactor, 20 * scaleFactor, "heart")
            .setOrigin(0, 0)
            .setScale(1.5 * scaleFactor);
        this.heart.play("heart_pulse");

        this.hpText = this.add.text(100 * scaleFactor, 40 * scaleFactor, "100", {
            fontSize: `${32 * scaleFactor}px`,
            fontFamily: "Arial",
            fontStyle: "bold",
            color: "#ffffff"
        });

        this.bulletIcon = this.add.sprite(20 * scaleFactor, 120 * scaleFactor, "bullet")
            .setOrigin(0, 0)
            .setScale(1.5 * scaleFactor);
        this.bulletIcon.play("bullet_anims");

        this.ammoText = this.add.text(100 * scaleFactor, 140 * scaleFactor, "30", {
            fontSize: `${32 * scaleFactor}px`,
            fontFamily: "Arial",
            fontStyle: "bold",
            color: "#ffffff"
        });

        const baseY = height - 110 * scaleFactor;
        const startX = 120 * scaleFactor;
        const gap = 200 * scaleFactor;

        this.skillUI = {
            Grenade: this.createSkillSlot(startX, baseY, "grenade_icon", "c_key", scaleFactor),
            Shield: this.createSkillSlot(startX + gap, baseY, "shield_icon", "q_key", scaleFactor),
            Overdrive: this.createSkillSlot(startX + gap * 2, baseY, "power_icon", "e_key", scaleFactor),
            Nuke: this.createSkillSlot(startX + gap * 3, baseY, "nuke_icon", "z_key", scaleFactor)
        };


        this.timerText = this.add.text(
            width - 40 * scaleFactor,
            -5 * scaleFactor,
            "00:00",
            {
                fontSize: `${48 * scaleFactor}px`, 
                fontFamily: "Arial",
                fontStyle: "bold",
                color: "#ffffff"
            }
        ).setOrigin(1, 0);

        this.elapsedTime = 0; 

        this.scoreText = this.add.text(
            width - 40 * scaleFactor,
            50 * scaleFactor,
            "Score: 0",
            {
                fontSize: `${32 * scaleFactor}px`,
                fontFamily: "Arial",
                fontStyle: "bold",
                color: "#ffffff"
            }
        ).setOrigin(1, 0);

        this.waveText = this.add.text(
            width - 40 * scaleFactor,
            100 * scaleFactor,
            "Wave: 1",
            {
                fontSize: `${32 * scaleFactor}px`,
                fontFamily: "Arial",
                fontStyle: "bold",
                color: "#ffffff"
            }
        ).setOrigin(1, 0);
    }

    createSkillSlot(x, y, iconKey, keycapKey, scaleFactor) {
        const skillImage = this.add.image(x, y, iconKey)
            .setOrigin(0.5)
            .setScale(1 * scaleFactor);

        const keyImage = this.add.image(x, y + 55 * scaleFactor, keycapKey)
            .setOrigin(0.5)
            .setScale(1 * scaleFactor);

        return { keyImage, skillImage };
    }

    update() {
        this.updateHP();
        this.updateAmmo();
        this.updateTimer();

        this.scoreText.setText("Score: " + GameState.score);
        this.waveText.setText("Wave: " + GameState.wave);

        this.updateSkills();
    }

    updateTimer() {
        this.elapsedTime += this.game.loop.delta / 1000; 

        const totalSeconds = Math.floor(this.elapsedTime);
        GameState.seconds = totalSeconds;
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
        const seconds = (totalSeconds % 60).toString().padStart(2, "0");

        this.timerText.setText(`${minutes}:${seconds}`);
    }

    updateHP() {
        const hp = GameState.player.hp;
        this.hpText.setText(hp);
    }

    updateAmmo() {
        const ammo = GameState.player.ammo;
        this.ammoText.setText(ammo);

        if (ammo <= 0) this.ammoText.setColor("#ff0000");
        else if (ammo < GameState.player.maxAmmo * 0.3) this.ammoText.setColor("#ffff00");
        else this.ammoText.setColor("#ffffff");
    }

    updateSkills() {
        const skills = GameState.skills;

        this.updateSkillCooldown("Grenade", skills.grenadeTimer);
        this.updateSkillCooldown("Shield", skills.shieldTimer);
        this.updateSkillCooldown("Overdrive", skills.overdriveTimer);
        this.updateSkillCooldown("Nuke", skills.nukeTimer);
    }

    updateSkillCooldown(name, timer) {
        const slot = this.skillUI[name];

        if (!slot) return;

        if (timer > 0) {
            slot.skillImage.setAlpha(0.3);
            slot.keyImage.setAlpha(0.3);
        } else {
            slot.skillImage.setAlpha(1);
            slot.keyImage.setAlpha(1);
        }
    }
}
