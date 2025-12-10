import { SoundManager } from "../utils/SoundManager.js";
export class StoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StoryScene' });

        // Define the full story data here (Fixed Syntax Error)
        this.fullStory = [
            {
                "panel": "panel1",
                "text": "One fateful day, an eldritch titan tore through the skies, unleashing cosmic devastation upon mankind."
            },
            {
                "panel": "panel2",
                "text": "Amid the chaos, Dina and Hina struggled to flee—but an otherworldly entity seized Hina, dragging her into the darkness as her sister watched helplessly."
            },
            {
                "panel": "panel3",
                "text": "Fueled by unwavering determination, Dina armed herself, vowing to cross any nightmare to bring her sister home."
            },
            {
                "panel": "brainwash",
                "text": "Dina finally found Hina deep within a twisted forest, but something had changed—her eyes empty, her mind ensnared by an eldritch will."
            },
            {
                "panel": "panel4",
                "text": "After breaking the spell’s hold, the sisters embraced and walked forward together, united once more beneath a healing sky."
            },
            {
                "panel": "panel5",
                "text": "Nobody knows where the road will take them next, but one thing is certain: together, they can face any cosmic horror that comes their way."
            }
        ];
    }

    init(data) {
        this.nextSceneKey = data.nextScene || 'GameScene';
        if (data.images && Array.isArray(data.images)) {
            this.slides = this.fullStory.filter(item => data.images.includes(item.panel));
        } else {
            this.slides = [this.fullStory[0]];
        }

        this.currentIndex = 0;
    }

    create() {
        SoundManager.init(this);
        SoundManager.add('menubgm', { loop: true, volume: 2 });
        SoundManager.play('menubgm');
        const { width, height } = this.scale;

        this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0);

        this.currentImage = this.add.image(width / 2, height / 2, this.slides[0].panel)
            .setOrigin(0.5);
        this.scaleImageToFit(this.currentImage, width, height);

        const textBoxHeight = 150;
        this.add.rectangle(width / 2, height - 80, width * 0.8, textBoxHeight, 0x000000, 0.7)
            .setOrigin(0.5);

        this.narrationText = this.add.text(width / 2, height - 80, this.slides[0].text, {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: width * 0.75 }
        }).setOrigin(0.5);

        this.createControls(width, height);

        this.input.keyboard.on('keydown-RIGHT', () => this.nextSlide());
        this.input.keyboard.on('keydown-LEFT', () => this.prevSlide());
        this.input.keyboard.on('keydown-SPACE', () => this.nextSlide());
        this.input.keyboard.on('keydown-ENTER', () => this.skipStory());
    }

    scaleImageToFit(image, w, h) {
        const scaleX = w / image.width;
        const scaleY = (h - 200) / image.height;
        const scale = Math.min(scaleX, scaleY) * 0.9;
        image.setScale(scale);
    }

    createControls(w, h) {
        this.nextBtn = this.add.image(w - 100, h / 2, 'arrow_right')
            .setInteractive({ useHandCursor: true })
            .setScale(1.5);

        this.nextBtn.on('pointerdown', () => this.nextSlide());

        this.prevBtn = this.add.image(100, h / 2, 'arrow_right')
            .setInteractive({ useHandCursor: true })
            .setScale(1.5)
            .setFlipX(true);

        this.prevBtn.on('pointerdown', () => this.prevSlide());

        this.prevBtn.setVisible(false);
        this.add.text(w / 2, h - 180, "Press SPACE to Continue | ENTER to Skip", {
            fontSize: '16px',
            color: '#888888'
        }).setOrigin(0.5);
    }

    nextSlide() {
        this.currentIndex++;

        if (this.currentIndex >= this.slides.length) {
            this.finishStory();
            return;
        }

        this.updateSlide();
    }

    prevSlide() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateSlide();
        }
    }

    updateSlide() {
        const currentSlideData = this.slides[this.currentIndex];

        this.prevBtn.setVisible(this.currentIndex > 0);

        this.tweens.add({
            targets: [this.currentImage, this.narrationText],
            alpha: 0,
            duration: 200,
            onComplete: () => {
                this.currentImage.setTexture(currentSlideData.panel);
                this.narrationText.setText(currentSlideData.text);

                this.scaleImageToFit(this.currentImage, this.scale.width, this.scale.height);

                this.tweens.add({
                    targets: [this.currentImage, this.narrationText],
                    alpha: 1,
                    duration: 200
                });
            }
        });
    }

    finishStory() {
        this.sound.stopAll();
        this.cameras.main.fade(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
            this.scene.start(this.nextSceneKey);
        });
    }

    skipStory() {
        this.finishStory();
    }
}