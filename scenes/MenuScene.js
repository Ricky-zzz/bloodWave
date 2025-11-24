export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.image('menu_bg', 'assets/imgs/menu.png');
        this.load.image('start_btn', 'assets/imgs/strtbg.png');
        this.load.image('ins_btn', 'assets/imgs/insbg.png');
        this.load.image('title', 'assets/imgs/title.png');
        this.load.image('ins', 'assets/imgs/eme.png');
    }

    create() {
        const { width, height } = this.scale;

        this.add.image(width / 2, height / 2, "menu_bg").setOrigin(0.5).setDisplaySize(width, height);

        this.title = this.add.image(width / 2, height / 2 - 200, "title").setOrigin(0.5).setScale(1.5);

        this.tweens.add({
            targets: this.title,
            scale: 1.4,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });

        this.startBtn = this.createButton(width / 2, height / 2 + 80, "start_btn", () => {
            this.scene.start("GameScene");
        });
        this.startBtn.setScale(2.5);

        this.insBtn = this.createButton(width / 2, height / 2 + 260, "ins_btn", () => {
            this.showInstructions();
        });
        this.insBtn.setScale(2.5);

    }

    createButton(x, y, textureKey, callback) {
        const btnScale = 0.25;

        const img = this.add.image(0, 0, textureKey)
            .setOrigin(0.5)
            .setScale(btnScale);

        const container = this.add.container(x, y, [img])
            .setSize(220, 80)
            .setInteractive({ useHandCursor: true });

        container.on("pointerdown", callback);

        this.tweens.add({
            targets: container,
            scale: 2.4,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });

        return container;
    }

    showInstructions() {
        const { width, height } = this.scale;

        const overlay = this.add.rectangle(0, 0, width * 2, height * 2, 0x000000, 0.7).setOrigin(0).setInteractive();
        const panel = this.add.image(width / 2, height / 2, "ins").setOrigin(0.5).setScale(1.8);    
        overlay.once("pointerdown", () => {
            overlay.destroy();
            panel.destroy();
        });
    }
}

