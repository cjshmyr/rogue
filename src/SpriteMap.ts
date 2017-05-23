class Animation {
    readonly animationPrefix: string;

    frameMap: FrameMap; // All frames that ever exist.
    sprite: PIXI.Sprite; // the current sprite.

    // State machine
    state: string = "idle"; // Note - Assumed defualt state for all actor sprites
    lastState: string = "idle" // Note - Assumed defualt state for all actor sprites
    private getAnimationName() : string { return this.animationPrefix + '-' + this.state; }
    dirty: boolean = true; // If dirty, we're going to check for changes
    lastTick: number;

    constructor(frameMap: FrameMap, animationPrefix: string) {
        this.frameMap = frameMap;
        this.animationPrefix = animationPrefix;
        this.sprite = new PIXI.Sprite(frameMap.getSpriteTexture(this.getAnimationName()));
    }

    setState(newState: string) {
        this.lastState = this.state;
        this.state = newState;
    }

    Tick(tick: number) : void {
        if (!this.dirty)
            return;

        if (this.state != this.lastState) {
            this.sprite.texture = this.frameMap.getSpriteTexture(this.getAnimationName());
            this.dirty = false;
        }

        this.lastTick = tick;
    }
}

class FrameMap {
    atlas: PIXI.loaders.TextureDictionary;

    constructor(textureAtlas: PIXI.loaders.TextureDictionary) {
        this.atlas = textureAtlas;
    }

    getSpriteTexture(animationName: string) : PIXI.Texture {
        let file = '';

        if (animationName == 'Hero-idle') file = 'sprite350';
        else if (animationName == 'Floor-idle') file = 'sprite210'
        else if (animationName == 'Wall-idle') file = 'sprite172'
        else if (animationName == 'Gold-idle') file = 'sprite250'
        else if (animationName == 'Monster-idle') file = 'sprite378'
        else if (animationName == 'Torch-idle') file = 'sprite247'
        else if (animationName == 'Chest-idle') file = 'sprite244'
        else if (animationName == 'Chest-idle2') file = 'sprite245'
        else alert('getSpriteTexture: Unknown animation name -> sprite file: ' + animationName);
        return this.atlas[file];
    }
}