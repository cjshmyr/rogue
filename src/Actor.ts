// TODO: Want to combine this stuff into various objects later, then do json->object loading
class Actor {
    name: string = 'undefined';
    position: Point;
    actorType: ActorType = ActorType.Undefined; // TODO: Make readonly?

    hitpoints: number = 0;
    damage: number = 0;
    gold: number = 0;

    // Rendering
    sprite: PIXI.Sprite;
    revealed: boolean = false; // Has been revealed/seen/discovered before (not is it shown)?
    inRenderBounds: boolean = false; // Is in camera bounds

    // Vision
    hiddenUnderFog: boolean = false; // Is this hidden under fog?
    visionRange: number = 0; // How much can this actor see?
    lightSourceRange: number = 0; // How much light is given off?
    lightSourceAlwaysVisible: boolean = false // Is this light source always visible? (Even under shroud)
                                            // If false, this may look weird with large torches, since our light FOV may expand drastically upon discovery.
                                            // May have applications in rooms we wish to reveal everything.
                                            // May want to reveal the light source instead when vision radius overlaps, not when we can see it.
    blocksVision: boolean = false; // Does it block vision?
    blocksLight: boolean = false; // Does it block light sources?

    // Collision
    readonly blocksMovement: boolean = false; // Does it block movement? <-- NOTE: Cannot be changed (yet), because the layer wouldn't understand it.

    constructor(name: string, position: Point, blocksMovement: boolean = false) {
        this.name = name;
        this.position = position;
        this.blocksMovement = blocksMovement;
    }

    inflictDamage(amount: number) : void {
        this.hitpoints -= amount;
    }

    isDead() : boolean {
        return this.hitpoints <= 0;
    }
}