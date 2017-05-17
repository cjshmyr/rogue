window.onload = () => {
    // Load things, start game
    PIXI.loader
        .add('core/art/sprites.json')
        .load(() => { let game = new Game(); })
}

class Game {
    // Rendering
    renderer: PIXI.CanvasRenderer | PIXI.WebGLRenderer;
    stage: PIXI.Container;
    worldContainer: PIXI.Container;
    hudContainer: PIXI.Container;
    atlas: PIXI.loaders.TextureDictionary;

    readonly worldSpriteSize: number = 16; // (16x16)
    readonly worldTileWidth: number = 50; // Matches to canvas size (800)
    readonly worldTileHeight: number = 50; // Matches to canvas size (800)

    // HUD
    readonly bottomHudStart: Point = new Point(16, 700);
    bottomHudText: PIXI.Text;
    readonly rightHudStart: Point = new Point(600, 16);
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
        this.renderer = PIXI.autoDetectRenderer(800, 800, { backgroundColor: CanvasColor.Background, view: canvas });
        this.stage = new PIXI.Container();
        this.worldContainer = new PIXI.Container();
        this.hudContainer = new PIXI.Container();

        this.stage.addChild(this.worldContainer);
        this.stage.addChild(this.hudContainer);

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
        this.bottomHudText = new PIXI.Text('');
        this.bottomHudText.style.fontSize = 12;
        this.bottomHudText.style.fill = HudColor.White;
        this.bottomHudText.style.stroke = HudColor.Black;
        this.bottomHudText.style.strokeThickness = 2;
        this.bottomHudText.x = this.bottomHudStart.x;
        this.bottomHudText.y = this.bottomHudStart.y;
        this.hudContainer.addChild(this.bottomHudText);

        this.rightHudText = new PIXI.Text('');
        this.rightHudText.style.fontSize = 12;
        this.rightHudText.style.fill = HudColor.White;
        this.rightHudText.style.stroke = HudColor.Black;
        this.rightHudText.style.strokeThickness = 2;
        this.rightHudText.x = this.rightHudStart.x;
        this.rightHudText.y = this.rightHudStart.y;
        this.hudContainer.addChild(this.rightHudText);
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
        this.bottomHudText.text = combatLog;

        this.rightHudText.text = 'Health: ' + this.hero.health
            + '\nGold: ' + this.hero.gold
            + '\n\n-- debug --'
            + '\nLast key pressed: ' + this.hudLastPressedKey
            + '\nHero position (x,y): ' + this.hero.location.x + ',' + this.hero.location.y
            + '\nTurn: ' + (this.playerTurn ? 'player' : 'ai');
    }

    private removeActorFromWorld(a: Actor) : void {
        // Remove their sprite
        this.worldContainer.removeChild(a.sprite);

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

            // this.moveCameraPosition(destination);
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
            a.sprite.position.x = (a.location.x * this.worldSpriteSize),
            a.sprite.position.y = (a.location.y * this.worldSpriteSize)
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

        // Dim/shroud everything, then apply sources
        for (let a of this.actors) {
            // Skip processing out-of-bounds actors
            if (!a.renderVisibility)
                continue;

            // Render if they're not hidden under fog
            a.sprite.visible = !a.hiddenUnderFog;

            // Set appropriate tint (fog, shroud)
            a.sprite.tint = a.revealed ? LightSourceTint.Fog : LightSourceTint.Shroud;
        }

        // Hacky: assumes hero's the only source
        let nearbyPoints = this.pointsInCircle(this.hero.location, this.hero.lightSourceRange);
        let nearbyActors = this.findActorsAtPoints(nearbyPoints);

        for (let a of nearbyActors) {
            a.sprite.tint = LightSourceTint.Visible;
            a.sprite.visible = true;
            a.revealed = true;
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
            this.worldContainer.addChild(a.sprite);
        }

        // Add a player at 1,1
        let sprite = new PIXI.Sprite(this.atlas['sprite350']);
        this.hero = new Hero(sprite, new Point(2, 2));
        this.actors.push(this.hero);

        let heroPos = this.getActorWorldPosition(this.hero);
        this.hero.sprite.position.x = heroPos.x;
        this.hero.sprite.position.y = heroPos.y;
        this.worldContainer.addChild(this.hero.sprite);

        // Add something you can pick up
        let goldSprite = new PIXI.Sprite(this.atlas['sprite250']);
        let gold = new Gold(goldSprite, new Point(3, 1));
        this.actors.push(gold);

        let goldPos = this.getActorWorldPosition(gold);
        gold.sprite.position.x = goldPos.x;
        gold.sprite.position.y = goldPos.y;
        this.worldContainer.addChild(gold.sprite);

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
            this.worldContainer.addChild(npc.sprite);
        }
    }

    private centerCameraOnHero() : void {
        // center on hero (not exactly center yet)
        let heroPos = this.getActorWorldPosition(this.hero);
        this.worldContainer.x = (this.renderer.width / 2) - heroPos.x;
        this.worldContainer.y = (this.renderer.height / 2) - heroPos.y;

        // don't render things outside of viewport
        let topLeft = heroPos.x - ((this.worldTileWidth / 2) * this.worldSpriteSize);
        let topRight = heroPos.x + ((this.worldTileWidth / 2) * this.worldSpriteSize);
        let bottomLeft = heroPos.y - ((this.worldTileHeight / 2) * this.worldSpriteSize);

        for (let a of this.actors) {
            let pos = this.getActorWorldPosition(a);

            if (pos.x >= topLeft && pos.x <= topRight && pos.y >= bottomLeft) {
                a.renderVisibility = true;
                a.sprite.visible = true;
            }
            else {
                a.renderVisibility = false;
                a.sprite.visible = false;
            }

        }

    }

    private gameLoop = () => {
        requestAnimationFrame(this.gameLoop);

        this.centerCameraOnHero(); // TODO: Doesn't need to happen every tick?

        this.updateHud();
        this.applyLightSources();

        this.renderer.render(this.stage);
    }
}

// TODO: A debug mode to change the HudColor.Background
enum CanvasColor {
    Background = 0x000000 // Black. (used to be 0x606060 - Grey)
}

enum HudColor {
    Black = 0x000000,
    White = 0xffffff
}

enum LightSourceTint {
    Visible = 0xffffff, // None
    Fog = 0xa6a6a6, // Grey (dimmed) - 65% darkness
    Shroud = 0x000000 // Black -- TODO: Just don't render (.visible) instead.
}