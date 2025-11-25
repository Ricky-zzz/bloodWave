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
            const sound = this.sounds[key];

            if (!sound.isPlaying || config.forceRestart) {
                sound.play(config);
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
        if (this.scene && this.scene.sound) {
            this.scene.sound.stopAll();
        }
    }

    static setVolume(key, volume) {
        if (this.sounds[key]) {
            this.sounds[key].setVolume(volume);
        }
    }

    static getVolume(key) {
        return this.sounds[key]?.volume ?? null;
    }

    static setGlobalVolume(volume) {
        if (this.scene && this.scene.sound) {
            this.scene.sound.volume = volume; 
        }
    }

    static getGlobalVolume() {
        return this.scene?.sound?.volume ?? null;
    }
}
