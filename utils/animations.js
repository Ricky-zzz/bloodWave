export function createAnimations(scene) {
    scene.anims.create({
        key: 'player_idle',
        frames: scene.anims.generateFrameNumbers('Dina_idle', { start: 0, end: 5 }),
        frameRate: 8,
        repeat: -1
    });

    scene.anims.create({
        key: 'player_run',
        frames: scene.anims.generateFrameNumbers('Dina_run', { start: 0, end: 3 }),
        frameRate: 12,
        repeat: -1
    });

    scene.anims.create({
        key: 'player_walk',
        frames: scene.anims.generateFrameNumbers('Dina_walk', { start: 0, end: 7 }),
        frameRate: 12,
        repeat: -1
    });
}
