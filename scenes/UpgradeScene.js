export class UpgradeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UpgradeScene' });
    }

    create() {
        const { width, height } = this.scale;

        this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);

        this.add.text(width / 2, height * 0.15, "LEVEL UP!", {
            fontSize: '64px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.add.text(width / 2, height * 0.22, "Choose an Upgrade", {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#cccccc'
        }).setOrigin(0.5);

        const upgrades = [
            {
                title: "BRUTALITY",
                color: 0xff4444,
                description: "Increase Bullet Damage\and Fire Rate",
                action: 'applyBrutality'
            },
            {
                title: "TACTICS",
                color: 0x4444ff,
                description: "Increase Move Speed\nIncrease Reload Speed",
                action: 'applyTactics'
            },
            {
                title: "SURVIVAL",
                color: 0x44ff44,
                description: "Increase Max HP\nFull Heal",
                action: 'applySurvivability'
            }
        ];

        const startX = width / 2;
        const spacing = 350;

        upgrades.forEach((data, index) => {
            const xPos = startX + (index - 1) * spacing;
            
            this.createUpgradeCard(xPos, height / 2, data);
        });
    }

    createUpgradeCard(x, y, data) {
        const container = this.add.container(x, y);

        const cardW = 300;
        const cardH = 400;

        const bg = this.add.rectangle(0, 0, cardW, cardH, 0x222222)
            .setStrokeStyle(4, data.color);

        const title = this.add.text(0, -120, data.title, {
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#' + data.color.toString(16).padStart(6, '0')
        }).setOrigin(0.5);

        const desc = this.add.text(0, 20, data.description, {
            fontSize: '24px',
            align: 'center',
            color: '#ffffff',
            wordWrap: { width: cardW - 40 }
        }).setOrigin(0.5);

        const btnText = this.add.text(0, 140, "[ SELECT ]", {
            fontSize: '20px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        container.add([bg, title, desc, btnText]);

        
        bg.setInteractive({ useHandCursor: true });

        bg.on('pointerover', () => {
            this.tweens.add({
                targets: container,
                scale: 1.1,
                duration: 100,
                ease: 'Sine.easeInOut'
            });
            bg.setFillStyle(0x444444);
        });

        bg.on('pointerout', () => {
            this.tweens.add({
                targets: container,
                scale: 1,
                duration: 100,
                ease: 'Sine.easeInOut'
            });
            bg.setFillStyle(0x222222);
        });

        bg.on('pointerdown', () => {
            this.applyUpgrade(data.action);
        });
    }

    applyUpgrade(actionMethod) {
        let activeScene = this.scene.get('GameScene');
        
        if (!activeScene.scene.isActive('GameScene') && this.scene.isActive('BossScene')) {
            activeScene = this.scene.get('BossScene');
        }

        if (activeScene && activeScene.stats) {
            activeScene.stats[actionMethod]();
            
            activeScene.stats.heal(activeScene.stats.state.maxHP);
            
            activeScene.physics.resume();
        }

        this.scene.stop();
    }
}