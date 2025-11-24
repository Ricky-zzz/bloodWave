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

        createUIAnimations(this);

        // heart 
        this.heart = this.add.sprite(20, 20, "heart").setOrigin(0, 0).setScale(1.5);
        this.heart.play("heart_pulse");
        this.hpText = this.add.text(100, 40, "100", {
            fontSize: "32px",
            fontFamily: "Arial",
            fontStyle: "bold",
            color: "#ffffff"
        });

        // bullet
        this.bulletIcon = this.add.sprite(20, 120, "bullet").setOrigin(0, 0).setScale(1.5);
        this.bulletIcon.play("bullet_anims");

        this.ammoText = this.add.text(100, 140, "30", {
            fontSize: "32px",
            fontFamily: "Arial",
            fontStyle: "bold",
            color: "#ffffff"
        });

        // --- SKILLS (icon ABOVE keycap) ---
        const baseY = height - 110;
        const startX = 120;
        const gap = 200;

        this.skillUI = {
            Grenade: this.createSkillSlot(startX, baseY, "grenade_icon", "c_key"),
            Shield: this.createSkillSlot(startX + gap, baseY, "shield_icon", "q_key"),
            Overdrive: this.createSkillSlot(startX + gap * 2, baseY, "power_icon", "e_key"),
            Nuke: this.createSkillSlot(startX + gap * 3, baseY, "nuke_icon", "z_key")
        };

        this.scoreText = this.add.text(
            width - 40,   
            20,           
            "Score: 0",
            {
                fontSize: "32px",
                fontFamily: "Arial",
                fontStyle: "bold",
                color: "#ffffff"
            }
        ).setOrigin(1, 0); 

        this.waveText = this.add.text(
            width - 40,
            70,
            "Wave: 1",
            {
                fontSize: "32px",
                fontFamily: "Arial",
                fontStyle: "bold",
                color: "#ffffff"
            }
        ).setOrigin(1, 0);

    }


    createSkillSlot(x, y, iconKey, keycapKey) {
        const skillImage = this.add.image(x, y - 0, iconKey)
            .setOrigin(0.5)
            .setScale(1);

        const keyImage = this.add.image(x, y + 55, keycapKey)
            .setOrigin(0.5)
            .setScale(1);
        return { keyImage, skillImage };
    }

    update() {
        this.updateHP();
        this.updateAmmo();
        this.scoreText.setText("Score: " + GameState.score);
        this.waveText.setText("Wave: " + GameState.wave);
        this.updateSkills();
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
