window.onload = () => {
    // Load things, start game
    PIXI.loader
        .add('core/art/sprites.json')
        // .add('core/art/creatures.json') // EXPERIMENTAL
        // .add('core/art/items.json')
        // .add('core/art/tiles.json')
        .load(() => { let game = new Game(); })
}

class Game {
    // Rendering
    renderer: PIXI.CanvasRenderer | PIXI.WebGLRenderer;
    stage: PIXI.Container;
    worldContainer: PIXI.Container;
    hudContainer: PIXI.Container;
    atlas: PIXI.loaders.TextureDictionary;
    // creatureAtlas: PIXI.loaders.TextureDictionary; // EXPERIMENTAL
    // itemAtlas: PIXI.loaders.TextureDictionary;
    // tileAtlas: PIXI.loaders.TextureDictionary;

    readonly worldSpriteSize: number = 16; // (16x16)
    readonly worldTileDisplayWidth: number = 50; // Matches to canvas size (800)
    readonly worldTileDisplayHeight: number = 50; // Matches to canvas size (800)

    // HUD
    readonly bottomHudStart: Point = new Point(16, 700);
    bottomHudText: PIXI.Text;
    readonly rightHudStart: Point = new Point(600, 16);
    rightHudText: PIXI.Text;
    hudCombatLog: string[] = [];
    hudLastKeyPressed: string;

    // Game
    actors: Actor[]; // TODO: Should we initialize this as an empty array?
    hero: Hero;
    playerTurn: boolean = true;

    collisionLayer: CellLayer;

    constructor() {
        // Setup
        this.setupRenderer();
        this.setupEvents();

        // Game-related setup
        this.setupHud();

        // Load a test map
        this.addTestMap();

        // Set camera/lighting (tasks occur after each turn)
        this.centerCameraOnHero();
        this.applyLightSources();

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
        // this.creatureAtlas = PIXI.loader.resources['core/art/creatures.json'].textures; // EXPERIMENTAL
        // this.itemAtlas = PIXI.loader.resources['core/art/items.json'].textures;
        // this.tileAtlas = PIXI.loader.resources['core/art/tiles.json'].textures;
    }

    private setupEvents() : void {
        window.addEventListener('keydown', (event: KeyboardEvent) => {
            this.hudLastKeyPressed = event.key + ' (' + event.keyCode + ')';

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

                    event.preventDefault(); // stop browser scrolling
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
            + '\nLast key: ' + this.hudLastKeyPressed
            + '\nHero position (x,y): ' + this.hero.location.x + ',' + this.hero.location.y
            + '\nTurn: ' + (this.playerTurn ? 'player' : 'ai')
            + '\n\n-- layers --'
            + '\nCollision: ' + this.collisionLayer.usedCount + '/' + this.collisionLayer.count;
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
            this.setActorPosition(this.hero, destination);
        }

        this.playerTurn = false;
        this.doNpcActions();

        this.centerCameraOnHero();
        this.applyLightSources();
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
            this.setActorPosition(npc, destination);
        }
    }

