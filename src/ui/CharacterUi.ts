class CharacterUi {
    private readonly windowStart: Point = new Point(200, 200);
    graphics: PIXI.Graphics;
    opened: boolean = false;

    constructor() {
        this.graphics = new PIXI.Graphics();
    }

    toggle(hero: Actor) : void {
        if (!this.opened) {
            this.openWindow(hero);
        }
        else {
            this.closeWindow();
        }
        this.opened = !this.opened
    }

    private openWindow(hero: Actor) : void {
        let opacity = .5;

        this.graphics.beginFill(HudColor.White, opacity)
        this.graphics.lineColor = HudColor.White;
        this.graphics.drawRect(this.windowStart.x, this.windowStart.y, 200, 200);
        this.graphics.endFill();
    }

    private closeWindow() : void {
        this.graphics.clear();
    }
}