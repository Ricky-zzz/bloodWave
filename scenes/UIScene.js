import { GameState } from "../classes/GameState.js";

export class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        // --- 1. HP DISPLAY ONLY (NO BAR) ---
        this.hpText = this.add.text(20, 20, "HP: 100", {
            fontSize: "36px",
            fontFamily: "Arial",
            fontStyle: "bold",
            color: "#ffffffff"
        });

        // --- 2. SKILL UI SETUP ---
        const baseY = height - 70;
        const startX = 70;
        const gap = 120;

        this.skillUI = {
            Grenade: this.createSkillBox(startX, baseY, "C", "Grenade"),
            Shield: this.createSkillBox(startX + gap, baseY, "Q", "Shield"),
            Overdrive: this.createSkillBox(startX + gap * 2, baseY, "E", "Overdrive"),
            Nuke: this.createSkillBox(startX + gap * 3, baseY, "Z", "Nuke")
        };
    }

    // Creates one skill box
    createSkillBox(x, y, key, name) {

        const box = this.add.rectangle(x, y, 60, 60, 0x222222)
            .setStrokeStyle(3, 0xffffff)
            .setOrigin(0.5);

        const insideText = this.add.text(x, y, key, {
            fontSize: "32px",
            fontFamily: "Arial",
            fontStyle: "bold",
            color: "#ffffff"
        }).setOrigin(0.5);

        const label = this.add.text(x, y + 45, name, {
            fontSize: "18px",
            fontFamily: "Arial",
            fontStyle: "bold",
            color: "#eeeeee"
        }).setOrigin(0.5);

        return { box, insideText, label, key };
    }

update(time, delta) {
    this.updateHP(time);
    this.updateSkills();
}


updateHP() {
    const hp = GameState.player.hp;
    this.hpText.setText(`HP: ${hp}`);

    // --- Moderate pulsing (same speed always) ---
    const pulse = (Math.sin(this.time.now * 0.004) + 1) / 2; // smooth 0..1

    // Base + pulse colors (dark red → bright red)
    const baseColor = 0x880000;
    const pulseColor = 0xff0000;

    const r = Phaser.Math.Interpolation.Linear([
        (baseColor >> 16) & 255,
        (pulseColor >> 16) & 255
    ], pulse);

    const g = Phaser.Math.Interpolation.Linear([
        (baseColor >> 8) & 255,
        (pulseColor >> 8) & 255
    ], pulse);

    const b = Phaser.Math.Interpolation.Linear([
        baseColor & 255,
        pulseColor & 255
    ], pulse);

    const finalColor = Phaser.Display.Color.GetColor(r, g, b);

    this.hpText.setColor("#" + finalColor.toString(16));
}


    updateSkills() {
        const skills = GameState.skills;

        this.updateSkillDisplay("Grenade", skills.grenadeTimer);
        this.updateSkillDisplay("Shield", skills.shieldTimer);
        this.updateSkillDisplay("Overdrive", skills.overdriveTimer);
        this.updateSkillDisplay("Nuke", skills.nukeTimer);
    }

    updateSkillDisplay(name, timer) {
        const ui = this.skillUI[name];

        if (!ui) return;

        if (timer > 0) {
            const sec = (timer / 1000).toFixed(1);
            ui.insideText.setText(sec);
            ui.insideText.setColor("#ff4444");
        } else {
            ui.insideText.setText(ui.key);
            ui.insideText.setColor("#ffffffff"); 
        }
    }
}
