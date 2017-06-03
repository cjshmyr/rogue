class Hud {
    private readonly combatHudStart: Point = new Point(16, 600);
    private readonly infoHudStart: Point = new Point(600, 16);
    combatHud: PIXI.Text;
    infoHud: PIXI.Text;
    combatLog: string[] = [];
    lastKeyPressed: string;

    constructor() {
        this.combatHud = new PIXI.Text('');
        this.combatHud.style.fontSize = 12;
        this.combatHud.style.fill = HudColor.White;
        this.combatHud.style.stroke = HudColor.Black;
        this.combatHud.style.strokeThickness = 2;
        this.combatHud.position.x = this.combatHudStart.x;
        this.combatHud.position.y = this.combatHudStart.y;

        this.infoHud = new PIXI.Text('');
        this.infoHud.style.fontSize = 12;
        this.infoHud.style.fill = HudColor.White;
        this.infoHud.style.stroke = HudColor.Black;
        this.infoHud.style.strokeThickness = 2;
        this.infoHud.position.x = this.infoHudStart.x;
        this.infoHud.position.y = this.infoHudStart.y;
    }

    updateHudText(
        hero: Actor,
        playerTurn: boolean,
        floorLayer: CellLayer,
        blockLayer: CellLayer,
        lifeLayer: CellLayer,
        itemLayer: CellLayer
    ) : void {
        // Display the 12-top most items
        let log = '';
        let lastLines = this.combatLog.slice(Math.max(this.combatLog.length - 12, 0));
        for (let l of lastLines) {
            if (log == '')
                log = l;
            else
                log += '\n' + l;
        }
        this.combatHud.text = log;

        this.infoHud.text = 'Health: ' + hero.hitpoints
            + '\nGold: ' + hero.inventory.gold
            + '\nItems: ' + hero.inventory.items.length
            + '\n\n-- debug --'
            + '\nLast key: ' + this.lastKeyPressed
            + '\nHero position (x,y): ' + hero.position.x + ',' + hero.position.y
            + '\nTurn: ' + (playerTurn ? 'player' : 'ai')
            + '\n\n-- layers --'
            + '\nFloor: ' + floorLayer.actorCount + '/' + floorLayer.cellCount
            + '\nBlock: ' + blockLayer.actorCount + '/' + blockLayer.cellCount
            + '\nLife: ' + lifeLayer.actorCount + '/' + lifeLayer.cellCount
            + '\nItem: ' + itemLayer.actorCount + '/' + itemLayer.cellCount
    }
}