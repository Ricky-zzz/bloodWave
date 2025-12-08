export class MapManager {
    constructor(scene) {
        this.scene = scene;
        this.bg = null;
        this.shadow = null;
        this.visionSprite = null;
    }

    setup() {
        this.bg = this.scene.add.tileSprite(0, 0, this.scene.scale.width, this.scene.scale.height, 'game_bg')
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(-1); 

        this.createVignette();
    }

    createVignette() {
        const width = this.scene.scale.width;
        const height = this.scene.scale.height;

        this.shadow = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.95)
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(9); // Below UI, above Game

        if (!this.scene.textures.exists('vision')) {
            const radius = 900;
            const texture = this.scene.textures.createCanvas('vision', radius * 2, radius * 2);
            const ctx = texture.context;
            
            const grd = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
            grd.addColorStop(0, 'rgba(255, 255, 255, 1)');
            grd.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, radius * 2, radius * 2);
            texture.refresh();
        }

        this.visionSprite = this.scene.make.image({
            x: 0, 
            y: 0,
            key: 'vision',
            add: false
        });
        
        const mask = new Phaser.Display.Masks.BitmapMask(this.scene, this.visionSprite);
        mask.invertAlpha = true;
        this.shadow.setMask(mask);
    }

    update() {
        const cam = this.scene.cameras.main;
        const player = this.scene.player;

        if (this.bg) {
            this.bg.tilePositionX = cam.scrollX;
            this.bg.tilePositionY = cam.scrollY;
        }

        if (this.visionSprite && player) {
            this.visionSprite.x = player.x;
            this.visionSprite.y = player.y;
        }
    }
}