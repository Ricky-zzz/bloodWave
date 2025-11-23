import { GameScene } from "./scenes/GameScene.js";

const config = {
    type: Phaser.AUTO,
    pixelArt: true,
    antialias: true,
    scene: [GameScene],   
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {           
        default: 'arcade',
        arcade: {
            debug: false,
        }
    }
};

const game = new Phaser.Game(config);
