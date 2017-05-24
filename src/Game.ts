window.onload = () => {
    let game = new Game();
}

class Game {
    renderer: GameRenderer;
    world: World;
    // hud: Hud;
    // minimap: Minimap;

    constructor() {
        this.renderer = new GameRenderer(this);
        this.world = new World(this);

        // this.hud = new Hud(); // TODO: Split this.
        // this.minimap = new Minimap();
    }
}