import { MenuScene } from "./scenes/MenuScene.js";
import { GameScene } from "./scenes/GameScene.js";
import { UIScene } from "./scenes/UIScene.js";
import { EndScene } from "./scenes/EndScene.js";
import { UpgradeScene } from "./scenes/UpgradeScene.js";
import { BossScene } from "./scenes/BossScene.js";
import { StoryScene } from "./scenes/StoryScene.js";

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

    scene: [MenuScene, GameScene,BossScene, UIScene, EndScene,UpgradeScene,StoryScene],
};
document.addEventListener('contextmenu', function(e) {
    e.preventDefault(); 
});

const game = new Phaser.Game(config);
