// TODO: Want to combine this stuff into various objects later, then do json->object loading
class Actor {
    readonly name: string = 'undefined actor';
    position: Point;
    actorType: ActorType = ActorType.UndefinedActorType; // TODO: Make readonly?

    // Guaranteed to be not null - potentially make hero-only things a sub property of the actor (like Hero itself)
    combatant: Combatant;
    inventory: Inventory;
    gold: Gold;
    vision: Vision;
    collision: Collision;

    // Rendering
    renderable: SpriteRenderable;
    revealed: boolean = false; // Has been revealed/seen/discovered before (not is it shown)?
    inRenderBounds: boolean = false; // Is in camera bounds  (TODO: This is the only property the renderer touches)

    // Chests
    chestItem: Item;
    chestOpen: boolean = false;

    // Doors
    isDoorOpen: boolean = false;

    constructor(name: string, position: Point) {
        this.name = name;
        this.position = position;

        this.renderable = new SpriteRenderable(name);

        this.combatant = new Combatant();
        this.inventory = new Inventory();
        this.gold = new Gold();
        this.vision = new Vision();
        this.collision = new Collision();
    }

    inflictDamage(amount: number) : void {
        this.combatant.hitpoints -= amount;
    }

    isDead() : boolean {
        return this.combatant.hitpoints <= 0;
    }

    openChest() : Item {
        this.chestOpen = true;

        this.renderable.setState('idle2');

        return this.chestItem;
    }

    openDoor() : void {
        this.isDoorOpen = true;

        // Remove blocking light/vision properties
        this.vision.blocksVision = false;
        this.vision.blocksVision = false;

        this.renderable.setState('idle2');
    }
}