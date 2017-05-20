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
    floorContainer: PIXI.Container;
    wallContainer: PIXI.Container;
    itemContainer: PIXI.Container;
    lifeContainer: PIXI.Container;
    private worldContainers() : PIXI.Container[] { return [ this.floorContainer, this.wallContainer, this.itemContainer, this.lifeContainer ]; }
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
    floorLayer: CellLayer;
    wallLayer: CellLayer;
    itemLayer: CellLayer;
    lifeLayer: CellLayer;
    private worldLayers() : CellLayer[] { return [ this.floorLayer, this.wallLayer, this.itemLayer, this.lifeLayer ] }
    pfCollisionLayer: CellLayer; // For pathfinding only

    hero: Actor;
    playerTurn: boolean = true;

    constructor() {
        // Setup
        this.setupRenderer();
        this.setupEvents();

        // Game-related setup
        this.setupHud();

        // Generate & load a test map
        let map = MapGenerator.generateTestMap();
        this.loadMap(map);

        // Set camera/lighting (tasks occur after each turn) // TODO: this.afterTurn();
        this.centerCameraOnHero();
        this.applyLightSources();
        this.updateHud();

        // Start the game
        this.gameLoop();
    }

    private loadMap(map: Map) : void {
        // Setup layers
        this.pfCollisionLayer = new CellLayer(map.width, map.height);
        this.itemLayer = new CellLayer(map.width, map.height);
        this.floorLayer = new CellLayer(map.width, map.height);
        this.wallLayer = new CellLayer(map.width, map.height);
        this.lifeLayer = new CellLayer(map.width, map.height);

        // One-time setup
        for (let a of map.actors) {
            // Assign hero for easier reference
            if (a.actorType == ActorType.Hero) {
                this.hero = a;
            }

            // Setup their sprites
            let texture = this.getSpriteTexture(a.name);
            a.sprite = new PIXI.Sprite(texture);

            // Add to world
            this.addActorToWorld(a);
        }
    }

    // TODO: Define elsewhere
    private getSpriteTexture(actorName: string) : PIXI.Texture {
        let file = '';
        if (actorName == 'Hero') file = 'sprite350';
        else if (actorName == 'Floor') file = 'sprite210'
        else if (actorName == 'Wall') file = 'sprite172'
        else if (actorName == 'Gold') file = 'sprite250'
        else if (actorName == 'Monster') file = 'sprite378'
        else alert('getSpriteTexture: Unknown actor name -> sprite file: ' + actorName);
        return this.atlas[file];
    }

    private setupRenderer() : void {
        let canvas = <HTMLCanvasElement> document.getElementById("gameCanvas");
        this.renderer = PIXI.autoDetectRenderer(800, 800, { backgroundColor: CanvasColor.Background, view: canvas });
        this.stage = new PIXI.Container();
        this.floorContainer = new PIXI.Container();
        this.wallContainer = new PIXI.Container();
        this.itemContainer = new PIXI.Container();
        this.lifeContainer = new PIXI.Container();
        this.hudContainer = new PIXI.Container();

        this.stage.addChild(this.floorContainer);
        this.stage.addChild(this.wallContainer);
        this.stage.addChild(this.itemContainer);
        this.stage.addChild(this.lifeContainer);
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

        this.rightHudText.text = 'Health: ' + this.hero.hitpoints
            + '\nGold: ' + this.hero.gold
            + '\n\n-- debug --'
            + '\nLast key: ' + this.hudLastKeyPressed
            + '\nHero position (x,y): ' + this.hero.position.x + ',' + this.hero.position.y
            + '\nTurn: ' + (this.playerTurn ? 'player' : 'ai')
            + '\n\n-- layers --'
            // + '\nActors: ' + this.actorLayer.actorCount + '/' + this.actorLayer.count
            + '\nCollision: ' + this.pfCollisionLayer.actorCount + '/' + this.pfCollisionLayer.count
            + '\nFloor: ' + this.floorLayer.actorCount + '/' + this.floorLayer.count
            + '\nWall: ' + this.wallLayer.actorCount + '/' + this.wallLayer.count
            + '\nLife: ' + this.lifeLayer.actorCount + '/' + this.lifeLayer.count
            + '\nItem: ' + this.itemLayer.actorCount + '/' + this.itemLayer.count
    }

    private doHeroAction(movement: Point) : void {
        let destination = Point.Add(this.hero.position, movement);
        let wall = this.wallLayer.actorAt(destination.x, destination.y);
        let a = this.lifeLayer.actorAt(destination.x, destination.y);
        let item = this.itemLayer.actorAt(destination.x, destination.y);

        let allowMove: boolean = true;
        if (wall) {
            this.hudCombatLog.push('You cannot move there.');
            allowMove = false;
        }
        else if (a) {
            if (a.actorType == ActorType.Npc) {
                // Atack it!
                a.inflictDamage(this.hero.damage);
                this.hudCombatLog.push('You attacked ' + a.name + ' for ' + this.hero.damage + ' damage.');

                if (a.isDead()) {
                    this.hudCombatLog.push('You killed ' + a.name + '!');
                    this.removeActorFromWorld(a);
                }

                allowMove = false;
            }
        }
        else if (item) {
            // For now, assume it's gold
            // Pick it up / give gold
            this.hero.gold += a.gold; // HACKY: it should be a different property.

            this.hudCombatLog.push('You picked up ' + a.gold + ' gold!');
            this.removeActorFromWorld(a);
        }

        if (allowMove) {
            this.updateActorPosition(this.hero, destination);
        }

        this.playerTurn = false;
        this.doNpcActions();

        this.centerCameraOnHero();
        this.applyLightSources();
        this.updateHud();
    }

    private doNpcActions() : void {
        for (let a of this.lifeLayer.getActors()) {
            if (a.actorType == ActorType.Npc) {
                this.doNpcAction(a);
            }
        }

        this.playerTurn = true;
    }

    private doNpcAction(npc: Actor) {
        // TODO: Attempt to move towards player
        // This is insanely stupid.
        let destination = SimplePathfinder.GetClosestCellBetweenPoints(npc.position, this.hero.position);
        let wall = this.wallLayer.actorAt(destination.x, destination.y);
        let a = this.lifeLayer.actorAt(destination.x, destination.y);

        let allowMove: boolean = true;
        if (wall) {
            allowMove = false;
        }
        else if (a) {
            if (a.actorType == ActorType.Hero) {
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

        this.applyLightSources();
        this.updateHud();
    }

    private addActorToWorld(a: Actor) : void {
        let initPosition = a.position;

        // Add to appropriate layer
        let layer = this.getCellLayerForActor(a);
        layer.addActor(a, initPosition.x, initPosition.y);

        // Add to collision layer if appropriate
        if (a.blocksMovement) {
            this.pfCollisionLayer.addActor(a, initPosition.x, initPosition.y);
        }

        // Add their sprite
        let container = this.getContainerForActor(a);
        container.addChild(a.sprite);

        // Update the sprite's render position
        this.updateSpriteRenderPosition(a)
    }

    private updateActorPosition(a: Actor, newPosition: Point) : void {
        // Update the actor map position
        let layer = this.getCellLayerForActor(a);
        layer.moveActor(a, newPosition.x, newPosition.y);

        // Add to collision layer if appropriate
        if (a.blocksMovement) {
            this.pfCollisionLayer.moveActor(a, newPosition.x, newPosition.y);
        }

        // Update the hero's grid location
        a.position = newPosition;

        // Update the sprite's render position
        this.updateSpriteRenderPosition(a)
    }

    private removeActorFromWorld(a: Actor) : void {
        // Remove from actor layer
        let layer = this.getCellLayerForActor(a);
        layer.removeActor(a, a.position.x, a.position.y);

        // Remove from collision layer if appropriate
        if (a.blocksMovement) {
            this.pfCollisionLayer.removeActor(a, a.position.x, a.position.y);
        }

        // Remove their sprite
        let container = this.getContainerForActor(a);
        container.removeChild(a.sprite);
    }

    // TODO: Combine the cell layer / container gets
    private getCellLayerForActor(a: Actor) : CellLayer {
        let layer: CellLayer = null;
        if (a.actorType == ActorType.Hero || a.actorType == ActorType.Npc)
            layer = this.lifeLayer;
        else if (a.actorType == ActorType.Floor)
            layer = this.floorLayer;
        else if (a.actorType == ActorType.Wall)
            layer = this.wallLayer;
        else if (a.actorType == ActorType.Item)
            layer = this.itemLayer;
        else
            alert('addActorToWorld: could not find a cellLayer for type: ' + a.actorType);
        return layer;
    }

    private getContainerForActor(a: Actor) : PIXI.Container {
        let container: PIXI.Container = null;
        if (a.actorType == ActorType.Hero || a.actorType == ActorType.Npc)
            container = this.lifeContainer;
        else if (a.actorType == ActorType.Floor)
            container = this.floorContainer;
        else if (a.actorType == ActorType.Wall)
            container = this.wallContainer;
        else if (a.actorType == ActorType.Item)
            container = this.itemContainer;
        else
            alert('addActorToWorld: could not find a container for type: ' + a.actorType);
        return container;
    }

    private updateSpriteRenderPosition(a: Actor) : void { // TODO: Will need refactor with camera/animation changes.
        let p = this.getSpriteRenderPosition(a);
        a.sprite.x = p.x;
        a.sprite.y = p.y;
    }

    private getSpriteRenderPosition(a: Actor) : Point {
        if (a.position == null) {
            var broken = true;
        }

        let rX = a.position.x * this.worldSpriteSize;
        let rY = a.position.y * this.worldSpriteSize;
        return new Point(rX, rY);
    }

    private getAllLayerActors() : Actor[] {
        let actors: Actor[] = [];
        for (let l of this.worldLayers()) {
            actors = actors.concat(l.getActors());
        }
        return actors;
    }

    private getAllLayerActorsAt(x: number, y: number) : Actor[] {
        let actors: Actor[] = [];
        for (let l of this.worldLayers()) {
            var a = l.actorAt(x, y);
            if (a != null) { // Don't add nulls
                actors.push(a);
            }
        }
        return actors;
    }

    private applyLightSources() : void {
        // Dim/shroud everything, then apply sources
        for (let a of this.getAllLayerActors()) {
            // Skip processing out-of-bounds actors
            if (!a.inRenderBounds)
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

                for (let a of this.getAllLayerActorsAt(linePoint.x, linePoint.y)) {
                    if (a == null) {
                        let bad = true;
                        continue; // SHOULD NEVER HAPPEN???
                    }

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
        for (let c of this.worldContainers()) {
            c.x = (this.renderer.width / 2) - heroPos.x;
            c.y = (this.renderer.height / 2) - heroPos.y;
        }

        // don't render things outside of viewport
        let topLeft = heroPos.x - ((this.worldTileDisplayWidth / 2) * this.worldSpriteSize);
        let topRight = heroPos.x + ((this.worldTileDisplayWidth / 2) * this.worldSpriteSize);
        let bottomLeft = heroPos.y - ((this.worldTileDisplayHeight / 2) * this.worldSpriteSize);

        for (let a of this.getAllLayerActors()) {
            let pos = this.getSpriteRenderPosition(a);

            if (pos.x >= topLeft && pos.x <= topRight && pos.y >= bottomLeft) {
                a.inRenderBounds = true;
                a.sprite.visible = true;
            }
            else {
                a.inRenderBounds = false;
                a.sprite.visible = false;
            }
        }
    }

    private gameLoop = () => {
        requestAnimationFrame(this.gameLoop);
        this.renderer.render(this.stage);
    }
}