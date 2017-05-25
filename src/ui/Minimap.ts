class Minimap {
    private readonly topLeftStart: Point = new Point(600, 600);
    readonly graphics: PIXI.Graphics;

    constructor() {
        this.graphics = new PIXI.Graphics();
    }

    updateMinimap(
        floorLayer: CellLayer,
        blockLayer: CellLayer,
        lifeLayer: CellLayer,
        itemLayer: CellLayer
    ) : void {
        let scale = 3;
        let opacity = .5;

        this.graphics.clear();

        for (let a of floorLayer.getActors()) {
            if (a.revealed) {
                this.graphics.beginFill(HudColor.White, opacity);
                this.graphics.lineColor = HudColor.White;
                this.graphics.drawRect(this.topLeftStart.x + (a.position.x * scale), this.topLeftStart.y + (a.position.y * scale), scale, scale);
                this.graphics.endFill();
            }
        }

        for (let a of blockLayer.getActors()) {
            if (a.revealed) {
                this.graphics.beginFill(HudColor.Maroon, opacity);
                this.graphics.lineColor = HudColor.Maroon;
                this.graphics.drawRect(this.topLeftStart.x + (a.position.x * scale), this.topLeftStart.y + (a.position.y * scale), scale, scale);
                this.graphics.endFill();
            }
        }

        for (let a of itemLayer.getActors()) {
            if (a.revealed) {
                this.graphics.beginFill(HudColor.Orange, opacity);
                this.graphics.lineColor = HudColor.Orange;
                this.graphics.drawRect(this.topLeftStart.x + (a.position.x * scale), this.topLeftStart.y + (a.position.y * scale), scale, scale);
                this.graphics.endFill();
            }
        }

        for (let a of lifeLayer.getActors()) {
            if (a.revealed && a.animation.sprite.visible) {
                let color: HudColor = HudColor.Red;
                if (a.actorType == ActorType.Hero) {
                    color = HudColor.Green;
                }

                this.graphics.beginFill(color, opacity);
                this.graphics.lineColor = color;
                this.graphics.drawRect(this.topLeftStart.x + (a.position.x * scale), this.topLeftStart.y + (a.position.y * scale), scale, scale);
                this.graphics.endFill();
            }
        }
    }
}