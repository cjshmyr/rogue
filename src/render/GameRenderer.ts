class GameRenderer {
    private readonly game: Game;
    tickNumber: number = 0;

    // Rendering
    private renderer: PIXI.CanvasRenderer | PIXI.WebGLRenderer;
    private stage: PIXI.Container;
    private floorContainer: PIXI.Container;
    private blockContainer: PIXI.Container;
    private itemContainer: PIXI.Container;
    private lifeContainer: PIXI.Container;
    private worldContainers() : PIXI.Container[] { return [ this.floorContainer, this.blockContainer, this.itemContainer, this.lifeContainer ]; }
    private minimapContainer: PIXI.Container;
    private hudContainer: PIXI.Container;
    private atlas: PIXI.loaders.TextureDictionary;

    private readonly worldSpriteSize: number = 16; // (16x16)
    private readonly worldTileDisplayWidth: number = 50; // Matches to canvas size (800)
    private readonly worldTileDisplayHeight: number = 50; // Matches to canvas size (800)

    // HUD / Minimap
    // hud: Hud
    // minimap: Minimap;

    constructor(game: Game) {
        this.game = game;

        // Load art, initialize renderer
        PIXI.loader
            .add('core/art/sprites.json')
            .load(() => {
                GameTextures.initialize();
                this.initialize();
            });
    }

    private initialize() : void {
        // Setup
        let canvas = <HTMLCanvasElement> document.getElementById("gameCanvas");
        this.renderer = PIXI.autoDetectRenderer(800, 800, { backgroundColor: CanvasColor.Background, view: canvas });
        this.stage = new PIXI.Container();
        this.floorContainer = new PIXI.Container();
        this.blockContainer = new PIXI.Container();
        this.itemContainer = new PIXI.Container();
        this.lifeContainer = new PIXI.Container();
        this.minimapContainer = new PIXI.Container();
        this.hudContainer = new PIXI.Container();

        this.stage.addChild(this.floorContainer);
        this.stage.addChild(this.blockContainer);
        this.stage.addChild(this.itemContainer);
        this.stage.addChild(this.lifeContainer);
        this.stage.addChild(this.minimapContainer);
        this.stage.addChild(this.hudContainer);

        this.atlas = PIXI.loader.resources['core/art/sprites.json'].textures;

        // UI
        /*
        this.hud = new Hud();
        this.hudContainer.addChild(this.hud.combatHud)
        this.hudContainer.addChild(this.hud.infoHud)
        this.minimap = new Minimap();
        this.minimapContainer.addChild(this.minimap.graphics);
        */

        // Start the game
        this.nextFrame();
    }

    private actorAnimations: ActorAnimation[] = [];

    private getActorAnimation(a: Actor) : ActorAnimation {
        for (let anim of this.actorAnimations) {
            if (anim.actor.id == a.id) {
                return anim;
            }
        }
        return null;
    }

    private nextFrame = () => {
        requestAnimationFrame(this.nextFrame);

        let w = this.game.world;
        for (let a of w.getAllLayerActors()) {
            let anim = this.getActorAnimation(a);

            if (a.isInWorld && !anim) {
                let anim = new ActorAnimation(a);
                this.actorAnimations.push(anim);

                // Add to proper container
                let container = this.getContainerForActor(a);
                container.addChild(anim.sprite);
            }
            else if (!a.isInWorld && anim) {
                for (let anim of this.actorAnimations) {
                    if (anim.actor.id == a.id) {
                        let index = this.actorAnimations.indexOf(anim);
                        if (index > -1) {
                            this.actorAnimations.splice(index, 1);
                        }

                        // Remove from container
                        let container = this.getContainerForActor(a);
                        container.removeChild(anim.sprite);
                    }
                }
            }
        }

        for (let m of this.actorAnimations) {
            // Update render positions (just in case they've moved) -- this will likely change later.
            let rPos = this.getSpriteRenderPosition(m.actor);
            m.sprite.position.x = rPos.x;
            m.sprite.position.y = rPos.y;

            // Tick the animation
            m.tick(this.tickNumber);
        }

        this.renderer.render(this.stage);

        this.tickNumber++;
    }

    private getContainerForActor(a: Actor) : PIXI.Container {
        let container: PIXI.Container = null;
        if (a.actorType == ActorType.Hero || a.actorType == ActorType.Npc)
            container = this.lifeContainer;
        else if (a.actorType == ActorType.Floor)
            container = this.floorContainer;
        else if (a.actorType == ActorType.Wall || a.actorType == ActorType.Chest)
            container = this.blockContainer;
        else if (a.actorType == ActorType.Item)
            container = this.itemContainer;
        else
            alert('addActorToWorld: could not find a container for actor type: ' + a.actorType);
        return container;
    }

    private getSpriteRenderPosition(a: Actor) : Point {
        let rX = a.position.x * this.worldSpriteSize;
        let rY = a.position.y * this.worldSpriteSize;
        return new Point(rX, rY);
    }
}