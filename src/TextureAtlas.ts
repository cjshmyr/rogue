class TextureAtlas {
    static atlas: PIXI.loaders.TextureDictionary;

    static init() {
        this.atlas = PIXI.loader.resources['core/art/sprites.json'].textures;
    }

    static getSpriteTexture(animationName: string) : PIXI.Texture {
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