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
    actors: Actor[]; // TODO: Should we initialize this as an empty array?
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
        this.renderer = PIXI.autoDetectRenderer(800, 600, { backgroundColor: HudColor.Background, view: canvas });
        this.stage = new PIXI.Container();
        this.atlas = PIXI.loader.resources['core/art/sprites.json'].textures;
    }

    private setupEvents() : void {
        window.addEventListener('keydown', (event: KeyboardEvent) => {
            console.log('pressed: ' + event.keyCode);
            this.hudLastPressedKey = event.key;

            if (this.playerTurn) {
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
                    this.doHeroAction(movement);
                }
            }
        });
    }

    private setupHud() : void {
        this.buttomHudText = new PIXI.Text('');
        this.buttomHudText.style.fontSize = 12;
        this.buttomHudText.style.fill = HudColor.Font;
        this.buttomHudText.x = this.bottomHudStart.x;
        this.buttomHudText.y = this.bottomHudStart.y;
        this.stage.addChild(this.buttomHudText);

        this.rightHudText = new PIXI.Text('');
        this.rightHudText.style.fontSize = 12;
        this.rightHudText.style.fill = HudColor.Font;
        this.rightHudText.x = this.rightHudStart.x;
        this.rightHudText.y = this.rightHudStart.y;
        this.stage.addChild(this.rightHudText);
    }

    private updateHud() : void {
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
            + '\n\n-- debug --'
            + '\nLast key pressed: ' + this.hudLastPressedKey
            + '\nHero position (x,y): ' + this.hero.location.x + ',' + this.hero.location.y
            + '\nTurn: ' + (this.playerTurn ? 'player' : 'ai');
    }

    private removeActorFromWorld(a: Actor) : void {
        // Remove their sprite
        this.stage.removeChild(a.sprite);

        // Remove them from `actors` array
        let index: number = this.actors.indexOf(a, 0);
        if (index > -1) {
            this.actors.splice(index, 1);
        }
    }

    private doHeroAction(movement: Point) : void {
        let destination = Point.Add(this.hero.location, movement);
        let actorsAtDest: Actor[] = this.findActorsAtPoint(destination);

        let allowMove: boolean = true;
        for (let a of actorsAtDest) {
            if (a instanceof Wall) { // Check if destination is blocked
                this.hudCombatLog.push('You cannot move there.');

                allowMove = false;
            }
            else if (a instanceof Npc) { // Check if we're attacking something
                // Atack it!
                a.inflictDamage(this.hero.damage);
                this.hudCombatLog.push('You attacked ' + a.name + ' for ' + this.hero.damage + ' damage.');

                if (a.isDead()) {
                    this.hudCombatLog.push('You killed ' + a.name + '!');
                    this.removeActorFromWorld(a);
                }

                allowMove = false;
            }
            else if (a instanceof Gold) { // Check if we're picking up something
                // Pick it up!
                // Give gold
                this.hero.gold += a.amount;

                this.hudCombatLog.push('You picked up ' + a.amount + ' gold!');
                this.removeActorFromWorld(a);
            }
        }

        if (allowMove) {
            this.updateActorPosition(this.hero, destination);
        }

        this.playerTurn = false;
        this.doNpcActions();
    }

    private doNpcActions() : void {
        for (let a of this.actors) {
            if (a instanceof Npc) {
                this.doNpcAction(a);
            }
        }

        this.playerTurn = true;
    }

    private doNpcAction(npc: Npc) {
        // TODO: Attempt to move towards player
        // This is insanely stupid.
        let destination = SimplePathfinder.GetClosestCellBetweenPoints(npc.location, this.hero.location);
        let actorsAtDest = this.findActorsAtPoint(destination);

        let allowMove: boolean = true;
        for (let a of actorsAtDest) {
            if (a instanceof Wall || a instanceof Npc) {
                allowMove = false;
            }
            else if (a instanceof Hero) {
                // Attack player
                a.inflictDamage(npc.damage);
                this.hudCombatLog.push(npc.name + ' attacked you for for ' + npc.damage + ' damage.');

                if (a.isDead()) {
                    this.hudCombatLog.push(npc.name + ' killed you!');
                    this.removeActorFromWorld(a);

                    // TODO: Hero needs to die.
                }

                allowMove = false;
            }
        }

        if (allowMove) {
            this.updateActorPosition(npc, destination);
        }
    }

    private updateActorPosition(a: Actor, destination: Point) : void {
        a.location = destination;
        let pos = this.getActorWorldPosition(a);
        a.sprite.x = pos.x;
        a.sprite.y = pos.y;
    }

    private getActorWorldPosition(a: Actor) : Point { // TODO: Will need refactor with camera/animation changes.
        return new Point(
            a.sprite.position.x = this.worldStart.x + (a.location.x * this.worldSpriteSize),
            a.sprite.position.y = this.worldStart.y + (a.location.y * this.worldSpriteSize)
        );
    }

    private findActorsAtPoint(p: Point) : Actor[] {
        return this.findActorsAtPoints([p]);
    }

    private findActorsAtPoints(points: Point[]) : Actor[] {
        let actorsInPoints: Actor[] = [];

        for (let a of this.actors) {
            for (let p of points) {
                if (a.location.Equals(p)) {
                    actorsInPoints.push(a);
                }
            }
        }

        return actorsInPoints;
    }

    private pointsInBox(center: Point, range: number = 0) {
        let points: Point[] = [];

        for (let y = center.y - range; y <= center.y + range; y++) {
            for (let x = center.x - range; x <= center.x + range; x++) {
                points.push(new Point(x,y));
            }
        }

        return points;
    }

    private pointsInCircle(center: Point, range: number = 0) {
        let pointsInBox = this.pointsInBox(center, range);
        let points: Point[] = [];

        for (let p of pointsInBox) {
            if (Point.DistanceSquared(center, p) <= range) {
                points.push(p);
            }
        }

        return points;
    }

    private applyLightSources() : void {
        if (this.actors == null)
            return;

        // Hacky: dim everything, then apply sources
        for (let a of this.actors) {
            a.sprite.tint = LightSourceTint.Fog;
        }

        // Hacky: assumes hero's the only source
        let nearbyPoints = this.pointsInCircle(this.hero.location, this.hero.lightSourceRange);
        let nearbyActors = this.findActorsAtPoints(nearbyPoints);

        for (let a of nearbyActors) {
            a.sprite.tint = LightSourceTint.Visible;
        }
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

        // Add generic enemies
        let enemies = [new Point(25, 13), new Point(5,5), new Point(16, 28), new Point(1, 28), new Point(27,6)];
        for (let e of enemies)
        {
            let npcSprite = new PIXI.Sprite(this.atlas['sprite378']);
            let npc = new Npc(npcSprite, e);
            this.actors.push(npc);

            let npcPos = this.getActorWorldPosition(npc);
            npc.sprite.position.x = npcPos.x;
            npc.sprite.position.y = npcPos.y;
            this.stage.addChild(npc.sprite);
        }
    }

    private gameLoop = () => {
        requestAnimationFrame(this.gameLoop);

        this.updateHud();
        this.applyLightSources();

        this.renderer.render(this.stage);
    }
}

enum HudColor {
    Background = 0x606060, // Grey
    Font = 0xffffff // White
}

enum LightSourceTint {
    Visible = 0xffffff, // None
    Fog = 0x606060, // Grey (dimmed)
    Shroud = 0x000000 // Black -- TODO: Just don't render (.visible) instead.
}