class World {
    game: Game;
    tickNumber: number = 0;

    nextActorId: number = 0;

    private floorLayer: CellLayer;
    private blockLayer: CellLayer;
    private itemLayer: CellLayer;
    private lifeLayer: CellLayer;
    private worldLayers() : CellLayer[] { return [ this.floorLayer, this.blockLayer, this.itemLayer, this.lifeLayer ] }
    private pfCollisionLayer: CellLayer; // For pathfinding only
    hero: Actor;
    playerTurn: boolean = true;

    constructor(game: Game) {
        this.game = game;

        // Setup keyboard events (TODO: eventually move this up to Game)
        this.setupEvents();

        // Generate & load a test map
        let map = MapGenerator.generateTestMap();
        this.loadMap(map);

        // Set camera/lighting/hud/etc (these tasks occur after each turn)
        this.turnEnded();

        // Start game logic
        setInterval(this.tick, (1 / 60) * 1000); // 60 ticks/sec
    }

    tick(tick: number) : void {
        this.tickNumber++;
    }

    private setupEvents() : void {
        window.addEventListener('keydown', (event: KeyboardEvent) => {
            // console.log(event.keyCode);
            // console.log(event.key);
            // this.game.hud.lastKeyPressed = event.key + ' (' + event.keyCode + ')';

            if (this.playerTurn) {
                if (event.keyCode == KeyCode.w) {
                    this.doHeroWait();
                }

                let movement: Point;
                if (event.keyCode == KeyCode.UpArrow || event.keyCode == KeyCode.NumPad8) {
                    movement = new Point(0, -1);
                }
                else if (event.keyCode == KeyCode.DownArrow || event.keyCode == KeyCode.NumPad2) {
                    movement = new Point(0, 1);
                }
                else if (event.keyCode == KeyCode.LeftArrow || event.keyCode == KeyCode.NumPad4) {
                    movement = new Point(-1, 0);
                }
                else if (event.keyCode == KeyCode.RightArrow || event.keyCode == KeyCode.NumPad6) {
                    movement = new Point(1, 0);
                }

                if (movement != null) {
                    this.doHeroMovement(movement);

                    event.preventDefault(); // stop browser scrolling
                }
            }
        });
    }

    private loadMap(map: Map) : void {
        // Setup layers
        this.pfCollisionLayer = new CellLayer(map.width, map.height);
        this.itemLayer = new CellLayer(map.width, map.height);
        this.floorLayer = new CellLayer(map.width, map.height);
        this.blockLayer = new CellLayer(map.width, map.height);
        this.lifeLayer = new CellLayer(map.width, map.height);

        // One-time setup
        for (let a of map.actors) {
            // Assign hero for easier reference
            if (a.actorType == ActorType.Hero) {
                this.hero = a;
            }

            // Add to world
            this.addActorToWorld(a);
        }
    }

    private addActorToWorld(a: Actor) : void {
        // Assign an ID (rendering purposes for now)
        a.id = this.nextActorId;
        this.nextActorId++;

        // Add to appropriate layer
        let layer = this.getCellLayerForActor(a);
        layer.addActor(a, a.position.x, a.position.y);

        // Add to collision layer if appropriate
        if (a.blocksMovement) {
            this.pfCollisionLayer.addActor(a, a.position.x, a.position.y);
        }

        // Add to world
        a.isInWorld = true;
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
    }

    private removeActorFromWorld(a: Actor) : void {
        // Remove from actor layer
        let layer = this.getCellLayerForActor(a);
        layer.removeActor(a, a.position.x, a.position.y);

        // Remove from collision layer if appropriate
        if (a.blocksMovement) {
            this.pfCollisionLayer.removeActor(a, a.position.x, a.position.y);
        }

        // Remove from world
        a.isInWorld = false;
    }

