class Animation {
    readonly animationPrefix: string;

    sprite: PIXI.Sprite; // the current sprite.

    // State machine
    currentState: string = "idle"; // Note - Assumed defualt state for all actor sprites
    lastState: string = "idle" // Note - Assumed defualt state for all actor sprites
    private getAnimationName() : string { return this.animationPrefix + '-' + this.currentState; }
    lastTick: number;

    constructor(animationPrefix: string) {
        this.animationPrefix = animationPrefix;
        this.sprite = new PIXI.Sprite(TextureAtlas.getSpriteTexture(this.getAnimationName()));
    }

    setState(newState: string) { // Thought: are we updating the texture at the proper time?
        this.lastState = this.currentState;
        this.currentState = newState;
    }

    Tick(tick: number) : void {
        if (this.currentState != this.lastState) {
            this.sprite.texture = TextureAtlas.getSpriteTexture(this.getAnimationName());
            this.lastState = this.currentState;
        }

        this.lastTick = tick;
    }
}