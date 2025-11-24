import { SoundManager } from "../utils/SoundManager.js";
import { GameState } from "../classes/GameState.js";

export class EndScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EndScene' });
    }

    preload() {
        this.load.audio('menubgm', 'assets/sounds/menu.mp3');
        this.load.image('result', 'assets/imgs/result.jpg');
        this.load.image('quit', 'assets/imgs/quit.png'); 
    }

    create() {
        SoundManager.init(this);
        SoundManager.stopAll(); 
        SoundManager.add('menubgm', { loop: true, volume: 0.5 });
        SoundManager.play('menubgm');

        const bg = this.add.image(0, 0, 'result').setOrigin(0, 0);
        bg.setDisplaySize(this.scale.width, this.scale.height);

        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        const titleStyle = { 
            fontSize: '80px', 
            fill: '#ff0000', 
            fontStyle: 'bold', 
            stroke: '#000000', 
            strokeThickness: 8 
        };
        
        const statStyle = { 
            fontSize: '50px', 
            fill: '#ffffff', 
            fontStyle: 'bold', 
            stroke: '#000000', 
            strokeThickness: 5 
        };

        this.add.text(centerX, centerY - 380, "GAME OVER", titleStyle).setOrigin(0.5);
        this.add.text(centerX, centerY - 300, `Score: ${GameState.score}`, statStyle).setOrigin(0.5);
        this.add.text(centerX, centerY - 220, `Wave Reached: ${GameState.wave}`, statStyle).setOrigin(0.5);

        this.quitBtn = this.createButton(centerX, centerY + 180, 'quit', () => {
            this.restartGame();
        });
        
        this.quitBtn.setScale(1.4); 

        this.input.keyboard.once('keydown-Q', () => {
            this.restartGame();
        });
    }


    createButton(x, y, textureKey, callback) {
        const img = this.add.image(0, 0, textureKey).setOrigin(0.5);
        
        const container = this.add.container(x, y, [img]);
        
        container.setSize(img.width, img.height);
        container.setInteractive({ useHandCursor: true });

        container.on("pointerdown", callback);

        this.tweens.add({
            targets: container,
            scale: 1.2,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });

        return container;
    }

    restartGame() {
        GameState.score = 0;
        GameState.wave = 1;
        GameState.isPaused = false;       
        SoundManager.stop('menubgm');
        this.scene.start('MenuScene');
    }
}