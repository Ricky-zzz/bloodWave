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
        const scaleFactor = Math.min(width / 1920, height / 1080);

        const redUpgrade = this.add.image(width / 2 - 500 * scaleFactor, height / 2, 'red').setOrigin(0.5).setScale(1.1 * scaleFactor);
        const blueUpgrade = this.add.image(width / 2, height / 2, 'blue').setOrigin(0.5).setScale(1.1 * scaleFactor);
        const greenUpgrade = this.add.image(width / 2 + 500 * scaleFactor, height / 2, 'green').setOrigin(0.5).setScale(1.1 * scaleFactor);

        const upgrades = [redUpgrade, blueUpgrade, greenUpgrade];

        upgrades.forEach(upgrade => {
            upgrade.setInteractive({ useHandCursor: true });

            this.tweens.add({
                targets: upgrade,
                scale: 1.4 * scaleFactor,
                duration: 1200,
                yoyo: true,
                repeat: -1,
                ease: "Sine.easeInOut"
            });

            upgrade.on('pointerdown', () => {
                const gameScene = this.scene.get('GameScene');
                
                if (upgrade === redUpgrade) {
                    gameScene.stats.applyBrutality();
                } else if (upgrade === blueUpgrade) {
                    gameScene.stats.applyTactics();
                } else if (upgrade === greenUpgrade) {
                    gameScene.stats.applySurvivability();
                }

                gameScene.stats.heal(gameScene.stats.state.maxHP);
                gameScene.physics.resume();
                this.scene.stop();
            });
        });
    }
}
