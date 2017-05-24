class ActorAnimation { // extends Animation {
    readonly actor: Actor;
    sprite: PIXI.Sprite;

    // State machine
    currentState: string = "idle"; // Note - Assumed defualt state for all actor sprites
    lastState: string = "idle" // Note - Assumed defualt state for all actor sprites

    lastTick: number;

    constructor(actor: Actor) {
        // super(actor.name);

        this.actor = actor;

        this.sprite = new PIXI.Sprite(GameTextures.getSpriteTexture(this.getAnimationName()));
    }

    getAnimationName() : string {
        return this.actor.name + '-' + this.actor.state;
    }

    tick(tick: number) : void {
        if (this.currentState != this.lastState) { // Perform any texture changes based on actor state
            this.sprite.texture = GameTextures.getSpriteTexture(this.getAnimationName());
            this.lastState = this.currentState;
        }

        this.lastTick = tick;
    }
}

/*
class Animation {
    readonly animationPrefix: string;
    sprite: PIXI.Sprite;

    // State machine
    currentState: string = "idle"; // Note - Assumed defualt state for all actor sprites
    lastState: string = "idle" // Note - Assumed defualt state for all actor sprites

    lastTick: number;

    constructor(animationPrefix: string) {
        this.animationPrefix = animationPrefix;
        this.sprite = new PIXI.Sprite(GameTextures.getSpriteTexture(this.getAnimationName()));
    }

    getAnimationName() : string {
        return this.animationPrefix + '-' + this.currentState;
    }

    setState(newState: string) : void { // Thought: are we updating the texture at the proper time?
        this.lastState = this.currentState;
        this.currentState = newState;
    }

    setRenderPosition() : void {}

    tick(tick: number) : void {
        if (this.currentState != this.lastState) { // Perform any texture changes based on actor state
            this.sprite.texture = GameTextures.getSpriteTexture(this.getAnimationName());
            this.lastState = this.currentState;
        }

        this.lastTick = tick;
    }
}
*/