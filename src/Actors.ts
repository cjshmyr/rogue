class Actor {
    position: Point;
    health: number = 0;
    damage: number = 0;
    gold: number = 0;
    name: string =  'undefined';

    // Rendering
    renderVisibility: boolean = false; // Is in camera bounds
    sprite: PIXI.Sprite;

    // Vision
    revealed: boolean = false; // Has been revealed/seen/discovered before (not is it shown)?
    lightSourceRange: number = 0; // How much light it gives off?
    hiddenUnderFog: boolean = false; // Is this hidden under fog?
    blocksLight: boolean = false; // Does it block light sources?

    // Collision
    blocksMovement: boolean = false; // Does it block movement?   <--- NOTE: A bit weird, because this is used for instantiation only. If this is changed, the collision layer should too.

    constructor(sprite: PIXI.Sprite, location: Point) {
        this.sprite = sprite;
        this.position = location;
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
    blocksMovement: boolean = true;

    constructor(sprite: PIXI.Sprite, location: Point) {
        super(sprite, location);
    }
}

class Npc extends Actor {
    health: number = 5;
    damage: number = 2;
    name: string = 'Monster';
    hiddenUnderFog: boolean = true;
    blocksMovement: boolean = true;

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
    blocksMovement: boolean = true;

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