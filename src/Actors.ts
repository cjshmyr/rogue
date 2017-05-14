class Actor {
    sprite: PIXI.Sprite;
    location: Point;

    constructor(sprite: PIXI.Sprite, location: Point) {
        this.sprite = sprite;
        this.location = location;
    }
}

class Hero extends Actor {
    health: number = 25;
    gold: number = 0;

    constructor(sprite: PIXI.Sprite, location: Point) {
        super(sprite, location);
    }
}

class Npc extends Actor {
    health: number = 5;

    constructor(sprite: PIXI.Sprite, location: Point) {
        super(sprite, location);
    }
}

class Floor extends Actor {
    constructor(sprite: PIXI.Sprite, location: Point) {
        super(sprite, location);
    }
}

class Wall extends Actor {
    constructor(sprite: PIXI.Sprite, location: Point) {
        super(sprite, location);
    }
}

class Gold extends Actor {
    amount: number = 5;

    constructor(sprite: PIXI.Sprite, location: Point) {
        super(sprite, location);
    }
}