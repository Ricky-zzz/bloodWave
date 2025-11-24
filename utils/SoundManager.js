export class SoundManager {
    static scene = null;
    static sounds = {};
    static enabled = true;

    static init(scene) {
        this.scene = scene;
        this.sounds = {};
    }

    static add(key, config = {}) {
        if (!this.scene) return;
        this.sounds[key] = this.scene.sound.add(key, config);
    }

    static play(key, config = {}) {
        if (!this.enabled) return;

        if (this.sounds[key]) {
            if (!this.sounds[key].isPlaying || config.forceRestart) {
                this.sounds[key].play(config);
            }
            return;
        }

        if (this.scene && this.scene.sound) {
             this.scene.sound.play(key, config);
        }
    }

    static stop(key) {
        if (this.sounds[key]) {
            this.sounds[key].stop();
        }
    }

    static stopAll() {
        this.scene.sound.stopAll();
    }
}
