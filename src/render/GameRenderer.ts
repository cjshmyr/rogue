class GameRenderer {
    readonly game: Game;
    tickNumber: number;

    // Rendering
    renderer: PIXI.CanvasRenderer | PIXI.WebGLRenderer;
    stage: PIXI.Container;
    floorContainer: PIXI.Container;
    blockContainer: PIXI.Container;
    itemContainer: PIXI.Container;
    lifeContainer: PIXI.Container;
    private worldContainers() : PIXI.Container[] { return [ this.floorContainer, this.blockContainer, this.itemContainer, this.lifeContainer ]; }
    minimapContainer: PIXI.Container;
    hudContainer: PIXI.Container;
    atlas: PIXI.loaders.TextureDictionary;

    readonly worldSpriteSize: number = 16; // (16x16)
    readonly worldTileDisplayWidth: number = 50; // Matches to canvas size (800)
    readonly worldTileDisplayHeight: number = 50; // Matches to canvas size (800)

    // HUD / Minimap
    // hud: Hud
    // minimap: Minimap;

    constructor(game: Game) {
        this.game = game;

        // Load art, initialize renderer
        PIXI.loader
            .add('core/art/sprites.json')
            .load(() => {
                GameTextures.Init();
                this.initialize();
            });
    }

    private nextFrame = () => {
        requestAnimationFrame(this.nextFrame);

        this.renderer.render(this.stage);

        this.tickNumber++;
    }

    initialize() : void {
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


    actorAnimations: ActorAnimation[] = [];
    actorAdded(a: Actor) : void {
        let anim = new Animation(a.name);
        let actorAnim = new ActorAnimation(a, anim);
        this.actorAnimations.push(actorAnim);

        // Add to stage
        let container = this.getContainerForActor(a);
        container.addChild(actorAnim.animation.sprite);

        // Set render position
        this.updateSpriteRenderPosition(actorAnim);
    }

    actorRemoved(a: Actor) : void {

    }

    private getSpriteTexture(animationName: string) : PIXI.Texture {
        let file = '';

        if (animationName == 'Hero-idle') file = 'sprite350';
        else if (animationName == 'Floor-idle') file = 'sprite210';
        else if (animationName == 'Wall-idle') file = 'sprite172';
        else if (animationName == 'Gold-idle') file = 'sprite250';
        else if (animationName == 'Monster-idle') file = 'sprite378';
        else if (animationName == 'Torch-idle') file = 'sprite247';
        else if (animationName == 'Chest-idle') file = 'sprite244';
        else if (animationName == 'Chest-idle2') file = 'sprite245';
        else alert('getSpriteTexture: Unknown animation name -> sprite file: ' + animationName);
        return this.atlas[file];
    }

    // TODO: Define elsewhere. Combine the cell layer / container gets. Potentially have them as properties on actor.
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

    private updateSpriteRenderPosition(actorAnim: ActorAnimation) : void { // TODO: Will need refactor with camera/animation changes.
        let p = this.getSpriteRenderPosition(actorAnim.actor);
        actorAnim.animation.sprite.x = p.x;
        actorAnim.animation.sprite.y = p.y;
    }

    private getSpriteRenderPosition(a: Actor) : Point {
        let rX = a.position.x * this.worldSpriteSize;
        let rY = a.position.y * this.worldSpriteSize;
        return new Point(rX, rY);
    }
}