// TODO: Might have reuse w/ sprites
class TextRenderable {
    text: PIXI.Text;
    private ticksRemaining: number;

    complete: boolean = false;
    private lastTick: number;

    readonly scrollsUp: boolean = false;
    // TODO: Fading
    // TODO: Wrappers for this

    constructor(text: string, color: number, renderPosition: Point, tickDuration: number, scrollsUp: boolean) {
        this.text = new PIXI.Text(text);

        this.text.style.fontSize = 12;
        this.text.style.fill = color;
        this.text.style.stroke = HudColor.Black;
        this.text.style.strokeThickness = 2;

        this.text.x = renderPosition.x;
        this.text.y = renderPosition.y;

        this.ticksRemaining = tickDuration;

        this.scrollsUp = scrollsUp;
    }

    Tick(tick: number) : void {
        if (this.ticksRemaining <= 0) {
            this.complete = true;
        }

        if (this.scrollsUp) {
            this.text.y--;
        }

        this.ticksRemaining--;

        this.lastTick = tick;
    }
}