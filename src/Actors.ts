class Actor {
    sprite: PIXI.Sprite;
    location: Point;
    health: number = 0;
    damage: number = 0;
    gold: number = 0;
    name: string =  'undefined';

    lightSourceRange: number = 0;
    revealed: boolean = false; // Appears under fog

    constructor(sprite: PIXI.Sprite, location: Point) {
        this.sprite = sprite;
        this.location = location;
    }

    inflictDamage(amount: number) {
        this.health -= amount;
    }

    isDead() : boolean {
        return this.health <= 0;
    }
}

class Hero extends Actor {
    health: number = 25;
    damage: number = 3;
    name: string = 'Hero';
    lightSourceRange: number = 3;

    constructor(sprite: PIXI.Sprite, location: Point) {
        super(sprite, location);
    }
}

class Npc extends Actor {
    health: number = 5;
    damage: number = 3;
    name: string = 'Monster';

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