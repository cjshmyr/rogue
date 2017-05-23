class SpriteMap {
    atlas: PIXI.loaders.TextureDictionary;

    constructor(textureAtlas: PIXI.loaders.TextureDictionary) {
        this.atlas = textureAtlas;
    }

    getSprite(actorName: string) : PIXI.Sprite {
        return new PIXI.Sprite(this.getSpriteTextureName(actorName));
    }

    getSpriteTextureName(actorName: string) : PIXI.Texture {
        let file = '';
        if (actorName == 'Hero') file = 'sprite350';
        else if (actorName == 'Floor') file = 'sprite210'
        else if (actorName == 'Wall') file = 'sprite172'
        else if (actorName == 'Gold') file = 'sprite250'
        else if (actorName == 'Monster') file = 'sprite378'
        else if (actorName == 'Torch') file = 'sprite247'
        else if (actorName == 'Chest') file = 'sprite244'
        else alert('getSpriteTexture: Unknown actor name -> sprite file: ' + actorName);
        return this.atlas[file];
    }
}