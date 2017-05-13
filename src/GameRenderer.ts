class GameRenderer {
    renderer: PIXI.CanvasRenderer | PIXI.WebGLRenderer;
    stage: PIXI.Container;

    constructor(canvas: HTMLCanvasElement) {
        this.renderer = PIXI.autoDetectRenderer(800, 600, { backgroundColor: 0x1099bb, view: canvas });
        this.stage = new PIXI.Container();
    }

    helloWorld(): void {
        console.log('Hello World!');
    }

    addText(text: string, x: number, y: number): void {
        let basicText = new PIXI.Text(text);
        basicText.x = x;
        basicText.y = y;
        this.stage.addChild(basicText);
    }

    demo(): void {
        // demo some text out.
        let basicText = new PIXI.Text('Some text');
        basicText.x = 30;
        basicText.y = 90;
        this.stage.addChild(basicText);

        // render a map
        let atlas = PIXI.loader.resources['src/art/sprites.json'].textures;

        let dungeon = [
            "xxxxxxxxxx",
            "xoooooooox",
            "xoxooooxox",
            "xoxooooxox",
            "xoooooooox",
            "xoxooooxox",
            "xooxooxoox",
            "xooxxxxoox",
            "xoooooooox",
            "xxxxxxxxxx"
        ];

        let startX = 300; // Start us off a bit further in.
        let startY = 300;

        for (let y = 0; y < dungeon.length; y++) {
            for (let x = 0; x < dungeon[y].length; x++) {
                let tile = dungeon[y][x];

                // let imageFile = tile == 'o' ? 'grass.png' : 'wall.png'
                // let texture = PIXI.Texture.fromImage(imageFile);
                // let sprite = new PIXI.Sprite(texture);

                let imageFile = tile == 'o' ? 'sprite210' : 'sprite172'
                let sprite = new PIXI.Sprite(atlas[imageFile]);

                sprite.position.x = startX + (x * 16);
                sprite.position.y = startY + (y * 16);

                this.stage.addChild(sprite);
            }
        }

        // continual render loop.
        this.animate();
    }

    private animate = () => {
        requestAnimationFrame(this.animate);
        this.renderer.render(this.stage);
    }
}