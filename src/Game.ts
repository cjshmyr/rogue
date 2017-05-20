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
    actorLayer: CellLayer;
    collisionLayer: CellLayer;
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
            + '\nHero position (x,y): ' + this.hero.position.x + ',' + this.hero.position.y
            + '\nTurn: ' + (this.playerTurn ? 'player' : 'ai')
            + '\n\n-- layers --'
            + '\nActors: ' + this.actorLayer.actorCount + '/' + this.actorLayer.count
            + '\nCollision: ' + this.collisionLayer.actorCount + '/' + this.collisionLayer.count
    }

    private doHeroAction(movement: Point) : void {
        let destination = Point.Add(this.hero.position, movement);
        let actorsAtDest: Actor[] = this.actorLayer.actorsAt(destination.x, destination.y);

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

        this.centerCameraOnHero();
        this.applyLightSources();
    }

    private doNpcActions() : void {
        for (let a of this.actorLayer.getActors()) {
            if (a instanceof Npc) {
                this.doNpcAction(a);
            }
        }

        this.playerTurn = true;
    }

    private doNpcAction(npc: Npc) {
        // TODO: Attempt to move towards player
        // This is insanely stupid.
        let destination = SimplePathfinder.GetClosestCellBetweenPoints(npc.position, this.hero.position);
        let actorsAtDest = this.actorLayer.actorsAt(destination.x, destination.y);

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

    private addActorToWorld(a: Actor) : void {
        let initPosition = a.position;

        // Add to actor layer
        this.actorLayer.addActor(a, initPosition.x, initPosition.y);

        // Add to collision layer if appropriate
        if (a.blocksMovement) {
            this.collisionLayer.addActor(a, initPosition.x, initPosition.y);
        }

        // Add their sprite
        this.worldContainer.addChild(a.sprite);

        // Update the sprite's render position
        this.updateSpriteRenderPosition(a)
    }

    private updateActorPosition(a: Actor, newPosition: Point) : void {
        // Update the actor map position
        this.actorLayer.moveActor(a, newPosition.x, newPosition.y);

        // Move in collision layer if appropriate
        if (a.blocksMovement) {
            this.collisionLayer.moveActor(a, newPosition.x, newPosition.y);
        }

        // Update the hero's grid location
        a.position = newPosition;

        // Update the sprite's render position
        this.updateSpriteRenderPosition(a)
    }

    private removeActorFromWorld(a: Actor) : void {
        // Remove from actor layer
        this.actorLayer.removeActor(a, a.position.x, a.position.y);

        // Remove from collision layer if appropriate
        if (a.blocksMovement) {
            this.collisionLayer.removeActor(a, a.position.x, a.position.y);
        }

        // Remove their sprite
        this.worldContainer.removeChild(a.sprite);
    }

    private updateSpriteRenderPosition(a: Actor) : void { // TODO: Will need refactor with camera/animation changes.
        let p = this.getSpriteRenderPosition(a);
        a.sprite.x = p.x;
        a.sprite.y = p.y;
    }

    private getSpriteRenderPosition(a: Actor) : Point {
        let rX = a.position.x * this.worldSpriteSize;
        let rY = a.position.y * this.worldSpriteSize;
        return new Point(rX, rY);
    }

    private applyLightSources() : void {
        // Dim/shroud everything, then apply sources
        for (let a of this.actorLayer.getActors()) {
            // Skip processing out-of-bounds actors
            if (!a.renderVisibility)
                continue;

            // Set visible if they're not hidden under fog
            a.sprite.visible = !a.hiddenUnderFog;

            // Set appropriate tint (fog, shroud)
            a.sprite.tint = a.revealed ? LightSourceTint.Fog : LightSourceTint.Shroud;
        }

        // Dynamic lighting (origin to annulus)
        // Using a 3 cell annulus to make close vertical walls light up better (test with range 10). May want to scale with a formula instead.
        for (let annulusPoint of Geometry.pointsInAnnulus(this.hero.position, this.hero.lightSourceRange, 3)) {
             let line = Geometry.pointsInLine(this.hero.position, annulusPoint);

             let obstructing = false;
             // Begin from light source origin
             for (let linePoint of line) {

                if (obstructing)
                    break;

                let distance = Point.Distance(this.hero.position, linePoint);
                let intensity = this.getLightSourceIntensity(distance, this.hero.lightSourceRange);

                for (let a of this.actorLayer.actorsAt(linePoint.x, linePoint.y)) {
                    if (a.blocksLight) {
                        obstructing = true;
                    }

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
        let heroPos = this.getSpriteRenderPosition(this.hero);
        this.worldContainer.x = (this.renderer.width / 2) - heroPos.x;
        this.worldContainer.y = (this.renderer.height / 2) - heroPos.y;

        // don't render things outside of viewport
        let topLeft = heroPos.x - ((this.worldTileDisplayWidth / 2) * this.worldSpriteSize);
        let topRight = heroPos.x + ((this.worldTileDisplayWidth / 2) * this.worldSpriteSize);
        let bottomLeft = heroPos.y - ((this.worldTileDisplayHeight / 2) * this.worldSpriteSize);

        for (let a of this.actorLayer.getActors()) {
            let pos = this.getSpriteRenderPosition(a);

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

        this.updateHud(); // TODO: move out of loop, unless we need to do this every frame

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

        this.actorLayer = new CellLayer(map[0].length, map.length); // Assumes we have no varying size (purely square/rectangle)
        this.collisionLayer = new CellLayer(map[0].length, map.length);

        let floor: Point[] = [];
        let walls: Point[] = [];
        let enemies: Point[] = [];
        let gold: Point[] = [];

        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                let tile = map[y][x];
                let location = new Point(x, y);

                if (tile == 'p') {
                    // let sprite = new PIXI.Sprite(this.creatureAtlas['sprite3']); // EXPERIMENTAL
                    let sprite = new PIXI.Sprite(this.atlas['sprite350']);
                    this.hero = new Hero(sprite, location);
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
            /*
            let spriteNumbers = [15,16,21,22]; // EXPERIMENTAL
            let rand = Math.floor((Math.random() * 4));
            let spriteName = 'sprite' + spriteNumbers[rand];
            let sprite = new PIXI.Sprite(this.tileAtlas[spriteName]);
            */

            let sprite = new PIXI.Sprite(this.atlas['sprite210']);
            let a = new Floor(sprite, p);
            this.addActorToWorld(a);
        }

        for (let p of walls) {
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

            let sprite = new PIXI.Sprite(this.atlas['sprite172']);
            let a = new Wall(sprite, p);
            this.addActorToWorld(a);
        }

        for (let p of gold) {
            // let sprite = new PIXI.Sprite(this.itemAtlas['sprite48']); // EXPERIMENTAL
            let sprite = new PIXI.Sprite(this.atlas['sprite250']);
            let a = new Gold(sprite, p);
            this.addActorToWorld(a);
        }

        for (let p of enemies) {
            // let sprite = new PIXI.Sprite(this.creatureAtlas['sprite46']); // EXPERIMENTAL
            let sprite = new PIXI.Sprite(this.atlas['sprite378']);
            let a = new Npc(sprite, p);
            this.addActorToWorld(a);
        }

        this.addActorToWorld(this.hero);
    }
}