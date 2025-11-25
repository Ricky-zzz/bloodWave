import { SoundManager } from "../utils/SoundManager.js";
export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.audio('menubgm', 'assets/sounds/menu.mp3');
        this.load.image('menu_bg', 'assets/imgs/menu.png');
        this.load.image('start_btn', 'assets/imgs/strtbg.png');
        this.load.image('ins_btn', 'assets/imgs/insbg.png');
        this.load.image('title', 'assets/imgs/title.png');
        this.load.image('ins', 'assets/imgs/eme.png');
    }

    create() {

        SoundManager.init(this);
        SoundManager.add('menubgm', { loop: true, volume: 2 });
        SoundManager.play('menubgm');

        const { width, height } = this.scale;
        const scaleFactor = Math.min(width / 1920, height / 1080);

        this.add.image(width / 2, height / 2, "menu_bg").setOrigin(0.5).setDisplaySize(width, height);

        this.title = this.add.image(width / 2, height / 2 - 330 * scaleFactor, "title").setOrigin(0.5).setScale(1.3 * scaleFactor);

        this.tweens.add({
            targets: this.title,
            scale: 1.1 * scaleFactor,
            duration: 1300,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });

        this.startBtn = this.createButton(width / 2, height / 2 + 50 * scaleFactor, "start_btn", scaleFactor, () => {
            SoundManager.stop('menubgm');
            this.scene.start("GameScene");
        });

        this.insBtn = this.createButton(width / 2, height / 2 + 380 * scaleFactor, "ins_btn", scaleFactor, () => {
            this.showInstructions();
        });

    }

    createButton(x, y, textureKey, scaleFactor, callback) {
        const btnScale = 0.4;

        const img = this.add.image(0, 0, textureKey)
            .setOrigin(0.5)
            .setScale(btnScale);

        const container = this.add.container(x, y, [img])
            .setSize(220, 80)
            .setInteractive({ useHandCursor: true })
            .setScale(2.8 * scaleFactor);

        container.on("pointerdown", callback);

        this.tweens.add({
            targets: container,
            scale: 2.4 * scaleFactor,
            duration: 1300,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });

        return container;
    }

    showInstructions() {
        const { width, height } = this.scale;
        const scaleFactor = Math.min(width / 1920, height / 1080);

        const overlay = this.add.rectangle(0, 0, width * 2, height * 2, 0x000000, 0.7).setOrigin(0).setInteractive();
        const panel = this.add.image(width / 2, height / 2, "ins").setOrigin(0.5).setScale(2 * scaleFactor);
        overlay.once("pointerdown", () => {
            overlay.destroy();
            panel.destroy();
        });
    }
}

