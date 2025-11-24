// tutuloy pag may time pag wla edi
export class UpgradeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UpgradeScene' });
    }

    preload() {
        this.load.image('red', 'assets/imgs/red.png');
        this.load.image('blue', 'assets/imgs/blue.png');
        this.load.image('green', 'assets/imgs/green.png');
    }

    create() {
        const { width, height } = this.scale;

        const redUpgrade = this.add.image(width / 2 - 500, height / 2, 'red').setOrigin(0.5).setScale(1.1);
        const blueUpgrade = this.add.image(width / 2, height / 2, 'blue').setOrigin(0.5).setScale(1.1);
        const greenUpgrade = this.add.image(width / 2 + 500, height / 2, 'green').setOrigin(0.5).setScale(1.1);

        const upgrades = [redUpgrade, blueUpgrade, greenUpgrade];

        upgrades.forEach(upgrade => {
            upgrade.setInteractive({ useHandCursor: true });

            this.tweens.add({
                targets: upgrade,
                scale: 1.4,
                duration: 1200,
                yoyo: true,
                repeat: -1,
                ease: "Sine.easeInOut"
            });

            upgrade.on('pointerdown', () => {
                console.log(`${upgrade.texture.key} upgrade clicked!`);
            });
        });
    }
}
