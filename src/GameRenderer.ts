class GameRenderer {
    renderer: PIXI.CanvasRenderer | PIXI.WebGLRenderer;
    stage: PIXI.Container;

    constructor(canvas: HTMLCanvasElement) {
        this.renderer = PIXI.autoDetectRenderer(800, 600, { backgroundColor: 0x1099bb, view: canvas });
        this.stage = new PIXI.Container();
    }

    addText(text: string, x: number, y: number): void {
        let basicText = new PIXI.Text(text);
        basicText.x = x;
        basicText.y = y;
        this.stage.addChild(basicText);
    }

    render(w: World): void {
        // render a map
        let atlas = PIXI.loader.resources['src/art/sprites.json'].textures;

        let map = w.map;

        let startX = 16;
        let startY = 16;

        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                let tile = map[y][x];

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

    demo(): void {
        // demo some text out.
        let basicText = new PIXI.Text('Some text');
        basicText.x = 30;
        basicText.y = 90;
        this.stage.addChild(basicText);
    }

    private animate = () => {
        requestAnimationFrame(this.animate);
        this.renderer.render(this.stage);
    }
}