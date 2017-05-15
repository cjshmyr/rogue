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
    readonly bottomHudStart: Point = new Point(16, 500);
    buttomHudText: PIXI.Text;
    readonly rightHudStart: Point = new Point(500, 16);
    rightHudText: PIXI.Text;
    hudLastPressedKey: string;
    hudCombatLog: string[] = [];

    // Game
    actors: Actor[];
    hero: Hero;
    playerTurn: boolean = true;

    constructor() {
        // Setup
        this.setupRenderer();
        this.setupEvents();

        // Game-related setup
        this.setupHud();

        // Load a test map
        this.addTestMap();

        // Start the game
        this.gameLoop();
    }

    private setupRenderer() : void {
        let canvas = <HTMLCanvasElement> document.getElementById("gameCanvas");
        this.renderer = PIXI.autoDetectRenderer(800, 600, { backgroundColor: 0x606060, view: canvas });
        this.stage = new PIXI.Container();
        this.atlas = PIXI.loader.resources['core/art/sprites.json'].textures;
    }

    private setupEvents() : void {
        window.addEventListener('keydown', (event: KeyboardEvent) => {
            console.log('pressed: ' + event.keyCode);
            this.hudLastPressedKey = event.key;

            if (this.playerTurn) {
                let movement: Point; // TODO: It's more like an action direction.

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
            }
        });
    }

    private setupHud() : void {
        this.buttomHudText = new PIXI.Text('');
        this.buttomHudText.style.fontSize = 12;
        this.buttomHudText.style.fill = 0xFFFFFF;
        this.buttomHudText.x = this.bottomHudStart.x;
        this.buttomHudText.y = this.bottomHudStart.y;
        this.stage.addChild(this.buttomHudText);

        this.rightHudText = new PIXI.Text('');
        this.rightHudText.style.fontSize = 12;
        this.rightHudText.style.fill = 0xFFFFFF;
        this.rightHudText.x = this.rightHudStart.x;
        this.rightHudText.y = this.rightHudStart.y;
        this.stage.addChild(this.rightHudText);
    }

    private drawHud() : void {
        // Display the 6-top most items

        let combatLog = '';
        let lastSixLines = this.hudCombatLog.slice(Math.max(this.hudCombatLog.length - 6, 0));
        for (let l of lastSixLines) {
            if (combatLog == '')
                combatLog = l;
            else
                combatLog += '\n' + l;
        }
        this.buttomHudText.text = combatLog;

        this.rightHudText.text = 'Health: ' + this.hero.health
            + '\nGold: ' + this.hero.gold
            + '\n\n-- debug --\nLast key pressed: ' + this.hudLastPressedKey;
    }

    private moveHero(movement: Point) : void {
        let destination = Point.Add(this.hero.location, movement);
        let actorsAtPos: Actor[] = this.actorsAtPosition(destination);

        // Check if destination is blocked
        for (let a of actorsAtPos) {
            if (a instanceof Wall) {
                this.hudCombatLog.push('You cannot move there.' );
                return; // Don't get them move
            }
        }

        // -- Player turn start --

        // Check if we're attacking something
        for (let a of actorsAtPos) {
            if (a instanceof Npc) {
                // Atack it!
                a.inflictDamage(this.hero.damage);

                this.hudCombatLog.push('You attacked ' + a.name + ' for ' + this.hero.damage + ' damage.');

                if (a.isDead()) {
                    this.hudCombatLog.push('You killed ' + a.name + '!');
                    this.stage.removeChild(a.sprite);

                    // Remove from global actors list (TODO: Move into a function, reusable)
                    let index: number = this.actors.indexOf(a, 0);
                    if (index > -1) {
                        this.actors.splice(index, 1);
                    }
                }

                return;
            }
        }

        // Check if there's anything we can pick up by walking over it
        for (let a of actorsAtPos) {
            if (a instanceof Gold) {
                // Pick it up!
                this.stage.removeChild(a.sprite);

                // console.log('actor count before: ' + this.actors.length);

                // Remove from global actors list  (TODO: Move into a function, reusable)
                let index: number = this.actors.indexOf(a, 0);
                if (index > -1) {
                    this.actors.splice(index, 1);
                }

                // console.log('actor count after: ' + this.actors.length);

                // Give some gold
                this.hero.gold += a.amount;

                this.hudCombatLog.push('You picked up ' + a.amount + ' gold!');
            }
        }

        // Move our hero
        this.hero.location = destination;
        let pos = this.getActorWorldPosition(this.hero);
        this.hero.sprite.x = pos.x;
        this.hero.sprite.y = pos.y;

        // console.log('actors at pos count: ' + actorsAtPos.length);
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

        // Add a generic npc (enemy)
        let npcSprite = new PIXI.Sprite(this.atlas['sprite378']);
        let npc = new Npc(npcSprite, new Point(5, 5));
        this.actors.push(npc);

        let npcPos = this.getActorWorldPosition(npc);
        npc.sprite.position.x = npcPos.x;
        npc.sprite.position.y = npcPos.y;
        this.stage.addChild(npc.sprite);
    }

    private getActorWorldPosition(a: Actor) : Point {
        return new Point(
            a.sprite.position.x = this.worldStart.x + (a.location.x * this.worldSpriteSize),
            a.sprite.position.y = this.worldStart.y + (a.location.y * this.worldSpriteSize)
        );
    }

    private gameLoop = () => {
        requestAnimationFrame(this.gameLoop);

        this.drawHud();

        this.renderer.render(this.stage);
    }
}