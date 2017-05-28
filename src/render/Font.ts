class Font {
    constructor() { }

    static getText() : PIXI.Graphics {
        let graphics = new PIXI.Graphics();

        // try creating "hello world!"
        let letter = FontAtlas.chars['!'];
        let letter2 = FontAtlas.chars['#'];

        let h = FontAtlas.atlas[letter.spriteName];
        let sprite = new PIXI.Sprite(h);
        sprite.position.x = 30;
        sprite.position.y = 30;
        sprite.tint = HudColor.Red;

        let e = FontAtlas.atlas[letter2.spriteName];
        let sprite2 = new PIXI.Sprite(e);
        sprite2.position.x = 30 + letter.width;
        sprite2.position.y = 30;
        sprite2.tint = HudColor.Green;

        graphics.addChild(sprite);
        graphics.addChild(sprite2);

        return graphics;
    }
}