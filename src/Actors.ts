class Actor {
    sprite: PIXI.Sprite;

    location: Point;
    health: number = 0;
    damage: number = 0;
    gold: number = 0;
    name: string =  'undefined';

    lightSourceRange: number = 0;
    revealed: boolean = false; // Has been revealed/seen/discovered before (not is it shown)
    hiddenUnderFog: boolean = false; // Is this hidden under fog TODO: Should be constant
    blocksLight: boolean = false; // Blocks light sources

    renderVisibility: boolean = false; // Is in camera bounds

    constructor(sprite: PIXI.Sprite, location: Point) {
        this.sprite = sprite;
        this.location = location;
    }

    inflictDamage(amount: number) : void {
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
    lightSourceRange: number = 10;

    constructor(sprite: PIXI.Sprite, location: Point) {
        super(sprite, location);
    }
}

class Npc extends Actor {
    health: number = 5;
    damage: number = 2;
    name: string = 'Monster';
    hiddenUnderFog: boolean = true;

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
    blocksLight: boolean = true;

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