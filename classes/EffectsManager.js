export class EffectsManager {
    constructor(scene) {
        this.scene = scene;
        this.createParticleTextures();
    }

    createParticleTextures() {
        if (this.scene.textures.exists('particle')) return;

        // Create white square particle
        const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(0, 0, 10, 10);
        graphics.generateTexture('particle', 10, 10);
    }

    playDeathSequence(x, y, onCompleteCallback) {
        // 1. Create Emitter
        const deathEmitter = this.scene.add.particles(x, y, 'particle', {
            speed: { min: 100, max: 200 },
            angle: { min: 0, max: 360 },
            gravityY: -200,
            scale: { start: 1.5, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 1500,
            tint: 0xff0000,
            blendMode: 'ADD',
            emitting: false
        });

        deathEmitter.explode(60);

        // 2. Wait and trigger callback (Game Over screen)
        this.scene.time.delayedCall(2000, () => {
            if (onCompleteCallback) onCompleteCallback();
        });
    }

    playNukeEffect() {
        this.scene.cameras.main.flash(4000, 255, 255, 255);
        this.scene.cameras.main.shake(1000, 0.1);
    }
}