    private setActorPosition(a: Actor, destination: Point) : void {
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

    private pointsInBox(center: Point, range: number) : Point[] {
        let points: Point[] = [];

        for (let y = center.y - range; y <= center.y + range; y++) {
            for (let x = center.x - range; x <= center.x + range; x++) {
                points.push(new Point(x,y));
            }
        }

        return points;
    }

    private pointsInCircle(center: Point, range: number) : Point[] {
        let pointsInBox = this.pointsInBox(center, range);
        let points: Point[] = [];

        for (let p of pointsInBox) {
            if (Point.DistanceSquared(center, p) <= range * range) {
                points.push(p);
            }
        }

        return points;
    }

    private pointsInAnnulus(center: Point, range: number, thickness: number = 1) : Point[] {
        let points: Point[] = [];

        // Hacky -- eventually replace with Midpoint algorithm
        let pointsInCircle = this.pointsInCircle(center, range);
        let pointsInInnerCircle = this.pointsInCircle(center, range - thickness);

        for (let p of pointsInCircle) {
            let isInInnerCircle = false;

            for (let q of pointsInInnerCircle) {
                if (p.Equals(q)) {
                    isInInnerCircle = true;
                    break;
                }
            }

            if (!isInInnerCircle) {
                points.push(p);
            }
        }

        return points;
    }

    private pointsInLine(start: Point, end: Point) : Point[] {
        // Taken from http://stackoverflow.com/questions/4672279/bresenham-algorithm-in-javascript
        let points: Point[] = [];

        let p1 = new Point(start.x, start.y);
        let p2 = new Point(end.x, end.y);

        let dx = Math.abs(p2.x - p1.x);
        let dy = Math.abs(p2.y - p1.y);
        let sx = (p1.x < p2.x) ? 1 : -1;
        let sy = (p1.y < p2.y) ? 1 : -1;
        let err = dx-dy;

        while (true) {
            points.push(new Point(p1.x, p1.y));  // Do what you need to for this

            if (p1.Equals(p2)) break;
            let e2 = 2 * err;
            if (e2 > -dy) { err -= dy; p1.x += sx; }
            if (e2 < dx) { err += dx; p1.y += sy; }
        }

        return points;
    }

    private debug_listPoints(points: Point[]) : string {
        let debugMe = '';

        for (let p of points) {
            if (debugMe == '')
                debugMe = '(' + p.x + ',' + p.y + ')'
            else
                debugMe += ',(' + p.x + ',' + p.y + ')'
        }

        return debugMe;
    }

    private applyLightSources() : void {
        if (this.actors == null)
            return;

        // Dim/shroud everything, then apply sources
        for (let a of this.actors) {
            // Skip processing out-of-bounds actors
            if (!a.renderVisibility)
                continue;

            // Set visible if they're not hidden under fog
            a.sprite.visible = !a.hiddenUnderFog;

            // Set appropriate tint (fog, shroud)
            a.sprite.tint = a.revealed ? LightSourceTint.Fog : LightSourceTint.Shroud;
        }

        // Dynamic lighting (origin to annulus)
        for (let p of this.pointsInAnnulus(this.hero.location, this.hero.lightSourceRange)) {
             let line = this.pointsInLine(this.hero.location, p);

             let obstructing = false;
             // Begin from light source origin
             for (let point of line) {

                if (obstructing)
                    break;

                for (let a of this.findActorsAtPoint(point)) {
                    if (a.blocksLight) {
                        obstructing = true;
                    }

                    let distance = Point.Distance(this.hero.location, point);
                    let intensity = this.getLightSourceIntensity(distance, this.hero.lightSourceRange);

                    // We don't want to block the object itself from being lit, just ones after it.
                    a.sprite.tint = intensity;
                    a.sprite.visible = true;
                    a.revealed = true;
                }
            }
        }
    }

    private getLightSourceIntensity(distance: number, maxDistance: number) : LightSourceTint {
        let i = distance / maxDistance

        if (i <= 0.75) return LightSourceTint.Visible1;
        if (i <= 0.80) return LightSourceTint.Visible2;
        if (i <= 0.85) return LightSourceTint.Visible3;
        if (i <= 0.90) return LightSourceTint.Visible4;
        if (i <= 0.95) return LightSourceTint.Visible5;
        else return LightSourceTint.Visible6;
    }

    private centerCameraOnHero() : void {
        // center on hero (not exactly center yet)
        let heroPos = this.getActorWorldPosition(this.hero);
        this.worldContainer.x = (this.renderer.width / 2) - heroPos.x;
        this.worldContainer.y = (this.renderer.height / 2) - heroPos.y;

        // don't render things outside of viewport
        let topLeft = heroPos.x - ((this.worldTileDisplayWidth / 2) * this.worldSpriteSize);
        let topRight = heroPos.x + ((this.worldTileDisplayWidth / 2) * this.worldSpriteSize);
        let bottomLeft = heroPos.y - ((this.worldTileDisplayHeight / 2) * this.worldSpriteSize);

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

        this.updateHud(); // 518: move to out of loop

        this.renderer.render(this.stage);
    }

    private addTestMap() : void {
        // Sample map
        let map = [
            "############################################################",
            "#               #        #   #                             #",
            "#          e    #        #   #                             #",
            "#               #                                          #",
            "#      #        #            #                             #",
            "#      #        #            #                             #",
            "# #  # #        #        # e #                             #",
            "# #    #        #        #   #                             #",
            "# #    #        #    ###### ##                             #",
            "#      #                     #                             #",
            "#      #                     #                             #",
            "#      ##########         ####                             #",
            "#      ##########     g      #                             #",
            "#                    ggg                                   #",
            "# e    ##########     g                     p              #",
            "#      ##########            #                             #",
            "#      ###############       #                             #",
            "#                            #                             #",
            "#       #    #      #        #                             #",
            "#                            #                             #",
            "######### ########  e        #                             #",
            "######### ########           #                             #",
            "#  ggggg  ########           #                             #",
            "# ################          ##                             #",
            "# ##############           ###                             #",
            "# #############           ####                             #",
            "# gg  ########          ######                             #",
            "##### ########        ########                             #",
            "#  e                 #########                             #",
            "############################################################",
        ];

        this.collisionLayer = new CellLayer(map[0].length, map.length); // Assumes we have no varying size (purely square/rectangle)

        this.actors = [];

        let floor: Point[] = [];
        let walls: Point[] = [];
        let enemies: Point[] = [];
        let gold: Point[] = [];

        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                let tile = map[y][x];
                let location = new Point(x, y);

                if (tile == 'p') {
                    let sprite = new PIXI.Sprite(this.atlas['sprite350']);
                    // let sprite = new PIXI.Sprite(this.creatureAtlas['sprite3']); // EXPERIMENTAL
                    this.hero = new Hero(sprite, location);
                    this.setActorPosition(this.hero, location);
                    this.actors.push(this.hero);
                }
                else if (tile == '#') {
                    walls.push(location);
                }
                else if (tile == ' ') {
                    // floors are added regardless; do nothing, but don't throw an error
                }
                else if (tile == 'g') {
                    gold.push(location);
                }
                else if (tile == 'e') {
                    enemies.push(location);
                }
                else {
                    alert('loadMap: Unknown actor type: ' + tile);
                    return;
                }

                floor.push(location);
            }
        }

