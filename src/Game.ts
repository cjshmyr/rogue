window.onload = () => {
    let game = new Game();
}

class Game {
    renderer: GameRenderer;
    world: World;
    hud: Hud;
    // minimap: Minimap;

    constructor() {
        this.renderer = new GameRenderer(this);
        this.world = new World(this);

        this.hud = new Hud();
        // this.minimap = new Minimap();
    }

    actorAddedToWorld(a: Actor) {
        this.renderer.actorAdded(a);
    }

    actorRemovedFromWorld(a: Actor) {
        this.renderer.actorRemoved(a);
    }
}

// Old Game.ts stuff that needs retrofitting.

    // NOTE: This is fucked and a mix of both renderer/game logic.
    /*
    private applyLightSources() : void {
        let allActors = this.getAllLayerActors();

        // Dim/shroud everything, then apply sources
        for (let a of allActors) {
            // Skip processing out-of-bounds actors
            if (!a.inRenderBounds)
                continue;

            // Set visible if they're not hidden under fog
            a.animation.sprite.visible = !a.hiddenUnderFog;

            // Set appropriate tint (fog, shroud)
            a.animation.sprite.tint = a.revealed ? LightSourceTint.Fog : LightSourceTint.Shroud;
        }

        // Dynamic lighting (origin to annulus)
        // Using a 3 cell annulus to make close vertical walls light up better (test with range 10). May want to scale with a formula instead.
        for (let a of allActors) {
            if (a.lightSourceRange <= 0) { // Actor doesn't provide any light.
                continue;
            }

            if (a.actorType != ActorType.Hero && !a.revealed && !a.lightSourceAlwaysVisible) { // Non-hero actor hasn't been revealed yet, and we don't want to always show it
                continue;
            }

            for (let annulusPoint of Geometry.pointsInAnnulus(a.position, a.lightSourceRange, 3)) {
                let line = Geometry.pointsInLine(a.position, annulusPoint);

                let obstructing = false;
                // Begin from light source origin
                for (let linePoint of line) {

                    if (obstructing)
                        break;

                    let distance = Point.Distance(a.position, linePoint);
                    let intensity = this.getLightSourceIntensity(distance, a.lightSourceRange);

                    for (let a2 of this.getAllLayerActorsAt(linePoint.x, linePoint.y)) {
                        if (a2.blocksLight) {
                            obstructing = true;
                        }

                        // We don't want to block the object itself from being lit, just ones after it.
                        if (a2.animation.sprite.tint < intensity) { // If lit from multiple light sources, use the strongest light intensity ("blending")
                            a2.animation.sprite.tint = intensity;
                        }
                        a2.animation.sprite.visible = true;
                        a2.revealed = true;
                    }
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
                a.animation.sprite.visible = true;
            }
            else {
                a.inRenderBounds = false;
                a.animation.sprite.visible = false;
            }
        }
    }
    */
