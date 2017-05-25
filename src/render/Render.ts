class Renderer {
    renderer: PIXI.CanvasRenderer | PIXI.WebGLRenderer;
    stage: PIXI.Container;
    floorContainer: PIXI.Container;
    blockContainer: PIXI.Container;
    itemContainer: PIXI.Container;
    lifeContainer: PIXI.Container;
    private worldContainers() : PIXI.Container[] { return [ this.floorContainer, this.blockContainer, this.itemContainer, this.lifeContainer ]; }
    minimapContainer: PIXI.Container;
    hudContainer: PIXI.Container;
    characterUiContainer: PIXI.Container;

    readonly worldSpriteSize: number = 16; // (16x16)
    readonly worldTileDisplayWidth: number = 50; // Matches to canvas size (800)
    readonly worldTileDisplayHeight: number = 50; // Matches to canvas size (800)

    renderActors: Actor[] = [];

    renderTick: number = 0;

    constructor() {
        let canvas = <HTMLCanvasElement> document.getElementById("gameCanvas");
        this.renderer = PIXI.autoDetectRenderer(800, 800, { backgroundColor: CanvasColor.Background, view: canvas });
        this.stage = new PIXI.Container();
        this.floorContainer = new PIXI.Container();
        this.blockContainer = new PIXI.Container();
        this.itemContainer = new PIXI.Container();
        this.lifeContainer = new PIXI.Container();
        this.minimapContainer = new PIXI.Container();
        this.hudContainer = new PIXI.Container();
        this.characterUiContainer = new PIXI.Container();

        this.stage.addChild(this.floorContainer);
        this.stage.addChild(this.blockContainer);
        this.stage.addChild(this.itemContainer);
        this.stage.addChild(this.lifeContainer);
        this.stage.addChild(this.minimapContainer);
        this.stage.addChild(this.hudContainer);
        this.stage.addChild(this.characterUiContainer);

        // Start rendering
        this.renderLoop();
    }

    addHud(hud: Hud) : void {
        this.hudContainer.addChild(hud.combatHud);
        this.hudContainer.addChild(hud.infoHud);
    }

    addMinimap(minimap: Minimap) : void {
        this.minimapContainer.addChild(minimap.graphics);
    }

    addCharacterUi(characterUi: CharacterUi) : void {
        this.characterUiContainer.addChild(characterUi.graphics);
    }

    addActor(a: Actor) : void {
        // Add their sprite
        let container = this.getContainerForActor(a);
        container.addChild(a.animation.sprite);

        // Update the sprite's render position
        this.updateSpriteRenderPosition(a)

        // Add to array for render looping
        this.renderActors.push(a);
    }

    moveActor(a: Actor) : void {
        // Update the sprite's render position
        this.updateSpriteRenderPosition(a)
    }

    removeActor(a: Actor) : void {
        // Remove their sprite
        let container = this.getContainerForActor(a);
        container.removeChild(a.animation.sprite);

        // Remove from array for render looping
        let index = this.renderActors.indexOf(a);
        if (index > -1) {
            this.renderActors.splice(index, 1);
        }
    }

    private updateSpriteRenderPosition(a: Actor) : void { // TODO: Will need refactor with camera/animation changes.
        let p = this.getSpriteRenderPosition(a);
        a.animation.sprite.x = p.x;
        a.animation.sprite.y = p.y;
    }

    private getContainerForActor(a: Actor) : PIXI.Container {
        let container: PIXI.Container = null;
        if (a.actorType == ActorType.Hero || a.actorType == ActorType.Npc)
            container = this.lifeContainer;
        else if (a.actorType == ActorType.Floor)
            container = this.floorContainer;
        else if (a.actorType == ActorType.Wall || a.actorType == ActorType.Chest || a.actorType == ActorType.Door)
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

    centerViewportOnHero(hero: Actor, allActors: Actor[]) : void {
        // This expects all actors.

        // center on hero (not exactly center yet)
        let heroPos = this.getSpriteRenderPosition(hero);
        for (let c of this.worldContainers()) {
            c.x = (this.renderer.width / 2) - heroPos.x;
            c.y = (this.renderer.height / 2) - heroPos.y;
        }

        // don't render things outside of viewport
        let topLeft = heroPos.x - ((this.worldTileDisplayWidth / 2) * this.worldSpriteSize);
        let topRight = heroPos.x + ((this.worldTileDisplayWidth / 2) * this.worldSpriteSize);
        let bottomLeft = heroPos.y - ((this.worldTileDisplayHeight / 2) * this.worldSpriteSize);

        for (let a of allActors) {
            let pos = this.getSpriteRenderPosition(a);

            if (pos.x >= topLeft && pos.x <= topRight && pos.y >= bottomLeft) {
                a.inRenderBounds = true;
                a.animation.sprite.visible = true;
            }
            else {
                a.inRenderBounds = false;
                a.animation.sprite.visible = false;
            }
        }
    }

    private renderLoop = () => {
        requestAnimationFrame(this.renderLoop);

        for (let a of this.renderActors) {
            a.animation.Tick(this.renderTick);
        }

        this.renderer.render(this.stage);

        this.renderTick++;
    }
}