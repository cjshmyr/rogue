class Actor {
    sprite: PIXI.Sprite;
    location: Point;

    constructor(sprite: PIXI.Sprite, location: Point) {
        this.sprite = sprite;
        this.location = location;
    }
}

class Hero extends Actor {
    gold: number;

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
    constructor(sprite: PIXI.Sprite, location: Point) {
        super(sprite, location);
    }
}