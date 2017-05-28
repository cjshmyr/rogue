class FontChar {
    char: string;
    width: number;
    spriteName: string; // Sprite#

    constructor(char: string, width: number, index: number) {
        this.char = char;
        this.width = width;
        this.spriteName = 'sprite' + index;
    }
}

class FontAtlas {
    static atlas: PIXI.loaders.TextureDictionary;
    static chars: { [char: string] : FontChar } = { };

    static init() : void {
        this.atlas = PIXI.loader.resources['core/font/font.json'].textures;

        this.chars['!'] = new FontChar('!', 2, 1);
        this.chars['"'] = new FontChar('"', 4, 2);
        this.chars['#'] = new FontChar('#', 5, 3);
        this.chars['$'] = new FontChar('$', 5, 4);
        this.chars['%'] = new FontChar('%', 6, 5);
    }

    /*

        ['!', new FontChar('!', 2, 1)]
    }

    static getSprite(char: string) : FontChar {
        if (char == '!') return new FontChar(char, 2, 1);
        if (char == '"') return new FontChar(char, 4, 2);
        if (char == '#') return new FontChar()
        if (char.toUpperCase() == 'A') return new FontChar(char, 5, 33);
        else return new FontChar(' ', 5, -1); // spaces, or undefined.
    }
    */
}

