import { CONFIG } from "../classes/Config.js";
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
    setupForest() {
        const goalY = 500;
        const w = CONFIG.MAP.FOREST_WIDTH;
        const h = CONFIG.MAP.FOREST_HEIGHT;

        this.scene.physics.world.setBounds(0, 0, w, h);

        this.scene.cameras.main.setBounds(0, 0, w, h);

        this.bg = this.scene.add.tileSprite(0, 0, this.scene.scale.width, this.scene.scale.height, 'game_bg')
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(-2);

        this.goalZone = this.scene.add.zone(w / 2, goalY, w, 100);
        this.scene.physics.add.existing(this.goalZone, true);

        this.goalX = w / 2;
        this.goalY = goalY;

        this.generateTrees(w, h);

        this.createVignette();
    }

    generateTrees(w, h) {
        this.trees = this.scene.physics.add.staticGroup();
        const treeCount = 900;

        for (let i = 0; i < treeCount; i++) {
            const x = Phaser.Math.Between(0, w);
            const y = Phaser.Math.Between(200, h - 200);

            if (x > w / 2 - 200 && x < w / 2 + 200) continue;

            const tree = this.trees.create(x, y, 'tree');

            tree.setScale(3).setDepth(5);

            tree.refreshBody();

            const trunkWidth = tree.displayWidth * 0.4;
            const trunkHeight = tree.displayHeight * 0.2;

            tree.body.setSize(trunkWidth, trunkHeight);

            const offsetX = (tree.displayWidth - trunkWidth) / 2;


            const offsetY = tree.displayHeight - trunkHeight;

            tree.body.setOffset(offsetX, offsetY);
        }
    }

    setupArena() {
        const w = CONFIG.MAP.ARENA_WIDTH;
        const h = CONFIG.MAP.ARENA_HEIGHT;

        this.scene.physics.world.setBounds(0, 0, w, h);
        this.scene.cameras.main.setBounds(0, 0, w, h);

        this.bg = this.scene.add.tileSprite(0, 0, w, h, 'game_bg')
            .setOrigin(0, 0)
            .setDepth(-1);

        this.createArenaBorders(w, h);
    }

    createArenaBorders(w, h) {
        this.borderGroup = this.scene.physics.add.staticGroup();
        const treeSize = 60;

        for (let x = 0; x <= w; x += treeSize) {
            this.borderGroup.create(x, 0, 'tree').setScale(1.5).refreshBody();
            this.borderGroup.create(x, h, 'tree').setScale(1.5).refreshBody();
        }


        for (let y = 0; y <= h; y += treeSize) {
            this.borderGroup.create(0, y, 'tree').setScale(1.5).refreshBody();
            this.borderGroup.create(w, y, 'tree').setScale(1.5).refreshBody();
        }
    }

    createVignette() {
        const width = this.scene.scale.width;
        const height = this.scene.scale.height;

        this.shadow = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.95)
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(9);

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
            x: this.scene.scale.width / 2,
            y: this.scene.scale.height / 2,
            key: 'vision',
            add: false
        });

        this.visionSprite.setScrollFactor(0);

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

            this.visionSprite.x = this.scene.scale.width / 2;
            this.visionSprite.y = this.scene.scale.height / 2;

        }
    }
}