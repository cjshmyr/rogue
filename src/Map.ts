class Map {
    actors: Actor[];
    width: number;
    height: number;
    constructor() {
        this.actors = [];
    }
}

class MapGenerator {
    static generateTestMap() : Map {
        let map: Map = new Map();

        // Sample map
        let ascii = [
            "############################################################",
            "#               #        #   #                             #",
            "#   p      e    #        #   #                             #",
            "#               #                                          #",
            "#      #        #            #                             #",
            "#      #        #            #                             #",
            "# #  # #        #        # e #       t         t           #",
            "# #    #        #        #   #                             #",
            "# #    #        #    ###### ##                             #",
            "#      #   t                 #                             #",
            "#      #                     #                             #",
            "#      ##########         ####                             #",
            "#      ##########     g      #                             #",
            "#                    ggg                                   #",
            "# e    ##########     g                                    #",
            "#      ##########            #                             #",
            "#      ###############       #                             #",
            "#                            #                             #",
            "#       #    #      #        #                             #",
            "#                            #                             #",
            "######### ########  e        #                             #",
            "######### ########           #                             #",
            "#  ggggg  ########      t    #                             #",
            "# ################          ##                             #",
            "# ##############           ###                             #",
            "# #############           ####                             #",
            "# gg  ########          ######                             #",
            "##### ########        ########                             #",
            "#  e                 #########                             #",
            "############################################################",
        ];

        map.width = ascii[0].length // Assumes we have no varying size (purely square/rectangle)
        map.height = ascii.length;

        for (let y = 0; y < ascii.length; y++) {
            for (let x = 0; x < ascii[y].length; x++) {
                let tile = ascii[y][x];
                let position = new Point(x, y);

                if (tile == 'p') {
                    map.actors.push(ActorInitializer.NewHero(position));
                }
                else if (tile == '#') {
                    map.actors.push(ActorInitializer.NewWall(position));
                }
                else if (tile == ' ') {
                    // floors are added regardless; do nothing, but don't throw an error
                }
                else if (tile == 'g') {
                    map.actors.push(ActorInitializer.NewGold(position));
                }
                else if (tile == 'e') {
                    map.actors.push(ActorInitializer.NewMonster(position));
                }
                else if (tile == 't') {
                    map.actors.push(ActorInitializer.NewTorch(position));
                }
                else {
                    alert('generateTestMap: Unknown tile -> actor type: ' + tile);
                    return;
                }

                map.actors.push(ActorInitializer.NewFloor(position));
            }
        }

        return map;
    }
}