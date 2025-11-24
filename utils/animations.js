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
    scene.anims.create({
        key: 'Enemy4',
        frames: scene.anims.generateFrameNumbers('Enemy_4', { start: 0, end: 5 }),
        frameRate: 15,
        repeat: -1
    });
}

export function createUIAnimations(scene) {
    scene.anims.create({
        key: 'heart_pulse',
        frames: scene.anims.generateFrameNumbers('heart', { start: 0, end: 4 }),
        frameRate: 15,
        repeat: -1
    });
    scene.anims.create({
        key: 'bullet_anims',
        frames: scene.anims.generateFrameNumbers('bullet', { start: 0, end: 14 }),
        frameRate: 15,
        repeat: -1
    });
}
