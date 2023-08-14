// TODO: A debug mode to change the HudColor.Background
export enum CanvasColor {
    Background = 0x000000 // Black. (used to be 0x606060 - Grey)
}

export enum HudColor {
    Black = 0x000000,
    White = 0xffffff,
    Grey = 0x808080,
    Red = 0xff0000,
    Orange = 0xffcc00,
    Green = 0x99ff33,
    Maroon = 0x800000
}

export enum LightSourceTint {
    Visible1 = 0xffffff, // None/White
    Visible2 = 0xf2f2f2, // 95%
    Visible3 = 0xe6e6e6, // 90%
    Visible4 = 0xd9d9d9, // 85%
    Visible5 = 0xcccccc, // 80%
    Visible6 = 0xbfbfbf, // 75%
    Fog = 0x999999, // Grey (dimmed) - 60% darkness
    Shroud = 0x000000 // Black -- TODO: Just don't render (.visible) instead.
}

export enum ActorType {
    UndefinedActorType,
    Hero,
    Npc,
    Floor,
    Wall,
    Door,
    Item,
    Chest
}

export enum HeroAction {
    Wait
}

export enum KeyCode {
    LeftArrow = 37,
    UpArrow = 38,
    RightArrow = 39,
    DownArrow = 40,
    Num0 = 48,
    Num1 = 49,
    Num2 = 50,
    Num3 = 51,
    Num4 = 52,
    Num5 = 53,
    Num6 = 54,
    Num7 = 55,
    Num8 = 56,
    Num9 = 57,
    a = 65,
    b = 66,
    c = 67,
    d = 68,
    e = 69,
    f = 70,
    g = 71,
    h = 72,
    i = 73,
    j = 74,
    k = 75,
    l = 76,
    m = 77,
    n = 78,
    o = 79,
    p = 80,
    q = 81,
    r = 82,
    s = 83,
    t = 84,
    u = 85,
    v = 86,
    w = 87,
    x = 88,
    y = 89,
    z = 90,
    NumPad0 = 96,
    NumPad1 = 97,
    NumPad2 = 98,
    NumPad3 = 99,
    NumPad4 = 100,
    NumPad5 = 101,
    NumPad6 = 102,
    NumPad7 = 103,
    NumPad8 = 104,
    NumPad9 = 105
}