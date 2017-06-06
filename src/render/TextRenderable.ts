// TODO: Might have reuse w/ sprites
class TextRenderable {
    text: PIXI.Text;
    private ticksRemaining: number;

    complete: boolean = false;
    private lastTick: number;

    constructor(text: string, renderPosition: Point, tickDuration: number) {
        this.text = new PIXI.Text(text);

        this.text.style.fontSize = 12;
        this.text.style.fill = HudColor.White;
        this.text.style.stroke = HudColor.Black;
        this.text.style.strokeThickness = 2;

        this.text.x = renderPosition.x;
        this.text.y = renderPosition.y;

        this.ticksRemaining = tickDuration;
    }

    Tick(tick: number) : void {
        if (this.ticksRemaining <= 0) {
            this.complete = true;
        }

        this.ticksRemaining--;

        this.lastTick = tick;
    }
}