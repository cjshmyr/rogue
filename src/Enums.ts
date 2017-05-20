// TODO: A debug mode to change the HudColor.Background
enum CanvasColor {
    Background = 0x000000 // Black. (used to be 0x606060 - Grey)
}

enum HudColor {
    Black = 0x000000,
    White = 0xffffff,
    Grey = 0x808080,
    Red = 0xff0000,
    Orange = 0xffcc00,
    Green = 0x99ff33,
    Maroon = 0x800000
}

enum LightSourceTint {
    Visible1 = 0xffffff, // None/White
    Visible2 = 0xf2f2f2, // 95%
    Visible3 = 0xe6e6e6, // 90%
    Visible4 = 0xd9d9d9, // 85%
    Visible5 = 0xcccccc, // 80%
    Visible6 = 0xbfbfbf, // 75%
    Fog = 0x999999, // Grey (dimmed) - 60% darkness
    Shroud = 0x000000 // Black -- TODO: Just don't render (.visible) instead.
}

enum ActorType {
    Undefined,
    Hero,
    Npc,
    Floor,
    Wall,
    Item
}

enum KeyCode {
    LeftArrow = 37,
    UpArrow = 38,
    RightArrow = 39,
    DownArrow = 40
}