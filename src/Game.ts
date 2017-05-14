window.onload = () => {
    // Load things, start game
    PIXI.loader
        .add('core/art/sprites.json')
        .load(() => { let game = new Game(); })
}

class Game {
    // World
    renderer: PIXI.CanvasRenderer | PIXI.WebGLRenderer;
    stage: PIXI.Container;
    atlas: PIXI.loaders.TextureDictionary;
    readonly worldStart: Point = new Point(16, 16);
    readonly worldSpriteSize: number = 16;

    // HUD
    readonly hudStart: Point = new Point(16, 500);
    hudText: PIXI.Text;

    // Game
    actors: Actor[];
    hero: Hero;

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
            this.setHudText(event.key);

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
        }

        // Check if there's anything we can pick up by walking over it
        for (let a of actorsAtPos) {
            if (a instanceof Gold) {
                // Pick it up!
                this.stage.removeChild(a.sprite);

                console.log('actor count before: ' + this.actors.length);

                // Remove from global actors list
                let index: number = this.actors.indexOf(a, 0);
                if (index > -1) {
                    this.actors.splice(index, 1);
                }

                console.log('actor count after: ' + this.actors.length);

                // Give some gold
                this.hero.gold += 5;
            }
        }

        // Move our hero
        this.hero.location = destination;
        let pos = this.getActorWorldPosition(this.hero);
        this.hero.sprite.x = pos.x;
        this.hero.sprite.y = pos.y;


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
            "##############################",
            "#               #        #   #",
            "#               #        #   #",
            "#               #            #",
            "#      #        #            #",
            "#      #        #            #",
            "#      #        #        #   #",
            "#      #        #        #   #",
            "#      #        #    ###### ##",
            "#      #                     #",
            "#      #                     #",
            "#      ##########         ####",
            "#      ##########            #",
            "#      ##########            #",
            "#      ##########            #",
            "#      ##########            #",
            "#      ###############       #",
            "#                            #",
            "#                            #",
            "#                            #",
            "######### ########           #",
            "######### ########           #",
            "#         ########           #",
            "# ################          ##",
            "# ##############           ###",
            "# #############           ####",
            "#     ########          ######",
            "##### ########        ########",
            "#                    #########",
            "##############################",
        ];

        this.actors = [];

        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {

                let tile = map[y][x];
                let location = new Point(x, y);

                let a = <Actor> null;

                if (tile == '#') {
                    let sprite = new PIXI.Sprite(this.atlas['sprite172']);
                    a = new Wall(sprite, location);
                }
                else if (tile == ' ') {
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

        let pos = this.getActorWorldPosition(this.hero);
        this.hero.sprite.position.x = pos.x;
        this.hero.sprite.position.y = pos.y;
        this.stage.addChild(this.hero.sprite);

        // Add something you can pick up
        let goldSprite = new PIXI.Sprite(this.atlas['sprite250']);
        let gold = new Gold(goldSprite, new Point(3, 1));
        this.actors.push(gold);

        let goldPos = this.getActorWorldPosition(gold);
        gold.sprite.position.x = goldPos.x;
        gold.sprite.position.y = goldPos.y;
        this.stage.addChild(gold.sprite);

        // test: try adding some plain debug text.
        this.hudText = new PIXI.Text('');
        this.hudText.x = this.hudStart.x;
        this.hudText.y = this.hudStart.y;
        this.stage.addChild(this.hudText);
    }

    private getActorWorldPosition(a: Actor) : Point {
        return new Point(
            a.sprite.position.x = this.worldStart.x + (a.location.x * this.worldSpriteSize),
            a.sprite.position.y = this.worldStart.y + (a.location.y * this.worldSpriteSize)
        );
    }

    private setHudText(text: string) : void {
        this.hudText.text = 'Pressed key ' + text;
    }

    private gameLoop = () => {
        requestAnimationFrame(this.gameLoop);
        this.renderer.render(this.stage);
    }
}