// TODO: Want to combine this stuff into various objects later, then do json->object loading
class Actor {
    readonly name: string = 'undefined actor';
    position: Point;
    actorType: ActorType = ActorType.UndefinedActorType; // TODO: Make readonly?

    hitpoints: number = 0;
    damage: number = 0;

    // Inventory
    inventory: Inventory;

    // Rendering
    animation: Animation;
    revealed: boolean = false; // Has been revealed/seen/discovered before (not is it shown)?
    inRenderBounds: boolean = false; // Is in camera bounds  (TODO: This is the only property the renderer touches)

    // Vision
    hiddenUnderFog: boolean = false; // Is this hidden under fog?
    visionRange: number = 0; // How far can this actor see? (Circle radius)
    lightSourceRange: number = 0; // How much light is given off? (Intensity purpose)
    lightSourceAlwaysVisible: boolean = false // Is this light source always visible? (Even under shroud)
                                            // If false, this may look weird with large torches, since our light FOV may expand drastically upon discovery.
                                            // May have applications in rooms we wish to reveal everything.
                                            // May want to reveal the light source instead when vision radius overlaps, not when we can see it.
                                            // May want to reveal the light source instead when we have line of sight vision of its light, or itself.
    blocksVision: boolean = false; // Does it block vision & light sources?

    // Collision
    blocksMovement: boolean = false; // Does it block movement

    // Gold piles
    gold: number = 0;

    // Chests
    chestItem: Item;
    chestOpen: boolean = false;

    // Doors
    isDoorOpen: boolean = false;

    constructor(name: string, position: Point, blocksMovement: boolean = false) {
        this.name = name;
        this.position = position;
        this.blocksMovement = blocksMovement;
        this.animation = new Animation(name);
    }

    inflictDamage(amount: number) : void {
        this.hitpoints -= amount;
    }

    isDead() : boolean {
        return this.hitpoints <= 0;
    }

    openChest() : Item {
        this.chestOpen = true;

        this.animation.setState('idle2');

        return this.chestItem;
    }

    openDoor() : void {
        this.isDoorOpen = true;

        // Remove blocking light/vision properties
        this.blocksVision = false;
        this.blocksVision = false;

        this.animation.setState('idle2');
    }
}