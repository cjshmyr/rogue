class ActorInitializer {
    static NewHero(position: Point) : Actor {
        let a = new Actor('Hero', position);
        a.actorType = ActorType.Hero;
        a.collision.blocksMovement = true;

        a.combatant.hitpoints = 25;
        a.combatant.damage = 3;
        a.vision.visionRange = 10;
        a.vision.lightSourceRange = 10;

        return a;
    }

    static NewMonster(position: Point) : Actor {
        let a = new Actor('Monster', position);
        a.actorType = ActorType.Npc;
        a.collision.blocksMovement = true;

        a.combatant.hitpoints = 5;
        a.combatant.damage = 2;
        a.vision.visionRange = 10;
        a.vision.hiddenUnderFog = true;

        return a;
    }

    static NewWall(position: Point) : Actor {
        let a = new Actor('Wall', position);
        a.actorType = ActorType.Wall;
        a.collision.blocksMovement = true;

        a.vision.blocksVision = true;

        return a;
    }

    static NewDoor(position: Point) : Actor {
        let a = new Actor('Door', position);
        a.actorType = ActorType.Door;
        a.collision.blocksMovement = true;

        a.vision.blocksVision = true;

        return a;
    }

    static NewTorch(position: Point) : Actor {
        let a = new Actor('Torch', position);
        a.actorType = ActorType.Wall;
        a.collision.blocksMovement = true;

        a.vision.visionRange = 3; // TODO: Requiring this is bad.
        a.vision.lightSourceRange = 3;

        return a;
    }

    static NewFloor(position: Point) : Actor {
        let a = new Actor('Floor', position);
        a.actorType = ActorType.Floor;

        return a;
    }

    static NewGold(position: Point) : Actor {
        let a = new Actor('Gold', position);
        a.actorType = ActorType.Item;

        a.gold.amount = 5;

        return a;
    }

    static NewChest(position: Point) : Actor {
        let a = new Actor('Chest', position);
        a.actorType = ActorType.Chest;
        a.collision.blocksMovement = true;

        a.chestItem = new Item();

        return a;
    }
}