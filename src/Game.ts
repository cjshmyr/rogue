window.onload = () => {
    // TODO: Potentially decouple this loading bit.
    // Load things, start game
    PIXI.loader
        .add('src/art/sprites.json')
        .load(() => { let game = new Game(); })
}

class Game
{
    gr: GameRenderer;
    p: Player;

    constructor() {
        let canvas = <HTMLCanvasElement> document.getElementById("gameCanvas");
        this.gr = new GameRenderer(canvas);

        this.gr.demo();

        window.addEventListener('keydown', this.onKeyDown);
    }

    // TODO: Potentially move elsewhere
    // Key input
    private onKeyDown = (event: KeyboardEvent) => {
        console.log('pressed: ' + event.keyCode);
        //this.gr.helloWorld();

        this.gr.addText(event.key, 100, 100);
    }
}