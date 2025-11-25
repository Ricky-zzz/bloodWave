import { MenuScene } from "./scenes/MenuScene.js";
import { GameScene } from "./scenes/GameScene.js";
import { UIScene } from "./scenes/UIScene.js";
import { EndScene } from "./scenes/EndScene.js";
import { UpgradeScene } from "./scenes/UpgradeScene.js";

const config = {
    type: Phaser.AUTO,
    pixelArt: true,
    antialias: false,

    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },

    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },

    scene: [MenuScene, GameScene, UIScene, EndScene,UpgradeScene],
};
document.addEventListener('contextmenu', function(e) {
    e.preventDefault(); 
});

const game = new Phaser.Game(config);
