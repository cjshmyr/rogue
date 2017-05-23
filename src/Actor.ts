// TODO: Want to combine this stuff into various objects later, then do json->object loading
class Actor {
    readonly name: string = 'undefined actor';
    position: Point;
    actorType: ActorType = ActorType.Undefined; // TODO: Make readonly?

    hitpoints: number = 0;
    damage: number = 0;

    // Inventory
    inventory: Inventory;

    // Rendering
    spriteMap: SpriteMap;
    sprite: PIXI.Sprite;
    revealed: boolean = false; // Has been revealed/seen/discovered before (not is it shown)?
    inRenderBounds: boolean = false; // Is in camera bounds

    // Vision
    hiddenUnderFog: boolean = false; // Is this hidden under fog?
    // visionRange: number = 0; // How much can this actor see?
    lightSourceRange: number = 0; // How much light is given off?
    lightSourceAlwaysVisible: boolean = false // Is this light source always visible? (Even under shroud)
                                            // If false, this may look weird with large torches, since our light FOV may expand drastically upon discovery.
                                            // May have applications in rooms we wish to reveal everything.
                                            // May want to reveal the light source instead when vision radius overlaps, not when we can see it.
                                            // May want to reveal the light source instead when we have line of sight vision of its light, or itself.
    blocksVision: boolean = false; // Does it block vision?
    blocksLight: boolean = false; // Does it block light sources?

    // Collision
    readonly blocksMovement: boolean = false; // Does it block movement? <-- NOTE: Cannot be changed (yet), because the layer wouldn't understand it.

    // Gold piles
    gold: number = 0;

    // Chests
    chestItem: Item;
    chestOpen: boolean = false;

    constructor(name: string, position: Point, blocksMovement: boolean = false) {
        this.name = name;
        this.position = position;
        this.blocksMovement = blocksMovement;
    }

    initializeSprite(spriteMap: SpriteMap) {
        this.spriteMap = spriteMap;
        this.sprite = spriteMap.getSprite(this.name);
    }

    inflictDamage(amount: number) : void {
        this.hitpoints -= amount;
    }

    isDead() : boolean {
        return this.hitpoints <= 0;
    }

    openChest() : Item {
        this.chestOpen = true;
        // TODO: Update sprite

        // this.sprite = SpriteHelper.();

        return this.chestItem;
    }
}

/*
idea:
    have the game subscribe to animations on a Tick basis

    on each tick, loop through each actor with sprite = dirty

    where the sprite = dirty, then update its art

    how do we know which art to use? the actor should have a property with the desired texture.

    getSpriteTexture() : {
        check what type we are

        if hero, return a suggested hero sprite?
    }
*/