    // TODO: Define elsewhere. Combine the cell layer / container gets. Potentially have them as properties on actor.
    private getCellLayerForActor(a: Actor) : CellLayer {
        let layer: CellLayer = null;
        if (a.actorType == ActorType.Hero || a.actorType == ActorType.Npc)
            layer = this.lifeLayer;
        else if (a.actorType == ActorType.Floor)
            layer = this.floorLayer;
        else if (a.actorType == ActorType.Wall || a.actorType == ActorType.Chest)
            layer = this.blockLayer;
        else if (a.actorType == ActorType.Item)
            layer = this.itemLayer;
        else
            alert('addActorToWorld: could not find a cellLayer for actor type: ' + a.actorType);
        return layer;
    }

    private doHeroWait() : void {
        // this.game.hud.combatLog.push('You waited.');
        this.playerTurn = false;
        this.turnEnded();
        this.doNpcActions();
    }

    private doHeroMovement(movement: Point) : void {
        let destination = Point.Add(this.hero.position, movement);
        let blocker = this.blockLayer.actorAt(destination.x, destination.y);
        let a = this.lifeLayer.actorAt(destination.x, destination.y);
        let item = this.itemLayer.actorAt(destination.x, destination.y);

        let allowMove: boolean = true;
        if (blocker) {
            if (blocker.actorType == ActorType.Wall) {
                // this.game.hud.combatLog.push('You cannot move there.');
            }
            else if (blocker.actorType == ActorType.Chest && !blocker.chestOpen) {
                let item = blocker.openChest();
                this.hero.inventory.addItem(item);
                // this.game.hud.combatLog.push('You opened a chest...  found ' + item.name + '!');
            }

            allowMove = false;
        }
        else if (a) {
            if (a.actorType == ActorType.Npc) {
                // Atack it!
                a.inflictDamage(this.hero.damage);
                // this.game.hud.combatLog.push('You attacked ' + a.name + ' for ' + this.hero.damage + ' damage.');

                if (a.isDead()) {
                    // this.game.hud.combatLog.push('You killed ' + a.name + '!');
                    this.removeActorFromWorld(a);
                }

                allowMove = false;
            }
        }
        else if (item) {
            // For now, assume it's gold
            // Pick it up / give gold
            this.hero.inventory.gold += item.gold;

            // this.game.hud.combatLog.push('You picked up ' + item.gold + ' gold!');
            this.removeActorFromWorld(item);
        }

        if (allowMove) {
            this.updateActorPosition(this.hero, destination);
        }

        this.playerTurn = false;
        this.turnEnded();
        this.doNpcActions();
    }

    private doNpcActions() : void {
        for (let a of this.lifeLayer.getActors()) {
            if (a.actorType == ActorType.Npc) {
                this.doNpcAction(a);
            }
        }

        this.playerTurn = true;
        this.turnEnded();
    }

    private doNpcAction(npc: Actor) {
        // TODO: Attempt to move towards player
        // This is insanely stupid.
        let destination = SimplePathfinder.GetClosestCellBetweenPoints(npc.position, this.hero.position);
        let blocker = this.blockLayer.actorAt(destination.x, destination.y);
        let a = this.lifeLayer.actorAt(destination.x, destination.y);

        let allowMove: boolean = true;
        if (blocker) {
            allowMove = false;
        }
        else if (a) {
            if (a.actorType == ActorType.Hero) {
                // Attack player
                a.inflictDamage(npc.damage);
                // this.game.hud.combatLog.push(npc.name + ' attacked you for for ' + npc.damage + ' damage.');

                if (a.isDead()) {
                    // this.game.hud.combatLog.push(npc.name + ' killed you!');
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

    private turnEnded() : void {
        // this.centerCameraOnHero();
        // this.applyLightSources();
        // this.game.hud.updateHudText(this.hero, this.playerTurn, this.pfCollisionLayer, this.floorLayer, this.blockLayer, this.lifeLayer, this.itemLayer);
        // this.game.minimap.updateMinimap(this.floorLayer, this.blockLayer, this.lifeLayer, this.itemLayer);
    }

    getAllLayerActors() : Actor[] {
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
}