        for (let p of floor) {
            let sprite = new PIXI.Sprite(this.atlas['sprite210']);

            /*
            let spriteNumbers = [15,16,21,22]; // EXPERIMENTAL
            let rand = Math.floor((Math.random() * 4));
            let spriteName = 'sprite' + spriteNumbers[rand];
            let sprite = new PIXI.Sprite(this.tileAtlas[spriteName]);
            */

            let a = new Floor(sprite, p);
            this.setActorPosition(a, p);
            this.actors.push(a);

            this.worldContainer.addChild(a.sprite);
        }

        for (let p of walls) {
            let sprite = new PIXI.Sprite(this.atlas['sprite172']);

            /*
            // check if wall below
            let spriteName = 'sprite25'; // EXPERIMENTAL
            var below = Point.Subtract(p, new Point(0, -1));
            for (let q of walls) {
                if (q.Equals(below)) {
                    spriteName = 'sprite8';
                }
            }
            let sprite = new PIXI.Sprite(this.tileAtlas[spriteName]);
            */

            let a = new Wall(sprite, p);
            this.setActorPosition(a, p);
            this.actors.push(a);

            this.worldContainer.addChild(a.sprite);

            this.collisionLayer.addActor(p.x, p.y, a);
        }

        for (let p of gold) {
            let sprite = new PIXI.Sprite(this.atlas['sprite250']);
            // let sprite = new PIXI.Sprite(this.itemAtlas['sprite48']); // EXPERIMENTAL
            let a = new Gold(sprite, p);
            this.setActorPosition(a, p);
            this.actors.push(a);

            this.worldContainer.addChild(a.sprite);
        }

        for (let p of enemies) {
            let sprite = new PIXI.Sprite(this.atlas['sprite378']);
            // let sprite = new PIXI.Sprite(this.creatureAtlas['sprite46']); // EXPERIMENTAL
            let a = new Npc(sprite, p);
            this.setActorPosition(a, p);
            this.actors.push(a);

            this.worldContainer.addChild(a.sprite);
        }

        this.worldContainer.addChild(this.hero.sprite);
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
    Visible1 = 0xffffff, // None
    Visible2 = 0xf2f2f2, // 95%
    Visible3 = 0xe6e6e6, // 90%
    Visible4 = 0xd9d9d9, // 85%
    Visible5 = 0xcccccc, // 80%
    Visible6 = 0xbfbfbf, // 75%
    Fog = 0x999999, // Grey (dimmed) - 60% darkness
    Shroud = 0x000000 // Black -- TODO: Just don't render (.visible) instead.
}