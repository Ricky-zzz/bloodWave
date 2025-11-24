import { MenuScene } from "./scenes/MenuScene.js";
import { GameScene } from "./scenes/GameScene.js";
import { UIScene } from "./scenes/UIScene.js";
import { UpgradeScene } from "./scenes/UpgradeScene.js";

const config = {
    type: Phaser.AUTO,
    pixelArt: true,
    antialias: true,

    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },

    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },

    scene: [MenuScene, GameScene, UIScene, UpgradeScene],
};

const game = new Phaser.Game(config);
