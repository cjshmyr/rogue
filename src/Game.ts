window.onload = () => {
    // Load things, start game
    PIXI.loader
        .add('core/art/sprites.json')
        .load(() => { let game = new Game(); })
}

class Game {
    // Graphics
    renderer: PIXI.CanvasRenderer | PIXI.WebGLRenderer;
    stage: PIXI.Container;
    atlas: PIXI.loaders.TextureDictionary;
    readonly worldStart: Point = new Point(16, 16);
    readonly worldSpriteSize: number = 16;

    // Game
    actors: Actor[];
    hero: Hero;
    debugText: PIXI.Text;

    constructor() {
        // Setup
        this.setupRenderer();
        this.bindEvents();

        // Load a test map
        this.addTestMap();

        // Start the game
        this.gameLoop();
    }

    private setupRenderer() : void {
        let canvas = <HTMLCanvasElement> document.getElementById("gameCanvas");
        this.renderer = PIXI.autoDetectRenderer(800, 600, { backgroundColor: 0x1099bb, view: canvas });
        this.stage = new PIXI.Container();
        this.atlas = PIXI.loader.resources['core/art/sprites.json'].textures;
    }

    private bindEvents() : void {
        window.addEventListener('keydown', (event: KeyboardEvent) => {
            console.log('pressed: ' + event.keyCode);
            this.setDebugText(event.key);

            let movement: Point;

            if (event.keyCode == 38) { // Up
                movement = new Point(0, -1);
            }
            else if (event.keyCode == 40) { // Down
                movement = new Point(0, 1);
            }
            else if (event.keyCode == 37) { // Left
                movement = new Point(-1, 0);
            }
            else if (event.keyCode == 39) { // Right
                movement = new Point(1, 0);
            }

            if (movement != null) {
                this.moveHero(movement);
            }
        });
    }

    private moveHero(movement: Point) : void {
        let destination = Point.Add(this.hero.location, movement);

        // Check if destination is blocked
        let actorsAtPos: Actor[] = this.actorsAtPosition(destination);

        for (let a of actorsAtPos) {
            if (a instanceof Wall) {
                return; // Don't get them move
            }
            else {
                // Move our hero
                this.hero.location = destination;

                // Update render position
                let pos = this.getActorWorldPosition(this.hero);
                this.hero.sprite.x = pos.x;
                this.hero.sprite.y = pos.y;
            }
        }

        console.log('actors at pos count: ' + actorsAtPos.length);
    }

    private actorsAtPosition(position: Point) : Actor[] {
        let actorsAtPos: Actor[] = [];

        for (let a of this.actors) {
            if (a.location.Equals(position)) {
                actorsAtPos.push(a);
            }
        }

        return actorsAtPos;
    }

    private addTestMap() : void {
        // Sample map
        let map = [
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

        this.actors = [];

        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {

                let tile = map[y][x];
                let location = new Point(x, y);

                let a = <Actor> null;

                if (tile == 'x') {
                    let sprite = new PIXI.Sprite(this.atlas['sprite172']);
                    a = new Wall(sprite, location);
                }
                else if (tile == 'o') {
                    let sprite = new PIXI.Sprite(this.atlas['sprite210']);
                    a = new Floor(sprite, location);
                }
                else {
                    alert('loadMap: Unknown actor type');
                }

                this.actors.push(a)
            }
        }

        // Add them to the stage as well.
        for (let a of this.actors) {
            let pos = this.getActorWorldPosition(a);
            a.sprite.position.x = pos.x;
            a.sprite.position.y = pos.y;
            this.stage.addChild(a.sprite);
        }

        // Add a player at 1,1
        let sprite = new PIXI.Sprite(this.atlas['sprite350']);
        this.hero = new Hero(sprite, new Point(1, 1));
        this.actors.push(this.hero);

        // And add them to the stage
        let pos = this.getActorWorldPosition(this.hero);
        this.hero.sprite.position.x = pos.x;
        this.hero.sprite.position.y = pos.y;
        this.stage.addChild(this.hero.sprite);

        // test: try adding some plain debug text.
        this.debugText = new PIXI.Text('');
        this.debugText.x = 16;
        this.debugText.y = 200;
        this.stage.addChild(this.debugText);
    }

    private getActorWorldPosition(a: Actor) : Point {
        return new Point(
            a.sprite.position.x = this.worldStart.x + (a.location.x * this.worldSpriteSize),
            a.sprite.position.y = this.worldStart.y + (a.location.y * this.worldSpriteSize)
        );
    }

    private setDebugText(text: string) : void {
        this.debugText.text = text;
    }

    private gameLoop = () => {
        requestAnimationFrame(this.gameLoop);
        this.renderer.render(this.stage);
    }
}