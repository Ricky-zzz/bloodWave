import { GameState } from "../classes/GameState.js";
import { CONFIG } from "../classes/Config.js";

export class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        // --- 1. HEALTH BAR SETUP ---
        // We use Graphics for the bar because it's dynamic
        this.hpBar = this.add.graphics();
        
        // Add a text label next to the bar
        this.hpText = this.add.text(20, 20, "HP", {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });

        // --- 2. SKILL COOLDOWN SETUP ---
        // We create a container or just list them at the bottom
        const skillY = height - 50;
        const startX = 50;
        const gap = 100;

        // Helper to create skill text
        this.createSkillDisplay(startX, skillY, "C", "Grenade");
        this.createSkillDisplay(startX + gap, skillY, "Q", "Shield");
        this.createSkillDisplay(startX + gap * 2, skillY, "E", "Overdrive");
        this.createSkillDisplay(startX + gap * 3, skillY, "Z", "Nuke");

        // Store references to the dynamic text objects so we can update them
        this.skillTexts = {
            Grenade: this.add.text(startX, skillY - 20, "", { fontSize: '14px', fill: '#fff' }),
            Shield: this.add.text(startX + gap, skillY - 20, "", { fontSize: '14px', fill: '#fff' }),
            Overdrive: this.add.text(startX + gap * 2, skillY - 20, "", { fontSize: '14px', fill: '#fff' }),
            Nuke: this.add.text(startX + gap * 3, skillY - 20, "", { fontSize: '14px', fill: '#fff' })
        };
    }

    createSkillDisplay(x, y, key, name) {
        // Draw the Key Box (Static)
        this.add.rectangle(x, y, 50, 50, 0x333333).setStrokeStyle(2, 0xffffff);
        this.add.text(x, y, key, { fontSize: '24px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(x, y + 35, name, { fontSize: '12px', fill: '#aaa' }).setOrigin(0.5);
    }

    update() {
        // --- UPDATE HEALTH BAR ---
        this.updateHealthBar();

        // --- UPDATE SKILLS ---
        this.updateSkillTimer("Grenade", GameState.skills.grenadeTimer);
        this.updateSkillTimer("Shield", GameState.skills.shieldTimer);
        this.updateSkillTimer("Overdrive", GameState.skills.overdriveTimer);
        this.updateSkillTimer("Nuke", GameState.skills.nukeTimer);
    }

    updateHealthBar() {
        this.hpBar.clear();

        const x = 60;
        const y = 20;
        const w = 200;
        const h = 20;

        // 1. Background (Black)
        this.hpBar.fillStyle(0x000000);
        this.hpBar.fillRect(x, y, w, h);

        // 2. Health Fill (Red)
        const hpPercent = Phaser.Math.Clamp(GameState.player.hp / GameState.player.maxHP, 0, 1);
        
        // Color changes based on HP (Green -> Yellow -> Red)
        if (hpPercent > 0.5) this.hpBar.fillStyle(0x00ff00);
        else if (hpPercent > 0.25) this.hpBar.fillStyle(0xffff00);
        else this.hpBar.fillStyle(0xff0000);

        this.hpBar.fillRect(x, y, w * hpPercent, h);

        // 3. Border (White)
        this.hpBar.lineStyle(2, 0xffffff);
        this.hpBar.strokeRect(x, y, w, h);
    }

    updateSkillTimer(name, timer) {
        const textObj = this.skillTexts[name];
        
        if (timer > 0) {
            // Convert ms to seconds (e.g., 2500ms -> 2.5)
            const seconds = (timer / 1000).toFixed(1);
            textObj.setText(seconds);
            textObj.setColor('#ff0000'); // Red when on cooldown
        } else {
            textObj.setText("READY");
            textObj.setColor('#00ff00'); // Green when ready
        }
    }
}